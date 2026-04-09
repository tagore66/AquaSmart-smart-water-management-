import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Droplet, TrendingUp, AlertTriangle, IndianRupee, 
    Plus, ChevronRight, Activity, 
    PieChart as PieIcon, BarChart as BarIcon, 
    Zap, CreditCard, History, LayoutDashboard, LogOut, Lightbulb, Bell, Shield
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AIChatBot from '../components/AIChatBot';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import PageWrapper from '../components/layout/PageWrapper';

const COLORS = ['#38bdf8', '#4ade80', '#fbbf24', '#a78bfa', '#10b981'];

const Dashboard = () => {
    const navigate = useNavigate();
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

    const chartData = (latestUsage && latestUsage.categories) ? Object.entries(latestUsage.categories).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    })) : [];

    return (
        <PageWrapper 
            title="Control Center" 
            subtitle="Real-time overview of your water lifecycle."
            loading={loading}
        >
            {!latestUsage ? (
                <Card className="flex flex-col items-center justify-center p-20 text-center space-y-8">
                    <div className="p-8 bg-blue-500/10 rounded-full">
                        <Droplet className="w-16 h-16 text-blue-400" />
                    </div>
                    <div className="max-w-md space-y-4">
                        <h2 className="text-3xl font-bold italic">No Data Available Yet</h2>
                        <p className="text-gray-400 text-lg">Start your journey towards water efficiency by entering your first weekly usage data.</p>
                        <Button 
                            onClick={() => navigate('/usage')}
                            className="mt-4"
                            icon={ChevronRight}
                        >
                            Enter First Data
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="space-y-10">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card delay={0.1} className="border-l-4 border-blue-400">
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Weekly Usage</p>
                            <div className="flex items-end gap-2">
                                <h3 className="text-4xl font-black">
                                    <AnimatedNumber value={latestUsage.totalLiters || 0} suffix="L" />
                                </h3>
                                <div className={`flex items-center text-sm mb-1 font-bold ${latestUsage.leakAlert ? 'text-red-400' : 'text-green-400'}`}>
                                    {latestUsage.leakAlert ? <AlertTriangle className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                                    <span>{latestUsage.leakAlert ? 'High' : 'Stable'}</span>
                                </div>
                            </div>
                        </Card>

                        <Card delay={0.2} className="border-l-4 border-green-400">
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Daily Average</p>
                            <h3 className="text-4xl font-black">
                                <AnimatedNumber value={Math.round((latestUsage.totalLiters || 0) / 7)} suffix="L" />
                            </h3>
                            <p className="text-[10px] text-gray-500 font-bold mt-2 tracking-widest">CURRENT CYCLE</p>
                        </Card>

                        <Card delay={0.3} className="border-l-4 border-yellow-400">
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Estimated Bill</p>
                            <div className="flex items-center gap-2">
                                <h3 className="text-4xl font-black flex items-center">
                                    <IndianRupee className="w-6 h-6 mr-1" />
                                    <AnimatedNumber value={latestBill?.amount || 0} />
                                </h3>
                            </div>
                            <p className={`text-[10px] font-bold mt-2 tracking-widest ${latestBill?.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {latestBill?.status?.toUpperCase() || 'PENDING'}
                            </p>
                        </Card>

                        <Card 
                            delay={0.4} 
                            className={`border-l-4 cursor-pointer ${hasActiveAlerts ? 'border-red-500 bg-red-500/5' : 'border-blue-400'}`}
                            onClick={() => navigate('/alerts')}
                        >
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">System Status</p>
                            <div className={`flex items-center gap-3 ${hasActiveAlerts ? 'text-red-400' : 'text-green-400'}`}>
                                {hasActiveAlerts ? <AlertTriangle className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                                <h3 className="text-2xl font-black uppercase italic">{systemStatus}</h3>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold mt-2 tracking-widest">
                                {hasActiveAlerts ? `${alerts.filter(a => !a.isRead).length} ISSUES DETECTED` : 'ALL SYSTEMS NOMINAL'}
                            </p>
                        </Card>
                    </div>

                    {/* Middle Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pie Chart */}
                        <Card delay={0.5}>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-500/10 rounded-xl">
                                        <PieIcon className="text-blue-400 w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight">Consumption Map</h3>
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dynamic Distribution</span>
                            </div>
                            <div className="h-80 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="value"
                                            animationDuration={2000}
                                            animationBegin={500}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={COLORS[index % COLORS.length]}
                                                    stroke="rgba(255,255,255,0.05)"
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255,255,255,0.1)', 
                                                borderRadius: '1.5rem', 
                                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' 
                                            }}
                                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <Droplet className="text-blue-500/20 w-12 h-12" />
                                </div>
                            </div>
                        </Card>

                        {/* Suggestions Summary */}
                        <Card delay={0.6}>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-yellow-400/10 rounded-xl">
                                        <Zap className="text-yellow-400 w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight">AI Insights</h3>
                                </div>
                                <Button variant="ghost" onClick={() => navigate('/suggestions')}>
                                    View All <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-5">
                                {latestUsage && latestUsage.suggestions && latestUsage.suggestions.slice(0, 3).map((s, i) => (
                                    <div key={i} className="p-5 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-blue-500/20 hover:bg-white/10 transition-all group cursor-default">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-500/10 rounded-xl mt-1 border border-blue-500/10 group-hover:scale-110 transition-transform">
                                                <Lightbulb className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-blue-500/80 mb-2 uppercase tracking-[0.2em]">{s.category}</p>
                                                <p className="text-white font-medium line-clamp-2 leading-relaxed italic">"{s.tip}"</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}
            <AnimatePresence>
                {latestUsage && <AIChatBot usageData={latestUsage} onShowReport={() => navigate('/reports')} />}
            </AnimatePresence>
        </PageWrapper>
    );
};

export default Dashboard;
