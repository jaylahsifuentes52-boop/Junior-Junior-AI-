```javascript
const $ = id => document.getElementById(id);

function showTool(tool) {
    $("workspace").classList.remove("hidden");
    $("fixTool").classList.toggle("hidden", tool !== "fix");
    $("apkTool").classList.toggle("hidden", tool !== "apk");

    $("toolTitle").textContent =
        tool === "fix" ? "🛠️ Fix Code" : "📱 Build APK";

    $("workspace").scrollIntoView({ behavior: "smooth" });
}

async function askJuniorAI(message) {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "AI request failed.");
    }

    return data.reply;
}

async function fixCode() {
    const code = $("code").value.trim();
    const error = $("error").value.trim();

    if (!code) {
        alert("Please paste your code first!");
        return;
    }

    $("fixedResult").classList.remove("hidden");
    $("fixedCode").textContent = "Junior AI is checking your code...";

    try {
        const answer = await askJuniorAI(
            "Fix the following code. Return the complete corrected code first, then explain the changes. Do not claim you ran or tested it unless you did.\n\n" +
            "Problem: " + (error || "Find and fix any apparent bugs.") +
            "\n\nCode:\n" + code
        );

        $("fixedCode").textContent = answer;
    } catch (err) {
        $("fixedCode").textContent =
            "AI connection error: " + err.message +
            "\n\nMake sure the server is running and its OPENAI_API_KEY is configured.";
    }
}

function copyCode() {
    navigator.clipboard.writeText($("fixedCode").textContent)
        .then(() => alert("Copied!"))
        .catch(() => alert("Select the result and copy it manually."));
}

function buildAPK() {
    const type = $("projectType").value;
    const result = $("apkResult");

    const guides = {
        android:
            "1. Open your Android project in Android Studio.\n" +
            "2. Wait for Gradle sync to finish.\n" +
            "3. Select Build → Build Bundle(s) / APK(s) → Build APK(s).\n" +
            "4. When the build finishes, click Locate to find the APK.\n" +
            "5. For a release APK, use Generate Signed Bundle / APK.",

        website:
            "A website cannot become a native APK just by renaming its files.\n\n" +
            "You can package the website inside an Android app using a WebView or a suitable web-to-app framework. You still need Android build tools to compile it.",

        apk:
            "An APK is already a compiled Android app. You usually cannot recover the original editable project from it. Find the original source code if you want to modify and rebuild the app.",

        unknown:
            "Tell Junior AI which files you have, such as index.html, package.json, build.gradle, or settings.gradle, so it can guide you through the correct build process."
    };

    result.textContent = guides[type];
    result.classList.remove("hidden");
}

$("chatForm").addEventListener("submit", async event => {
    event.preventDefault();

    const input = $("question");
    const message = input.value.trim();

    if (!message) return;

    addBubble(message, "user");
    input.value = "";

    const waiting = addBubble("Thinking...", "bot");

    try {
        const reply = await askJuniorAI(message);
        waiting.textContent = reply;
    } catch (err) {
        waiting.textContent =
            "I couldn't connect to the AI server. " +
            "Make sure the server is running and OPENAI_API_KEY is configured. " +
            "Details: " + err.message;
    }
});

function addBubble(text, type) {
    const bubble = document.createElement("div");
    bubble.className = "bubble " + type;
    bubble.textContent = text;

    $("messages").appendChild(bubble);
    $("messages").scrollTop = $("messages").scrollHeight;

    return bubble;
}
```
