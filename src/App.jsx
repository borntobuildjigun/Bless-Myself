import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Archive from './pages/Archive';
import GlobalModal from './components/GlobalModal';
import { supabase } from './lib/supabase';

function App() {
  const [nickname, setNickname] = useState('익명');
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [myBlessings, setMyBlessings] = useState([]);
  const [session, setSession] = useState(null);

  // Growth Tracker State
  const [totalXp, setTotalXp] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastWateredDate, setLastWateredDate] = useState(null);
  
  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const syncStatsToDB = async (sessionData) => {
    if (!sessionData) return;
    
    const localName = localStorage.getItem('bless_nickname') || '익명';
    const localXp = parseInt(localStorage.getItem('total_xp') || 0, 10);
    const localStreak = parseInt(localStorage.getItem('current_streak') || 0, 10);
    const localDate = localStorage.getItem('last_watered_date') || null;
    
    let localBlessingsCount = 0;
    const storedBlessings = localStorage.getItem('my_blessings');
    if (storedBlessings) {
      localBlessingsCount = JSON.parse(storedBlessings).length;
    }

    // Call RPC to sync
    await supabase.rpc('sync_user_stats', {
      p_nickname: localName,
      p_total_xp: localXp,
      p_current_streak: localStreak,
      p_total_blessings: localBlessingsCount,
      p_last_watered_date: localDate
    });

    // After sync, fetch the authoritative stats from DB (in case of multi-device login)
    const { data } = await supabase
      .from('profiles')
      .select('nickname, total_xp, current_streak, last_watered_date')
      .eq('id', sessionData.user.id)
      .single();

    if (data) {
      if (data.nickname) {
        setNickname(data.nickname);
        localStorage.setItem('bless_nickname', data.nickname);
      }
      setTotalXp(data.total_xp || 0);
      localStorage.setItem('total_xp', data.total_xp || 0);
      
      setCurrentStreak(data.current_streak || 0);
      localStorage.setItem('current_streak', data.current_streak || 0);
      
      if (data.last_watered_date) {
        setLastWateredDate(data.last_watered_date);
        localStorage.setItem('last_watered_date', data.last_watered_date);
      }
    }
  };

  useEffect(() => {
    // Auth State Setup
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) syncStatsToDB(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN') {
        syncStatsToDB(session);
      }
    });

    // Local Storage Setup
    const storedName = localStorage.getItem('bless_nickname');
    if (storedName) setNickname(storedName);
    
    const storedBlessings = localStorage.getItem('my_blessings');
    if (storedBlessings) setMyBlessings(JSON.parse(storedBlessings));

    const storedXp = localStorage.getItem('total_xp');
    if (storedXp) setTotalXp(parseInt(storedXp, 10));

    const storedDate = localStorage.getItem('last_watered_date');
    let streak = 0;
    const storedStreak = localStorage.getItem('current_streak');
    if (storedStreak) streak = parseInt(storedStreak, 10);

    if (storedDate) {
      setLastWateredDate(storedDate);
      // Check if streak is broken (more than 1 day since last watered)
      const lastDate = new Date(storedDate);
      const today = new Date();
      lastDate.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      const diffTime = today - lastDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays > 1) {
         streak = 0;
         localStorage.setItem('current_streak', 0);
      }
    }
    setCurrentStreak(streak);

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveNickname = async (newName) => {
    setNickname(newName);
    localStorage.setItem('bless_nickname', newName);
    setIsGlobalModalOpen(false);
    
    // Also update DB if logged in
    if (session) {
      await supabase.from('profiles').update({ nickname: newName }).eq('id', session.user.id);
    }
  };

  const handleAddBlessing = async (text) => {
    const authorName = nickname;
    const todayStr = new Date().toLocaleDateString('en-CA');
    
    let insertedData = null;

    if (session) {
      // Logic for logged in user (atomic update)
      let xpToAdd = 0;
      let newStreak = currentStreak;
      
      if (lastWateredDate !== todayStr) {
        xpToAdd = 10;
        newStreak += 1;
      }

      const { data, error } = await supabase.rpc('add_blessing_and_update_stats', {
        p_text: text,
        p_author: authorName,
        p_xp_to_add: xpToAdd,
        p_streak_to_set: newStreak,
        p_last_watered_date: todayStr
      });

      if (error) {
        console.error('Error in RPC:', error);
        alert('Failed to post blessing. Please try again.');
        return null;
      }
      insertedData = data;
      
      // Update local state to match DB changes
      if (xpToAdd > 0) {
        setTotalXp(prev => prev + xpToAdd);
        localStorage.setItem('total_xp', totalXp + xpToAdd);
        
        setCurrentStreak(newStreak);
        localStorage.setItem('current_streak', newStreak);
        
        setLastWateredDate(todayStr);
        localStorage.setItem('last_watered_date', todayStr);

        setToastMessage(`나무에 물을 주었습니다! 🌱 +10XP (연속 ${newStreak}일)`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setToastMessage('나의 감사가 기록되었습니다. 🌿');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
      
    } else {
      // Standard insert for anonymous
      const { data, error } = await supabase
        .from('blessings')
        .insert([{ text, author: authorName, bless_count: 0 }])
        .select();

      if (error) {
        console.error('Error inserting blessing:', error);
        alert('Failed to post blessing. Please try again.');
        return null;
      }
      insertedData = data[0];
      
      // Local watering logic
      if (lastWateredDate !== todayStr) {
        const newStreak = currentStreak + 1;
        const newXp = totalXp + 10;
        
        setTotalXp(newXp);
        setCurrentStreak(newStreak);
        setLastWateredDate(todayStr);
        
        localStorage.setItem('total_xp', newXp);
        localStorage.setItem('current_streak', newStreak);
        localStorage.setItem('last_watered_date', todayStr);

        setToastMessage(`나무에 물을 주었습니다! 🌱 +10XP (연속 ${newStreak}일)`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setToastMessage('나의 감사가 기록되었습니다. 🌿');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }

    if (insertedData) {
      const updated = [insertedData, ...myBlessings];
      setMyBlessings(updated);
      localStorage.setItem('my_blessings', JSON.stringify(updated));
      return insertedData;
    }
    return null;
  };

  return (
    <Router basename="/Bless-Myself">
      <div className="app-container">
        <Header onOpenSettings={() => setIsGlobalModalOpen(true)} session={session} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home nickname={nickname} onAddBlessing={handleAddBlessing} />} />
            <Route path="/archive" element={<Archive myBlessings={myBlessings} totalXp={totalXp} currentStreak={currentStreak} />} />
          </Routes>
        </main>
        
        {isGlobalModalOpen && (
          <GlobalModal 
            currentNickname={nickname}
            onClose={() => setIsGlobalModalOpen(false)}
            onSave={handleSaveNickname}
            session={session}
          />
        )}

        {showToast && (
          <div className="toast-notification">
            {toastMessage}
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
