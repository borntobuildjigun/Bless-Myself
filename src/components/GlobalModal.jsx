import React, { useState, useEffect } from 'react';
import { X, LogOut, Trophy, User, Medal } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GlobalModal = ({ currentNickname, onClose, onSave, session }) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'leaderboard'
  
  // Profile State
  const [name, setName] = useState(currentNickname);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Leaderboard State
  const [leaders, setLeaders] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(false);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoadingLeaders(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('nickname, email, total_blessings, current_streak')
      .order('total_blessings', { ascending: false })
      .limit(10);
      
    if (!error && data) {
      setLeaders(data);
    }
    setLoadingLeaders(false);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('가입을 환영합니다! 🎉 입력하신 이메일로 인증 링크가 발송되었으니 메일함을 확인해 주세요.');
    }
    setLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage(error.message);
    } else {
      // Upon successful sign-in, we could trigger sync logic here, 
      // but App.jsx onAuthStateChange will handle setting the session.
      onClose(); 
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) setMessage(error.message);
    setLoading(false);
  };

  const maskEmail = (emailStr) => {
    if (!emailStr) return 'Anonymous';
    const [namePart, domainPart] = emailStr.split('@');
    if (namePart.length <= 2) return `${namePart}***@${domainPart}`;
    return `${namePart.slice(0, 2)}***@${domainPart}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
        
        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> My Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Trophy size={18} /> Leaderboard
          </button>
        </div>
        
        {activeTab === 'profile' && (
          <div className="tab-content fade-in">
            <div className="settings-section">
              <h3>Profile</h3>
              <form onSubmit={handleProfileSubmit} className="settings-form">
                <div className="input-group">
                  <label htmlFor="nickname">Nickname</label>
                  <input 
                    type="text" 
                    id="nickname" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your nickname"
                    maxLength={20}
                  />
                </div>
                <p className="help-text">This name will appear on your global feed cards.</p>
                <button type="submit" className="primary-btn">Save Changes</button>
              </form>
            </div>

            <div className="settings-section mt-4">
              <h3>Account</h3>
              
              {session ? (
                <div className="account-info">
                  <p className="help-text">Logged in as <strong>{session.user.email}</strong></p>
                  <button 
                    onClick={handleSignOut} 
                    className="secondary-btn flex-btn"
                    disabled={loading}
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="auth-form">
                  <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input 
                      type="password" 
                      id="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="******"
                    />
                  </div>
                  {message && <p className="help-text error-text" style={{ color: '#f43f5e', marginTop: '-0.5rem' }}>{message}</p>}
                  <div className="auth-buttons" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={handleSignUp} className="secondary-btn" disabled={loading || !email || !password}>
                      {loading ? 'Wait...' : 'Sign Up'}
                    </button>
                    <button onClick={handleSignIn} className="primary-btn" disabled={loading || !email || !password}>
                      {loading ? 'Wait...' : 'Log In'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="tab-content fade-in leaderboard-content">
            <h3 className="leaderboard-title">Top Blessers 🏆</h3>
            {loadingLeaders ? (
              <p className="loading-text">Loading ranks...</p>
            ) : leaders.length === 0 ? (
              <p className="empty-text">No rankings yet. Be the first!</p>
            ) : (
              <ul className="leaderboard-list">
                {leaders.map((leader, index) => (
                  <li key={index} className={`leader-item rank-${index + 1}`}>
                    <div className="leader-rank">
                      {index === 0 && <Medal size={24} color="#fbbf24" />}
                      {index === 1 && <Medal size={24} color="#9ca3af" />}
                      {index === 2 && <Medal size={24} color="#b45309" />}
                      {index > 2 && <span className="rank-number">{index + 1}</span>}
                    </div>
                    <div className="leader-info">
                      <span className="leader-name">
                        {leader.nickname || maskEmail(leader.email)}
                      </span>
                      <div className="leader-stats">
                        <span className="stat-badge streak">🔥 {leader.current_streak || 0}</span>
                        <span className="stat-badge blessings">📝 {leader.total_blessings || 0}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalModal;
