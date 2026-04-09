import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

const Slider = ({ value, min = 0, max = 100, step = 1, onChange, label, unit = '' }) => {
    const percentage = ((value - min) / (max - min)) * 100;

    const handleIncrement = () => {
        if (value + step <= max) onChange(value + step);
    };

    const handleDecrement = () => {
        if (value - step >= min) onChange(value - step);
    };

    return (
        <div className="space-y-4">
            {label && (
                <div className="flex justify-between items-end mb-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
                    <div className="text-right">
                        <span className="text-2xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                            {value}
                        </span>
                        <span className="text-[10px] font-bold text-gray-600 ml-1 uppercase">{unit}</span>
                    </div>
                </div>
            )}
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleDecrement}
                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-gray-400 hover:text-white active:scale-90"
                >
                    <Minus className="w-4 h-4" />
                </button>

                <div className="relative flex-1 h-8 flex items-center group">
                    {/* Track */}
                    <div className="absolute w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    
                    {/* Input (Invisible Overlay) */}
                    <input 
                        type="range" 
                        min={min} 
                        max={max} 
                        step={step} 
                        value={value} 
                        onChange={(e) => onChange(parseFloat(e.target.value))}
                        className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                    />

                    {/* Custom Thumb */}
                    <motion.div 
                        className="absolute w-5 h-5 bg-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] border-2 border-blue-500 z-10 pointer-events-none"
                        style={{ left: `calc(${percentage}% - 10px)` }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                    />
                </div>

                <button 
                    onClick={handleIncrement}
                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-gray-400 hover:text-white active:scale-90"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Slider;
