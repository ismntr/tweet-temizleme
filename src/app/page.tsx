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
        <main className="flex h-dvh flex-col bg-black overflow-hidden fixed inset-0 supports-[height:100dvh]:h-dvh">
            {/* Header */}
            <div className="flex-none h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md z-50">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} shadow-[0_0_8px_rgba(34,197,94,0.5)]`} />
                    <span className="text-white font-bold tracking-wide">Tweet-Temizleme</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs font-mono bg-gray-800 px-2 py-1 rounded-md">
                        {tweets.length} Cards
                    </span>
                    {tweets.length > 0 && (
                        <button
                            onClick={() => setTweets([])}
                            className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Card Stack Container */}
            <div className="flex-1 relative w-full max-w-md mx-auto flex flex-col justify-center items-center p-4">
                <div className="relative w-full h-full max-h-[700px]">
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
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-50">
                                <div className="w-20 h-20 bg-gray-800 rounded-full mb-6 flex items-center justify-center animate-pulse">
                                    <span className="text-4xl">🔍</span>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">No Tweets Found</h2>
                                <p className="text-gray-500 text-sm max-w-[200px]">
                                    Start the extension on your PC to sync tweets.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex-none h-24 pb-6 flex items-center justify-center gap-8 z-50">
                <button
                    onClick={() => handleSwipe("left")}
                    className="group relative w-16 h-16 flex items-center justify-center active:scale-95 transition-transform"
                    disabled={tweets.length === 0}
                >
                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/30 transition-colors opacity-0 group-hover:opacity-100" />
                    <div className="relative w-14 h-14 bg-gray-900 border border-red-500/50 rounded-full flex items-center justify-center shadow-lg group-hover:border-red-500 transition-colors">
                        <X size={28} className="text-red-500" />
                    </div>
                </button>

                <button
                    onClick={() => handleSwipe("right")}
                    className="group relative w-16 h-16 flex items-center justify-center active:scale-95 transition-transform"
                    disabled={tweets.length === 0}
                >
                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-colors opacity-0 group-hover:opacity-100" />
                    <div className="relative w-14 h-14 bg-gray-900 border border-green-500/50 rounded-full flex items-center justify-center shadow-lg group-hover:border-green-500 transition-colors">
                        <Check size={28} className="text-green-500" />
                    </div>
                </button>
            </div>
        </main>
    );
}
