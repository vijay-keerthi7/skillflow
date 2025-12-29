import React from 'react';

const ProfileSidebar = ({ isOpen, onClose }) => {
  return (
    <div className={`fixed inset-0 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Dark Overlay for the rest of the screen */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>

      {/* Sidebar Content */}
      <div className="relative w-full md:w-[350px] lg:w-[400px] h-full bg-[#1D546D] border-r border-white/10 shadow-2xl flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-10 bg-white/10 backdrop-blur-md flex items-end gap-6 text-white">
          <button onClick={onClose} className="mb-1 hover:scale-110 transition-transform">
            <i className='bx bx-arrow-back text-2xl'></i>
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
        </header>

        {/* Profile Details */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          {/* Large Avatar */}
          <div className="relative group cursor-pointer mb-8">
            <img 
              src="https://i.pravatar.cc/150?u=me" 
              alt="My Profile" 
              className="w-40 h-40 rounded-full border-4 border-white/20 shadow-2xl transition-all group-hover:opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <i className='bx bx-camera text-4xl text-white'></i>
            </div>
          </div>

          {/* Info Blocks */}
          <div className="w-full space-y-8">
            <div className="space-y-1">
              <label className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Your Name</label>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white text-lg">Arjun Mehta</span>
                <i className='bx bx-pencil text-white/40 cursor-pointer hover:text-cyan-400'></i>
              </div>
              <p className="text-[11px] text-white/30 pt-2">This is not your username or pin. This name will be visible to your SkillFlow contacts.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-cyan-400 font-bold uppercase tracking-widest">About</label>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white">Coding my way through the MERN stack 🚀</span>
                <i className='bx bx-pencil text-white/40 cursor-pointer hover:text-cyan-400'></i>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Settings</label>
              <div className="flex flex-col gap-4 pt-4">
                 <div className="flex items-center gap-4 text-white/70 hover:text-white cursor-pointer">
                    <i className='bx bx-bell text-xl'></i>
                    <span>Notifications</span>
                 </div>
                 <div className="flex items-center gap-4 text-white/70 hover:text-white cursor-pointer">
                    <i className='bx bx-lock-alt text-xl'></i>
                    <span>Privacy</span>
                 </div>
                 <div className="flex items-center gap-4 text-rose-400 hover:text-rose-300 cursor-pointer">
                    <i className='bx bx-log-out text-xl'></i>
                    <span>Logout</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;