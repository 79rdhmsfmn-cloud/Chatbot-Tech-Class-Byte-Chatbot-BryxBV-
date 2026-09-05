import React from 'react';
import { FiPlus, FiMessageSquare, FiSettings, FiUser, FiTrash2 } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({
    isOpen,
    chatSessions,
    currentChatId,
    createNewChat,
    loadChat,
    deleteChat,
    userProfile,
    openProfile,
    openSettings
}) => {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <button className="new-chat-btn" onClick={createNewChat}>
                    <FiPlus size={20} />
                    <span>New Chat</span>
                </button>
            </div>

            <div className="sidebar-content">
                <div className="history-group">
                    <p className="history-title">Recent</p>
                    <ul className="history-list">
                        {chatSessions.length === 0 ? (
                            <li className="history-item empty">
                                <span style={{ opacity: 0.5, fontSize: '0.9rem' }}>No recent chats</span>
                            </li>
                        ) : (
                            chatSessions.map((chat) => (
                                <li
                                    key={chat.id}
                                    className={`history-item ${chat.id === currentChatId ? 'active' : ''}`}
                                    onClick={() => loadChat(chat.id)}
                                >
                                    <div className="history-item-content">
                                        <FiMessageSquare size={16} />
                                        <span className="truncate">{chat.title}</span>
                                    </div>
                                    <button
                                        className="delete-chat-btn"
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent loading the chat when deleting
                                            deleteChat(chat.id);
                                        }}
                                        title="Delete chat"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>

            <div className="sidebar-footer">
                <button className="footer-btn" onClick={openProfile}>
                    <span style={{ fontSize: '18px' }}>{userProfile?.avatar || '🐱'}</span>
                    <span>{userProfile?.name || 'Profile'}</span>
                </button>
                <button className="footer-btn" onClick={openSettings}>
                    <FiSettings size={18} />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
