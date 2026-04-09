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
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

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

    if (loading) {
        return (
            <div className="flex flex-col ml-0 sm:ml-20 md:ml-64 p-6 md:p-12 pb-28 sm:pb-10 space-y-10 min-h-screen">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
                    <div>
                        <div className="skeleton h-6 w-32 mb-2"></div>
                        <div className="skeleton h-12 w-96"></div>
                    </div>
                    <div className="skeleton h-32 w-[320px] rounded-[30px]"></div>
                </div>
                <div className="skeleton h-96 w-full rounded-2xl"></div>
            </div>
        );
    }

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
        <div className="flex bg-slate-950 min-h-screen text-white">
            <Navbar />
            <main className="flex-1 ml-0 sm:ml-20 md:ml-64 p-6 md:p-12 pb-28 sm:pb-10 space-y-10 overflow-y-auto">
                {/* Hero Trend Metric */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="text-blue-500 w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-[0.4em] text-gray-500">Live Comparative Analysis</span>
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Intelligence <span className="text-gradient">Insights</span></h1>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-[30px] p-6 flex items-center gap-6 min-w-[320px]">
                        <div className={`p-4 rounded-2xl ${stats.trendDirection === 'down' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {stats.trendDirection === 'down' ? <TrendingDown size={32} /> : <TrendingUp size={32} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-3xl font-black italic ${stats.trendDirection === 'down' ? 'text-green-400' : 'text-red-400'}`}>
                                    {stats.trendDirection === 'down' ? '-' : '+'}{stats.trend.toFixed(1)}%
                                </span>
                                {stats.trendDirection === 'down' ? <ArrowDownRight className="text-green-400" /> : <ArrowUpRight className="text-red-400" />}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Vs Previous Week Consumption</p>
                        </div>
                    </div>
                </div>

                {/* 1. Weekly Usage Line Chart (MAIN) */}
                <div className="glass-card">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black italic uppercase flex items-center gap-3">
                            <TrendingUp className="text-blue-500" /> Consumption Gradient
                        </h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Total weekly liters • 6-Week Trajectory</p>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="99%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px' }}
                                    itemStyle={{ color: '#fff', fontWeight: 900 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="usage" 
                                    stroke="#3b82f6" 
                                    strokeWidth={4} 
                                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Secondary Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-card">
                        <div className="mb-8">
                            <h3 className="text-xl font-black italic uppercase flex items-center gap-3">
                                <BarChart3 className="text-green-400" /> Category Benchmarking
                            </h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Grouped Comparison • 4-Week Delta</p>
                        </div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer width="99%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="week" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '15px' }} />
                                    <Bar dataKey="bathing" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="kitchen" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="toilet" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="washing" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="gardening" fill={COLORS[4]} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-card flex flex-col items-center">
                        <div className="w-full mb-8">
                            <h3 className="text-xl font-black italic uppercase flex items-center gap-3">
                                <PieIcon className="text-fuchsia-500" /> Footprint Distribution
                            </h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Current week contribution by source</p>
                        </div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer width="99%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '15px' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. Trend Observations */}
                <div className="space-y-4 pb-20">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-blue-500" />
                        <h3 className="text-2xl font-black italic uppercase">Automated Observations</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights.map((insight, idx) => (
                            <div key={idx} className="p-6 rounded-[30px] bg-white/5 border border-white/10 flex items-start gap-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg shrink-0 mt-1">
                                    <Calendar className="text-blue-400 w-4 h-4" />
                                </div>
                                <p className="text-gray-400 font-medium leading-relaxed">{insight}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Insights;
