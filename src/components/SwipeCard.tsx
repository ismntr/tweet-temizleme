"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion";
import { Heart, Repeat, MessageCircle, Share2, Check, X, Play, Volume2, VolumeX } from "lucide-react";

export interface Tweet {
    id: string;
    content: string;
    authorName: string;
    authorHandle: string;
    avatar: string;
    likes: string;
    retweets: string;
    media: string[]; // Array of image/video URLs
    isRetweet?: boolean;
    createdAt?: string;
    replyCount?: string;
    cardTitle?: string;
    cardDescription?: string;
    cardDomain?: string;
    cardImage?: string;
}

interface SwipeCardProps {
    tweet: Tweet;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    index: number;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ tweet, onSwipeLeft, onSwipeRight, index }) => {
    const isFront = index === 0;

    // Motion Values
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Overlay Opacities
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            onSwipeRight();
        } else if (info.offset.x < -threshold) {
            onSwipeLeft();
        }
    };

    // Card Stack Style
    const cardStyle = {
        zIndex: 50 - index,
        scale: 1 - index * 0.05,
        y: index * 10,
        opacity: index > 2 ? 0 : 1, // Hide cards deeper in stack
    };

    // Parse Media
    let mediaUrls: string[] = [];
    try {
        if (typeof tweet.media === 'string') {
            const parsed = JSON.parse(tweet.media);
            mediaUrls = Array.isArray(parsed) ? parsed : [];
        } else if (Array.isArray(tweet.media)) {
            mediaUrls = tweet.media;
        }
    } catch (e) {
        mediaUrls = [];
    }

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
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: cardStyle.scale, y: cardStyle.y, opacity: cardStyle.opacity }}
            exit={{ x: x.get() < 0 ? -500 : 500, opacity: 0, transition: { duration: 0.2 } }}
            className="absolute w-full h-full bg-black border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
            {/* Overlays */}
            {isFront && (
                <>
                    <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 z-50 border-4 border-green-500 rounded-xl p-2 transform -rotate-12 pointer-events-none bg-black/20 backdrop-blur-sm">
                        <Check size={48} className="text-green-500 stroke-[3px]" />
                    </motion.div>
                    <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 z-50 border-4 border-red-500 rounded-xl p-2 transform rotate-12 pointer-events-none bg-black/20 backdrop-blur-sm">
                        <X size={48} className="text-red-500 stroke-[3px]" />
                    </motion.div>
                </>
            )}

            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <img
                        src={tweet.avatar || "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"}
                        alt={tweet.authorName}
                        className="w-12 h-12 rounded-full border-2 border-gray-700 object-cover"
                    />
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-white text-lg truncate">{tweet.authorName}</span>
                            {/* Verified Badge */}
                            <svg viewBox="0 0 22 22" className="w-5 h-5 text-blue-400 fill-current shrink-0">
                                <g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.687.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.215 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.293 2.136 2.137 5.429-5.429 1.293 1.293-6.722 6.722z"></path></g>
                            </svg>
                        </div>
                        <span className="text-gray-400 text-sm truncate">{tweet.authorHandle}</span>
                    </div>
                    {tweet.isRetweet && (
                        <div className="ml-auto flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded-full text-xs font-bold">
                            <Repeat size={12} />
                            <span>RT</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-black relative">
                <div className="p-5 flex flex-col gap-4">
                    {/* Text */}
                    <p className="text-white text-xl leading-relaxed whitespace-pre-wrap font-medium">
                        {tweet.content}
                    </p>

                    {/* Media */}
                    {mediaUrls.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2">
                            {mediaUrls.map((url, i) => (
                                <MediaItem key={i} url={url} />
                            ))}
                        </div>
                    )}

                    {/* Link Card */}
                    {tweet.cardTitle && (
                        <div className="mt-2 rounded-2xl border border-gray-800 overflow-hidden bg-gray-900/50">
                            {tweet.cardImage && (
                                <img src={tweet.cardImage} alt="Card" className="w-full h-40 object-cover" />
                            )}
                            <div className="p-3">
                                <div className="text-gray-500 text-xs mb-1 uppercase tracking-wide">{tweet.cardDomain}</div>
                                <div className="text-white font-bold leading-tight mb-1">{tweet.cardTitle}</div>
                                {tweet.cardDescription && (
                                    <div className="text-gray-400 text-sm line-clamp-2">{tweet.cardDescription}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-md shrink-0">
                <div className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-2 text-gray-400">
                        <MessageCircle size={20} />
                        <span className="text-sm font-medium">{tweet.replyCount || 0}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${tweet.isRetweet ? 'text-green-500' : 'text-gray-400'}`}>
                        <Repeat size={20} />
                        <span className="text-sm font-medium">{tweet.retweets}</span>
                    </div>
                    <div className="flex items-center gap-2 text-pink-500">
                        <Heart size={20} fill="currentColor" />
                        <span className="text-sm font-medium">{tweet.likes}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                        <Share2 size={20} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Helper for Media (Image/Video)
const MediaItem = ({ url }: { url: string }) => {
    const isVideo = url.includes('.mp4') || url.includes('video'); // Simple check, might need robust logic
    const [muted, setMuted] = useState(true);

    if (isVideo) {
        return (
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video">
                <video
                    src={url}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted={muted}
                    playsInline
                />
                <button
                    onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                    className="absolute bottom-3 right-3 p-2 bg-black/50 rounded-full text-white backdrop-blur-sm"
                >
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
            </div>
        );
    }

    return (
        <img
            src={url}
            alt="Tweet Media"
            className="w-full rounded-2xl border border-gray-800 object-cover"
            loading="lazy"
        />
    );
};

export default SwipeCard;
