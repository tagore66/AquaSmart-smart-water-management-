import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Shield, CheckCircle2, AlertTriangle, 
    ArrowRight, Loader2, Key, Save, Edit3, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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

    return (
        <PageWrapper
            title="Account Settings"
            subtitle="Manage your identity and security preferences."
            loading={loading}
        >
            <AnimatePresence>
                {(error || success) && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-6 rounded-3xl flex items-center gap-4 border mb-8 ${success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                    >
                        {success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                        <span className="font-bold tracking-tight">{success || error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Public Profile Form */}
                <Card className="lg:col-span-2 p-10 space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8">
                        <h3 className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
                            <User className="text-blue-500" /> GENERAL INFORMATION
                        </h3>
                        {!isEditing && (
                            <Button 
                                variant="ghost"
                                onClick={() => setIsEditing(true)}
                                className="px-5 py-2 text-xs uppercase tracking-widest"
                                icon={Edit3}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-8 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">First Name</label>
                                <input 
                                    type="text" 
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    className={`w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all text-white placeholder-gray-600 font-medium ${!isEditing ? 'opacity-50 cursor-default' : ''}`}
                                    placeholder="John"
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Last Name</label>
                                <input 
                                    type="text" 
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    className={`w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all text-white placeholder-gray-600 font-medium ${!isEditing ? 'opacity-50 cursor-default' : ''}`}
                                    placeholder="Doe"
                                    readOnly={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Registered Email (Immutable)</label>
                            <input 
                                type="email" 
                                value={user?.email}
                                disabled
                                className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-gray-500 font-medium cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Recovery Email</label>
                            <input 
                                type="email" 
                                value={formData.recoveryEmail}
                                onChange={(e) => setFormData({...formData, recoveryEmail: e.target.value})}
                                className={`w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all text-white placeholder-gray-600 font-medium ${!isEditing ? 'opacity-50 cursor-default' : ''}`}
                                placeholder="recovery@example.com"
                                readOnly={!isEditing}
                            />
                            <p className="text-[10px] text-gray-500 italic font-medium ml-2">Designated channel for critical infrastructure alerts.</p>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                                <Button 
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsEditing(false)}
                                    className="px-8"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={updating}
                                    className="px-10"
                                    icon={updating ? Loader2 : Save}
                                >
                                    {updating ? 'Encrypting...' : 'Save Changes'}
                                </Button>
                            </div>
                        )}
                    </form>
                </Card>

                {/* Security Card */}
                <div className="space-y-8">
                    <Card className="p-8 border-l-4 border-l-yellow-500">
                        <h3 className="text-xl font-black italic tracking-tighter mb-6 flex items-center gap-3">
                            <Shield className="text-yellow-500" /> SECURITY HUB
                        </h3>
                        <p className="text-gray-400 font-medium text-sm mb-8 leading-relaxed">
                            Maintain core integrity by rotating your credentials. Two-factor authentication required.
                        </p>
                        
                        <Button 
                            variant="secondary"
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full justify-between items-center bg-white/5 hover:bg-yellow-500/10 border-white/5 hover:border-yellow-500/20 py-4 h-auto group"
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <Key className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-200 group-hover:text-yellow-500 transition-colors">Rotate Password</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Requires Email OTP</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 group-hover:text-yellow-500 transition-all" />
                        </Button>
                    </Card>

                    <Card className="p-8 bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                            <CheckCircle2 className="w-10 h-10 text-blue-400" />
                        </div>
                        <h4 className="font-black italic tracking-tighter text-xl mb-2">Identity Verified</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/60">OAuth & JWT Encryption Active</p>
                    </Card>
                </div>
            </div>

            {/* Password Reset Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass max-w-md w-full p-10 space-y-8 relative rounded-[3rem] border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
                        >
                            <button 
                                onClick={() => { setShowPasswordModal(false); setOtpSent(false); }}
                                className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-full transition-all duration-300 text-gray-400 hover:text-white hover:rotate-90"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center space-y-4">
                                <div className="w-24 h-24 bg-yellow-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ring-8 ring-yellow-500/5">
                                    <Key className="w-10 h-10 text-yellow-500" />
                                </div>
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase relative">
                                    Admin Override
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-yellow-500 rounded-full"></div>
                                </h2>
                                <p className="text-gray-400 font-medium leading-relaxed italic text-sm mt-4">
                                    {otpSent 
                                        ? "Validation token dispatched. Intercept and verify."
                                        : "Initiate secure credential rotation. OTP required."}
                                </p>
                            </div>

                            {!otpSent ? (
                                <Button 
                                    onClick={handleSendOTP}
                                    disabled={otpLoading}
                                    className="w-full py-5 mt-8 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)]"
                                    icon={otpLoading ? Loader2 : Key}
                                >
                                    {otpLoading ? 'Generating...' : 'Request Validation Token'}
                                </Button>
                            ) : (
                                <form onSubmit={handleResetPassword} className="space-y-8 mt-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Authorization Token</label>
                                        <input 
                                            type="text" 
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-500/50 focus:bg-yellow-500/5 text-center text-3xl tracking-[0.5em] font-mono text-yellow-400 placeholder-white/10 transition-all font-black"
                                            placeholder="000000"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">New Core Cipher</label>
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 text-center text-2xl tracking-[0.2em] font-mono transition-all text-white placeholder-white/10"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Verify Core Cipher</label>
                                            <input 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 text-center text-2xl tracking-[0.2em] font-mono transition-all text-white placeholder-white/10 relative"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-4">
                                        <Button 
                                            type="submit" 
                                            disabled={updating}
                                            className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)]"
                                            icon={updating ? Loader2 : Save}
                                        >
                                            {updating ? 'Encrypting...' : 'Confirm Override'}
                                        </Button>
                                        <div className="text-center">
                                            <button 
                                                type="button"
                                                onClick={handleSendOTP}
                                                className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors py-2"
                                            >
                                                Resend Validation Token
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

export default Profile;
