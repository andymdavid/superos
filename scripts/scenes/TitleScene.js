import { GAME_CONSTANTS } from '../core/constants.js';
import { gameState, resetRunState } from '../core/gameState.js';
import { SoundManager } from '../core/soundManager.js';

export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
        this.particles = null;
        this.titleTween = null;
        this.menuItems = [];
        // Asset retry mechanism - Phase 1.3
        this.failedAssets = new Set();
        this.retryAttempts = new Map();
    }

    preload() {
        try {
            this.createTemporaryAssets();
            
            // Enhanced loading with retry mechanism - Phase 1.3
            this.load.on('loaderror', (file) => {
                console.warn('❌ Asset failed to load:', file.key, 'URL:', file.url);
                
                // Special handling for female player sprite
                if (file.key === 'female_player') {
                    console.error('🚨 Female player sprite failed to load!');
                    console.error('🔍 Check if PeteSprite.png exists at:', file.url);
                }
                
                // Track failed asset
                this.failedAssets.add(file.key);
                
                // Get current retry count for this asset
                const currentRetries = this.retryAttempts.get(file.key) || 0;
                
                if (currentRetries < 2) { // Max 2 retries per asset
                    // Increment retry count
                    this.retryAttempts.set(file.key, currentRetries + 1);
                    
                    console.log(`🔄 Retrying asset '${file.key}' (attempt ${currentRetries + 1}/2)`);
                    
                    // Retry after 1 second delay
                    setTimeout(() => {
                        try {
                            // Retry loading the specific asset
                            this.retryAssetLoad(file.key, file.url);
                        } catch (retryError) {
                            console.error(`❌ Retry failed for ${file.key}:`, retryError);
                        }
                    }, 1000);
                } else {
                    console.warn(`⚠️ Max retries reached for '${file.key}', using fallback`);
                }
            });

            // Handle successful asset loads (including retries)
            this.load.on('filecomplete', (key, type, data) => {
                if (this.failedAssets.has(key)) {
                    const retryCount = this.retryAttempts.get(key) || 0;
                    console.log(`Asset '${key}' loaded successfully after ${retryCount} retries`);
                    // Remove from failed assets since it's now loaded
                    this.failedAssets.delete(key);
                }
            });

                            // Load game assets with error handling
                try {
                    // Debug Andy sprite dimensions
                    const andyImg = new Image();
                    andyImg.onload = () => {
                        console.log('🔍 Andy sprite actual dimensions:', {
                            width: andyImg.width,
                            height: andyImg.height
                        });
                    };
                    andyImg.src = 'assets/images/AndySprite.png';

                    // Debug Pete sprite dimensions
                    const peteImg = new Image();
                    peteImg.onload = () => {
                        console.log('🔍 Pete sprite actual dimensions:', {
                            width: peteImg.width,
                            height: peteImg.height
                        });
                    };
                    peteImg.src = 'assets/images/PeteSprite.png';

                    this.load.image('background', 'assets/images/background.png');

                    // Load individual platform images
                    console.log('📥 Loading platform images');
                    this.load.image('platform_ground', 'assets/images/Floor.png');
                    this.load.image('platform_1', 'assets/images/Platform1.png');
                    this.load.image('platform_2', 'assets/images/Platform2.png');
                    this.load.image('platform_3', 'assets/images/Platform3.png');

                    // Load Andy sprite
                    console.log('📥 Loading Andy sprite with 341x512 frames');
                    this.load.spritesheet('player', 'assets/images/AndySprite.png', {
                        frameWidth: 341,
                        frameHeight: 512
                    });
                    
                                    // Load female character spritesheet
                console.log('📥 Loading female player spritesheet from assets/images/PeteSprite.png');
                this.load.spritesheet('female_player', 'assets/images/PeteSprite.png', {
                    frameWidth: 341,    // Match Andy's frame size
                    frameHeight: 532,   // Slightly taller to prevent cutoff
                    spacing: 0,
                    margin: 0
                });
                
                // Add load complete handler for debugging
                this.load.on('complete', () => {
                    if (this.textures.exists('female_player')) {
                        const texture = this.textures.get('female_player');
                        console.log('📥 Female player sprite loaded:', {
                            frameWidth: texture.source[0].width,
                            frameHeight: texture.source[0].height,
                            frameTotal: texture.frameTotal
                        });
                    }

                    // Debug platform spritesheet
                    if (this.textures.exists('platforms')) {
                        const platformTexture = this.textures.get('platforms');
                        console.log('🟧 Platform spritesheet loaded:', {
                            frameWidth: 270,
                            frameHeight: 360,
                            frameTotal: platformTexture.frameTotal,
                            imageWidth: platformTexture.source[0].width,
                            imageHeight: platformTexture.source[0].height,
                            frames: Object.keys(platformTexture.frames)
                        });
                    } else {
                        console.warn('⚠️ Platform spritesheet NOT loaded, using fallback');
                    }
                });
                
                // Add load event listener for female player
                this.load.on('filecomplete-spritesheet-female_player', () => {
                    console.log('✅ Female player spritesheet loaded successfully');
                    console.log('📊 Female player texture info:', this.textures.get('female_player'));
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
            } catch (loadError) {
                console.error('Error loading assets:', loadError);
                console.error('Game will use fallback assets only');
            }

            // Progress tracking with error handling
            this.load.on('progress', (value) => {
                try {
                    if (window.GameLoader) {
                        window.GameLoader.updateProgress(value);
                    }
                } catch (progressError) {
                    console.error('Error updating progress:', progressError);
                }
            });
            
            this.load.on('complete', () => {
                try {
                    // Report retry statistics - Phase 1.3
                    this.reportRetryStatistics();
                    
                    if (window.GameLoader) {
                        window.GameLoader.hideLoadingScreen();
                    }
                    this.createAnimations();
                } catch (completeError) {
                    console.error('Error on load complete:', completeError);
                    console.error('Proceeding to title screen...');
                    this.scene.start('TitleScene');
                }
            });
        } catch (error) {
            console.error('Critical error in preload:', error);
            console.error('Returning to title screen...');
            this.scene.start('TitleScene');
        }
    }

    // Retry asset loading method - Phase 1.3
    retryAssetLoad(assetKey, originalUrl) {
        console.log(`Attempting to retry loading: ${assetKey}`);
        
        try {
            // Determine asset type and retry appropriately
            switch (assetKey) {
                case 'background':
                    this.load.image(assetKey, originalUrl);
                    break;
                case 'player':
                    this.load.spritesheet(assetKey, originalUrl, {
                        frameWidth: 341,
                        frameHeight: 512
                    });
                    break;
                case 'female_player':
                    console.log('🔄 Retrying female player sprite:', originalUrl);
                    this.load.spritesheet(assetKey, originalUrl, {
                        frameWidth: 32,
                        frameHeight: 48
                    });
                    break;
                case 'enemy':
                    this.load.spritesheet(assetKey, originalUrl, {
                        frameWidth: 32,
                        frameHeight: 48,
                        margin: 0,
                        spacing: 8
                    });
                    break;
                case 'bitcoin':
                    this.load.spritesheet(assetKey, originalUrl, {
                        frameWidth: 384,
                        frameHeight: 1024
                    });
                    break;
                default:
                    console.warn(`Unknown asset type for retry: ${assetKey}`);
                    return;
            }
            
            // Start the load for just this asset
            this.load.start();
            
        } catch (error) {
            console.error(`Error during retry of ${assetKey}:`, error);
        }
    }

    // Report retry statistics - Phase 1.3
    reportRetryStatistics() {
        if (this.retryAttempts.size > 0) {
            console.log('=== Asset Loading Retry Report ===');
            this.retryAttempts.forEach((retries, assetKey) => {
                const status = this.failedAssets.has(assetKey) ? 'FAILED (using fallback)' : 'SUCCESS';
                console.log(`${assetKey}: ${retries} retries - ${status}`);
            });
            console.log('================================');
        } else {
            console.log('All assets loaded successfully on first attempt');
        }
        
        if (this.failedAssets.size > 0) {
            console.warn(`${this.failedAssets.size} assets using fallback graphics:`, Array.from(this.failedAssets));
        }
    }

    createTemporaryAssets() {
        // Create fallback graphics for missing assets
        const graphics = this.add.graphics();

        // Platform texture fallback - only used if spritesheet fails to load
        graphics.fillStyle(0xf7931a);
        graphics.fillRect(0, 0, GAME_CONSTANTS.PLATFORM.TEXTURE_WIDTH, GAME_CONSTANTS.PLATFORM.TEXTURE_HEIGHT);
        graphics.lineStyle(2, 0xffffff);
        graphics.strokeRect(0, 0, GAME_CONSTANTS.PLATFORM.TEXTURE_WIDTH, GAME_CONSTANTS.PLATFORM.TEXTURE_HEIGHT);
        graphics.generateTexture('platform_fallback', GAME_CONSTANTS.PLATFORM.TEXTURE_WIDTH, GAME_CONSTANTS.PLATFORM.TEXTURE_HEIGHT);
        
        // Heart texture
        graphics.clear();
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(10, 10, 10);
        graphics.generateTexture('heart', 20, 20);
        
        // Background fallback - ensure full coverage
        graphics.clear();
        graphics.fillStyle(0x1a1a2e);
        graphics.fillRect(0, 0, GAME_CONSTANTS.SCREEN.WIDTH, GAME_CONSTANTS.SCREEN.HEIGHT); // Full screen size
        graphics.fillStyle(0x16213e);
        // Create a pattern
        for (let x = 0; x < GAME_CONSTANTS.SCREEN.WIDTH; x += 64) {
            for (let y = 0; y < GAME_CONSTANTS.SCREEN.HEIGHT; y += 64) {
                graphics.fillRect(x, y, 32, 32);
                graphics.fillRect(x + 32, y + 32, 32, 32);
            }
        }
        graphics.generateTexture('bg_fallback', GAME_CONSTANTS.SCREEN.WIDTH, GAME_CONSTANTS.SCREEN.HEIGHT);
        
        // Player fallback
        graphics.clear();
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(0, 0, 32, 48);
        graphics.fillStyle(0x000000);
        graphics.fillRect(8, 8, 16, 8);
        graphics.generateTexture('player_fallback', 32, 48);
        
        // Female player fallback
        graphics.clear();
        graphics.fillStyle(0xff69b4); // Pink for female character
        graphics.fillRect(0, 0, 32, 48);
        graphics.fillStyle(0x000000);
        graphics.fillRect(8, 8, 16, 8);
        graphics.fillStyle(0xffffff);
        graphics.fillRect(10, 20, 12, 4); // Different distinguishing feature
        graphics.generateTexture('female_player_fallback', 32, 48);
        
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

        // Female character animations with fallback support
        const femalePlayerKey = this.textures.exists('female_player') ? 'female_player' : 'female_player_fallback';
        
        console.log('🎬 Creating female character animations with key:', femalePlayerKey);
        
        this.anims.create({
            key: 'female_idle',
            frames: this.textures.exists('female_player') ? 
                [{ key: 'female_player', frame: 0 }] :
                [{ key: 'female_player_fallback', frame: 0 }],
            frameRate: 1,
            repeat: 0
        });
        console.log('✅ Created female_idle animation');

        // Right-facing animations (frames 1-2 from top row)
        this.anims.create({
            key: 'female_walk_right',
            frames: this.textures.exists('female_player') ? 
                this.anims.generateFrameNumbers('female_player', { frames: [1, 2] }) :
                [{ key: 'female_player_fallback', frame: 0 }],
            frameRate: 8,
            repeat: -1
        });
        console.log('✅ Created female_walk_right animation');

        // Left-facing animations (frames 5-6 from bottom row)
        try {
            this.anims.create({
                key: 'female_walk_left',
                frames: this.textures.exists('female_player') ? 
                    this.anims.generateFrameNumbers('female_player', { start: 4, end: 5 }) :
                    [{ key: 'female_player_fallback', frame: 0 }],
                frameRate: 6,
                repeat: -1
            });
            console.log('✅ Created female_walk_left animation with frames 4-5');
        } catch (error) {
            console.error('❌ Error creating female_walk_left animation:', error);
            // Fallback to single frame if animation creation fails
            this.anims.create({
                key: 'female_walk_left',
                frames: [{ key: 'female_player', frame: 4 }],
                frameRate: 1,
                repeat: 0
            });
            console.log('⚠️ Using fallback single frame for female_walk_left');
        }

        // Debug frame count
        if (this.textures.exists('female_player')) {
            const texture = this.textures.get('female_player');
            console.log('🎬 Female player texture info:', {
                frameTotal: texture.frameTotal,
                frames: texture.frames
            });
        }
        console.log('✅ Created female_walk_left animation');

        // Static jump animation using frame 4 (index 3)
        this.anims.create({
            key: 'female_jump',
            frames: this.textures.exists('female_player') ? 
                [{ key: 'female_player', frame: 3 }] : // Frame 4 in human counting (frame 3)
                [{ key: 'female_player_fallback', frame: 0 }],
            frameRate: 1,
            repeat: 0
        });
        console.log('🎬 Debug - Static jump frame:', 3);
        console.log('✅ Created female_jump animation');

        // Right jump animation using frame 3
        this.anims.create({
            key: 'female_jump_right',
            frames: this.textures.exists('female_player') ? 
                [{ key: 'female_player', frame: 3 }] : // Frame 4 in human counting (frame 3)
                [{ key: 'female_player_fallback', frame: 0 }],
            frameRate: 1,
            repeat: 0
        });
        console.log('✅ Created female_jump_right animation');

        // Left jump animation using frame 7
        this.anims.create({
            key: 'female_jump_left',
            frames: this.textures.exists('female_player') ? 
                [{ key: 'female_player', frame: 7 }] : // Frame 8 in human counting (frame 7)
                [{ key: 'female_player_fallback', frame: 0 }],
            frameRate: 1,
            repeat: 0
        });
        console.log('✅ Created female_jump_left animation');

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

    // Power-up texture creation - Phase 3.2
    createPowerUpTexture(type) {
        const graphics = this.add.graphics();
        const size = 64;
        
        switch (type) {
            case 'doubleJump':
                // Create a wing-like double jump icon
                graphics.fillStyle(0x00ff00); // Green
                graphics.fillCircle(size/2, size/2, size/3);
                graphics.fillStyle(0xffffff); // White wings
                graphics.fillEllipse(size/2 - 10, size/2 - 5, 15, 8);
                graphics.fillEllipse(size/2 + 10, size/2 - 5, 15, 8);
                graphics.fillEllipse(size/2 - 8, size/2 + 5, 12, 6);
                graphics.fillEllipse(size/2 + 8, size/2 + 5, 12, 6);
                break;
            case 'lifeUp':
                graphics.fillStyle(0xff4444);
                graphics.fillCircle(size / 2, size / 2, size / 3);
                graphics.fillStyle(0xffffff);
                graphics.fillRect(size/2 - 8, size/2, 16, 16);
                graphics.fillStyle(0x00ff00);
                graphics.fillRect(size/2 - 4, size/2 + 4, 8, 12);
                break;
                
            default:
                // Default power-up appearance
                graphics.fillStyle(0xffff00); // Yellow
                graphics.fillCircle(size/2, size/2, size/3);
                graphics.fillStyle(0xffffff); // White star
                const points = 5;
                const outerRadius = size/4;
                const innerRadius = size/8;
                graphics.beginPath();
                for (let i = 0; i < points * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i * Math.PI) / points;
                    const x = size/2 + Math.cos(angle) * radius;
                    const y = size/2 + Math.sin(angle) * radius;
                    if (i === 0) graphics.moveTo(x, y);
                    else graphics.lineTo(x, y);
                }
                graphics.closePath();
                graphics.fillPath();
                break;
        }
        
        // Generate texture from graphics
        graphics.generateTexture('powerup_' + type, size, size);
        graphics.destroy();
    }

    create() {
        // Use shared sound manager instance or create new one - Phase 3.1
        if (window.globalSoundManager) {
            this.soundManager = window.globalSoundManager;
            console.log('Using shared sound manager');
        } else {
            this.soundManager = new SoundManager();
            window.globalSoundManager = this.soundManager;
            console.log('Created new sound manager');
            
            // Load and start background music (only on first creation)
            this.soundManager.loadBackgroundMusic('assets/music/Crypto Quest.mp3').then(() => {
                console.log('🎵 Background music loaded successfully, will start after user interaction');
                // Start music after a short delay to allow for user interaction
                this.time.delayedCall(1000, () => {
                    console.log('🎵 Attempting to start background music');
                    this.soundManager.playBackgroundMusic();
                });
            }).catch(error => {
                console.error('❌ Failed to load background music:', error);
            });
        }
        
        // Background with fallback - ensure full coverage
        const bgKey = this.textures.exists('background') ? 'background' : 'bg_fallback';
        this.add.tileSprite(0, 0, GAME_CONSTANTS.SCREEN.WIDTH, GAME_CONSTANTS.SCREEN.HEIGHT, bgKey).setOrigin(0, 0);
        
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
        
        const subtitleY = 215;
        this.add.text(400, subtitleY, 'Collect Bitcoin • Avoid Central Bankers', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        this.add.text(400, subtitleY + 30, `High Score: ${gameState.highScore}`, {
            fontSize: '18px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Menu
        this.createMenu(430);
        
        // Demo character
        this.createDemoCharacter();
        
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        
        // Character selection display
        this.createCharacterSelection();
        
        gameState.currentScene = 'title';
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

    createMenu(startY = 430) {
        const menuY = startY;
        const spacing = 64;
        
        // Start Game button
        const startBtn = this.add.text(400, menuY, 'START GAME', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#f7931a',
            strokeThickness: 2
        }).setOrigin(0.5).setInteractive();
        
        startBtn.on('pointerover', () => {
            startBtn.setScale(GAME_CONSTANTS.UI.BUTTON_HOVER_SCALE);
            startBtn.setFill('#f7931a');
        });
        
        startBtn.on('pointerout', () => {
            startBtn.setScale(GAME_CONSTANTS.UI.BUTTON_NORMAL_SCALE);
            startBtn.setFill('#ffffff');
        });
        
        startBtn.on('pointerdown', () => {
            // Force audio context to start on first user interaction
            this.soundManager.forceResumeAudio();
            this.startGame();
        });
        
        // Fullscreen button
        const fullscreenBtn = this.add.text(400, menuY + spacing, 'FULLSCREEN', {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive();
        
                fullscreenBtn.on('pointerover', () => {
            fullscreenBtn.setScale(GAME_CONSTANTS.UI.BUTTON_HOVER_SCALE);
            fullscreenBtn.setFill('#ffffff');
        });

        fullscreenBtn.on('pointerout', () => {
            fullscreenBtn.setScale(GAME_CONSTANTS.UI.BUTTON_NORMAL_SCALE);
            fullscreenBtn.setFill('#cccccc');
        });
        
        fullscreenBtn.on('pointerdown', () => {
            this.toggleFullscreen();
        });
        
        // Music toggle button
        const musicBtn = this.add.text(400, menuY + spacing * 2, 'MUSIC: ON', {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive();
        
        musicBtn.on('pointerover', () => {
            musicBtn.setScale(GAME_CONSTANTS.UI.BUTTON_HOVER_SCALE);
            musicBtn.setFill('#ffffff');
        });
        
        musicBtn.on('pointerout', () => {
            musicBtn.setScale(GAME_CONSTANTS.UI.BUTTON_NORMAL_SCALE);
            musicBtn.setFill('#cccccc');
        });
        
        musicBtn.on('pointerdown', () => {
            // Force audio context to start on first user interaction
            this.soundManager.forceResumeAudio();
            
            const musicEnabled = this.soundManager.toggleMusic();
            musicBtn.setText(`MUSIC: ${musicEnabled ? 'ON' : 'OFF'}`);
            this.soundManager.playUIClickSound();
        });
        
        // High Scores button - Phase 4.2
        const highScoresBtn = this.add.text(400, menuY + spacing * 3, 'HIGH SCORES', {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive();
        
        highScoresBtn.on('pointerover', () => {
            highScoresBtn.setScale(GAME_CONSTANTS.UI.BUTTON_HOVER_SCALE);
            highScoresBtn.setFill('#ffffff');
        });
        
        highScoresBtn.on('pointerout', () => {
            highScoresBtn.setScale(GAME_CONSTANTS.UI.BUTTON_NORMAL_SCALE);
            highScoresBtn.setFill('#cccccc');
        });
        
        highScoresBtn.on('pointerdown', () => {
            try {
                this.soundManager.playUIClickSound();
                this.scene.start('HighScoresScene');
            } catch (error) {
                console.error('Error starting HighScoresScene:', error);
                console.error('Staying on title screen...');
            }
        });
        
        this.menuItems = [startBtn, fullscreenBtn, musicBtn, highScoresBtn];
    }

    createDemoCharacter() {
        // Show animated player character on title screen
        const selectedCharacter = gameState.selectedCharacter;
        let playerKey, animKey;
        
        if (selectedCharacter === 'female') {
            playerKey = this.textures.exists('female_player') ? 'female_player' : 'female_player_fallback';
            animKey = 'female_walk_right';
            console.log('🎭 Using female character with key:', playerKey);
            
            // Debug texture info
            if (this.textures.exists('female_player')) {
                const texture = this.textures.get('female_player');
                console.log('🖼️ Female texture info:', {
                    key: texture.key,
                    frameTotal: texture.frameTotal,
                    width: texture.width,
                    height: texture.height
                });
            }
        } else {
            playerKey = this.textures.exists('player') ? 'player' : 'player_fallback';
            animKey = 'player_walk';
        }
        
        // Remove existing demo player if it exists
        if (this.demoPlayer) {
            this.demoPlayer.destroy();
        }
        
        this.demoPlayer = this.add.sprite(620, 420, playerKey);
        // Apply proper scaling based on character
        if (selectedCharacter === 'female') {
            this.demoPlayer.setScale(GAME_CONSTANTS.PLAYER.DEMO_SCALE); // Use same demo scale as Andy
        } else {
            this.demoPlayer.setScale(GAME_CONSTANTS.PLAYER.DEMO_SCALE);
        }
        this.demoPlayer.play(animKey);
        
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

    createCharacterSelection() {
        // Character selection UI
        this.add.text(400, 300, 'CHARACTER SELECTION', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        this.characterText = this.add.text(400, 325, `Current: ${gameState.selectedCharacter === 'andy' ? 'Andy' : 'Character 2'}`, {
            fontSize: '16px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        this.add.text(400, 345, 'Press C to toggle character', {
            fontSize: '14px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
    }

    startGame() {
        try {
            // UI click sound - Phase 3.1
            this.soundManager.playUIClickSound();

            // Reset run state before entering the game scene
            resetRunState();
            gameState.gameStartTime = Date.now();
            gameState.currentGameBitcoins = 0;
            gameState.isPaused = false;

            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                try {
                    this.scene.start('GameScene');
                } catch (sceneError) {
                    console.error('Error starting GameScene:', sceneError);
                    console.error('Falling back to direct scene start...');
                    this.scene.start('TitleScene');
                }
            });
        } catch (error) {
            console.error('Error in startGame transition:', error);
            console.error('Attempting direct scene start...');
            try {
                this.scene.start('GameScene');
            } catch (fallbackError) {
                console.error('Fallback failed, staying on title:', fallbackError);
            }
        }
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
        
        // Character selection toggle
        if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
            this.toggleCharacter();
        }
    }

    toggleCharacter() {
        // Toggle between characters
        gameState.selectedCharacter = gameState.selectedCharacter === 'andy' ? 'female' : 'andy';
        
        // Update UI text
        this.characterText.setText(`Current: ${gameState.selectedCharacter === 'andy' ? 'Andy' : 'Character 2'}`);
        
        // Update demo character
        this.createDemoCharacter();
        
        // Play UI sound
        this.soundManager.playUIClickSound();
    }
}
