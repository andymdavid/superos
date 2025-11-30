import { config } from './game.js';
import { GameScene } from './scenes/GameScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { HighScoresScene } from './scenes/HighScoresScene.js';
import { gameState, setHighScore } from './core/gameState.js';
import { HighScoreManager } from './core/highScoreManager.js';

// Expose shared state for legacy helpers and scenes
window.gameState = gameState;
window.highScoreManager = new HighScoreManager();
const initialStats = window.highScoreManager.getStats();
gameState.highScore = initialStats.topScore;
setHighScore(initialStats.topScore);
window.globalSoundManager = null;

// Register scenes and boot the game
config.scene = [TitleScene, GameScene, GameOverScene, VictoryScene, HighScoresScene];

const game = new Phaser.Game(config);
window.game = game;

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
