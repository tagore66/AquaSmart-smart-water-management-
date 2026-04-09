import React, { useEffect, useState } from 'react';
import { 
    AlertTriangle, Bell, CheckCircle, Info, 
    ChevronRight, Calendar, Trash2, Shield,
    Droplet, TrendingUp, Activity
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';


const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Healthy');

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await axios.get('/alerts');
                setAlerts(response.data);
                
                // Determine status
                const activeAlerts = response.data.filter(a => !a.isRead && a.severity === 'high');
                if (activeAlerts.length > 0) {
                    setStatus('Risk');
                } else if (response.data.some(a => !a.isRead)) {
                    setStatus('Warning');
                } else {
                    setStatus('Healthy');
                }
            } catch (error) {
                console.error('Error fetching alerts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`/alerts/${id}`);
            setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
        } catch (error) {
            console.error('Error marking alert as read:', error);
        }
    };

    const getStatusColor = () => {
        switch(status) {
            case 'Risk': return 'text-red-400 border-red-500/20 bg-red-500/5';
            case 'Warning': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5';
            default: return 'text-green-400 border-green-500/20 bg-green-500/5';
        }
    };

    if (loading) return (
        <div className="flex flex-col ml-20 md:ml-64 p-6 md:p-10 space-y-10 min-h-screen">
            <header className="pb-6 border-b border-white/5">
                <div className="skeleton h-10 w-64 mb-2"></div>
                <div className="skeleton h-6 w-96"></div>
            </header>
            <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map(n => <div key={n} className="skeleton h-32 w-full rounded-2xl"></div>)}
            </div>
        </div>
    );

    return (
        <div className="flex bg-slate-950 min-h-screen text-white">
            <Navbar />
            
            <main className="flex-1 ml-20 md:ml-64 p-6 md:p-10 space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight text-gradient">Security & Alerts</h1>
                        <p className="text-gray-400 text-lg">System monitoring and anomaly detection.</p>
                    </div>
                    <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${getStatusColor()}`}>
                        {status === 'Healthy' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <span className="font-bold tracking-wider uppercase">System Status: {status}</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                        {alerts.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card flex flex-col items-center justify-center p-20 text-center space-y-6"
                            >
                                <div className="p-6 bg-green-500/10 rounded-full">
                                    <Shield className="w-16 h-16 text-green-400" />
                                </div>
                                <div className="max-w-md">
                                    <h2 className="text-2xl font-bold mb-2">No Active Threats</h2>
                                    <p className="text-gray-400 mb-8">Your water management system is running smoothly. No leaks or high usage detected.</p>
                                </div>
                            </motion.div>
                        ) : (
                            alerts.map((alert, idx) => (
                                <motion.div 
                                    key={alert._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`glass-card p-6 flex items-start gap-6 border-l-4 ${
                                        alert.isRead ? 'opacity-60 border-gray-500' : 
                                        alert.severity === 'high' ? 'border-red-500' : 'border-yellow-500'
                                    }`}
                                >
                                    <div className={`p-4 rounded-2xl ${
                                        alert.type === 'leak' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                                    }`}>
                                        {alert.type === 'leak' ? (
                                            <Droplet className={`w-8 h-8 ${alert.isRead ? 'text-gray-400' : 'text-red-400'}`} />
                                        ) : (
                                            <AlertTriangle className={`w-8 h-8 ${alert.isRead ? 'text-gray-400' : 'text-yellow-400'}`} />
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className={`text-xl font-bold ${alert.isRead ? 'text-gray-400' : 'text-white'}`}>
                                                {alert.title}
                                            </h3>
                                            <span className="text-sm text-gray-500">
                                                {new Date(alert.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 leading-relaxed max-w-2xl">
                                            {alert.message}
                                        </p>
                                        {!alert.isRead && (
                                            <button 
                                                onClick={() => markAsRead(alert._id)}
                                                className="mt-4 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group"
                                            >
                                                Mark as resolved <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Alerts;
