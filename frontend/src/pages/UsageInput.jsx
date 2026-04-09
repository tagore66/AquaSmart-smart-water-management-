import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Droplet, Bath, Utensils, Construction as Toilet, 
    Waves as Washing, Sprout, Users, Calendar, 
    ChevronRight, ChevronLeft, Save, Loader2,
    Settings2, BrainCircuit, AlertTriangle, CheckCircle2, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';

const categories = [
    { id: 'bathing', name: 'Bathing', icon: Bath, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'kitchen', name: 'Kitchen', icon: Utensils, color: 'text-green-400', bg: 'bg-green-400/10' },
    { id: 'toilet', name: 'Toilet', icon: Toilet, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'washing', name: 'Washing', icon: Washing, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'gardening', name: 'Gardening', icon: Sprout, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
];

const UsageInput = () => {
    const [step, setStep] = useState(1);
    const [numPeople, setNumPeople] = useState(1);
    const [weekStarting, setWeekStarting] = useState(new Date().toISOString().split('T')[0]);
    const [inputMode, setInputMode] = useState('smart');
    const [smartData, setSmartData] = useState({
        showersPerDay: 1,
        showerDuration: 5,
        flushesPerDay: 4,
        kitchenFreq: 'Medium',
        washingFreq: 2,
        gardeningFreq: 1
    });

    const [usageData, setUsageData] = useState({
        bathing: 0,
        kitchen: 0,
        toilet: 0,
        washing: 0,
        gardening: 0
    });
    const [loading, setLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const navigate = useNavigate();

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    useEffect(() => {
        if (inputMode === 'smart') {
            const bathing = numPeople * smartData.showersPerDay * smartData.showerDuration * 15 * 7;
            const toilet = numPeople * smartData.flushesPerDay * 6 * 7;
            const kitchenMap = { Low: 100, Medium: 250, High: 500 };
            const kitchen = kitchenMap[smartData.kitchenFreq];
            const washing = smartData.washingFreq * 60;
            const gardening = smartData.gardeningFreq * 15;

            setUsageData({ bathing, toilet, kitchen, washing, gardening });
        }
    }, [inputMode, smartData, numPeople]);

    const handleInputChange = (id, value) => {
        if (inputMode === 'manual') {
            setUsageData(prev => ({ ...prev, [id]: parseInt(value) }));
        }
    };

    const handleSmartChange = (key, value) => {
        setSmartData(prev => ({ ...prev, [key]: value }));
    };

    const totalLiters = Object.values(usageData).reduce((a, b) => a + b, 0);

    const intelligence = useMemo(() => {
        const litersPerPersonPerWeek = totalLiters / numPeople;
        const avgLiters = 135 * 7;
        
        let status = 'Ideal';
        let color = 'text-green-400';
        let message = 'Your usage is within the ideal range for your household.';
        let confidence = 'High';

        if (litersPerPersonPerWeek < 500) {
            status = 'Unusually Low';
            color = 'text-yellow-400';
            message = 'This usage seems quite low. Please verify your inputs.';
            confidence = 'Medium';
        } else if (litersPerPersonPerWeek > 2500) {
            status = 'Critically High';
            color = 'text-red-400';
            message = 'Exceptional usage detected. Check for leaks or excessive activities.';
            confidence = 'Low';
        } else if (litersPerPersonPerWeek > 1500) {
            status = 'Above Average';
            color = 'text-orange-400';
            message = 'Slightly higher than typical benchmarks. Consider optimized habits.';
            confidence = 'High';
        }

        return { status, color, message, confidence };
    }, [totalLiters, numPeople]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await axios.post('/usage', {
                categories: usageData,
                numPeople,
                weekStarting
            });
            setShowNotification(true);
            setTimeout(() => {
                setShowNotification(false);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 500);
            }, 3000);
        } catch (error) {
            console.error('Error saving usage:', error);
            alert('Failed to save data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper
            title="Weekly Usage"
            subtitle={`Step ${step} of 2: ${step === 1 ? 'General Info' : 'Category Breakdown'}`}
            actions={
                <div className="hidden md:block">
                    <Card hover={false} className="py-2 px-6 flex items-center gap-4 bg-white/5 border-white/10">
                        <Droplet className="text-blue-400" />
                        <span className="font-black text-3xl">
                            <AnimatedNumber value={totalLiters} />
                            <span className="text-sm font-bold text-gray-500 ml-1">L</span>
                        </span>
                    </Card>
                </div>
            }
        >
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20, x: 20 }}
                        className="fixed top-6 right-6 z-50 glass p-6 rounded-[2rem] flex items-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)] border-white/20"
                    >
                        <div className="bg-green-500/20 p-3 rounded-full">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Data Saved Successfully!</h4>
                            <p className="text-xs text-gray-400">Your report has been generated.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="space-y-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/10"><Users className="text-blue-400" /></div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">Household Size</h3>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Residents Count</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <input 
                                        type="range" min="1" max="10" 
                                        value={numPeople} 
                                        onChange={(e) => setNumPeople(parseInt(e.target.value))}
                                        className="flex-1 accent-blue-500 h-2 bg-white/5 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-4xl font-black w-14 text-center text-gradient leading-none">{numPeople}</span>
                                </div>
                            </Card>

                            <Card className="space-y-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/10"><Calendar className="text-purple-400" /></div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">Week Starting</h3>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tracking Period</p>
                                    </div>
                                </div>
                                <input 
                                    type="date" 
                                    value={weekStarting}
                                    onChange={(e) => setWeekStarting(e.target.value)}
                                    className="input-field"
                                />
                            </Card>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={nextStep} icon={ChevronRight}>
                                Next Phase
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="flex justify-center mb-10">
                            <div className="glass p-2 flex items-center gap-2 rounded-[2rem]">
                                <button 
                                    onClick={() => setInputMode('smart')}
                                    className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${inputMode === 'smart' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <BrainCircuit className="w-5 h-5" />
                                    Smart Estimate
                                </button>
                                <button 
                                    onClick={() => setInputMode('manual')}
                                    className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${inputMode === 'manual' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Settings2 className="w-5 h-5" />
                                    Manual Logic
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((cat, idx) => (
                                <Card key={cat.id} delay={idx * 0.05} className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className={`p-4 ${cat.bg} rounded-2xl border border-white/5`}>
                                            <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black block">
                                                <AnimatedNumber value={usageData[cat.id]} />L
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Wk Total</span>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-lg tracking-tight">{cat.name}</h4>
                                    
                                    {inputMode === 'manual' ? (
                                        <input 
                                            type="range" min="0" max="1000" step="10"
                                            value={usageData[cat.id]} 
                                            onChange={(e) => handleInputChange(cat.id, e.target.value)}
                                            className="w-full accent-blue-500 h-2 bg-white/5 rounded-lg appearance-none cursor-pointer"
                                        />
                                    ) : (
                                        <div className="space-y-6 pt-2">
                                            {cat.id === 'bathing' && (
                                                <>
                                                    <div className="space-y-3">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Showers / Person</p>
                                                        <div className="flex items-center gap-4">
                                                            <input type="range" min="1" max="4" value={smartData.showersPerDay} onChange={(e) => handleSmartChange('showersPerDay', parseInt(e.target.value))} className="flex-1 accent-blue-500 h-1.5 bg-white/5 lg:bg-transparent rounded-lg appearance-none cursor-pointer"/>
                                                            <span className="text-xl font-bold text-blue-400 w-4">{smartData.showersPerDay}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {cat.id === 'kitchen' && (
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Intensity Level</p>
                                                    <div className="flex items-center gap-2">
                                                        {['Low', 'Medium', 'High'].map(f => (
                                                            <button 
                                                                key={f}
                                                                onClick={() => handleSmartChange('kitchenFreq', f)}
                                                                className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-all ${smartData.kitchenFreq === f ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'border-white/10 text-gray-500'}`}
                                                            >
                                                                {f}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card delay={0.4} className="md:col-span-2 flex items-start gap-6 border-l-4 border-l-blue-500">
                                <div className={`p-4 rounded-2xl ${intelligence.color.replace('text', 'bg').replace('400', '400/10')}`}>
                                    <BrainCircuit className={`w-8 h-8 ${intelligence.color}`} />
                                </div>
                                <div className="space-y-2">
                                    <h5 className={`text-xl font-bold tracking-tight ${intelligence.color}`}>AI Review: {intelligence.status}</h5>
                                    <p className="text-gray-400 italic">"{intelligence.message}"</p>
                                </div>
                            </Card>
                            <Card delay={0.5} className="flex flex-col justify-center gap-4 items-center text-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Confidence Score</p>
                                    <h5 className="font-black text-2xl flex items-center gap-2 justify-center">
                                        <ShieldCheck className="w-6 h-6 text-blue-400" />
                                        {intelligence.confidence.toUpperCase()}
                                    </h5>
                                </div>
                            </Card>
                        </div>

                        <Card className="flex flex-col md:flex-row justify-between items-center gap-6 mt-10 p-10 bg-gradient-to-br from-white/5 to-transparent">
                            <Button variant="ghost" onClick={prevStep} icon={ChevronLeft}>
                                Previous Phase
                            </Button>
                            <div className="flex items-center gap-10">
                                <div className="hidden md:block text-right">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">AGGREGATE TOTAL</p>
                                    <p className="text-4xl font-black italic">
                                        <AnimatedNumber value={totalLiters} /> <span className="text-sm font-bold text-gray-600">Liters</span>
                                    </p>
                                </div>
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={loading}
                                    variant="primary"
                                    className="px-12 py-5 text-xl"
                                    icon={loading ? Loader2 : Save}
                                >
                                    {loading ? 'Encrypting...' : 'Save Lifecycle Data'}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

export default UsageInput;
