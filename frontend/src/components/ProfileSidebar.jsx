import React, { useState, useContext, useRef } from 'react';
import { usersContext } from '../context/UsersContext';
import axios from 'axios';

const ProfileSidebar = ({ isOpen, onClose }) => {
const { setUsers, socket } = useContext(usersContext);
  const fileInputRef = useRef(null);
  
  // Get current user from storage
  const user = JSON.parse(localStorage.getItem('skillflow_user'));
  const userId = user?._id || user?.id;

  // States
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [about, setAbout] = useState(user?.about || "Available");
  const [profilepic, setProfilepic] = useState(user?.profilepic || "");

  // 1. Handle Image Selection & Conversion
  const handleImageClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Convert to Base64
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilepic(base64String);
        handleUpdate(name, about, base64String); // Auto-save image
      };
    }
  };

  // 2. Combined Update Function
  const handleUpdate = async (updatedName = name, updatedAbout = about, updatedPic = profilepic) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/auth/update-profile`, {
        userId,
        name: updatedName,
        about: updatedAbout,
        profilepic: updatedPic
      });

      // Update LocalStorage
      localStorage.setItem('skillflow_user', JSON.stringify(res.data));
      
      // Update Context (Sidebar & Chat Header)
      setUsers(prev => prev.map(u => u._id === res.data._id ? res.data : u));
      if (socket) {
        socket.emit("updateProfile", res.data);
    }
      setIsEditingName(false);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full md:w-[350px] lg:w-[400px] h-full bg-[#1D546D] border-r border-white/10 shadow-2xl flex flex-col">
        
        <header className="px-6 py-10 bg-white/10 backdrop-blur-md flex items-end gap-6 text-white text-bold">
          <button onClick={onClose} className="mb-1 hover:scale-110 transition-transform">
            <i className='bx bx-arrow-back text-2xl'></i>
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          
          {/* --- AVATAR SECTION WITH UPLOAD --- */}
          <div className="relative group cursor-pointer mb-8" onClick={handleImageClick}>
            <img 
              src={profilepic || "https://i.pravatar.cc/150"} 
              className="w-40 h-40 rounded-full border-4 border-white/20 shadow-2xl transition-all group-hover:opacity-70 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <i className='bx bx-camera text-4xl text-white'></i>
            </div>
            {/* Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="w-full space-y-8">
            {/* --- NAME SECTION --- */}
            <div className="space-y-1">
              <label className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Your Name</label>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                {isEditingName ? (
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                    onBlur={() => handleUpdate()} 
                    autoFocus
                    className="bg-transparent text-white text-lg outline-none w-full"
                  />
                ) : (
                  <span className="text-white text-lg">{name}</span>
                )}
                <i 
                  className={`bx ${isEditingName ? 'bx-check text-emerald-400' : 'bx-pencil text-white/40'} cursor-pointer hover:text-cyan-400`}
                  onClick={() => isEditingName ? handleUpdate() : setIsEditingName(true)}
                ></i>
              </div>
              <p className="text-[11px] text-white/30 pt-2">This is not your username. This name will be visible to your SkillFlow contacts.</p>
            </div>

            {/* --- ABOUT SECTION --- */}
            <div className="space-y-1">
              <label className="text-xs text-cyan-400 font-bold uppercase tracking-widest">About</label>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <input 
                  value={about} 
                  onChange={(e) => setAbout(e.target.value)}
                  onBlur={() => handleUpdate()}
                  className="bg-transparent text-white outline-none w-full"
                />
                <i className='bx bx-pencil text-white/40'></i>
              </div>
            </div>

            {/* --- SETTINGS & LOGOUT --- */}
            <div className="space-y-1 pt-4">
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4 text-white/70 hover:text-white cursor-pointer transition-colors">
                  <i className='bx bx-lock-alt text-xl'></i>
                  <span>Privacy Settings</span>
                </div>
                <div 
                  onClick={() => {
                    localStorage.removeItem('skillflow_user');
                    window.location.href = '/login';
                  }} 
                  className="flex items-center gap-4 text-rose-400 hover:text-rose-300 cursor-pointer transition-colors"
                >
                  <i className='bx bx-log-out text-xl'></i>
                  <span className="font-semibold">Logout</span>
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