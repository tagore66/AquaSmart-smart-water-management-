import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    IndianRupee, Calendar, CreditCard, CheckCircle, 
    ChevronLeft, Droplet, Layers, ArrowRight, Loader2 
} from 'lucide-react';
import Navbar from '../components/Navbar';

const BillDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
    const [showRazorpay, setShowRazorpay] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const { data } = await axios.get(`/bills/${id}`);
                setBill(data);
            } catch (error) {
                console.error('Error fetching bill details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBill();
    }, [id]);

    const handlePayment = async () => {
        setIsPaying(true);
        // Simulate a payment gateway delay
        setTimeout(async () => {
            try {
                await axios.put(`/bills/${id}/pay`, { paymentId: 'pay_razor_' + Math.random().toString(36).substr(2, 9) });
                const { data } = await axios.get(`/bills/${id}`);
                setBill(data);
                setShowRazorpay(false);
            } catch (error) {
                console.error('Payment error:', error);
            } finally {
                setIsPaying(false);
            }
        }, 1500);
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading Bill Details...</div>;
    if (!bill) return <div className="h-screen flex items-center justify-center text-red-400">Bill not found</div>;

    return (
        <div className="flex bg-slate-950 min-h-screen text-white">
            <Navbar />
            <main className="flex-1 ml-20 md:ml-64 p-6 md:p-12 max-w-4xl space-y-8">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                Back to Bills
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Bill Summary</h1>
                    <p className="text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Generated on {new Date(bill.createdAt).toDateString()}
                    </p>
                </div>
                <div className={`px-6 py-2 rounded-2xl border ${bill.status === 'Paid' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                    <span className="font-bold text-lg uppercase tracking-wider">{bill.status}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card col-span-1 md:col-span-2 space-y-8">
                    <h2 className="text-xl font-bold border-b border-white border-opacity-10 pb-4 flex items-center gap-3">
                        <Layers className="text-blue-400" /> Slab Breakdown
                    </h2>
                    
                    <div className="space-y-4">
                        {bill.slabBreakdown.map((slab, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <p className="font-bold text-lg">{slab.range}</p>
                                    <p className="text-sm text-gray-400">Rate: ₹{slab.rate}/L × {slab.liters}L</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-xl">₹{slab.cost}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-white border-opacity-10 flex items-center justify-between">
                        <span className="text-xl text-gray-400">Total Amount Due</span>
                        <span className="text-4xl font-bold text-blue-400 flex items-center gap-2">
                            <IndianRupee className="w-8 h-8" /> {bill.amount}
                        </span>
                    </div>
                </div>

                <div className="glass-card space-y-6 flex flex-col justify-between">
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <Droplet className="text-blue-400" /> Usage Info
                        </h3>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Weekly Period Starting</p>
                            <p className="font-semibold">{new Date(bill.usage.weekStarting).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Total Consumption</p>
                            <p className="font-semibold text-2xl">{bill.usage.totalLiters} Liters</p>
                        </div>
                    </div>

                    {bill.status === 'Unpaid' ? (
                        <button 
                            onClick={() => setShowRazorpay(true)}
                            className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-auto"
                        >
                            <CreditCard className="w-5 h-5" />
                            Pay with Razorpay
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                            <p className="text-green-400 font-bold mb-1">Payment Completed</p>
                            <p className="text-xs text-gray-400">ID: {bill.paymentId}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Razorpay Mock Modal */}
            {showRazorpay && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-card max-w-sm w-full p-0 overflow-hidden border-blue-500/30"
                    >
                        <div className="bg-slate-900 p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded">
                                    <IndianRupee className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-400 font-bold uppercase">Razorpay Checkout</p>
                                    <p className="text-lg font-bold">₹{bill.amount}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowRazorpay(false)} className="text-gray-500 hover:text-white">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Card Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="4242 4242 4242 4242"
                                        className="input-field py-3 text-lg tracking-widest"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Expiry</label>
                                        <input 
                                            type="text" 
                                            placeholder="MM/YY"
                                            className="input-field py-3"
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">CVV</label>
                                        <input 
                                            type="password" 
                                            placeholder="•••"
                                            className="input-field py-3"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 flex items-center gap-4 text-sm">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <p className="text-gray-400">Securing your transaction with 256-bit encryption.</p>
                            </div>

                            <button 
                                onClick={handlePayment}
                                disabled={isPaying}
                                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                            >
                                {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pay ₹{bill.amount}</>}
                            </button>
                        </div>
                        <div className="bg-slate-900/50 p-4 text-center">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Powered by Razorpay Mock</p>
                        </div>
                    </motion.div>
                </div>
                )}
            </main>
        </div>
    );
};

export default BillDetails;
