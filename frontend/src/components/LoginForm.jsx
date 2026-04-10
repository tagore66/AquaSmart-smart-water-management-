import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onSuccess, onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            if (onSuccess) onSuccess();
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col items-center mb-8">
                <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                <p className="text-gray-400 mt-2 text-center">Manage your water usage efficiently and smartly.</p>
            </div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-lg text-red-400 text-sm mb-6 text-center"
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400 font-semibold ml-1">Email Address</label>
                    <div className="relative">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter Email Address"
                            className="input-field px-4"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400 font-semibold ml-1">Password</label>
                    <div className="relative">
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                            className="input-field px-4"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Sign In
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="relative my-8 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative px-4 bg-[#0f172a] text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Or
                </span>
            </div>

            <a 
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/auth/google`}
                className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 group"
            >
                <div className="p-1.5 bg-white rounded-lg group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.273 0 3.159 2.727 1.145 6.722l4.121 3.043z" />
                        <path fill="#4285F4" d="M23.609 12.218c0-.791-.073-1.545-.209-2.273H12v4.51h6.509a5.556 5.556 0 0 1-2.418 3.636l4.29 3.328c2.509-2.318 3.955-5.727 3.955-9.691z" />
                        <path fill="#34A853" d="M12 24c3.245 0 5.973-1.073 7.964-2.909l-4.29-3.327c-1.191.8-2.718 1.273-4.414 1.273-3.395 0-6.27-2.291-7.295-5.364L3.823 16.71c2.014 3.995 6.127 6.718 10.854 6.718z" />
                        <path fill="#FBBC05" d="M4.705 13.682a7.034 7.034 0 0 1 0-4.364L.584 6.275a11.957 11.957 0 0 0 0 10.45l4.121-3.043z" />
                    </svg>
                </div>
                <span className="font-bold text-gray-300 group-hover:text-white transition-colors">Sign in with Google</span>
            </a>

            <div className="mt-8 pt-6 border-t border-white border-opacity-10 text-center">
                <p className="text-gray-400">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToSignup} className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                        Sign Up Free
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
