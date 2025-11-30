// Shim for Socket.io in Service Worker
if (typeof window === 'undefined') {
    self.window = self;
}

importScripts('socket.io.js');

const socket = io("http://localhost:3000", {
    transports: ["websocket"],
    reconnection: true,
    forceNew: true
});

socket.on("connect", () => {
    console.log("Background Service Worker Connected to Server");
    socket.emit("REGISTER_CLIENT", "EXTENSION");
});

socket.on("connect_error", (err) => {
    console.error("Socket Connection Error:", err.message);
});

socket.on("disconnect", (reason) => {
    console.log("Socket Disconnected:", reason);
});

socket.on("CMD_DELETE", (tweetId) => {
    console.log("Received DELETE command in background:", tweetId);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "CMD_DELETE", tweetId });
        }
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SCRAPED_TWEETS") {
        console.log("Forwarding tweets to server:", message.tweets.length);
        if (socket.connected) {
            socket.emit("SCRAPED_TWEETS", message.tweets);
            sendResponse({ success: true });
        } else {
            console.error("Socket not connected, cannot send tweets");
            // Try to reconnect
            socket.connect();
            sendResponse({ success: false, error: "Socket disconnected" });
        }
    } else if (message.type === "CMD_START" || message.type === "CMD_STOP") {
        console.log("Forwarding command to content script:", message.type);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: message.type });
            }
        });
        sendResponse({ success: true });
    }
    return true; // Keep channel open for async response if needed
});
