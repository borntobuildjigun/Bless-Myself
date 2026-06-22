import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Leaf, Home } from 'lucide-react';

const Header = ({ onOpenSettings, session }) => {
  const location = useLocation();
  const isArchive = location.pathname === '/archive';

  return (
    <header className="app-header">
      <div className="header-left">
        {isArchive ? (
          <Link to="/" className="icon-btn" aria-label="Home">
            <Home size={24} />
          </Link>
        ) : (
          <Link to="/archive" className="icon-btn" aria-label="My Garden">
            <Leaf size={24} />
          </Link>
        )}
      </div>
      <div className="header-center">
        <h1 className="logo-text">Bless Myself</h1>
      </div>
      <div className="header-right">
        {!session && (
          <button className="signup-btn" onClick={onOpenSettings}>
            회원가입
          </button>
        )}
        <button className="icon-btn" onClick={onOpenSettings} aria-label="Global / Settings">
          <Globe size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;
