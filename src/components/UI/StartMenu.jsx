import React, { useEffect, useState } from 'react';
import { Play, Utensils } from 'lucide-react';
import './StartMenu.css';

const StartMenu = ({ onPlay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger entry animations
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`start-menu-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="start-menu-content">
        <div className="logo-container">
          <img 
            src="/logo/Logo Mi Gusto 2025.png" 
            alt="Mi Gusto Logo" 
            className="menu-logo" 
          />
        </div>
        
        <h1 className="game-title">EMPANADA SHOOTER</h1>
        
        <div className="menu-decoration">
          <div className="floating-empanada e1"></div>
          <div className="floating-empanada e2"></div>
          <div className="floating-empanada e3"></div>
        </div>

        <div className="actions">
          <button className="play-button" onClick={onPlay}>
            <div className="button-content">
              <Play fill="currentColor" size={32} />
              <span>JUGAR</span>
            </div>
            <div className="button-background"></div>
          </button>
        </div>

        <div className="menu-footer">
          <p>DIVERSIÓN CON SABOR</p>
          <div className="flavors-line">
            <span>Crunchy</span> • <span>Burger</span> • <span>Matambre</span> • <span>Mexican</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
