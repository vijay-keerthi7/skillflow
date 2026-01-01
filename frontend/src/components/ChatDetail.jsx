import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersContext } from '../context/UsersContext';
import axios from 'axios';
import AttachmentMenu from './AttachmentMenu';
const ChatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, setUsers, onlineUsers, socket } = useContext(usersContext);
  
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const scrollRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('skillflow_user'));
  const currentUserId = currentUser?._id || currentUser?.id; 

  const activeUser = users?.find((u) => u._id === id);
  const isUserOnline = onlineUsers?.includes(activeUser?._id);

  // UPDATED: Tick logic now prioritizes the 'read' status from socket
  const getTickIcon = (msg) => {
    if (msg.status === 'read') return <i className='bx bx-check-double text-cyan-400'></i>; // Blue/Cyan for read
    if (msg.status === 'delivered' || isUserOnline) return <i className='bx bx-check-double text-white/40'></i>;
    return <i className='bx bx-check text-white/40'></i>;
  };


const handleImageSend = async (base64Data) => {
  try {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/messages/send/${id}`, { 
      senderId: currentUserId, 
      image: base64Data 
    });
    // The socket 'newMessage' listener in UsersProvider/ChatDetail 
    // will pick up the response and update the UI automatically.
  } catch (err) {
    console.error("Image upload failed", err);
  }
};

  const formatDateLabel = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  
  return date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
};

  // NEW: Delete Handler
  const handleDeleteMessage = (messageId) => {
    if (window.confirm("Delete this message for everyone?")) {
      socket.emit("deleteMessage", { 
        messageId, 
        receiverId: id, 
        senderId: currentUserId 
      });
    }
  };

  // 1. Initial Fetch
  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/messages/${currentUserId}/${id}`);
        setChatHistory(res.data);
        
        if (socket) {
          socket.emit("markAsRead", { senderId: id, receiverId: currentUserId });
          setUsers(prev => prev.map(u => u._id === id ? { ...u, unreadCount: 0 } : u));
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    if (id && currentUserId) getMessages();
  }, [id, currentUserId, socket, setUsers]);

  // 2. Real-time Listeners (Messages, Ticks, Deletion)
  useEffect(() => {
    if (!socket) return;

   const handleNewMessage = (newMessage) => {
  // Fix: Check if the message belongs to this conversation (either as sender or receiver)
  const isRelevant = 
    (newMessage.senderId === id && newMessage.receiverId === currentUserId) || 
    (newMessage.senderId === currentUserId && newMessage.receiverId === id);

  if (isRelevant) {
    setChatHistory((prev) => {
      // Prevent duplicate messages if axios and socket both try to add it
      const exists = prev.find(m => (m._id || m.id) === (newMessage._id || newMessage.id));
      return exists ? prev : [...prev, newMessage];
    });

    if (newMessage.senderId === id) {
      socket.emit("markAsRead", { senderId: id, receiverId: currentUserId });
    }
  }
};

    const handleReadSync = ({ readerId }) => {
        if (readerId === id) {
            setChatHistory(prev => prev.map(msg => 
                msg.senderId === currentUserId ? { ...msg, status: 'read' } : msg
            ));
        }
    };

    const handleMessageDeleted = ({ messageId }) => {
        setChatHistory(prev => prev.filter(msg => (msg._id || msg.id) !== messageId));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", ({ senderId }) => senderId === id && setIsPartnerTyping(true));
    socket.on("stopTyping", ({ senderId }) => senderId === id && setIsPartnerTyping(false));
    socket.on("messagesRead", handleReadSync);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messagesRead", handleReadSync);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [id, socket, currentUserId]);

  // Ensure Ticks update when clicking into the chat
  useEffect(() => {
    if (id && socket && currentUserId) {
        socket.emit("markAsRead", { senderId: id, receiverId: currentUserId });
    }
  }, [id, socket, currentUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/messages/send/${id}`, { 
        senderId: currentUserId, 
        text: message 
      });
      setMessage("");
      socket.emit("stopTyping", { senderId: currentUserId, receiverId: id });
    } catch (err) { console.error(err); }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", { senderId: currentUserId, receiverId: id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { senderId: currentUserId, receiverId: id });
    }, 1500);
  };

  if (!activeUser) return <div className="flex-1 flex flex-col items-center justify-center bg-[#1D546D] text-white/50"><i className='bx bx-user-x text-6xl mb-2'></i><p>User not found</p></div>;

  return (
    <div className="flex flex-col h-screen w-full bg-white/5 backdrop-blur-md overflow-hidden">
      
      {/* HEADER */}
      <header className="px-4 py-3 flex items-center bg-white/10 border-b border-white/10 sticky top-0 z-30 shrink-0">
        <div className="flex items-center flex-1">
          <button onClick={() => navigate('/')} className="md:hidden mr-3 text-white/70 hover:text-white transition-colors">
            <i className='bx bx-left-arrow-alt text-3xl'></i>
          </button>
          <div className="relative">
            <img src={activeUser.profilepic} alt={activeUser.name} className="w-10 h-10 rounded-full border border-white/20 object-cover" />
            {isUserOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#1D546D] rounded-full"></span>}
          </div>
          <div className="ml-3 overflow-hidden">
            <h2 className="text-white font-semibold text-base truncate">{activeUser.name}</h2>
            {isPartnerTyping ? <p className="text-[11px] text-emerald-400 animate-pulse">typing...</p> : <p className={`text-[11px] font-medium ${isUserOnline ? 'text-cyan-400' : 'text-white/40'}`}>{isUserOnline ? 'Online' : 'Offline'}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 text-white/60">
          <button className="hover:text-cyan-400 transition-colors"><i className='bx bx-phone text-xl'></i></button>
          <button className="hover:text-cyan-400 transition-colors"><i className='bx bx-video text-xl'></i></button>
          <button className="hover:text-cyan-400 transition-colors"><i className='bx bx-dots-vertical-rounded text-xl'></i></button>
        </div>
      </header>

      {/* MESSAGES AREA */}
      {/* CHAT MESSAGES AREA */}
<div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
  {chatHistory.map((msg, index) => {
    const isMe = msg.senderId === currentUserId;
    
    // Logic to show date separator
    const currentDate = new Date(msg.createdAt).toDateString();
    const previousDate = index > 0 ? new Date(chatHistory[index - 1].createdAt).toDateString() : null;
    const showDateLabel = currentDate !== previousDate;

    return (
      <React.Fragment key={msg._id || msg.id}>
        {/* --- DATE SEPARATOR --- */}
        {showDateLabel && (
          <div className="flex justify-center my-4">
            <span className="bg-white/10 backdrop-blur-md text-white/60 text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-bold border border-white/5">
              {formatDateLabel(msg.createdAt)}
            </span>
          </div>
        )}

        {/* --- MESSAGE BUBBLE --- */}
        <div 
  onContextMenu={(e) => {
    if (isMe) {
      e.preventDefault();
      handleDeleteMessage(msg._id || msg.id);
    }
  }}
  className={`max-w-[85%] md:max-w-[70%] shadow-sm w-fit flex flex-col backdrop-blur-sm border transition-all duration-300 relative group rounded-xl
    ${isMe 
      ? 'bg-cyan-600/30 border-white/10 rounded-tr-none ml-auto text-white' 
      : 'bg-white/10 border-white/5 rounded-tl-none text-white'}
    ${msg.image ? 'p-1' : 'p-1.5 px-2.5'}`} // Tighter padding for images
>
  {/* Render Image Attachment */}
  {msg.image ? (
    <div className="relative group/img overflow-hidden rounded-lg">
      <img 
        src={msg.image} 
        alt="attachment" 
        className="max-w-full max-h-72 object-cover rounded-lg block" 
      />
      
      {/* Download Button - Visible on Hover */}
      <a 
        href={msg.image} 
        download={`SkillFlow_${Date.now()}.png`}
        className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-cyan-500"
        title="Download Image"
      >
        <i className='bx bx-download text-base'></i>
      </a>
    </div>
  ) : (
    /* Render Text Message */
    <p className="text-[13.5px] leading-snug break-words max-w-full">
      {msg.text}
    </p>
  )}
  
  {/* Timestamp & Ticks Row */}
  <div className={`flex items-center gap-1 shrink-0 ml-auto pt-1 ${msg.image ? 'px-1' : ''}`}>
    <span className="text-[9px] text-white/40 font-medium">
      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
    </span>
    {isMe && <span className="flex items-center">{getTickIcon(msg)}</span>}
  </div>

  {/* Hover Delete Button (Trash) */}
  {isMe && (
    <button 
      onClick={() => handleDeleteMessage(msg._id || msg.id)}
      className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-1"
    >
      <i className='bx bx-trash text-sm'></i>
    </button>
  )} 
</div>
      </React.Fragment>
    );
  })}
  <div ref={scrollRef} />
</div>

      {/* INPUT AREA */}
      <div className="p-4 bg-transparent shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2 bg-white/10 backdrop-blur-2xl border border-white/20 p-2 rounded-2xl shadow-2xl">
<AttachmentMenu onImageSelect={handleImageSend} />          <input type="text" value={message} onChange={handleInputChange} placeholder="Type a message..." className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm py-2 px-1" />
          <div className="md:flex items-center gap-1 px-2 border-l border-white/10">
            <button type="button" className="text-white/40 hover:text-cyan-400 p-2"><i className='bx bx-microphone text-xl'></i></button>
          </div>
          <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-white p-2.5 rounded-xl transition-all shadow-lg active:scale-95"><i className='bx bxs-send text-xl ml-0.5'></i></button>
        </form>
      </div>
    </div>
  );
};

export default ChatDetail;