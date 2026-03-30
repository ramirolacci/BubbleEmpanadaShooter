import Phaser from 'phaser';
import gsap from 'gsap';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.grid = [];
    this.rows = 20;
    this.cols = 10;
    this.bubbleRadius = 50;
    this.bubbleDiameter = 100;
    this.isShooting = false;
    this.score = 0;
    this.isFireActive = false;
    this.remainingShots = 30;
    
    // Flavor colors mapping - Using more distinct colors for contrast
    this.flavorColors = {
      'empanada_crunchy': 0xFF5722, // Crunchy (Vibrant Orange)
      'empanada_burger': 0x00E5FF,  // Big Burger (Neon Cyan)
      'empanada_matambre': 0xE040FB, // Matambre alapizza (Bright Purple)
      'empanada_pork': 0xFFD600,    // Mexican Pibil (Vibrant Yellow)
      'empanada_fire': 0xFF1744     // Fire (Neon Red)
    };
  }

  create() {
    this.add.image(540, 960, 'background').setDisplaySize(1080, 1920);
    this.physics.world.setBounds(0, 0, 1080, 1920);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.bubbles = this.physics.add.group();
    this.createInitialGrid();
    
    // Shooter setup
    this.shooter = this.add.container(540, 1800);
    this.createCanon();
    this.nextEmpanada = this.add.image(0, -200, 'empanada_crunchy').setDisplaySize(55, 55);
    this.shooter.add([this.nextEmpanada]);

    this.mouthOffset = 200; // Distance from cannon pivot to mouth

    // Guiding line
    this.graphics = this.add.graphics();
    
    this.input.on('pointermove', (pointer) => {
      this.updateTrajectory(pointer);
    });

    this.input.on('pointerup', (pointer) => {
        this.shoot(pointer);
    });


    // Events from React
    this.game.events.on('ACTIVATE_FIRE', () => {
      this.isFireActive = true;
      this.nextEmpanada.setTexture('empanada_fire');
    });

    this.input.setDefaultCursor('crosshair');
  }

  createCanon() {
    // Cannon sprite from user image in public/cañon/cañon.png
    const cannon = this.add.image(0, 0, 'cannon');
    // Ensure proportional scale to avoid stretching
    cannon.displayWidth = 280;
    cannon.scaleY = cannon.scaleX;
    cannon.setOrigin(0.5, 0.75); // Adjusted pivot for the asset
    
    // "Mi Gusto" text below cannon
    const brandText = this.add.text(0, 80, 'MI GUSTO', {
        fontSize: '24px',
        color: '#D4AF37',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.shooter.add([cannon, brandText]);
  }

  createInitialGrid() {
    const flavors = ['empanada_crunchy', 'empanada_burger', 'empanada_matambre', 'empanada_pork'];
    for (let row = 0; row < 6; row++) {
      this.grid[row] = [];
      const offset = (row % 2 !== 0) ? this.bubbleRadius : 0;
      
      for (let col = 0; col < this.cols; col++) {
        const x = col * this.bubbleDiameter + this.bubbleRadius + offset + 40;
        const y = row * (this.bubbleDiameter * 0.85) + this.bubbleRadius + 180;
        
        const flavor = flavors[Math.floor(Math.random() * flavors.length)];
        const bubble = this.createBubbleAt(x, y, flavor, true);
        bubble.setData('row', row);
        bubble.setData('col', col);
        this.grid[row][col] = bubble;
      }
    }
  }

  createBubbleAt(x, y, flavor, addToGroup = true) {
    const color = this.flavorColors[flavor];
    
    // Background Circle
    const bg = this.add.circle(x, y, 45, color, 0.8).setStrokeStyle(4, 0xFFFFFF, 0.4);
    this.physics.add.existing(bg);
    bg.body.setCircle(28, 17, 17); // Tighter body for deeper impact
    
    if (addToGroup) {
      bg.body.setImmovable(true);
      this.bubbles.add(bg);
    }
    
    // Empanada Sprite on top
    const sprite = this.add.image(x, y, flavor).setDisplaySize(80, 80);
    sprite.setDepth(2);
    bg.setDepth(1);
    
    // We bind them or just use the background as the physics body
    bg.setData('flavor', flavor);
    bg.setData('sprite', sprite);
    
    // Sync sprite with background position if it falls
    bg.updateSprite = () => {
      sprite.setPosition(bg.x, bg.y);
      sprite.setAlpha(bg.alpha);
      sprite.setRotation(bg.rotation);
    };
    
    return bg;
  }

  updateTrajectory(pointer) {
    this.graphics.clear();
    const angle = Phaser.Math.Angle.Between(this.shooter.x, this.shooter.y - 50, pointer.x, pointer.y);
    this.shooter.rotation = angle + Math.PI/2;

    this.graphics.lineStyle(8, 0x44FF44, 1.0); // Now bright neon green with full alpha for visibility
    const length = 1200;
    
    const startX = this.shooter.x + Math.cos(angle) * this.mouthOffset;
    const startY = this.shooter.y + Math.sin(angle) * this.mouthOffset;

    this.graphics.beginPath();
    this.graphics.moveTo(startX, startY);
    this.graphics.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
    this.graphics.strokePath();
  }

  shoot(pointer) {
    if (this.isShooting) return;
    this.isShooting = true;
    console.log('Firing shooter at angle...');

    const angle = Phaser.Math.Angle.Between(this.shooter.x, this.shooter.y, pointer.x, pointer.y);
    const spawnX = this.shooter.x + Math.cos(angle) * this.mouthOffset;
    const spawnY = this.shooter.y + Math.sin(angle) * this.mouthOffset;
    const flavor = this.nextEmpanada.texture.key;
    
    // Projectile starting from oven mouth
    const projectile = this.createBubbleAt(spawnX, spawnY, flavor, false);
    this.shooterBubble = projectile;
    
    // DISABLE BOTTOM WALL for this projectile
    projectile.body.setCollideWorldBounds(true);
    projectile.body.onWorldBounds = true;
    projectile.body.setBounce(1, 1);
    
    // Adjusted speed for stability
    const speed = 2400;
    projectile.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    console.log('Fired projectile:', flavor, 'Velocity:', projectile.body.velocity);

    this.remainingShots--;
    this.game.events.emit('UPDATE_SHOTS', this.remainingShots);

    this.physics.add.collider(projectile, this.bubbles, (p, b) => {
      if (!p.active || !b.active) return;
      console.log('Projectile hit a bubble!');
      if (this.isFireActive) {
        this.handleFireBurst(p, b);
      } else {
        this.snapToGrid(p, b);
      }
    });

    // Update next empanada
    const flavors = ['empanada_crunchy', 'empanada_burger', 'empanada_matambre', 'empanada_pork'];
    const nextFlavor = flavors[Math.floor(Math.random() * flavors.length)];
    
    if (this.isFireActive) {
      this.isFireActive = false;
    }
    this.nextEmpanada.setTexture(nextFlavor);
    this.nextEmpanada.setDisplaySize(55, 55);

    if (this.remainingShots <= 0) {
        this.time.delayedCall(2000, () => this.gameOver(false));
    }
    
    // Track shooter bubble
    projectile.isProjectile = true;
    
    // Failsafe destroy after a while
    this.time.delayedCall(3000, () => {
      if (projectile.active) {
        if (projectile.getData('sprite')) projectile.getData('sprite').destroy();
        projectile.destroy();
        this.shooterBubble = null;
        this.isShooting = false;
      }
    });
  }

  snapToGrid(projectile, hitBubble) {
    const x = projectile.x;
    const y = projectile.y;
    
    // Only snap if we are above a certain Y threshold (top half of screen approximately)
    // The grid is at the top. The shooter is at 1800.
    if (y > 1500) {
        console.log('Skipping snap: too low in screen', y);
        return;
    }

    console.log('Snapping to grid at:', x, y);
    
    const flavor = projectile.getData('flavor');

    // Destroy visual components
    if (projectile.getData('sprite')) projectile.getData('sprite').destroy();
    projectile.destroy();
    
    this.shooterBubble = null;
    this.isShooting = false;

    // Calculate row/col based on x,y
    const row = Math.round((y - 100 - this.bubbleRadius) / (this.bubbleDiameter * 0.85));
    const offset = (row % 2 !== 0) ? this.bubbleRadius : 0;
    const col = Math.round((x - 40 - this.bubbleRadius - offset) / this.bubbleDiameter);

    if (row < 0 || col < 0 || col >= this.cols) return;

    // Place new bubble in grid
    const posX = col * this.bubbleDiameter + this.bubbleRadius + offset + 40;
    const posY = row * (this.bubbleDiameter * 0.85) + this.bubbleRadius + 180;
    
    const newBubble = this.createBubbleAt(posX, posY, flavor);
    newBubble.setData('row', row);
    newBubble.setData('col', col);

    if (!this.grid[row]) this.grid[row] = [];
    this.grid[row][col] = newBubble;

    this.checkMatches(row, col, flavor);
  }

  checkMatches(row, col, flavor) {
    const matches = this.findCluster(row, col, flavor);
    
    if (matches.length >= 3) {
      this.destroyCluster(matches);
      this.dropDisconnected();
    }
  }

  findCluster(row, col, flavor, cluster = []) {
    const key = `${row},${col}`;
    if (cluster.includes(key)) return cluster;
    
    const bubble = this.getBubbleAt(row, col);
    if (!bubble || bubble.getData('flavor') !== flavor) return cluster;
    
    cluster.push(key);
    
    const neighbors = this.getNeighbors(row, col);
    neighbors.forEach(n => {
      this.findCluster(n.row, n.col, flavor, cluster);
    });
    
    return cluster;
  }

  getNeighbors(row, col) {
    const neighbors = [];
    const isOffset = row % 2 !== 0;
    
    const dirs = isOffset ? 
      [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]] :
      [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]];

    dirs.forEach(d => {
      const nr = row + d[0];
      const nc = col + d[1];
      if (this.getBubbleAt(nr, nc)) {
        neighbors.push({ row: nr, col: nc });
      }
    });

    return neighbors;
  }

  getBubbleAt(row, col) {
    return this.grid[row] && this.grid[row][col];
  }

  destroyCluster(cluster) {
    cluster.forEach(key => {
      const [r, c] = key.split(',').map(Number);
      const bubble = this.grid[r][c];
      if (bubble) {
        this.score += 100;
        this.game.events.emit('UPDATE_SCORE', this.score);
        
        // Particle effect (Migas)
        this.explodeEmpanada(bubble.x, bubble.y);
        
        if (bubble.getData('sprite')) bubble.getData('sprite').destroy();
        bubble.destroy();
        this.grid[r][c] = null;
      }
    });
  }

  explodeEmpanada(x, y) {
    for (let i = 0; i < 10; i++) {
        const p = this.add.circle(x, y, 4, 0xD4AF37);
        this.physics.add.existing(p);
        p.body.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
        this.time.delayedCall(500, () => p.destroy());
    }
  }

  dropDisconnected() {
    // Basic implementation: check from top row down
    // Complex version would use BFS from the top row to find all connected.
    // Let's do BFS from top row.
    const connected = new Set();
    for (let col = 0; col < this.cols; col++) {
      if (this.grid[0] && this.grid[0][col]) {
        this.traverseConnected(0, col, connected);
      }
    }

    for (let r = 0; r < this.grid.length; r++) {
      if (!this.grid[r]) continue;
      for (let c = 0; c < this.cols; c++) {
        const bubble = this.grid[r][c];
        if (bubble && !connected.has(`${r},${c}`)) {
          this.dropBubble(bubble, r, c);
        }
      }
    }
  }

  traverseConnected(row, col, connected) {
    const key = `${row},${col}`;
    if (connected.has(key)) return;
    
    connected.add(key);
    const neighbors = this.getNeighbors(row, col);
    neighbors.forEach(n => {
      this.traverseConnected(n.row, n.col, connected);
    });
  }

  dropBubble(bubble, r, c) {
    this.grid[r][c] = null;
    this.physics.add.existing(bubble);
    bubble.body.setVelocityY(800);
    this.time.delayedCall(1000, () => bubble.destroy());
    
    // Check if game won
    this.time.delayedCall(1500, () => {
        let hasBubbles = false;
        for(let r=0; r<this.grid.length; r++) {
            if (this.grid[r] && this.grid[r].some(b => b !== null)) {
                hasBubbles = true;
                break;
            }
        }
        if (!hasBubbles) this.gameOver(true);
    });
  }

  handleFireBurst(projectile, hitBubble) {
    const row = hitBubble.getData('row');
    const col = hitBubble.getData('col');
    const neighbors = this.getNeighbors(row, col);
    
    // Destroy visual components
    if (projectile.getData('sprite')) projectile.getData('sprite').destroy();
    projectile.destroy();
    
    this.shooterBubble = null;
    this.isShooting = false;

    // Destroy hit bubble and neighbors
    this.destroyCluster([`${row},${col}`, ...neighbors.map(n => `${n.row},${n.col}`)]);
    this.dropDisconnected();
  }

  gameOver(win) {
    this.scene.pause();
    this.game.events.emit('GAME_OVER', { score: this.score, win });
  }

  update() {
    this.bubbles.children.iterate((child) => {
      if (child && child.updateSprite) {
        child.updateSprite();
      }
    });

    if (this.shooterBubble && this.shooterBubble.active) {
        this.shooterBubble.updateSprite();
    }
  }
}
