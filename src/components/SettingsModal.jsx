import React, { useState } from 'react';
import { X } from 'lucide-react';

const SettingsModal = ({ currentNickname, onClose, onSave }) => {
  const [name, setName] = useState(currentNickname);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        <h2 className="modal-title">Settings</h2>
        
        <div className="settings-section">
          <h3>Profile</h3>
          <form onSubmit={handleSubmit} className="settings-form">
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
          <p className="help-text">Login features will be available soon.</p>
          <button className="secondary-btn" disabled>Login / Register</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
