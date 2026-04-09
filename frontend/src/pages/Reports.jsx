import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Calendar, Download, Mail, CheckCircle2,
    AlertTriangle, Loader2, ChevronRight, Droplet,
    PieChart as PieIcon, IndianRupee, Printer, Send, X, Info, Sparkles, Shield, User,
    Brain, Zap, TrendingDown, Leaf
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#38bdf8', '#4ade80', '#fbbf24', '#a78bfa', '#10b981'];

const Reports = () => {
    const { user } = useAuth();
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

    // AI States
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
                        // Support both populated and unpopulated usage field
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
                    // Basic parsing of the markdown response
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
            
            // 1. Prepare for high-quality capture
            // We capture the visible element directly to ensure all styles and charts match preview exactly.
            // Using a delay to ensure everything is settled.
            await new Promise(resolve => setTimeout(resolve, 300));

            const canvas = await html2canvas(reportElement, {
                scale: 2, // Higher scale for crisp text and graphics
                useCORS: true,
                backgroundColor: '#0c111d', // Match the report container background exactly
                scrollX: 0,
                scrollY: -window.scrollY, // Correct for page scroll position
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight,
                logging: false,
                onclone: (clonedDoc) => {
                    // Force the cloned element to be fully expanded in the virtual capture space
                    const clonedReport = clonedDoc.querySelector('[data-report-container="true"]');
                    if (clonedReport) {
                        clonedReport.style.height = 'auto';
                        clonedReport.style.maxHeight = 'none';
                        clonedReport.style.overflow = 'visible';
                        clonedReport.style.width = '800px'; // Standard width for the report
                    }
                }
            });

            // 2. Build PDF from canvas with dynamic height to prevent cut-offs
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width / 2, canvas.height / 2] // Standardize to CSS pixels
            });

            pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);

            // 3. Generate a safe filename
            const dateStr = new Date(reportData.weekStarting).toISOString().split('T')[0];
            const safeName = `AquaSmart_Report_${dateStr}.pdf`;

            // 4. Save and trigger modal
            pdf.save(safeName);
            
            // Generate clean base64 for the backend
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

    if (loading) return (
        <div className="h-screen flex items-center justify-center text-white bg-slate-950">
            GATHERING ANALYTICS...
        </div>
    );

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
        <div className="flex bg-slate-950 min-h-screen text-white">
            <Navbar />

            <main className="flex-1 ml-20 md:ml-64 p-6 md:p-10 space-y-10">
                <header className="pb-6 border-b border-white/5">
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Intelligence Reports</h1>
                    <p className="text-gray-400 text-lg">Downloadable performance and consumption metrics.</p>
                </header>

                <AnimatePresence>
                    {(error || success) && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-4 rounded-2xl flex items-center gap-4 border ${success
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-500'
                                }`}
                        >
                            {success
                                ? <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                                : <AlertTriangle className="w-5 h-5 text-[#ef4444]" />}
                            <span className="font-semibold">{success || error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        <section className="glass-card">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Calendar className="text-blue-400" /> SELECT WEEK
                            </h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                {history.map((h) => (
                                    <button
                                        key={h._id}
                                        onClick={() => setSelectedWeek(h._id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedWeek === h._id
                                            ? 'bg-blue-600 border-blue-500 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-500'
                                            }`}
                                    >
                                        <div className="text-left">
                                            <p className="font-bold text-sm">
                                                Week of {new Date(h.weekStarting).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 ${selectedWeek === h._id ? 'rotate-90' : ''}`} />
                                    </button>
                                ))}
                            </div>
                        </section>

                        <button
                            disabled={!reportData || generating}
                            onClick={generatePDF}
                            className="w-full flex items-center justify-center gap-4 p-6 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:opacity-50 rounded-3xl font-black text-xl shadow-2xl transition-all"
                        >
                            {generating
                                ? <Loader2 className="w-6 h-6 animate-spin" />
                                : <><Download className="w-6 h-6" /> DOWNLOAD PDF</>
                            }
                        </button>
                    </div>

                    {/* Preview Area — Pure Report Preview */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-10 flex justify-center">
                            <div className="w-full max-w-[700px]">
                                <div className="flex items-center gap-3 mb-4 px-2">
                                    <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Report Preview</h3>
                                </div>
                                {/* Professional Scrollable Panel */}
                                <div className="border-glow bg-slate-950/80 backdrop-blur-3xl rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                                    <div
                                        className="h-[500px] overflow-y-auto p-6 custom-scrollbar scroll-smooth"
                                    >
                                        <div
                                            ref={reportRef}
                                            data-report-container="true"
                                            style={{
                                                backgroundColor: '#0c111d',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                borderRadius: '2.5rem',
                                                overflow: 'hidden',
                                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                                position: 'relative',
                                                width: '100%',
                                                minWidth: '650px'
                                            }}
                                        >
                                            {/* 1. Header */}
                                            <div style={{
                                                padding: '2rem',
                                                color: '#ffffff',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                                                position: 'relative',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '1rem' }}>
                                                        <Droplet style={{ width: '2rem', height: '2rem', fill: '#ffffff', color: '#ffffff' }} />
                                                    </div>
                                                    <div>
                                                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.05em', color: '#ffffff', margin: 0 }}>AQUASMART</h2>
                                                        <p style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', fontSize: '8px', color: '#93c5fd', margin: 0 }}>Verified Analytics Log</p>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>{weekLabel}</p>
                                                    <p style={{ fontSize: '8px', fontWeight: 900, opacity: 0.7, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#93c5fd' }}>ID: {selectedWeek?.slice(-8).toUpperCase()}</p>
                                                </div>
                                            </div>

                                            <div style={{ padding: '3rem' }}>
                                                {/* 2. Total Usage Hero */}
                                                <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '2rem', borderRadius: '2.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <p style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.5em', color: '#4b5563', marginBottom: '1rem' }}>Total Weekly Consumption</p>
                                                    <div style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-0.05em', fontStyle: 'italic', color: '#ffffff', lineHeight: 1 }}>
                                                        {reportData?.totalLiters} <span style={{ fontSize: '1.25rem', verticalAlign: 'middle', color: '#3b82f6', letterSpacing: '0' }}>LITRES</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>
                                                            <TrendingDown size={14} style={{ color: '#3b82f6' }} />
                                                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#3b82f6' }}>WEEKLY ANALYTICS ENGINE ACTIVE</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2b. Quick Insights Grid */}
                                                {reportData && (
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                                        gap: '1.5rem',
                                                        marginBottom: '4rem'
                                                    }}>
                                                        {[
                                                            {
                                                                label: 'EFFICIENCY SCORE',
                                                                value: `${Math.min(100, Math.round(((135 * reportData.numPeople * 7) / reportData.totalLiters) * 100))}%`,
                                                                desc: 'Based on global benchmarks',
                                                                color: '#3b82f6'
                                                            },
                                                            {
                                                                label: 'SUSTAINABILITY',
                                                                value: reportData.totalLiters < (135 * reportData.numPeople * 7) ? 'OPTIMIZED' : 'BALANCED',
                                                                desc: 'Real-time footprint status',
                                                                color: '#22c55e'
                                                            },
                                                            {
                                                                label: 'TOP CONSUMER',
                                                                value: Object.entries(reportData.categories).reduce((a, b) => a[1] > b[1] ? a : b)[0].toUpperCase(),
                                                                desc: 'Primary resource draw',
                                                                color: '#a855f7'
                                                            }
                                                        ].map((insight, i) => (
                                                            <div key={i} style={{
                                                                padding: '1.5rem',
                                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                                borderRadius: '2rem',
                                                                border: '1px solid rgba(255,255,255,0.05)',
                                                                textAlign: 'center'
                                                            }}>
                                                                <p style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '2px', color: '#4b5563', marginBottom: '8px' }}>{insight.label}</p>
                                                                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: insight.color, margin: '0 0 4px 0' }}>{insight.value}</p>
                                                                <p style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', margin: 0 }}>{insight.desc}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* 3. Category Breakdown with Pie Chart */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', marginBottom: '4rem' }}>
                                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                        <h4 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#4b5563', marginBottom: '2rem' }}>
                                                            <PieIcon style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} /> Resource Split
                                                        </h4>
                                                        <div style={{ height: '18rem', position: 'relative' }}>
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <PieChart>
                                                                    <Pie
                                                                        data={chartData}
                                                                        innerRadius={60}
                                                                        outerRadius={95}
                                                                        paddingAngle={10}
                                                                        dataKey="value"
                                                                        stroke="none"
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
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                                        <h4 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', color: '#4b5563', marginBottom: '1.25rem' }}>Usage Matrix</h4>
                                                        {chartData.map((item, idx) => (
                                                            <div key={idx} style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                padding: '1.25rem 1.5rem',
                                                                borderRadius: '1.5rem',
                                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                                border: '1px solid rgba(255,255,255,0.02)',
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '2px', backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#9ca3af' }}>{item.name}</span>
                                                                </div>
                                                                <span style={{ fontWeight: 900, color: '#ffffff' }}>{item.value}L</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* 4. Billing & Paid Status */}
                                                <div style={{
                                                    padding: '2.5rem',
                                                    borderRadius: '2.5rem',
                                                    background: 'linear-gradient(135deg, rgba(29,78,216,0.05), rgba(0,0,0,0))',
                                                    border: '1px solid rgba(59,130,246,0.1)',
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    alignItems: 'center',
                                                    marginBottom: '4rem',
                                                }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                            <div style={{ padding: '0.5rem', backgroundColor: '#eab308', borderRadius: '8px' }}>
                                                                <IndianRupee style={{ width: '1.15rem', height: '1.15rem', color: '#000000' }} />
                                                            </div>
                                                            <h4 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>Fiscal Status</h4>
                                                        </div>
                                                        {billData ? (
                                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: billData.status === 'Paid' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)', borderRadius: '8px', border: `1px solid ${billData.status === 'Paid' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)'}`, marginTop: '1rem' }}>
                                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: billData.status === 'Paid' ? '#22c55e' : '#eab308' }}></div>
                                                                <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: billData.status === 'Paid' ? '#22c55e' : '#eab308' }}>
                                                                    PAYMENT {billData.status.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        ) : <p style={{ color: '#4b5563', fontSize: '10px', marginTop: '1rem' }}>No pending records.</p>}
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '2px', color: '#4b5563', marginBottom: '4px' }}>CERTIFIED PAYABLE</p>
                                                        <p style={{ fontSize: '3.5rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>₹{billData?.amount || 0}</p>
                                                    </div>
                                                </div>

                                                {/* 5. Alerts Section */}
                                                <div style={{
                                                    padding: '2rem',
                                                    borderRadius: '2.5rem',
                                                    backgroundColor: reportData?.leakAlert ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)',
                                                    border: `1px solid ${reportData?.leakAlert ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '4rem',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                        <div style={{ padding: '1rem', backgroundColor: reportData?.leakAlert ? '#ef4444' : '#22c55e', borderRadius: '1.25rem', boxShadow: `0 8px 20px ${reportData?.leakAlert ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}` }}>
                                                            {reportData?.leakAlert ? <AlertTriangle style={{ color: '#ffffff' }} /> : <CheckCircle2 style={{ color: '#ffffff' }} />}
                                                        </div>
                                                        <div>
                                                            <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>{reportData?.leakAlert ? 'LEAK ANOMALY DETECTED' : 'SYSTEM HEALTH OPTIMAL'}</h4>
                                                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', margin: 0 }}>Electronic signature verified by core controller</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <Shield size={24} style={{ color: reportData?.leakAlert ? '#ef4444' : '#22c55e', opacity: 0.3 }} />
                                                    </div>
                                                </div>

                                                {/* 6. AI Suggestions */}
                                                <div style={{ marginBottom: '4rem' }}>
                                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#a855f7', marginBottom: '2rem' }}>
                                                        <Brain style={{ width: '1.25rem', height: '1.25rem' }} /> WEEKLY AI INTELLIGENCE STUDIO
                                                    </h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                                        {aiReport.loading ? (
                                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#4b5563', fontStyle: 'italic' }}>Generative Intelligence synchronizing...</div>
                                                        ) : aiReport.suggestions.map((s, idx) => (
                                                            <div key={idx} style={{ padding: '1.5rem', background: 'rgba(168,85,247,0.05)', borderRadius: '1.5rem', border: '1px solid rgba(168,85,247,0.1)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                                                <div style={{ marginTop: '4px' }}><Zap size={14} style={{ color: '#a855f7' }} /></div>
                                                                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#d1d5db', margin: 0, lineHeight: 1.5 }}>{s.replace(/^- /, '')}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* 7. Impact */}
                                                <div style={{
                                                    marginBottom: '4rem',
                                                    padding: '2.5rem',
                                                    borderRadius: '2.5rem',
                                                    background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(0,0,0,0))',
                                                    border: '1px solid rgba(34,197,94,0.1)'
                                                }}>
                                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#22c55e', marginBottom: '1.5rem' }}>
                                                        <Leaf style={{ width: '1.25rem', height: '1.25rem' }} /> Ecological Footprint Impact
                                                    </h4>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#9ca3af', lineHeight: 1.6, fontStyle: 'italic' }}>
                                                        {aiReport.loading ? 'Quantifying impact matrix...' : aiReport.impact}
                                                    </div>
                                                </div>

                                                {/* 8. Summary */}
                                                <div style={{
                                                    padding: '3rem',
                                                    borderRadius: '3rem',
                                                    backgroundColor: '#111827',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', opacity: 0.1 }}>
                                                        <Sparkles size={40} style={{ color: '#a855f7' }} />
                                                    </div>
                                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', color: '#4b5563', marginBottom: '1.5rem' }}>Executive Intelligence Summary</h4>
                                                    <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.7, margin: 0 }}>
                                                        {aiReport.loading ? 'Synthesizing final executive summary...' : aiReport.summary}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Branding Footer */}
                                            <div style={{
                                                padding: '2.5rem',
                                                backgroundColor: '#1d2939',
                                                color: '#ffffff',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontSize: '8px',
                                                fontWeight: 900,
                                                letterSpacing: '5px',
                                            }}>
                                                <div style={{ opacity: 0.6 }}>AQUASMART CORE STACK / LOG KERNEL V2.4</div>
                                                <div style={{ opacity: 0.3 }}>CERTIFIED AUTHENTIC</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Email Modal */}
            <AnimatePresence>
                {showEmailModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 40 }}
                            className="glass-card max-w-md w-full p-10 text-center space-y-10 relative overflow-hidden border-t-4 border-blue-500"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"></div>

                            <div className="w-24 h-24 bg-blue-600/10 rounded-[32px] flex items-center justify-center mx-auto ring-8 ring-blue-600/5">
                                <Send className="w-12 h-12 text-blue-500" />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl font-black uppercase italic">REPORT DOWNLOADED!</h3>
                                <p className="text-gray-400 leading-relaxed font-medium">
                                    Do you need this report to be sent to your email ID?
                                </p>
                                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl inline-block px-6">
                                    <p className="text-blue-400 font-black text-xs tracking-widest uppercase">{user?.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowEmailModal(false)}
                                    className="p-5 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-black uppercase text-xs tracking-widest text-gray-500 hover:text-white"
                                >
                                    NO
                                </button>
                                <button
                                    onClick={handleEmailReport}
                                    disabled={emailing}
                                    className="p-5 rounded-3xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-3 shadow-2xl transition-all font-black uppercase text-xs tracking-widest"
                                >
                                    {emailing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5" />
                                            YES, SEND IT
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Reports;
