import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { IndianRupee, Calendar, CreditCard, CheckCircle, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';

const Bills = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const { data } = await axios.get('/bills');
                setBills(data);
            } catch (error) {
                console.error('Error fetching bills:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, []);

    const handlePay = async (bill) => {
        try {
            const { data: orderData } = await axios.post(`/bills/${bill._id}/order`);

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'AquaSmart',
                description: 'Water Bill Payment',
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        await axios.put(`/bills/${bill._id}/pay`, {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        setBills(prev => prev.map(b => b._id === bill._id ? { ...b, status: 'Paid' } : b));
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

    return (
        <PageWrapper
            title="Fiscal Records"
            subtitle="View and manage your fiscal water lifecycle."
            loading={loading}
        >
            <div className="space-y-5">
                {bills.length === 0 && !loading ? (
                    <Card className="text-center py-24 animate-in fade-in zoom-in duration-500">
                        <IndianRupee className="w-16 h-16 text-white/5 mx-auto mb-5" />
                        <h2 className="text-2xl font-black italic tracking-tighter mb-2 uppercase">Zero Billing Cycles</h2>
                        <p className="text-gray-500 max-w-[240px] mx-auto text-xs font-medium italic">Synchronize usage telemetry to initialize your fiscal cycles.</p>
                        <Button className="mt-8 mx-auto py-2.5 px-6 text-xs font-black italic uppercase tracking-tighter" onClick={() => navigate('/usage')}>
                            Sync usage log
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {bills.map((bill, i) => (
                            <Card
                                key={bill._id}
                                delay={i * 0.05}
                                className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-xl border transition-all duration-500 ${bill.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/10' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10'}`}>
                                        {bill.status === 'Paid' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1.5 leading-none">
                                            <h3 className="text-3xl font-black italic tracking-tighter">
                                                ₹<AnimatedNumber value={bill.amount} />
                                            </h3>
                                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border shrink-0 ${bill.status === 'Paid' ? 'border-green-500/20 text-green-400 bg-green-500/5' : 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5'}`}>
                                                {bill.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 font-bold text-[10px] flex items-center gap-1.5 italic uppercase tracking-tighter leading-none">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Week of {new Date(bill.usage.weekStarting).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Link 
                                        to={`/bills/${bill._id}`} 
                                        className="p-3.5 bg-white/5 hover:bg-blue-600/10 border border-white/5 rounded-xl transition-all duration-300 group"
                                    >
                                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                    {bill.status === 'Unpaid' && (
                                        <Button
                                            onClick={() => handlePay(bill)}
                                            className="px-6 py-2.5 text-xs font-black italic uppercase tracking-tighter"
                                            icon={CreditCard}
                                        >
                                            Checkout
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
};

export default Bills;
