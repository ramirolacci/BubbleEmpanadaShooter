import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { phaserConfig } from '../game/config/phaserConfig';
import Hud from './UI/Hud';
import StartMenu from './UI/StartMenu';

const Game = () => {
  const gameRef = useRef(null);
  const [gameState, setGameState] = useState({ 
    score: 0, 
    level: 1, 
    shots: 30,
    isGameOver: false,
    win: false,
    isMenuOpen: true
  });

  useEffect(() => {
    if (!gameRef.current) {
      const config = {
        ...phaserConfig,
        callbacks: {
          postBoot: (game) => {
            game.events.on('UPDATE_SCORE', (score) => {
              setGameState(prev => ({ ...prev, score }));
            });
            game.events.on('UPDATE_SHOTS', (shots) => {
              setGameState(prev => ({ ...prev, shots }));
            });
            game.events.on('GAME_OVER', ({ score, win }) => {
              setGameState(prev => ({ ...prev, isGameOver: true, win }));
            });
            game.events.on('MENU_READY', () => {
              setGameState(prev => ({ ...prev, isMenuOpen: true }));
            });
            game.events.on('START_MAIN_SCENE', () => {
              setGameState(prev => ({ ...prev, isMenuOpen: false }));
            });
          }
        }
      };
      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const activatePowerUp = (type) => {
    if (gameRef.current) {
      if (type === 'fire') {
        gameRef.current.events.emit('ACTIVATE_FIRE');
      }
    }
  };

  const restartGame = () => {
    window.location.reload(); // Simple restart
  };

  const handlePlay = () => {
    if (gameRef.current) {
      gameRef.current.events.emit('START_PLAY');
      setGameState(prev => ({ ...prev, isMenuOpen: false }));
    }
  };

  return (
    <div id="game-container">
      <Hud 
        score={gameState.score} 
        level={gameState.level} 
        shots={gameState.shots}
        onPowerUp={activatePowerUp}
      />
      
      {gameState.isGameOver && (
        <div className="game-over-overlay">
          <h2>{gameState.win ? '¡GANASTE!' : 'FIN DEL JUEGO'}</h2>
          <p>Tu puntuación: {gameState.score}</p>
          {gameState.win && (
            <div className="qr-container">
              <p>Escanea para tu premio:</p>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DESC_MIGUSTO_20" alt="QR Discount" />
            </div>
          )}
          <button onClick={restartGame}>VOLVER A JUGAR</button>
        </div>
      )}
      
      {gameState.isMenuOpen && (
        <StartMenu onPlay={handlePlay} />
      )}
    </div>
  );
};

export default Game;
