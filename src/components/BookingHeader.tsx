import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Calendar, Clock, Check } from 'lucide-react';

interface BookingHeaderProps {
  isDateTimeSelected?: boolean;
}

const BookingHeader: React.FC<BookingHeaderProps> = ({ isDateTimeSelected = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse position values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation (very subtle, 3-5 degrees)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    // Calculate normalized mouse position (-0.5 to 0.5)
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    // Reset position smoothly
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className="relative w-full pt-0 pb-6 md:pt-0 md:pb-8 px-2 md:px-6 flex flex-col items-center justify-center gap-2 perspective-[1200px] overflow-visible"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background soft glow - not overpowering */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden">
        <div className="w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-golden/10 rounded-full filter blur-[80px] opacity-60"></div>
      </div>

      {/* The Appointment Orbit (3D Element) */}
      <motion.div
        className="relative z-10 flex items-center justify-center pointer-events-none -mb-4 md:-mb-8 w-64 h-64 md:w-80 md:h-80"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
      >
        {/* Subtle continuous rotation for the orbit ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute w-40 h-40 md:w-56 md:h-56 rounded-full border-[1px] border-golden/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
          style={{ transform: "translateZ(-20px)" }}
        />

        {/* Secondary inner ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute w-28 h-28 md:w-40 md:h-40 rounded-full border-[1px] border-golden/20 border-dashed"
          style={{ transform: "translateZ(-10px)" }}
        />

        {/* Central 3D Glass Calendar */}
        <div
          className="relative w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/50 backdrop-blur-xl border border-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.1),0_0_0_1px_rgba(212,175,55,0.15)_inset] flex flex-col items-center justify-center overflow-hidden"
          style={{ transform: "translateZ(30px)" }}
        >
          {/* Calendar Header Line */}
          <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-golden/60 via-golden to-golden/60"></div>

          <div className="text-4xl font-extrabold text-gray-900 tracking-tighter mt-3 drop-shadow-sm">
            15
          </div>
          <div className="text-[10px] md:text-xs font-bold text-golden tracking-widest uppercase mt-0.5">
            AUG
          </div>

          {/* Dynamic Checkmark or Clock based on selection state */}
          <motion.div
            className="mt-2 md:mt-3"
            initial={false}
            animate={{
              scale: isDateTimeSelected ? 1.1 : 0.9,
              opacity: 1
            }}
          >
            {isDateTimeSelected ? (
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 text-white">
                <Check className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={4} />
              </div>
            ) : (
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-golden/10 flex items-center justify-center border border-golden/30 text-golden shadow-inner">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
              </div>
            )}
          </motion.div>
        </div>

        {/* Floating Icons */}
        <motion.div
          className="absolute top-8 right-8 md:top-12 md:right-12 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-xl flex items-center justify-center text-gray-600"
          style={{ transform: "translateZ(60px)" }}
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Calendar className="w-5 h-5 text-golden" />
        </motion.div>

        {/* Tiny Gold Particles */}
        <motion.div
          className="absolute bottom-16 left-12 md:bottom-20 md:left-20 w-2.5 h-2.5 bg-golden rounded-full shadow-[0_0_12px_rgba(212,175,55,0.8)]"
          style={{ transform: "translateZ(50px)" }}
          animate={{ y: [0, 12, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-20 left-16 md:top-24 md:left-24 w-1.5 h-1.5 bg-golden rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"
          style={{ transform: "translateZ(20px)" }}
          animate={{ y: [0, -8, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </motion.div>

      {/* Main Text Content */}
      <div className="relative z-10 flex flex-col items-center text-center min-w-0">
        <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 tracking-wide mb-2 md:mb-3 whitespace-normal font-serif">
          Schedule Your Appointment
        </h2>
        <p className="text-base lg:text-lg text-gray-500 font-medium tracking-wide">
          Select your preferred service, date, and time
        </p>
      </div>

    </div>
  );
};

export default BookingHeader;
