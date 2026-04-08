import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Droplet } from 'lucide-react';

const LoginSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            loginWithToken(token);
            // Redirect to dashboard after a short delay to show success state
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } else {
            navigate('/login');
        }
    }, [location, navigate, loginWithToken]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card max-w-sm w-full text-center py-12"
            >
                <div className="flex justify-center mb-6">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: 'spring', duration: 1 }}
                        className="p-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/20"
                    >
                        <Droplet className="w-12 h-12 text-white" />
                    </motion.div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Login Successful!</h2>
                <p className="text-gray-400">Syncing your water data... Please wait.</p>
                <div className="mt-8 flex justify-center">
                    <div className="w-12 h-1 px-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            className="h-full w-1/2 bg-blue-500 rounded-full"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginSuccess;
