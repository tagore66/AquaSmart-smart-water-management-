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
                    <h3 key={idx} className="text-xl font-black italic uppercase tracking-tight mb-4 text-blue-400 mt-6 first:mt-0">
                        {cleanLine.replace(/[#*]/g, '').trim()}
                    </h3>
                );
            }
            if (cleanLine.startsWith('* **') || cleanLine.startsWith('- **')) {
                const parts = cleanLine.split('**');
                return (
                    <li key={idx} className="ml-4 mb-3 list-none flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        <span>
                            <strong className="text-white font-black italic uppercase text-xs tracking-widest">{parts[1]}</strong>
                            <span className="text-gray-400 text-base font-medium ml-2">{parts[2]}</span>
                        </span>
                    </li>
                );
            }
            if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
                return (
                    <li key={idx} className="ml-4 mb-3 list-none flex items-start gap-3 text-gray-400 text-base font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                        {cleanLine.substring(2)}
                    </li>
                );
            }
            
            let formattedLine = cleanLine;
            if (formattedLine.includes('**')) {
                const parts = formattedLine.split('**');
                return (
                    <p key={idx} className="mb-4 text-gray-400 text-base font-medium leading-relaxed">
                        {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-black italic uppercase text-xs tracking-widest">{part}</strong> : part)}
                    </p>
                );
            }
            return <p key={idx} className="mb-4 text-gray-400 text-base font-medium leading-relaxed italic">"{cleanLine}"</p>;
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
        setRetryMsg("Initializing Generative Engine...");
        
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
                    setRetryMsg(`Engine Congestion, retrying... (${attempts}/${maxRetries})`);
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }

                const errorMsg = error.response?.data?.error || error.response?.data?.message || "GenAI Node Offline. System experiencing high demand latency.";
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
                <Card className="flex flex-col items-center justify-center py-40 text-center space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                        <div className="relative p-10 bg-white/5 rounded-[3rem] border border-white/10">
                            <Lightbulb className="w-20 h-20 text-yellow-400" />
                        </div>
                    </div>
                    <div className="max-w-md space-y-4">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase">No Insights Available</h2>
                        <p className="text-gray-500 font-medium leading-relaxed italic">"Initialize your first usage lifecycle to populate optimization vectors."</p>
                        <Button className="mt-8 mx-auto" onClick={() => navigate('/usage')}>Initialize Log</Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {latestUsage?.suggestions.map((suggestion, i) => (
                        <Card 
                            key={i} 
                            delay={i * 0.1}
                            className="relative overflow-hidden group flex flex-col p-10 border-white/5"
                        >
                            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 -rotate-12 group-hover:rotate-0 group-hover:scale-110">
                                <Activity className="w-64 h-64 text-blue-400" />
                            </div>
                            
                            <div className="flex items-start justify-between gap-6 mb-8 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="p-5 bg-yellow-400/10 rounded-[1.5rem] ring-4 ring-yellow-400/5 border border-yellow-400/10 group-hover:bg-yellow-400/20 transition-all duration-500">
                                        <Lightbulb className="text-yellow-400 w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{suggestion.category}</span>
                                            <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${suggestion.impact === 'High' ? 'text-red-400' : 'text-emerald-400'}`}>{suggestion.impact} IMPACT</span>
                                        </div>
                                        <h3 className="text-2xl font-black italic tracking-tight text-white mt-1">Optimization Vector</h3>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-400 text-xl font-medium leading-relaxed mb-auto italic relative z-10">
                                "{suggestion.tip}"
                            </p>

                            <div className="mt-12 relative z-10">
                                <Button 
                                    variant="ghost"
                                    onClick={() => handleLearnMore(suggestion)}
                                    className="px-0 text-blue-400 hover:text-blue-300 transition-all gap-3 text-sm font-black uppercase tracking-[0.2em]"
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
                            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100]"
                        />
                        <motion.div 
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0.5 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full md:w-[550px] bg-slate-950 border-l border-white/10 z-[110] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
                        >
                            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                                <header className="flex items-center justify-between mb-12">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-blue-600/10 rounded-2xl ring-4 ring-blue-600/5">
                                            <Brain className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black italic tracking-tighter uppercase">AI Deep Dive</h2>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Generative Neural Analysis v4.2</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedSuggestion(null)}
                                        className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 text-gray-400 hover:text-white"
                                    >
                                        <X className="w-8 h-8" />
                                    </button>
                                </header>

                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-1 bg-blue-500 rounded-full"></div>
                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">{selectedSuggestion.category} Analysis Mode</span>
                                        </div>
                                        <h3 className="text-4xl font-black italic tracking-tighter text-white leading-[1.1]">Personalized <br/>Efficiency Matrix</h3>
                                    </div>

                                    <Card className="p-8 bg-white/[0.02] border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                                            <Info className="w-4 h-4 text-blue-500" />
                                            Baseline Protocol
                                        </div>
                                        <p className="text-gray-300 text-lg font-medium italic leading-relaxed">
                                            "{selectedSuggestion.tip}"
                                        </p>
                                    </Card>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                                {analyzingCat === selectedSuggestion.category ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4" />
                                                )}
                                                Generative Intelligence Brief
                                            </div>
                                            {analyzingCat && (
                                                <span className="text-[10px] font-black text-gray-600 animate-pulse uppercase tracking-widest">{retryMsg}</span>
                                            )}
                                        </div>

                                        {analyzingCat === selectedSuggestion.category ? (
                                            <div className="space-y-8 py-10">
                                                <div className="flex gap-3 justify-center mb-8">
                                                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="h-6 bg-white/5 rounded-2xl w-3/4 animate-pulse"></div>
                                                    <div className="h-4 bg-white/5 rounded-2xl w-full animate-pulse"></div>
                                                    <div className="h-4 bg-white/5 rounded-2xl w-5/6 animate-pulse"></div>
                                                </div>
                                            </div>
                                        ) : aiResponses[selectedSuggestion.category] ? (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-10 rounded-[3rem] border transition-all duration-700 ${
                                                    aiResponses[selectedSuggestion.category].includes('LATENCY_ERROR') 
                                                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                                    : 'bg-gradient-to-br from-blue-600/10 to-transparent border-white/5'
                                                }`}
                                            >
                                                {aiResponses[selectedSuggestion.category].includes('LATENCY_ERROR') ? (
                                                    <div className="flex flex-col items-center gap-6 py-10">
                                                        <AlertTriangle className="w-16 h-16 text-red-500/50" />
                                                        <p className="font-black italic text-xl tracking-tight text-center">{aiResponses[selectedSuggestion.category]}</p>
                                                        <Button onClick={() => handleLearnMore(selectedSuggestion)} variant="secondary" className="px-8 !bg-white/5 !border-white/10 hover:!bg-white/10">Retry Connection</Button>
                                                    </div>
                                                ) : (
                                                    <div className="custom-markdown">
                                                        {formatAiText(aiResponses[selectedSuggestion.category])}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 bg-slate-900/50 border-t border-white/5">
                                <Button 
                                    onClick={() => setSelectedSuggestion(null)}
                                    className="w-full py-6 text-xl uppercase italic tracking-tighter"
                                >
                                    Synchronize Strategy
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
