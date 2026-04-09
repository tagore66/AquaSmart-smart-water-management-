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
            if (isIncreasing) newInsights.push("Usage has increased steadily over the last 3 weeks. Review optimization goals.");
            else if (isDecreasing) newInsights.push("Excellent work! Your consumption has been consistently declining for 3 cycles.");
        }
        const topCat = Object.entries(latest.categories).sort((a, b) => b[1] - a[1])[0];
        newInsights.push(`${topCat[0].charAt(0).toUpperCase() + topCat[0].slice(1)} is currently your highest consumer, accounting for ${Math.round((topCat[1]/latest.totalLiters)*100)}% of total usage.`);
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
                <Card hover={false} className="py-2.5 px-6 border-white/5 flex items-center gap-4 min-w-[240px]">
                    <div className={`p-2.5 rounded-xl ${stats.trendDirection === 'down' ? 'bg-green-500/10 text-green-400 border border-green-500/10' : 'bg-red-500/10 text-red-400 border border-red-500/10'}`}>
                        {stats.trendDirection === 'down' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 leading-none mb-0.5">
                            <span className={`text-2xl font-black italic tracking-tighter ${stats.trendDirection === 'down' ? 'text-green-400' : 'text-red-400'}`}>
                                {stats.trendDirection === 'down' ? '-' : '+'}<AnimatedNumber value={stats.trend} decimals={1} />%
                            </span>
                            {stats.trendDirection === 'down' ? <ArrowDownRight className="text-green-400 w-5 h-5" /> : <ArrowUpRight className="text-red-400 w-5 h-5" />}
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 leading-none">Wk-over-Wk Delta</p>
                    </div>
                </Card>
            }
        >
            {/* 1. Main Trajectory Chart */}
            <Card className="p-8">
                <div className="mb-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-black italic uppercase flex items-center gap-2.5">
                            <TrendingUp className="text-blue-500 w-5 h-5" /> Consumption Gradient
                        </h2>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1.5 leading-none">Total weekly liters • 6-Week High-Res Trajectory</p>
                    </div>
                    <div className="px-3.5 py-1.5 glass rounded-xl border-white/5 text-[8px] font-black tracking-widest text-blue-400 uppercase">
                        Analytics Engine active
                    </div>
                </div>
                <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="99%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis 
                                dataKey="week" 
                                stroke="#4b5563" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false}
                                tick={{fontWeight: 900, textTransform: 'uppercase'}}
                            />
                            <YAxis 
                                stroke="#4b5563" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(v) => `${v}L`}
                                tick={{fontWeight: 900}}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '1rem',
                                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.6)',
                                    fontSize: '11px',
                                    fontWeight: '900'
                                }}
                                itemStyle={{ color: '#fff', textTransform: 'uppercase' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="usage" 
                                stroke="#3b82f6" 
                                strokeWidth={5} 
                                dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#020617' }}
                                activeDot={{ r: 8, strokeWidth: 0, shadow: '0 0 15px #3b82f6' }}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* 2. Comparative Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card delay={0.2} className="p-8">
                    <div className="mb-8">
                        <h3 className="text-lg font-black italic uppercase flex items-center gap-2.5">
                            <BarChart3 className="text-emerald-400 w-5 h-5" /> Category Index
                        </h3>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1.5 leading-none">Intensity Comparison • 4-Cycle Delta</p>
                    </div>
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer width="99%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="week" stroke="#4b5563" fontSize={9} tickLine={false} axisLine={false} tick={{fontWeight: 900}} />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '1rem',
                                        fontSize: '11px'
                                    }} 
                                    itemStyle={{ fontWeight: '900', textTransform: 'uppercase' }}
                                />
                                <Bar dataKey="bathing" fill={COLORS[0]} radius={[4, 4, 0, 0]} animationDuration={1000} />
                                <Bar dataKey="kitchen" fill={COLORS[1]} radius={[4, 4, 0, 0]} animationDuration={1200} />
                                <Bar dataKey="toilet" fill={COLORS[2]} radius={[4, 4, 0, 0]} animationDuration={1400} />
                                <Bar dataKey="washing" fill={COLORS[3]} radius={[4, 4, 0, 0]} animationDuration={1600} />
                                <Bar dataKey="gardening" fill={COLORS[4]} radius={[4, 4, 0, 0]} animationDuration={1800} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card delay={0.3} className="p-8 flex flex-col items-center">
                    <div className="w-full mb-8 text-center lg:text-left">
                        <h3 className="text-lg font-black italic uppercase flex items-center gap-2.5 justify-center lg:justify-start">
                            <PieIcon className="text-fuchsia-500 w-5 h-5" /> Footprint Split
                        </h3>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1.5 text-center lg:text-left leading-none">Current cycle contribution split</p>
                    </div>
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer width="99%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationDuration={1500}
                                    animationBegin={300}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]} 
                                            stroke="rgba(0,0,0,0.3)"
                                            strokeWidth={3}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '1rem',
                                        fontSize: '11px'
                                    }} 
                                />
                                <Legend wrapperStyle={{ paddingTop: '15px', fontWeight: '900', fontSize: '9px', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* 3. Trend Observations */}
            <div className="space-y-4 pt-8 pb-10">
                <div className="flex items-center gap-2.5 px-2">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/10">
                        <Sparkles className="text-blue-500 w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">AI Protocols</h3>
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-0.5 leading-none">Heuristic pattern detection active</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {insights.map((insight, idx) => (
                        <Card key={idx} delay={idx * 0.1 + 0.4} className="p-6 flex items-start gap-5 border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                            <div className="p-2.5 bg-blue-600/10 rounded-lg border border-blue-500/10 shrink-0 mt-0.5">
                                <Activity className="text-blue-400 w-4 h-4" />
                            </div>
                            <p className="text-gray-400 font-bold italic leading-relaxed text-sm tracking-tight group-hover:text-white transition-colors">"{insight}"</p>
                        </Card>
                    ))}
                </div>
            </div>
        </PageWrapper>
    );
};

export default Insights;
