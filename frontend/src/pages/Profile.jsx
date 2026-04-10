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
                        initial={{ opacity: 0, y: -15, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -15, filter: 'blur(10px)' }}
                        className={`p-4 rounded-xl flex items-center gap-3 border mb-6 text-xs transition-all ${success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                    >
                        {success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                        <span className="font-black tracking-tight uppercase">{success || error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Public Profile Form */}
                <Card className="lg:col-span-2 p-8 space-y-6 border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <h3 className="text-xl font-black italic tracking-tighter flex items-center gap-2.5">
                            <User className="text-blue-500 w-5 h-5" /> IDENTITY MATRIX
                        </h3>
                        {!isEditing && (
                            <Button 
                                variant="ghost"
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] font-black border-white/5 hover:bg-blue-600/10 hover:text-blue-400"
                                icon={Edit3}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-6 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1.5 leading-none">First Name</label>
                                <input 
                                    type="text" 
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    className={`w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/[0.03] transition-all text-white placeholder-gray-700 font-bold text-sm ${!isEditing ? 'opacity-40 cursor-default' : ''}`}
                                    placeholder="First Name"
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1.5 leading-none">Last Name</label>
                                <input 
                                    type="text" 
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    className={`w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/[0.03] transition-all text-white placeholder-gray-700 font-bold text-sm ${!isEditing ? 'opacity-40 cursor-default' : ''}`}
                                    placeholder="Last Name"
                                    readOnly={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1.5 leading-none">Core Credential (Immutable)</label>
                            <input 
                                type="email" 
                                value={user?.email}
                                disabled
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-gray-600 font-bold text-sm cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1.5 leading-none">Recovery Protocol Email</label>
                            <input 
                                type="email" 
                                value={formData.recoveryEmail}
                                onChange={(e) => setFormData({...formData, recoveryEmail: e.target.value})}
                                className={`w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/[0.03] transition-all text-white placeholder-gray-700 font-bold text-sm ${!isEditing ? 'opacity-40 cursor-default' : ''}`}
                                placeholder="recovery@example.com"
                                readOnly={!isEditing}
                            />
                            <p className="text-[9px] text-gray-700 italic font-black uppercase tracking-tight ml-1.5">Emergency infrastructure alert channel</p>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <Button 
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 text-[10px] uppercase font-black tracking-widest text-gray-600 hover:text-white border-none h-auto"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={updating}
                                    className="px-8 py-2.5 text-[10px] uppercase font-black italic tracking-tighter"
                                    icon={updating ? Loader2 : Save}
                                >
                                    {updating ? 'Syncing...' : 'Save Matrix'}
                                </Button>
                            </div>
                        )}
                    </form>
                </Card>

                {/* Security Card */}
                <div className="space-y-6">
                    <Card className="p-6 border-l-2 border-l-yellow-500 border-white/5 bg-gradient-to-br from-yellow-500/[0.02] to-transparent">
                        <h3 className="text-lg font-black italic tracking-tighter mb-4 flex items-center gap-2.5 uppercase text-white/90">
                            <Shield className="text-yellow-500 w-4 h-4" /> Security Settings
                        </h3>
                        <p className="text-gray-500 font-bold text-xs mb-6 leading-relaxed italic">
                            Update your password to keep your account safe. An email verification code will be required.
                        </p>
                        
                        <Button 
                            variant="ghost"
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full justify-between items-center bg-white/[0.02] hover:bg-yellow-500/10 border-white/5 hover:border-yellow-500/20 p-4 h-auto group rounded-xl transition-all duration-500"
                        >
                            <div className="flex items-center gap-3.5 text-left">
                                <div className="p-2.5 bg-yellow-500/10 rounded-lg group-hover:scale-110 transition-transform duration-500">
                                    <Key className="w-4 h-4 text-yellow-500" />
                                </div>
                                <div className="leading-none">
                                    <p className="font-black text-gray-300 group-hover:text-yellow-500 transition-colors text-sm uppercase tracking-tighter italic">Change Password</p>
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 mt-1.5">Verification Required</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-700 group-hover:translate-x-0.5 group-hover:text-yellow-500 transition-all" />
                        </Button>
                    </Card>

                    <Card className="p-8 bg-gradient-to-br from-blue-600/[0.03] to-transparent border-blue-500/10 text-center flex flex-col items-center justify-center border-white/5">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/10 mb-5 ring-4 ring-blue-500/5 transition-transform hover:scale-110 duration-500">
                            <CheckCircle2 className="w-8 h-8 text-blue-500/60" />
                        </div>
                        <h4 className="font-black italic tracking-tighter text-lg mb-1 uppercase text-white/80">AUTHENTICATED</h4>
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-500/40 mt-1">Secured Account</p>
                    </Card>
                </div>
            </div>

            {/* Password Reset Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 backdrop-blur-2xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.94, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 30 }}
                            className="glass max-w-sm w-full p-8 space-y-8 relative rounded-[2.5rem] border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] border-t-8 border-yellow-600"
                        >
                            <button 
                                onClick={() => { setShowPasswordModal(false); setOtpSent(false); }}
                                className="absolute top-6 right-6 p-2.5 hover:bg-white/5 rounded-xl transition-all duration-300 text-gray-600 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center space-y-3">
                                <div className="w-20 h-20 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-4 ring-yellow-500/5">
                                    <Key className="w-8 h-8 text-yellow-500" />
                                </div>
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase relative leading-none">
                                    Change Password
                                </h2>
                                <p className="text-gray-500 font-bold leading-relaxed italic text-xs mt-4 px-4">
                                    {otpSent 
                                        ? "Verification code sent to your email inbox."
                                        : "Enter a new secure password for your account."}
                                </p>
                            </div>

                            {!otpSent ? (
                                <Button 
                                    onClick={handleSendOTP}
                                    disabled={otpLoading}
                                    className="w-full py-4 mt-6 text-xs uppercase font-black italic tracking-tighter"
                                    icon={otpLoading ? Loader2 : Key}
                                >
                                    {otpLoading ? 'Generating...' : 'Send Verification Code'}
                                </Button>
                            ) : (
                                <form onSubmit={handleResetPassword} className="space-y-6 mt-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1.5 leading-none">Verification Code</label>
                                        <input 
                                            type="text" 
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/40 focus:bg-yellow-500/[0.03] text-center text-2xl tracking-[0.4em] font-mono text-yellow-500 transition-all font-black placeholder-white/5"
                                            placeholder="000000"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1.5 leading-none">New Password</label>
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/[0.03] text-center text-xl tracking-[0.2em] font-mono transition-all text-white placeholder-white/5"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1.5 leading-none">Confirm Password</label>
                                            <input 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/[0.03] text-center text-xl tracking-[0.2em] font-mono transition-all text-white placeholder-white/5"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <Button 
                                            type="submit" 
                                            disabled={updating}
                                            className="w-full py-4 text-xs font-black italic uppercase tracking-tighter"
                                            icon={updating ? Loader2 : Save}
                                        >
                                            {updating ? 'Saving...' : 'Save New Password'}
                                        </Button>
                                        <div className="text-center">
                                            <button 
                                                type="button"
                                                onClick={handleSendOTP}
                                                className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-500/60 hover:text-blue-400 transition-colors py-1.5"
                                            >
                                                Resend Verification Code
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
