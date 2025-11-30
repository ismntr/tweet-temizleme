"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import SwipeCard, { Tweet } from "@/components/SwipeCard";
import { Check, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";


export default function Home() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to the server
        // In dev, we might be on port 3000.
        const socketInstance = io();

        socketInstance.on("connect", () => {
            console.log("Mobile connected");
            setIsConnected(true);
            socketInstance.emit("REGISTER_CLIENT", "MOBILE");
        });

        socketInstance.on("disconnect", () => {
            setIsConnected(false);
        });

        socketInstance.on("NEW_TWEETS", (newTweets: Tweet[]) => {
            console.log("Received tweets:", newTweets);
            setTweets((prev) => {
                const existingIds = new Set(prev.map(t => t.id));
                const uniqueNew = newTweets.filter(t => !existingIds.has(t.id));
                return [...prev, ...uniqueNew];
            });
        });

        socketInstance.on("RESET_UI", () => {
            console.log("Resetting UI...");
            setTweets([]);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const handleSwipe = (direction: "left" | "right") => {
        if (tweets.length === 0) return;

        const currentTweet = tweets[0];

        if (direction === "left") {
            // Delete
            socket?.emit("ACTION_DELETE", currentTweet.id);
        } else {
            // Keep
            socket?.emit("ACTION_KEEP", currentTweet.id);
        }

        // Remove from local state
        setTweets((prev) => prev.slice(1));
    };

    return (
        <main className="flex h-dvh flex-col items-center bg-gray-900 overflow-hidden fixed inset-0 supports-[height:100dvh]:h-dvh">
            {/* Header / Status */}
            <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                <div className="flex flex-col gap-1 pointer-events-auto">
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="text-white/80 text-xs font-mono">{isConnected ? "Connected" : "Disconnected"}</span>
                    </div>
                    <div className="text-gray-400 text-xs font-mono">Queue: {tweets.length}</div>
                </div>

                {tweets.length > 0 && (
                    <button
                        onClick={() => setTweets([])}
                        className="pointer-events-auto text-xs bg-gray-800/80 text-white px-3 py-1.5 rounded-full border border-gray-700 hover:bg-gray-700 backdrop-blur-sm"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Card Container - Adjusted height to leave room for buttons */}
            <div className="relative w-full max-w-md flex-1 flex items-center justify-center pb-24">
                <AnimatePresence>
                    {tweets.length > 0 ? (
                        tweets.slice(0, 3).map((tweet, index) => (
                            <SwipeCard
                                key={tweet.id}
                                tweet={tweet}
                                onSwipeLeft={() => handleSwipe("left")}
                                onSwipeRight={() => handleSwipe("right")}
                                index={index}
                            />
                        )).reverse()
                    ) : (
                        <div className="text-white text-center p-8 flex flex-col items-center opacity-60">
                            <div className="w-24 h-24 bg-gray-800/50 rounded-full mb-6 flex items-center justify-center animate-pulse">
                                <span className="text-5xl">📱</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Ready to Sync</h2>
                            <p className="text-gray-400 max-w-xs">
                                Open the extension on your computer to start loading tweets.
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Controls - Fixed height and position */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-center gap-12 z-50 pb-6 pointer-events-auto">
                <button
                    onClick={() => handleSwipe("left")}
                    className="group relative w-16 h-16 flex items-center justify-center active:scale-95 transition-transform"
                    disabled={tweets.length === 0}
                >
                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/30 transition-colors" />
                    <div className="relative w-14 h-14 bg-gray-900 border border-red-500/50 rounded-full flex items-center justify-center shadow-lg">
                        <X size={28} className="text-red-500" />
                    </div>
                </button>

                <button
                    onClick={() => handleSwipe("right")}
                    className="group relative w-16 h-16 flex items-center justify-center active:scale-95 transition-transform"
                    disabled={tweets.length === 0}
                >
                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-colors" />
                    <div className="relative w-14 h-14 bg-gray-900 border border-green-500/50 rounded-full flex items-center justify-center shadow-lg">
                        <Check size={28} className="text-green-500" />
                    </div>
                </button>
            </div>
        </main>
    );
}
