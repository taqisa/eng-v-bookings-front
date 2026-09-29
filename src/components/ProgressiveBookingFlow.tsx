
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { MapPin, Sparkles, CheckCircle, Wifi, Battery, Signal, ArrowRight, ArrowLeft, Search, Grid, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Provider {
    id: string;
    name: string;
    name: string;
    display_name: string | null;
    specialty: string;
    image_filename: string | null;
    city_id: string;
}


const etherealHLogoAnimation = `
  /* Entrance animation for the vertical strokes */
  @keyframes grow-in {
    from {
      opacity: 0;
      transform: scaleY(0.5);
    }
    to {
      opacity: 1;
      transform: scaleY(1);
    }
  }

  /* Continuous animation for the waving crossbar */
  @keyframes wave-flow {
    from {
      stroke-dashoffset: 0;
    }
    to {
      /* Animate by the total length of the pattern (dash + gap) for a seamless loop */
      stroke-dashoffset: -100; 
    }
  }

  .h-stroke {
    transform-origin: center;
    animation: grow-in 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  }
  .h-stroke.left { animation-delay: 0.1s; }
  .h-stroke.right { animation-delay: 0.3s; }

  .h-wave {
    /* Define a pattern: 50 units of solid line, 50 units of empty space */
    stroke-dasharray: 50 50;
    animation: wave-flow 3s linear infinite;
    filter: drop-shadow(0 0 3px rgba(129, 140, 248, 0.6)); /* Indigo glow */
    transition: filter 0.3s ease-in-out;
  }
  
  /* Make the wave glow brighter on hover */
  .group:hover .h-wave {
    filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.9)); /* Brighter blue glow */
  }
`;

const UnifiedRosieBooking = () => {
    const navigate = useNavigate();

    // Logic State
    const [step, setStep] = useState<'WELCOME' | 'CITY' | 'SERVICE' | 'RESULT'>('WELCOME');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [providerIndex, setProviderIndex] = useState(0);

    // Data State
    const [providers, setProviders] = useState<Provider[]>([]);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const { data } = await supabase
                    .from('providers')
                    .select('id, name, name, display_name, specialty, image_filename, city_id');
                setProviders(data || []);
            } catch (e) {
                console.error(e);
            }
        };
        fetchProviders();
    }, []);

    const cityMap: any = { 'salfit': 'سلفيت', 'ramallah': 'رام الله', 'nablus': 'نابلس', 'hebron': 'الخليل', 'jenin': 'جنين' };
    const categories = [
        { id: 'طبيب', label: 'طبيب', icon: '🩺' },
        { id: 'صالون', label: 'صالون', icon: '✂️' },
        { id: 'محامي', label: 'محامي', icon: '⚖️' },
        { id: 'علاج', label: 'علاج', icon: '💆‍♂️' }
    ];

    // Filter Logic
    const availableCityIds = useMemo(() => new Set(providers.map(p => p.city_id)), [providers]);

    const filteredProviders = useMemo(() => {
        return providers.filter(p => {
            const cityMatch = !selectedCity || p.city_id === selectedCity;
            const catMatch = !selectedCategory || p.specialty.includes(selectedCategory);
            return cityMatch && catMatch;
        });
    }, [providers, selectedCity, selectedCategory]);

    const activeProvider = filteredProviders.length > 0 ? filteredProviders[providerIndex % filteredProviders.length] : null;

    const handleConfirm = () => {
        if (activeProvider) {
            navigate(`/booking/${activeProvider.id}`);
        }
    };

    const handleBack = () => {
        if (step === 'CITY') setStep('WELCOME');
        if (step === 'SERVICE') setStep('CITY');
        if (step === 'RESULT') setStep('SERVICE');
    };

    const handleNextProvider = () => {
        if (filteredProviders.length > 1) {
            setProviderIndex((prev) => (prev + 1) % filteredProviders.length);
        }
    };

    const handlePrevProvider = () => {
        if (filteredProviders.length > 1) {
            setProviderIndex((prev) => (prev - 1 + filteredProviders.length) % filteredProviders.length);
        }
    };

    const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Carousel Navigation
        if (info.offset.x < -50) handleNextProvider();
        if (info.offset.x > 50) handlePrevProvider();
    };

    const handleStepSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Back Navigation (Swipe Right in RTL visual usually means dragging content right to reveal left?)
        // Let's assume standard "Swipe Right -> Go Back"
        if (info.offset.x > 100) {
            handleBack();
        }
    };

    const handleExplore = () => {
        if (selectedCity) {
            navigate(`/city/${selectedCity}`);
        }
    };

    return (
        <div className="relative w-full h-[600px] flex items-center justify-center font-sans select-none perspective-1000">
            <style>{etherealHLogoAnimation}</style>

            {/* Background Atmosphere */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-[3rem] blur-3xl opacity-50"
                style={{ transform: 'translateZ(0)', willChange: 'transform, opacity' }}
                animate={{
                    scale: step === 'WELCOME' ? 0.8 : 1.1,
                    opacity: step === 'WELCOME' ? 0.3 : 0.6,
                    rotate: step === 'RESULT' ? 20 : 0
                }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
            />

            {/* MAIN CARD CONTAINER */}
            <div
                className="relative w-[360px] h-[580px] rounded-[48px] bg-black/40 backdrop-blur-[60px] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col ring-1 ring-white/5 rtl"
                style={{ transform: 'translateZ(0)', willChange: 'transform' }}
            >

                {/* Status Bar & Header */}
                <div className="flex justify-between items-center px-6 py-6 z-20 relative" dir="ltr">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase opacity-50 text-white/40">HAJZK OS</span>
                    </div>
                </div>

                {/* Apple-Style Dynamic Island Back Button - Ultra Premium */}
                {step !== 'WELCOME' && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.7, y: -40, filter: 'blur(10px)' }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            transition: {
                                type: "spring",
                                stiffness: 350,
                                damping: 28,
                                mass: 0.9,
                                staggerChildren: 0.1
                            }
                        }}
                        exit={{ opacity: 0, scale: 0.85, y: -15, filter: 'blur(8px)' }}
                        whileHover={{
                            scale: 1.04,
                            y: -2,
                            transition: { type: "spring", stiffness: 500, damping: 20 }
                        }}
                        whileTap={{
                            scale: 0.96,
                            transition: { duration: 0.08 }
                        }}
                        onClick={handleBack}
                        className="absolute top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 px-5 py-2.5 rounded-[28px] overflow-hidden group cursor-pointer"
                        style={{
                            background: 'linear-gradient(165deg, rgba(58, 58, 68, 0.92) 0%, rgba(28, 28, 35, 0.98) 50%, rgba(18, 18, 24, 0.99) 100%)',
                            backdropFilter: 'blur(60px) saturate(200%)',
                            WebkitBackdropFilter: 'blur(60px) saturate(200%)',
                            boxShadow: `
                                0 0 0 0.5px rgba(255, 255, 255, 0.12),
                                0 2px 4px rgba(0, 0, 0, 0.15),
                                0 4px 8px rgba(0, 0, 0, 0.15),
                                0 8px 24px rgba(0, 0, 0, 0.25),
                                0 16px 48px rgba(0, 0, 0, 0.3),
                                inset 0 1px 1px rgba(255, 255, 255, 0.12),
                                inset 0 -1px 1px rgba(0, 0, 0, 0.1)
                            `,
                            border: 'none',
                            willChange: 'transform, opacity',
                            transform: 'translateZ(0)'
                        }}
                    >
                        {/* Premium Top Highlight Line - Apple signature */}
                        <div
                            className="absolute top-0 left-4 right-4 h-[0.5px]"
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.3) 80%, transparent 100%)'
                            }}
                        />

                        {/* Ambient Background Glow */}
                        <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out"
                            style={{
                                background: 'radial-gradient(ellipse 120% 80% at 50% 20%, rgba(120, 160, 255, 0.12) 0%, rgba(180, 140, 255, 0.06) 40%, transparent 70%)'
                            }}
                        />

                        {/* Subtle Inner Light */}
                        <div
                            className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                            style={{
                                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 50%)'
                            }}
                        />

                        {/* Premium Shimmer Sweep Effect */}
                        <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100"
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                repeatDelay: 3,
                                ease: [0.4, 0, 0.2, 1]
                            }}
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 45%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.04) 55%, transparent 100%)',
                                width: '50%'
                            }}
                        />

                        {/* Step Indicator Pill - Enhanced */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15, type: "spring", stiffness: 400 }}
                            className="relative flex items-center gap-2 px-3 py-1.5 rounded-full"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                                boxShadow: 'inset 0 0.5px 0 rgba(255, 255, 255, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1)',
                                border: '0.5px solid rgba(255, 255, 255, 0.06)'
                            }}
                        >
                            {['RESULT', 'SERVICE', 'CITY'].map((s, idx) => (
                                <motion.div
                                    key={s}
                                    className="relative"
                                    animate={{
                                        scale: step === s ? 1 : 0.85
                                    }}
                                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                >
                                    {/* Active Glow Ring */}
                                    {step === s && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full"
                                            initial={{ scale: 1, opacity: 0.6 }}
                                            animate={{
                                                scale: [1, 1.8, 1],
                                                opacity: [0.4, 0, 0.4]
                                            }}
                                            transition={{
                                                duration: 2.5,
                                                repeat: Infinity,
                                                ease: "easeOut"
                                            }}
                                            style={{
                                                background: 'radial-gradient(circle, rgba(99, 179, 237, 0.6) 0%, transparent 70%)'
                                            }}
                                        />
                                    )}
                                    <motion.div
                                        className="w-2 h-2 rounded-full relative z-10"
                                        animate={{
                                            backgroundColor: step === s ? '#63B3ED' : 'rgba(255, 255, 255, 0.2)',
                                            boxShadow: step === s
                                                ? '0 0 8px rgba(99, 179, 237, 0.6), 0 0 16px rgba(99, 179, 237, 0.3)'
                                                : '0 0 0 transparent'
                                        }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Text with Apple SF Pro styling */}
                        <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="relative text-[11px] font-semibold text-white/95 group-hover:text-white font-arabic tracking-tight transition-all duration-300"
                            style={{
                                fontFeatureSettings: '"ss01", "ss02", "cv01"',
                                textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
                                letterSpacing: '-0.01em'
                            }}
                        >
                            رجوع
                        </motion.span>

                        {/* Arrow Icon Container - Premium Glass Bubble */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                            className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                            style={{
                                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%)',
                                boxShadow: `
                                    inset 0 1px 1px rgba(255, 255, 255, 0.2),
                                    inset 0 -1px 1px rgba(0, 0, 0, 0.1),
                                    0 2px 8px rgba(0, 0, 0, 0.15)
                                `,
                                border: '0.5px solid rgba(255, 255, 255, 0.1)'
                            }}
                            whileHover={{
                                x: 4,
                                scale: 1.1,
                                transition: { type: "spring", stiffness: 500, damping: 15 }
                            }}
                        >
                            {/* Inner Glass Highlight */}
                            <div
                                className="absolute inset-0 rounded-full opacity-60"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%)'
                                }}
                            />
                            <motion.div
                                animate={{
                                    x: [0, 2, 0]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <ArrowLeft
                                    className="relative w-4 h-4 text-white/95 group-hover:text-white transition-colors duration-200"
                                    strokeWidth={2.5}
                                />
                            </motion.div>
                        </motion.div>

                        {/* Bottom Subtle Shadow Line */}
                        <div
                            className="absolute bottom-0 left-6 right-6 h-[0.5px]"
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%)'
                            }}
                        />
                    </motion.button>
                )}

                {/* Content Area */}
                <div className="flex-1 relative px-6 pb-8 flex flex-col z-10">
                    <AnimatePresence mode="wait">

                        {/* STEP 0: WELCOME */}
                        {step === 'WELCOME' && (
                            <motion.div
                                key="welcome"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                className="h-full flex flex-col justify-center items-center text-center space-y-8"
                            >
                                <div className="relative group cursor-pointer" onClick={() => setStep('CITY')}>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                                    <div className="w-32 h-32 rounded-full border border-white/10 bg-white/5 backdrop-blur-3xl flex items-center justify-center relative overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                                        {/* Logo Icon Container */}
                                        <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg scale-125">
                                            <svg
                                                width="38"
                                                height="38"
                                                viewBox="0 0 100 100"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <defs>
                                                    <linearGradient id="regalBlueFlow" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#ffffff" /> {/* White */}
                                                        <stop offset="100%" stopColor="#94a3b8" /> {/* Slate-400 */}
                                                    </linearGradient>
                                                </defs>

                                                {/* The two main vertical strokes with tails */}
                                                <g fill="url(#regalBlueFlow)" stroke="none">
                                                    <path d="M20 90 C 20 80, 25 85, 25 75 V 25 C 25 15, 20 20, 20 10 H 30 C 35 20, 30 15, 30 25 V 75 C 30 85, 35 80, 30 90 Z" className="h-stroke left" />
                                                    <path d="M70 90 C 65 80, 70 85, 70 75 V 25 C 70 15, 65 20, 70 10 H 80 C 80 20, 75 15, 75 25 V 75 C 75 85, 80 80, 80 90 Z" className="h-stroke right" />
                                                </g>

                                                {/* The perpetually waving crossbar */}
                                                <path
                                                    d="M27 50 c 16 -10, 5 10, 46 0" // Smooth 'S' curve path
                                                    stroke="url(#regalBlueFlow)"
                                                    strokeWidth="8"
                                                    strokeLinecap="round"
                                                    fill="none"
                                                    className="h-wave"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 tracking-tight font-arabic">HAJZK</h2>
                                    <p className="text-white/40 text-sm font-medium tracking-wide font-arabic leading-relaxed px-4">
                                        نظام لحجز مواعيدك<br />

                                    </p>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setStep('CITY')}
                                    className="px-8 py-4 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all flex items-center gap-2"
                                >
                                    <span>بدء الحجز</span>
                                    <ArrowLeft className="w-4 h-4" />
                                </motion.button>
                            </motion.div>
                        )}

                        {/* STEP 1: CITY SELECTION */}
                        {step === 'CITY' && (
                            <motion.div
                                key="city"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={handleStepSwipe}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="h-full flex flex-col pt-10"
                            >
                                <h3 className="text-2xl font-bold text-white mb-6 pr-2 font-arabic">إختر مدينتك</h3>

                                <div className="space-y-3 overflow-y-auto max-h-[380px] custom-scrollbar pb-4 pr-1 pl-1">
                                    {Object.entries(cityMap).map(([key, name]) => {
                                        const isAvailable = availableCityIds.has(key);

                                        return (
                                            <motion.button
                                                key={key}
                                                disabled={!isAvailable}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: isAvailable ? 1 : 0.5, y: 0 }}
                                                whileHover={isAvailable ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
                                                whileTap={isAvailable ? { scale: 0.98 } : {}}
                                                onClick={() => { setSelectedCity(key); setStep('SERVICE'); setProviderIndex(0); }}
                                                className={`w-full p-4 rounded-2xl border flex items-center justify-between group transition-all ${isAvailable
                                                    ? 'bg-white/5 border-white/5 cursor-pointer'
                                                    : 'bg-black/20 border-white/5 cursor-not-allowed grayscale opacity-50'
                                                    }`}
                                            >
                                                <span className={`text-lg font-medium transition-colors ${isAvailable ? 'text-white group-hover:text-golden' : 'text-white/30'}`}>
                                                    {name as string}
                                                </span>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAvailable ? 'bg-black/20' : 'bg-black/10'}`}>
                                                    <MapPin className={`w-4 h-4 transition-colors ${isAvailable ? 'text-white/50 group-hover:text-golden' : 'text-white/20'}`} />
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: SERVICE SELECTION */}
                        {step === 'SERVICE' && (
                            <motion.div
                                key="service"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={handleStepSwipe}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="h-full flex flex-col pt-10"
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <button
                                        onClick={() => setStep('CITY')}
                                        className="flex items-center gap-2 text-white/50 hover:text-golden transition-colors text-xs font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-full"
                                    >
                                        <MapPin className="w-3 h-3" />
                                        <span>{cityMap[selectedCity]}</span>
                                    </button>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-8 font-arabic">ما هي الخدمة؟</h3>

                                {/* Apple-Style Premium Categories Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    {categories.map((cat, idx) => (
                                        <motion.button
                                            key={cat.id}
                                            initial={{ opacity: 0, scale: 0.85, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{
                                                delay: idx * 0.08,
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20
                                            }}
                                            whileHover={{
                                                scale: 1.05,
                                                y: -4,
                                                transition: { type: "spring", stiffness: 400, damping: 15 }
                                            }}
                                            whileTap={{
                                                scale: 0.95,
                                                transition: { duration: 0.1 }
                                            }}
                                            onClick={() => { setSelectedCategory(cat.id); setStep('RESULT'); setProviderIndex(0); }}
                                            className="relative aspect-[4/3] rounded-[1.75rem] overflow-hidden group cursor-pointer"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(50, 50, 60, 0.8) 0%, rgba(30, 30, 40, 0.9) 100%)',
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 0 0.5px rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            {/* Glass Overlay */}
                                            <div
                                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                style={{
                                                    background: 'radial-gradient(ellipse at 50% 30%, rgba(147, 197, 253, 0.15) 0%, transparent 70%)'
                                                }}
                                            />

                                            {/* Border Glow Effect */}
                                            <motion.div
                                                className="absolute inset-0 rounded-[1.75rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                style={{
                                                    border: '1px solid rgba(147, 197, 253, 0.3)',
                                                    boxShadow: '0 0 20px rgba(147, 197, 253, 0.1)'
                                                }}
                                            />

                                            {/* Content */}
                                            <div className="relative h-full flex flex-col items-center justify-center gap-3 p-4">
                                                {/* Icon Container with Glow */}
                                                <motion.div
                                                    className="relative"
                                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                >
                                                    <span className="text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">{cat.icon}</span>
                                                    {/* Icon Glow Ring */}
                                                    <div className="absolute inset-0 rounded-full bg-white/5 blur-md scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </motion.div>

                                                {/* Label with Premium Typography */}
                                                <span
                                                    className="text-sm font-semibold text-white/90 group-hover:text-white font-arabic transition-colors duration-200"
                                                    style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
                                                >
                                                    {cat.label}
                                                </span>
                                            </div>

                                            {/* Top Highlight */}
                                            <div
                                                className="absolute top-0 left-1/4 right-1/4 h-[1px]"
                                                style={{
                                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)'
                                                }}
                                            />
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Apple-Style Premium "Explore All" Button */}
                                <motion.button
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        delay: 0.25,
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20
                                    }}
                                    whileHover={{
                                        scale: 1.02,
                                        transition: { duration: 0.2 }
                                    }}
                                    whileTap={{
                                        scale: 0.98,
                                        transition: { duration: 0.1 }
                                    }}
                                    onClick={handleExplore}
                                    className="relative w-full mt-4 overflow-hidden rounded-[20px] group cursor-pointer"
                                >
                                    {/* Animated Gradient Border */}
                                    <motion.div
                                        className="absolute inset-0 rounded-[20px] p-[1.5px]"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.5) 0%, rgba(196, 181, 253, 0.5) 25%, rgba(251, 207, 232, 0.5) 50%, rgba(196, 181, 253, 0.5) 75%, rgba(147, 197, 253, 0.5) 100%)',
                                            backgroundSize: '300% 300%'
                                        }}
                                        animate={{
                                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                    />

                                    {/* Inner Glass Container */}
                                    <div
                                        className="relative m-[1.5px] rounded-[18.5px] py-5 px-6 flex items-center justify-between"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(25, 25, 35, 0.95) 0%, rgba(35, 35, 50, 0.9) 100%)',
                                            backdropFilter: 'blur(20px) saturate(180%)',
                                            WebkitBackdropFilter: 'blur(20px) saturate(180%)'
                                        }}
                                    >
                                        {/* Ambient Glow on Hover */}
                                        <motion.div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-[18.5px] transition-opacity duration-500"
                                            style={{
                                                background: 'radial-gradient(ellipse at 30% 50%, rgba(147, 197, 253, 0.12) 0%, transparent 60%)'
                                            }}
                                        />

                                        {/* Shimmer Effect */}
                                        <motion.div
                                            className="absolute inset-0 rounded-[18.5px] opacity-0 group-hover:opacity-100"
                                            style={{
                                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                                                transform: 'translateX(-100%)'
                                            }}
                                            animate={{
                                                transform: ['translateX(-100%)', 'translateX(100%)']
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                repeatDelay: 1,
                                                ease: "easeInOut"
                                            }}
                                        />

                                        {/* Icon + Text Section */}
                                        <div className="relative flex items-center gap-4">
                                            {/* Grid Icon with Glow */}
                                            <motion.div
                                                className="relative w-12 h-12 rounded-2xl flex items-center justify-center"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.2) 0%, rgba(196, 181, 253, 0.15) 100%)',
                                                    boxShadow: '0 4px 12px rgba(147, 197, 253, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                                }}
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 5,
                                                    transition: { type: "spring", stiffness: 400 }
                                                }}
                                            >
                                                {/* Inner Glow */}
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-400/10 blur-sm" />
                                                <Grid className="relative w-5 h-5 text-blue-300" strokeWidth={2} />
                                            </motion.div>

                                            {/* Text Content */}
                                            <div className="flex flex-col items-start gap-0.5">
                                                <span
                                                    className="text-[15px] font-semibold text-white font-arabic"
                                                    style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
                                                >
                                                    عرض كل الخيارات
                                                </span>
                                                <span className="text-[12px] text-blue-300/70 font-medium font-arabic flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {cityMap[selectedCity]}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Arrow with Animation */}
                                        <motion.div
                                            className="relative w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                                                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.2)'
                                            }}
                                            whileHover={{
                                                scale: 1.15,
                                                x: -3,
                                                transition: { type: "spring", stiffness: 400 }
                                            }}
                                        >
                                            {/* Pulse Ring */}
                                            <motion.div
                                                className="absolute inset-0 rounded-full border border-blue-400/30"
                                                animate={{
                                                    scale: [1, 1.3, 1],
                                                    opacity: [0.5, 0, 0.5]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeOut"
                                                }}
                                            />
                                            <ExternalLink className="w-4 h-4 text-white/90 group-hover:text-white transition-colors" strokeWidth={2.5} />
                                        </motion.div>

                                        {/* Top Highlight Line */}
                                        <div
                                            className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] rounded-full"
                                            style={{
                                                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)'
                                            }}
                                        />
                                    </div>
                                </motion.button>
                            </motion.div>
                        )}

                        {/* STEP 3: RESULT CAROUSEL */}
                        {step === 'RESULT' && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full flex flex-col pt-4"
                            >
                                {/* Header / Summary Breadcrumbs */}
                                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                    <button
                                        onClick={() => setStep('CITY')}
                                        className="whitespace-nowrap px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[10px] text-white/70 hover:text-white border border-white/5 transition-all"
                                    >
                                        {cityMap[selectedCity]}
                                    </button>
                                    <ArrowLeft className="w-3 h-3 text-white/20" />
                                    <button
                                        onClick={() => setStep('SERVICE')}
                                        className="whitespace-nowrap px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[10px] text-white/70 hover:text-white border border-white/5 transition-all"
                                    >
                                        {selectedCategory}
                                    </button>
                                </div>

                                {/* THE SWIPEABLE CARD */}
                                <div className="relative w-full flex-1 mb-8 perspective-1000">
                                    <AnimatePresence mode="wait">
                                        {activeProvider ? (
                                            <motion.div
                                                key={activeProvider.id}
                                                drag="x"
                                                dragConstraints={{ left: 0, right: 0 }}
                                                dragElastic={0.2}
                                                onDragEnd={handleSwipe}
                                                initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                                                className="w-full h-full bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#D4AF37] rounded-[32px] p-[1px] shadow-[0_20px_60px_rgba(251,191,36,0.2)] cursor-grab active:cursor-grabbing"
                                            >
                                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay rounded-[32px]"></div>

                                                <div className="w-full h-full bg-[#121212] rounded-[31px] relative overflow-hidden flex flex-col">
                                                    {/* Golden Top Glow */}
                                                    <div className="absolute top-0 inset-x-0 h-24 bg-golden/20 blur-[40px]"></div>

                                                    {/* Provider Info */}
                                                    <div className="p-6 relative z-10 text-center flex-1 flex flex-col items-center justify-center">
                                                        <div className="w-28 h-28 rounded-full p-1.5 bg-gradient-to-tr from-golden to-transparent mb-5 shadow-2xl">
                                                            <img
                                                                src={activeProvider.image_filename || "https://tinyurl.com/3kp7r9rj"}
                                                                className="w-full h-full rounded-full object-cover border-4 border-[#121212]"
                                                                alt="Provider"
                                                            />
                                                        </div>
                                                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight px-4">{activeProvider.name}</h3>
                                                        <p className="text-golden text-sm font-medium bg-golden/10 px-3 py-1 rounded-full">{activeProvider.specialty}</p>
                                                    </div>

                                                    {/* Carousel Indicators / Nav */}
                                                    {filteredProviders.length > 1 && (
                                                        <div className="flex justify-between items-center px-4 w-full absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handlePrevProvider(); }}
                                                                className="pointer-events-auto p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all backdrop-blur-sm"
                                                            >
                                                                <ChevronRight className="w-6 h-6" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleNextProvider(); }}
                                                                className="pointer-events-auto p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all backdrop-blur-sm"
                                                            >
                                                                <ChevronLeft className="w-6 h-6" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Action Area */}
                                                    <div className="p-6 pt-0 mt-auto">
                                                        {/* Desktop Navigation Hints & Swipe Hint */}
                                                        {filteredProviders.length > 1 && (
                                                            <div className="flex flex-col items-center gap-3 mb-4">
                                                                {/* Dots */}
                                                                <div className="flex gap-1.5">
                                                                    {filteredProviders.map((_, idx) => (
                                                                        <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === providerIndex % filteredProviders.length ? 'bg-golden w-3' : 'bg-white/10'}`}></div>
                                                                    ))}
                                                                </div>

                                                                {/* Swipe Hint */}
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 0.5 }}
                                                                    className="flex items-center gap-2 text-[10px] text-white/30 font-arabic"
                                                                >
                                                                    <ChevronRight className="w-3 h-3 animate-pulse" />
                                                                    <span>اسحب للتنقل</span>
                                                                    <ChevronLeft className="w-3 h-3 animate-pulse" />
                                                                </motion.div>
                                                            </div>
                                                        )}

                                                        <div className="relative group">
                                                            <div className="absolute -inset-1 bg-gradient-to-r from-golden to-amber-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                                            <button
                                                                onClick={handleConfirm}
                                                                className="relative w-full py-4 rounded-xl font-bold text-black bg-golden shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                                            >
                                                                <span>Confirm Booking فوراً</span>
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="w-full h-full bg-[#121212] rounded-[32px] border border-white/10 flex flex-col items-center justify-center text-center p-8"
                                            >
                                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                                    <Search className="w-8 h-8 text-white/30" />
                                                </div>
                                                <h3 className="text-white font-bold text-xl mb-2">عذراً</h3>
                                                <p className="text-white/40 text-sm">لا يوجد مقدمي خدمة متاحين في هذا التصنيف حالياً.</p>
                                                <button onClick={handleBack} className="mt-6 text-golden text-sm font-bold hover:underline">
                                                    جرب خياراً آخر
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Ambient Reflection */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[200px] h-[20px] bg-white/10 blur-[40px] rounded-full pointer-events-none"></div>

        </div>
    );
};

export default UnifiedRosieBooking;
