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
    <main className="home-page">
      <section className="hero-section" aria-label="Gratitude input section">
        <div className="hero-content">
          <div className="greeting-pill">
            <Sparkles size={16} className="text-accent" />
            <span>Small Healing, Big Impact</span>
          </div>
          <h1 className="hero-title">What are you grateful for today?</h1>
          
          <form 
            onSubmit={handleSubmit} 
            className={`bless-form ${isFocused ? 'focused' : ''}`}
            aria-label="Gratitude entry form"
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
                aria-label="Write a small blessing or gratitude"
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
      </section>
      
      <section className="feed-section" aria-label="Global blessings feed">
        <div className="feed-header">
          <h2>Global Blessings</h2>
          <p>Read what others are grateful for</p>
        </div>
        <GlobalFeed currentUser={nickname} />
      </section>
    </main>
  );
};

export default Home;
