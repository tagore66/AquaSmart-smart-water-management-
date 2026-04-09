import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Lightbulb, Zap, ChevronRight, Droplet, ChevronLeft, 
    Sparkles, Loader2, X, Info, Activity, Brain
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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
                return (
                    <h3 key={idx} className="text-lg font-black italic uppercase tracking-tight mb-3 text-blue-400 mt-5 first:mt-0">
                        {cleanLine.replace(/[#*]/g, '').trim()}
                    </h3>
                );
            }
            if (cleanLine.startsWith('* **') || cleanLine.startsWith('- **')) {
                const parts = cleanLine.split('**');
                return (
                    <li key={idx} className="ml-3 mb-2.5 list-none flex items-start gap-2.5">
                        <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(59,130,246,0.4)]"></div>
                        <span className="leading-snug">
                            <strong className="text-white font-black italic uppercase text-[10px] tracking-widest">{parts[1]}</strong>
                            <span className="text-gray-400 text-sm font-medium ml-1.5">{parts[2]}</span>
                        </span>
                    </li>
                );
            }
            if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
                return (
                    <li key={idx} className="ml-3 mb-2.5 list-none flex items-start gap-2.5 text-gray-400 text-sm font-medium leading-snug">
                        <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                        {cleanLine.substring(2)}
                    </li>
                );
            }
            
            let formattedLine = cleanLine;
            if (formattedLine.includes('**')) {
                const parts = formattedLine.split('**');
                return (
                    <p key={idx} className="mb-3 text-gray-400 text-sm font-medium leading-relaxed">
                        {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-black italic uppercase text-[10px] tracking-widest">{part}</strong> : part)}
                    </p>
                );
            }
            return <p key={idx} className="mb-3 text-gray-400 text-sm font-medium leading-relaxed italic">"{cleanLine}"</p>;
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
        setRetryMsg("Initializing Node...");
        
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
                    setRetryMsg(`Retrying... (${attempts}/${maxRetries})`);
                    await new Promise(r => setTimeout(r, 1500));
                    continue;
                }

                const errorMsg = error.response?.data?.error || error.response?.data?.message || "GenAI Node Latency Error.";
                setAiResponses(prev => ({ ...prev, [category]: `LATENCY_ERROR: ${errorMsg}` }));
                break;
            }
        }
        
        setAnalyzingCat(null);
        setRetryMsg("");
    };

    return (
        <PageWrapper
            title="Tactical Suggestions"
            subtitle="Deep optimization protocols to lower your consumption delta."
            loading={loading}
        >
            {!latestUsage && !loading ? (
                <Card className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-in fade-in zoom-in duration-500 border-white/5">
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500/10 blur-3xl rounded-full"></div>
                        <div className="relative p-8 bg-white/5 rounded-2xl border border-white/10">
                            <Lightbulb className="w-14 h-14 text-yellow-500/50" />
                        </div>
                    </div>
                    <div className="max-w-xs space-y-2">
                        <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">No Insights</h2>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed italic">Initialize your first usage lifecycle to populate optimization vectors.</p>
                        <Button className="mt-6 mx-auto py-2 px-6 text-[10px] font-black italic tracking-tighter uppercase" onClick={() => navigate('/usage')}>Initialize Log</Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {latestUsage?.suggestions.map((suggestion, i) => (
                        <Card 
                            key={i} 
                            delay={i * 0.1}
                            className="relative overflow-hidden group flex flex-col p-8 border-white/5 group bg-gradient-to-br from-white/[0.01] to-transparent"
                        >
                            <div className="absolute -top-6 -right-6 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 -rotate-12 group-hover:rotate-0 group-hover:scale-110">
                                <Activity className="w-48 h-48 text-blue-400" />
                            </div>
                            
                            <div className="flex items-start justify-between gap-5 mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-yellow-500/10 rounded-xl ring-2 ring-yellow-400/5 border border-yellow-500/10 group-hover:bg-yellow-400/20 transition-all duration-500">
                                        <Lightbulb className="text-yellow-500 w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 leading-none">
                                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{suggestion.category}</span>
                                            <div className="w-[3px] h-[3px] rounded-full bg-gray-700"></div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${suggestion.impact === 'High' ? 'text-red-500/80' : 'text-emerald-500/80'}`}>{suggestion.impact} IMPACT</span>
                                        </div>
                                        <h3 className="text-lg font-black italic tracking-tight text-white mt-1 uppercase">Optimization Vector</h3>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-400 text-base font-medium leading-relaxed mb-auto italic relative z-10">
                                "{suggestion.tip}"
                            </p>

                            <div className="mt-8 relative z-10">
                                <Button 
                                    variant="ghost"
                                    onClick={() => handleLearnMore(suggestion)}
                                    className="px-0 h-auto py-0 text-blue-500 hover:text-blue-400 transition-all gap-2 text-[10px] font-black uppercase tracking-[0.2em] w-auto border-none"
                                    icon={ChevronRight}
                                >
                                    Activate AI Deep Dive
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* AI Deep Dive Overlay */}
            <AnimatePresence>
                {selectedSuggestion && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSuggestion(null)}
                            className="fixed inset-0 bg-black/85 backdrop-blur-2xl z-[100]"
                        />
                        <motion.div 
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0.5 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-slate-950 border-l border-white/5 z-[110] shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
                        >
                            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                                <header className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-600/10 rounded-xl ring-2 ring-blue-600/5">
                                            <Brain className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">AI Deep Dive</h2>
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1.5 leading-none">Neural Analysis v4.5</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedSuggestion(null)}
                                        className="p-3 hover:bg-white/5 rounded-xl transition-all duration-300 text-gray-500 hover:text-white"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </header>

                                <div className="space-y-10">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-[2px] bg-blue-600 rounded-full"></div>
                                            <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-[0.2em] leading-none">{selectedSuggestion.category} Analysis Mode</span>
                                        </div>
                                        <h3 className="text-3xl font-black italic tracking-tighter text-white leading-[1.05] uppercase">Efficiency <br/>Matrix Brief</h3>
                                    </div>

                                    <Card className="p-6 bg-white/[0.01] border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-[2px] h-full bg-blue-600/40"></div>
                                        <div className="flex items-center gap-3 text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3 leading-none">
                                            <Info className="w-3.5 h-3.5 text-blue-500/40" />
                                            Baseline Protocol
                                        </div>
                                        <p className="text-gray-400 text-sm font-medium italic leading-relaxed">
                                            "{selectedSuggestion.tip}"
                                        </p>
                                    </Card>

                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 text-[9px] font-black text-blue-500/80 uppercase tracking-widest leading-none">
                                                {analyzingCat === selectedSuggestion.category ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                )}
                                                Cognitive Intelligence Brief
                                            </div>
                                            {analyzingCat && (
                                                <span className="text-[8px] font-black text-gray-700 animate-pulse uppercase tracking-widest leading-none">{retryMsg}</span>
                                            )}
                                        </div>

                                        {analyzingCat === selectedSuggestion.category ? (
                                            <div className="space-y-6 py-6">
                                                <div className="flex gap-2.5 justify-center mb-6">
                                                    <span className="w-2 h-2 bg-blue-600/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                    <span className="w-2 h-2 bg-blue-600/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                    <span className="w-2 h-2 bg-blue-600/40 rounded-full animate-bounce"></span>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="h-4 bg-white/[0.03] rounded-lg w-3/4 animate-pulse"></div>
                                                    <div className="h-3 bg-white/[0.03] rounded-lg w-full animate-pulse"></div>
                                                    <div className="h-3 bg-white/[0.03] rounded-lg w-5/6 animate-pulse"></div>
                                                </div>
                                            </div>
                                        ) : aiResponses[selectedSuggestion.category] ? (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-8 rounded-[2rem] border transition-all duration-700 ${
                                                    aiResponses[selectedSuggestion.category].includes('LATENCY_ERROR') 
                                                    ? 'bg-red-500/5 border-red-500/10 text-red-400' 
                                                    : 'bg-gradient-to-br from-blue-600/[0.03] to-transparent border-white/5 shadow-2xl'
                                                }`}
                                            >
                                                {aiResponses[selectedSuggestion.category].includes('LATENCY_ERROR') ? (
                                                    <div className="flex flex-col items-center gap-4 py-8">
                                                        <AlertTriangle className="w-12 h-12 text-red-500/30" />
                                                        <p className="font-black italic text-lg tracking-tight text-center leading-none">{aiResponses[selectedSuggestion.category]}</p>
                                                        <Button onClick={() => handleLearnMore(selectedSuggestion)} variant="ghost" className="px-6 py-2 text-[9px] uppercase font-black tracking-widest border-white/10 hover:bg-white/5">Retry Engine</Button>
                                                    </div>
                                                ) : (
                                                    <div className="custom-markdown-compact">
                                                        {formatAiText(aiResponses[selectedSuggestion.category])}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-900/60 border-t border-white/5 backdrop-blur-xl">
                                <Button 
                                    onClick={() => setSelectedSuggestion(null)}
                                    className="w-full py-4 text-xs font-black uppercase italic tracking-tighter"
                                >
                                    Confirm Strategic Alignment
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

export default Suggestions;
