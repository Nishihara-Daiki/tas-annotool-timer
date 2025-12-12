const listEl = document.getElementById("list");
const resetBtn = document.getElementById("resetBtn");

function format(sec) {
    const s = Math.floor(sec);
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${h}h ${m}m ${ss}s`;
}

function addRow(stem, time_string) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
        <span>${stem}</span>
        <span>${time_string}</span>
    `;
    listEl.appendChild(row);
}

async function updateView() {
    const { timeData, yellowTime } = await chrome.storage.local.get(["timeData", "yellowTime"]);
    const data = timeData || {};
    const yellow_ms = yellowTime || 0;

    listEl.innerHTML = "";

    let sum_ms = 0;
    Object.entries(data).forEach(([stem, ms]) => {
        addRow(stem, format(ms / 1000));
        sum_ms += ms;
    });
    addRow('<b>合計</b>', `<b>${format(sum_ms / 1000)}</b>`);
    if (yellow_ms > 0)
        addRow('黄色時間', `${Math.floor(yellow_ms / 1000)}s`);
}

// setInterval(updateView, 1 * 1000);
updateView();

resetBtn.onclick = async () => {
    if (confirm("本当にリセットしますか？")) {
        chrome.storage.local.set({ timeData: {} });
        updateView();
    }
};


chrome.storage.onChanged.addListener(() => {
    updateView();
});
