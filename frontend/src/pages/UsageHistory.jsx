import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Calendar, ChevronDown, Droplet, History, Plus,
    TrendingUp, TrendingDown, Users, IndianRupee, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';

const COLORS = ['#38bdf8', '#4ade80', '#fbbf24', '#a78bfa', '#10b981'];

const UsageHistory = () => {
    const [usageData, setUsageData] = useState([]);
    const [billsData, setBillsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const [usageRes, billsRes] = await Promise.all([
                    axios.get('/usage'),
                    axios.get('/bills')
                ]);
                
                // Keep data sorted exactly as came from DB (should be desc)
                setUsageData(usageRes.data);
                setBillsData(billsRes.data);
            } catch (error) {
                console.error('Error fetching history/bills:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const toggleRow = (id) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    // Helper functions for stats
    const getTrend = (currentIndex) => {
        if (currentIndex === usageData.length - 1) return null; // No previous data
        const current = usageData[currentIndex].totalLiters;
        const previous = usageData[currentIndex + 1].totalLiters;
        const diff = current - previous;
        const percent = (diff / previous) * 100;
        return { diff, percent };
    };

    const getAlerts = (u, currentIndex) => {
        let leakAlert = false;
        let highUsageAlert = false;
        if (u.totalLiters > 5000) highUsageAlert = true;
        
        const trend = getTrend(currentIndex);
        if (trend && trend.percent > 30) leakAlert = true;
        
        return { leakAlert, highUsageAlert };
    };

    return (
        <PageWrapper
            title="Usage History"
            subtitle="Detailed log of all your water consumption entries."
            loading={loading}
        >
            <Card className="p-0 overflow-hidden border-white/5 bg-[#0b1c3d]">
                <div className="p-6 pb-4 flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/10">
                        <Activity className="text-purple-400 w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white">Industrial Records Log</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                <th className="px-6 py-4 font-black">Week Starting</th>
                                <th className="px-6 py-4 font-black">Usage Volume</th>
                                <th className="px-6 py-4 font-black">Household</th>
                                <th className="px-6 py-4 font-black">Telemetry Status</th>
                                <th className="px-6 py-4 font-black text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {usageData.map((u, i) => {
                                const isExpanded = expandedRowId === u._id;
                                const { leakAlert, highUsageAlert } = getAlerts(u, i);
                                const hasAlert = leakAlert || highUsageAlert;
                                const bill = billsData.find(b => b.usage === u._id);
                                const trend = getTrend(i);
                                
                                const chartData = u.categories ? Object.entries(u.categories).map(([name, value]) => ({
                                    name: name.charAt(0).toUpperCase() + name.slice(1),
                                    value
                                })) : [];

                                return (
                                    <React.Fragment key={u._id || i}>
                                        <motion.tr 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 + 0.1 }}
                                            onClick={() => toggleRow(u._id)}
                                            className={`group hover:bg-white/[0.04] transition-colors cursor-pointer ${isExpanded ? 'bg-white/[0.02]' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                                    </div>
                                                    <span className="font-bold text-sm text-gray-200">
                                                        {new Date(u.weekStarting).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-black text-lg italic leading-none text-white">
                                                    <AnimatedNumber value={u.totalLiters} />L
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-bold text-xs">
                                                {u.numPeople} {u.numPeople === 1 ? 'Resident' : 'Residents'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-widest ${hasAlert ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                                    {hasAlert ? 'Anomaly' : 'Stable'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <motion.div 
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="inline-flex p-2 bg-white/5 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                >
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                </motion.div>
                                            </td>
                                        </motion.tr>

                                        {/* EXPANDABLE ANALYTICS ROW */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan="5" className="p-0 border-0">
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                                            className="overflow-hidden bg-black/20 backdrop-blur-md border-b border-white/5"
                                                        >
                                                            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                
                                                                {/* Alerts Banner (if any) */}
                                                                {hasAlert && (
                                                                    <div className="lg:col-span-2 flex items-start gap-4 p-4 rounded-xl border border-orange-500/30 bg-orange-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                                                                        <AlertTriangle className="w-6 h-6 text-orange-400 shrink-0" />
                                                                        <div>
                                                                            <h4 className="text-sm font-black text-orange-400 uppercase tracking-widest">System Alert Warning</h4>
                                                                            <p className="text-sm text-orange-200/80 mt-1">
                                                                                {leakAlert && `A rapid usage spike (${trend?.percent.toFixed(1)}%) was detected. `}
                                                                                {highUsageAlert && `Total consumption exceeded the high-usage threshold of 5000L. `}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Chart Container */}
                                                                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col items-center">
                                                                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest self-start mb-2">Usage Distribution</h4>
                                                                    <div className="h-48 w-full relative">
                                                                        <ResponsiveContainer width="100%" height="100%">
                                                                            <PieChart>
                                                                                <Pie
                                                                                    data={chartData}
                                                                                    innerRadius={45}
                                                                                    outerRadius={65}
                                                                                    paddingAngle={5}
                                                                                    dataKey="value"
                                                                                    animationDuration={1000}
                                                                                >
                                                                                    {chartData.map((entry, index) => (
                                                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" />
                                                                                    ))}
                                                                                </Pie>
                                                                                <Tooltip 
                                                                                    contentStyle={{ backgroundColor: 'rgba(11, 28, 61, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                                                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                                                                />
                                                                            </PieChart>
                                                                        </ResponsiveContainer>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                                                                        {chartData.map((entry, index) => (
                                                                            <div key={index} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                                                                {entry.name}: {Math.round((entry.value/u.totalLiters)*100)}%
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Cards Grid */}
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    {/* Weekly Summary */}
                                                                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between group hover:bg-white/10 transition-colors">
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                                                                <Droplet className="w-4 h-4" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-4">
                                                                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Total Consumption</p>
                                                                            <p className="text-2xl font-black italic text-white flex items-center gap-2">
                                                                                {u.totalLiters} <span className="text-sm font-bold text-gray-500 not-italic">Liters</span>
                                                                            </p>
                                                                            {trend && (
                                                                                <p className={`text-[10px] font-bold flex items-center mt-2 ${trend.percent > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                                                    {trend.percent > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                                                                    {Math.abs(trend.percent).toFixed(1)}% vs prev week
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Household Insights */}
                                                                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between group hover:bg-white/10 transition-colors">
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                                                                <Users className="w-4 h-4" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-4">
                                                                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Daily Average</p>
                                                                            <p className="text-xl md:text-2xl font-black italic text-white flex items-center gap-1.5 md:gap-2">
                                                                                {Math.round(u.totalLiters / 7 / u.numPeople)} <span className="text-xs md:text-sm font-bold text-gray-500 not-italic whitespace-nowrap">L / Person</span>
                                                                            </p>
                                                                            <p className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-2 ${Math.round(u.totalLiters / 7 / u.numPeople) > 150 ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                                                                                {Math.round(u.totalLiters / 7 / u.numPeople) > 150 ? 'High Usage' : 'Optimal'}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Payment Details (Spans 2 columns) */}
                                                                    <div className="col-span-2 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 p-5 rounded-2xl flex items-center justify-between">
                                                                        <div>
                                                                            <p className="text-[9px] font-black uppercase text-indigo-300 tracking-widest mb-1">Weekly Invoice</p>
                                                                            {bill ? (
                                                                                <div className="flex items-end gap-3 flex-wrap">
                                                                                    <p className="text-2xl font-black italic text-white flex items-center">
                                                                                        <IndianRupee className="w-5 h-5 mr-0.5 mt-0.5" />{bill.amount}
                                                                                    </p>
                                                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 mb-1.5 rounded-md ${bill.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                                                        {bill.status}
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-sm font-medium text-gray-400">Processing bill data...</p>
                                                                            )}
                                                                        </div>
                                                                        {bill && bill.status !== 'Paid' && (
                                                                            <Button 
                                                                                onClick={() => navigate(`/bills/${bill._id}`)}
                                                                                className="px-4 py-2 text-xs"
                                                                            >
                                                                                Pay Now
                                                                            </Button>
                                                                        )}
                                                                        {bill && bill.status === 'Paid' && (
                                                                            <div className="flex flex-col items-end">
                                                                                <CheckCircle className="w-6 h-6 text-green-500 mb-1" />
                                                                                <span className="text-[10px] text-gray-500 font-bold italic border-b border-gray-600/30 pb-0.5">Settled: {new Date(bill.updatedAt).toLocaleDateString()}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {usageData.length === 0 && !loading && (
                    <div className="py-24 text-center">
                        <div className="relative inline-block mb-4">
                            <History className="w-16 h-16 text-white/5" />
                        </div>
                        <h4 className="text-2xl font-black italic tracking-tighter text-white mb-2 uppercase">Zero Records</h4>
                        <p className="text-gray-500 max-w-[240px] mx-auto text-xs font-medium leading-relaxed italic">Initialize your telemetry protocols to begin historical monitoring.</p>
                        <Button 
                            className="mt-8 mx-auto py-2.5 px-6 font-black"
                            onClick={() => navigate('/usage')}
                        >
                            Log First Entry
                        </Button>
                    </div>
                )}
            </Card>
        </PageWrapper>
    );
};

export default UsageHistory;
