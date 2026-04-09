import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Zap, ChevronRight, Droplet, ChevronLeft, Sparkles, Loader2, X, Info } from 'lucide-react';
import Navbar from '../components/Navbar';



const Suggestions = () => {
    const navigate = useNavigate();
    const [latestUsage, setLatestUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzingCat, setAnalyzingCat] = useState(null);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [aiResponses, setAiResponses] = useState({});
    const [retryMsg, setRetryMsg] = useState("");

    const formatAiText = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, idx) => {
            const cleanLine = line.trim();
            if (!cleanLine) return <br key={idx} />;
            
            if (cleanLine.startsWith('##') || cleanLine.startsWith('**##')) {
                return <h3 key={idx} className="text-lg font-bold mb-2 text-purple-300">{cleanLine.replace(/[#*]/g, '').trim()}</h3>;
            }
            if (cleanLine.startsWith('* **') || cleanLine.startsWith('- **')) {
                const parts = cleanLine.split('**');
                return (
                    <li key={idx} className="ml-6 mb-2 list-disc marker:text-purple-400">
                        <strong className="text-white">{parts[1]}</strong>
                        <span className="text-gray-300 text-base">{parts[2]}</span>
                    </li>
                );
            }
            if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
                return <li key={idx} className="ml-6 mb-2 list-disc marker:text-purple-400 text-gray-300 text-base">{cleanLine.substring(2)}</li>;
            }
            
            let formattedLine = cleanLine;
            if (formattedLine.includes('**')) {
                const parts = formattedLine.split('**');
                return (
                    <p key={idx} className="mb-4 text-gray-300 text-base leading-relaxed">
                        {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part)}
                    </p>
                );
            }
            return <p key={idx} className="mb-4 text-gray-300 text-base leading-relaxed">{cleanLine}</p>;
        });
    };

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const { data } = await axios.get('/usage/latest');
                setLatestUsage(data);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLatest();
    }, []);

    const handleLearnMore = async (suggestion) => {
        setSelectedSuggestion(suggestion);
        const category = suggestion.category;

        if (aiResponses[category]) return;

        setAnalyzingCat(category);
        setRetryMsg("Generating deep dive...");
        
        let attempts = 0;
        const maxRetries = 2;

        while (attempts <= maxRetries) {
            try {
                const { data } = await axios.post('/ai/analyze', {
                    category,
                    usageData: {
                        bathing: latestUsage.categories.bathing,
                        kitchen: latestUsage.categories.kitchen,
                        toilet: latestUsage.categories.toilet,
                        washing: latestUsage.categories.washing,
                        gardening: latestUsage.categories.gardening,
                        totalLiters: latestUsage.totalLiters
                    }
                });

                setAiResponses(prev => ({ ...prev, [category]: data.analysis }));
                break;
            } catch (error) {
                console.error(`AI Analysis failed (Attempt ${attempts + 1}):`, error);
                
                if (attempts < maxRetries) {
                    attempts++;
                    setRetryMsg(`AI is busy, retrying... (${attempts}/${maxRetries})`);
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }

                const errorMsg = error.response?.data?.error || error.response?.data?.message || "AI is currently experiencing high demand. Please try again later.";
                setAiResponses(prev => ({ ...prev, [category]: `Unable to fetch AI analysis: ${errorMsg}` }));
                break;
            }
        }
        
        setAnalyzingCat(null);
        setRetryMsg("");
    };

    if (loading) return (
        <div className="flex flex-col ml-20 md:ml-64 p-6 md:p-12 space-y-10 min-h-screen max-w-5xl">
            <header className="pb-6 border-b border-white/5">
                <div className="skeleton h-10 w-64 mb-4"></div>
                <div className="skeleton h-6 w-96"></div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(n => <div key={n} className="skeleton h-64 w-full rounded-2xl"></div>)}
            </div>
        </div>
    );

    if (!latestUsage) return (
        <div className="h-screen flex items-center justify-center text-center p-8">
            <div className="glass-card max-w-md">
                <Lightbulb className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">No Insights Yet</h2>
                <p className="text-gray-400">Add your first weekly usage record to get personalized water-saving suggestions.</p>
            </div>
        </div>
    );

    return (
        <div className="flex bg-slate-950 min-h-screen text-white">
            <Navbar />
            <main className="flex-1 ml-20 md:ml-64 p-6 md:p-12 max-w-5xl space-y-10 relative">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4">
                        <ChevronLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Zap className="text-yellow-400" /> <span className="text-gradient">Reduce My Bill</span>
                    </h1>
                    <p className="text-gray-400">Intelligent data-driven suggestions to lower your consumption.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestUsage.suggestions.map((suggestion, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card relative overflow-hidden group flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Droplet className="w-24 h-24 text-blue-400" />
                        </div>
                        
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-yellow-400/10 rounded-xl">
                                <Lightbulb className="text-yellow-400 w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{suggestion.category}</span>
                                <h3 className="text-xl font-bold">{suggestion.impact} Impact</h3>
                            </div>
                        </div>

                        <p className="text-gray-300 text-lg leading-relaxed mb-auto">
                            "{suggestion.tip}"
                        </p>

                        <div className="mt-8">
                            <button 
                                onClick={() => handleLearnMore(suggestion)}
                                className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-all"
                            >
                                Learn more about this tip
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>


            {/* AI Side Panel */}
            <AnimatePresence>
                {selectedSuggestion && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSuggestion(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-slate-900 border-l border-white/10 z-50 shadow-2xl overflow-y-auto"
                        >
                            <div className="p-8 space-y-8">
                                <header className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/20 rounded-lg">
                                            <Sparkles className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <h2 className="text-xl font-bold">AI Deep Dive</h2>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedSuggestion(null)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </header>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{selectedSuggestion.category} Analysis</span>
                                        <h3 className="text-3xl font-bold leading-tight">Personalized Water Saving Plan</h3>
                                    </div>

                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                                        <div className="flex items-center gap-3 text-sm font-semibold">
                                            <Info className="w-4 h-4 text-blue-400" />
                                            Baseline Insight
                                        </div>
                                        <p className="text-gray-400 text-sm italic">
                                            "{selectedSuggestion.tip}"
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
                                            {analyzingCat === selectedSuggestion.category ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-4 h-4" />
                                            )}
                                            Generative Analysis
                                        </div>

                                        {analyzingCat === selectedSuggestion.category ? (
                                            <div className="space-y-4 animate-pulse">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="flex gap-1.5">
                                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                                                    </div>
                                                    <span className="text-purple-300 text-sm font-medium animate-pulse">{retryMsg}</span>
                                                </div>
                                                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                                <div className="h-4 bg-white/5 rounded w-full"></div>
                                                <div className="h-4 bg-white/5 rounded w-5/6"></div>
                                            </div>
                                        ) : aiResponses[selectedSuggestion.category] ? (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`text-gray-300 text-base leading-relaxed p-6 rounded-2xl border ${
                                                    aiResponses[selectedSuggestion.category].includes('Unable') 
                                                    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                                    : 'bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20'
                                                }`}
                                            >
                                                {aiResponses[selectedSuggestion.category].includes('Unable') ? (
                                                    aiResponses[selectedSuggestion.category]
                                                ) : (
                                                    <div>
                                                        {formatAiText(aiResponses[selectedSuggestion.category])}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ) : null}
                                    </div>
                                </div>

                                <footer className="pt-8 border-t border-white/10">
                                    <button 
                                        onClick={() => setSelectedSuggestion(null)}
                                        className="w-full btn-primary py-4"
                                    >
                                        Got it, thanks!
                                    </button>
                                </footer>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            </main>
        </div>
    );
};

export default Suggestions;
