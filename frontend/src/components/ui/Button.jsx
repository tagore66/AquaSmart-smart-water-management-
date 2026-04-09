import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
    children, 
    onClick, 
    className = '', 
    variant = 'primary', 
    type = 'button',
    disabled = false,
    icon: Icon 
}) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all duration-300 border border-white/10 active:scale-95 flex items-center justify-center gap-2',
        ghost: 'px-4 py-2 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center gap-2'
    };

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.05, brightness: 1.2 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            className={`${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {Icon && <Icon className="w-5 h-5" />}
            {children}
        </motion.button>
    );
};

export default Button;
