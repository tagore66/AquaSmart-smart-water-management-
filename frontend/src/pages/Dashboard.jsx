import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Droplet, TrendingUp, AlertTriangle, IndianRupee, 
    ChevronRight, Activity, 
    PieChart as PieIcon, 
    Zap, Shield, Lightbulb
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
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
                <Card className="flex flex-col items-center justify-center py-24 text-center border-white/5 relative overflow-hidden">
                    {/* Decorative Background */ }
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <div className="relative mb-8 mt-4">
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
                            />
                            <div className="relative p-7 bg-white/5 border border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-md">
                                <Activity className="w-14 h-14 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
                            </div>
                        </div>

                        <div className="max-w-md space-y-4">
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white drop-shadow-md">Awaiting Data</h2>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed italic mb-4">
                                Your engine is standing by. Initialize the analytics by logging your first set of water usage data points.
                            </p>
                            
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-6"
                            >
                                <Button 
                                    onClick={() => navigate('/usage')}
                                    className="px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-blue-500/30 transition-all"
                                    icon={ChevronRight}
                                >
                                    Add Usage
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </Card>
            ) : (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <Card delay={0.1} className="border-l-4 border-blue-500 p-5">
                            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1.5 leading-none">Weekly Usage</p>
                            <div className="flex items-end gap-2 leading-none">
                                <h3 className="text-3xl font-black italic">
                                    <AnimatedNumber value={latestUsage.totalLiters || 0} suffix="L" />
                                </h3>
                                <div className={`flex items-center text-[10px] pb-1 font-black uppercase tracking-tight ${latestUsage.leakAlert ? 'text-red-500' : 'text-green-500'}`}>
                                    {latestUsage.leakAlert ? <AlertTriangle className="w-3 h-3 mr-0.5" /> : <TrendingUp className="w-3 h-3 mr-0.5" />}
                                    <span>{latestUsage.leakAlert ? 'Risk' : 'Steady'}</span>
                                </div>
                            </div>
                        </Card>

                        <Card delay={0.2} className="border-l-4 border-green-500 p-5">
                            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1.5 leading-none">Daily Average</p>
                            <h3 className="text-3xl font-black italic leading-none">
                                <AnimatedNumber value={Math.round((latestUsage.totalLiters || 0) / 7)} suffix="L" />
                            </h3>
                            <p className="text-[10px] text-gray-600 font-bold mt-2 tracking-widest">REAL-TIME</p>
                        </Card>

                        <Card delay={0.3} className="border-l-4 border-yellow-500 p-5">
                            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1.5 leading-none">Estimated Bill</p>
                            <div className="flex items-center gap-1.5 leading-none">
                                <h3 className="text-3xl font-black italic flex items-center">
                                    <IndianRupee className="w-5 h-5 mr-0.5 mt-0.5" />
                                    <AnimatedNumber value={latestBill?.amount || 0} />
                                </h3>
                            </div>
                            <p className={`text-[10px] font-black mt-2 tracking-widest uppercase ${latestBill?.status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                {latestBill?.status || 'PENDING'}
                            </p>
                        </Card>

                        <Card 
                            delay={0.4} 
                            className={`border-l-4 cursor-pointer p-5 transition-all ${hasActiveAlerts ? 'border-red-500 bg-red-500/5' : 'border-blue-500'}`}
                            onClick={() => navigate('/alerts')}
                        >
                            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1.5 leading-none">Security Status</p>
                            <div className={`flex items-center gap-2.5 leading-none ${hasActiveAlerts ? 'text-red-500' : 'text-green-500'}`}>
                                {hasActiveAlerts ? <AlertTriangle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">{systemStatus}</h3>
                            </div>
                            <p className="text-[10px] text-gray-600 font-bold mt-2 tracking-widest">
                                {hasActiveAlerts ? `${alerts.filter(a => !a.isRead).length} ANOMALIES` : 'ALL FLOWS NOMINAL'}
                            </p>
                        </Card>
                    </div>

                    {/* Middle Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <Card delay={0.5} className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/10 rounded-xl">
                                        <PieIcon className="text-blue-500 w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight">Consumption Matrix</h3>
                                </div>
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">This Week</span>
                            </div>
                            <div className="h-64 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={6}
                                            dataKey="value"
                                            animationDuration={1500}
                                            animationBegin={300}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={COLORS[index % COLORS.length]}
                                                    stroke="rgba(255,255,255,0.02)"
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                                backdropFilter: 'blur(12px)',
                                                border: '1px solid rgba(255,255,255,0.1)', 
                                                borderRadius: '1rem', 
                                                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.6)',
                                                fontSize: '12px',
                                                fontWeight: '900'
                                            }}
                                            itemStyle={{ color: '#fff', textTransform: 'uppercase' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '15px', fontWeight: '900', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <Droplet className="text-blue-500/10 w-8 h-8" />
                                </div>
                            </div>
                        </Card>

                        {/* Suggestions Summary */}
                        <Card delay={0.6} className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/10 rounded-xl">
                                        <Zap className="text-yellow-500 w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight">AI Protocols</h3>
                                </div>
                                <Button variant="ghost" onClick={() => navigate('/suggestions')} className="text-[9px] font-black tracking-widest uppercase py-1 px-3">
                                    Expand <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {latestUsage && latestUsage.suggestions && latestUsage.suggestions.slice(0, 3).map((s, i) => (
                                    <div key={i} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.05] transition-all group cursor-default">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-blue-500/10 rounded-lg mt-0.5 border border-blue-500/10 group-hover:scale-105 transition-transform">
                                                <Lightbulb className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[8px] font-black text-blue-500/60 mb-1 uppercase tracking-[0.2em]">{s.category}</p>
                                                <p className="text-gray-300 font-medium text-sm leading-relaxed italic line-clamp-1 group-hover:text-white transition-colors">"{s.tip}"</p>
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
