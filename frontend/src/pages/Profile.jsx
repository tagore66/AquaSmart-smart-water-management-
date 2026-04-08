import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Shield, CheckCircle2, AlertTriangle, 
    ArrowRight, Loader2, Key, Save, Edit3, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        recoveryEmail: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get('/users/profile');
                setFormData({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    recoveryEmail: data.recoveryEmail || '',
                });
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        setSuccess('');
        try {
            const { data } = await axios.put('/users/profile', formData);
            updateUser(data);
            setIsEditing(false);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const handleSendOTP = async () => {
        setOtpLoading(true);
        setError('');
        try {
            await axios.post('/users/password-reset-otp');
            setOtpSent(true);
            setSuccess('OTP sent to your registered email.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }
        setUpdating(true);
        setError('');
        try {
            await axios.put('/users/reset-password', { otp, newPassword });
            setSuccess('Password changed successfully!');
            setShowPasswordModal(false);
            setOtpSent(false);
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-white bg-slate-950">Preparing your space...</div>;

    return (
        <div className="flex bg-slate-950 min-h-screen text-white">
            <Navbar />
            
            <main className="flex-1 ml-20 md:ml-64 p-6 md:p-10 space-y-10">
                <header className="pb-6 border-b border-white/5">
                    <h1 className="text-4xl font-bold mb-2 tracking-tight">Account Settings</h1>
                    <p className="text-gray-400 text-lg">Manage your identity and security preferences.</p>
                </header>

                <AnimatePresence>
                    {(error || success) && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-4 rounded-2xl flex items-center gap-4 border ${success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                        >
                            {success ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            <span className="font-semibold">{success || error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
                    {/* Public Profile Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="glass-card">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold flex items-center gap-3">
                                        <User className="text-blue-400" /> General Information
                                    </h3>
                                    {!isEditing && (
                                        <button 
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" /> Edit Profile
                                        </button>
                                    )}
                                </div>
                            
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            className={`input-field ${!isEditing ? 'opacity-70 bg-white/5 cursor-default' : ''}`}
                                            placeholder="John"
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            className={`input-field ${!isEditing ? 'opacity-70 bg-white/5 cursor-default' : ''}`}
                                            placeholder="Doe"
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Registered Email (Read Only)</label>
                                    <input 
                                        type="email" 
                                        value={user?.email}
                                        disabled
                                        className="input-field opacity-50 cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Recovery Email</label>
                                    <div className="relative group">
                                        <input 
                                            type="email" 
                                            value={formData.recoveryEmail}
                                            onChange={(e) => setFormData({...formData, recoveryEmail: e.target.value})}
                                            className={`input-field ${!isEditing ? 'opacity-70 bg-white/5 cursor-default' : ''}`}
                                            placeholder="email address"
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic mt-1 ml-1">Used for critical account alerts and password recovery.</p>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end gap-4 pt-4">
                                        <button 
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all font-semibold"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={updating}
                                            className="btn-primary py-3 px-8 flex items-center gap-2"
                                        >
                                            {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </section>
                    </div>

                    {/* Security Card */}
                    <div className="space-y-8">
                        <section className="glass-card border-l-4 border-yellow-500/30">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                                <Shield className="text-yellow-400" /> Security
                            </h3>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                Keep your account safe by updating your password regularly. We'll send a verification code to your email.
                            </p>
                            
                            <button 
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-yellow-400/10 rounded-xl group-hover:scale-110 transition-transform">
                                        <Key className="w-6 h-6 text-yellow-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold">Update Password</p>
                                        <p className="text-[10px] text-gray-500">Requires Email OTP</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                            </button>
                        </section>

                        <div className="glass-card bg-blue-500/5 border-blue-500/20 py-10 px-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-blue-400" />
                            </div>
                            <h4 className="font-bold mb-1">Identity Verified</h4>
                            <p className="text-xs text-gray-500">Your account is secured with Google OAuth & JWT Encryption.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Password Reset Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card max-w-md w-full p-8 space-y-8 relative"
                        >
                            <button 
                                onClick={() => { setShowPasswordModal(false); setOtpSent(false); }}
                                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="text-center space-y-2">
                                <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Key className="w-10 h-10 text-yellow-500" />
                                </div>
                                <h2 className="text-2xl font-bold">Secure Password Reset</h2>
                                <p className="text-gray-400 text-sm px-6">
                                    {otpSent 
                                        ? "Validation code has been sent. Check your inbox."
                                        : "Protect your account. We'll send you an OTP to verify your identity."}
                                </p>
                            </div>

                            {!otpSent ? (
                                <button 
                                    onClick={handleSendOTP}
                                    disabled={otpLoading}
                                    className="btn-primary w-full py-4 flex items-center justify-center gap-3"
                                >
                                    {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Verification Code <ArrowRight className="w-5 h-5" /></>}
                                </button>
                            ) : (
                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">OTP from Email</label>
                                        <input 
                                            type="text" 
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="input-field text-center text-2xl tracking-[10px] font-mono"
                                            placeholder="000000"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="input-field"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                            <input 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="input-field"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={updating}
                                        className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
                                    >
                                        {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Update Password</>}
                                    </button>
                                    <p className="text-center">
                                        <button 
                                            type="button"
                                            onClick={handleSendOTP}
                                            className="text-xs text-blue-400 hover:underline"
                                        >
                                            Resend Verification Code
                                        </button>
                                    </p>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
