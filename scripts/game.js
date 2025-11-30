import { GAME_CONSTANTS } from './core/constants.js';

// Bitcoin Adventure - Optimized Standalone Web Game
// Clean architecture with essential features only
console.log('🚀 Bitcoin Adventure v3.2 - CONSOLE TEST!');

// Developer convenience helpers (retain existing behaviour)
window.testGoalDetection = function() {
    console.log('🧪 Manual test function called!');
    if (window.game && window.game.scene && window.game.scene.scenes[0]) {
        const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
        if (scene) {
            console.log('🎮 Found GameScene:', !!scene);
            console.log('🎯 Current level:', scene.level);
            console.log('🎯 Goal flag exists:', !!scene.goalFlag);
            console.log('👤 Player exists:', !!scene.player);
            console.log('🎯 levelCompleting:', scene.levelCompleting);
            if (scene.player && scene.goalFlag) {
                const distance = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, scene.goalFlag.x, scene.goalFlag.y);
                console.log('📏 Distance to goal flag:', Math.round(distance));

                const fixedDistance = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, 3850, 500);
                console.log('📏 Distance to FIXED goal (3850, 500):', Math.round(fixedDistance));
            }
        }
    }
};

window.forceCompleteLevel = function() {
    console.log('🚀 Force completing current level...');
    if (window.game && window.game.scene && window.game.scene.scenes[0]) {
        const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
        if (scene && scene.reachGoal) {
            scene.reachGoal(scene.player, scene.goalFlag);
            console.log('✅ Level completion triggered!');
        } else {
            console.log('❌ GameScene or reachGoal not found');
        }
    }
};

console.log('🔧 Test functions created:');
console.log('  - testGoalDetection() - Check goal detection status');
console.log('  - forceCompleteLevel() - Manually complete current level');

// Game configuration
export const config = {
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
            debug: false  // Set to true to see physics bodies for debugging
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

// Global references already established via modules (gameState, window.highScoreManager)
