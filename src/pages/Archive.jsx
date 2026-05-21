import React from 'react';

const Archive = ({ myBlessings }) => {
  return (
    <main className="archive-page">
      <header className="archive-header">
        <h2>Your Happiness Archive</h2>
        <p>A collection of your positive moments</p>
      </header>

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
