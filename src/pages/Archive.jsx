import React, { useState, useEffect } from 'react';
import { Bookmark, X } from 'lucide-react';

const Archive = ({ myBlessings, totalXp = 0, currentStreak = 0 }) => {
  const [activeTab, setActiveTab] = useState('my');
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('saved_items') || '[]');
    setSavedItems(stored);
  }, []);

  const handleUnsave = (id) => {
    const updated = savedItems.filter(item => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem('saved_items', JSON.stringify(updated));

    const savedIds = JSON.parse(localStorage.getItem('saved_ids') || '[]');
    localStorage.setItem('saved_ids', JSON.stringify(savedIds.filter(sid => sid !== id)));
  };

  const getTreeEmoji = (xp) => {
    if (xp < 20) return '🌱';
    if (xp < 50) return '🌿';
    if (xp < 100) return '🪴';
    if (xp < 200) return '🌳';
    return '🌸';
  };

  const getTreeName = (xp) => {
    if (xp < 20) return '마음의 씨앗 (Seed)';
    if (xp < 50) return '자라나는 새싹 (Sprout)';
    if (xp < 100) return '작은 나무 (Small Tree)';
    if (xp < 200) return '울창한 나무 (Big Tree)';
    return '꽃 피운 나무 (Blooming Tree)';
  };

  const getNextLevelXp = (xp) => {
    if (xp < 20) return 20;
    if (xp < 50) return 50;
    if (xp < 100) return 100;
    if (xp < 200) return 200;
    return xp; // Max level
  };

  const nextXp = getNextLevelXp(totalXp);
  const progressPercent = totalXp >= 200 ? 100 : (totalXp / nextXp) * 100;

  const formatDate = (dateString) => {
    let dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date(); // Fallback to current time if invalid
    }
    const date = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const time = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return { date, time };
  };

  return (
    <main className="archive-page">
      <header className="archive-header">
        <h2>My Garden</h2>
        <p>Watch your positivity grow with every entry</p>
      </header>

      <section className="tree-container" aria-label="Your growing tree">
        <div className="tree-emoji">
          {getTreeEmoji(totalXp)}
        </div>
        <h3>{getTreeName(totalXp)}</h3>
        <div className="tree-stats">
          <p>경험치 <span>{totalXp} XP</span></p>
          <p>연속 작성 <span>{currentStreak}일 🔥</span></p>
        </div>
        {totalXp < 200 && (
          <div className="tree-progress-bar">
            <div className="tree-progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        )}
      </section>

      {/* Tab Switcher */}
      <div className="archive-tabs">
        <button
          className={`archive-tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          내가 쓴 글 ({myBlessings.length})
        </button>
        <button
          className={`archive-tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <Bookmark size={14} />
          저장한 글 ({savedItems.length})
        </button>
      </div>

      {/* My Blessings Tab */}
      {activeTab === 'my' && (
        <section className="timeline-container" aria-label="Timeline of your blessings">
          {myBlessings.length === 0 ? (
            <div className="empty-state">
              <p>Your archive is empty.</p>
              <p className="empty-subtext">Start sharing small blessings on the home page to build your happiness database.</p>
            </div>
          ) : (
            <ol className="timeline">
              {myBlessings.map((item) => {
                const { date, time } = formatDate(item.date);
                return (
                  <li key={item.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <article className="timeline-content glass-panel">
                      <div className="timeline-date">
                        {date} <span className="time-subtext">{time}</span>
                      </div>
                      <p className="timeline-text">"{item.text}"</p>
                    </article>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}

      {/* Saved Items Tab */}
      {activeTab === 'saved' && (
        <section className="saved-container" aria-label="Saved blessings from others">
          {savedItems.length === 0 ? (
            <div className="empty-state">
              <p>저장한 글이 없습니다.</p>
              <p className="empty-subtext">홈 피드에서 마음에 드는 글의 북마크 아이콘을 눌러 저장해 보세요.</p>
            </div>
          ) : (
            <ul className="saved-list">
              {savedItems.map((item) => {
                const { date, time } = formatDate(item.date);
                return (
                  <li key={item.id} className="saved-item glass-panel">
                    <div className="saved-item-header">
                      <div className="card-meta">
                        <span className="author">{item.author}</span>
                        <span className="dot">•</span>
                        <span className="date">{date} {time}</span>
                      </div>
                      <button className="unsave-btn" onClick={() => handleUnsave(item.id)} aria-label="저장 해제">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="saved-item-text">"{item.text}"</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </main>
  );
};

export default Archive;
