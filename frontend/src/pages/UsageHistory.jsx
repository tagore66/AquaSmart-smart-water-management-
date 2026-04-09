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
            <Card className="p-0 overflow-hidden border-white/5">
                <div className="p-6 pb-4 flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/10">
                        <Activity className="text-purple-400 w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Industrial Records Log</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                <th className="px-6 py-4 font-black">Week Starting</th>
                                <th className="px-6 py-4 font-black">Usage Volume</th>
                                <th className="px-6 py-4 font-black">Household</th>
                                <th className="px-6 py-4 font-black">Telemetry Status</th>
                                <th className="px-6 py-4 font-black text-right">Review</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {usageData.map((u, i) => (
                                <motion.tr 
                                    key={i} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 + 0.1 }}
                                    className="group hover:bg-white/[0.02] transition-colors"
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
                                        <span className="font-black text-lg italic leading-none">
                                            <AnimatedNumber value={u.totalLiters} />L
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-bold text-xs">
                                        {u.numPeople} {u.numPeople === 1 ? 'Resident' : 'Residents'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-widest ${u.leakAlert ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                            {u.leakAlert ? 'Anomaly' : 'Stable'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button 
                                            variant="ghost"
                                            onClick={() => navigate('/dashboard')} 
                                            className="p-2 h-auto w-auto bg-white/5 hover:bg-blue-500/10 group/btn"
                                        >
                                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover/btn:text-blue-500 transition-transform group-hover/btn:translate-x-0.5" />
                                        </Button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {usageData.length === 0 && !loading && (
                    <div className="py-24 text-center animate-in fade-in zoom-in duration-500">
                        <div className="relative inline-block mb-4">
                            <History className="w-16 h-16 text-white/5" />
                            <motion.div 
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ repeat: Infinity, duration: 2.5 }}
                                className="absolute -top-1 -right-1"
                            >
                                <Plus className="w-6 h-6 text-blue-500/40" />
                            </motion.div>
                        </div>
                        <h4 className="text-2xl font-black italic tracking-tighter text-white mb-2 uppercase">Zero Records</h4>
                        <p className="text-gray-500 max-w-[240px] mx-auto text-xs font-medium leading-relaxed italic">Initialize your telemetry protocols to begin historical monitoring.</p>
                        <Button 
                            className="mt-8 mx-auto py-2.5 px-6 text-xs uppercase italic tracking-tighter font-black"
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
