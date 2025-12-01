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
                
                // Special handling for Player 2 sprite
                if (file.key === 'player2') {
                    console.error('🚨 Player 2 sprite failed to load!');
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

                    // Debug Player 2 sprite dimensions
                    const peteImg = new Image();
                    peteImg.onload = () => {
                        console.log('🔍 Player 2 sprite actual dimensions:', {
                            width: peteImg.width,
                            height: peteImg.height
                        });
                    };
                    peteImg.src = 'assets/images/PeteSprite.png?v=' + Date.now();

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
                    
                    // Load Player 2 character spritesheet with cache busting
                const cacheBuster = Date.now();
                console.log('📥 Loading Player 2 spritesheet from assets/images/PeteSprite.png?v=' + cacheBuster);
                this.load.spritesheet('player2', 'assets/images/PeteSprite.png?v=' + cacheBuster, {
                    frameWidth: 341,    // Match Andy's frame size
                    frameHeight: 532,   // Slightly taller to prevent cutoff
                    spacing: 0,
                    margin: 0
                });
                
                // Add load complete handler for debugging
                this.load.on('complete', () => {
                    if (this.textures.exists('player2')) {
                        const texture = this.textures.get('player2');
                        console.log('📥 Player 2 sprite loaded:', {
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
                
                // Add load event listener for Player 2
                this.load.on('filecomplete-spritesheet-player2', () => {
                    console.log('✅ Player 2 spritesheet loaded successfully');
                    console.log('📊 Player 2 texture info:', this.textures.get('player2'));
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
                case 'player2':
                    console.log('🔄 Retrying Player 2 sprite:', originalUrl);
                    this.load.spritesheet(assetKey, originalUrl, {
                        frameWidth: 341,
                        frameHeight: 532
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
        
        // Player 2 fallback
        graphics.clear();
        graphics.fillStyle(0x3a8ee6); // Accent color for Player 2
        graphics.fillRect(0, 0, 32, 48);
        graphics.fillStyle(0x000000);
        graphics.fillRect(8, 8, 16, 8);
        graphics.fillStyle(0xffffff);
        graphics.fillRect(10, 20, 12, 4); // Different distinguishing feature
        graphics.generateTexture('player2_fallback', 32, 48);
        
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

        // Player 2 character animations with fallback support
        const player2Key = this.textures.exists('player2') ? 'player2' : 'player2_fallback';
        
        console.log('🎬 Creating Player 2 animations with key:', player2Key);
        
        this.anims.create({
            key: 'player2_idle',
            frames: this.textures.exists('player2') ?
                this.anims.generateFrameNumbers('player2', { start: 0, end: 1 }) :
                [{ key: 'player2_fallback', frame: 0 }],
            frameRate: 4,
            repeat: -1
        });
        console.log('✅ Created player2_idle animation (frames 0-1, looping)');

        // Right-facing animations (frames 1-2 from top row)
        this.anims.create({
            key: 'player2_walk_right',
            frames: this.textures.exists('player2') ? 
                this.anims.generateFrameNumbers('player2', { frames: [1, 2] }) :
                [{ key: 'player2_fallback', frame: 0 }],
            frameRate: 8,
            repeat: -1
        });
        console.log('✅ Created player2_walk_right animation');

        // Left-facing animations (frames 5-6 from bottom row)
        try {
            this.anims.create({
                key: 'player2_walk_left',
                frames: this.textures.exists('player2') ? 
                    this.anims.generateFrameNumbers('player2', { start: 4, end: 5 }) :
                    [{ key: 'player2_fallback', frame: 0 }],
                frameRate: 6,
                repeat: -1
            });
            console.log('✅ Created player2_walk_left animation with frames 4-5');
        } catch (error) {
            console.error('❌ Error creating player2_walk_left animation:', error);
            // Fallback to single frame if animation creation fails
            this.anims.create({
                key: 'player2_walk_left',
                frames: [{ key: 'player2', frame: 4 }],
                frameRate: 1,
                repeat: 0
            });
            console.log('⚠️ Using fallback single frame for player2_walk_left');
        }

        // Debug frame count
        if (this.textures.exists('player2')) {
            const texture = this.textures.get('player2');
            console.log('🎬 Player 2 texture info:', {
                frameTotal: texture.frameTotal,
                frames: texture.frames
            });
        }
        console.log('✅ Created player2_walk_left animation');

        // Static jump animation using frame 4 (index 3)
        this.anims.create({
            key: 'player2_jump',
            frames: this.textures.exists('player2') ? 
                [{ key: 'player2', frame: 3 }] : // Frame 4 in human counting (frame 3)
                [{ key: 'player2_fallback', frame: 0 }],
            frameRate: 1,
            repeat: 0
        });
        console.log('🎬 Debug - Static jump frame:', 3);
        console.log('✅ Created player2_jump animation');

        // Right jump animation using frame 3
        this.anims.create({
            key: 'player2_jump_right',
            frames: this.textures.exists('player2') ? 
                [{ key: 'player2', frame: 3 }] : // Frame 4 in human counting (frame 3)
                [{ key: 'player2_fallback', frame: 0 }],
            frameRate: 1,
            repeat: 0
        });
        console.log('✅ Created player2_jump_right animation');

        // Left jump animation using frame 7
        this.anims.create({
            key: 'player2_jump_left',
            frames: this.textures.exists('player2') ? 
                [{ key: 'player2', frame: 7 }] : // Frame 8 in human counting (frame 7)
                [{ key: 'player2_fallback', frame: 0 }],
            frameRate: 1,
            repeat: 0
        });
        console.log('✅ Created player2_jump_left animation');

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
            this.soundManager.loadBackgroundMusic('assets/music/CryptoQuest.mp3').then(() => {
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
        const title = this.add.text(400, 80, "Satoshi's Garden", {
            fontSize: '52px',
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
        
        const subtitleY = 140;
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

        // Character selection cards (new card-based UI)
        this.createCharacterCards();

        // Start game button
        this.createStartButton();

        // Corner options (fullscreen and music)
        this.createCornerOptions();

        // High Scores button at bottom
        this.createHighScoresButton();

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
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

    createCharacterCards() {
        // Card-based character selection
        const cardY = 330;  // Moved down for better spacing
        const cardSpacing = 200;  // Reduced spacing between cards
        const card1X = 400 - cardSpacing / 2;
        const card2X = 400 + cardSpacing / 2;

        // Andy (Player 1) Card
        this.andyCard = this.createCharacterCard(card1X, cardY, 'andy', 'Player 1 - Andy');

        // Pete (Player 2) Card
        this.peteCard = this.createCharacterCard(card2X, cardY, 'player2', 'Player 2 - Pete');

        // Set initial selection
        this.updateCardSelection();
    }

    createCharacterCard(x, y, characterKey, label) {
        const cardWidth = 150;  // Reduced from 180
        const cardHeight = 170;  // Reduced from 200

        // Card container
        const card = this.add.container(x, y);

        // Card background
        const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x000000, 0.7);
        bg.setStrokeStyle(3, 0x666666);

        // Character sprite
        const spriteKey = characterKey === 'andy'
            ? (this.textures.exists('player') ? 'player' : 'player_fallback')
            : (this.textures.exists('player2') ? 'player2' : 'player2_fallback');

        const sprite = this.add.sprite(0, -15, spriteKey);
        sprite.setScale(0.15);  // Slightly smaller to fit reduced card size

        // Store animation keys
        sprite.idleAnimKey = characterKey === 'andy' ? 'player_idle' : 'player2_idle';
        sprite.staticFrame = 0;

        // Don't start animation yet - will be controlled by selection state
        sprite.setFrame(sprite.staticFrame);

        // Character name
        const nameText = this.add.text(0, 60, label, {
            fontSize: '15px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Add all to container
        card.add([bg, sprite, nameText]);

        // Make card interactive
        bg.setInteractive();
        bg.on('pointerover', () => {
            bg.setStrokeStyle(3, 0xffd700);
            card.setScale(1.05);
        });

        bg.on('pointerout', () => {
            const isSelected = (characterKey === 'andy' && gameState.selectedCharacter === 'andy') ||
                              (characterKey === 'player2' && gameState.selectedCharacter === 'player2');
            bg.setStrokeStyle(3, isSelected ? 0xf7931a : 0x666666);
            card.setScale(1);
        });

        bg.on('pointerdown', () => {
            this.soundManager.playUIClickSound();
            gameState.selectedCharacter = characterKey;
            this.updateCardSelection();
        });

        // Store references
        card.characterKey = characterKey;
        card.background = bg;
        card.sprite = sprite;

        return card;
    }

    updateCardSelection() {
        // Update visual selection state for both cards
        [this.andyCard, this.peteCard].forEach(card => {
            const isSelected = (card.characterKey === 'andy' && gameState.selectedCharacter === 'andy') ||
                              (card.characterKey === 'player2' && gameState.selectedCharacter === 'player2');

            card.background.setStrokeStyle(3, isSelected ? 0xf7931a : 0x666666);

            if (isSelected) {
                card.background.setFillStyle(0x1a1a1a, 0.9);
                // Animate selected character
                if (card.sprite && card.sprite.idleAnimKey) {
                    card.sprite.play(card.sprite.idleAnimKey);
                }
            } else {
                card.background.setFillStyle(0x000000, 0.7);
                // Stop animation and show static frame for unselected character
                if (card.sprite) {
                    card.sprite.stop();
                    card.sprite.setFrame(card.sprite.staticFrame);
                }
            }
        });
    }

    createStartButton() {
        // Start Game button centered below cards
        const startBtn = this.add.text(400, 520, 'START GAME', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#f7931a',
            strokeThickness: 3
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
            this.soundManager.forceResumeAudio();
            this.startGame();
        });
    }

    createCornerOptions() {
        // Fullscreen button (bottom-left corner)
        const fullscreenBtn = this.add.text(20, 580, 'FULLSCREEN', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0, 1).setInteractive();

        fullscreenBtn.on('pointerover', () => {
            fullscreenBtn.setScale(1.1);
            fullscreenBtn.setFill('#ffffff');
        });

        fullscreenBtn.on('pointerout', () => {
            fullscreenBtn.setScale(1);
            fullscreenBtn.setFill('#cccccc');
        });

        fullscreenBtn.on('pointerdown', () => {
            this.soundManager.playUIClickSound();
            this.toggleFullscreen();
        });

        // Music toggle button (bottom-right corner)
        this.musicBtn = this.add.text(780, 580, 'MUSIC: ON', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(1, 1).setInteractive();

        this.musicBtn.on('pointerover', () => {
            this.musicBtn.setScale(1.1);
            this.musicBtn.setFill('#ffffff');
        });

        this.musicBtn.on('pointerout', () => {
            this.musicBtn.setScale(1);
            this.musicBtn.setFill('#cccccc');
        });

        this.musicBtn.on('pointerdown', () => {
            this.soundManager.forceResumeAudio();
            const musicEnabled = this.soundManager.toggleMusic();
            this.musicBtn.setText(`MUSIC: ${musicEnabled ? 'ON' : 'OFF'}`);
            this.soundManager.playUIClickSound();
        });
    }

    createHighScoresButton() {
        // High Scores button at bottom center
        const highScoresBtn = this.add.text(400, 565, 'HIGH SCORES', {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive();

        highScoresBtn.on('pointerover', () => {
            highScoresBtn.setScale(1.1);
            highScoresBtn.setFill('#ffffff');
        });

        highScoresBtn.on('pointerout', () => {
            highScoresBtn.setScale(1);
            highScoresBtn.setFill('#cccccc');
        });

        highScoresBtn.on('pointerdown', () => {
            try {
                this.soundManager.playUIClickSound();
                this.scene.start('HighScoresScene');
            } catch (error) {
                console.error('Error starting HighScoresScene:', error);
            }
        });
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
        // Start game with space bar
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.soundManager.forceResumeAudio();
            this.startGame();
        }
    }
}
