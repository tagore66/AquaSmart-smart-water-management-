import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    IndianRupee, Calendar, CreditCard, CheckCircle, 
    ChevronLeft, Droplet, Layers, ArrowRight, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';

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
                    color: '#3b82f6'
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

    if (!loading && !bill) return (
        <PageWrapper title="Error" subtitle="Resource not found.">
            <Card className="p-12 text-center">
                <p className="text-red-400 font-bold">The requested bill lifecycle could not be retrieved.</p>
                <Button className="mt-8 mx-auto" onClick={() => navigate('/bills')}>Return to Archive</Button>
            </Card>
        </PageWrapper>
    );

    return (
        <PageWrapper
            title="Bill Summary"
            subtitle={bill ? `Generated on ${new Date(bill.createdAt).toDateString()}` : "Syncing financial data..."}
            loading={loading}
            actions={
                bill && (
                    <div className={`px-6 py-2 rounded-2xl border flex items-center gap-3 ${bill.status === 'Paid' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                        {bill.status === 'Paid' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        <span className="font-black text-sm uppercase tracking-widest leading-none">{bill.status}</span>
                    </div>
                )
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 space-y-10 p-10">
                    <div className="flex justify-between items-center border-b border-white/5 pb-8">
                        <h2 className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
                            <Layers className="text-blue-500" /> SLAB BREAKDOWN
                        </h2>
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Pricing Matrix v2.1</div>
                    </div>
                    
                    <div className="space-y-4">
                        {bill?.slabBreakdown.map((slab, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center justify-between p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-blue-500/20 transition-all duration-500"
                            >
                                <div>
                                    <p className="font-black text-2xl tracking-tighter italic">{slab.range}</p>
                                    <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">Rate: ₹{slab.rate}/L × {slab.liters}L</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-3xl italic">₹{slab.cost}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-10 border-t border-white/5 flex items-center justify-between bg-gradient-to-r from-transparent to-blue-600/5 -mx-10 px-10 rounded-b-[3rem]">
                        <span className="text-xl font-black italic text-gray-500 uppercase tracking-widest">Aggregate Due</span>
                        <div className="text-5xl font-black italic tracking-tighter text-blue-400 flex items-center gap-2">
                            ₹<AnimatedNumber value={bill?.amount || 0} />
                        </div>
                    </div>
                </Card>

                <div className="space-y-8 h-full">
                    <Card className="p-8 space-y-8 flex flex-col justify-between h-full min-h-[400px]">
                        <div className="space-y-8">
                            <h3 className="text-xl font-black italic uppercase flex items-center gap-3 tracking-tight">
                                <Droplet className="text-blue-500" /> Usage Vector
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Tracking Interval</p>
                                    <p className="font-black text-lg italic text-gray-200">{new Date(bill?.usage.weekStarting).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Measured Volume</p>
                                    <p className="font-black text-4xl italic tracking-tighter text-white">
                                        <AnimatedNumber value={bill?.usage.totalLiters || 0} /> <span className="text-sm font-bold text-gray-600">Liters</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            {bill?.status === 'Unpaid' ? (
                                <Button 
                                    onClick={handlePay}
                                    className="w-full py-6 text-xl group"
                                    icon={CreditCard}
                                >
                                    Proceed to Pay
                                </Button>
                            ) : (
                                <div className="p-8 bg-green-500/10 border border-green-500/20 rounded-[2.5rem] text-center space-y-4">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                                        <CheckCircle className="w-10 h-10 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-green-400 font-black text-xl italic uppercase tracking-tighter">Synchronized</p>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-2">ID: {bill?.paymentId}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </PageWrapper>
    );
};

export default BillDetails;
