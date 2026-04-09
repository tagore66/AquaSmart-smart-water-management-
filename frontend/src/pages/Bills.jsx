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
            title="Billing History"
            subtitle="View and manage your fiscal water lifecycle."
            loading={loading}
        >
            <div className="space-y-6">
                {bills.length === 0 && !loading ? (
                    <Card className="text-center py-32 animate-in fade-in zoom-in duration-700">
                        <IndianRupee className="w-20 h-20 text-gray-800 mx-auto mb-6" />
                        <h2 className="text-3xl font-black italic tracking-tight mb-3">No Bills Generated</h2>
                        <p className="text-gray-500 max-w-xs mx-auto font-medium">Synchronize your usage data to initialize your billing cycles.</p>
                        <Button className="mt-10 mx-auto" onClick={() => navigate('/usage')}>
                            Initialize Usage Log
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {bills.map((bill, i) => (
                            <Card
                                key={bill._id}
                                delay={i * 0.05}
                                className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8"
                            >
                                <div className="flex items-center gap-8">
                                    <div className={`p-6 rounded-[2rem] border transition-all duration-500 ${bill.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)]'}`}>
                                        {bill.status === 'Paid' ? <CheckCircle className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className="text-4xl font-black italic tracking-tighter">
                                                ₹<AnimatedNumber value={bill.amount} />
                                            </h3>
                                            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${bill.status === 'Paid' ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'}`}>
                                                {bill.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 font-bold text-sm flex items-center gap-2 italic">
                                            <Calendar className="w-4 h-4" />
                                            Cycle: Week of {new Date(bill.usage.weekStarting).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <Link 
                                        to={`/bills/${bill._id}`} 
                                        className="p-5 bg-white/5 hover:bg-blue-600/10 border border-white/5 rounded-2xl transition-all duration-300 group"
                                    >
                                        <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    {bill.status === 'Unpaid' && (
                                        <Button
                                            onClick={() => handlePay(bill)}
                                            className="px-10 py-5 text-lg"
                                            icon={CreditCard}
                                        >
                                            Secure Checkout
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
