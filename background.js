const WORK_INTERVAL = 1 * 1000;
const YELLOW_THRESHOLD = 5 * 1000;
const RED_THRESHOLD = 65 * 1000;

let lastCheck = Date.now();

chrome.alarms.create("timer", { periodInMinutes: WORK_INTERVAL / 60000 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name != "timer") return;
    const now = Date.now();
    const data = await chrome.storage.local.get([
        "lastActivity",
        "currentStem",
        "timeData",
        "yellowTime"
    ]);

    const lastActivity = data.lastActivity || 0;
    const currentStem = data.currentStem || "others";
    const timeData = data.timeData || {};
    let yellowTime = data.yellowTime || 0;

    // --- 状態判定 ---
    const inactive = now - lastActivity;

    let state = "green";
    if (inactive >= RED_THRESHOLD) state = "red";
    else if (inactive >= YELLOW_THRESHOLD) state = "yellow";

    // --- バッジ色 ---
    const badgeColor =
        state === "green" ? "#00AA00" :
        state === "yellow" ? "#CCCC00" :
        "#AA0000";

    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    chrome.action.setBadgeText({ text: "●" });

    // --- 時間加算ルール ---
    // green → 加算
    // yellow → 仮置きのyellowTimeに加算
    // red → 加算しない
    if (state === "green") {
        timeData[currentStem] = (timeData[currentStem] || 0) + (now - lastCheck) + yellowTime;
        yellowTime = 0;
    }
    else if (state === "yellow") {
        yellowTime += now - lastCheck;
    }
    else {
        yellowTime = 0;
    }

    lastCheck = now;

    chrome.storage.local.set({ timeData, yellowTime });
});
