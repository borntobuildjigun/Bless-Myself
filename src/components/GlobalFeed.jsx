import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const MOCK_DATA = [
  { id: 1, text: "I finally finished reading that book I started months ago.", author: "Bookworm", blessCount: 12, date: "2 mins ago" },
  { id: 2, text: "Got a free coffee on my way to work today!", author: "CoffeeLover", blessCount: 45, date: "15 mins ago" },
  { id: 3, text: "오늘 날씨가 너무 좋아서 산책을 다녀왔다.", author: "맑은하늘", blessCount: 8, date: "1 hour ago" },
  { id: 4, text: "Spent quality time with my family.", author: "FamilyFirst", blessCount: 112, date: "3 hours ago" },
  { id: 5, text: "스스로에게 작은 칭찬을 해준 하루. 고생했어.", author: "토닥토닥", blessCount: 34, date: "5 hours ago" },
  { id: 6, text: "Saw a beautiful sunset that made me forget my worries.", author: "SkyWatcher", blessCount: 89, date: "8 hours ago" }
];

const GlobalFeed = ({ currentUser }) => {
  const [feedItems, setFeedItems] = useState([]);
  
  useEffect(() => {
    // In a real app, this would fetch from an API.
    // For now, we simulate a feed loaded with mock data.
    setFeedItems(MOCK_DATA);
  }, []);

  const handleBless = (id) => {
    setFeedItems(items => items.map(item => {
      if (item.id === id) {
        const isBlessed = item.blessedByMe;
        return {
          ...item,
          blessCount: isBlessed ? item.blessCount - 1 : item.blessCount + 1,
          blessedByMe: !isBlessed
        };
      }
      return item;
    }));
  };

  return (
    <div className="global-feed">
      {feedItems.map((item) => (
        <div key={item.id} className="feed-card glass-panel">
          <p className="card-text">"{item.text}"</p>
          <div className="card-footer">
            <div className="card-meta">
              <span className="author">{item.author}</span>
              <span className="dot">•</span>
              <span className="date">{item.date}</span>
            </div>
            <button 
              className={`bless-btn ${item.blessedByMe ? 'active' : ''}`}
              onClick={() => handleBless(item.id)}
              aria-label="Bless this post"
            >
              <Heart 
                size={18} 
                className="heart-icon" 
                fill={item.blessedByMe ? 'currentColor' : 'none'} 
              />
              <span className="count">{item.blessCount}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalFeed;
