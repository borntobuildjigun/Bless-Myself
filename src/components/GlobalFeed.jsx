import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GlobalFeed = ({ currentUser }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [blessedIds, setBlessedIds] = useState([]);
  
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
          setFeedItems((current) => [payload.new, ...current]);
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
  };

  const handleBless = async (id) => {
    if (blessedIds.includes(id)) return; // Prevent multiple blessings locally

    // Optimistic UI update
    const newBlessedIds = [...blessedIds, id];
    setBlessedIds(newBlessedIds);
    localStorage.setItem('blessed_ids', JSON.stringify(newBlessedIds));

    setFeedItems(items => items.map(item => {
      if (item.id === id) {
        return { ...item, bless_count: (item.bless_count || 0) + 1 };
      }
      return item;
    }));

    // Call Supabase RPC to increment in DB safely
    const { error } = await supabase.rpc('increment_bless_count', { row_id: id });
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

  return (
    <div className="global-feed">
      {feedItems.length === 0 ? (
        <p className="help-text" style={{ textAlign: 'center', marginTop: '2rem' }}>No blessings yet. Be the first!</p>
      ) : (
        feedItems.map((item) => {
          const isBlessed = blessedIds.includes(item.id);
          return (
            <div key={item.id} className="feed-card glass-panel">
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
                  aria-label="Bless this post"
                  disabled={isBlessed}
                >
                  <Heart 
                    size={18} 
                    className="heart-icon" 
                    fill={isBlessed ? 'currentColor' : 'none'} 
                  />
                  <span className="count">{item.bless_count || 0}</span>
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default GlobalFeed;
