import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    IndianRupee, Calendar, CreditCard, CheckCircle, 
    ChevronLeft, Droplet, Layers, ArrowRight, Loader2 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const BillDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);

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
    const handlePay = async () => {
        try {
            const { data: orderData } = await axios.post(`/bills/${id}/order`);

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'AquaSmart',
                description: 'Water Bill Payment',
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        await axios.put(`/bills/${id}/pay`, {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        const { data } = await axios.get(`/bills/${id}`);
                        setBill(data);
                        alert('Payment successful! Your order ID is ' + response.razorpay_order_id);
                    } catch (err) {
                        console.error('Payment verification failed:', err);
                        alert('Payment verification failed.');
                    }
                },
                prefill: {
                    name: `${user?.firstName} ${user?.lastName}`,
                    email: user?.email
                },
                theme: {
                    color: '#2563eb'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert('Payment failed: ' + response.error.description);
            });
            rzp.open();
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Something went wrong. Please try again.');
        }
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
                            onClick={handlePay}
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

            </main>
        </div>
    );
};

export default BillDetails;
