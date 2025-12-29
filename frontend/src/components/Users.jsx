import { Outlet, useNavigate,useLocation } from 'react-router-dom';
import React,{useContext, useState} from 'react';
import { usersContext } from '../context/UsersContext';
import WelcomePlaceholder from './WelcomePlaceholder';
import ProfileSidebar from './ProfileSidebar';

const Users = () => {
  const users = useContext(usersContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isChatOpen = location.pathname.includes('/chat/');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search

const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-[#1D546D] overflow-hidden">
      {/* Sidebar Component */}
      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* LEFT SIDE: User List (Hidden on mobile when chat is open) */}
      <div className={`flex-col w-full md:w-[350px] lg:w-[400px] border-r border-white/10 flex
        ${window.location.pathname.includes('/chat/') ? 'hidden md:flex' : 'flex'}`}>
        
        <header className="px-4 py-3 bg-white/10 backdrop-blur-xl border-b border-white/10 flex items-center gap-3 shrink-0">
  
  {/* 1. Profile Trigger (Left) */}
  <div 
    className="relative cursor-pointer shrink-0 group"
    onClick={() => setIsProfileOpen(true)}
  >
    <img 
      src="https://i.pravatar.cc/150?u=myuniqueid" 
      alt="My Profile" 
      className="w-10 h-10 rounded-full border border-white/30 group-hover:border-cyan-400 transition-all object-cover"
    />
    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#1D546D] rounded-full"></div>
  </div>

  {/* 2. Search Bar (Middle - Expands to fill space) */}
  <div className="flex-1 relative flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1.5 group focus-within:bg-white/10 focus-within:border-cyan-400/30 transition-all">
    <i className='bx bx-search text-white/30 group-focus-within:text-cyan-400 mr-2 text-lg'></i>
    <input 
      type="text" 
      placeholder="Search..."
      className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/20"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  {/* 3. Action Icons (Right) */}
  <div className="flex gap-2 text-white/50 shrink-0">
    <button className="p-2 hover:text-white transition-colors">
      <i className='bx bx-message-square-add text-xl'></i>
    </button>
  </div>
</header>
       <div className="flex-1 overflow-y-auto custom-scrollbar">
  {filteredUsers.length > 0 ? (
    /* 1. Use filteredUsers here so the search actually works! */
    filteredUsers.map((user) => (
      <div
        key={user.id}
        onClick={() => navigate(`/chat/${user.id}`)}
        className="flex items-center px-6 py-4 hover:bg-white/5 active:bg-white/10 cursor-pointer transition-all border-b border-white/5 group"
      >
        {/* Profile Image Section */}
        <div className="relative flex-shrink-0">
          <div className="p-[2px] rounded-full border border-white/20 group-hover:border-white/40 transition-colors">
            <img
              src={user.profilepic}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover shadow-lg"
            />
          </div>
          {/* Status Indicator */}
          {user.status === 'online' && (
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#1D546D] rounded-full shadow-lg"></span>
          )}
        </div>

        {/* Text Content Section */}
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1">
            <h3 className="text-[16px] font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
              {user.name}
            </h3>
            <span className="text-[11px] text-white/30 whitespace-nowrap ml-2">
              {user.lastseen === 'Active now' ? 'Just now' : user.lastseen}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-white/50 truncate pr-2">
              @{user.username}
            </p>
            
            {/* Optional: Unread badge or checkmark icon */}
            {user.id % 3 === 0 && (
              <span className="bg-cyan-500 text-[10px] text-white h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full font-bold">
                2
              </span>
            )}
          </div>
        </div>
      </div>
    ))
  ) : (
    /* 2. Empty State when no one matches the search */
    <div className="flex flex-col items-center justify-center h-40 opacity-30 text-white">
      <i className="bx bx-search-alt text-4xl mb-2"></i>
      <p className="text-sm">No results found</p>
    </div>
  )}
</div>
      </div>

      {/* RIGHT SIDE: Chat Detail (Full screen on mobile, right side on desktop) */}
      <div className={`flex-1 h-full ${!window.location.pathname.includes('/chat/') ? 'hidden md:flex' : 'flex'}`}>
        {/* If no chat is selected on Desktop, show a placeholder */}
        {isChatOpen ? (
          <Outlet /> 
        ) : (
          <WelcomePlaceholder />
        )}
        {!window.location.pathname.includes('/chat/') && (
          <div className="hidden md:flex flex-col items-center justify-center w-full text-white/20">
            <i className='bx bx-message-rounded-dots text-8xl'></i>
            <p className="mt-4 text-xl">Select a user to start messaging</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Users;