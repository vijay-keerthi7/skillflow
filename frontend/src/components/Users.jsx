import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import React, { useContext, useState, useEffect } from 'react';
import { usersContext } from '../context/UsersContext';
import WelcomePlaceholder from './WelcomePlaceholder';
import ProfileSidebar from './ProfileSidebar';

const Users = () => {
  const { users, loading, onlineUsers } = useContext(usersContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isChatOpen = location.pathname.includes('/chat/');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const currentUser = JSON.parse(localStorage.getItem('skillflow_user'));

  if (loading) return (
    <div className="h-screen w-full bg-[#1D546D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
    </div>
  );

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    user._id !== (currentUser?._id || currentUser?.id)
  );

  return (
    <div className="flex h-screen w-full bg-[#1D546D] overflow-hidden">
      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* LEFT SIDE: User List */}
      <div className={`flex-col w-full md:w-[350px] lg:w-[400px] border-r border-white/10 flex
        ${isChatOpen ? 'hidden md:flex' : 'flex'}`}>
        
        <header className="px-4 py-3 bg-white/10 backdrop-blur-xl border-b border-white/10 flex items-center gap-3 shrink-0">
          <div 
            className="relative cursor-pointer shrink-0 group"
            onClick={() => setIsProfileOpen(true)}
          >
            <img 
              src={currentUser?.profilepic || "https://i.pravatar.cc/150?u=default"} 
              alt="My Profile" 
              className="w-10 h-10 rounded-full border border-white/30 group-hover:border-cyan-400 transition-all object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#1D546D] rounded-full"></div>
          </div>

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
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              // --- DEFINING isOnline INSIDE THE MAP ---
              const isOnline = onlineUsers?.includes(user._id);

              return (
                <div
                  key={user._id}
                  onClick={() => navigate(`/chat/${user._id}`)}
                  className="flex items-center px-6 py-4 hover:bg-white/5 active:bg-white/10 cursor-pointer transition-all border-b border-white/5 group"
                >
                  <div className="relative shrink-0">
                    <img src={user.profilepic} className="w-12 h-12 rounded-full object-cover border border-white/10" alt={user.name} />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#1D546D] rounded-full"></span>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-[16px] font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {user.name}
                      </h3>
                      <span className="text-[11px] text-white/30 whitespace-nowrap ml-2">
                        {isOnline ? 'Online' : user.lastseen || 'Offline'}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 truncate pr-2">
                      {user.email}
                    </p>
                    {user.unreadCount > 0 && (
    <div className="bg-cyan-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-lg animate-bounce">
      {user.unreadCount}
    </div>
  )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-40 opacity-30 text-white">
              <i className="bx bx-search-alt text-4xl mb-2"></i>
              <p className="text-sm">No results found</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Chat Detail */}
      <div className={`flex-1 h-full ${!isChatOpen ? 'hidden md:flex' : 'flex'}`}>
        {isChatOpen ? (
          <Outlet /> 
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center w-full text-white/10 bg-[#1D546D]">
            <i className='bx bx-message-rounded-dots text-[120px] mb-4'></i>
            <h2 className="text-2xl font-light tracking-widest uppercase">SkillFlow</h2>
            <p className="mt-2 text-white/30">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;