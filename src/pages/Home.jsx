import React, { useState, useRef } from 'react';
import GlobalFeed from '../components/GlobalFeed';
import { Sparkles, Send, Loader2 } from 'lucide-react';

const Home = ({ nickname, onAddBlessing }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyInsertedItem, setNewlyInsertedItem] = useState(null);
  const feedRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim() && !isSubmitting) {
      setIsSubmitting(true);
      const insertedData = await onAddBlessing(text.trim());
      setIsSubmitting(false);
      
      if (insertedData) {
        setText('');
        setNewlyInsertedItem(insertedData);
        
        // Auto-scroll to feed smoothly right after updating state
        if (feedRef.current) {
          setTimeout(() => {
            // Adjust scroll position slightly to account for sticky header
            const yOffset = -80; 
            const element = feedRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }, 50); // Minimal delay to allow render
        }
      }
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
                disabled={isSubmitting}
              />
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={!text.trim() || isSubmitting}
                aria-label="Share blessing"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
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
        <GlobalFeed currentUser={nickname} feedRef={feedRef} newlyInsertedItem={newlyInsertedItem} />
      </section>
    </main>
  );
};

export default Home;
