"use client";

import React from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Heart, Trash2, Repeat, MessageCircle, Share2 } from "lucide-react";

export interface Tweet {
    id: string;
    content: string;
    authorName: string;
    authorHandle: string;
    avatar: string;
    likes: string;
    retweets: string;
    media: string[]; // Array of image URLs
    threadParent?: string; // JSON string of parent tweet
    threadChild?: string; // JSON string of child tweet
    isRetweet?: boolean;
    createdAt?: string; // Optional, kept for compatibility
    status?: string; // Optional
}

interface SwipeCardProps {
    tweet: Tweet;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    index: number; // 0 = front, 1 = back, etc.
}

const SwipeCard: React.FC<SwipeCardProps> = ({ tweet, onSwipeLeft, onSwipeRight, index }) => {
    const isFront = index === 0;

    // Motion Values
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]); // Rotate as you drag
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]); // Fade out at extremes

    // Stamp Opacities
    const likeOpacity = useTransform(x, [20, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-20, -150], [0, 1]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            onSwipeRight();
        } else if (info.offset.x < -threshold) {
            onSwipeLeft();
        }
    };

    // Deck Logic Styles
    const cardStyle = {
        zIndex: 100 - index,
        scale: 1 - index * 0.05, // 1, 0.95, 0.90
        y: index * 15, // 0, 15, 30 (vertical offset)
        opacity: 1 - index * 0.2, // 1, 0.8, 0.6
    };

    // Parse Thread Data safely
    const parseThread = (json?: string) => {
        if (!json) return null;
        try {
            const data = JSON.parse(json);
            // Strict validation: Must have authorName to be valid
            if (!data.authorName || data.authorName === "Unknown") return null;
            return data;
        } catch (e) {
            return null;
        }
    };

    const parentTweet = parseThread(tweet.threadParent);
    const childTweet = parseThread(tweet.threadChild);

    return (
        <motion.div
            style={{
                x: isFront ? x : 0,
                rotate: isFront ? rotate : 0,
                ...cardStyle,
                touchAction: "none"
            }}
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragSnapToOrigin
            dragElastic={0.7} // Bouncy feel
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: cardStyle.scale, opacity: cardStyle.opacity, y: cardStyle.y }}
            exit={{ x: x.get() < 0 ? -500 : 500, opacity: 0, transition: { duration: 0.2 } }}
            className="absolute w-full max-w-md h-[75vh] flex flex-col bg-black border border-gray-800 rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
        >
            {/* Stamps */}
            {isFront && (
                <>
                    <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-10 z-50 border-4 border-green-500 rounded-lg p-2 transform -rotate-12 pointer-events-none">
                        <span className="text-green-500 font-bold text-4xl uppercase tracking-widest">KEEP</span>
                    </motion.div>
                    <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-10 z-50 border-4 border-red-500 rounded-lg p-2 transform rotate-12 pointer-events-none">
                        <span className="text-red-500 font-bold text-4xl uppercase tracking-widest">DELETE</span>
                    </motion.div>
                </>
            )}

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
                <div className="flex flex-col min-h-full p-4 space-y-0">

                    {/* Parent Tweet */}
                    {parentTweet && (
                        <div className="relative pb-6">
                            <TweetContent data={parentTweet} isMain={false} />
                            <div className="absolute left-8 bottom-0 top-12 w-0.5 bg-gray-700" />
                        </div>
                    )}

                    {/* Main Tweet */}
                    <div className="relative z-10 py-2">
                        <TweetContent data={tweet} isMain={true} isRetweet={tweet.isRetweet} />
                    </div>

                    {/* Child Tweet */}
                    {childTweet && (
                        <div className="relative pt-6">
                            <div className="absolute left-8 top-0 bottom-12 w-0.5 bg-gray-700" />
                            <TweetContent data={childTweet} isMain={false} />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Sub-component for rendering tweet content
const TweetContent = ({ data, isMain, isRetweet }: { data: any, isMain: boolean, isRetweet?: boolean }) => {
    // Parse media if it's a string
    let mediaUrls: string[] = [];
    try {
        if (typeof data.media === 'string' && data.media.startsWith('[')) {
            mediaUrls = JSON.parse(data.media);
        } else if (Array.isArray(data.media)) {
            mediaUrls = data.media;
        }
    } catch (e) {
        mediaUrls = [];
    }

    return (
        <div className={`flex flex-col gap-3 ${isMain ? '' : 'opacity-70'}`}>
            {/* Retweet Indicator */}
            {isRetweet && isMain && (
                <div className="flex items-center gap-2 text-green-500 text-sm font-bold uppercase tracking-wider mb-1">
                    <Repeat size={16} className="stroke-[3px]" />
                    <span>You Retweeted</span>
                </div>
            )}

            {/* Header */}
            <div className="flex gap-3">
                <img src={data.avatar || "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"}
                    alt={data.authorName}
                    className="w-12 h-12 rounded-full border border-gray-800 object-cover shrink-0"
                />
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className={`font-bold truncate ${isMain ? 'text-white text-[17px]' : 'text-gray-300 text-[15px]'}`}>
                            {data.authorName}
                        </span>
                        {/* Verified Badge (Mock) */}
                        <svg viewBox="0 0 22 22" className={`w-4 h-4 ${isMain ? 'text-blue-400' : 'text-gray-500'} fill-current`}>
                            <g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.687.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.215 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.293 2.136 2.137 5.429-5.429 1.293 1.293-6.722 6.722z"></path></g>
                        </svg>
                    </div>
                    <span className="text-gray-500 text-[15px] truncate">{data.authorHandle}</span>
                </div>
            </div>

            {/* Text Content */}
            <p className={`whitespace-pre-wrap leading-relaxed ${isMain ? 'text-[17px] text-white' : 'text-[15px] text-gray-300'}`}>
                {data.content}
            </p>

            {/* Media */}
            {mediaUrls.length > 0 && (
                <div className={`grid gap-1 rounded-2xl overflow-hidden border border-gray-800 mt-2 ${mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {mediaUrls.map((url, i) => (
                        <img key={i} src={url} alt="Media" className="w-full h-full object-cover max-h-64" />
                    ))}
                </div>
            )}

            {/* Metrics (Only for Main) */}
            {isMain && (
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-800 text-gray-500 text-sm">
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2 group cursor-pointer hover:text-blue-400 transition-colors">
                            <MessageCircle size={18} />
                            <span>{Math.floor(Math.random() * 50)}</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-pointer hover:text-green-400 transition-colors">
                            <Repeat size={18} className={isRetweet ? "text-green-500" : ""} />
                            <span className={isRetweet ? "text-green-500" : ""}>{data.retweets}</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-pointer hover:text-pink-500 transition-colors">
                            <Heart size={18} />
                            <span>{data.likes}</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-pointer hover:text-blue-400 transition-colors">
                            <Share2 size={18} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SwipeCard;
