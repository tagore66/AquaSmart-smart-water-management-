import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                duration: 0.5, 
                delay,
                ease: [0.16, 1, 0.3, 1] 
            }}
            whileHover={hover ? { 
                scale: 1.02,
                y: -5,
                transition: { duration: 0.3, ease: 'easeOut' }
            } : {}}
            className={`glass-card ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default Card;
