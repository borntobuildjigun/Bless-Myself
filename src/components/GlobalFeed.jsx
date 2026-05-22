import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const CARDS_PER_ROW = 8;
const TRUNCATE_LENGTH = 80;

const FeedRow = ({ items, currentUser, blessedIds, onBless, poppingId, rowIndex }) => {
  const rowRef = useRef(null);
  const [dragConstraint, setDragConstraint] = useState(0);
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    if (rowRef.current) {
      const containerWidth = rowRef.current.parentElement.offsetWidth;
      const scrollWidth = rowRef.current.scrollWidth;
      setDragConstraint(Math.min(0, -(scrollWidth - containerWidth)));
    }
  }, [items]);

  const formatTimeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="feed-row-container">
      <motion.div
        ref={rowRef}
        className="feed-row"
        drag="x"
        dragConstraints={{ left: dragConstraint, right: 0 }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
      >
        {items.map((item) => {
          const isBlessed = blessedIds.includes(item.id);
          const isNewlyAddedByMe = item.author === currentUser && (Date.now() - new Date(item.created_at).getTime()) < 10000;
          const isLong = item.text.length > TRUNCATE_LENGTH;
          const isExpanded = expandedIds.includes(item.id);
          const displayText = isLong && !isExpanded ? item.text.slice(0, TRUNCATE_LENGTH) + '...' : item.text;

          return (
            <motion.article
              key={item.id}
              className={`gallery-card glass-panel ${isNewlyAddedByMe ? 'highlight-new' : ''} ${isExpanded ? 'expanded' : ''}`}
              layout
              initial={isNewlyAddedByMe ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
            >
              <p className="gallery-card-text">"{displayText}"</p>
              {isLong && (
                <button
                  className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedIds(prev =>
                      prev.includes(item.id)
                        ? prev.filter(id => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                >
                  <span>{isExpanded ? '접기' : '더보기'}</span>
                  <ChevronDown size={14} />
                </button>
              )}
              <div className="gallery-card-footer">
                <div className="card-meta">
                  <span className="author">{item.author}</span>
                  <span className="dot">•</span>
                  <span className="date">{formatTimeAgo(item.created_at)}</span>
                </div>
                <button
                  className={`bless-btn ${isBlessed ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onBless(item.id); }}
                  aria-label={isBlessed ? `Blessed (${item.bless_count || 0})` : `Bless this post`}
                  disabled={isBlessed}
                >
                  <Heart
                    size={16}
                    className="heart-icon"
                    fill={isBlessed ? 'currentColor' : 'none'}
                  />
                  <span className="count">{item.bless_count || 0}</span>

                  {poppingId === item.id && (
                    <div className="confetti-container">
                      {Array.from({ length: 6 }).map((_, i) => {
                        const angle = (i * 60) * (Math.PI / 180);
                        const distance = 30;
                        const tx = `${Math.cos(angle) * distance}px`;
                        const ty = `${Math.sin(angle) * distance}px`;
                        return <div key={i} className="confetti-particle" style={{ '--tx': tx, '--ty': ty }}></div>;
                      })}
                    </div>
                  )}
                </button>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  );
};

const GlobalFeed = ({ currentUser, feedRef, newlyInsertedItem }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [blessedIds, setBlessedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [poppingId, setPoppingId] = useState(null);

  useEffect(() => {
    if (newlyInsertedItem) {
      setFeedItems((current) => {
        if (current.some(item => item.id === newlyInsertedItem.id)) return current;
        return [newlyInsertedItem, ...current];
      });
    }
  }, [newlyInsertedItem]);

  useEffect(() => {
    const stored = localStorage.getItem('blessed_ids');
    if (stored) setBlessedIds(JSON.parse(stored));

    fetchBlessings();

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
    if (blessedIds.includes(id)) return;

    setPoppingId(id);
    setTimeout(() => setPoppingId(null), 600);

    const newBlessedIds = [...blessedIds, id];
    setBlessedIds(newBlessedIds);
    localStorage.setItem('blessed_ids', JSON.stringify(newBlessedIds));

    setFeedItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        return { ...item, bless_count: (item.bless_count || 0) + 1 };
      }
      return item;
    }));

    const { error } = await supabase.rpc('increment_bless_count', { row_id: id });
    if (error) {
      console.error('Error incrementing bless count:', error);
    }
  };

  // Group feed items into rows of CARDS_PER_ROW
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < feedItems.length; i += CARDS_PER_ROW) {
      result.push(feedItems.slice(i, i + CARDS_PER_ROW));
    }
    return result;
  }, [feedItems]);

  const renderSkeletons = () => {
    return (
      <div className="feed-row-container">
        <div className="feed-row">
          {Array.from({ length: 3 }).map((_, i) => (
            <article key={`skeleton-${i}`} className="gallery-card glass-panel skeleton-card">
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
              <div className="skeleton-text" style={{ width: '50%' }}></div>
              <div className="gallery-card-footer" style={{ marginTop: 'auto' }}>
                <div className="card-meta">
                  <div className="skeleton-author"></div>
                </div>
                <div className="skeleton-btn"></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="global-feed" ref={feedRef}>
      {isLoading ? (
        renderSkeletons()
      ) : feedItems.length === 0 ? (
        <p className="help-text" style={{ textAlign: 'center', marginTop: '2rem' }}>No blessings yet. Be the first!</p>
      ) : (
        rows.map((rowItems, rowIndex) => (
          <FeedRow
            key={`row-${rowIndex}-${rowItems[0]?.id}`}
            items={rowItems}
            currentUser={currentUser}
            blessedIds={blessedIds}
            onBless={handleBless}
            poppingId={poppingId}
            rowIndex={rowIndex}
          />
        ))
      )}
    </div>
  );
};

export default GlobalFeed;
