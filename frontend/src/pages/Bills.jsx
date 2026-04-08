import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { IndianRupee, Calendar, CreditCard, CheckCircle, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

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
            // 1. Create order on backend
            const { data: orderData } = await axios.post(`/bills/${bill._id}/order`);

            // 2. Razorpay configuration
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'AquaSmart',
                description: 'Water Bill Payment',
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        // 3. Verify and update status on backend
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

    if (loading) return <div className="h-screen flex items-center justify-center">Loading Bills...</div>;

    return (
        <div className="flex bg-slate-950 min-h-screen text-white">
            <Navbar />
            <main className="flex-1 ml-20 md:ml-64 p-6 md:p-12 max-w-5xl space-y-10">
                <header>
                    <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4">
                    <ChevronLeft className="w-5 h-5" />
                    Back to Dashboard
                </button>
                <h1 className="text-4xl font-bold mb-2">Billing History</h1>
                <p className="text-gray-400">View and manage your water bills.</p>
            </header>

            <div className="space-y-6">
                {bills.length === 0 ? (
                    <div className="glass-card text-center py-20">
                        <IndianRupee className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold">No Bills Generated</h2>
                        <p className="text-gray-400">Enter your usage data to see your bills here.</p>
                    </div>
                ) : (
                    bills.map((bill) => (
                        <motion.div
                            key={bill._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`p-4 rounded-2xl ${bill.status === 'Paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                    {bill.status === 'Paid' ? <CheckCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-2xl font-bold">₹{bill.amount}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${bill.status === 'Paid' ? 'border-green-500/30 text-green-400' : 'border-yellow-500/30 text-yellow-400'}`}>
                                            {bill.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Week of {new Date(bill.usage.weekStarting).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Link to={`/bills/${bill._id}`} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                                    <ChevronRight className="w-6 h-6" />
                                </Link>
                                {bill.status === 'Unpaid' && (
                                    <button
                                        onClick={() => handlePay(bill)}
                                        className="btn-primary py-3 px-6 flex items-center gap-2"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        Pay Now
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
            </main>
        </div>
    );
};


export default Bills;

