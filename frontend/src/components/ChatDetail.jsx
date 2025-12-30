import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersContext } from '../context/UsersContext';
import { io } from 'socket.io-client';
import axios from 'axios';

const ChatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, loading, onlineUsers } = useContext(usersContext);
  
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const scrollRef = useRef(null);
  const socket = useRef();

  const currentUser = JSON.parse(localStorage.getItem('skillflow_user'));
  const currentUserId = currentUser?._id || currentUser?.id; 

  const activeUser = users?.find((u) => u._id === id);
  const isUserOnline = onlineUsers?.includes(activeUser?._id);

  const getTickIcon = (msg) => {
    if (msg.status === 'read') {
      return <i className='bx bx-check-double text-green-400'></i>; // Using Cyan as standard, change to red-400 if preferred
    }
    if (isUserOnline || msg.status === 'delivered') {
      return <i className='bx bx-check-double text-white/40'></i>;
    }
    return <i className='bx bx-check text-white/40'></i>;
  };

  useEffect(() => {
    if (!currentUserId) return;

    socket.current = io("http://localhost:5000", {
      query: { userId: currentUserId }
    });

    socket.current.on("newMessage", (newMessage) => {
      if (newMessage.senderId === id) {
        setChatHistory((prev) => [...prev, newMessage]);
        // Immediately notify sender that message is read since chat is open
        socket.current.emit("markAsRead", { senderId: id, receiverId: currentUserId });
      }
    });

    socket.current.on("typing", ({ senderId }) => {
      if (senderId === id) setIsPartnerTyping(true);
    });

    socket.current.on("stopTyping", ({ senderId }) => {
      if (senderId === id) setIsPartnerTyping(false);
    });

    // REAL-TIME TICK UPDATE: Listen for the signal that the partner read YOUR messages
    socket.current.on("messagesRead", ({ readerId }) => {
      if (readerId === id) {
        setChatHistory(prev => 
          prev.map(msg => msg.status !== 'read' ? { ...msg, status: 'read' } : msg)
        );
      }
    });

    return () => {
      socket.current.off("newMessage");
      socket.current.off("typing");
      socket.current.off("stopTyping");
      socket.current.off("messagesRead");
      socket.current.disconnect();
    };
  }, [id, currentUserId]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${currentUserId}/${id}`);
        setChatHistory(res.data);
        
        // When opening the chat, tell the server all these messages are now read
        if (socket.current) {
          socket.current.emit("markAsRead", { senderId: id, receiverId: currentUserId });
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    if (activeUser && currentUserId) getMessages();
  }, [id, currentUserId, activeUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageData = { senderId: currentUserId, text: message };

    try {
      const res = await axios.post(`http://localhost:5000/api/messages/send/${id}`, messageData);
      setChatHistory((prev) => [...prev, res.data]);
      setMessage("");
    } catch (err) {
      console.error("Failed to send:", err);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    socket.current.emit("typing", { senderId: currentUserId, receiverId: id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.current.emit("stopTyping", { senderId: currentUserId, receiverId: id });
    }, 1000);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center bg-[#1D546D]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div></div>;
  if (!activeUser) return <div className="flex-1 flex flex-col items-center justify-center bg-[#1D546D] text-white/50"><i className='bx bx-user-x text-6xl mb-2'></i><p>User not found</p></div>;

  return (
    <div className="flex flex-col h-screen w-full bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in duration-500">
      <header className="px-4 py-3 flex items-center bg-white/10 border-b border-white/10 sticky top-0 z-30 shrink-0">
        <div className="flex items-center flex-1">
          <div className="relative">
            <img src={activeUser.profilepic} alt={activeUser.name} className="w-10 h-10 rounded-full border border-white/20 object-cover" />
            {isUserOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#1D546D] rounded-full"></span>}
          </div>
          <div className="ml-3 overflow-hidden">
            <h2 className="text-white font-semibold text-base leading-tight truncate">{activeUser.name}</h2>
            {isPartnerTyping ? <p className="text-[11px] text-emerald-400 animate-pulse">typing...</p> : <p className={`text-[11px] font-medium ${isUserOnline ? 'text-cyan-400' : 'text-white/40'}`}>{isUserOnline ? 'Online' : 'Offline'}</p>}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {chatHistory.map((msg) => {
          const msgId = msg._id || msg.id;
          const isMe = msg.senderId === currentUserId;

          return (
            <div 
              key={msgId} 
              className={`max-w-[80%] md:max-w-[70%] p-2.5 px-4 rounded-2xl shadow-md w-fit flex flex-col backdrop-blur-sm border transition-all duration-300
                ${isMe ? 'bg-cyan-600/30 border-white/20 rounded-tr-none ml-auto text-white' : 'bg-white/10 border-white/10 rounded-tl-none text-white'}`}
            >
              <p className="text-[14.5px] leading-relaxed">{msg.text}</p>
              <div className="flex items-center self-end mt-1 gap-1">
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-tighter">{msg.time}</span>
                {isMe && getTickIcon(msg)}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-transparent shrink-0">
         <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2 bg-white/10 backdrop-blur-2xl border border-white/20 p-2 rounded-2xl shadow-2xl">
           <input type="text" value={message} onChange={handleInputChange} placeholder="Type a message..." className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm py-2 px-1" />
           <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-white p-2 rounded-xl transition-all shadow-lg flex items-center justify-center">
             <i className='bx bxs-send text-xl ml-0.5'></i>
           </button>
         </form>
      </div>
    </div>
  );
};

export default ChatDetail;