import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalFeed = ({ currentUser, feedRef, newlyInsertedItem }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [blessedIds, setBlessedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [poppingId, setPoppingId] = useState(null);
  
  useEffect(() => {
    if (newlyInsertedItem) {
      setFeedItems((current) => {
        // Prevent duplicate if realtime event already added it
        if (current.some(item => item.id === newlyInsertedItem.id)) return current;
        return [newlyInsertedItem, ...current];
      });
    }
  }, [newlyInsertedItem]);

  useEffect(() => {
    // Load local history of blessed items
    const stored = localStorage.getItem('blessed_ids');
    if (stored) setBlessedIds(JSON.parse(stored));

    fetchBlessings();

    // Subscribe to new blessings in realtime
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'blessings' },
        (payload) => {
          setFeedItems((current) => {
            if (current.some(item => item.id === payload.new.id)) return current;
            return [payload.new, ...current];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'blessings' },
        (payload) => {
          setFeedItems((current) =>
            current.map((item) => (item.id === payload.new.id ? payload.new : item))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBlessings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blessings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching blessings:', error);
    } else {
      setFeedItems(data || []);
    }
    setIsLoading(false);
  };

  const handleBless = async (id) => {
    if (blessedIds.includes(id)) return; // Prevent multiple blessings locally

    // Trigger confetti animation
    setPoppingId(id);
    setTimeout(() => setPoppingId(null), 600);

    // Optimistic UI update
    const newBlessedIds = [...blessedIds, id];
    setBlessedIds(newBlessedIds);
    localStorage.setItem('blessed_ids', JSON.stringify(newBlessedIds));

    setFeedItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        return { ...item, bless_count: (item.bless_count || 0) + 1 };
      }
      return item;
    }));

    // Update Supabase directly instead of RPC to ensure it saves without backend config
    const currentItem = feedItems.find(i => i.id === id);
    const newCount = (currentItem ? currentItem.bless_count || 0 : 0) + 1;
    
    const { error } = await supabase
      .from('blessings')
      .update({ bless_count: newCount })
      .eq('id', id);
      
    if (error) {
      console.error('Error incrementing bless count:', error);
    }
  };

  // Helper to format date
  const formatTimeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const renderSkeletons = () => {
    return Array.from({ length: 4 }).map((_, i) => (
      <article key={`skeleton-${i}`} className="feed-card glass-panel skeleton-card">
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
        <div className="card-footer" style={{ marginTop: '1.5rem' }}>
          <div className="card-meta">
            <div className="skeleton-author"></div>
          </div>
          <div className="skeleton-btn"></div>
        </div>
      </article>
    ));
  };

  return (
    <div className="global-feed" ref={feedRef}>
      {isLoading ? (
        renderSkeletons()
      ) : feedItems.length === 0 ? (
        <p className="help-text" style={{ textAlign: 'center', marginTop: '2rem' }}>No blessings yet. Be the first!</p>
      ) : (
        <AnimatePresence initial={false}>
          {feedItems.map((item) => {
            const isBlessed = blessedIds.includes(item.id);
            // Highlight if added within the last 10 seconds and author is current user
            const isNewlyAddedByMe = item.author === currentUser && (Date.now() - new Date(item.created_at).getTime()) < 10000;

            return (
              <motion.article 
                key={item.id} 
                className={`feed-card glass-panel ${isNewlyAddedByMe ? 'highlight-new' : ''}`}
                layout
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
              >
                <p className="card-text">"{item.text}"</p>
                <div className="card-footer">
                  <div className="card-meta">
                    <span className="author">{item.author}</span>
                    <span className="dot">•</span>
                    <span className="date">{formatTimeAgo(item.created_at)}</span>
                  </div>
                  <button 
                    className={`bless-btn ${isBlessed ? 'active' : ''}`}
                    onClick={() => handleBless(item.id)}
                    aria-label={isBlessed ? `You blessed this post. Total blessings: ${item.bless_count || 0}` : `Bless this gratitude post by ${item.author}`}
                    disabled={isBlessed}
                  >
                    <Heart 
                      size={18} 
                      className="heart-icon" 
                      fill={isBlessed ? 'currentColor' : 'none'} 
                    />
                    <span className="count">{item.bless_count || 0}</span>
                    
                    {poppingId === item.id && (
                      <div className="confetti-container">
                        {Array.from({ length: 6 }).map((_, i) => {
                          const angle = (i * 60) * (Math.PI / 180);
                          const distance = 35;
                          const tx = `${Math.cos(angle) * distance}px`;
                          const ty = `${Math.sin(angle) * distance}px`;
                          return <div key={i} className="confetti-particle" style={{ '--tx': tx, '--ty': ty }}></div>
                        })}
                      </div>
                    )}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
};

export default GlobalFeed;
