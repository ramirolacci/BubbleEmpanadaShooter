import Phaser from 'phaser';
import gsap from 'gsap';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.image(540, 960, 'background').setDisplaySize(1080, 1920);
    
    // Notify React that we are in the Menu Scene
    this.game.events.emit('MENU_READY');

    // Subscribe to play event from React
    this.game.events.on('START_PLAY', () => {
      this.scene.start('MainScene');
    });
  }
}
