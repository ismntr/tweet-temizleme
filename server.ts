import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        // Identify client type
        socket.on("REGISTER_CLIENT", async (type: "EXTENSION" | "MOBILE") => {
            console.log(`Client registered as: ${type}`);
            socket.join(type);

            if (type === "EXTENSION") {
                // Send LAN IP to extension for QR code
                const { networkInterfaces } = require('os');
                const nets = networkInterfaces();
                let lanIp = "localhost";

                // Prioritize en0 (Wi-Fi on Mac) if possible, otherwise take first non-internal IPv4
                let found = false;
                for (const name of Object.keys(nets)) {
                    for (const net of nets[name]) {
                        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                        if (net.family === 'IPv4' && !net.internal) {
                            lanIp = net.address;
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
                console.log("Detected LAN IP:", lanIp);
                socket.emit("SERVER_IP", lanIp);
            }

            if (type === "MOBILE") {
                // Send existing pending tweets
                try {
                    const pendingTweets = await prisma.tweet.findMany({
                        where: { status: "PENDING" },
                        orderBy: { createdAt: "desc" }
                    });
                    if (pendingTweets.length > 0) {
                        socket.emit("NEW_TWEETS", pendingTweets);
                    }
                } catch (e) {
                    console.error("Error fetching pending tweets:", e);
                }
            }
        });

        // Handle scraped tweets from Extension
        socket.on("SCRAPED_TWEETS", async (tweets: any[]) => {
            console.log(`Received ${tweets.length} tweets from extension`);

            const newTweets = [];

            for (const t of tweets) {
                try {
                    // Check if exists
                    const exists = await prisma.tweet.findUnique({ where: { id: t.id } });

                    if (!exists) {
                        // Create new
                        await prisma.tweet.create({
                            data: {
                                id: t.id,
                                content: t.content,
                                createdAt: new Date(t.createdAt),
                                status: "PENDING",
                                authorName: t.authorName,
                                authorHandle: t.authorHandle,
                                avatar: t.avatar,
                                likes: t.likes,
                                retweets: t.retweets,
                                threadParent: t.threadParent,
                                threadChild: t.threadChild,
                                media: t.media ? JSON.stringify(t.media) : null,
                                isRetweet: t.isRetweet || false
                            }
                        });
                        newTweets.push(t);
                    } else if (exists.status === "PENDING") {
                        // If pending, re-send to mobile
                        newTweets.push(t);
                    }
                } catch (e) {
                    console.error("Error processing tweet:", e);
                }
            }

            if (newTweets.length > 0) {
                io.to("MOBILE").emit("NEW_TWEETS", newTweets);
            }
        });

        // Handle actions from Mobile
        socket.on("ACTION_DELETE", async (tweetId) => {
            console.log(`Mobile requested DELETE for: ${tweetId}`);

            try {
                await prisma.tweet.update({
                    where: { id: tweetId },
                    data: { status: "DELETED" }
                });
                // Forward to extension
                io.to("EXTENSION").emit("CMD_DELETE", tweetId);
            } catch (e) {
                console.error("Error updating tweet status:", e);
            }
        });

        socket.on("ACTION_KEEP", async (tweetId) => {
            console.log(`Mobile requested KEEP for: ${tweetId}`);
            try {
                await prisma.tweet.update({
                    where: { id: tweetId },
                    data: { status: "KEPT" }
                });
            } catch (e) {
                console.error("Error updating tweet status:", e);
            }
        });

        // Handle Reset / Clear Cache
        socket.on("CMD_RESET", async () => {
            console.log("Received CMD_RESET. Clearing pending tweets...");
            try {
                await prisma.tweet.deleteMany({
                    where: { status: "PENDING" }
                });
                console.log("Pending tweets cleared.");
                // Notify mobile to clear UI
                io.to("MOBILE").emit("RESET_UI");
            } catch (e) {
                console.error("Error clearing cache:", e);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
