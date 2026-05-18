import React from 'react';

const Archive = ({ myBlessings }) => {
  return (
    <div className="archive-page">
      <div className="archive-header">
        <h2>Your Happiness Archive</h2>
        <p>A collection of your positive moments</p>
      </div>

      <div className="timeline-container">
        {myBlessings.length === 0 ? (
          <div className="empty-state">
            <p>Your archive is empty.</p>
            <p className="empty-subtext">Start sharing small blessings on the home page to build your happiness database.</p>
          </div>
        ) : (
          <div className="timeline">
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
                <div key={item.id} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content glass-panel">
                    <div className="timeline-date">
                      {formattedDate} <span className="time-subtext">{formattedTime}</span>
                    </div>
                    <p className="timeline-text">"{item.text}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
