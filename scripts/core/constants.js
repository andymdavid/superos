// Shared game constants for Bitcoin Adventure
export const GAME_CONSTANTS = {
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

    // Power-up properties
    POWERUP: {
        SCALE: 0.08,
        DURATION: 10000, // 10 seconds
        SPAWN_CHANCE: 0.3, // 30% chance per bitcoin collected
        DOUBLE_JUMP_COLOR: 0x00ff00, // Green glow
        COLLECTION_POINTS: 25,
        PULSE_SPEED: 2000 // Pulsing animation speed
    },

    // Particle effects
    PARTICLES: {
        BITCOIN_BURST_COUNT: 12,
        BITCOIN_COLORS: [0xf7931a, 0xffd700, 0xffcc00, 0xff9900],
        PARTICLE_LIFETIME: 800,
        PARTICLE_SPEED: { min: 50, max: 150 },
        PARTICLE_SIZE: { start: 4, end: 1 },
        GRAVITY: 200,
        BOUNCE: 0.3
    },

    // Level progression settings
    LEVELS: {
        TOTAL_LEVELS: 1,
        DIFFICULTY_SCALING: {
            ENEMY_SPEED_MULTIPLIER: 1.1,
            BITCOIN_BONUS_MULTIPLIER: 1.2,
            POWERUP_SPAWN_REDUCTION: 0.9
        },
        THEMES: {
            1: { name: 'Bitcoin Adventure', color: 0xf7931a }
        },
        REDIRECT_URL: 'https://otherstuff.ai',
        REDIRECT_DELAY: 7000 // 7 seconds to view stats before redirect
    }
};
