import { GAME_CONSTANTS } from '../core/constants.js';
import { gameState, setHighScore } from '../core/gameState.js';
import { SoundManager } from '../core/soundManager.js';
import { SpritePool } from '../entities/SpritePool.js';
import { PowerUp } from '../entities/PowerUp.js';
import { getPlatformLayout, getBitcoinPositions, getEnemyPlacements, getGroundGaps, getPowerUpPlacements } from '../data/levelLayouts.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.platforms = null; // Floating platforms
        this.groundPlatforms = null; // Floor segments
        this.bitcoins = null;
        this.enemies = null;
        this.cursors = null;
        this.score = 0;
        this.lives = GAME_CONSTANTS.GAMEPLAY.INITIAL_LIVES;
        this.scoreText = null;
        this.livesText = null;
        this.level = 1;
        this.goalFlag = null;
        this.mobileControls = null;
        this.isMobile = false;
        this.platformDebugCounter = 0;
        this.platformLabels = [];
        this.performanceMonitor = {
            frameCount: 0,
            lastCheck: 0,
            fps: 60
        };
        // Jump mechanics
        this.jumpTimer = 0;
        this.canJump = true;
        this.jumpForce = GAME_CONSTANTS.PLAYER.JUMP_FORCE; // Realistic jump force
        // Parallax background layers
        this.backgroundLayers = [];
        
        // Power-up system - Phase 3.2
        this.powerUps = null;
        this.doubleJumpActive = false;
        this.doubleJumpUsed = false;
        this.powerUpTimer = null;
        this.powerUpIndicator = null;
        
        // Level progression - Goal flag
        this.levelCompleting = false;
        this.playerRespawning = false;
        
        // Particle system - Phase 3.3
        this.particleManager = null;

        this.runSummarySubmitted = false;
        this.lastRunSummary = null;

        // Track floor gaps per level for pit detection
        this.groundGaps = [];
        this.floorTopY = 564;
    }

    init() {
        const storedScore = typeof gameState.score === 'number' ? gameState.score : 0;
        const storedLives = typeof gameState.lives === 'number' ? gameState.lives : GAME_CONSTANTS.GAMEPLAY.INITIAL_LIVES;
        const storedLevel = typeof gameState.level === 'number' ? gameState.level : 1;

        this.score = storedScore;
        this.lives = storedLives;
        this.level = storedLevel;
        this.runSummarySubmitted = false;
        this.lastRunSummary = null;

        // Preserve run metadata unless this is a brand-new session
        if (!gameState.gameStartTime) {
            gameState.gameStartTime = Date.now();
        }
        if (typeof gameState.currentGameBitcoins !== 'number') {
            gameState.currentGameBitcoins = 0;
        }

        gameState.score = this.score;
        gameState.lives = this.lives;
        gameState.level = this.level;

        // Detect mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       ('ontouchstart' in window) || 
                       (navigator.maxTouchPoints > 0);
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
        }
        
        // Ensure background music continues if it was playing
        if (this.soundManager.backgroundMusic && this.soundManager.backgroundMusic.paused) {
            this.time.delayedCall(500, () => {
                this.soundManager.resumeBackgroundMusic();
            });
        }
        
        // Test audio system after a short delay (after user interaction)
        this.time.delayedCall(1000, () => {
            console.log('Testing audio system - audio context state:', 
                this.soundManager.audioContext ? this.soundManager.audioContext.state : 'No context');
            
            // Make test function available globally for debugging
            window.testAudio = () => this.soundManager.testAudio();
            console.log('💡 You can test audio by typing: testAudio() in console');
        });
        
        // Initialize sprite pool for collection effects - Phase 2.2
        this.spritePool = new SpritePool(this, 10);
        
        // Initialize power-up system - Phase 3.2
        this.powerUps = this.physics.add.group();
        
        // Initialize particle system - Phase 3.3
        this.initializeParticleSystem();
        
        // Create layered parallax background
        this.createParallaxBackground();
        
        this.platformDebugCounter = 0;
        this.platformLabels = [];

        // Create world
        this.createLevel();
        this.drawZoneMarkers();
        this.createPlayer();
        this.createBitcoins();
        this.createFixedPowerUps();
        this.createEnemies();
        this.createUI();
        
        // Mobile controls if needed
        if (this.isMobile) {
            this.createMobileControls();
        }
        
        // Setup physics and input
        console.log('🔧 About to setup collisions. Goal flag exists:', !!this.goalFlag, 'Goal zone exists:', !!this.goalZone);
        this.setupCollisions();
        this.setupInput();
        this.setupCamera();
        
        // Performance monitoring
        this.initializePerformanceMonitoring();
        
        gameState.currentScene = 'game';
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
        this.platforms = this.physics.add.staticGroup();
        this.groundPlatforms = this.physics.add.staticGroup();

        // TIMESTAMP TO VERIFY NEW CODE IS RUNNING
        console.log('🆕🆕🆕 LEVEL REBUILD v3 - VERTICAL VARIETY + FIXED ENEMIES - LOADED AT:', new Date().toLocaleTimeString());

        // Check which platform textures are available
        const hasCustomPlatforms = this.textures.exists('platform_ground') &&
                                   this.textures.exists('platform_1');

        console.log('🔍 Platform textures available:', {
            platform_ground: this.textures.exists('platform_ground'),
            platform_1: this.textures.exists('platform_1'),
            platform_2: this.textures.exists('platform_2'),
            platform_3: this.textures.exists('platform_3'),
            using_custom: hasCustomPlatforms
        });

        // Create fallback texture if needed
        if (!hasCustomPlatforms && !this.textures.exists('platform_fallback')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0xf7931a);
            graphics.fillRect(0, 0, 100, 32);
            graphics.lineStyle(2, 0xffffff);
            graphics.strokeRect(0, 0, 100, 32);
            graphics.generateTexture('platform_fallback', 100, 32);
            graphics.destroy();
        }

        this.groundGaps = getGroundGaps(this.level);
        const isInGroundGap = (centerX) => this.groundGaps.some(gap => centerX >= gap.start && centerX <= gap.end);

        // Create ground platforms - Floor.png is 1080×180, aspect ratio 6:1
        // Scale to 0.2: 1080×180 becomes 216×36 pixels
        for (let x = 0; x < GAME_CONSTANTS.WORLD.WIDTH; x += 200) {
            if (hasCustomPlatforms) {
                const centerX = x + 108;
                if (isInGroundGap(centerX)) {
                    continue;
                }
                // Y=564 means top surface at 564, bottom at 600 (no gap!)
                const groundPlat = this.groundPlatforms.create(centerX, 564, 'platform_ground');
                groundPlat.setScale(0.2, 0.2);
                // Origin (0.5, 0) means Y position = top surface where character stands
                groundPlat.setOrigin(0.5, 0);
                groundPlat.refreshBody();
                // No label for ground platforms

                if (x === 0) {
                    console.log(`✅ FLOOR: y=564 (top), bottom=600, dynamic gaps=${this.groundGaps.length}`);
                }
            } else {
                const centerX = x + 400;
                if (isInGroundGap(centerX)) {
                    continue;
                }
                const groundPlat = this.groundPlatforms.create(centerX, 584, 'platform_fallback');
                groundPlat.setScale(8, 1);
                groundPlat.refreshBody();
                // No label for ground platforms
            }
        }

        // Reset counter for floating platforms only (1:1 mapping with array indices)
        this.platformDebugCounter = 0;

        // Create floating platforms with variety
        // Platform1: 1080×864, Platform2: 125×125, Platform3: 125×125
        const layouts = getPlatformLayout(this.level);
        layouts.forEach((platform, index) => {
            if (hasCustomPlatforms) {
                // Cycle through platform_1, platform_2, platform_3 for variety
                const platformTypes = ['platform_1', 'platform_2', 'platform_3'];
                const platformKey = platform.frame !== undefined
                    ? platformTypes[platform.frame % 3]
                    : platformTypes[index % 3];

                const plat = this.platforms.create(platform.x, platform.y, platformKey);

                // Platform1 (1080×864) is large, Platform2/3 (125×125) are small
                // Scale them differently so they all look proportional
                let scaleX, scaleY;
                if (platformKey === 'platform_1') {
                    // Platform1 is correct size at current scale
                    scaleX = platform.scale * 0.04;
                    scaleY = platform.scale * 0.03;
                } else {
                    // Platform2/3 need to be scaled MUCH larger (125px vs 1080px = 8.64× difference)
                    scaleX = platform.scale * 0.35;
                    scaleY = platform.scale * 0.35;
                }

                plat.setScale(scaleX, scaleY);
                plat.setOrigin(0.5, 0);
                plat.refreshBody();
                this.labelPlatform(plat);

                if (index === 0) {
                    console.log(`✅ ${platformKey}: scale=${scaleX.toFixed(2)}×${scaleY.toFixed(2)}`);
                }
            } else {
                const plat = this.platforms.create(platform.x, platform.y, 'platform_fallback');
                plat.setScale(platform.scale, 1);
                plat.refreshBody();
            }
        });

        const totalPlatforms = this.platforms.getChildren().length + this.groundPlatforms.getChildren().length;
        console.log(`✅ Total platforms created: ${totalPlatforms}`);

        this.createGoalFlag();
    }

    createGoalFlag() {
        // Create a more visible goal flag using a simple rectangle as fallback
        if (!this.textures.exists('flag')) {
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
        }
        
        // Create goal flag as regular sprite first, then add physics
        this.goalFlag = this.add.sprite(3850, 500, 'flag');
        this.goalFlag.setOrigin(0.5, 1); // Center-bottom origin for better collision
        
        // Verify position before adding physics
        console.log('🎯 Goal flag BEFORE physics:', this.goalFlag.x, this.goalFlag.y);
        
        // Add physics separately
        this.physics.world.enable(this.goalFlag);
        this.goalFlag.body.setImmovable(true);
        
        // Verify position after adding physics
        console.log('🎯 Goal flag AFTER physics:', this.goalFlag.x, this.goalFlag.y);
        
        // Lock position to prevent corruption
        this.goalFlag.body.setVelocity(0, 0);
        this.goalFlag.body.setAcceleration(0, 0);
        this.goalFlag.body.setGravityY(0);
        
        // Make the collision area larger to ensure detection
        this.goalFlag.body.setSize(80, 120); // Much larger collision area
        this.goalFlag.body.setOffset(-16, -20); // Adjust offset for larger collision area
        
        console.log('🚩 Goal flag created at:', this.goalFlag.x, this.goalFlag.y, 'Body size:', this.goalFlag.body.width, 'x', this.goalFlag.body.height);
        
        // Add a glowing effect to make it more visible
        this.tweens.add({
            targets: this.goalFlag,
            alpha: 0.7,
            duration: GAME_CONSTANTS.ANIMATION.TWEEN_DURATION,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add multiple visual indicators
        this.add.text(3850, 400, 'GOAL!', {
            fontSize: '32px',
            fill: '#00ff00',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 1);
        
        // Add arrow pointing to flag
        this.add.text(3850, 450, '↓', {
            fontSize: '48px',
            fill: '#ffff00',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 1);
        
        // Add a visible collision box for debugging (remove this later)
        const debugBox = this.add.rectangle(3850, 500, 80, 120, 0xff0000, 0.2);
        debugBox.setOrigin(0.5, 1);
        
        // Verify position immediately after creation
        console.log('🎯 Goal flag created at position:', this.goalFlag.x, this.goalFlag.y);
        console.log('🎯 Goal flag body position:', this.goalFlag.body.x, this.goalFlag.body.y);
        
        // Force position if corrupted
        if (this.goalFlag.y > 1000 || this.goalFlag.y < 0) {
            console.log('🚨 Goal flag Y position corrupted! Fixing...');
            this.goalFlag.setPosition(3850, 500);
            console.log('🔧 Fixed goal flag position:', this.goalFlag.x, this.goalFlag.y);
        }
        
        // Add manual collision detection as backup
        this.goalZone = this.add.zone(3850, 500, 100, 150);
        this.physics.world.enable(this.goalZone);
        this.goalZone.body.setImmovable(true);
        console.log('🎯 Goal zone created at:', this.goalZone.x, this.goalZone.y, 'Size:', this.goalZone.width, 'x', this.goalZone.height);
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

    createPlayer() {
        const selectedCharacter = gameState.selectedCharacter;
        let playerKey;
        
        console.log('🎮 Creating player with character:', selectedCharacter);
        console.log('🖼️ Player 2 texture exists:', this.textures.exists('player2'));
        console.log('🖼️ Andy player texture exists:', this.textures.exists('player'));
        
        if (selectedCharacter === 'player2') {
            playerKey = this.textures.exists('player2') ? 'player2' : 'player2_fallback';
        } else {
            playerKey = this.textures.exists('player') ? 'player' : 'player_fallback';
        }
        
        console.log('🔑 Using player key:', playerKey);
        
        this.player = this.physics.add.sprite(GAME_CONSTANTS.PLAYER.START_X, GAME_CONSTANTS.PLAYER.START_Y, playerKey);
        
        console.log('🎮 Player sprite created:', this.player);
        console.log('🎮 Player visible:', this.player.visible);
        console.log('🎮 Player alpha:', this.player.alpha);
        console.log('🎮 Player texture key:', this.player.texture.key);
        
        // Set appropriate scaling based on character
        if (selectedCharacter === 'player2') {
            const player2Scale = GAME_CONSTANTS.PLAYER.SCALE * 1.10; // 10% larger than Andy
            this.player.setScale(player2Scale);
            console.log('🧍 Player 2 character - using 10% larger scale:', player2Scale);
        } else {
            this.player.setScale(GAME_CONSTANTS.PLAYER.SCALE);
            console.log('👨 Male character - set scale to', GAME_CONSTANTS.PLAYER.SCALE);
        }
        
        console.log('📏 Final player scale:', this.player.scaleX, this.player.scaleY);
        console.log('📍 Player position:', this.player.x, this.player.y);
        
        this.player.setBounce(GAME_CONSTANTS.PLAYER.BOUNCE);
        this.player.setCollideWorldBounds(true);
        
        // Set appropriate hitbox based on character
        if (selectedCharacter === 'player2') {
            this.player.body.setSize(200, 400, true); // Use same hitbox as Andy
            // Player 2 sprite has white space at the bottom
            // Offset the collision body vertically to align with the character's actual position
            this.player.body.setOffset(70, 42);
            console.log('📦 Player 2 hitbox set to 200x400 with offset (70, 42) to compensate for white space');
        } else {
            this.player.body.setSize(200, 400, true); // Original Andy hitbox
            console.log('📦 Andy hitbox set to 200x400');
        }
        
        // Set max velocity to prevent flying
        this.player.body.setMaxVelocity(GAME_CONSTANTS.PLAYER.MAX_VELOCITY_X, GAME_CONSTANTS.PLAYER.MAX_VELOCITY_Y);
        this.player.body.setDragX(300); // Add air resistance

        // Set player depth to appear above platforms and background objects
        this.player.setDepth(100);
        console.log('🎨 Player depth set to 100');

        // Track player facing direction
        this.playerFacingRight = true;
    }

    createBitcoins() {
        this.bitcoins = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        const bitcoinPositions = getBitcoinPositions(this.level);

        bitcoinPositions.forEach((pos) => {
            const bitcoinKey = this.textures.exists('bitcoin') ? 'bitcoin' : 'bitcoin_fallback';
            const bitcoin = this.bitcoins.create(pos.x, pos.y, bitcoinKey);
            bitcoin.setScale(GAME_CONSTANTS.BITCOIN.SCALE); // Much smaller - proportional to player and enemy
            
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

    createFixedPowerUps() {
        const placements = getPowerUpPlacements(this.level);
        placements.forEach(({ x, y, type = 'doubleJump' }) => {
            const powerUp = new PowerUp(this, x, y, type);
            this.powerUps.add(powerUp);
        });
    }

    drawZoneMarkers() {
        const zoneEnds = [800, 1600, 2400, 3200, 3600, 4000];
        const height = GAME_CONSTANTS.WORLD.HEIGHT;
        zoneEnds.forEach((x, index) => {
            const line = this.add.graphics();
            line.lineStyle(4, 0xff0000, 0.6);
            line.strokeLineShape(new Phaser.Geom.Line(x, 0, x, height));
            const label = this.add.text(x - 20, 10, `Z${index + 1}`, {
                fontSize: '18px',
                fill: '#ff0000'
            }).setScrollFactor(1);
            line.setScrollFactor(1);
            this.time.delayedCall(1, () => {
                line.setDepth(9999);
                label.setDepth(10000);
            });
            this.zoneMarkers = this.zoneMarkers || [];
            this.zoneMarkers.push(line, label);
        });
    }

    labelPlatform(sprite) {
        const id = this.formatPlatformId(++this.platformDebugCounter);
        const label = this.add.text(sprite.x, sprite.y - 10, id, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ff0000'
        }).setOrigin(0.5, 1).setScrollFactor(1).setDepth(10000);
        this.platformLabels.push(label);
    }

    formatPlatformId(value) {
        return value.toString().padStart(4, '0');
    }

    createEnemies() {
        this.enemies = this.physics.add.group();

        const enemyPlacements = getEnemyPlacements(this.level);
        console.log(`🧭 Enemy placements for level ${this.level}:`, enemyPlacements);

        enemyPlacements.forEach(placement => {
            const enemyKey = this.textures.exists('enemy') ? 'enemy' : 'enemy_fallback';
            
            const enemy = this.enemies.create(placement.x, placement.y, enemyKey);
            enemy.setScale(GAME_CONSTANTS.ENEMY.SCALE); // Increase scale for better visual match with Andy
            enemy.setBounce(GAME_CONSTANTS.ENEMY.BOUNCE);
            enemy.setCollideWorldBounds(true);
            
            // Disable gravity for platform enemies to keep them on their platforms
            if (placement.platform === 'platform') {
                enemy.body.setAllowGravity(false);
                enemy.body.setImmovable(true);
            }
            
            const initialVelocity = Phaser.Math.Between(0, 1) ? GAME_CONSTANTS.ENEMY.SPEED : -GAME_CONSTANTS.ENEMY.SPEED;
            enemy.setVelocity(initialVelocity, 0);
            enemy.play(initialVelocity > 0 ? 'enemy_move_right' : 'enemy_move_left');
            
            // Adjust hitbox (shrink height + raise offset) so enemies can clear low ceilings like the player
            enemy.body.setSize(32, 48, true);
            enemy.body.setOffset(0, 0);

            if (placement.platform === 'ground') {
                const halfHeight = enemy.body.height / 2;
                enemy.setY(this.floorTopY - halfHeight);
            }

            // Ensure platform enemies stay anchored to their platforms
            
            enemy.body.setMaxVelocity(GAME_CONSTANTS.ENEMY.MAX_VELOCITY_X, GAME_CONSTANTS.ENEMY.MAX_VELOCITY_Y);
            
            enemy.patrolMin = placement.patrolMin;
            enemy.patrolMax = placement.patrolMax;
            enemy.platformType = placement.platform;
            enemy.lastX = enemy.x;
        });
    }

    getLevelName(level) {
        const theme = GAME_CONSTANTS.LEVELS.THEMES[level];
        return theme ? theme.name : `Advanced Level ${level}`;
    }

    createUI() {
        // Clean HUD without persistent instruction text
        this.scoreText = this.add.text(16, 16, '', {
            fontSize: '32px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0);
        
        this.livesText = this.add.text(16, 56, '', {
            fontSize: '32px',
            fill: '#ff0000',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0);
        
        // Game title
        const levelName = this.getLevelName(this.level);
        this.add.text(400, 16, levelName, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0).setScrollFactor(0);

        // Progress indicator
        this.add.text(400, 45, 'Reach the GOAL flag →', {
            fontSize: '16px',
            fill: '#ffff00',
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
            duration: GAME_CONSTANTS.ANIMATION.TWEEN_DURATION,
            delay: 3000,
            onComplete: () => controlsHint.destroy()
        });

        this.updateScoreDisplay();
        this.updateLivesDisplay();
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
        try {
            // Player collisions
            this.physics.add.collider(this.player, this.groundPlatforms);
            this.physics.add.collider(this.player, this.platforms);

            // Bitcoin collisions (only need floating platforms)
            this.physics.add.collider(this.bitcoins, this.platforms);

            // Enemy collisions
            this.physics.add.collider(this.enemies, this.groundPlatforms);
                
                // Collectibles and interactions
                this.physics.add.overlap(this.player, this.bitcoins, this.collectBitcoin, null, this);
                this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
                this.physics.add.overlap(this.player, this.goalFlag, this.reachGoal, null, this);
                
                // Backup goal zone collision
                if (this.goalZone) {
                    this.physics.add.overlap(this.player, this.goalZone, this.reachGoal, null, this);
                    console.log('⚡ Goal zone collision added as backup');
                }
                
                console.log('⚡ Collisions set up - Goal flag collision added for level', this.level);
                
                // Power-up collision detection - Phase 3.2
                this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
            } catch (error) {
                console.error('Error setting up collisions:', error);
                console.error('Attempting to restart scene...');
                // Graceful fallback - restart the current scene
                try {
                    this.scene.restart();
                } catch (restartError) {
                    console.error('Scene restart failed, returning to title:', restartError);
                    try {
                        this.scene.start('TitleScene');
                    } catch (titleError) {
                        console.error('Failed to return to title screen:', titleError);
                        window.location.reload();
                    }
                }
        }
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    }

    setupCamera() {
        // Set much wider world bounds for longer side-scrolling
        this.cameras.main.setBounds(0, 0, GAME_CONSTANTS.WORLD.WIDTH, GAME_CONSTANTS.WORLD.HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(150, 200);
        
        // Set world bounds for physics
        this.physics.world.setBounds(0, 0, GAME_CONSTANTS.WORLD.WIDTH, GAME_CONSTANTS.WORLD.HEIGHT);
    }

    initializePerformanceMonitoring() {
        this.performanceMonitor.lastCheck = this.time.now;
        this.performanceMonitor.frameCount = 0;
    }

    collectBitcoin(player, bitcoin) {
        bitcoin.disableBody(true, true);
        this.score += GAME_CONSTANTS.BITCOIN.POINTS;
        this.updateScoreDisplay();
        
        // Sound effect - Phase 3.1 with immediate activation
        console.log('🪙 About to play collect sound - audio context state:', this.soundManager.audioContext ? this.soundManager.audioContext.state : 'No context');
        this.soundManager.forceResumeAudio(); // Ensure audio context is active
        this.soundManager.playCollectSound();
        
        // Haptic feedback for mobile - Phase 2.3
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(50); // Positive feedback vibration
        }
        
        // Record bitcoin collection for achievements - Phase 4.2
        window.highScoreManager.recordBitcoinCollection();
        gameState.currentGameBitcoins++;
        
        // Create collection effect
        this.createCollectionEffect(bitcoin.x, bitcoin.y);
        
        // Create particle effects - Phase 3.3
        this.createBitcoinParticleEffect(bitcoin.x, bitcoin.y);
        
        // Chance to spawn power-up - Phase 3.2
        this.spawnPowerUp(bitcoin.x, bitcoin.y);
        
        // Check if all bitcoins collected
        if (this.bitcoins.countActive(true) === 0) {
            this.score += GAME_CONSTANTS.GAMEPLAY.COLLECTION_BONUS; // Bonus for collecting all
            this.updateScoreDisplay();
        }
    }

    createCollectionEffect(x, y) {
        // Get sprite from pool instead of creating new one - Phase 2.2
        const effect = this.spritePool.get();
        effect.setPosition(x, y);
        
        this.tweens.add({
            targets: effect,
            y: y - 50,
            alpha: 0,
            duration: GAME_CONSTANTS.ANIMATION.TWEEN_DURATION,
            onComplete: () => {
                // Release sprite back to pool instead of destroying - Phase 2.2
                this.spritePool.release(effect);
            }
        });
    }

    hitEnemy(player, enemy) {
        this.lives--;
        this.updateLivesDisplay();
        
        // Sound effect - Phase 3.1
        this.soundManager.playHitSound();
        
        // Haptic feedback for mobile - Phase 2.3
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(100); // Negative feedback vibration
        }
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Invincibility frames
            player.setTint(0xff0000);
            player.setAlpha(0.5);
            
            this.time.delayedCall(GAME_CONSTANTS.ANIMATION.INVINCIBILITY_DURATION, () => {
                player.clearTint();
                player.setAlpha(1);
            });
            
            // Reset player position
            player.setPosition(GAME_CONSTANTS.PLAYER.START_X, GAME_CONSTANTS.PLAYER.START_Y);
        }
    }

    // Power-up collection handler - Phase 3.2
    collectPowerUp(player, powerUp) {
        powerUp.collect(player);
    }

    // Spawn power-up with random chance - Phase 3.2
    spawnPowerUp(x, y) {
        if (Math.random() < GAME_CONSTANTS.POWERUP.SPAWN_CHANCE) {
            // For now, only double jump power-up
            const powerUp = new PowerUp(this, x, y, 'doubleJump');
            this.powerUps.add(powerUp);
        }
    }

    // Activate double jump power-up - Phase 3.2
    activateDoubleJump() {
        this.doubleJumpActive = true;
        this.doubleJumpUsed = false;
        
        // Create UI indicator
        this.createPowerUpIndicator('doubleJump');
        
        // Clear any existing timer
        if (this.powerUpTimer) {
            this.powerUpTimer.remove();
        }
        
        // Set expiration timer
        this.powerUpTimer = this.time.delayedCall(GAME_CONSTANTS.POWERUP.DURATION, () => {
            this.deactivateDoubleJump();
        });
    }

    // Deactivate double jump power-up - Phase 3.2
    deactivateDoubleJump() {
        this.doubleJumpActive = false;
        this.doubleJumpUsed = false;
        
        // Remove UI indicator
        if (this.powerUpIndicator) {
            this.powerUpIndicator.destroy();
            this.powerUpIndicator = null;
        }
        
        // Clear timer update event
        if (this.timerUpdateEvent) {
            this.timerUpdateEvent.remove();
            this.timerUpdateEvent = null;
        }
        
        // Clear timer
        if (this.powerUpTimer) {
            this.powerUpTimer.remove();
            this.powerUpTimer = null;
        }
    }

    // Create power-up UI indicator - Phase 3.2
    createPowerUpIndicator(type) {
        if (this.powerUpIndicator) {
            this.powerUpIndicator.destroy();
        }
        
        const x = GAME_CONSTANTS.SCREEN.WIDTH - 80;
        const y = 60;
        
        switch (type) {
            case 'doubleJump':
                // Create wing icon in top right
                this.powerUpIndicator = this.add.group();
                
                const bg = this.add.circle(x, y, 25, 0x000000, 0.5);
                const icon = this.add.text(x, y, '🪶', { fontSize: '24px' }).setOrigin(0.5);
                const timer = this.add.text(x, y + 35, '', { 
                    fontSize: '12px', 
                    fill: '#ffffff',
                    fontWeight: 'bold'
                }).setOrigin(0.5);
                
                this.powerUpIndicator.addMultiple([bg, icon, timer]);
                
                // Update timer display
                const updateTimer = () => {
                    if (this.powerUpTimer && timer.active) {
                        const remaining = Math.ceil((this.powerUpTimer.delay - this.powerUpTimer.elapsed) / 1000);
                        timer.setText(remaining + 's');
                        
                        if (remaining <= 3) {
                            icon.setTint(0xff0000); // Red warning
                        }
                    }
                };
                
                this.timerUpdateEvent = this.time.addEvent({
                    delay: 100,
                    callback: updateTimer,
                    loop: true
                });
                
                break;
        }
    }

    // Create power-up collection effect - Phase 3.2
    createPowerUpCollectionEffect(x, y, type) {
        const effectText = type === 'doubleJump' ? 'DOUBLE JUMP!' : 'POWER UP!';
        const color = type === 'doubleJump' ? '#00ff00' : '#ffff00';
        
        const effect = this.add.text(x, y, effectText, {
            fontSize: '20px',
            fill: color,
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Animation
        this.tweens.add({
            targets: effect,
            y: y - 80,
            alpha: 0,
            scale: 1.5,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
    }

        // Create double jump visual effect - Phase 3.2 Enhanced with particles 3.3
    createDoubleJumpEffect(x, y) {
        // Create burst effect with multiple particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 30;
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;
            
            const particle = this.add.circle(x, y, 3, 0x00ff00, 0.8);
            
            this.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                alpha: 0,
                scale: 0.5,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        
        // Enhanced particle effects for double jump - Phase 3.3
        if (this.particleManager && this.particleManager.bitcoinParticles) {
            // Create temporary green-tinted particles for double jump
            const tempEmitter = this.add.particles(x, y, 'bitcoin_particle', {
                scale: { start: 0.3, end: 0.1 },
                speed: { min: 80, max: 120 },
                lifespan: 400,
                gravityY: -100, // Upward gravity for jump effect
                tint: [0x00ff00, 0x00cc00, 0x00aa00],
                alpha: { start: 0.8, end: 0 },
                quantity: 6
            });
            
            // Clean up temporary emitter
            this.time.delayedCall(500, () => {
                tempEmitter.destroy();
            });
        }
        
        // Add wing-like effect
        const leftWing = this.add.ellipse(x - 15, y, 20, 10, 0xffffff, 0.6);
        const rightWing = this.add.ellipse(x + 15, y, 20, 10, 0xffffff, 0.6);
        
        this.tweens.add({
            targets: [leftWing, rightWing],
            scaleX: 1.5,
            scaleY: 0.3,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                leftWing.destroy();
                rightWing.destroy();
            }
        });
    }

    // Initialize particle system - Phase 3.3
    initializeParticleSystem() {
        // Create particle texture first
        if (!this.textures.exists('bitcoin_particle')) {
            this.createParticleTexture();
        }
        
        // Create particle manager object to handle different particle types
        this.particleManager = {
            bitcoinParticles: this.add.particles(0, 0, 'bitcoin_particle', {
                scale: { start: GAME_CONSTANTS.PARTICLES.PARTICLE_SIZE.start, end: GAME_CONSTANTS.PARTICLES.PARTICLE_SIZE.end },
                speed: { min: GAME_CONSTANTS.PARTICLES.PARTICLE_SPEED.min, max: GAME_CONSTANTS.PARTICLES.PARTICLE_SPEED.max },
                lifespan: GAME_CONSTANTS.PARTICLES.PARTICLE_LIFETIME,
                gravityY: GAME_CONSTANTS.PARTICLES.GRAVITY,
                bounce: GAME_CONSTANTS.PARTICLES.BOUNCE,
                tint: GAME_CONSTANTS.PARTICLES.BITCOIN_COLORS,
                alpha: { start: 1, end: 0 },
                frequency: -1 // Don't emit automatically
            })
        };
    }

    // Create particle texture - Phase 3.3
    createParticleTexture() {
        const graphics = this.add.graphics();
        const size = 8;
        
        // Create golden circle particle
        graphics.fillStyle(0xf7931a); // Bitcoin gold
        graphics.fillCircle(size/2, size/2, size/2);
        
        // Add inner glow
        graphics.fillStyle(0xffd700); // Lighter gold
        graphics.fillCircle(size/2, size/2, size/3);
        
        // Generate texture
        graphics.generateTexture('bitcoin_particle', size, size);
        graphics.destroy();
    }

    // Create bitcoin collection particle effect - Phase 3.3
    createBitcoinParticleEffect(x, y) {
        // Create burst of golden particles
        this.particleManager.bitcoinParticles.emitParticleAt(x, y, GAME_CONSTANTS.PARTICLES.BITCOIN_BURST_COUNT);
        
        // Add some extra sparkle particles
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const distance = 20 + Math.random() * 15;
            const sparkleX = x + Math.cos(angle) * distance;
            const sparkleY = y + Math.sin(angle) * distance;
            
            const sparkle = this.add.circle(sparkleX, sparkleY, 2, 0xffd700, 0.8);
            
            // Sparkle animation
            this.tweens.add({
                targets: sparkle,
                scaleX: 2,
                scaleY: 2,
                alpha: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    sparkle.destroy();
                }
            });
        }
        
        // Add golden ring explosion effect
        const ring = this.add.circle(x, y, 5, 0xf7931a, 0.6);
        ring.setStrokeStyle(3, 0xffd700, 0.8);
        
        this.tweens.add({
            targets: ring,
            scaleX: 4,
            scaleY: 4,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                ring.destroy();
            }
                 });
     }

    // Create power-up particle effect - Phase 3.3
    createPowerUpParticleEffect(x, y, type) {
        // Different particles for different power-up types
        const colors = type === 'doubleJump' ? [0x00ff00, 0x00cc00, 0x00aa00] : [0xffff00, 0xffcc00, 0xff9900];
        
        // Create enhanced burst effect
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const distance = 25 + Math.random() * 20;
            const particleX = x + Math.cos(angle) * (distance * 0.3);
            const particleY = y + Math.sin(angle) * (distance * 0.3);
            
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            const particle = this.add.circle(particleX, particleY, 3, color, 0.9);
            
            this.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                scaleX: 0.3,
                scaleY: 0.3,
                alpha: 0,
                duration: 600,
                delay: Math.random() * 100,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        
        // Add radiating energy waves
        for (let wave = 0; wave < 3; wave++) {
            setTimeout(() => {
                const energyRing = this.add.circle(x, y, 8, colors[0], 0.3);
                energyRing.setStrokeStyle(2, colors[1], 0.6);
                
                this.tweens.add({
                    targets: energyRing,
                    scaleX: 6,
                    scaleY: 6,
                    alpha: 0,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        energyRing.destroy();
                    }
                });
            }, wave * 150);
        }
    }

    reachGoal(player, flag) {
        // Prevent multiple triggers
        if (this.levelCompleting) {
            console.log('⚠️ Goal already completing, ignoring duplicate trigger');
            return;
        }

        console.log('🎯 Setting levelCompleting to true');
        this.levelCompleting = true;

        // Immediately stop player movement and physics to prevent further collisions
        if (this.player && this.player.body) {
            this.player.setVelocity(0, 0);
            this.player.body.enable = false; // Disable physics body
            console.log('🎯 Player physics disabled');
        }

        // Pause the update loop to prevent any further processing
        this.physics.pause();
        console.log('🎯 Physics paused');

        try {
            console.log('🎯 GOAL REACHED! Level:', this.level, 'Next level:', this.level + 1);
            
            // Immediate visual feedback
            this.add.text(player.x, player.y - 50, 'LEVEL COMPLETE!', {
                fontSize: '24px',
                fill: '#00ff00',
                fontFamily: 'Arial, sans-serif',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            
            // Victory sound effect - Phase 3.1
            this.soundManager.playVictorySound();
            
            // Clean up power-ups - Phase 3.2
            this.deactivateDoubleJump();
            this.powerUps.clear(true, true);
            
            // Clean up particle system - Phase 3.3
            if (this.particleManager) {
                Object.values(this.particleManager).forEach(emitter => {
                    if (emitter && emitter.destroy) {
                        emitter.destroy();
                    }
                });
                this.particleManager = null;
            }
            
            // Since this is a single-level game, always go to victory screen
            // Add a brief delay before transitioning to victory screen
            this.time.delayedCall(1500, () => {
                try {
                    const summary = this.finalizeRun(true, 1);
                    this.scene.start('VictoryScene', {
                        score: this.score,
                        level: summary.finalLevel,
                        completionTime: summary.completionTime,
                        bitcoinsCollected: summary.bitcoinsCollected,
                        livesRemaining: summary.livesRemaining,
                        highScoreResult: summary.highScoreResult
                    });
                } catch (victoryError) {
                    console.error('Error starting VictoryScene:', victoryError);
                    console.error('Falling back to title screen...');
                    this.scene.start('TitleScene');
                }
            });
        } catch (error) {
            console.error('Critical error in reachGoal:', error);
            console.error('Returning to title screen...');
            this.scene.start('TitleScene');
        }
    }

    gameOver() {
        try {
            // Game over sound effect - Phase 3.1
            this.soundManager.playGameOverSound();
            
            // Clean up power-ups - Phase 3.2
            this.deactivateDoubleJump();
            if (this.powerUps) {
                this.powerUps.clear(true, true);
            }
            
            // Clean up particle system - Phase 3.3
            if (this.particleManager) {
                Object.values(this.particleManager).forEach(emitter => {
                    if (emitter && emitter.destroy) {
                        emitter.destroy();
                    }
                });
                this.particleManager = null;
            }
            
            // Update high score
            if (this.score > gameState.highScore) {
                gameState.highScore = this.score;
                localStorage.setItem('bitcoinAdventureHighScore', this.score.toString());
            }
            
            try {
                const summary = this.finalizeRun(false);
                this.scene.start('GameOverScene', {
                    score: this.score,
                    level: summary.finalLevel,
                    completionTime: summary.completionTime,
                    bitcoinsCollected: summary.bitcoinsCollected,
                    livesRemaining: summary.livesRemaining,
                    highScoreResult: summary.highScoreResult
                });
            } catch (gameOverError) {
                console.error('Error starting GameOverScene:', gameOverError);
                console.error('Falling back to title screen...');
                this.scene.start('TitleScene');
            }
        } catch (error) {
            console.error('Critical error in gameOver:', error);
            console.error('Returning to title screen...');
            try {
                this.scene.start('TitleScene');
            } catch (titleError) {
                console.error('Failed to return to title screen:', titleError);
                // Ultimate fallback - reload the page
                window.location.reload();
            }
        }
    }

    togglePause() {
        if (gameState.isPaused) {
            this.scene.resume();
            gameState.isPaused = false;
        } else {
            this.scene.pause();
            gameState.isPaused = true;
        }
    }

    updateScoreDisplay() {
        this.scoreText.setText('SATS: ' + this.score);
        gameState.score = this.score;
    }

    updateLivesDisplay() {
        this.livesText.setText('Lives: ' + this.lives);
        gameState.lives = this.lives;
    }

    finalizeRun(isVictory, finalLevelOverride = null) {
        if (this.runSummarySubmitted && this.lastRunSummary) {
            return this.lastRunSummary;
        }

        const completionTime = gameState.gameStartTime ? Date.now() - gameState.gameStartTime : null;
        const bitcoinsCollected = typeof gameState.currentGameBitcoins === 'number'
            ? gameState.currentGameBitcoins
            : 0;
        const livesRemaining = Math.max(this.lives, 0);
        const finalLevel = finalLevelOverride !== null
            ? finalLevelOverride
            : Math.max(1, Math.min(this.level, GAME_CONSTANTS.LEVELS.TOTAL_LEVELS));

        let highScoreResult = null;
        try {
            highScoreResult = window.highScoreManager.addHighScore(
                this.score,
                finalLevel,
                completionTime,
                bitcoinsCollected,
                livesRemaining
            );

            const latestStats = window.highScoreManager.getStats();
            if (latestStats && typeof latestStats.topScore === 'number') {
                gameState.highScore = latestStats.topScore;
                setHighScore(latestStats.topScore);
            }
        } catch (error) {
            console.error('Failed to record high score:', error);
        }

        const summary = {
            completionTime,
            bitcoinsCollected,
            livesRemaining,
            finalLevel,
            highScoreResult: highScoreResult || null
        };

        gameState.score = this.score;
        gameState.lives = livesRemaining;
        gameState.level = finalLevel;
        gameState.currentGameBitcoins = bitcoinsCollected;

        this.runSummarySubmitted = true;
        this.lastRunSummary = summary;

        return summary;
    }

    update() {
        // Debug: Confirm update loop is running
        if (Math.random() < 0.001) { // Only log occasionally to avoid spam
            console.log('🔄 Update loop running, player X:', Math.round(this.player?.x || 0));
        }
        
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
        const selectedCharacter = gameState.selectedCharacter;
        
        if (leftPressed) {
            this.player.setVelocityX(-GAME_CONSTANTS.PLAYER.SPEED);
            this.playerFacingRight = false;
            
            // Use appropriate walk animation
            if (selectedCharacter === 'player2') {
                this.player.play('player2_walk_left', true);
                this.player.setFlipX(false); // Don't flip, use left-facing frames
                console.log('🎬 Playing Player 2 walk left animation');
            } else {
                this.player.play('player_walk', true);
                this.player.setFlipX(true);
            }
        } else if (rightPressed) {
            this.player.setVelocityX(GAME_CONSTANTS.PLAYER.SPEED);
            this.playerFacingRight = true;
            
            // Use appropriate walk animation
            if (selectedCharacter === 'player2') {
                this.player.play('player2_walk_right', true);
                this.player.setFlipX(false); // Don't flip, use right-facing frames
            } else {
                this.player.play('player_walk', true);
                this.player.setFlipX(false);
            }
        } else {
            this.player.setVelocityX(0);
            
                         // Use appropriate idle animation (only if not jumping)
             if (this.player.body.touching.down) {
                if (selectedCharacter === 'player2') {
                    console.log('🎬 Playing Player 2 idle animation');
                    this.player.play('player2_idle', true);
                } else {
                    this.player.play('player_idle', true);
                }
             }
        }
        
        // Enhanced jumping mechanics with double jump support - Phase 3.2
        if (jumpPressed && this.canJump) {
            // Regular jump when on ground
            if (this.player.body.touching.down) {
                this.player.setVelocityY(this.jumpForce);
                this.canJump = false;
                this.jumpTimer = this.time.now + 200; // Prevent double jumping for 200ms
                
                // Play jump animation for Player 2 character
                if (selectedCharacter === 'player2') {
                    // Use static jump frame if not moving, directional if moving
                    const isMoving = Math.abs(this.player.body.velocity.x) > 10;
                    if (isMoving) {
                        const jumpAnim = this.playerFacingRight ? 'player2_jump_right' : 'player2_jump_left';
                        this.player.play(jumpAnim, true);
                        console.log('🎬 Playing directional jump:', jumpAnim);
                    } else {
                        this.player.play('player2_jump', true);
                        console.log('🎬 Playing static jump');
                    }
                }
                
                // Sound effect - Phase 3.1 with immediate activation
                console.log('🚀 About to play jump sound - audio context state:', this.soundManager.audioContext ? this.soundManager.audioContext.state : 'No context');
                this.soundManager.forceResumeAudio(); // Ensure audio context is active
                this.soundManager.playJumpSound();
                
                // Haptic feedback for mobile jump - Phase 2.3
                if (this.isMobile && navigator.vibrate) {
                    navigator.vibrate(30); // Subtle jump feedback
                }
                
                // Record jump for achievements - Phase 4.2
                window.highScoreManager.recordJump(false);
            }
            // Double jump when in air (if power-up is active)
            else if (this.doubleJumpActive && !this.doubleJumpUsed && 
                     this.player.body.velocity.y > 0 && // Only when falling
                     this.time.now > this.jumpTimer) {
                     
                // Preserve and boost horizontal momentum for better distance coverage
                const currentHorizontalVelocity = this.player.body.velocity.x;
                let horizontalBoost = 0;
                
                // Add horizontal boost based on movement direction
                if (leftPressed) {
                    horizontalBoost = -50; // Boost left movement
                } else if (rightPressed) {
                    horizontalBoost = 50; // Boost right movement
                } else if (Math.abs(currentHorizontalVelocity) > 10) {
                    // Maintain current direction if moving
                    horizontalBoost = currentHorizontalVelocity > 0 ? 30 : -30;
                }
                
                // Apply double jump with enhanced horizontal movement
                this.player.setVelocityY(this.jumpForce * 0.8); // Slightly weaker double jump
                
                // Enhance horizontal velocity for better distance coverage
                if (horizontalBoost !== 0) {
                    const newHorizontalVelocity = Math.max(-200, Math.min(200, currentHorizontalVelocity + horizontalBoost));
                    this.player.setVelocityX(newHorizontalVelocity);
                }
                
                this.doubleJumpUsed = true;
                this.canJump = false;
                this.jumpTimer = this.time.now + 200;
                
                // Play directional jump animation for Player 2 character (double jump)
                if (selectedCharacter === 'player2') {
                    const jumpAnim = this.playerFacingRight ? 'player2_jump_right' : 'player2_jump_left';
                    this.player.play(jumpAnim, true);
                }
                
                // Enhanced sound and effects for double jump
                console.log('🚀 About to play double jump sound - audio context state:', this.soundManager.audioContext ? this.soundManager.audioContext.state : 'No context');
                this.soundManager.forceResumeAudio(); // Ensure audio context is active
                this.soundManager.playJumpSound();
                
                // Create double jump visual effect
                this.createDoubleJumpEffect(this.player.x, this.player.y);
                
                // Haptic feedback for mobile double jump
                if (this.isMobile && navigator.vibrate) {
                    navigator.vibrate([30, 30, 30]); // Triple vibration for double jump
                }
            }
        }
        
        // Reset jump ability when touching ground
        if (this.player.body.touching.down && this.time.now > this.jumpTimer) {
            this.canJump = true;
            this.doubleJumpUsed = false; // Reset double jump when landing
            
            // Return to appropriate animation when landing
            if (selectedCharacter === 'player2') {
                if (Math.abs(this.player.body.velocity.x) > 10) {
                    // Use appropriate directional walk animation
                    const walkAnim = this.playerFacingRight ? 'player2_walk_right' : 'player2_walk_left';
                    this.player.play(walkAnim, true);
                } else {
                    this.player.play('player2_idle', true);
                }
            } else {
                if (Math.abs(this.player.body.velocity.x) > 10) {
                    this.player.play('player_walk', true);
                } else {
                    this.player.play('player_idle', true);
                }
            }
        }
        
        // Pause toggle
        if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
            this.togglePause();
        }
        
        // Simplified enemy movement logic - Phase 1.1 implementation
        this.enemies.children.entries.forEach(enemy => {
            this.updateEnemyMovement(enemy);
        });
        
        // Double jump power-up visual feedback - Phase 3.3
        if (this.doubleJumpActive && this.particleManager && Math.random() < 0.3) {
            // Create subtle trail particles when double jump is active
            const trailParticle = this.add.circle(
                this.player.x + (Math.random() - 0.5) * 20, 
                this.player.y + (Math.random() - 0.5) * 20, 
                1, 
                0x00ff00, 
                0.6
            );
            
            this.tweens.add({
                targets: trailParticle,
                alpha: 0,
                scaleX: 2,
                scaleY: 2,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    trailParticle.destroy();
                }
            });
        }
        
        // Update parallax background scrolling
        this.updateParallaxBackground();

        // Detect pit falls when the player drops below the floor in a gap
        if (this.player && !this.levelCompleting && !this.playerRespawning) {
            const belowWorld = this.player.y > GAME_CONSTANTS.WORLD.HEIGHT + 20;
            const fellIntoGap = this.player.y > 560 && this.isPositionInGroundGap(this.player.x);
            if (belowWorld || fellIntoGap) {
                this.handlePitFall();
            }
        }

        // UNIVERSAL GOAL DETECTION - Works for ALL levels
        if (this.player && !this.levelCompleting) {
            // Fixed goal position for all levels
            const goalX = 3850;
            const goalY = 500;
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, goalX, goalY);
            
            // Aggressive goal detection - larger trigger area
            if (this.player.x > 3700) { // Player is in the goal area
                // Log every 30 frames (twice per second) for better debugging
                if (!this.debugFrameCounter) this.debugFrameCounter = 0;
                this.debugFrameCounter++;
                
                if (this.debugFrameCounter % 30 === 0) {
                    console.log(`🎯 LEVEL ${this.level} GOAL CHECK:`);
                    console.log(`   Player: X=${Math.round(this.player.x)}, Y=${Math.round(this.player.y)}`);
                    console.log(`   Distance: ${Math.round(distance)} pixels`);
                    console.log(`   levelCompleting: ${this.levelCompleting}`);
                    console.log(`   Will trigger: ${distance < 120 ? 'YES' : 'NO'}`);
                }
            }
            
            // Increased trigger range to 120 pixels for more reliable detection
            if (distance < 120) {
                console.log(`🚀 GOAL TRIGGERED! Level ${this.level}, Distance: ${Math.round(distance)}`);
                this.reachGoal(this.player, this.goalFlag);
            }
        }
    }

    isPositionInGroundGap(x) {
        if (!this.groundGaps || this.groundGaps.length === 0) {
            return false;
        }
        return this.groundGaps.some(gap => x >= gap.start && x <= gap.end);
    }

    handlePitFall() {
        if (this.playerRespawning || this.levelCompleting) {
            return;
        }

        this.playerRespawning = true;
        this.soundManager.playHitSound();
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate([80, 60, 80]);
        }

        this.lives--;
        this.updateLivesDisplay();

        if (this.lives <= 0) {
            this.gameOver();
            return;
        }

        this.player.setVelocity(0, 0);
        this.player.setAlpha(0);
        this.player.setPosition(GAME_CONSTANTS.PLAYER.START_X, GAME_CONSTANTS.PLAYER.START_Y);
        this.canJump = true;
        this.doubleJumpUsed = false;

        this.time.delayedCall(300, () => {
            this.player.setAlpha(1);
            this.playerRespawning = false;
        });
    }

    // Simple, robust enemy movement - No conflicts
    updateEnemyMovement(enemy) {
        // Initialize cooldown tracking
        if (!enemy.lastDirectionChange) {
            enemy.lastDirectionChange = 0;
        }
        
        const currentTime = this.time.now;
        const canChangeDirection = (currentTime - enemy.lastDirectionChange > 500); // Longer cooldown for stability
        
        // Force movement if enemy is stuck (no velocity)
        if (Math.abs(enemy.body.velocity.x) < 10) {
            const direction = Math.random() > 0.5 ? 1 : -1;
            enemy.setVelocityX(direction * GAME_CONSTANTS.ENEMY.SPEED);
            enemy.lastDirectionChange = currentTime;
            return;
        }
        
        // Simple patrol boundary system - works for all enemies
        if (enemy.patrolMin && enemy.patrolMax && canChangeDirection) {
            // Turn around at patrol boundaries
            if (enemy.x <= enemy.patrolMin + 10 && enemy.body.velocity.x < 0) {
                enemy.setVelocityX(GAME_CONSTANTS.ENEMY.SPEED); // Go right
                enemy.lastDirectionChange = currentTime;
            } else if (enemy.x >= enemy.patrolMax - 10 && enemy.body.velocity.x > 0) {
                enemy.setVelocityX(-GAME_CONSTANTS.ENEMY.SPEED); // Go left
                enemy.lastDirectionChange = currentTime;
            }
        }
        
        // World boundary safety
        if (enemy.x < 50) {
            enemy.setVelocityX(GAME_CONSTANTS.ENEMY.SPEED);
            enemy.x = 60; // Push away from edge
        } else if (enemy.x > GAME_CONSTANTS.WORLD.WIDTH - 50) {
            enemy.setVelocityX(-GAME_CONSTANTS.ENEMY.SPEED);
            enemy.x = GAME_CONSTANTS.WORLD.WIDTH - 60; // Push away from edge
        }
        
        // Ensure consistent speed
        if (enemy.body.velocity.x > 0 && enemy.body.velocity.x < 80) {
            enemy.setVelocityX(GAME_CONSTANTS.ENEMY.SPEED);
        } else if (enemy.body.velocity.x < 0 && enemy.body.velocity.x > -80) {
            enemy.setVelocityX(-GAME_CONSTANTS.ENEMY.SPEED);
        }
        
        // Visual feedback (sprite flipping)
        if (enemy.body.velocity.x > 0) {
            enemy.setFlipX(false);
            enemy.play('enemy_move_right', true);
        } else if (enemy.body.velocity.x < 0) {
            enemy.setFlipX(false);
            enemy.play('enemy_move_left', true);
        }
    }

    updateParallaxBackground() {
        // With setScrollFactor in place, we don't need to manually update the position
        // The engine will handle the parallax effect automatically
    }

    // Achievement notification system - Phase 4.2
    showAchievementNotification(achievement) {
        // Create achievement popup
        const popup = this.add.group();
        
        // Background
        const bg = this.add.rectangle(400, 100, 350, 80, 0x000000, 0.8);
        bg.setStrokeStyle(3, 0xffd700);
        
        // Achievement icon
        const icon = this.add.text(320, 100, '🏆', { fontSize: '24px' }).setOrigin(0.5);
        
        // Achievement text
        const title = this.add.text(400, 85, 'ACHIEVEMENT UNLOCKED!', {
            fontSize: '14px',
            fill: '#ffd700',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const name = this.add.text(400, 105, achievement.name, {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const desc = this.add.text(400, 120, achievement.description, {
            fontSize: '12px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        popup.addMultiple([bg, icon, title, name, desc]);
        
        // Animation
        popup.setAlpha(0);
        this.tweens.add({
            targets: popup.children.entries,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
        
        // Auto-hide after 3 seconds
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: popup.children.entries,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    popup.destroy();
                }
            });
        });
        
        // Play achievement sound
        this.soundManager.playVictorySound();
    }
}
