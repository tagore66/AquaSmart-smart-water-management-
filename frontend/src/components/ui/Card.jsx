import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
                duration: 0.6, 
                delay,
                ease: [0.16, 1, 0.3, 1] 
            }}
            whileHover={hover ? { 
                scale: 1.01,
                y: -4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                borderColor: 'rgba(255,255,255,0.15)',
                transition: { duration: 0.3, ease: 'easeOut' }
            } : {}}
            className={`glass-card ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default Card;
