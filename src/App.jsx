import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Archive from './pages/Archive';
import SettingsModal from './components/SettingsModal';
import { supabase } from './lib/supabase';

function App() {
  const [nickname, setNickname] = useState('익명');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [myBlessings, setMyBlessings] = useState([]);
  const [session, setSession] = useState(null);

  // Growth Tracker State
  const [totalXp, setTotalXp] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastWateredDate, setLastWateredDate] = useState(null);
  
  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // Auth State Setup
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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

  const handleSaveNickname = (newName) => {
    setNickname(newName);
    localStorage.setItem('bless_nickname', newName);
    setIsSettingsOpen(false);
  };

  const handleAddBlessing = async (text) => {
    // Always use the user-defined nickname (default: 익명) for anonymity
    const authorName = nickname;
    
    const { data, error } = await supabase
      .from('blessings')
      .insert([{ text, author: authorName, bless_count: 0 }])
      .select();

    if (error) {
      console.error('Error inserting blessing:', error);
      alert('Failed to post blessing. Please try again.');
      return;
    }

    if (data && data.length > 0) {
      const newBlessing = data[0];
      const updated = [newBlessing, ...myBlessings];
      setMyBlessings(updated);
      localStorage.setItem('my_blessings', JSON.stringify(updated));

      // Watering Logic
      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format based on local time
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
  };

  return (
    <Router>
      <div className="app-container">
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home nickname={nickname} onAddBlessing={handleAddBlessing} />} />
            <Route path="/archive" element={<Archive myBlessings={myBlessings} totalXp={totalXp} currentStreak={currentStreak} />} />
          </Routes>
        </main>
        
        {isSettingsOpen && (
          <SettingsModal 
            currentNickname={nickname}
            onClose={() => setIsSettingsOpen(false)}
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
