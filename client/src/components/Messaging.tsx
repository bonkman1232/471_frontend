import { useState, useEffect, useRef } from 'react';

// ---------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------
// YOUR REAL ID
const MY_REAL_ID = '6948b60ad73e9c0fae2958ce';

// CONSTANT STUDENT OBJECT
const DEMO_STUDENT = {
  _id: MY_REAL_ID, 
  name: 'Homyra Ananna',
  role: 'student'
};

interface User {
  _id: string;
  name: string;
  role: string;
}

interface Message {
  _id?: string;
  sender: string | { _id: string, name: string };
  senderId?: string;
  content: string;
  body?: string;
  createdAt?: string;
  readBy?: string[]; // Array of IDs who read this message
}

interface MessagingProps {
  initialPartner?: any | null;
}

export default function Messaging({ initialPartner }: MessagingProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeChat, setActiveChat] = useState<User | null>(initialPartner || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // NEW STATES FOR STATUS
  const [partnerStatus, setPartnerStatus] = useState<string>('offline');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. SETUP USER ON LOAD
  useEffect(() => {
    setCurrentUser(DEMO_STUDENT);
  }, []);

  // 2. SYNC PARTNER WHEN CLICKED
  useEffect(() => {
    if (initialPartner) {
      setActiveChat(initialPartner);
      setCurrentUser(DEMO_STUDENT);
    }
  }, [initialPartner]);

  // 3. TOGGLE ROLE
  const toggleRole = () => {
    if (!activeChat || !currentUser) return;
    const newMe = activeChat;
    const newPartner = currentUser;
    setCurrentUser(newMe);
    setActiveChat(newPartner);
  };

  // 4. FETCH MESSAGES & STATUS & MARK READ
  useEffect(() => {
    if (!activeChat || !currentUser) return;

    const syncChat = async () => {
      try {
        // A. Fetch Messages
        const msgRes = await fetch(`http://localhost:1532/api/messages?senderId=${currentUser._id}&receiverId=${activeChat._id}`);
        const msgData = await msgRes.json();
        setMessages(msgData);

        // B. Fetch Partner Status (Online/Offline)
        // We use the new route we created
        const statusRes = await fetch(`http://localhost:1532/api/messages/status/${activeChat._id}`);
        const statusData = await statusRes.json();
        setPartnerStatus(statusData.status);

        // C. Mark Messages as "Read" (The WhatsApp Logic)
        // Tell backend: "I (currentUser) am reading messages from (activeChat)"
        await fetch('http://localhost:1532/api/messages/mark-read', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            readerId: currentUser._id,
            senderId: activeChat._id
          })
        });

      } catch (error) {
        console.error("Sync error:", error);
      }
    };

    syncChat();
    const interval = setInterval(syncChat, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);

  }, [currentUser, activeChat]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. SEND MESSAGE
  const handleSend = async () => {
    if (!newMessage.trim() || !activeChat || !currentUser) return;

    const payload = {
      senderId: currentUser._id,
      senderName: currentUser.name,
      receiverId: activeChat._id,
      content: newMessage
    };

    try {
      const res = await fetch('http://localhost:1532/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const savedMessage = await res.json();
        setMessages([...messages, savedMessage]);
        setNewMessage('');
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // --- HELPER: RENDER TICKS ---
  const renderTicks = (msg: Message) => {
    if (!activeChat) return null;

    // Has the partner read this?
    // We check if the 'readBy' array includes the Partner's ID
    const isReadByPartner = msg.readBy?.includes(activeChat._id);

    if (isReadByPartner) {
      // BLUE DOUBLE TICK (Seen)
      return <span className="text-blue-200 font-bold ml-1 text-xs">✓✓</span>;
    } else {
      // GREY SINGLE TICK (Sent/Delivered)
      return <span className="text-blue-200 ml-1 text-xs">✓</span>;
    }
  };

  if (!currentUser || !activeChat) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white text-center p-10">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-bold text-slate-700">Select a Chat</h3>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with Status Dot */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
              {activeChat.name?.charAt(0) || '?'}
            </div>
            {/* ACTIVE STATUS DOT */}
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              partnerStatus === 'available' ? 'bg-green-500' : 'bg-slate-400'
            }`}></div>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-800">{activeChat.name}</h3>
            {/* ACTIVE STATUS TEXT */}
            <span className="text-xs text-slate-500 capitalize">
              {partnerStatus === 'available' ? 'Online' : 'Last seen recently'}
            </span>
          </div>
        </div>
        <button 
          onClick={toggleRole}
          className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-md font-semibold transition-colors"
        >
           Trying as: {currentUser.name}
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, index) => {
          const msgSenderId = typeof msg.sender === 'object' && msg.sender !== null 
            ? msg.sender._id 
            : msg.sender;
          const isMe = msgSenderId === currentUser._id || msg.senderId === currentUser._id;

          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm text-sm ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                }`}
              >
                <p>{msg.content || msg.body}</p>
                <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                  <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}</span>
                  {/* SHOW TICKS ONLY IF I SENT THE MESSAGE */}
                  {isMe && renderTicks(msg)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleSend} className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md">
          ➤
        </button>
      </div>
    </div>
  );
}