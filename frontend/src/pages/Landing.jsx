import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Droplet, 
    Zap, 
    Shield, 
    BarChart3, 
    Smartphone, 
    Globe, 
    ArrowRight, 
    CheckCircle2,
    Activity,
    BrainCircuit,
    ChevronDown
} from 'lucide-react';
import AuthModal from '../components/AuthModal';

const Landing = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [isHovered, setIsHovered] = useState(false);

    const openLogin = () => {
        setAuthMode('login');
        setIsAuthModalOpen(true);
    };

    const openSignup = () => {
        setAuthMode('signup');
        setIsAuthModalOpen(true);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Droplet className="text-blue-400" size={24} />
                        </div>
                        <span className="text-xl font-bold tracking-tighter">AquaSmart</span>
                    </button>
                    
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">Methodology</a>
                        <a href="#ai" className="hover:text-white transition-colors">Intelligence</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={openLogin}
                            className="text-sm font-semibold hover:text-blue-400 transition-colors px-4 py-2"
                        >
                            Log in
                        </button>
                        <button 
                            onClick={openSignup}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                        >
                            Sign up free
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-mesh">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-float" />
                    <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-float [animation-delay:2s]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="max-w-4xl"
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                                <Zap size={14} />
                                <span>V2.0 is now live</span>
                            </motion.div>

                            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-8">
                                Smart Water <br />
                                <span className="text-gradient">Management</span>
                            </motion.h1>

                            <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed mb-10">
                                The intelligent operating system for sustainable water consumption. 
                                Track, analyze, and optimize your usage with AI-driven insights and 
                                real-time monitoring.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={openSignup}
                                    className="group bg-white text-slate-950 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Get Started
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <a 
                                    href="#features"
                                    className="px-8 py-4 rounded-2xl font-bold border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center"
                                >
                                    Learn More
                                </a>
                            </motion.div>
                        </motion.div>

                        {/* The AquaMesh: Ultimate Hero Visual Experience */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="hidden lg:flex relative items-center justify-center w-full min-h-[600px]"
                            style={{ willChange: "transform, opacity" }}
                        >
                            {/* Deep Background Aura */}
                            <div className="absolute inset-0 bg-blue-600/5 blur-[150px] rounded-full animate-pulse" />
                            <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full animate-pulse [animation-delay:2s]" />

                            {/* Core Drop Assembly */}
                            <div className="relative z-20 flex items-center justify-center">
                                {/* Core Pulsing Glow */}
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    style={{ willChange: "transform, opacity" }}
                                    className="absolute w-40 h-40 bg-blue-500/20 blur-[30px] rounded-full" 
                                />
                                
                                {/* Inner Glass Core */}
                                <div className="relative w-32 h-32 rounded-full border border-white/20 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] shadow-inner group">
                                    <Droplet size={64} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10" />
                                    {/* Liquid Fill Effect */}
                                    <motion.div 
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute bottom-0 w-full height-[50%] bg-blue-500/30 rounded-b-full blur-[8px]"
                                    />
                                </div>
                            </div>

                            {/* Orbital Ring 1: The Fast Data Stream */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                style={{ willChange: "transform" }}
                                className="absolute w-[280px] h-[280px] rounded-full border border-blue-500/20 flex items-center justify-center"
                            >
                                <svg className="absolute w-full h-full overflow-visible">
                                    <circle cx="140" cy="140" r="140" fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="2" strokeDasharray="10 30" />
                                </svg>
                                {/* Orbiting Data Point */}
                                <div className="absolute top-0 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,1)]" style={{ transform: 'translateY(-50%)' }} />
                            </motion.div>

                            {/* Orbital Ring 2: The Outer AI Network */}
                            <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                style={{ willChange: "transform" }}
                                className="absolute w-[420px] h-[420px] rounded-full border border-indigo-500/10 flex items-center justify-center"
                            >
                                <svg className="absolute w-full h-full overflow-visible">
                                    <circle cx="210" cy="210" r="210" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1" strokeDasharray="50 150" />
                                </svg>
                                {/* Orbiting Data Point 2 */}
                                <div className="absolute bottom-0 w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,1)]" style={{ transform: 'translateY(50%)' }} />
                                {/* Orbiting Data Point 3 */}
                                <div className="absolute left-0 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,1)]" style={{ transform: 'translateX(-50%)' }} />
                            </motion.div>

                            {/* Floating Satellite Nodes */}
                            
                            {/* Satellite 1: Telemetry */}
                            <motion.div 
                                animate={{ y: [0, -15, 0], opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                style={{ willChange: "transform, opacity" }}
                                className="absolute top-[10%] left-[10%] z-30 flex flex-col items-center gap-3"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                                    <Activity className="text-cyan-400" size={28} />
                                </div>
                                <div className="px-3 py-1 bg-slate-900/80 rounded-full border border-white/5 text-[9px] font-black tracking-widest text-cyan-400/80 uppercase">Telemetry</div>
                            </motion.div>

                            {/* Satellite 2: Neural Net (AquaMind) */}
                            <motion.div 
                                animate={{ y: [0, 20, 0], opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                style={{ willChange: "transform, opacity" }}
                                className="absolute bottom-[15%] right-[10%] z-30 flex flex-col items-center gap-3"
                            >
                                <div className="w-20 h-20 rounded-full bg-slate-900/80 backdrop-blur-xl border border-green-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.2)]">
                                    <BrainCircuit className="text-green-400" size={36} />
                                </div>
                                <div className="px-3 py-1 bg-slate-900/80 rounded-full border border-white/5 text-[9px] font-black tracking-widest text-green-400/80 uppercase">Neural Net</div>
                            </motion.div>

                            {/* Satellite 3: Analytics */}
                            <motion.div 
                                animate={{ y: [0, -20, 0], opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                style={{ willChange: "transform, opacity" }}
                                className="absolute top-[20%] right-[5%] z-30 flex flex-col items-center gap-3"
                            >
                                <div className="w-14 h-14 rounded-xl rotate-12 bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                    <div className="-rotate-12"><BarChart3 className="text-purple-400" size={24} /></div>
                                </div>
                                <div className="px-3 py-1 bg-slate-900/80 rounded-full border border-white/5 text-[9px] font-black tracking-widest text-purple-400/80 uppercase">Analytics</div>
                            </motion.div>

                            {/* Connection Beams (Glowing lines linking nodes to core) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-60">
                                {/* Telemetry to Core */}
                                <motion.path
                                    d="M 120 150 Q 250 150 250 300"
                                    stroke="url(#cyanGrad)"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray="5 15"
                                    animate={{ strokeDashoffset: [-20, 0] }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                {/* Neural Net to Core */}
                                <motion.path
                                    d="M 380 450 Q 250 450 250 300"
                                    stroke="url(#greenGrad)"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray="5 15"
                                    animate={{ strokeDashoffset: [20, 0] }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <defs>
                                    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                    <linearGradient id="greenGrad" x1="100%" y1="100%" x2="0%" y2="0%">
                                        <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </motion.div>
                    </div>
                </div>
                
                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 flex flex-col items-center gap-2 font-bold text-[10px] uppercase tracking-[0.3em]"
                >
                    <span>Scroll to explore</span>
                    <motion.div 
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <ChevronDown size={14} />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 bg-slate-950 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Harness the power of <span className="text-blue-400">precision</span></h2>
                        <p className="text-gray-400 text-lg">Everything you need to master your water usage in one seamless dashboard.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Activity className="text-blue-400" />,
                                title: "Real-time Analytics",
                                desc: "Monitor your consumption patterns as they happen with high-fidelity charts and live telemetry."
                            },
                            {
                                icon: <Shield className="text-blue-400" />,
                                title: "Instant Alerts",
                                desc: "Receive automated notifications if we detect leaks or unusual usage spikes, preventing costly waste."
                            },
                            {
                                icon: <BrainCircuit className="text-blue-400" />,
                                title: "AI Intelligence",
                                desc: "AquaSmart AI analyzes your data to provide personalized recommendations for saving water and money."
                            },
                            {
                                icon: <BarChart3 className="text-blue-400" />,
                                title: "Smart Billing",
                                desc: "Predict your monthly expenses with precision and pay bills directly through our secure platform."
                            },
                            {
                                icon: <Smartphone className="text-blue-400" />,
                                title: "Cross-Platform",
                                desc: "Access your dashboard from anywhere. Our responsive UI works perfectly on mobile, tablet, and desktop."
                            },
                            {
                                icon: <Globe className="text-blue-400" />,
                                title: "Sustainable Living",
                                desc: "Join a community dedicated to a greener future through data-driven conservation efforts."
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card p-8 rounded-[40px] border border-white/5 hover:border-blue-500/30 transition-all hover:scale-[1.02] group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Methodology Section */}
            <section id="how-it-works" className="py-32 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">How it <span className="text-gradient">Works</span></h2>
                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Smart Installation", desc: "Connect your meters to the AquaSmart hub for instant data reporting." },
                                    { step: "02", title: "Data Ingestion", desc: "Our neural engine processes your consumption data in real-time." },
                                    { step: "03", title: "Smart Optimization", desc: "Receive immediate insights to reduce wastage and optimize costs." }
                                ].map((step, idx) => (
                                    <div key={idx} className="flex gap-6">
                                        <span className="text-4xl font-black text-white/10">{step.step}</span>
                                        <div>
                                            <h4 className="text-lg font-bold mb-2">{step.title}</h4>
                                            <p className="text-gray-400">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full" />
                            <div className="glass-card aspect-square rounded-[60px] border-white/10 relative z-10 overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-indigo-500/5 to-purple-500/10" />
                                
                                {/* The Liquid Intelligence Morphing Core */}
                                <div className="relative w-full h-full flex items-center justify-center p-8">
                                    
                                    {/* The Central Morphing Liquid Brain */}
                                    <div className="absolute z-20 flex items-center justify-center">
                                        <motion.div
                                            animate={{ 
                                                borderRadius: ["40% 60% 70% 30%", "60% 40% 30% 70%", "50% 50% 60% 40%", "40% 60% 70% 30%"],
                                                rotate: 360,
                                            }}
                                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                            style={{ willChange: "transform, border-radius" }}
                                            className="w-56 h-56 bg-gradient-to-br from-cyan-400/40 via-blue-500/50 to-indigo-600/40 backdrop-blur-xl border border-white/20 shadow-[0_0_80px_rgba(34,211,238,0.3)] shadow-inner absolute"
                                        />
                                        <motion.div
                                            animate={{ 
                                                borderRadius: ["60% 40% 30% 70%", "40% 60% 70% 30%", "30% 70% 60% 40%", "60% 40% 30% 70%"],
                                                rotate: -360,
                                            }}
                                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                            style={{ willChange: "transform, border-radius" }}
                                            className="w-60 h-60 bg-blue-500/20 blur-md absolute"
                                        />
                                        {/* Core Icon Stays Still */}
                                        <div className="relative z-30 text-white flex flex-col items-center">
                                            <BrainCircuit size={48} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                                            <span className="text-[10px] uppercase font-black tracking-widest mt-2 font-mono">AquaMind Process</span>
                                        </div>
                                    </div>

                                    {/* Ingestion Nodes (Top/Sides) sending data IN */}
                                    <motion.div 
                                        animate={{ x: [0, 10, 0], y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}
                                        className="absolute top-12 left-12 z-30 flex items-center gap-3"
                                    >
                                        <div className="w-12 h-12 bg-slate-900/80 rounded-full border border-cyan-500/30 flex items-center justify-center p-3 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                                            <Smartphone className="text-cyan-400 w-full h-full" />
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        animate={{ x: [0, -10, 0], y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                                        className="absolute top-12 right-12 z-30 flex items-center gap-3"
                                    >
                                        <div className="w-12 h-12 bg-slate-900/80 rounded-full border border-cyan-500/30 flex items-center justify-center p-3 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                                            <Globe className="text-cyan-400 w-full h-full" />
                                        </div>
                                    </motion.div>

                                    {/* Output Nodes (Bottom) receiving intelligence OUT */}
                                    <motion.div 
                                        animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
                                        className="absolute bottom-12 left-20 z-30 flex flex-col items-center gap-2"
                                    >
                                        <div className="w-14 h-14 bg-slate-900/80 rounded-2xl border border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                            <BarChart3 className="text-purple-400" />
                                        </div>
                                        <span className="text-[9px] text-purple-400/80 font-bold uppercase tracking-wider bg-slate-900/50 px-2 py-0.5 rounded-full">Optimize</span>
                                    </motion.div>

                                    <motion.div 
                                        animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
                                        className="absolute bottom-10 right-20 z-30 flex flex-col items-center gap-2"
                                    >
                                        <div className="w-14 h-14 bg-slate-900/80 rounded-2xl border border-green-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                                            <CheckCircle2 className="text-green-400" />
                                        </div>
                                        <span className="text-[9px] text-green-400/80 font-bold uppercase tracking-wider bg-slate-900/50 px-2 py-0.5 rounded-full">Automate</span>
                                    </motion.div>

                                    {/* Advanced Energy Lines */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.6))" }}>
                                        <defs>
                                            <linearGradient id="flowIn" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                            </linearGradient>
                                            <linearGradient id="flowOut" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                                                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                                            </linearGradient>
                                        </defs>
                                        
                                        {/* IN Streams */}
                                        <motion.path d="M 60 70 Q 250 150 250 250" fill="none" stroke="url(#flowIn)" strokeWidth="3" strokeDasharray="10 20" animate={{ strokeDashoffset: [-30, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ willChange: "stroke-dashoffset" }} />
                                        <motion.path d="M 440 70 Q 250 150 250 250" fill="none" stroke="url(#flowIn)" strokeWidth="3" strokeDasharray="10 20" animate={{ strokeDashoffset: [-30, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ willChange: "stroke-dashoffset" }} />

                                        {/* OUT Streams */}
                                        <motion.path d="M 250 250 Q 150 350 120 420" fill="none" stroke="url(#flowOut)" strokeWidth="3" strokeDasharray="10 30" animate={{ strokeDashoffset: [-40, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ willChange: "stroke-dashoffset" }} />
                                        <motion.path d="M 250 250 Q 350 350 380 420" fill="none" stroke="url(#flowOut)" strokeWidth="3" strokeDasharray="10 30" animate={{ strokeDashoffset: [-40, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ willChange: "stroke-dashoffset" }} />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Intelligence Highlight */}
            <section id="ai" className="py-32 bg-slate-950 overflow-hidden relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="glass-card bg-slate-900/40 p-12 md:p-24 rounded-[64px] border border-white/5 relative overflow-hidden"
                    >
                        {/* Decorative AI Elements */}
                        <div className="absolute top-0 right-0 p-12 opacity-20 group-hover:opacity-40 transition-opacity">
                            <BrainCircuit size={200} className="text-blue-500/20" />
                        </div>

                        <div className="flex flex-col items-center text-center relative z-10">
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-10 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                            >
                                <BrainCircuit className="text-blue-400" size={40} />
                            </motion.div>

                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic">
                                Meet <span className="text-gradient">AquaMind™</span>
                            </h2>
                            
                            <p className="text-blue-100/60 text-lg md:text-xl max-w-3xl mb-16 leading-relaxed font-medium">
                                Our bespoke neural engine trained specifically on multi-decade water conservation datasets. 
                                It predicts seasonal usage patterns with <span className="text-white">98% precision</span> and suggests 
                                infrastructure optimizations that pay for themselves in under 6 months.
                            </p>

                            <div className="grid md:grid-cols-3 gap-12 w-full max-w-4xl">
                                {[
                                    { label: "Avg. Savings", value: "25%", prefix: "+" },
                                    { label: "AI Accuracy", value: "98.2%", prefix: "" },
                                    { label: "Response Time", value: "24/7", prefix: "" }
                                ].map((stat, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className="text-5xl font-black text-white mb-3 tracking-tighter group-hover:text-blue-400 transition-colors">
                                            {stat.prefix}<span className="tabular-nums">{stat.value}</span>
                                        </div>
                                        <div className="text-blue-400/40 text-xs uppercase tracking-[0.3em] font-black">
                                            {stat.label}
                                        </div>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-slate-950">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight">Ready to conserve with <span className="text-blue-400">AquaSmart?</span></h2>
                    <p className="text-gray-400 text-xl mb-12">No credit card required. Cancel anytime.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button 
                            onClick={openSignup}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-3xl font-bold text-lg transition-all hover:scale-[1.02] shadow-2xl shadow-blue-500/20"
                        >
                            Build your Account
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 bg-slate-950 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12 mb-20">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <Droplet className="text-blue-400" size={24} />
                                </div>
                                <span className="text-xl font-bold tracking-tighter">AquaSmart</span>
                            </div>
                            <p className="text-gray-500 max-w-sm leading-relaxed">
                                Empowering smart cities and sustainable households with data-driven water management solutions. 
                                Built with love for professional developers and green energy enthusiasts.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest">Platform</h4>
                            <ul className="space-y-4 text-gray-500 text-sm font-medium">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Methodology</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-gray-600 text-[10px] uppercase tracking-widest font-black">
                        <div>© 2026 AquaSmart Inc. All rights reserved.</div>
                        <div className="flex gap-8 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)}
                mode={authMode}
                setMode={setAuthMode}
            />
        </div>
    );
};

export default Landing;
