import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersContext } from '../context/UsersContext';

const ChatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const users = useContext(usersContext);
  const [message, setMessage] = useState("");
  const [menuPosition, setMenuPosition] = useState(null); // { x, y, messageId }

  // 1. Message State: Initializing with a default message
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: "Hey! Did you check the new glassmorphism design?", sender: "them", time: "11:45 PM" }
  ]);

  // 2. Scroll Reference: To automatically scroll to new messages
  const scrollRef = useRef(null);

  const activeUser = users.find((u) => u.id === parseInt(id));

  // Auto-scroll effect
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  if (!activeUser) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        text: message,
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatHistory([...chatHistory, newMessage]);
      setMessage("");

      // Optional: Simulate a quick auto-reply
      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          text: "That looks amazing! 🚀",
          sender: "them",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, reply]);
      }, 1000);
    }
  };



// 2. The Delete Function
  const deleteMessage = (id) => {
  setChatHistory(prev => prev.filter(msg => msg.id !== id));
  setMenuPosition(null); // Close menu
};

// 3. Right-Click Handler
const handleContextMenu = (e, id) => {
  e.preventDefault();
  
  // Get screen width/height
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Menu dimensions (we set width to 160px/w-40 in your code)
  const menuWidth = 160; 
  const menuHeight = 180; 

  let x = e.pageX;
  let y = e.pageY;

  // If clicking near right edge, push menu to the left
  if (x + menuWidth > screenWidth) {
    x = x - menuWidth;
  }

  // If clicking near bottom edge, push menu upwards
  if (y + menuHeight > screenHeight) {
    y = y - menuHeight;
  }

  setMenuPosition({ x, y, messageId: id });
};




  return (
    <div className="flex flex-col h-screen w-full bg-white/5 backdrop-blur-md overflow-hidden">
      {/* 1. Header */}
      <header className="px-4 py-3 flex items-center bg-white/10 border-b border-white/10 sticky top-0 z-30 shrink-0">
        <button 
          onClick={() => navigate('/')} 
          className="flex md:hidden p-2 mr-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <i className='bx bx-arrow-back text-2xl'></i>
        </button>

        <div className="flex items-center flex-1 cursor-pointer">
          <div className="relative">
            <img 
              src={activeUser.profilepic} 
              alt={activeUser.name} 
              className="w-10 h-10 rounded-full border border-white/20 object-cover" 
            />
            {activeUser.status === 'online' && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#1D546D] rounded-full"></span>
            )}
          </div>
          <div className="ml-3 overflow-hidden">
            <h2 className="text-white font-semibold text-base leading-tight truncate">{activeUser.name}</h2>
            <p className="text-[11px] text-cyan-400 font-medium">
              {activeUser.status === 'online' ? 'Online' : 'Last seen ' + activeUser.lastseen}
            </p>
          </div>
        </div>

        <div className="flex gap-4 text-white/70 ml-2">
          <i className='bx bx-video text-xl cursor-pointer hover:text-white'></i>
          <i className='bx bx-phone text-xl cursor-pointer hover:text-white'></i>
          <i className='bx bx-dots-vertical-rounded text-xl cursor-pointer hover:text-white'></i>
        </div>
      </header>

      {/* 2. Dynamic Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
  {chatHistory.map((msg) => {
    // 1. Logic must be inside curly braces
    const isSelected = menuPosition?.messageId === msg.id;
    
    // 2. You must explicitly return the JSX
    return (
      <div 
        key={msg.id} 
        onContextMenu={(e) => handleContextMenu(e, msg.id)}
        className={`max-w-[80%] md:max-w-[70%] p-2.5 px-4 rounded-2xl shadow-md w-fit flex flex-col backdrop-blur-sm border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2
          ${isSelected ? 'ring-2 ring-cyan-400/50 scale-[1.02] shadow-[0_0_20px_rgba(34,211,238,0.2)]' : ''}
          ${msg.sender === 'me' 
            ? 'bg-cyan-600/30 border-white/20 rounded-tr-none ml-auto text-white' 
            : 'bg-white/10 border-white/10 rounded-tl-none text-white'}`}
      >
        <p className="text-[14.5px] leading-relaxed">{msg.text}</p>
        <div className={`flex items-center self-end mt-1 gap-1`}>
          <span className="text-[10px] text-white/40 font-medium uppercase tracking-tighter">
            {msg.time}
          </span>
          {msg.sender === 'me' && <i className='bx bx-check-double text-cyan-400 text-sm'></i>}
        </div>
      </div>
    );
  })}
  {/* Anchor for auto-scrolling */}
  <div ref={scrollRef} />
</div>

      {/* 3. Bottom Input Bar */}
      <div className="p-4 bg-transparent shrink-0">
        <form 
          onSubmit={handleSend}
          className="max-w-4xl mx-auto flex items-center gap-2 bg-white/10 backdrop-blur-2xl border border-white/20 p-2 rounded-2xl shadow-2xl"
        >
          <button type="button" className="p-2 text-white/70 hover:text-white transition-colors">
            <i className='bx bx-plus text-2xl'></i>
          </button>

          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm py-2 px-1"
          />

          <div className="flex items-center gap-1">
            {message.trim().length === 0 ? (
              <button type="button" className="p-2 text-white/70 hover:text-white transition-colors">
                <i className='bx bx-microphone text-2xl'></i>
              </button>
            ) : (
              <button 
                type="submit" 
                className="bg-cyan-500 hover:bg-cyan-400 text-white p-2 rounded-xl transition-all shadow-lg flex items-center justify-center"
              >
                <i className='bx bxs-send text-xl ml-0.5'></i>
              </button>
            )}
          </div>
        </form>
      </div>
      {menuPosition && (
  <>
    {/* Transparent backdrop to close menu on click outside */}
    <div 
      className="fixed inset-0 z-40" 
      onClick={() => setMenuPosition(null)}
    />
    
    {/* The Actual Glass Menu */}
    <div 
      className="fixed z-50 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl py-2 w-40 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      style={{ top: menuPosition.y, left: menuPosition.x }}
    >
      <button className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 text-sm flex items-center gap-2">
        <i className='bx bx-reply'></i> Reply
      </button>
      <button className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 text-sm flex items-center gap-2">
        <i className='bx bx-copy'></i> Copy
      </button>
      <div className="h-[1px] bg-white/10 my-1"></div>
      <button 
        onClick={() => deleteMessage(menuPosition.messageId)}
        className="w-full px-4 py-2 text-left text-rose-400 hover:bg-rose-500/20 text-sm flex items-center gap-2"
      >
        <i className='bx bx-trash'></i> Delete
      </button>
    </div>
  </>
)}
    </div>
    
  );
};

export default ChatDetail;