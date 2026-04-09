import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    TrendingUp, TrendingDown, Droplet, BarChart3, 
    ArrowUpRight, ArrowDownRight, Sparkles,
    PieChart as PieIcon, Activity, Calendar
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import PageWrapper from '../components/layout/PageWrapper';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const Insights = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        trend: 0,
        trendDirection: 'stable',
        currUsage: 0,
        prevUsage: 0
    });
    const [insights, setInsights] = useState([]);
    const [pieData, setPieData] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await axios.get('/usage');
                const sortedHistory = [...data].sort((a, b) => new Date(a.weekStarting) - new Date(b.weekStarting));
                setHistory(sortedHistory);
                calculateStats(sortedHistory);
            } catch (err) {
                console.error('Error fetching insights data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const calculateStats = (data) => {
        if (!data || data.length === 0) return;

        const latest = data[data.length - 1];
        const previous = data.length >= 2 ? data[data.length - 2] : null;

        let trend = 0;
        let trendDirection = 'stable';
        if (previous) {
            trend = ((latest.totalLiters - previous.totalLiters) / previous.totalLiters) * 100;
            trendDirection = latest.totalLiters > previous.totalLiters ? 'up' : 'down';
        }

        setStats({
            trend: Math.abs(trend),
            trendDirection,
            currUsage: latest.totalLiters,
            prevUsage: previous?.totalLiters || 0
        });

        const pData = Object.entries(latest.categories).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        }));
        setPieData(pData);

        const newInsights = [];
        if (data.length >= 3) {
            const last3 = data.slice(-3);
            const isIncreasing = last3[2].totalLiters > last3[1].totalLiters && last3[1].totalLiters > last3[0].totalLiters;
            const isDecreasing = last3[2].totalLiters < last3[1].totalLiters && last3[1].totalLiters < last3[0].totalLiters;
            if (isIncreasing) newInsights.push("Usage has increased steadily over the last 3 weeks. Consider reviewing your optimization goals.");
            else if (isDecreasing) newInsights.push("Excellent work! Your consumption has been consistently declining for 3 consecutive weeks.");
        }
        const topCat = Object.entries(latest.categories).sort((a, b) => b[1] - a[1])[0];
        newInsights.push(`${topCat[0].charAt(0).toUpperCase() + topCat[0].slice(1)} is currently your highest contributor, accounting for ${Math.round((topCat[1]/latest.totalLiters)*100)}% of total usage.`);
        setInsights(newInsights);
    };

    const chartData = history.slice(-6).map(h => ({
        week: new Date(h.weekStarting).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        usage: h.totalLiters
    }));

    const barData = history.slice(-4).map(h => ({
        week: new Date(h.weekStarting).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        bathing: h.categories.bathing,
        kitchen: h.categories.kitchen,
        toilet: h.categories.toilet,
        washing: h.categories.washing,
        gardening: h.categories.gardening
    }));

    return (
        <PageWrapper
            title="Intelligence Insights"
            subtitle="Deep comparative analysis of your water lifecycle."
            loading={loading}
            actions={
                <Card hover={false} className="py-4 px-8 border-white/5 flex items-center gap-6 min-w-[320px]">
                    <div className={`p-4 rounded-3xl ${stats.trendDirection === 'down' ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}`}>
                        {stats.trendDirection === 'down' ? <TrendingDown size={32} /> : <TrendingUp size={32} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`text-4xl font-black italic tracking-tighter ${stats.trendDirection === 'down' ? 'text-green-400' : 'text-red-400'}`}>
                                {stats.trendDirection === 'down' ? '-' : '+'}<AnimatedNumber value={stats.trend} decimals={1} />%
                            </span>
                            {stats.trendDirection === 'down' ? <ArrowDownRight className="text-green-400 w-8 h-8" /> : <ArrowUpRight className="text-red-400 w-8 h-8" />}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">Week-over-week Delta</p>
                    </div>
                </Card>
            }
        >
            {/* 1. Main Trajectory Chart */}
            <Card className="p-10">
                <div className="mb-12 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black italic uppercase flex items-center gap-3">
                            <TrendingUp className="text-blue-500" /> Consumption Gradient
                        </h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">Total weekly liters • 6-Week High-Resolution Trajectory</p>
                    </div>
                    <div className="px-5 py-2 glass rounded-2xl border-white/5 text-[10px] font-black tracking-widest text-blue-400">
                        ANALYTICS ENGINE v2.4
                    </div>
                </div>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer width="99%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis 
                                dataKey="week" 
                                stroke="#4b5563" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                tick={{fontWeight: 900}}
                            />
                            <YAxis 
                                stroke="#4b5563" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(v) => `${v}L`}
                                tick={{fontWeight: 900}}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '1.5rem',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                                }}
                                itemStyle={{ color: '#fff', fontWeight: 900 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="usage" 
                                stroke="#3b82f6" 
                                strokeWidth={6} 
                                dot={{ r: 8, fill: '#3b82f6', strokeWidth: 4, stroke: '#020617' }}
                                activeDot={{ r: 10, strokeWidth: 0, shadow: '0 0 20px #3b82f6' }}
                                animationDuration={2000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* 2. Comparative Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card delay={0.2} className="p-10">
                    <div className="mb-10">
                        <h3 className="text-xl font-black italic uppercase flex items-center gap-3">
                            <BarChart3 className="text-emerald-400" /> Category Benchmarking
                        </h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">Grouped Comparison • 4-Cycle Intensity Delta</p>
                    </div>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer width="99%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="week" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} tick={{fontWeight: 900}} />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '1.5rem' 
                                    }} 
                                />
                                <Bar dataKey="bathing" fill={COLORS[0]} radius={[6, 6, 0, 0]} animationDuration={1000} />
                                <Bar dataKey="kitchen" fill={COLORS[1]} radius={[6, 6, 0, 0]} animationDuration={1200} />
                                <Bar dataKey="toilet" fill={COLORS[2]} radius={[6, 6, 0, 0]} animationDuration={1400} />
                                <Bar dataKey="washing" fill={COLORS[3]} radius={[6, 6, 0, 0]} animationDuration={1600} />
                                <Bar dataKey="gardening" fill={COLORS[4]} radius={[6, 6, 0, 0]} animationDuration={1800} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card delay={0.3} className="p-10 flex flex-col items-center">
                    <div className="w-full mb-10 text-center lg:text-left">
                        <h3 className="text-xl font-black italic uppercase flex items-center gap-3 justify-center lg:justify-start">
                            <PieIcon className="text-fuchsia-500" /> Footprint Split
                        </h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2 text-center lg:text-left">Current cycle contribution intensity</p>
                    </div>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer width="99%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={90}
                                    outerRadius={130}
                                    paddingAngle={10}
                                    dataKey="value"
                                    animationDuration={2000}
                                    animationBegin={300}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]} 
                                            stroke="rgba(0,0,0,0.4)"
                                            strokeWidth={4}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '1.5rem' 
                                    }} 
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* 3. Trend Observations */}
            <div className="space-y-6 pt-10 pb-20">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <Sparkles className="text-blue-500 w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tight">AI Observations</h3>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Heuristic pattern detection engine</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {insights.map((insight, idx) => (
                        <Card key={idx} delay={idx * 0.1 + 0.4} className="p-8 flex items-start gap-6 border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                            <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/10 shrink-0">
                                <Activity className="text-blue-400 w-6 h-6" />
                            </div>
                            <p className="text-gray-300 font-bold italic leading-relaxed text-lg tracking-tight">"{insight}"</p>
                        </Card>
                    ))}
                </div>
            </div>
        </PageWrapper>
    );
};

export default Insights;
