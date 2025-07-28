// Bitcoin Adventure - Optimized Standalone Web Game
// Clean architecture with essential features only

// Game Constants - Phase 2.1: Extract Magic Numbers to Constants
const GAME_CONSTANTS = {
    // World dimensions
    WORLD: {
        WIDTH: 4000,
        HEIGHT: 600
    },
    
    // Screen dimensions
    SCREEN: {
        WIDTH: 800,
        HEIGHT: 600
    },
    
    // Player properties
    PLAYER: {
        SCALE: 0.12,
        SPEED: 160,
        JUMP_FORCE: -500,
        BOUNCE: 0.1,
        MAX_VELOCITY_X: 200,
        MAX_VELOCITY_Y: 600,
        START_X: 100,
        START_Y: 530,
        DEMO_SCALE: 0.15
    },
    
    // Bitcoin properties  
    BITCOIN: {
        SCALE: 0.06,
        POINTS: 10
    },
    
    // Enemy properties
    ENEMY: {
        SCALE: 1.7,
        SPEED: 100,
        BOUNCE: 0.1,
        MAX_VELOCITY_X: 120,
        MAX_VELOCITY_Y: 600
    },
    
    // Physics settings
    PHYSICS: {
        GRAVITY: 800,
        BOUNCE: 0.1
    },
    
    // Gameplay values
    GAMEPLAY: {
        INITIAL_LIVES: 3,
        COLLECTION_BONUS: 100
    },
    
    // Platform settings
    PLATFORM: {
        TEXTURE_WIDTH: 100,
        TEXTURE_HEIGHT: 32
    },
    
    // Animation and timing
    ANIMATION: {
        TWEEN_DURATION: 1000,
        INVINCIBILITY_DURATION: 1000
    },
    
    // UI scaling
    UI: {
        BUTTON_HOVER_SCALE: 1.1,
        BUTTON_NORMAL_SCALE: 1
    },
    
    // Power-up properties - Phase 3.2
    POWERUP: {
        SCALE: 0.08,
        DURATION: 10000, // 10 seconds
        SPAWN_CHANCE: 0.3, // 30% chance per bitcoin collected
        DOUBLE_JUMP_COLOR: 0x00ff00, // Green glow
        COLLECTION_POINTS: 25,
        PULSE_SPEED: 2000 // Pulsing animation speed
    },
    
    // Particle effects - Phase 3.3
    PARTICLES: {
        BITCOIN_BURST_COUNT: 12, // Number of particles per bitcoin collection
        BITCOIN_COLORS: [0xf7931a, 0xffd700, 0xffcc00, 0xff9900], // Bitcoin gold variants
        PARTICLE_LIFETIME: 800, // Milliseconds
        PARTICLE_SPEED: { min: 50, max: 150 },
        PARTICLE_SIZE: { start: 4, end: 1 },
        GRAVITY: 200,
        BOUNCE: 0.3
    }
};

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_CONSTANTS.SCREEN.WIDTH,
    height: GAME_CONSTANTS.SCREEN.HEIGHT,
    backgroundColor: '#2d2d2d',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 320,
            height: 240
        },
        max: {
            width: GAME_CONSTANTS.SCREEN.WIDTH * 2,
            height: GAME_CONSTANTS.SCREEN.HEIGHT * 2
        },
        fullscreenTarget: 'game'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GAME_CONSTANTS.PHYSICS.GRAVITY }, // Increased gravity for more realistic physics
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

// Enhanced High Score & Achievement System - Phase 4.2
class HighScoreManager {
    constructor() {
        this.storageKey = 'bitcoinAdventureData';
        this.data = this.loadData();
    }
    
    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                // Ensure all required properties exist
                return {
                    highScores: data.highScores || [],
                    totalGamesPlayed: data.totalGamesPlayed || 0,
                    totalBitcoinsCollected: data.totalBitcoinsCollected || 0,
                    totalJumps: data.totalJumps || 0,
                    totalDoubleJumps: data.totalDoubleJumps || 0,
                    totalPowerUpsCollected: data.totalPowerUpsCollected || 0,
                    achievements: data.achievements || [],
                    bestCompletionTime: data.bestCompletionTime || null,
                    perfectLevels: data.perfectLevels || [],
                    lastPlayed: data.lastPlayed || Date.now(),
                    ...data
                };
            }
        } catch (error) {
            console.warn('Error loading high score data:', error);
        }
        
        // Default data structure
        return {
            highScores: [],
            totalGamesPlayed: 0,
            totalBitcoinsCollected: 0,
            totalJumps: 0,
            totalDoubleJumps: 0,
            totalPowerUpsCollected: 0,
            achievements: [],
            bestCompletionTime: null,
            perfectLevels: [],
            lastPlayed: Date.now()
        };
    }
    
    saveData() {
        try {
            this.data.lastPlayed = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            console.log('📊 High score data saved');
        } catch (error) {
            console.error('Error saving high score data:', error);
        }
    }
    
    addHighScore(score, level, completionTime, bitcoinsCollected, livesRemaining) {
        const scoreEntry = {
            score,
            level,
            completionTime,
            bitcoinsCollected,
            livesRemaining,
            date: new Date().toISOString(),
            perfect: livesRemaining === GAME_CONSTANTS.GAMEPLAY.INITIAL_LIVES
        };
        
        this.data.highScores.push(scoreEntry);
        this.data.highScores.sort((a, b) => b.score - a.score);
        this.data.highScores = this.data.highScores.slice(0, 10); // Keep top 10
        
        // Update best completion time
        if (!this.data.bestCompletionTime || completionTime < this.data.bestCompletionTime) {
            this.data.bestCompletionTime = completionTime;
        }
        
        this.data.totalGamesPlayed++;
        this.saveData();
        
        // Check for new achievements
        const newAchievements = this.checkAchievements(scoreEntry);
        
        return {
            rank: this.getScoreRank(score),
            newAchievements
        };
    }
    
    getScoreRank(score) {
        const rank = this.data.highScores.findIndex(entry => entry.score === score) + 1;
        return rank <= 10 ? rank : null;
    }
    
    recordBitcoinCollection() {
        this.data.totalBitcoinsCollected++;
    }
    
    recordJump(isDoubleJump = false) {
        this.data.totalJumps++;
        if (isDoubleJump) {
            this.data.totalDoubleJumps++;
        }
    }
    
    recordPowerUpCollection() {
        this.data.totalPowerUpsCollected++;
    }
    
    checkAchievements(scoreEntry) {
        const newAchievements = [];
        
        // First win
        if (this.data.totalGamesPlayed === 1 && !this.hasAchievement('first_win')) {
            newAchievements.push({
                id: 'first_win',
                name: 'First Victory',
                description: 'Complete your first game',
                date: new Date().toISOString()
            });
        }
        
        // Perfect game
        if (scoreEntry.perfect && !this.hasAchievement('perfect_game')) {
            newAchievements.push({
                id: 'perfect_game',
                name: 'Flawless Victory',
                description: 'Complete the game without losing a life',
                date: new Date().toISOString()
            });
        }
        
        // High score milestones
        const scoreMilestones = [
            { threshold: 500, id: 'score_500', name: 'Rising Star', description: 'Score 500 points' },
            { threshold: 1000, id: 'score_1000', name: 'Bitcoin Master', description: 'Score 1000 points' },
            { threshold: 1500, id: 'score_1500', name: 'Crypto Legend', description: 'Score 1500 points' }
        ];
        
        scoreMilestones.forEach(milestone => {
            if (scoreEntry.score >= milestone.threshold && !this.hasAchievement(milestone.id)) {
                newAchievements.push({
                    id: milestone.id,
                    name: milestone.name,
                    description: milestone.description,
                    date: new Date().toISOString()
                });
            }
        });
        
        // Collection milestones
        const collectionMilestones = [
            { threshold: 50, id: 'collect_50', name: 'Collector', description: 'Collect 50 bitcoins total' },
            { threshold: 100, id: 'collect_100', name: 'Hoarder', description: 'Collect 100 bitcoins total' },
            { threshold: 200, id: 'collect_200', name: 'Bitcoin Whale', description: 'Collect 200 bitcoins total' }
        ];
        
        collectionMilestones.forEach(milestone => {
            if (this.data.totalBitcoinsCollected >= milestone.threshold && !this.hasAchievement(milestone.id)) {
                newAchievements.push({
                    id: milestone.id,
                    name: milestone.name,
                    description: milestone.description,
                    date: new Date().toISOString()
                });
            }
        });
        
        // Add new achievements
        newAchievements.forEach(achievement => {
            this.data.achievements.push(achievement);
            console.log('🏆 New achievement unlocked:', achievement.name);
        });
        
        if (newAchievements.length > 0) {
            this.saveData();
        }
        
        return newAchievements;
    }
    
    hasAchievement(id) {
        return this.data.achievements.some(achievement => achievement.id === id);
    }
    
    getHighScores() {
        return this.data.highScores;
    }
    
    getStats() {
        return {
            gamesPlayed: this.data.totalGamesPlayed,
            bitcoinsCollected: this.data.totalBitcoinsCollected,
            totalJumps: this.data.totalJumps,
            doubleJumps: this.data.totalDoubleJumps,
            powerUpsCollected: this.data.totalPowerUpsCollected,
            achievements: this.data.achievements.length,
            bestTime: this.data.bestCompletionTime,
            topScore: this.data.highScores[0]?.score || 0
        };
    }
}

// Global game state management with enhanced scoring
window.highScoreManager = new HighScoreManager();

window.gameState = {
    isPaused: false,
    score: 0,
    level: 1,
    lives: GAME_CONSTANTS.GAMEPLAY.INITIAL_LIVES,
    soundEnabled: true,
    highScore: window.highScoreManager.getStats().topScore,
    currentScene: 'title',
    gameStartTime: null,
    currentGameBitcoins: 0,
    selectedCharacter: 'andy' // Add character selection: 'andy' or 'female'
};

// Power-up System - Phase 3.2
class PowerUp extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type) {
        // Create a temporary texture for the power-up if it doesn't exist
        if (!scene.textures.exists('powerup_' + type)) {
            scene.createPowerUpTexture(type);
        }
        
        super(scene, x, y, 'powerup_' + type);
        
        this.scene = scene;
        this.powerType = type;
        this.isCollected = false;
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set properties
        this.setScale(GAME_CONSTANTS.POWERUP.SCALE);
        this.body.setSize(this.width * 0.8, this.height * 0.8); // Slightly smaller hitbox
        
        // Visual effects
        this.createVisualEffects();
        
        // Auto-expire after some time
        scene.time.delayedCall(30000, () => {
            if (!this.isCollected) {
                this.destroy();
            }
        });
    }
    
    createVisualEffects() {
        // Pulsing glow effect
        this.scene.tweens.add({
            targets: this,
            scaleX: GAME_CONSTANTS.POWERUP.SCALE * 1.2,
            scaleY: GAME_CONSTANTS.POWERUP.SCALE * 1.2,
            duration: GAME_CONSTANTS.POWERUP.PULSE_SPEED / 2,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Floating animation
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: GAME_CONSTANTS.POWERUP.PULSE_SPEED,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Color tint based on power-up type
        if (this.powerType === 'doubleJump') {
            this.setTint(GAME_CONSTANTS.POWERUP.DOUBLE_JUMP_COLOR);
        }
    }
    
    collect(player) {
        if (this.isCollected) return;
        
        this.isCollected = true;
        
        // Apply power-up effect based on type
        switch (this.powerType) {
            case 'doubleJump':
                this.scene.activateDoubleJump();
                break;
        }
        
        // Visual collection effect
        this.scene.createPowerUpCollectionEffect(this.x, this.y, this.powerType);
        
        // Particle effects - Phase 3.3
        this.scene.createPowerUpParticleEffect(this.x, this.y, this.powerType);
        
        // Special power-up sound effect - Phase 3.2
        this.scene.soundManager.forceResumeAudio(); // Ensure audio context is active
        this.scene.soundManager.playPowerUpSound();
        
        // Points
        this.scene.score += GAME_CONSTANTS.POWERUP.COLLECTION_POINTS;
        this.scene.updateScoreDisplay();
        
        // Remove the power-up
        this.destroy();
    }
}

// Enhanced Sound Manager with Background Music - Phase 3.1 + Background Music
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.musicVolume = 0.08; // Reduced background music volume
        this.enabled = true;
        this.musicEnabled = true;
        this.backgroundMusic = null;
        this.musicGainNode = null;
        this.currentMusicUrl = null;
        this.init();
    }
    
    init() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Handle browser autoplay policy - more aggressive approach
            const resumeAudio = () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume().then(() => {
                        console.log('Audio context resumed successfully');
                    }).catch(err => {
                        console.warn('Failed to resume audio context:', err);
                    });
                }
                // Remove listeners after first successful interaction
                document.removeEventListener('click', resumeAudio);
                document.removeEventListener('keydown', resumeAudio);
                document.removeEventListener('touchstart', resumeAudio);
            };
            
            // Add multiple event listeners for better mobile support
            document.addEventListener('click', resumeAudio);
            document.addEventListener('keydown', resumeAudio);
            document.addEventListener('touchstart', resumeAudio);
            
            // Try to resume immediately if possible
            if (this.audioContext.state === 'suspended') {
                console.log('Audio context suspended, waiting for user interaction...');
            } else {
                console.log('Audio context ready:', this.audioContext.state);
            }
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }
    
    // Generate coin collection sound
    playCollectSound() {
        if (!this.enabled || !this.audioContext) {
            console.warn('🔇 Sound disabled or no audio context');
            return;
        }
        
        // Force audio context to resume before playing
        this.forceResumeAudio();
        
        // Add a small delay to ensure audio context is active
        setTimeout(() => {
            if (this.audioContext.state !== 'running') {
                console.warn('🔇 Audio context not running for collect sound:', this.audioContext.state);
                return;
            }
            
            try {
                console.log('🪙 Playing collect sound');
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
        
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                // Rising tone for positive feedback
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.15);
            } catch (error) {
                console.error('❌ Error playing collect sound:', error);
            }
        }, 10); // Minimal delay to ensure audio context is ready
    }
    
    // Generate enemy hit sound
    playHitSound() {
        if (!this.enabled || !this.audioContext) {
            console.warn('🔇 Hit sound disabled or no audio context');
            return;
        }
        
        // Force audio context to resume before playing
        this.forceResumeAudio();
        
        setTimeout(() => {
            if (this.audioContext.state !== 'running') {
                console.warn('🔇 Audio context not running for hit sound:', this.audioContext.state);
                return;
            }
            
            try {
                console.log('💥 Playing hit sound');
        
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                // Harsh descending tone for negative feedback
                oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
                oscillator.type = 'sawtooth';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.25);
            } catch (error) {
                console.error('❌ Error playing hit sound:', error);
            }
        }, 10); // Minimal delay to ensure audio context is ready
    }
    
    // Generate jump sound
    playJumpSound() {
        if (!this.enabled || !this.audioContext) {
            console.warn('🔇 Jump sound disabled or no audio context');
            return;
        }
        
        // Force audio context to resume before playing
        this.forceResumeAudio();
        
        setTimeout(() => {
            if (this.audioContext.state !== 'running') {
                console.warn('🔇 Audio context not running for jump sound:', this.audioContext.state);
                return;
            }
            
            try {
                console.log('🚀 Playing jump sound');
        
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                // Quick rising tone for jump
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
                oscillator.type = 'triangle';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.12);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.12);
            } catch (error) {
                console.error('❌ Error playing jump sound:', error);
            }
        }, 10); // Minimal delay to ensure audio context is ready
    }
    
    // Generate victory sound
    playVictorySound() {
        if (!this.enabled || !this.audioContext) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
            }, index * 150);
        });
    }
    
    // Generate game over sound
    playGameOverSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Descending dramatic tone
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.6);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.6);
    }
    
    // Generate UI click sound
    playUIClickSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Quick pop sound for UI feedback
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.05);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.15, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.08);
    }
    
    // Generate power-up collection sound - Phase 3.2
    playPowerUpSound() {
        if (!this.enabled || !this.audioContext) {
            console.warn('🔇 Power-up sound disabled or no audio context');
            return;
        }
        
        // Force audio context to resume before playing
        this.forceResumeAudio();
        
        setTimeout(() => {
            if (this.audioContext.state !== 'running') {
                console.warn('🔇 Audio context not running for power-up sound:', this.audioContext.state);
                return;
            }
            
            try {
                console.log('⭐ Playing power-up sound');
        
                // Create a magical ascending arpeggio
                const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
                notes.forEach((freq, index) => {
                    setTimeout(() => {
                        const oscillator = this.audioContext.createOscillator();
                        const gainNode = this.audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(this.audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                        oscillator.type = 'triangle';
                        
                        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.25, this.audioContext.currentTime + 0.01);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
                        
                        oscillator.start(this.audioContext.currentTime);
                        oscillator.stop(this.audioContext.currentTime + 0.2);
                    }, index * 50);
                });
            } catch (error) {
                console.error('❌ Error playing power-up sound:', error);
            }
        }, 10); // Minimal delay to ensure audio context is ready
    }
    
    // Force resume audio context - Phase 3.1 fix
    forceResumeAudio() {
        if (this.audioContext) {
            if (this.audioContext.state === 'suspended') {
                console.log('Attempting to resume suspended audio context...');
                this.audioContext.resume().then(() => {
                    console.log('✅ Audio context manually resumed');
                }).catch(err => {
                    console.warn('❌ Failed to manually resume audio context:', err);
                });
            } else if (this.audioContext.state === 'running') {
                console.log('✅ Audio context already running');
            } else {
                console.log('Audio context state:', this.audioContext.state);
            }
        } else {
            console.warn('❌ No audio context available');
        }
    }
    
    // Load and play background music
    async loadBackgroundMusic(url) {
        if (!this.enabled) {
            console.warn('Cannot load background music: audio system disabled');
            return;
        }

        try {
            // Stop current music if playing
            this.stopBackgroundMusic();
            
            console.log('🎵 Loading background music:', url);
            this.currentMusicUrl = url;
            
            // Create audio element for background music (easier than Web Audio for files)
            this.backgroundMusic = new Audio(url);
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = this.musicVolume;
            this.backgroundMusic.preload = 'auto';
            
            // Return a promise that resolves when the music is ready
            return new Promise((resolve, reject) => {
                // Handle loading events
                this.backgroundMusic.addEventListener('canplaythrough', () => {
                    console.log('✅ Background music loaded and ready');
                    resolve();
                }, { once: true });
                
                this.backgroundMusic.addEventListener('error', (e) => {
                    console.error('❌ Error loading background music:', e);
                    this.backgroundMusic = null;
                    reject(e);
                }, { once: true });
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    console.warn('⏰ Background music loading timeout');
                    resolve(); // Don't reject, just continue without music
                }, 10000);
            });
            
        } catch (error) {
            console.error('❌ Failed to load background music:', error);
            this.backgroundMusic = null;
            throw error;
        }
    }
    
    // Play background music
    playBackgroundMusic() {
        if (!this.musicEnabled) {
            console.warn('🔇 Cannot play background music: music disabled');
            return;
        }
        
        if (!this.backgroundMusic) {
            console.warn('🔇 Cannot play background music: not loaded');
            return;
        }
        
        try {
            // Resume audio context if needed
            this.forceResumeAudio();
            
            console.log('🎵 Starting background music...');
            this.backgroundMusic.currentTime = 0; // Start from beginning
            this.backgroundMusic.play().then(() => {
                console.log('✅ Background music playing successfully');
            }).catch(error => {
                console.warn('❌ Failed to play background music:', error);
                // Try again after a short delay
                setTimeout(() => {
                    console.log('🔄 Retrying background music...');
                    this.backgroundMusic.play().catch(retryError => {
                        console.error('❌ Retry failed:', retryError);
                    });
                }, 1000);
            });
        } catch (error) {
            console.error('❌ Error playing background music:', error);
        }
    }
    
    // Stop background music
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            console.log('Stopping background music');
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
    
    // Pause background music
    pauseBackgroundMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            console.log('Pausing background music');
            this.backgroundMusic.pause();
        }
    }
    
    // Resume background music
    resumeBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.paused && this.musicEnabled) {
            console.log('Resuming background music');
            this.backgroundMusic.play().catch(error => {
                console.warn('Failed to resume background music:', error);
            });
        }
    }
    
    // Set music volume
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }
    
    // Toggle music on/off
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.resumeBackgroundMusic();
        } else {
            this.pauseBackgroundMusic();
        }
        return this.musicEnabled;
    }

    // Test audio system - Phase 3.1 debugging
    testAudio() {
        console.log('🔊 Testing audio system:');
        console.log('- Enabled:', this.enabled);
        console.log('- Audio Context:', this.audioContext ? 'Available' : 'Missing');
        console.log('- Audio Context State:', this.audioContext ? this.audioContext.state : 'N/A');
        
        if (this.audioContext && this.enabled) {
            this.forceResumeAudio();
            setTimeout(() => {
                console.log('🎵 Playing test sound...');
                this.playCollectSound();
            }, 100);
        }
    }

    // Toggle sound on/off
    toggleSound() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Sprite Pool Class - Phase 2.2: Add Sprite Pooling for Performance
class SpritePool {
    constructor(scene, initialSize) {
        this.scene = scene;
        this.pool = [];
        this.activeSprites = [];
        
        // Pre-create sprites for the pool
        for (let i = 0; i < initialSize; i++) {
            this.createPooledSprite();
        }
    }
    
    createPooledSprite() {
        // Create text sprite for "+10" collection effects
        const sprite = this.scene.add.text(0, 0, '+10', {
            fontSize: '24px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Initially disable and hide the sprite
        sprite.setVisible(false);
        sprite.setActive(false);
        
        // Add to pool
        this.pool.push(sprite);
        return sprite;
    }
    
    get() {
        let sprite;
        
        if (this.pool.length > 0) {
            // Reuse existing sprite from pool
            sprite = this.pool.pop();
        } else {
            // Create new sprite if pool is empty
            sprite = this.createPooledSprite();
        }
        
        // Activate and show the sprite
        sprite.setVisible(true);
        sprite.setActive(true);
        sprite.setAlpha(1); // Reset alpha for reuse
        
        // Track active sprites
        this.activeSprites.push(sprite);
        
        return sprite;
    }
    
    release(sprite) {
        // Remove from active sprites
        const index = this.activeSprites.indexOf(sprite);
        if (index > -1) {
            this.activeSprites.splice(index, 1);
        }
        
        // Reset sprite state
        sprite.setVisible(false);
        sprite.setActive(false);
        sprite.setPosition(0, 0);
        sprite.setAlpha(1);
        
        // Return to pool for reuse
        this.pool.push(sprite);
    }
}

// Enhanced Title Scene
class TitleScene extends Phaser.Scene {
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
                    console.error('🔍 Check if SydSprite.png exists at:', file.url);
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

                    // Debug Syd sprite dimensions
                    const sydImg = new Image();
                    sydImg.onload = () => {
                        console.log('🔍 Syd sprite actual dimensions:', {
                            width: sydImg.width,
                            height: sydImg.height
                        });
                    };
                    sydImg.src = 'assets/images/SydSprite.png';

                    this.load.image('background', 'assets/images/background.png');
                    
                    // Load Andy sprite
                    console.log('📥 Loading Andy sprite with 341x512 frames');
                    this.load.spritesheet('player', 'assets/images/AndySprite.png', {
                        frameWidth: 341,
                        frameHeight: 512
                    });
                    
                                    // Load female character spritesheet
                console.log('📥 Loading female player spritesheet from assets/images/SydSprite.png');
                this.load.spritesheet('female_player', 'assets/images/SydSprite.png', {
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
        
        // Platform texture - make it more visible
        graphics.fillStyle(0xf7931a);
        graphics.fillRect(0, 0, GAME_CONSTANTS.PLATFORM.TEXTURE_WIDTH, GAME_CONSTANTS.PLATFORM.TEXTURE_HEIGHT); // Made platforms thicker
        graphics.lineStyle(2, 0xffffff);
        graphics.strokeRect(0, 0, GAME_CONSTANTS.PLATFORM.TEXTURE_WIDTH, GAME_CONSTANTS.PLATFORM.TEXTURE_HEIGHT);
        graphics.generateTexture('platform', GAME_CONSTANTS.PLATFORM.TEXTURE_WIDTH, GAME_CONSTANTS.PLATFORM.TEXTURE_HEIGHT);
        
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
        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        
        // Character selection display
        this.createCharacterSelection();
        
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
            this.soundManager.playUIClickSound();
            this.scene.start('HighScoresScene');
        });
        
        this.menuItems = [startBtn, fullscreenBtn, musicBtn, highScoresBtn];
    }

    createDemoCharacter() {
        // Show animated player character on title screen
        const selectedCharacter = window.gameState.selectedCharacter;
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
        
        this.demoPlayer = this.add.sprite(200, 400, playerKey);
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
        
        this.characterText = this.add.text(400, 325, `Current: ${window.gameState.selectedCharacter === 'andy' ? 'Andy' : 'Character 2'}`, {
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
        window.gameState.selectedCharacter = window.gameState.selectedCharacter === 'andy' ? 'female' : 'andy';
        
        // Update UI text
        this.characterText.setText(`Current: ${window.gameState.selectedCharacter === 'andy' ? 'Andy' : 'Character 2'}`);
        
        // Update demo character
        this.createDemoCharacter();
        
        // Play UI sound
        this.soundManager.playUIClickSound();
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
        this.lives = GAME_CONSTANTS.GAMEPLAY.INITIAL_LIVES;
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
        this.jumpForce = GAME_CONSTANTS.PLAYER.JUMP_FORCE; // Realistic jump force
        // Parallax background layers
        this.backgroundLayers = [];
        
        // Power-up system - Phase 3.2
        this.powerUps = null;
        this.doubleJumpActive = false;
        this.doubleJumpUsed = false;
        this.powerUpTimer = null;
        this.powerUpIndicator = null;
        
        // Particle system - Phase 3.3
        this.particleManager = null;
    }

    init() {
        // Reset game state
        this.score = 0;
        this.lives = GAME_CONSTANTS.GAMEPLAY.INITIAL_LIVES;
        this.level = window.gameState.level || 1;
        
        // Track game start time and reset counters - Phase 4.2
        window.gameState.gameStartTime = Date.now();
        window.gameState.currentGameBitcoins = 0;
        
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
            duration: GAME_CONSTANTS.ANIMATION.TWEEN_DURATION,
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
        const selectedCharacter = window.gameState.selectedCharacter;
        let playerKey;
        
        console.log('🎮 Creating player with character:', selectedCharacter);
        console.log('🖼️ Female player texture exists:', this.textures.exists('female_player'));
        console.log('🖼️ Andy player texture exists:', this.textures.exists('player'));
        
        if (selectedCharacter === 'female') {
            playerKey = this.textures.exists('female_player') ? 'female_player' : 'female_player_fallback';
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
        if (selectedCharacter === 'female') {
            this.player.setScale(GAME_CONSTANTS.PLAYER.SCALE); // Use same scale as Andy
            console.log('👩 Female character - using Andy scale:', GAME_CONSTANTS.PLAYER.SCALE);
        } else {
            this.player.setScale(GAME_CONSTANTS.PLAYER.SCALE);
            console.log('👨 Male character - set scale to', GAME_CONSTANTS.PLAYER.SCALE);
        }
        
        console.log('📏 Final player scale:', this.player.scaleX, this.player.scaleY);
        console.log('📍 Player position:', this.player.x, this.player.y);
        
        this.player.setBounce(GAME_CONSTANTS.PLAYER.BOUNCE);
        this.player.setCollideWorldBounds(true);
        
        // Set appropriate hitbox based on character
        if (selectedCharacter === 'female') {
            this.player.body.setSize(200, 400, true); // Use same hitbox as Andy
            
            // Add event listener for animation changes to adjust offset
            this.player.on('animationstart', (anim) => {
                if (anim.key.includes('left')) {
                    this.player.body.setOffset(0, -60); // Larger offset for left-facing animations
                } else {
                    this.player.body.setOffset(0, -40); // Normal offset for right-facing
                }
                console.log('🎬 Animation changed:', anim.key, 'Offset adjusted');
            });
            
            console.log('📦 Female hitbox set with dynamic offset');
        } else {
            this.player.body.setSize(200, 400, true); // Original Andy hitbox
            console.log('📦 Andy hitbox set to 200x400');
        }
        
        // Set max velocity to prevent flying
        this.player.body.setMaxVelocity(GAME_CONSTANTS.PLAYER.MAX_VELOCITY_X, GAME_CONSTANTS.PLAYER.MAX_VELOCITY_Y);
        this.player.body.setDragX(300); // Add air resistance
        
        // Track player facing direction
        this.playerFacingRight = true;
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
            
            // Adjust hitbox to match new sprite size
            enemy.body.setSize(32, 48, true); // Match the sprite dimensions
            enemy.body.setOffset(0, 0); // Reset offset
            
            // If this is a ground enemy, move the sprite down to account for whitespace in frames
            if (placement.platform === 'ground') {
                enemy.y += 10; // Small adjustment for whitespace at bottom of frames
            }
            
            enemy.body.setMaxVelocity(GAME_CONSTANTS.ENEMY.MAX_VELOCITY_X, GAME_CONSTANTS.ENEMY.MAX_VELOCITY_Y);
            
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
            duration: GAME_CONSTANTS.ANIMATION.TWEEN_DURATION,
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
        try {
            // Player collisions
            this.physics.add.collider(this.player, this.platforms);
            this.physics.add.collider(this.bitcoins, this.platforms);
            this.physics.add.collider(this.enemies, this.platforms);
            
            // Collectibles and interactions
            this.physics.add.overlap(this.player, this.bitcoins, this.collectBitcoin, null, this);
            this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
            this.physics.add.overlap(this.player, this.goalFlag, this.reachGoal, null, this);
            
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
                this.scene.start('TitleScene');
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
        window.gameState.currentGameBitcoins++;
        
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
        try {
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
            
            this.level++;
            window.gameState.level = this.level;
            
            if (this.level > 3) {
                try {
                    this.scene.start('VictoryScene');
                } catch (victoryError) {
                    console.error('Error starting VictoryScene:', victoryError);
                    console.error('Falling back to title screen...');
                    this.scene.start('TitleScene');
                }
            } else {
                try {
                    this.scene.restart();
                } catch (restartError) {
                    console.error('Error restarting scene:', restartError);
                    console.error('Falling back to title screen...');
                    this.scene.start('TitleScene');
                }
            }
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
            if (this.score > window.gameState.highScore) {
                window.gameState.highScore = this.score;
                localStorage.setItem('bitcoinAdventureHighScore', this.score.toString());
            }
            
            try {
                this.scene.start('GameOverScene', { score: this.score, level: this.level });
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
        const selectedCharacter = window.gameState.selectedCharacter;
        
        if (leftPressed) {
            this.player.setVelocityX(-GAME_CONSTANTS.PLAYER.SPEED);
            this.playerFacingRight = false;
            
            // Use appropriate walk animation
            if (selectedCharacter === 'female') {
                this.player.play('female_walk_left', true);
                this.player.setFlipX(false); // Don't flip, use left-facing frames
                console.log('🎬 Playing female walk left animation');
            } else {
                this.player.play('player_walk', true);
                this.player.setFlipX(true);
            }
        } else if (rightPressed) {
            this.player.setVelocityX(GAME_CONSTANTS.PLAYER.SPEED);
            this.playerFacingRight = true;
            
            // Use appropriate walk animation
            if (selectedCharacter === 'female') {
                this.player.play('female_walk_right', true);
                this.player.setFlipX(false); // Don't flip, use right-facing frames
            } else {
                this.player.play('player_walk', true);
                this.player.setFlipX(false);
            }
        } else {
            this.player.setVelocityX(0);
            
                         // Use appropriate idle animation (only if not jumping)
             if (this.player.body.touching.down) {
                 if (selectedCharacter === 'female') {
                     console.log('🎬 Playing female_idle animation');
                     this.player.play('female_idle', true);
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
                
                // Play jump animation for female character
                if (selectedCharacter === 'female') {
                    // Use static jump frame if not moving, directional if moving
                    const isMoving = Math.abs(this.player.body.velocity.x) > 10;
                    if (isMoving) {
                        const jumpAnim = this.playerFacingRight ? 'female_jump_right' : 'female_jump_left';
                        this.player.play(jumpAnim, true);
                        console.log('🎬 Playing directional jump:', jumpAnim);
                    } else {
                        this.player.play('female_jump', true);
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
                
                // Play directional jump animation for female character (double jump)
                if (selectedCharacter === 'female') {
                    const jumpAnim = this.playerFacingRight ? 'female_jump_right' : 'female_jump_left';
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
            if (selectedCharacter === 'female') {
                if (Math.abs(this.player.body.velocity.x) > 10) {
                    // Use appropriate directional walk animation
                    const walkAnim = this.playerFacingRight ? 'female_walk_right' : 'female_walk_left';
                    this.player.play(walkAnim, true);
                } else {
                    this.player.play('female_idle', true);
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
        // Use shared sound manager instance - Phase 3.1
        this.soundManager = window.globalSoundManager || new SoundManager();
        
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
        window.gameState.lives = GAME_CONSTANTS.GAMEPLAY.INITIAL_LIVES;
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
            playAgainBtn.setScale(GAME_CONSTANTS.UI.BUTTON_HOVER_SCALE);
            playAgainBtn.setFill('#f7931a');
        });
        
        playAgainBtn.on('pointerout', () => {
            playAgainBtn.setScale(GAME_CONSTANTS.UI.BUTTON_NORMAL_SCALE);
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
            mainMenuBtn.setScale(GAME_CONSTANTS.UI.BUTTON_HOVER_SCALE);
            mainMenuBtn.setFill('#ffffff');
        });
        
        mainMenuBtn.on('pointerout', () => {
            mainMenuBtn.setScale(GAME_CONSTANTS.UI.BUTTON_NORMAL_SCALE);
            mainMenuBtn.setFill('#cccccc');
        });
        
        mainMenuBtn.on('pointerdown', () => {
            this.returnToMenu();
        });
    }

    restartGame() {
        try {
            // UI click sound - Phase 3.1
            this.soundManager.playUIClickSound();
            
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                try {
                    this.scene.start('GameScene');
                } catch (restartError) {
                    console.error('Error restarting game:', restartError);
                    console.error('Falling back to title screen...');
                    this.scene.start('TitleScene');
                }
            });
        } catch (error) {
            console.error('Error in restartGame transition:', error);
            console.error('Attempting direct restart...');
            try {
                this.scene.start('GameScene');
            } catch (fallbackError) {
                console.error('Fallback failed, returning to title:', fallbackError);
                this.scene.start('TitleScene');
            }
        }
    }

    returnToMenu() {
        try {
            // UI click sound - Phase 3.1
            this.soundManager.playUIClickSound();
            
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                try {
                    this.scene.start('TitleScene');
                } catch (menuError) {
                    console.error('Error returning to menu:', menuError);
                    // Try reloading as ultimate fallback
                    window.location.reload();
                }
            });
        } catch (error) {
            console.error('Error in returnToMenu transition:', error);
            console.error('Attempting direct menu return...');
            try {
                this.scene.start('TitleScene');
            } catch (fallbackError) {
                console.error('Ultimate fallback - reloading page:', fallbackError);
                window.location.reload();
            }
        }
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
        // Use shared sound manager instance - Phase 3.1
        this.soundManager = window.globalSoundManager || new SoundManager();
        
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
            try {
                // UI click sound - Phase 3.1
                this.soundManager.playUIClickSound();
                
                this.scene.start('TitleScene');
            } catch (error) {
                console.error('Error returning to title from victory:', error);
                console.error('Attempting page reload...');
                window.location.reload();
            }
        });
        
        // Reset game state
        window.gameState.score = 0;
        window.gameState.level = 1;
        window.gameState.lives = GAME_CONSTANTS.GAMEPLAY.INITIAL_LIVES;
    }
}

// High Scores Scene - Phase 4.2
class HighScoresScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HighScoresScene' });
    }

    create() {
        // Use shared sound manager instance - Phase 3.1
        this.soundManager = window.globalSoundManager || new SoundManager();
        
        // Background
        const bgKey = this.textures.exists('background') ? 'background' : 'bg_fallback';
        const bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, bgKey);
        bg.setOrigin(0, 0);
        bg.setTint(0x000044); // Dark blue tint
        
        // Title
        this.add.text(400, 50, 'HIGH SCORES & ACHIEVEMENTS', {
            fontSize: '28px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Get data
        const highScores = window.highScoreManager.getHighScores();
        const stats = window.highScoreManager.getStats();
        const achievements = window.highScoreManager.data.achievements;
        
        // High Scores Section
        this.add.text(200, 100, 'LEADERBOARD', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        if (highScores.length === 0) {
            this.add.text(200, 130, 'No games completed yet!', {
                fontSize: '14px',
                fill: '#cccccc',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5);
        } else {
            highScores.slice(0, 5).forEach((score, index) => {
                const rankText = `${index + 1}.`;
                const scoreText = `${score.score} pts`;
                const timeText = score.completionTime ? `${Math.floor(score.completionTime / 1000)}s` : 'N/A';
                const perfectText = score.perfect ? '⭐' : '';
                
                this.add.text(120, 130 + index * 25, rankText, {
                    fontSize: '14px',
                    fill: '#f7931a',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'bold'
                }).setOrigin(0, 0.5);
                
                this.add.text(150, 130 + index * 25, scoreText, {
                    fontSize: '14px',
                    fill: '#ffffff',
                    fontFamily: 'Arial, sans-serif'
                }).setOrigin(0, 0.5);
                
                this.add.text(230, 130 + index * 25, timeText, {
                    fontSize: '12px',
                    fill: '#cccccc',
                    fontFamily: 'Arial, sans-serif'
                }).setOrigin(0, 0.5);
                
                this.add.text(280, 130 + index * 25, perfectText, {
                    fontSize: '14px',
                    fill: '#ffff00',
                    fontFamily: 'Arial, sans-serif'
                }).setOrigin(0, 0.5);
            });
        }
        
        // Statistics Section
        this.add.text(600, 100, 'STATISTICS', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const statsData = [
            `Games Played: ${stats.gamesPlayed}`,
            `Bitcoins Collected: ${stats.bitcoinsCollected}`,
            `Total Jumps: ${stats.totalJumps}`,
            `Double Jumps: ${stats.doubleJumps}`,
            `Power-ups Used: ${stats.powerUpsCollected}`,
            `Best Time: ${stats.bestTime ? Math.floor(stats.bestTime / 1000) + 's' : 'N/A'}`
        ];
        
        statsData.forEach((stat, index) => {
            this.add.text(520, 130 + index * 20, stat, {
                fontSize: '14px',
                fill: '#cccccc',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0, 0.5);
        });
        
        // Achievements Section
        this.add.text(400, 280, 'ACHIEVEMENTS', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        if (achievements.length === 0) {
            this.add.text(400, 310, 'No achievements unlocked yet!', {
                fontSize: '14px',
                fill: '#cccccc',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5);
        } else {
            // Show most recent achievements
            achievements.slice(-4).reverse().forEach((achievement, index) => {
                this.add.text(400, 310 + index * 25, `🏆 ${achievement.name}`, {
                    fontSize: '14px',
                    fill: '#ffff00',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'bold'
                }).setOrigin(0.5);
                
                this.add.text(400, 325 + index * 25, achievement.description, {
                    fontSize: '12px',
                    fill: '#cccccc',
                    fontFamily: 'Arial, sans-serif'
                }).setOrigin(0.5);
            });
        }
        
        // Back button
        const backBtn = this.add.text(400, 520, 'BACK TO MENU', {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive();
        
        backBtn.on('pointerover', () => {
            backBtn.setScale(GAME_CONSTANTS.UI.BUTTON_HOVER_SCALE);
            backBtn.setFill('#ffffff');
        });
        
        backBtn.on('pointerout', () => {
            backBtn.setScale(GAME_CONSTANTS.UI.BUTTON_NORMAL_SCALE);
            backBtn.setFill('#cccccc');
        });
        
        backBtn.on('pointerdown', () => {
            this.soundManager.playUIClickSound();
            this.scene.start('TitleScene');
        });
    }
}

// Add scenes and start the game
config.scene = [TitleScene, GameScene, GameOverScene, VictoryScene, HighScoresScene];

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