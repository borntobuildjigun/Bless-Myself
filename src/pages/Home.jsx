import React, { useState } from 'react';
import GlobalFeed from '../components/GlobalFeed';
import { Sparkles, Send } from 'lucide-react';

const Home = ({ nickname, onAddBlessing }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAddBlessing(text.trim());
      setText('');
      // Small visual feedback could be added here
    }
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <div className="greeting-pill">
            <Sparkles size={16} className="text-accent" />
            <span>Small Healing, Big Impact</span>
          </div>
          <h2 className="hero-title">What are you grateful for today?</h2>
          
          <form 
            onSubmit={handleSubmit} 
            className={`bless-form ${isFocused ? 'focused' : ''}`}
          >
            <div className="input-wrapper">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Write a small blessing or gratitude..."
                maxLength={100}
                autoComplete="off"
              />
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={!text.trim()}
                aria-label="Share blessing"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="preview-indicator">
              Posting as: <span className="nickname-preview">{nickname}</span>
            </div>
          </form>
        </div>
      </div>
      
      <div className="feed-section">
        <div className="feed-header">
          <h3>Global Blessings</h3>
          <p>Read what others are grateful for</p>
        </div>
        <GlobalFeed currentUser={nickname} />
      </div>
    </div>
  );
};

export default Home;
