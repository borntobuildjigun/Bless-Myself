import React from 'react';

const Archive = ({ myBlessings, totalXp = 0, currentStreak = 0 }) => {
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

      <section className="timeline-container" aria-label="Timeline of your blessings">
        {myBlessings.length === 0 ? (
          <div className="empty-state">
            <p>Your archive is empty.</p>
            <p className="empty-subtext">Start sharing small blessings on the home page to build your happiness database.</p>
          </div>
        ) : (
          <ol className="timeline">
            {myBlessings.map((item) => {
              const dateObj = new Date(item.date);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const formattedTime = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <li key={item.id} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <article className="timeline-content glass-panel">
                    <div className="timeline-date">
                      {formattedDate} <span className="time-subtext">{formattedTime}</span>
                    </div>
                    <p className="timeline-text">"{item.text}"</p>
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
};

export default Archive;
