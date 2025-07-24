import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LanguageToggle } from './LanguageToggle';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">PF2e Assistant</h1>
          
          <nav className="navigation">
            <Link 
              to="/player" 
              className={`nav-link ${location.pathname === '/player' || location.pathname === '/' ? 'active' : ''}`}
            >
              Player
            </Link>
            <Link 
              to="/gm" 
              className={`nav-link ${location.pathname === '/gm' ? 'active' : ''}`}
            >
              GM
            </Link>
          </nav>

          <div className="header-controls">
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};