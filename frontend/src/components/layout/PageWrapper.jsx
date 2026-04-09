import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../Navbar';

const PageWrapper = ({ children, title, subtitle, loading = false, actions }) => {
    return (
        <div className="flex bg-slate-950 min-h-screen text-white">
            <Navbar />
            
            <main className="flex-1 ml-0 sm:ml-20 md:ml-64 p-4 md:p-8 pb-28 sm:pb-8 space-y-8 overflow-x-hidden">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                    <motion.div
                        initial={{ opacity: 0, x: -15, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold tracking-tight text-gradient">{title}</h1>
                            {title === 'Control Center' && (
                                <div className="live-indicator ml-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                                </div>
                            )}
                        </div>
                        <p className="text-gray-400 text-sm font-medium">{subtitle}</p>
                    </motion.div>
                    {actions && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {actions}
                        </motion.div>
                    )}
                </header>

                <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="space-y-8"
                >
                    {loading ? (
                        <div className="space-y-8 animate-pulse">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(n => <div key={n} className="skeleton h-28 rounded-2xl"></div>)}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="skeleton h-80 rounded-2xl"></div>
                                <div className="skeleton h-80 rounded-2xl"></div>
                            </div>
                        </div>
                    ) : children}
                </motion.div>
            </main>
        </div>
    );
};

export default PageWrapper;
