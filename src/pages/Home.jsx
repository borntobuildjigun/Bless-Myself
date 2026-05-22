import React, { useState, useRef, useCallback } from 'react';
import GlobalFeed from '../components/GlobalFeed';
import { Sparkles, Send, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const prompts = [
  "오늘 당신을 미소 짓게 한 작은 일은 무엇인가요?",
  "최근에 누군가에게 받은 따뜻한 말 한마디가 있나요?",
  "오늘 먹은 음식 중 가장 맛있었던 건 무엇인가요?",
  "지금 떠오르는, 내 삶에서 가장 감사한 사람은 누구인가요?",
  "오늘 하루 중 가장 평화로웠던 순간은 언제였나요?",
  "최근에 웃었던 재미있는 일이 있나요?",
  "당신이 좋아하는 계절에 얽힌 기분 좋은 기억은 무엇인가요?",
  "오늘 나를 위해 한 작은 일이 있다면 무엇인가요?",
  "최근에 감동받은 작은 친절이 있나요?",
  "지금 창밖으로 보이는 풍경 중 예쁜 것 하나를 적어보세요.",
];

const Home = ({ nickname, onAddBlessing }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyInsertedItem, setNewlyInsertedItem] = useState(null);
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * prompts.length));
  const feedRef = useRef(null);

  const shufflePrompt = useCallback(() => {
    setPromptIndex((prev) => {
      let next;
      do { next = Math.floor(Math.random() * prompts.length); } while (next === prev);
      return next;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim() && !isSubmitting) {
      setIsSubmitting(true);
      const insertedData = await onAddBlessing(text.trim());
      setIsSubmitting(false);
      
      if (insertedData) {
        setText('');
        setNewlyInsertedItem(insertedData);
        shufflePrompt();
        
        if (feedRef.current) {
          setTimeout(() => {
            const yOffset = -80; 
            const element = feedRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }, 50);
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
          
          {/* Speech Bubble Prompt */}
          <div className="speech-bubble-wrapper">
            <div className="speech-bubble glass-panel">
              <AnimatePresence mode="wait">
                <motion.p
                  key={promptIndex}
                  className="bubble-text"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {prompts[promptIndex]}
                </motion.p>
              </AnimatePresence>
              <button className="bubble-refresh" onClick={shufflePrompt} aria-label="Get a new prompt">
                <RefreshCw size={14} />
              </button>
            </div>
            <div className="bubble-tail"></div>
          </div>

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
                maxLength={200}
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
