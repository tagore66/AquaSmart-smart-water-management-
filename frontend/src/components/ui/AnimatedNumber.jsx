import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedNumber = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const displayValue = useTransform(spring, (current) => 
        `${prefix}${current.toFixed(decimals)}${suffix}`
    );

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span>{displayValue}</motion.span>;
};

export default AnimatedNumber;
