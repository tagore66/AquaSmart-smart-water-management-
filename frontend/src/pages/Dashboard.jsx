import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Droplet, TrendingUp, AlertTriangle, IndianRupee, 
    Plus, Calendar, ChevronRight, Activity, 
    PieChart as PieIcon, BarChart as BarIcon, 
    Zap, CreditCard, History, LayoutDashboard, LogOut, Lightbulb, Bell, Shield
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
} from 'recharts';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AIChatBot from '../components/AIChatBot';

const COLORS = ['#38bdf8', '#4ade80', '#fbbf24', '#a78bfa', '#10b981'];

const Dashboard = () => {
    const [usageData, setUsageData] = useState([]);
    const [latestUsage, setLatestUsage] = useState(null);
    const [latestBill, setLatestBill] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [historyRes, latestRes, billsRes, alertsRes] = await Promise.all([
                    axios.get('/usage'),
                    axios.get('/usage/latest'),
                    axios.get('/bills'),
                    axios.get('/alerts')
                ]);
                setUsageData(historyRes.data);
                setLatestUsage(latestRes.data);
                setAlerts(alertsRes.data);
                if (billsRes.data.length > 0) {
                    setLatestBill(billsRes.data[0]);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const hasActiveAlerts = alerts && alerts.length > 0 && alerts.some(a => !a.isRead);
    const systemStatus = hasActiveAlerts ? 'Risk' : 'Healthy';

    if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading AquaSmart...</div>;

    const chartData = (latestUsage && latestUsage.categories) ? Object.entries(latestUsage.categories).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    })) : [];

    const trendData = (usageData && usageData.length > 0) ? [...usageData].reverse().map(u => ({
        name: new Date(u.weekStarting).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        liters: u.totalLiters
    })) : [];

    return (
        <div className="flex bg-slate-950 min-h-screen text-white">
            <Navbar />
            
            <main className="flex-1 ml-20 md:ml-64 p-6 md:p-10 space-y-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight">Control Center</h1>
                        <p className="text-gray-400 text-lg">Real-time overview of your water lifecycle.</p>
                    </div>
                </header>

                {!latestUsage ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card flex flex-col items-center justify-center p-20 text-center space-y-6"
                    >
                        <div className="p-6 bg-blue-500/10 rounded-full">
                            <Droplet className="w-16 h-16 text-blue-400" />
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-2xl font-bold mb-2 font-outfit">No Data Available Yet</h2>
                            <p className="text-gray-400 mb-8 font-inter">Start your journey towards water efficiency by entering your first weekly usage data.</p>
                            <Link to="/usage" className="btn-primary inline-flex items-center gap-2">
                                Enter First Data <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-10">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <motion.div whileHover={{ y: -5 }} className="glass-card border-l-4 border-blue-400">
                                <p className="text-gray-400 text-sm font-medium mb-1">Total Weekly Usage</p>
                                <div className="flex items-end gap-2">
                                    <h3 className="text-3xl font-bold">{latestUsage.totalLiters || 0}L</h3>
                                    <div className={`flex items-center text-sm mb-1 ${latestUsage.leakAlert ? 'text-red-400' : 'text-green-400'}`}>
                                        {latestUsage.leakAlert ? <AlertTriangle className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                                        <span>{latestUsage.leakAlert ? 'High' : 'Stable'}</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div whileHover={{ y: -5 }} className="glass-card border-l-4 border-green-400">
                                <p className="text-gray-400 text-sm font-medium mb-1">Daily Average</p>
                                <h3 className="text-3xl font-bold">{Math.round((latestUsage.totalLiters || 0) / 7)}L</h3>
                                <p className="text-xs text-gray-500 mt-2">Based on current week</p>
                            </motion.div>

                            <motion.div whileHover={{ y: -5 }} className="glass-card border-l-4 border-yellow-400">
                                <p className="text-gray-400 text-sm font-medium mb-1">Current Bill</p>
                                <div className="flex items-center gap-2">
                                    <IndianRupee className="w-6 h-6 text-yellow-400" />
                                    <h3 className="text-3xl font-bold">₹{latestBill?.amount || '0'}</h3>
                                </div>
                                <p className={`text-xs mt-2 ${latestBill?.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {latestBill?.status || 'Pending'}
                                </p>
                            </motion.div>

                            <motion.div 
                                whileHover={{ y: -5 }} 
                                className={`glass-card border-l-4 transition-colors cursor-pointer ${hasActiveAlerts ? 'border-red-500 bg-red-500/5' : 'border-green-400'}`}
                                onClick={() => window.location.href = '/alerts'}
                            >
                                <p className="text-gray-400 text-sm font-medium mb-1">System Security</p>
                                <div className={`flex items-center gap-2 ${hasActiveAlerts ? 'text-red-400' : 'text-green-400'}`}>
                                    {hasActiveAlerts ? <AlertTriangle className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                                    <h3 className="text-xl font-bold uppercase">{systemStatus}</h3>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    {hasActiveAlerts ? `${alerts.filter(a => !a.isRead).length} Active Alerts` : 'Monitoring Active'}
                                </p>
                            </motion.div>
                        </div>

                        {/* Middle Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Pie Chart */}
                            <div className="glass-card">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <PieIcon className="text-blue-400 w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-bold">Consumption Map</h3>
                                    </div>
                                    <span className="text-sm text-gray-400">This Week</span>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={8}
                                                dataKey="value"
                                                animationDuration={1500}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Suggestions Summary */}
                            <div className="glass-card">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-400/10 rounded-lg">
                                            <Zap className="text-yellow-400 w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-bold">Quick Insights</h3>
                                    </div>
                                    <Link to="/suggestions" className="text-sm text-blue-400 hover:underline">View All</Link>
                                </div>
                                <div className="space-y-4">
                                    {latestUsage && latestUsage.suggestions && latestUsage.suggestions.slice(0, 3).map((s, i) => (
                                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-yellow-400/10 rounded-lg mt-1 group-hover:scale-110 transition-transform">
                                                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">{s.category}</p>
                                                    <p className="text-white line-clamp-2 leading-relaxed">{s.tip}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
            {latestUsage && <AIChatBot usageData={latestUsage} onShowReport={() => window.location.href = '/reports'} />}
        </div>
    );
};

export default Dashboard;
