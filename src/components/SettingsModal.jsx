import React, { useState } from 'react';
import { X, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SettingsModal = ({ currentNickname, onClose, onSave, session }) => {
  const [name, setName] = useState(currentNickname);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      setMessage('Check your email for the login link! (Or you might be logged in already if email confirmation is off)');
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
      onClose(); // Close modal on successful login
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) setMessage(error.message);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
        
        <h2 className="modal-title">Settings</h2>
        
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
    </div>
  );
};

export default SettingsModal;
