import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Load images
    this.load.image('background', '/fondo/fondo-pantalla.png');
    this.load.image('empanada_crunchy', '/empanadas/CRUNCHY.png');
    this.load.image('empanada_burger', '/empanadas/empanada-big-burger.png');
    this.load.image('empanada_matambre', '/empanadas/empanada-matambre -alapizza.png');
    this.load.image('empanada_pork', '/empanadas/empanada-mexican-pibil-pork.png');
    this.load.image('empanada_fire', '/empanadas/empanada-mexican-pibil-pork.png'); // Placeholder for fire for now
    this.load.image('cannon', '/cañon/cañon.png');
    this.load.image('logo_start', '/logo/Logo Mi Gusto 2025.png');
    
    // UI Placeholders
    this.load.image('logo', 'https://placehold.co/400x200/D4AF37/3E2723?text=Mi+Gusto');
    this.load.image('btn_play', 'https://placehold.co/300x100/D4AF37/3E2723?text=JUGAR');
    
    // UI Placeholders
    this.load.image('logo', 'https://placehold.co/400x200/D4AF37/3E2723?text=Mi+Gusto');
    this.load.image('btn_play', 'https://placehold.co/300x100/D4AF37/3E2723?text=JUGAR');
    
    // Add loading bar logic if needed
    let loadingBar = this.add.graphics({
      fillStyle: {
        color: 0xD4AF37 // Gold
      }
    });

    this.load.on('progress', (percent) => {
      loadingBar.fillRect(0, this.game.config.height / 2, this.game.config.width * percent, 50);
    });

    this.load.on('complete', () => {
      this.scene.start('MenuScene');
    });
  }
}
