import React, { useEffect, useState } from 'react';
import { 
    AlertTriangle, CheckCircle, ChevronRight, Droplet, Shield, Activity, Bell
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Healthy');

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await axios.get('/alerts');
                setAlerts(response.data);
                
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

    const getStatusStyles = () => {
        switch(status) {
            case 'Risk': return 'text-red-400 border-red-500/20 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]';
            case 'Warning': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.1)]';
            default: return 'text-green-400 border-green-500/20 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]';
        }
    };

    return (
        <PageWrapper
            title="Security & Alerts"
            subtitle="Real-time system monitoring and anomaly detection engine."
            loading={loading}
            actions={
                <div className={`px-8 py-3 rounded-full border flex items-center gap-3 transition-all duration-700 ${getStatusStyles()}`}>
                    {status === 'Healthy' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className={`w-5 h-5 ${status === 'Risk' ? 'animate-pulse' : ''}`} />}
                    <span className="font-black tracking-[0.2em] uppercase text-[10px]">Guard: {status}</span>
                </div>
            }
        >
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {alerts.length === 0 && !loading ? (
                        <Card className="flex flex-col items-center justify-center py-40 text-center space-y-8 animate-in fade-in zoom-in duration-700">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
                                <div className="relative p-10 bg-white/5 rounded-[3rem] border border-white/10">
                                    <Shield className="w-20 h-20 text-green-400" />
                                </div>
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="absolute -top-4 -right-4 p-3 bg-green-500/20 rounded-full"
                                >
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                </motion.div>
                            </div>
                            <div className="max-w-md space-y-4">
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase">No Active Threats</h2>
                                <p className="text-gray-500 font-medium leading-relaxed italic">"The core infrastructure is currently operating within optimal parameters. High-fidelity sensors report zero anomalies."</p>
                            </div>
                        </Card>
                    ) : (
                        alerts.map((alert, idx) => (
                            <Card 
                                key={alert._id}
                                delay={idx * 0.1}
                                className={`p-8 flex items-start gap-8 transition-all duration-500 ${
                                    alert.isRead ? 'opacity-40 grayscale-[0.5]' : 
                                    alert.severity === 'high' ? 'border-l-red-500/50 bg-gradient-to-r from-red-500/5 to-transparent' : 'border-l-yellow-500/50 bg-gradient-to-r from-yellow-500/5 to-transparent'
                                }`}
                            >
                                <div className={`p-5 rounded-[2rem] border transition-all duration-500 ${
                                    alert.isRead ? 'bg-white/5 border-white/5' :
                                    alert.type === 'leak' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'
                                }`}>
                                    {alert.type === 'leak' ? (
                                        <Droplet className={`w-10 h-10 ${alert.isRead ? 'text-gray-500' : 'text-red-400'}`} />
                                    ) : (
                                        <AlertTriangle className={`w-10 h-10 ${alert.isRead ? 'text-gray-500' : 'text-yellow-400'}`} />
                                    )}
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h3 className={`text-2xl font-black italic tracking-tight ${alert.isRead ? 'text-gray-500' : 'text-white'}`}>
                                                {alert.title.toUpperCase()}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-600 uppercase">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(alert.createdAt).toLocaleString()}
                                                </div>
                                                <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${alert.severity === 'high' ? 'border-red-500/20 text-red-500/60' : 'border-yellow-500/20 text-yellow-500/60'}`}>
                                                    {alert.severity} PRIORITY
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {!alert.isRead && (
                                            <Button 
                                                variant="secondary"
                                                onClick={() => markAsRead(alert._id)}
                                                className="px-6 py-2 text-xs"
                                                icon={ChevronRight}
                                            >
                                                RESOLVE
                                            </Button>
                                        )}
                                    </div>
                                    <p className={`text-lg font-medium leading-relaxed italic ${alert.isRead ? 'text-gray-600' : 'text-gray-400'}`}>
                                        "{alert.message}"
                                    </p>
                                </div>
                            </Card>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    );
};

export default Alerts;
