import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Calendar, Download, Mail, CheckCircle2,
    AlertTriangle, Loader2, ChevronRight, Droplet,
    PieChart as PieIcon, IndianRupee, Send, Sparkles, Shield,
    Brain, Zap, TrendingDown, Leaf
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import PageWrapper from '../components/layout/PageWrapper';

const COLORS = ['#38bdf8', '#4ade80', '#fbbf24', '#a78bfa', '#10b981'];

const Reports = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWeek, setSelectedWeek] = useState('');
    const [reportData, setReportData] = useState(null);
    const [billData, setBillData] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailing, setEmailing] = useState(false);
    const [lastPdfBase64, setLastPdfBase64] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [aiReport, setAiReport] = useState({
        summary: '',
        suggestions: [],
        impact: '',
        loading: false
    });

    const reportRef = useRef();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await axios.get('/usage');
                setHistory(data);
                if (data.length > 0) {
                    setSelectedWeek(data[0]._id);
                }
            } catch (err) {
                console.error('Error fetching history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        if (selectedWeek) {
            const week = history.find(h => h._id === selectedWeek);
            setReportData(week);

            const fetchBill = async () => {
                try {
                    const { data } = await axios.get('/bills');
                    const matchingBill = data.find(b => {
                        const billUsageId = b.usage?._id || b.usage;
                        return billUsageId === selectedWeek;
                    });
                    setBillData(matchingBill || null);
                } catch (err) {
                    console.error('Error fetching bills:', err);
                }
            };

            const fetchAIInsights = async () => {
                setAiReport(prev => ({ ...prev, loading: true }));
                try {
                    const { data } = await axios.post('/ai/report', { usageData: week });
                    const content = data.report;
                    const sections = content.split('\n## ');

                    setAiReport({
                        summary: sections[0]?.replace(/^# .*\n/, '').trim() || 'Analysis pending...',
                        suggestions: sections.find(s => s.toLowerCase().includes('priority'))?.split('\n').filter(l => l.trim().startsWith('-')) || [],
                        impact: sections.find(s => s.toLowerCase().includes('impact') || s.toLowerCase().includes('saving'))?.trim() || 'Calculating ecological footprint...',
                        loading: false
                    });
                } catch (err) {
                    console.error('AI Insights failed:', err);
                    setAiReport(prev => ({ ...prev, loading: false }));
                }
            };

            fetchBill();
            fetchAIInsights();
        }
    }, [selectedWeek, history]);

    const generatePDF = async () => {
        setGenerating(true);
        setError('');

        try {
            const reportElement = reportRef.current;
            await new Promise(resolve => setTimeout(resolve, 300));

            const canvas = await html2canvas(reportElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#0c111d',
                scrollX: 0,
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight,
                logging: false,
                onclone: (clonedDoc) => {
                    const clonedReport = clonedDoc.querySelector('[data-report-container="true"]');
                    if (clonedReport) {
                        clonedReport.style.height = 'auto';
                        clonedReport.style.maxHeight = 'none';
                        clonedReport.style.overflow = 'visible';
                        clonedReport.style.width = '750px';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width / 2, canvas.height / 2]
            });

            pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
            const dateStr = new Date(reportData.weekStarting).toISOString().split('T')[0];
            const safeName = `AquaSmart_Report_${dateStr}.pdf`;

            pdf.save(safeName);
            const base64 = pdf.output('datauristring');
            setLastPdfBase64(base64);
            setShowEmailModal(true);

            return base64;
        } catch (err) {
            console.error('PDF Generation failed:', err);
            setError(`Report generation failed: ${err.message}`);
        } finally {
            setGenerating(false);
        }
    };

    const handleEmailReport = async () => {
        setEmailing(true);
        try {
            const weekLabel = new Date(reportData.weekStarting).toLocaleDateString(undefined, {
                month: 'long', day: 'numeric', year: 'numeric'
            });
            await axios.post('/reports/email', {
                pdfBase64: lastPdfBase64,
                weekLabel
            });
            setSuccess('Report sent to your email!');
            setShowEmailModal(false);
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError('Failed to email report');
        } finally {
            setEmailing(false);
        }
    };

    const chartData = reportData
        ? Object.entries(reportData.categories).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        }))
        : [];

    const weekLabel = reportData
        ? new Date(reportData.weekStarting).toLocaleDateString(undefined, {
            month: 'long', day: 'numeric', year: 'numeric'
        })
        : '';

    return (
        <PageWrapper
            title="Intelligence Reports"
            subtitle="Downloadable performance and consumption metrics."
            loading={loading}
        >
            <AnimatePresence>
                {(error || success) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        className={`p-4 rounded-2xl flex items-center gap-4 border text-sm transition-all ${success
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}
                    >
                        {success ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <span className="font-bold tracking-tight uppercase">{success || error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="space-y-6">
                    <Card className="p-6 border-white/5">
                        <h3 className="text-[10px] font-black tracking-[0.2em] mb-6 flex items-center gap-3 text-gray-400 uppercase">
                            <Calendar className="text-blue-500 w-4 h-4" /> Select Lifecycle Week
                        </h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                            {history.map((h, idx) => (
                                <button
                                    key={h._id}
                                    onClick={() => setSelectedWeek(h._id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-500 ${selectedWeek === h._id
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="text-left leading-none">
                                        <p className="font-black italic text-xs uppercase tracking-tighter">
                                            {new Date(h.weekStarting).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-500 ${selectedWeek === h._id ? 'rotate-90 scale-110' : ''}`} />
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Button
                        disabled={!reportData || generating}
                        onClick={generatePDF}
                        className="w-full py-4 text-sm font-black italic tracking-tighter uppercase"
                        icon={generating ? Loader2 : Download}
                    >
                        {generating ? 'Processing Engine...' : 'EXPORT PERFORMANCE PDF'}
                    </Button>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-2">
                    <div className="sticky top-10 flex flex-col gap-3">
                        <div className="flex items-center gap-3 px-2">
                            <Sparkles className="text-blue-400 w-3.5 h-3.5" />
                            <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">Report Preview Studio</h3>
                        </div>
                        
                        <div className="glass shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] rounded-[2.5rem] overflow-hidden border-white/10">
                            <div className="h-[550px] overflow-y-auto p-8 custom-scrollbar scroll-smooth">
                                <div
                                    ref={reportRef}
                                    data-report-container="true"
                                    className="bg-slate-950 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden relative w-full min-w-[600px] mx-auto"
                                >
                                    {/* Report Header */}
                                    <div className="p-8 bg-gradient-to-br from-blue-700 to-blue-600 text-white flex justify-between items-center relative">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                                <Droplet className="w-6 h-6 fill-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black italic tracking-tighter">AQUASMART</h2>
                                                <p className="font-black text-[8px] tracking-[0.3em] uppercase text-blue-100/60">Verified Analytics</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black italic mb-0.5">{weekLabel}</p>
                                            <p className="text-[9px] font-black opacity-40 tracking-widest text-blue-100 uppercase">ID: {selectedWeek?.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="p-10 space-y-10">
                                        {/* Usage Hero */}
                                        <div className="text-center py-8 rounded-[2rem] bg-white/[0.01] border border-white/5 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <p className="text-[9px] uppercase font-black tracking-[0.5em] text-gray-600 mb-3 relative z-10">Weekly Consumption Meta</p>
                                            <div className="text-6xl font-black italic tracking-tighter text-white leading-none relative z-10">
                                                {reportData?.totalLiters} <span className="text-xl not-italic font-black text-blue-500 tracking-normal ml-1.5">L</span>
                                            </div>
                                            <div className="mt-6 flex justify-center relative z-10">
                                                <div className="px-5 py-1.5 bg-blue-500/10 border border-blue-500/10 rounded-full flex items-center gap-2">
                                                    <TrendingDown className="w-3.5 h-3.5 text-blue-400" />
                                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mt-0.5">Telemetry Active</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-5">
                                            {[
                                                { label: 'EFFICIENCY', value: `${Math.min(100, Math.round(((135 * reportData?.numPeople * 7) / reportData?.totalLiters) * 100))}%`, color: 'text-blue-400', sub: 'vs Benchmark' },
                                                { label: 'STABILITY', value: reportData?.totalLiters < (135 * reportData?.numPeople * 7) ? 'PEAK' : 'BASE', color: 'text-green-400', sub: 'Health Check' },
                                                { label: 'PRIMARY', value: reportData ? Object.entries(reportData.categories).reduce((a, b) => a[1] > b[1] ? a : b)[0].toUpperCase() : '...', color: 'text-yellow-400', sub: 'Top Sector' }
                                            ].map((stat, i) => (
                                                <div key={i} className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 text-center">
                                                    <p className="text-[7.5px] font-black tracking-widest text-gray-600 mb-1.5 uppercase">{stat.label}</p>
                                                    <p className={`text-xl font-black italic mb-0.5 ${stat.color}`}>{stat.value}</p>
                                                    <p className="text-[9px] font-bold text-gray-500 tracking-tight leading-none">{stat.sub}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Chart & Table */}
                                        <div className="grid grid-cols-2 gap-10">
                                            <div className="p-6 rounded-[2rem] bg-white/[0.01] border border-white/5">
                                                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-gray-500 mb-6">
                                                    <PieIcon className="w-4 h-4 text-blue-500" /> Split Index
                                                </h4>
                                                <div className="h-56">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={chartData}
                                                                innerRadius={45}
                                                                outerRadius={70}
                                                                paddingAngle={8}
                                                                dataKey="value"
                                                                isAnimationActive={false}
                                                            >
                                                                {chartData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                                                                ))}
                                                            </Pie>
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                            <div className="space-y-2.5">
                                                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-5">Sector Distribution</h4>
                                                {chartData.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                            <span className="text-xs font-bold text-gray-400 italic leading-none">{item.name}</span>
                                                        </div>
                                                        <span className="font-black text-sm text-white leading-none italic">{item.value}L</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* AI Studio */}
                                        <div className="space-y-6">
                                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2.5 text-purple-400">
                                                <Brain className="w-4 h-4" /> Cognitive Analysis Matrix
                                            </h4>
                                            <div className="space-y-3">
                                                {aiReport.loading ? (
                                                    <div className="p-8 text-center italic text-gray-600 text-[10px] font-bold tracking-tight">Accessing core neural logs...</div>
                                                ) : aiReport.suggestions.map((s, idx) => (
                                                    <div key={idx} className="p-4 rounded-2xl bg-purple-500/[0.02] border border-purple-500/10 flex items-start gap-3.5">
                                                        <Zap className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                                                        <p className="text-xs font-bold text-gray-400 leading-relaxed italic">"{s.replace(/^- /, '')}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Summary */}
                                        <div className="p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Sparkles className="text-blue-500 w-10 h-10" />
                                            </div>
                                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4">Core Briefing</h4>
                                            <p className="text-base font-bold text-gray-300 leading-relaxed italic">
                                                {aiReport.loading ? 'Synchronizing final brief...' : aiReport.summary}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer Branding */}
                                    <div className="p-8 bg-slate-900/80 flex justify-between items-center text-[7.5px] font-black uppercase tracking-[0.4em] text-gray-600 italic">
                                        <span>AquaSmart Core v3.2 / High-Bit Telemetry</span>
                                        <span>Authentication Certified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Modal */}
            <AnimatePresence>
                {showEmailModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/85 backdrop-blur-3xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 30 }}
                            className="glass max-w-sm w-full p-10 text-center space-y-8 relative overflow-hidden rounded-[2.5rem] border-t-8 border-blue-600"
                        >
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>

                            <div className="w-20 h-20 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mx-auto ring-4 ring-blue-600/5">
                                <Send className="w-10 h-10 text-blue-500" />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">TELEMETRY EXPORTED</h3>
                                <p className="text-gray-500 text-xs font-bold leading-relaxed px-4">
                                    Report generation finalized. Dispatch to cloud mail protocol?
                                </p>
                                <div className="p-3 bg-blue-600/5 border border-blue-500/10 rounded-xl flex items-center justify-center gap-2 mx-4">
                                    <Mail className="w-3.5 h-3.5 text-blue-500/60" />
                                    <p className="text-blue-400 font-black text-[9px] tracking-[0.1em]">{user?.email?.toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowEmailModal(false)}
                                    className="py-3 text-[10px] uppercase font-black tracking-widest text-gray-500 border-white/5 hover:text-white"
                                >
                                    ABORT
                                </Button>
                                <Button
                                    onClick={handleEmailReport}
                                    disabled={emailing}
                                    className="py-3 text-[10px] uppercase font-black tracking-widest italic"
                                    icon={emailing ? Loader2 : Send}
                                >
                                    {emailing ? 'SYNC' : 'DISPATCH'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

export default Reports;
