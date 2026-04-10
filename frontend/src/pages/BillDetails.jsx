import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    IndianRupee, Calendar, CreditCard, CheckCircle, 
    ChevronLeft, Droplet, Layers, Clock
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
            <Card className="p-10 text-center">
                <p className="text-red-400 font-bold text-sm">The requested bill lifecycle could not be retrieved.</p>
                <Button className="mt-8 mx-auto py-2.5 px-6 text-xs font-black uppercase tracking-tighter" onClick={() => navigate('/bills')}>Return to Archive</Button>
            </Card>
        </PageWrapper>
    );

    return (
        <PageWrapper
            title="Fiscal Breakdown"
            subtitle={bill ? `Generated on ${new Date(bill.createdAt).toDateString()}` : "Syncing financial data..."}
            loading={loading}
            actions={
                bill && (
                    <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2.5 ${bill.status === 'Paid' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                        {bill.status === 'Paid' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        <span className="font-black text-[9px] uppercase tracking-[0.2em] leading-none">{bill.status}</span>
                    </div>
                )
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 space-y-8 p-8 border-white/5">
                    <div className="flex justify-between items-center border-b border-white/5 pb-6">
                        <h2 className="text-xl font-black italic tracking-tighter flex items-center gap-2.5">
                            <Layers className="text-blue-500 w-5 h-5" /> PERFORMANCE SLABS
                        </h2>
                        <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">Standard Matrix v3.0</div>
                    </div>
                    
                    <div className="space-y-4">
                        {bill?.slabBreakdown.map((slab, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center justify-between p-5 bg-white/[0.015] rounded-2xl border border-white/5 hover:border-blue-500/10 transition-all duration-300"
                            >
                                <div>
                                    <p className="font-black text-xl tracking-tighter italic leading-none mb-1.5">{slab.range}</p>
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none italic">Rate: ₹{slab.rate}/L × {slab.liters}L</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-2xl italic leading-none">₹{slab.cost}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-white/5 flex items-center justify-between bg-gradient-to-r from-transparent to-blue-500/[0.03] -mx-8 px-8 rounded-b-2xl">
                        <span className="text-sm font-black italic text-gray-500 uppercase tracking-widest">Aggregate Liability</span>
                        <div className="text-4xl font-black italic tracking-tighter text-blue-400 flex items-center gap-1.5 leading-none">
                            ₹<AnimatedNumber value={bill?.amount || 0} />
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-8 flex flex-col justify-between h-auto gap-10 border-white/5">
                        <div className="space-y-8">
                            <h3 className="text-lg font-black italic uppercase flex items-center gap-2.5 tracking-tight text-white/80">
                                <Droplet className="text-blue-500 w-5 h-5" /> Usage Context
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1.5 leading-none">Sync Interval</p>
                                    <p className="font-black text-base italic text-gray-300 leading-none">{new Date(bill?.usage.weekStarting).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1.5 leading-none">Total Usage</p>
                                    <div className="flex items-end gap-1.5 leading-none">
                                        <p className="font-black text-4xl italic tracking-tighter text-white leading-none">
                                            <AnimatedNumber value={bill?.usage.totalLiters || 0} />
                                        </p>
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest pb-1">Litres</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            {bill?.status === 'Unpaid' ? (
                                <Button 
                                    onClick={handlePay}
                                    className="w-full py-4 text-sm font-black italic uppercase tracking-tighter"
                                    icon={CreditCard}
                                >
                                    Proceed to Checkout
                                </Button>
                            ) : (
                                <div className="p-6 bg-green-500/[0.03] border border-green-500/10 rounded-2xl text-center space-y-4">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-500/5 transition-transform hover:scale-110 duration-500">
                                        <CheckCircle className="w-8 h-8 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-green-500 font-black text-lg italic uppercase tracking-tighter">SUCCESS</p>
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] mt-1.5">AUTH: {bill?.paymentId?.slice(-12).toUpperCase()}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                    
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/bills')} 
                        className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white"
                        icon={ChevronLeft}
                    >
                        Return to Archives
                    </Button>
                </div>
            </div>
        </PageWrapper>
    );
};

export default BillDetails;
