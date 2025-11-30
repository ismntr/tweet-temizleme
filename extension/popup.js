const socket = io("http://localhost:3000", {
    transports: ["websocket"],
    reconnection: true
});

const statusDiv = document.getElementById("status");
const debugDiv = document.getElementById("debug");

function updateStatus(msg, color) {
    statusDiv.innerText = msg;
    statusDiv.style.color = color;
}

function addDebug(msg) {
    const p = document.createElement("div");
    p.innerText = `${new Date().toLocaleTimeString()} - ${msg}`;
    p.style.fontSize = "10px";
    debugDiv.appendChild(p);
}

socket.on("connect", () => {
    updateStatus("Connected", "green");
    addDebug("Socket connected: " + socket.id);
    socket.emit("REGISTER_CLIENT", "EXTENSION");
});

socket.on("SERVER_IP", (ip) => {
    addDebug("Received Server IP: " + ip);
    const url = `http://${ip}:3000/?mobile=1`;

    const container = document.getElementById("qr-container");
    if (container) {
        container.innerHTML = `
            <canvas id="qr-code"></canvas>
            <div style="margin-top: 5px; font-size: 10px; color: #666;">Scan to open on Mobile</div>
            <div style="font-size: 12px; font-weight: bold; color: #d32f2f; margin-top: 2px;">${url}</div>
        `;

        new QRious({
            element: document.getElementById('qr-code'),
            value: url,
            size: 150
        });
    }
});

socket.on("connect_error", (err) => {
    updateStatus("Connection Error", "red");
    addDebug("Error: " + err.message);
});

socket.on("disconnect", () => {
    updateStatus("Disconnected", "red");
    addDebug("Socket disconnected");
});

// Check background script status
chrome.runtime.sendMessage({ type: "PING" }, (response) => {
    if (chrome.runtime.lastError) {
        addDebug("Background Script: Not Reachable (" + chrome.runtime.lastError.message + ")");
    } else {
        addDebug("Background Script: Reachable");
    }
});

// Controls
document.getElementById("btn-start").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "CMD_START" });
    updateStatus("Status: Running", "green");
    addDebug("Sent CMD_START");
});

document.getElementById("btn-stop").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "CMD_STOP" });
    updateStatus("Status: Stopped", "red");
    addDebug("Sent CMD_STOP");
});

document.getElementById("btn-reset").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the cache? This will remove all pending tweets.")) {
        socket.emit("CMD_RESET");
        addDebug("Sent CMD_RESET to Server");
    }
});
