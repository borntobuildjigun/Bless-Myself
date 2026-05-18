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

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveNickname = (newName) => {
    setNickname(newName);
    localStorage.setItem('bless_nickname', newName);
    setIsSettingsOpen(false);
  };

  const handleAddBlessing = (text) => {
    const newBlessing = {
      id: Date.now(),
      text,
      date: new Date().toISOString(),
    };
    const updated = [newBlessing, ...myBlessings];
    setMyBlessings(updated);
    localStorage.setItem('my_blessings', JSON.stringify(updated));
  };

  // Optionally, if session exists, we can use their email prefix as a default nickname
  const displayNickname = session ? (session.user.email.split('@')[0]) : nickname;

  return (
    <Router>
      <div className="app-container">
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home nickname={displayNickname} onAddBlessing={handleAddBlessing} />} />
            <Route path="/archive" element={<Archive myBlessings={myBlessings} />} />
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
      </div>
    </Router>
  );
}

export default App;
