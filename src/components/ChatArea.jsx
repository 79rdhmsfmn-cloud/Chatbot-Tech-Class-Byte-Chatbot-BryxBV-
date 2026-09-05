import React from 'react';
import './ChatArea.css';
import { FiUser, FiCpu } from 'react-icons/fi';

const QUICK_ACTIONS = [
    { emoji: '🧠', label: 'Learn Something', prompt: 'Teach me something interesting in a couple of sentences.' },
    { emoji: '🎲', label: 'Surprise Me', prompt: 'Surprise me with something fun or unexpected.' },
    { emoji: '💡', label: 'Fun Fact', prompt: "Give me a short, fun fact I probably don't know." },
    { emoji: '🎮', label: 'Quiz Me', prompt: 'Give me a short one-question quiz on a random topic, then wait for my answer.' },
];

const ChatArea = ({ messages, isTyping, messagesEndRef, onQuickAction }) => {
    return (
        <div className="chat-area">
            <div className="chat-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="logo-pulse">
                            <FiCpu size={40} />
                        </div>
                        <h1>Hey! I'm Byte 👋</h1>
                        <p>Ask me anything and I'll do my best to help.</p>

                        <div className="quick-actions">
                            {QUICK_ACTIONS.map((action) => (
                                <button
                                    key={action.label}
                                    className="quick-action-btn"
                                    onClick={() => onQuickAction(action.prompt)}
                                >
                                    <span className="quick-action-emoji">{action.emoji}</span>
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`message-wrapper ${msg.role}${msg.isError ? ' error' : ''}`}>
                            <div className="avatar">
                                {msg.role === 'user' ? <FiUser size={20} /> : <FiCpu size={20} />}
                            </div>
                            <div className="message-content">
                                <p>{msg.content}</p>
                                {msg.role === 'ai' && msg.responseTime && !msg.isError && (
                                    <span className="response-time">⚡ {msg.responseTime}s</span>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {isTyping && (
                    <div className="message-wrapper ai typing">
                        <div className="avatar">
                            <FiCpu size={20} />
                        </div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span className="typing-text">Byte is thinking</span>
                                <span className="dot dot-1"></span>
                                <span className="dot dot-2"></span>
                                <span className="dot dot-3"></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ChatArea;
