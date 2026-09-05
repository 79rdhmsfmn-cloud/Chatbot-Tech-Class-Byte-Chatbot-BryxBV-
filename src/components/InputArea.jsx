import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import './InputArea.css';

const InputArea = ({ onSendMessage, isTyping }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (prompt.trim() && !isTyping) {
            onSendMessage(prompt);
            setPrompt('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="input-area">
            <form className="input-container" onSubmit={handleSubmit}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Byte anything..."
                    rows="1"
                    disabled={isTyping}
                />
                <button
                    type="submit"
                    disabled={!prompt.trim() || isTyping}
                    className={`send-btn ${prompt.trim() ? 'active' : ''}`}
                >
                    <FiSend size={18} />
                </button>
            </form>
            <div className="disclaimer">
                Byte can make mistakes. Consider double-checking important info.
            </div>
        </div>
    );
};

export default InputArea;
