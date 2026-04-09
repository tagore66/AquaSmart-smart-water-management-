import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Activity, Calendar, ChevronRight, ChevronLeft, 
    LayoutDashboard, Plus, Bell, Zap, History, LogOut, Droplet
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';


const UsageHistory = () => {
    const [usageData, setUsageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await axios.get('/usage');
                setUsageData(data);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return (
        <div className="flex flex-col ml-20 md:ml-64 p-6 md:p-10 space-y-10 min-h-screen">
            <header className="pb-6 border-b border-white/5">
                <div className="skeleton h-10 w-64 mb-4"></div>
                <div className="skeleton h-6 w-96"></div>
            </header>
            <div className="skeleton h-96 w-full rounded-2xl"></div>
        </div>
    );

    return (
        <div className="flex bg-slate-950 min-h-screen text-white">
            <Navbar />
            
            <main className="flex-1 ml-20 md:ml-64 p-6 md:p-10 space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight text-gradient">Usage History</h1>
                        <p className="text-gray-400 text-lg">Detailed log of all your water consumption entries.</p>
                    </div>
                </header>

                <div className="glass-card">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Activity className="text-purple-400 w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold">Comprehensive Log</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-sm border-b border-white/5">
                                    <th className="pb-4 font-medium uppercase tracking-wider">Week Starting</th>
                                    <th className="pb-4 font-medium uppercase tracking-wider">Total Usage</th>
                                    <th className="pb-4 font-medium uppercase tracking-wider">Household</th>
                                    <th className="pb-4 font-medium uppercase tracking-wider">Status</th>
                                    <th className="pb-4 font-medium uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {usageData.map((u, i) => (
                                    <motion.tr 
                                        key={i} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4 font-medium">
                                            <div className="flex items-center gap-3 text-white">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                {new Date(u.weekStarting).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="font-bold text-lg">{u.totalLiters.toLocaleString()}L</span>
                                        </td>
                                        <td className="py-4 text-gray-400">
                                            {u.numPeople} {u.numPeople === 1 ? 'Person' : 'People'}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${u.leakAlert ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                                {u.leakAlert ? 'Anomalous' : 'Normal'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button 
                                                onClick={() => navigate('/dashboard')} 
                                                className="p-2 hover:bg-blue-500/20 rounded-lg transition-all group-hover:translate-x-1"
                                            >
                                                <ChevronRight className="w-5 h-5 text-blue-400" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {usageData.length === 0 && (
                        <div className="py-20 text-center">
                            <Droplet className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-pulse" />
                            <h4 className="text-xl font-bold text-gray-400">No History Found</h4>
                            <p className="text-gray-500 mt-2">Start adding your weekly usage to see the history here.</p>
                            <Link to="/usage" className="btn-primary mt-6 inline-block">Add Usage Data</Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UsageHistory;
