import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Archive from './pages/Archive';
import SettingsModal from './components/SettingsModal';

function App() {
  const [nickname, setNickname] = useState('익명');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [myBlessings, setMyBlessings] = useState([]);

  useEffect(() => {
    const storedName = localStorage.getItem('bless_nickname');
    if (storedName) setNickname(storedName);
    
    const storedBlessings = localStorage.getItem('my_blessings');
    if (storedBlessings) setMyBlessings(JSON.parse(storedBlessings));
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

  return (
    <Router>
      <div className="app-container">
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home nickname={nickname} onAddBlessing={handleAddBlessing} />} />
            <Route path="/archive" element={<Archive myBlessings={myBlessings} />} />
          </Routes>
        </main>
        
        {isSettingsOpen && (
          <SettingsModal 
            currentNickname={nickname}
            onClose={() => setIsSettingsOpen(false)}
            onSave={handleSaveNickname}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
