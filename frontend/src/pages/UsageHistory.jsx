import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Activity, Calendar, ChevronRight, Droplet, History, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';

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

    return (
        <PageWrapper
            title="Usage History"
            subtitle="Detailed log of all your water consumption entries."
            loading={loading}
        >
            <Card className="p-0 overflow-hidden">
                <div className="p-8 pb-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/10">
                        <Activity className="text-purple-400 w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">Comprehensive Log</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                <th className="px-8 py-5 font-black">Week Starting</th>
                                <th className="px-8 py-5 font-black">Total Usage</th>
                                <th className="px-8 py-5 font-black">Household</th>
                                <th className="px-8 py-5 font-black">Status</th>
                                <th className="px-8 py-5 font-black text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {usageData.map((u, i) => (
                                <motion.tr 
                                    key={i} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 + 0.2 }}
                                    className="group hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <span className="font-bold text-gray-200">
                                                {new Date(u.weekStarting).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-black text-xl italic">
                                            <AnimatedNumber value={u.totalLiters} />L
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-gray-400 font-medium">
                                        {u.numPeople} {u.numPeople === 1 ? 'Resident' : 'Residents'}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${u.leakAlert ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]'}`}>
                                            {u.leakAlert ? 'Anomalous' : 'Optimal'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Button 
                                            variant="ghost"
                                            onClick={() => navigate('/dashboard')} 
                                            className="p-3 bg-white/5 hover:bg-blue-500/10 group/btn"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover/btn:text-blue-400 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {usageData.length === 0 && !loading && (
                    <div className="py-32 text-center animate-in fade-in zoom-in duration-700">
                        <div className="relative inline-block mb-6">
                            <History className="w-20 h-20 text-gray-800" />
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-1 -right-1"
                            >
                                <Plus className="w-8 h-8 text-blue-500" />
                            </motion.div>
                        </div>
                        <h4 className="text-3xl font-black italic tracking-tight text-white mb-3">No Records Found</h4>
                        <p className="text-gray-500 max-w-xs mx-auto font-medium">Your efficiency journey hasn't started yet. Initialize your first log to begin monitoring.</p>
                        <Button 
                            className="mt-10 mx-auto"
                            onClick={() => navigate('/usage')}
                        >
                            Log Weekly Usage
                        </Button>
                    </div>
                )}
            </Card>
        </PageWrapper>
    );
};

export default UsageHistory;
