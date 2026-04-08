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
import Navbar from '../components/Navbar';

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
    const [inputMode, setInputMode] = useState('smart'); // 'manual' or 'smart'
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

    // Auto-calculate for Smart Mode
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

    // Intelligence Layer Logic
    const intelligence = useMemo(() => {
        const litersPerPersonPerWeek = totalLiters / numPeople;
        const avgLiters = 135 * 7; // Average weekly liters per person (Indian context)
        
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
                }, 500); // Allow time for toast exit animation
            }, 3000);
        } catch (error) {
            console.error('Error saving usage:', error);
            alert('Failed to save data. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex bg-slate-950 min-h-screen text-white">
            <Navbar />
            <main className="flex-1 ml-20 md:ml-64 p-6 md:p-12 max-w-4xl space-y-8 relative">
                <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20, x: 20 }}
                        className="fixed top-6 right-6 z-50 bg-[#1e293b]/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
                    >
                        <div className="bg-green-500/20 p-2 rounded-full">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="pr-2">
                            <h4 className="font-bold text-white text-sm">Data Saved Successfully!</h4>
                            <p className="text-xs text-gray-300">Your weekly report has been sent to your email.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-12 flex items-center justify-between">
                <div>
                    <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4">
                        <ChevronLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-bold mb-2">Weekly Usage</h1>
                    <p className="text-gray-400">Step {step} of 2: {step === 1 ? 'General Info' : 'Category Breakdown'}</p>
                </div>
                <div className="hidden md:block">
                    <div className="glass-card py-2 px-4 flex items-center gap-3">
                        <Droplet className="text-blue-400" />
                        <span className="font-bold text-2xl">{totalLiters}L</span>
                        <span className="text-sm text-gray-400">Total</span>
                    </div>
                </div>
            </div>

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
                            <div className="glass-card space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" /></div>
                                    <h3 className="text-xl font-semibold">Household Size</h3>
                                </div>
                                <p className="text-gray-400 text-sm">Number of people living in the house.</p>
                                <div className="flex items-center gap-6">
                                    <input 
                                        type="range" min="1" max="10" 
                                        value={numPeople} 
                                        onChange={(e) => setNumPeople(parseInt(e.target.value))}
                                        className="flex-1 accent-blue-500"
                                    />
                                    <span className="text-3xl font-bold w-12 text-center">{numPeople}</span>
                                </div>
                            </div>

                            <div className="glass-card space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-purple-500/20 rounded-xl"><Calendar className="text-purple-400" /></div>
                                    <h3 className="text-xl font-semibold">Week Starting</h3>
                                </div>
                                <p className="text-gray-400 text-sm">Select the Sunday of the tracking week.</p>
                                <input 
                                    type="date" 
                                    value={weekStarting}
                                    onChange={(e) => setWeekStarting(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button onClick={nextStep} className="btn-primary flex items-center gap-2 group">
                                Next Step
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
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
                        {/* Mode Toggle */}
                        <div className="flex justify-center mb-8">
                            <div className="glass-card p-1.5 flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10">
                                <button 
                                    onClick={() => setInputMode('smart')}
                                    className={`px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 ${inputMode === 'smart' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <BrainCircuit className="w-5 h-5" />
                                    Smart Estimate
                                </button>
                                <button 
                                    onClick={() => setInputMode('manual')}
                                    className={`px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 ${inputMode === 'manual' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Settings2 className="w-5 h-5" />
                                    Manual Input
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((cat) => (
                                <div key={cat.id} className="glass-card space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className={`p-2 ${cat.bg} rounded-lg`}>
                                            <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-bold block">{usageData[cat.id]}L</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Liters/Week</span>
                                        </div>
                                    </div>
                                    <h4 className="font-semibold">{cat.name}</h4>
                                    
                                    {inputMode === 'manual' ? (
                                        <input 
                                            type="range" min="0" max="1000" step="10"
                                            value={usageData[cat.id]} 
                                            onChange={(e) => handleInputChange(cat.id, e.target.value)}
                                            className={`w-full accent-blue-500 cursor-pointer`}
                                        />
                                    ) : (
                                        <div className="space-y-4 pt-2">
                                            {cat.id === 'bathing' && (
                                                <>
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] text-gray-400 uppercase">Showers per Person / Day</p>
                                                        <div className="flex items-center gap-3">
                                                            <input type="range" min="1" max="4" value={smartData.showersPerDay} onChange={(e) => handleSmartChange('showersPerDay', parseInt(e.target.value))} className="flex-1 accent-blue-500"/>
                                                            <span className="text-sm font-bold w-4">{smartData.showersPerDay}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] text-gray-400 uppercase">Duration (Minutes)</p>
                                                        <div className="flex items-center gap-3">
                                                            <input type="range" min="1" max="30" value={smartData.showerDuration} onChange={(e) => handleSmartChange('showerDuration', parseInt(e.target.value))} className="flex-1 accent-blue-500"/>
                                                            <span className="text-sm font-bold w-4">{smartData.showerDuration}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {cat.id === 'toilet' && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-400 uppercase">Flushes per Person / Day</p>
                                                    <div className="flex items-center gap-3">
                                                        <input type="range" min="1" max="10" value={smartData.flushesPerDay} onChange={(e) => handleSmartChange('flushesPerDay', parseInt(e.target.value))} className="flex-1 accent-blue-500"/>
                                                        <span className="text-sm font-bold w-4">{smartData.flushesPerDay}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {cat.id === 'kitchen' && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-400 uppercase">Frequency Level</p>
                                                    <div className="flex items-center gap-2">
                                                        {['Low', 'Medium', 'High'].map(f => (
                                                            <button 
                                                                key={f}
                                                                onClick={() => handleSmartChange('kitchenFreq', f)}
                                                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${smartData.kitchenFreq === f ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'border-white/10 text-gray-400'}`}
                                                            >
                                                                {f}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {cat.id === 'washing' && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-400 uppercase">Loads / Week</p>
                                                    <div className="flex items-center gap-3">
                                                        <input type="range" min="0" max="15" value={smartData.washingFreq} onChange={(e) => handleSmartChange('washingFreq', parseInt(e.target.value))} className="flex-1 accent-blue-500"/>
                                                        <span className="text-sm font-bold w-4">{smartData.washingFreq}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {cat.id === 'gardening' && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-400 uppercase">Sessions / Week</p>
                                                    <div className="flex items-center gap-3">
                                                        <input type="range" min="0" max="14" value={smartData.gardeningFreq} onChange={(e) => handleSmartChange('gardeningFreq', parseInt(e.target.value))} className="flex-1 accent-blue-500"/>
                                                        <span className="text-sm font-bold w-4">{smartData.gardeningFreq}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Intelligence Layer UI */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card md:col-span-2 flex items-start gap-4 border-l-4 border-l-blue-500">
                                <div className={`p-3 rounded-xl bg-opacity-10 ${intelligence.color.replace('text', 'bg')}`}>
                                    <AlertTriangle className={`w-6 h-6 ${intelligence.color}`} />
                                </div>
                                <div className="space-y-1">
                                    <h5 className={`font-bold ${intelligence.color}`}>AI Status: {intelligence.status}</h5>
                                    <p className="text-gray-400 text-sm">{intelligence.message}</p>
                                </div>
                            </div>
                            <div className="glass-card flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 uppercase">Data Confidence</p>
                                    <h5 className="font-bold flex items-center gap-2">
                                        {intelligence.confidence === 'High' ? <ShieldCheck className="w-5 h-5 text-green-400" /> : <Loader2 className="w-5 h-5 text-yellow-400" />}
                                        {intelligence.confidence}
                                    </h5>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase">Weekly Rank</p>
                                    <span className="text-lg font-bold text-blue-400">#12 Eco-Smart</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-white bg-opacity-5 p-6 rounded-2xl border border-white border-opacity-10">
                            <button onClick={prevStep} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5" />
                                Back
                            </button>
                            <div className="flex items-center gap-6">
                                <div className="hidden md:block text-right">
                                    <p className="text-sm text-gray-400">Calculated Total</p>
                                    <p className="text-2xl font-bold">{totalLiters} Liters</p>
                                </div>
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={loading}
                                    className="btn-primary py-4 px-10 flex items-center gap-2 text-lg"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-8 h-8" /> Save Weekly Data</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            </main>
        </div>
    );
};

export default UsageInput;
