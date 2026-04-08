import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500); // Allow exit animation to play
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Ripple Background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-1 h-1 bg-blue-500/20 rounded-full animate-ripple" />
                        <div className="w-1 h-1 bg-blue-500/10 rounded-full animate-ripple [animation-delay:1s]" />
                        <div className="w-1 h-1 bg-blue-400/5 rounded-full animate-ripple [animation-delay:2s]" />
                    </div>

                    <div className="relative flex flex-col items-center">
                        {/* Logo Container */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                                duration: 1, 
                                ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for premium feel
                                delay: 0.2 
                            }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-blue-500/40 blur-3xl rounded-full scale-150 animate-pulse" />
                            <div className="relative p-8 bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-[40px] shadow-2xl shadow-blue-500/20">
                                <Droplet size={80} className="text-blue-400 fill-blue-400/20" />
                            </div>
                        </motion.div>

                        {/* Text */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="mt-12 text-center"
                        >
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                                Aqua<span className="text-blue-400">Smart</span>
                            </h1>
                            <div className="mt-4 flex items-center gap-2 justify-center">
                                <div className="h-px w-8 bg-blue-500/30" />
                                <p className="text-blue-400/60 font-medium tracking-[0.3em] uppercase text-xs">
                                    Pure Intelligence
                                </p>
                                <div className="h-px w-8 bg-blue-500/30" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Loading Indicator */}
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "200px" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="absolute bottom-20 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
