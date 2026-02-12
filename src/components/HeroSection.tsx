"use client"; // Add this if using Next.js App Router

import React from 'react';
import ProgressiveBookingFlow from "./ProgressiveBookingFlow";

const HeroSection = () => {

  return (
    <section id="home" className="hero-section pt-24 min-h-screen flex items-center text-white overflow-hidden relative">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 flex justify-center items-center min-h-[700px]">
        <div className="w-full max-w-md transform transition-all duration-700 hover:scale-[1.02]">
          <ProgressiveBookingFlow />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;