import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import Modal from './components/Modal';
import { FiMenu } from 'react-icons/fi';
import './App.css';

const MOBILE_BREAKPOINT = 768;
const DEFAULT_SYSTEM_PROMPT = 'You are Byte, a friendly, concise AI companion. Keep answers short by default, use simple language, and only go into detail if the user asks for it.';

function App() {
  // Sidebar starts open on desktop, closed on mobile/tablet so the chat
  // (not the sidebar) is the first thing people see.
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth > MOBILE_BREAKPOINT;
  });

  // Chat History States
  const [chatSessions, setChatSessions] = useState(() => {
    const saved = localStorage.getItem('aihub-chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(() => {
    return localStorage.getItem('aihub-current-chat-id') || null;
  });

  // Profile & Settings States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('aihub-profile');
    return saved ? JSON.parse(saved) : { name: 'User', avatar: '🐱' };
  });

  const [systemPrompt, setSystemPrompt] = useState(() => {
    const saved = localStorage.getItem('aihub-system-prompt');
    return saved || DEFAULT_SYSTEM_PROMPT;
  });

  // Temp states for modals forms
  const [tempProfile, setTempProfile] = useState(userProfile);
  const [tempSystemPrompt, setTempSystemPrompt] = useState(systemPrompt);

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Derived state: what is currently on the screen
  const currentChat = chatSessions.find((chat) => chat.id === currentChatId);
  const messages = currentChat ? currentChat.messages : [];

  // Persist to local storage whenever relevant state changes
  useEffect(() => {
    localStorage.setItem('aihub-chats', JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem('aihub-profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('aihub-system-prompt', systemPrompt);
  }, [systemPrompt]);

  // Remember which chat is open so a page refresh resumes it instead of
  // dropping back to the welcome screen.
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('aihub-current-chat-id', currentChatId);
    } else {
      localStorage.removeItem('aihub-current-chat-id');
    }
  }, [currentChatId]);

  const createNewChat = () => {
    setCurrentChatId(null); // Null ID means a fresh, unsaved chat view
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      setIsSidebarOpen(false);
    }
  };

  const loadChat = (id) => {
    setCurrentChatId(id);
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      setIsSidebarOpen(false);
    }
  };

  const deleteChat = (id) => {
    setChatSessions((prev) => prev.filter((chat) => chat.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  };

  const clearAllChats = () => {
    if (window.confirm("Are you sure you want to delete all chats? This cannot be undone.")) {
      setChatSessions([]);
      setCurrentChatId(null);
      setIsSettingsOpen(false);
    }
  };

  const saveProfile = () => {
    setUserProfile(tempProfile);
    setIsProfileOpen(false);
  };

  const saveSettings = () => {
    setSystemPrompt(tempSystemPrompt);
    setIsSettingsOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (prompt) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isTyping) return;

    const newUserMsg = { role: 'user', content: trimmedPrompt };
    const priorMessages = currentChat ? currentChat.messages : [];
    const conversationForApi = [...priorMessages, newUserMsg];

    let activeChatId = currentChatId;

    // If this is the very first message of a totally new chat, create the session first
    if (!activeChatId) {
      const newChat = {
        id: uuidv4(),
        title: trimmedPrompt.length > 25 ? trimmedPrompt.substring(0, 25) + '...' : trimmedPrompt,
        messages: [newUserMsg]
      };
      setChatSessions((prev) => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      activeChatId = newChat.id;
    } else {
      // Otherwise, append to the existing active session
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, newUserMsg] }
            : chat
        )
      );
    }

    setIsTyping(true);
    const startTime = performance.now();

    try {
      const apiUrl = import.meta.env.DEV ? 'http://localhost:3000/api/chat' : '/api/chat';

      const response = await axios.post(apiUrl, {
        messages: conversationForApi,
        systemPrompt,
      });

      const elapsedSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
      const aiResponseMsg = { role: 'ai', content: response.data.response, responseTime: elapsedSeconds };

      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, aiResponseMsg] }
            : chat
        )
      );
    } catch (error) {
      console.error('Error fetching chat response:', error);

      let friendlyMessage = "Oops! I couldn't reach the AI right now. Please try again.";
      const status = error?.response?.status;

      if (!error.response) {
        friendlyMessage = "Looks like you're offline, or the connection dropped. Check your network and try again.";
      } else if (status === 429) {
        friendlyMessage = "Whoa, lots of questions! I'm a little rate-limited right now — give it a few seconds and try again.";
      }

      const errorMsg = { role: 'ai', content: friendlyMessage, isError: true };

      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, errorMsg] }
            : chat
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        createNewChat={createNewChat}
        loadChat={loadChat}
        deleteChat={deleteChat}
        userProfile={userProfile}
        openProfile={() => {
          setTempProfile(userProfile);
          setIsProfileOpen(true);
        }}
        openSettings={() => {
          setTempSystemPrompt(systemPrompt);
          setIsSettingsOpen(true);
        }}
      />

      <main className="main-content">
        <header className="mobile-header">
          <button onClick={toggleSidebar} className="menu-btn">
            <FiMenu size={24} />
          </button>
          <h2>🤖 Byte</h2>
        </header>

        <ChatArea
          messages={messages}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          onQuickAction={handleSendMessage}
        />
        <InputArea onSendMessage={handleSendMessage} isTyping={isTyping} />
      </main>

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Edit Profile"
      >
        <div className="modal-field">
          <label>Display Name</label>
          <input
            type="text"
            className="modal-input"
            value={tempProfile.name}
            onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
            maxLength={20}
          />
        </div>
        <div className="modal-field">
          <label>Choose Avatar</label>
          <div className="avatar-selector">
            {['🐱', '🐶', '🦊', '🐼', '🤖', '👽', '👻', '😎'].map((emoji) => (
              <div
                key={emoji}
                className={`avatar-option ${tempProfile.avatar === emoji ? 'selected' : ''}`}
                onClick={() => setTempProfile({ ...tempProfile, avatar: emoji })}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
        <button className="modal-btn" onClick={saveProfile}>Save Profile</button>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
      >
        <div className="modal-field">
          <label>System Prompt (AI Behavior)</label>
          <textarea
            className="modal-input modal-textarea"
            value={tempSystemPrompt}
            onChange={(e) => setTempSystemPrompt(e.target.value)}
            placeholder="You are a helpful assistant..."
          />
        </div>
        <button className="modal-btn" onClick={saveSettings}>Save Settings</button>

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div className="modal-field">
            <label style={{ color: '#ff4d4d' }}>Danger Zone</label>
            <button className="modal-btn modal-btn-danger" onClick={clearAllChats}>
              Clear All Chats
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
