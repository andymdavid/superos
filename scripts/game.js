// Bitcoin Adventure - Optimized Standalone Web Game
// Clean architecture with essential features only

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 320,
            height: 240
        },
        max: {
            width: 1600,
            height: 1200
        },
        fullscreenTarget: 'game'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }, // Increased gravity for more realistic physics
            debug: false
        }
    },
    render: {
        antialias: false,
        pixelArt: true,
        roundPixels: true,
        transparent: false,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance'
    },
    audio: {
        disableWebAudio: false,
        context: false
    },
    scene: []
};

// Global game state
window.gameState = {
    isPaused: false,
    score: 0,
    level: 1,
    lives: 3,
    soundEnabled: true,
    highScore: parseInt(localStorage.getItem('bitcoinAdventureHighScore') || '0'),
    currentScene: 'title'
};

// Enhanced Title Scene
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
        this.particles = null;
        this.titleTween = null;
        this.menuItems = [];
    }

    preload() {
        this.createTemporaryAssets();
        
        // Enhanced loading with error handling
        this.load.on('loaderror', (file) => {
            console.warn('Asset failed to load:', file.key, 'using fallback');
        });

        // Load game assets
        this.load.image('background', 'assets/images/background.png');
        this.load.spritesheet('player', 'assets/images/AndySprite.png', {
            frameWidth: 341,
            frameHeight: 512
        });
        this.load.spritesheet('enemy', 'assets/images/yellen.png', {
            frameWidth: 32,
            frameHeight: 48,
            margin: 0,
            spacing: 8
        });
        this.load.spritesheet('bitcoin', 'assets/images/BTC.png', {
            frameWidth: 384,
            frameHeight: 1024
        });

        // Progress tracking
        this.load.on('progress', (value) => {
            if (window.GameLoader) {
                window.GameLoader.updateProgress(value);
            }
        });
        
        this.load.on('complete', () => {
            if (window.GameLoader) {
                window.GameLoader.hideLoadingScreen();
            }
            this.createAnimations();
        });
    }

    createTemporaryAssets() {
        // Create fallback graphics for missing assets
        const graphics = this.add.graphics();
        
        // Platform texture - make it more visible
        graphics.fillStyle(0xf7931a);
        graphics.fillRect(0, 0, 100, 32); // Made platforms thicker
        graphics.lineStyle(2, 0xffffff);
        graphics.strokeRect(0, 0, 100, 32);
        graphics.generateTexture('platform', 100, 32);
        
        // Heart texture
        graphics.clear();
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(10, 10, 10);
        graphics.generateTexture('heart', 20, 20);
        
        // Background fallback - ensure full coverage
        graphics.clear();
        graphics.fillStyle(0x1a1a2e);
        graphics.fillRect(0, 0, 800, 600); // Full screen size
        graphics.fillStyle(0x16213e);
        // Create a pattern
        for (let x = 0; x < 800; x += 64) {
            for (let y = 0; y < 600; y += 64) {
                graphics.fillRect(x, y, 32, 32);
                graphics.fillRect(x + 32, y + 32, 32, 32);
            }
        }
        graphics.generateTexture('bg_fallback', 800, 600);
        
        // Player fallback
        graphics.clear();
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(0, 0, 32, 48);
        graphics.fillStyle(0x000000);
        graphics.fillRect(8, 8, 16, 8);
        graphics.generateTexture('player_fallback', 32, 48);
        
        // Bitcoin fallback
        graphics.clear();
        graphics.fillStyle(0xf7931a);
        graphics.fillCircle(16, 16, 15);
        graphics.fillStyle(0xffd700);
        graphics.fillCircle(16, 16, 12);
        graphics.fillStyle(0xf7931a);
        graphics.fillRect(8, 14, 16, 4);
        graphics.fillRect(14, 8, 4, 16);
        graphics.generateTexture('bitcoin_fallback', 32, 32);
        
        // Enemy fallback
        graphics.clear();
        graphics.fillStyle(0xff0000);
        graphics.fillRect(0, 0, 32, 48);
        graphics.fillStyle(0x000000);
        graphics.fillRect(8, 8, 16, 8);
        graphics.fillStyle(0xffffff);
        graphics.fillRect(8, 20, 16, 4);
        graphics.generateTexture('enemy_fallback', 32, 48);
        
        graphics.destroy();
    }

    createAnimations() {
        // Player animations with fallback support
        const playerKey = this.textures.exists('player') ? 'player' : 'player_fallback';
        
        this.anims.create({
            key: 'player_idle',
            frames: this.textures.exists('player') ? 
                this.anims.generateFrameNumbers('player', { start: 0, end: 1 }) :
                [{ key: 'player_fallback', frame: 0 }],
            frameRate: 2,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player_walk',
            frames: this.textures.exists('player') ? 
                this.anims.generateFrameNumbers('player', { start: 2, end: 5 }) :
                [{ key: 'player_fallback', frame: 0 }],
            frameRate: 10,
            repeat: -1
        });

        // Bitcoin animation
        const bitcoinKey = this.textures.exists('bitcoin') ? 'bitcoin' : 'bitcoin_fallback';
        
        this.anims.create({
            key: 'bitcoin_spin',
            frames: this.textures.exists('bitcoin') ? 
                this.anims.generateFrameNumbers('bitcoin', { start: 0, end: 3 }) :
                [{ key: 'bitcoin_fallback', frame: 0 }],
            frameRate: 8,
            repeat: -1
        });

        // Enemy animations
        const enemyKey = this.textures.exists('enemy') ? 'enemy' : 'enemy_fallback';
        
        // Right movement animation (frames 0-3)
        this.anims.create({
            key: 'enemy_move_right',
            frames: this.textures.exists('enemy') ? 
                this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }) :
                [{ key: 'enemy_fallback', frame: 0 }],
            frameRate: 8,
            repeat: -1
        });

        // Left movement animation (frames 4-7)
        this.anims.create({
            key: 'enemy_move_left',
            frames: this.textures.exists('enemy') ? 
                this.anims.generateFrameNumbers('enemy', { start: 4, end: 7 }) :
                [{ key: 'enemy_fallback', frame: 0 }],
            frameRate: 8,
            repeat: -1
        });
    }

    create() {
        // Background with fallback - ensure full coverage
        const bgKey = this.textures.exists('background') ? 'background' : 'bg_fallback';
        this.add.tileSprite(0, 0, 800, 600, bgKey).setOrigin(0, 0);
        
        // Create particle effects
        this.createParticleEffects();
        
        // Title
        const title = this.add.text(400, 150, 'Bitcoin Adventure', {
            fontSize: '48px',
            fill: '#ffd700',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Animated title
        this.titleTween = this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Subtitle
        this.add.text(400, 220, 'Collect Bitcoin • Avoid Central Bankers', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // High score display
        this.add.text(400, 250, `High Score: ${window.gameState.highScore}`, {
            fontSize: '16px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Menu
        this.createMenu();
        
        // Demo character
        this.createDemoCharacter();
        
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        window.gameState.currentScene = 'title';
    }

    createParticleEffects() {
        // Simple particle effect for visual appeal
        this.particles = this.add.particles(400, 100, 'bitcoin_fallback', {
            scale: { start: 0.1, end: 0 },
            speed: { min: 50, max: 100 },
            lifespan: 3000,
            frequency: 500,
            alpha: { start: 0.7, end: 0 }
        });
    }

    createMenu() {
        const menuY = 350;
        const spacing = 60;
        
        // Start Game button
        const startBtn = this.add.text(400, menuY, 'START GAME', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#f7931a',
            strokeThickness: 2
        }).setOrigin(0.5).setInteractive();
        
        startBtn.on('pointerover', () => {
            startBtn.setScale(1.1);
            startBtn.setFill('#f7931a');
        });
        
        startBtn.on('pointerout', () => {
            startBtn.setScale(1);
            startBtn.setFill('#ffffff');
        });
        
        startBtn.on('pointerdown', () => {
            this.startGame();
        });
        
        // Fullscreen button
        const fullscreenBtn = this.add.text(400, menuY + spacing, 'FULLSCREEN', {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive();
        
        fullscreenBtn.on('pointerover', () => {
            fullscreenBtn.setScale(1.1);
            fullscreenBtn.setFill('#ffffff');
        });
        
        fullscreenBtn.on('pointerout', () => {
            fullscreenBtn.setScale(1);
            fullscreenBtn.setFill('#cccccc');
        });
        
        fullscreenBtn.on('pointerdown', () => {
            this.toggleFullscreen();
        });
        
        this.menuItems = [startBtn, fullscreenBtn];
    }

    createDemoCharacter() {
        // Show animated player character on title screen
        const playerKey = this.textures.exists('player') ? 'player' : 'player_fallback';
        this.demoPlayer = this.add.sprite(200, 400, playerKey);
        this.demoPlayer.setScale(0.15);
        this.demoPlayer.play('player_walk');
        
        // Make demo player bounce around
        this.tweens.add({
            targets: this.demoPlayer,
            x: 600,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    startGame() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    toggleFullscreen() {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.startGame();
        }
    }
}

// Enhanced Game Scene with parallax background and fixed physics
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.platforms = null;
        this.bitcoins = null;
        this.enemies = null;
        this.cursors = null;
        this.score = 0;
        this.lives = 3;
        this.scoreText = null;
        this.livesText = null;
        this.level = 1;
        this.goalFlag = null;
        this.mobileControls = null;
        this.isMobile = false;
        this.performanceMonitor = {
            frameCount: 0,
            lastCheck: 0,
            fps: 60
        };
        // Jump mechanics
        this.jumpTimer = 0;
        this.canJump = true;
        this.jumpForce = -500; // Realistic jump force
        // Parallax background layers
        this.backgroundLayers = [];
    }

    init() {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.level = window.gameState.level || 1;
        
        // Detect mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       ('ontouchstart' in window) || 
                       (navigator.maxTouchPoints > 0);
    }

    create() {
        // Create layered parallax background
        this.createParallaxBackground();
        
        // Create world
        this.createLevel();
        this.createPlayer();
        this.createBitcoins();
        this.createEnemies();
        this.createUI();
        
        // Mobile controls if needed
        if (this.isMobile) {
            this.createMobileControls();
        }
        
        // Setup physics and input
        this.setupCollisions();
        this.setupInput();
        this.setupCamera();
        
        // Performance monitoring
        this.initializePerformanceMonitoring();
        
        window.gameState.currentScene = 'game';
    }

    createParallaxBackground() {
        const bgKey = this.textures.exists('background') ? 'background' : 'bg_fallback';
        
        // Create background that covers the entire game world
        // The game world is 4000 wide, so we'll maintain that aspect ratio
        this.background = this.add.image(0, 0, bgKey);
        this.background.setOrigin(0, 0);
        
        // Get the actual image dimensions
        const bgWidth = this.textures.get(bgKey).getSourceImage().width;
        const bgHeight = this.textures.get(bgKey).getSourceImage().height;
        
        // Calculate the scale needed to cover the game world height (600px) while maintaining aspect ratio
        const scaleY = 600 / bgHeight;
        const scaleX = scaleY; // Maintain aspect ratio
        
        this.background.setScale(scaleX, scaleY);
        
        // Set the scroll factor for parallax effect
        // Using a very small scroll factor to ensure the background moves slowly
        this.background.setScrollFactor(0.1);
        
        // Store reference for parallax updates
        this.backgroundLayer = this.background;
    }

    createLevel() {
        // Create platforms group
        this.platforms = this.physics.add.staticGroup();
        
        // Ground platform - extends across the entire level with no gaps
        for (let x = 0; x < 4000; x += 750) { // Reduced increment to overlap segments
            this.platforms.create(x + 400, 584, 'platform').setScale(8, 1).refreshBody();
        }
        
        // Level-specific platforms with proper jump heights
        switch (this.level) {
            case 1:
                this.createLevel1();
                break;
            case 2:
                this.createLevel2();
                break;
            case 3:
                this.createLevel3();
                break;
            default:
                this.createAdvancedLevel(this.level);
        }
        
        this.createGoalFlag();
    }

    createLevel1() {
        // Well-designed level with logical progression (16 platforms total)
        // Each platform should be reachable from the previous one with reasonable jumps
        // Including recovery routes from ground level
        
        // Starting area - easy introduction (200-600px)
        this.platforms.create(300, 480, 'platform').setScale(2, 1).refreshBody(); // Starting platform
        this.platforms.create(600, 420, 'platform').setScale(1.5, 1).refreshBody(); // First jump
        
        // Early progression (800-1400px) 
        this.platforms.create(900, 380, 'platform').setScale(1, 1).refreshBody(); // Small platform
        this.platforms.create(1200, 320, 'platform').setScale(2, 1).refreshBody(); // Medium platform for enemy
        
        // Middle section (1500-2500px) with recovery routes
        this.platforms.create(1450, 350, 'platform').setScale(1.2, 1).refreshBody(); // Bridge the gap
        this.platforms.create(1600, 280, 'platform').setScale(1, 1).refreshBody(); // Step up
        this.platforms.create(1750, 460, 'platform').setScale(1.5, 1).refreshBody(); // Recovery platform
        this.platforms.create(1900, 350, 'platform').setScale(2.5, 1).refreshBody(); // Large platform for enemy
        this.platforms.create(2100, 300, 'platform').setScale(1.2, 1).refreshBody(); // Stepping stone
        this.platforms.create(2300, 250, 'platform').setScale(1.5, 1).refreshBody(); // Challenge jump
        this.platforms.create(2500, 450, 'platform').setScale(1.8, 1).refreshBody(); // Another recovery platform
        
        // Final approach (2700-3700px) with multiple path options
        this.platforms.create(2700, 320, 'platform').setScale(1, 1).refreshBody(); // Step down slightly
        this.platforms.create(2900, 420, 'platform').setScale(1.5, 1).refreshBody(); // Lower path option
        this.platforms.create(3100, 280, 'platform').setScale(2, 1).refreshBody(); // Pre-final platform
        this.platforms.create(3300, 380, 'platform').setScale(1.2, 1).refreshBody(); // Recovery stepping stone
        this.platforms.create(3500, 200, 'platform').setScale(3, 1).refreshBody(); // Final large platform before goal
    }

    createLevel2() {
        // More complex level with extensive recovery options
        const platforms = [
            // Main route
            { x: 250, y: 450, scale: 1.5 },
            { x: 500, y: 350, scale: 1 },
            { x: 750, y: 280, scale: 2 },
            { x: 1050, y: 380, scale: 1 },
            { x: 1350, y: 250, scale: 1.5 },
            { x: 1650, y: 400, scale: 2.5 },
            { x: 1950, y: 180, scale: 1 },
            { x: 2250, y: 320, scale: 1.5 },
            { x: 2550, y: 220, scale: 1 },
            { x: 2850, y: 350, scale: 2 },
            { x: 3150, y: 180, scale: 1.5 },
            { x: 3450, y: 280, scale: 1 },
            { x: 3700, y: 200, scale: 3 },
            
            // Recovery routes
            { x: 400, y: 520, scale: 1.5 },
            { x: 650, y: 500, scale: 1 },
            { x: 900, y: 480, scale: 2 },
            { x: 1200, y: 520, scale: 1 },
            { x: 1500, y: 500, scale: 1.5 },
            { x: 1800, y: 480, scale: 1 },
            { x: 2100, y: 460, scale: 2 },
            { x: 2400, y: 500, scale: 1 },
            { x: 2700, y: 480, scale: 1.5 },
            { x: 3000, y: 450, scale: 1 },
            { x: 3300, y: 520, scale: 2 },
            { x: 3550, y: 450, scale: 1 }
        ];
        
        platforms.forEach(platform => {
            this.platforms.create(platform.x, platform.y, 'platform').setScale(platform.scale, 1).refreshBody();
        });
    }

    createLevel3() {
        // Most complex level with multiple routes
        const platforms = [
            // High route
            { x: 200, y: 300, scale: 1 },
            { x: 400, y: 200, scale: 1.5 },
            { x: 650, y: 150, scale: 1 },
            { x: 900, y: 120, scale: 2 },
            { x: 1200, y: 180, scale: 1 },
            { x: 1450, y: 100, scale: 1.5 },
            { x: 1700, y: 150, scale: 1 },
            { x: 1950, y: 200, scale: 2.5 },
            { x: 2250, y: 120, scale: 1 },
            { x: 2500, y: 160, scale: 1.5 },
            { x: 2800, y: 100, scale: 1 },
            { x: 3100, y: 180, scale: 2 },
            { x: 3400, y: 140, scale: 1.5 },
            { x: 3700, y: 200, scale: 3 },
            
            // Medium route
            { x: 250, y: 400, scale: 1.5 },
            { x: 500, y: 350, scale: 1 },
            { x: 750, y: 300, scale: 2 },
            { x: 1000, y: 280, scale: 1 },
            { x: 1300, y: 320, scale: 1.5 },
            { x: 1600, y: 280, scale: 1 },
            { x: 1850, y: 350, scale: 2 },
            { x: 2150, y: 300, scale: 1.5 },
            { x: 2450, y: 280, scale: 1 },
            { x: 2750, y: 320, scale: 2 },
            { x: 3050, y: 300, scale: 1 },
            { x: 3350, y: 350, scale: 1.5 },
            
            // Low recovery route
            { x: 300, y: 500, scale: 2 },
            { x: 600, y: 480, scale: 1.5 },
            { x: 850, y: 460, scale: 1 },
            { x: 1150, y: 520, scale: 2 },
            { x: 1400, y: 480, scale: 1 },
            { x: 1750, y: 500, scale: 1.5 },
            { x: 2000, y: 460, scale: 1 },
            { x: 2300, y: 480, scale: 2 },
            { x: 2600, y: 520, scale: 1 },
            { x: 2900, y: 460, scale: 1.5 },
            { x: 3200, y: 500, scale: 1 },
            { x: 3500, y: 480, scale: 2 }
        ];
        
        platforms.forEach(platform => {
            this.platforms.create(platform.x, platform.y, 'platform').setScale(platform.scale, 1).refreshBody();
        });
    }

    createAdvancedLevel(level) {
        // Procedural level generation with varied platforms across wider area
        const platformCount = Math.min(15 + level * 2, 25);
        
        for (let i = 0; i < platformCount; i++) {
            const x = Phaser.Math.Between(200, 3800);
            const y = Phaser.Math.Between(120, 500);
            const scale = Phaser.Math.Between(1, 3); // Varied platform sizes
            this.platforms.create(x, y, 'platform').setScale(scale, 1).refreshBody();
        }
    }

    createGoalFlag() {
        // Create a more visible goal flag
        const flagGraphics = this.add.graphics();
        
        // Flag pole
        flagGraphics.fillStyle(0x8B4513); // Brown pole
        flagGraphics.fillRect(0, 0, 8, 80);
        
        // Flag
        flagGraphics.fillStyle(0x00ff00); // Green flag
        flagGraphics.fillRect(8, 0, 40, 25);
        
        // Flag pattern
        flagGraphics.fillStyle(0xffff00); // Yellow stripe
        flagGraphics.fillRect(8, 10, 40, 5);
        
        flagGraphics.generateTexture('flag', 48, 80);
        flagGraphics.destroy();
        
        // Position flag at the end of the level - much more visible
        this.goalFlag = this.physics.add.sprite(3900, 480, 'flag');
        this.goalFlag.setImmovable(true);
        this.goalFlag.body.setSize(48, 80);
        this.goalFlag.setOrigin(0, 1); // Bottom-left origin so it sits on ground properly
        
        // Add a glowing effect to make it more visible
        this.tweens.add({
            targets: this.goalFlag,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add text above flag
        this.add.text(3900, 420, 'GOAL!', {
            fontSize: '24px',
            fill: '#00ff00',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 1);
    }

    createPlayer() {
        const playerKey = this.textures.exists('player') ? 'player' : 'player_fallback';
        this.player = this.physics.add.sprite(100, 530, playerKey); // Start on ground level
        this.player.setScale(0.12);
        this.player.setBounce(0.1); // Reduced bounce for more realistic physics
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(200, 400, true);
        
        // Set max velocity to prevent flying
        this.player.body.setMaxVelocity(200, 600);
        this.player.body.setDragX(300); // Add air resistance
    }

    createBitcoins() {
        this.bitcoins = this.physics.add.group({
            allowGravity: false,  // Explicitly disable gravity for the group
            immovable: true       // Make all coins immovable
        });
        
        // Strategic bitcoin placement with emphasis on platform heights and above (26 coins total)
        const bitcoinPositions = [
            // Early section - encouraging platform use
            { x: 350, y: 420 },  // Above starting platform (moved up)
            { x: 450, y: 320 },  // High above starting area
            { x: 650, y: 360 },  // Above first jump platform (moved up)
            { x: 750, y: 300 },  // Between platforms (moved up)
            { x: 850, y: 220 },  // High reward early
            { x: 950, y: 320 },  // Above platform height
            
            // Middle progression - platform focused
            { x: 1150, y: 260 }, // Above medium platform (moved up)
            { x: 1250, y: 180 }, // High reward sequence
            { x: 1350, y: 180 }, // Continuing high sequence
            { x: 1450, y: 290 }, // Above bridge platform (moved up)
            { x: 1550, y: 220 }, // Platform level (moved up)
            { x: 1650, y: 220 }, // Above platform
            { x: 1750, y: 400 }, // Recovery platform height (moved up)
            { x: 1850, y: 180 }, // High risk, high reward
            { x: 1950, y: 290 }, // Platform height (moved up)
            { x: 2050, y: 240 }, // Mid height challenge (moved up)
            
            // Challenge area - mostly high rewards
            { x: 2200, y: 150 }, // High challenge
            { x: 2350, y: 190 }, // Above challenge platform (moved up)
            { x: 2500, y: 390 }, // High path reward (moved up)
            { x: 2600, y: 320 }, // Platform level option (moved up)
            
            // Final area - mixed heights but favoring platforms
            { x: 2800, y: 220 }, // High path option
            { x: 2950, y: 360 }, // Mid-height option (moved up)
            { x: 3100, y: 220 }, // Above platform (moved up)
            { x: 3250, y: 320 }, // Platform level
            { x: 3400, y: 320 }, // Mid height final stretch (moved up)
            { x: 3550, y: 140 }  // High reward above final platform
        ];
        
        bitcoinPositions.forEach((pos) => {
            const bitcoinKey = this.textures.exists('bitcoin') ? 'bitcoin' : 'bitcoin_fallback';
            const bitcoin = this.bitcoins.create(pos.x, pos.y, bitcoinKey);
            bitcoin.setScale(0.06); // Much smaller - proportional to player and enemy
            
            // Set fixed position properties
            bitcoin.setImmovable(true);
            bitcoin.body.setAllowGravity(false);
            
            // Set the collision box size
            bitcoin.body.setSize(40, 40, true);
            
            // Start the spinning animation
            bitcoin.play('bitcoin_spin');
            
            // Add a gentle floating effect with smaller amplitude
            this.tweens.add({
                targets: bitcoin,
                y: pos.y - 5, // Reduced float height to 5px
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    createEnemies() {
        this.enemies = this.physics.add.group();
        
        // Better balanced enemy placement between ground and platforms (8 total)
        const enemyPlacements = [
            // Ground enemies (4) - start just above ground platform so they land on it
            { x: 1000, y: 560, patrolMin: 950, patrolMax: 1100, platform: 'ground' }, // Move to clear area
            { x: 1800, y: 560, patrolMin: 1650, patrolMax: 1950, platform: 'ground' },
            { x: 2400, y: 560, patrolMin: 2250, patrolMax: 2550, platform: 'ground' },
            { x: 3200, y: 560, patrolMin: 3050, patrolMax: 3280, platform: 'ground' },
            
            // Platform enemies (4) - matching actual platform heights from createLevel1
            // Adjusted y values to be exactly on the platforms
            { x: 1200, y: 288, patrolMin: 1100, patrolMax: 1300, platform: 'platform' },  // Platform at y:320
            { x: 1900, y: 318, patrolMin: 1750, patrolMax: 2050, platform: 'platform' },  // Platform at y:350
            { x: 2300, y: 218, patrolMin: 2200, patrolMax: 2400, platform: 'platform' },  // Platform at y:250
            { x: 3100, y: 248, patrolMin: 3000, patrolMax: 3200, platform: 'platform' }   // Platform at y:280
        ];
        
        enemyPlacements.forEach(placement => {
            const enemyKey = this.textures.exists('enemy') ? 'enemy' : 'enemy_fallback';
            
            const enemy = this.enemies.create(placement.x, placement.y, enemyKey);
            enemy.setScale(1.7); // Increase scale for better visual match with Andy
            enemy.setBounce(0.1);
            enemy.setCollideWorldBounds(true);
            
            // Disable gravity for platform enemies to keep them on their platforms
            if (placement.platform === 'platform') {
                enemy.body.setAllowGravity(false);
                enemy.body.setImmovable(true);
            }
            
            const initialVelocity = Phaser.Math.Between(0, 1) ? 100 : -100;
            enemy.setVelocity(initialVelocity, 0);
            enemy.play(initialVelocity > 0 ? 'enemy_move_right' : 'enemy_move_left');
            
            // Adjust hitbox to match new sprite size
            enemy.body.setSize(32, 48, true); // Match the sprite dimensions
            enemy.body.setOffset(0, 0); // Reset offset
            
            // If this is a ground enemy, move the sprite down to account for whitespace in frames
            if (placement.platform === 'ground') {
                enemy.y += 10; // Small adjustment for whitespace at bottom of frames
            }
            
            enemy.body.setMaxVelocity(120, 600);
            
            enemy.patrolMin = placement.patrolMin;
            enemy.patrolMax = placement.patrolMax;
            enemy.platformType = placement.platform;
            enemy.lastX = enemy.x;
        });
    }

    createUI() {
        // Clean HUD without persistent instruction text
        this.scoreText = this.add.text(16, 16, 'SATS: 0', {
            fontSize: '32px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0);
        
        this.livesText = this.add.text(16, 56, 'Lives: 3', {
            fontSize: '32px',
            fill: '#ff0000',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0);
        
        // Level display
        this.add.text(400, 16, `Level ${this.level}`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0).setScrollFactor(0);
        
        // Progress indicator
        this.add.text(400, 45, 'Reach the flag!', {
            fontSize: '16px',
            fill: '#00ff00',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5, 0).setScrollFactor(0);
        
        // Optional: Show temporary controls hint that fades away
        const controlsHint = this.add.text(400, 550, 'Arrow Keys + SPACE to Jump', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            alpha: 0.8
        }).setOrigin(0.5, 1).setScrollFactor(0);
        
        // Fade out the controls hint after 3 seconds
        this.tweens.add({
            targets: controlsHint,
            alpha: 0,
            duration: 1000,
            delay: 3000,
            onComplete: () => controlsHint.destroy()
        });
    }

    createMobileControls() {
        // Create mobile control buttons
        this.mobileControls = {
            left: false,
            right: false,
            jump: false
        };

        // Left button
        const leftBtn = this.add.rectangle(80, config.height - 80, 120, 80, 0x333333, 0.7)
            .setScrollFactor(0)
            .setInteractive()
            .setStrokeStyle(2, 0xffffff);
        
        this.add.text(80, config.height - 80, '←', {
            fontSize: '40px',
            fill: '#fff'
        }).setOrigin(0.5).setScrollFactor(0);

        // Right button
        const rightBtn = this.add.rectangle(220, config.height - 80, 120, 80, 0x333333, 0.7)
            .setScrollFactor(0)
            .setInteractive()
            .setStrokeStyle(2, 0xffffff);
        
        this.add.text(220, config.height - 80, '→', {
            fontSize: '40px',
            fill: '#fff'
        }).setOrigin(0.5).setScrollFactor(0);

        // Jump button
        const jumpBtn = this.add.rectangle(config.width - 80, config.height - 80, 120, 80, 0xf7931a, 0.8)
            .setScrollFactor(0)
            .setInteractive()
            .setStrokeStyle(2, 0xffffff);
        
        this.add.text(config.width - 80, config.height - 80, 'JUMP', {
            fontSize: '20px',
            fill: '#fff'
        }).setOrigin(0.5).setScrollFactor(0);

        // Setup mobile input handlers
        leftBtn.on('pointerdown', () => this.mobileControls.left = true);
        leftBtn.on('pointerup', () => this.mobileControls.left = false);
        leftBtn.on('pointerout', () => this.mobileControls.left = false);

        rightBtn.on('pointerdown', () => this.mobileControls.right = true);
        rightBtn.on('pointerup', () => this.mobileControls.right = false);
        rightBtn.on('pointerout', () => this.mobileControls.right = false);

        jumpBtn.on('pointerdown', () => this.mobileControls.jump = true);
        jumpBtn.on('pointerup', () => this.mobileControls.jump = false);
        jumpBtn.on('pointerout', () => this.mobileControls.jump = false);
    }

    setupCollisions() {
        // Player collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.bitcoins, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        
        // Collectibles and interactions
        this.physics.add.overlap(this.player, this.bitcoins, this.collectBitcoin, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.goalFlag, this.reachGoal, null, this);
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    }

    setupCamera() {
        // Set much wider world bounds for longer side-scrolling
        this.cameras.main.setBounds(0, 0, 4000, 600);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(150, 200);
        
        // Set world bounds for physics
        this.physics.world.setBounds(0, 0, 4000, 600);
    }

    initializePerformanceMonitoring() {
        this.performanceMonitor.lastCheck = this.time.now;
        this.performanceMonitor.frameCount = 0;
    }

    collectBitcoin(player, bitcoin) {
        bitcoin.disableBody(true, true);
        this.score += 10;
        this.updateScoreDisplay();
        
        // Create collection effect
        this.createCollectionEffect(bitcoin.x, bitcoin.y);
        
        // Check if all bitcoins collected
        if (this.bitcoins.countActive(true) === 0) {
            this.score += 100; // Bonus for collecting all
            this.updateScoreDisplay();
        }
    }

    createCollectionEffect(x, y) {
        const effect = this.add.text(x, y, '+10', {
            fontSize: '24px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: effect,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => effect.destroy()
        });
    }

    hitEnemy(player, enemy) {
        this.lives--;
        this.updateLivesDisplay();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Invincibility frames
            player.setTint(0xff0000);
            player.setAlpha(0.5);
            
            this.time.delayedCall(1000, () => {
                player.clearTint();
                player.setAlpha(1);
            });
            
            // Reset player position
            player.setPosition(100, 530);
        }
    }

    reachGoal(player, flag) {
        this.level++;
        window.gameState.level = this.level;
        
        if (this.level > 3) {
            this.scene.start('VictoryScene');
        } else {
            this.scene.restart();
        }
    }

    gameOver() {
        // Update high score
        if (this.score > window.gameState.highScore) {
            window.gameState.highScore = this.score;
            localStorage.setItem('bitcoinAdventureHighScore', this.score.toString());
        }
        
        this.scene.start('GameOverScene', { score: this.score, level: this.level });
    }

    togglePause() {
        if (window.gameState.isPaused) {
            this.scene.resume();
            window.gameState.isPaused = false;
        } else {
            this.scene.pause();
            window.gameState.isPaused = true;
        }
    }

    updateScoreDisplay() {
        this.scoreText.setText('SATS: ' + this.score);
    }

    updateLivesDisplay() {
        this.livesText.setText('Lives: ' + this.lives);
    }

    update() {
        // Performance monitoring
        this.performanceMonitor.frameCount++;
        if (this.time.now - this.performanceMonitor.lastCheck > 1000) {
            this.performanceMonitor.fps = this.performanceMonitor.frameCount;
            this.performanceMonitor.frameCount = 0;
            this.performanceMonitor.lastCheck = this.time.now;
            
            // Auto-optimize if FPS drops below 30
            if (this.performanceMonitor.fps < 30) {
                console.warn('Low FPS detected, reducing effects');
            }
        }
        
        // Handle input (keyboard or mobile)
        let leftPressed = this.cursors.left.isDown || this.wasdKeys.A.isDown || (this.isMobile && this.mobileControls.left);
        let rightPressed = this.cursors.right.isDown || this.wasdKeys.D.isDown || (this.isMobile && this.mobileControls.right);
        let jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                         Phaser.Input.Keyboard.JustDown(this.wasdKeys.W) || 
                         Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
                         (this.isMobile && this.mobileControls.jump);
        
        // Player movement
        if (leftPressed) {
            this.player.setVelocityX(-160);
            this.player.play('player_walk', true);
            this.player.setFlipX(true);
        } else if (rightPressed) {
            this.player.setVelocityX(160);
            this.player.play('player_walk', true);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
            this.player.play('player_idle', true);
        }
        
        // Improved jumping mechanics
        if (jumpPressed && this.player.body.touching.down && this.canJump) {
            this.player.setVelocityY(this.jumpForce);
            this.canJump = false;
            this.jumpTimer = this.time.now + 200; // Prevent double jumping for 200ms
        }
        
        // Reset jump ability when touching ground
        if (this.player.body.touching.down && this.time.now > this.jumpTimer) {
            this.canJump = true;
        }
        
        // Pause toggle
        if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
            this.togglePause();
        }
        
        // Improved enemy AI with patrol ranges - fixed movement bug
        this.enemies.children.entries.forEach(enemy => {
            // Simple edge detection for platform enemies
            if (enemy.platformType === 'platform') {
                // Check if enemy would fall off by looking ahead
                const direction = enemy.body.velocity.x > 0 ? 1 : -1;
                const lookAheadDistance = 20; // Distance to check ahead
                const checkX = enemy.x + direction * lookAheadDistance;
                const checkY = enemy.y + enemy.body.height / 2 + 10; // Just below enemy's feet
                
                let foundPlatform = false;
                
                // Check if there's a platform at the look-ahead position
                this.platforms.children.entries.forEach(platform => {
                    const bounds = platform.getBounds();
                    if (checkX >= bounds.left && checkX <= bounds.right && 
                        checkY >= bounds.top && checkY <= bounds.bottom + 10) {
                        foundPlatform = true;
                    }
                });
                
                // If no platform found ahead, reverse direction
                if (!foundPlatform) {
                    enemy.setVelocityX(-enemy.body.velocity.x);
                }
            }
            
            // Check if enemy has patrol range (new system)
            if (enemy.patrolMin && enemy.patrolMax) {
                // Turn around at patrol boundaries with stronger force
                if (enemy.x <= enemy.patrolMin) {
                    enemy.setVelocityX(100); // Force right movement
                } else if (enemy.x >= enemy.patrolMax) {
                    enemy.setVelocityX(-100); // Force left movement
                }
                
                // Ensure enemy is moving (prevent getting stuck) with stronger velocity
                if (Math.abs(enemy.body.velocity.x) < 30) {
                    const direction = enemy.x < (enemy.patrolMin + enemy.patrolMax) / 2 ? 1 : -1;
                    enemy.setVelocityX(direction * 100); // Much stronger push
                }
                
                // Flip sprite based on direction for visual feedback
                if (enemy.body.velocity.x > 0) {
                    enemy.setFlipX(false);
                    enemy.play('enemy_move_right', true);
                } else if (enemy.body.velocity.x < 0) {
                    enemy.setFlipX(false);
                    enemy.play('enemy_move_left', true);
                }
                
                // Update last position for debugging
                enemy.lastX = enemy.x;
            } else {
                // Fallback for enemies without patrol ranges
                // Turn around when hitting walls
                if (enemy.body.blocked.left || enemy.body.blocked.right) {
                    enemy.setVelocityX(-enemy.body.velocity.x);
                }
                
                // Simple boundary check
                if (enemy.x < 100 || enemy.x > 3900) {
                    enemy.setVelocityX(-enemy.body.velocity.x);
                }
                
                // Prevent getting stuck
                if (Math.abs(enemy.body.velocity.x) < 30) {
                    enemy.setVelocityX(Phaser.Math.Between(-100, 100));
                }
                
                // Flip sprite based on direction
                if (enemy.body.velocity.x > 0) {
                    enemy.setFlipX(false);
                    enemy.play('enemy_move_right', true);
                } else if (enemy.body.velocity.x < 0) {
                    enemy.setFlipX(false);
                    enemy.play('enemy_move_left', true);
                }
            }
        });
        
        // Update parallax background scrolling
        this.updateParallaxBackground();
    }

    updateParallaxBackground() {
        // With setScrollFactor in place, we don't need to manually update the position
        // The engine will handle the parallax effect automatically
    }
}

// Game Over Scene
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalLevel = data.level || 1;
        this.isNewHighScore = this.finalScore > window.gameState.highScore;
    }

    create() {
        // Background
        const bgKey = this.textures.exists('background') ? 'background' : 'bg_fallback';
        const bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, bgKey);
        bg.setOrigin(0, 0);
        bg.setTint(0x660000);
        
        // Game Over title
        this.add.text(400, 150, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Score display
        this.add.text(400, 220, `Final Score: ${this.finalScore}`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        this.add.text(400, 250, `Level Reached: ${this.finalLevel}`, {
            fontSize: '20px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // High score notification
        if (this.isNewHighScore) {
            const newHighScoreText = this.add.text(400, 280, 'NEW HIGH SCORE!', {
                fontSize: '20px',
                fill: '#00ff00',
                fontFamily: 'Arial, sans-serif',
                stroke: '#000',
                strokeThickness: 2
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: newHighScoreText,
                alpha: 0.5,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Menu options
        this.createMenu();
        
        // Input handling
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Reset game state for next play
        window.gameState.score = 0;
        window.gameState.level = 1;
        window.gameState.lives = 3;
    }

    createMenu() {
        const menuY = 350;
        const spacing = 50;
        
        // Play Again button
        const playAgainBtn = this.add.text(400, menuY, 'PLAY AGAIN', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#f7931a',
            strokeThickness: 2
        }).setOrigin(0.5).setInteractive();
        
        playAgainBtn.on('pointerover', () => {
            playAgainBtn.setScale(1.1);
            playAgainBtn.setFill('#f7931a');
        });
        
        playAgainBtn.on('pointerout', () => {
            playAgainBtn.setScale(1);
            playAgainBtn.setFill('#ffffff');
        });
        
        playAgainBtn.on('pointerdown', () => {
            this.restartGame();
        });
        
        // Main Menu button
        const mainMenuBtn = this.add.text(400, menuY + spacing, 'MAIN MENU', {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive();
        
        mainMenuBtn.on('pointerover', () => {
            mainMenuBtn.setScale(1.1);
            mainMenuBtn.setFill('#ffffff');
        });
        
        mainMenuBtn.on('pointerout', () => {
            mainMenuBtn.setScale(1);
            mainMenuBtn.setFill('#cccccc');
        });
        
        mainMenuBtn.on('pointerdown', () => {
            this.returnToMenu();
        });
    }

    restartGame() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    returnToMenu() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('TitleScene');
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.restartGame();
        }
    }
}

// Victory Scene
class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create() {
        // Background
        const bgKey = this.textures.exists('background') ? 'background' : 'bg_fallback';
        const bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, bgKey);
        bg.setOrigin(0, 0);
        bg.setTint(0x004400);
        
        // Victory title
        const victoryText = this.add.text(400, 150, 'VICTORY!', {
            fontSize: '48px',
            fill: '#00ff00',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Celebration text
        this.add.text(400, 220, 'You have mastered Bitcoin Adventure!', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        this.add.text(400, 250, `Final Score: ${window.gameState.score}`, {
            fontSize: '24px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Return to menu
        const menuBtn = this.add.text(400, 350, 'RETURN TO MENU', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive();
        
        menuBtn.on('pointerdown', () => {
            this.scene.start('TitleScene');
        });
        
        // Reset game state
        window.gameState.score = 0;
        window.gameState.level = 1;
        window.gameState.lives = 3;
    }
}

// Add scenes and start the game
config.scene = [TitleScene, GameScene, GameOverScene, VictoryScene];

// Initialize the game
const game = new Phaser.Game(config);

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'F11') {
        e.preventDefault();
        if (game.scale.isFullscreen) {
            game.scale.stopFullscreen();
        } else {
            game.scale.startFullscreen();
        }
    }
});

console.log('Bitcoin Adventure optimized version loaded successfully!');

// Performance monitoring
setInterval(() => {
    if (game && game.loop) {
        const fps = game.loop.actualFps;
        if (fps < 30) {
            console.warn('Performance warning: FPS below 30');
        }
    }
}, 10000);

// Error handling
window.addEventListener('error', (e) => {
    console.error('Game error:', e.error);
});

// Prevent context menu on right click for better game experience
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
}); 