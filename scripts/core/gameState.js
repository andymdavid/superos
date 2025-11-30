import { GAME_CONSTANTS } from './constants.js';

export const gameState = {
    isPaused: false,
    score: 0,
    level: 1,
    lives: GAME_CONSTANTS.GAMEPLAY.INITIAL_LIVES,
    soundEnabled: true,
    highScore: 0,
    currentScene: 'title',
    gameStartTime: null,
    currentGameBitcoins: 0,
    selectedCharacter: 'andy'
};

export function resetRunState() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.lives = GAME_CONSTANTS.GAMEPLAY.INITIAL_LIVES;
    gameState.gameStartTime = null;
    gameState.currentGameBitcoins = 0;
    gameState.isPaused = false;
}

export function setHighScore(value) {
    if (typeof value === 'number' && value > gameState.highScore) {
        gameState.highScore = value;
    }
}
