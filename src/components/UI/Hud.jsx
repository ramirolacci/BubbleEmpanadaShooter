import React from 'react';
import { Trophy, Flame, Zap } from 'lucide-react';

const Hud = ({ score, level, shots, onPowerUp }) => {
  return (
    <div className="hud-container">
      <div className="hud-header">
        <div className="hud-stat">
          <Trophy size={24} color="#D4AF37" />
          <span>{score}</span>
        </div>
        <div className="hud-stat">
            <span>SHOTS: {shots}</span>
        </div>
        <div className="hud-stat">
          <span className="level-text">NIVEL {level}</span>
        </div>
      </div>
      
      <div className="power-ups">
        <button className="power-up-btn fire" onClick={() => onPowerUp('fire')}>
          <Flame size={24} />
        </button>
      </div>
    </div>
  );
};

export default Hud;
