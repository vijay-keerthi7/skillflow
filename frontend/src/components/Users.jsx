import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import React, { useContext, useState, useEffect } from 'react';
import { usersContext } from '../context/UsersContext';
import ProfileSidebar from './ProfileSidebar';

const Users = () => {
  const { users, setUsers, loading, onlineUsers, socket } = useContext(usersContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const currentUser = JSON.parse(localStorage.getItem('skillflow_user'));
  const currentUserId = currentUser?._id || currentUser?.id;
  const isChatOpen = location.pathname.includes('/chat/');

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const isMeSender = msg.senderId === currentUserId;
      const partnerId = isMeSender ? msg.receiverId : msg.senderId;
      const isChatActive = location.pathname.includes(partnerId);

      setUsers((prevUsers) => {
        const updated = prevUsers.map((u) => {
          if (u._id === partnerId) {
            return {
              ...u,
              lastMessage: msg.image ? "Photo" : msg.text,
              lastMessageTime: msg.createdAt || new Date().toISOString(),
              lastMessageIsImage: !!msg.image,
              // SINGLE SOURCE OF TRUTH FOR BADGE
              unreadCount: (!isMeSender && !isChatActive) 
                ? (u.unreadCount || 0) + 1 
                : u.unreadCount
            };
          }
          return u;
        });

        // SORTING: Newest message jumps to top
        return [...updated].sort((a, b) => 
            new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0)
        );
      });
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, location.pathname, currentUserId, setUsers]);

  const handleUserClick = (userId) => {
    navigate(`/chat/${userId}`);
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, unreadCount: 0 } : u));
  };

  if (loading) return (
    <div className="h-screen w-full bg-[#1D546D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
    </div>
  );

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) && user._id !== currentUserId
  );

  return (
    <div className="flex h-screen w-full bg-[#1D546D] overflow-hidden">
      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <div className={`flex-col w-full md:w-[350px] lg:w-[400px] border-r border-white/10 flex ${isChatOpen ? 'hidden md:flex' : 'flex'}`}>
        
        <header className="px-4 py-3 bg-white/10 backdrop-blur-xl border-b border-white/10 flex items-center gap-3 shrink-0">
          <div className="relative cursor-pointer group" onClick={() => setIsProfileOpen(true)}>
            <img src={currentUser?.profilepic} className="w-10 h-10 rounded-full border border-white/30 object-cover" alt="Me" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#1D546D] rounded-full"></div>
          </div>
          <div className="flex-1 relative flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1.5 focus-within:bg-white/10 transition-all">
            <i className='bx bx-search text-white/30 mr-2 text-lg'></i>
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
          {filteredUsers.map((user) => (
            <div 
              key={user._id} 
              onClick={() => handleUserClick(user._id)}
              className={`flex items-center p-3 cursor-pointer hover:bg-white/5 transition-all ${location.pathname.includes(user._id) ? 'bg-white/10' : ''}`}
            >
              <div className="relative">
                <img src={user.profilepic} className="w-12 h-12 rounded-full object-cover border border-white/10" alt="" />
                {onlineUsers.includes(user._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1D546D] rounded-full"></div>
                )}
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between">
                  <h3 className="text-white font-medium truncate">{user.name}</h3>
                  <span className="text-[10px] text-white/40">
                    {user.lastMessageTime && new Date(user.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-0.5">
                  <div className={`flex items-center gap-1.5 text-xs truncate ${user.unreadCount > 0 ? 'text-cyan-400 font-bold' : 'text-white/50'}`}>
                    {/* CAMERA ICON */}
                    {(user.lastMessageIsImage || user.lastMessage === "Photo") && (
                        <i className='bx bx-camera text-sm text-cyan-400'></i>
                    )}
                    <p className={`truncate ${user.lastMessage === "Photo" ? 'italic' : ''}`}>
                        {user.lastMessage || "Start a conversation"}
                    </p>
                  </div>
                  {user.unreadCount > 0 && (
                    <div className="bg-cyan-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-bounce">
                      {user.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 h-full ${!isChatOpen ? 'hidden md:flex' : 'flex'}`}>
        <Outlet /> 
      </div>
    </div>
  );
};

export default Users;