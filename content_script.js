let lastActivity = Date.now();

function extractStem(src) {
    if (!src) return "others";
    try {
        const url = new URL(src);
        const file = url.pathname.split("/").pop();
        const stem = file.split(".")[0];
        return decodeURIComponent(stem) || "others";
    } catch (e) {
        return "others";
    }
}

function getCurrentStem() {
    const video = document.querySelector("#root > div > main > div > div.video-section > div > div > video");
    const stem = extractStem(video?.src || "");
    return stem;
}

document.addEventListener("mousemove", () => lastActivity = Date.now());
document.addEventListener("click", () => lastActivity = Date.now());
document.addEventListener("keydown", () => lastActivity = Date.now());

setInterval(() => {
    const currentStem = getCurrentStem();
    chrome.storage.local.set({ lastActivity, currentStem });
}, 1000);


chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(
            `Storage key "${key}" in ${namespace} changed:`,
            `Old value:`, oldValue,
            `New value:`, newValue
        );
    }
});