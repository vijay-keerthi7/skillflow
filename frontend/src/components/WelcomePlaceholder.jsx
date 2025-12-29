import React from 'react';

const WelcomePlaceholder = () => {
  return (
    <div className="hidden md:flex flex-col items-center justify-center w-full h-full p-10 text-center">
      
      {/* Central Glass Illustration */}
      <div className="relative mb-8 flex justify-center items-center">
        {/* Animated background glow */}
        <div className="absolute w-48 h-48 bg-cyan-400/20 rounded-full blur-[60px] animate-pulse"></div>
        
        {/* Main Icon Container */}
        <div className="relative z-10 w-32 h-32 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[40px] flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
          <i className='bx bx-message-square-dots text-6xl text-white'></i>
        </div>
        
        {/* Floating Mini Icons */}
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
          <i className='bx bxl-whatsapp text-2xl'></i>
        </div>
        <div className="absolute -bottom-2 -left-6 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white/60 shadow-lg">
          <i className='bx bxl-messenger text-xl'></i>
        </div>
      </div>

      {/* Text Content */}
      <div className="max-w-xs">
        <h2 className="text-2xl font-bold text-white mb-3">SkillFlow Messages</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          Select a contact from the list on the left to start a new conversation or view existing messages.
        </p>
      </div>

      {/* Social Media Style Icons Row */}
      <div className="flex gap-6 mt-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10">
          <i className='bx bxl-instagram text-2xl text-white'></i>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10">
          <i className='bx bxl-linkedin text-2xl text-white'></i>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10">
          <i className='bx bxl-twitter text-2xl text-white'></i>
        </div>
      </div>

      {/* Bottom Security Note */}
      <div className="mt-12 flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-[2px]">
        <i className='bx bx-lock-alt'></i>
        <span>End-to-End Encrypted</span>
      </div>
    </div>
  );
};

export default WelcomePlaceholder;