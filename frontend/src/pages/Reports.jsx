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
                        clonedReport.style.width = '800px';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
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
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-6 rounded-3xl flex items-center gap-4 border ${success
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}
                    >
                        {success ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <span className="font-bold tracking-tight">{success || error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <Card className="p-8">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <Calendar className="text-blue-400" /> SELECT WEEK
                        </h3>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                            {history.map((h, idx) => (
                                <button
                                    key={h._id}
                                    onClick={() => setSelectedWeek(h._id)}
                                    className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${selectedWeek === h._id
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20'
                                        : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="text-left">
                                        <p className="font-black italic text-sm">
                                            {new Date(h.weekStarting).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${selectedWeek === h._id ? 'rotate-90 scale-125' : ''}`} />
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Button
                        disabled={!reportData || generating}
                        onClick={generatePDF}
                        className="w-full py-6 text-xl"
                        icon={generating ? Loader2 : Download}
                    >
                        {generating ? 'Processing Engine...' : 'DOWNLOAD PDF'}
                    </Button>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-2">
                    <div className="sticky top-10 flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2">
                            <Sparkles className="text-blue-400 w-4 h-4" />
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Report Preview Studio</h3>
                        </div>
                        
                        <div className="glass shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] rounded-[3rem] overflow-hidden border-white/10">
                            <div className="h-[600px] overflow-y-auto p-10 custom-scrollbar scroll-smooth">
                                <div
                                    ref={reportRef}
                                    data-report-container="true"
                                    className="bg-slate-950 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative w-full min-w-[650px]"
                                >
                                    {/* Report Header */}
                                    <div className="p-10 bg-gradient-to-br from-blue-700 to-blue-600 text-white flex justify-between items-center relative">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                                                <Droplet className="w-8 h-8 fill-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black italic tracking-tighter">AQUASMART</h2>
                                                <p className="font-black text-[10px] tracking-[0.3em] uppercase text-blue-100">Verified Intelligence</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black italic">{weekLabel}</p>
                                            <p className="text-[10px] font-black opacity-60 tracking-widest text-blue-100">ID: {selectedWeek?.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="p-12 space-y-12">
                                        {/* Usage Hero */}
                                        <div className="text-center py-10 rounded-[3rem] bg-white/[0.02] border border-white/5">
                                            <p className="text-[10px] uppercase font-black tracking-[0.5em] text-gray-600 mb-4">Weekly Consumption</p>
                                            <div className="text-7xl font-black italic tracking-tighter text-white leading-none">
                                                {reportData?.totalLiters} <span className="text-2xl not-italic font-black text-blue-500 tracking-normal ml-2">LITRES</span>
                                            </div>
                                            <div className="mt-8 flex justify-center">
                                                <div className="px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-3">
                                                    <TrendingDown className="w-4 h-4 text-blue-400" />
                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Analytics Engine Active</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-6">
                                            {[
                                                { label: 'EFFICIENCY', value: `${Math.min(100, Math.round(((135 * reportData?.numPeople * 7) / reportData?.totalLiters) * 100))}%`, color: 'text-blue-400', sub: 'vs Benchmark' },
                                                { label: 'STABILITY', value: reportData?.totalLiters < (135 * reportData?.numPeople * 7) ? 'PEAK' : 'BASE', color: 'text-green-400', sub: 'Health Status' },
                                                { label: 'PRIMARY', value: reportData ? Object.entries(reportData.categories).reduce((a, b) => a[1] > b[1] ? a : b)[0].toUpperCase() : '...', color: 'text-yellow-400', sub: 'Top Consumer' }
                                            ].map((stat, i) => (
                                                <div key={i} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 text-center">
                                                    <p className="text-[8px] font-black tracking-widest text-gray-600 mb-2 uppercase">{stat.label}</p>
                                                    <p className={`text-2xl font-black italic mb-1 ${stat.color}`}>{stat.value}</p>
                                                    <p className="text-[10px] font-bold text-gray-500 tracking-tight">{stat.sub}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Chart & Table */}
                                        <div className="grid grid-cols-2 gap-12">
                                            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-gray-500 mb-8">
                                                    <PieIcon className="w-5 h-5 text-blue-400" /> Split Matrix
                                                </h4>
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={chartData}
                                                                innerRadius={50}
                                                                outerRadius={80}
                                                                paddingAngle={10}
                                                                dataKey="value"
                                                                isAnimationActive={false}
                                                            >
                                                                {chartData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Distribution</h4>
                                                {chartData.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                            <span className="text-sm font-bold text-gray-400 italic">{item.name}</span>
                                                        </div>
                                                        <span className="font-black text-white">{item.value}L</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* AI Studio */}
                                        <div className="space-y-8">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-purple-400">
                                                <Brain className="w-5 h-5" /> AI Intelligence Studio
                                            </h4>
                                            <div className="space-y-4">
                                                {aiReport.loading ? (
                                                    <div className="p-10 text-center italic text-gray-500 font-bold tracking-tight">Synchronizing neural logs...</div>
                                                ) : aiReport.suggestions.map((s, idx) => (
                                                    <div key={idx} className="p-6 rounded-3xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-4">
                                                        <Zap className="w-5 h-5 text-purple-400 mt-1 shrink-0" />
                                                        <p className="text-sm font-bold text-gray-300 leading-relaxed italic">"{s.replace(/^- /, '')}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Summary */}
                                        <div className="p-10 rounded-[3rem] bg-slate-900/50 border border-white/5 relative">
                                            <Sparkles className="absolute top-6 right-8 text-blue-500/20 w-12 h-12" />
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6">Executive Summary</h4>
                                            <p className="text-lg font-bold text-white leading-relaxed italic">
                                                {aiReport.loading ? 'Generating final brief...' : aiReport.summary}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer Branding */}
                                    <div className="p-10 bg-slate-900 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 opacity-60 italic">
                                        <span>AquaSmart Core v2.8 / 64-Bit Analytics</span>
                                        <span>Certified Authentic</span>
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
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="glass max-w-md w-full p-12 text-center space-y-10 relative overflow-hidden rounded-[3rem] border-t-8 border-blue-600"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-pulse"></div>

                            <div className="w-28 h-28 bg-blue-600/10 rounded-[3rem] flex items-center justify-center mx-auto ring-8 ring-blue-600/5 transition-transform hover:scale-110 duration-500">
                                <Send className="w-14 h-14 text-blue-500" />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter">DATA EXPORTED</h3>
                                <p className="text-gray-400 font-bold leading-relaxed">
                                    Final report successfully generated. Synchronize to cloud mail server now?
                                </p>
                                <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-400" />
                                    <p className="text-blue-400 font-black text-xs tracking-[0.2em]">{user?.email?.toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowEmailModal(false)}
                                    className="py-5"
                                >
                                    IGOR
                                </Button>
                                <Button
                                    onClick={handleEmailReport}
                                    disabled={emailing}
                                    className="py-5"
                                    icon={emailing ? Loader2 : Send}
                                >
                                    {emailing ? 'SYNCING...' : 'YES'}
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
