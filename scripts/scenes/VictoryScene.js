import { GAME_CONSTANTS } from '../core/constants.js';
import { gameState, resetRunState } from '../core/gameState.js';
import { SoundManager } from '../core/soundManager.js';

export class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data) {
        this.finalScore = typeof data?.score === 'number' ? data.score : gameState.score || 0;
        this.finalLevel = typeof data?.level === 'number' ? data.level : GAME_CONSTANTS.LEVELS.TOTAL_LEVELS;
        this.completionTime = typeof data?.completionTime === 'number' ? data.completionTime : null;
        this.bitcoinsCollected = typeof data?.bitcoinsCollected === 'number' ? data.bitcoinsCollected : gameState.currentGameBitcoins || 0;
        this.livesRemaining = typeof data?.livesRemaining === 'number' ? data.livesRemaining : gameState.lives || GAME_CONSTANTS.GAMEPLAY.INITIAL_LIVES;
        this.highScoreResult = data?.highScoreResult || null;
        this.newAchievements = this.highScoreResult?.newAchievements || [];
        this.highScoreRank = typeof this.highScoreResult?.rank === 'number' ? this.highScoreResult.rank : null;
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
        const victoryText = this.add.text(400, 100, 'GARDEN COMPLETE!', {
            fontSize: '48px',
            fill: '#00ff00',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Celebration text
        this.add.text(400, 160, 'Congratulations, Bitcoin Master!', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.add.text(400, 190, "You've mastered Satoshi's Garden!", {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        let currentY = 290;
        this.add.text(400, currentY, `Final Score: ${this.finalScore}`, {
            fontSize: '24px',
            fill: '#00ff00',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        currentY += 35;
        this.add.text(400, currentY, `SATS collected: ${this.bitcoinsCollected}`, {
            fontSize: '18px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        if (this.completionTime !== null) {
            const seconds = Math.max(0, Math.round(this.completionTime / 1000));
            currentY += 30;
            this.add.text(400, currentY, `Completion Time: ${seconds}s`, {
                fontSize: '16px',
                fill: '#cccccc',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5);
        } else {
            currentY += 30;
        }

        currentY += 25;
        this.add.text(400, currentY, `Lives Remaining: ${this.livesRemaining}`, {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        currentY += 30;
        if (this.highScoreRank) {
            this.add.text(400, currentY, `Leaderboard Rank: #${this.highScoreRank}`, {
                fontSize: '16px',
                fill: '#ffd700',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5);
            currentY += 30;
        }

        if (this.newAchievements.length > 0) {
            this.add.text(400, currentY, 'New Achievements:', {
                fontSize: '18px',
                fill: '#ffd700',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold'
            }).setOrigin(0.5);

            this.newAchievements.slice(0, 4).forEach((achievement, index) => {
                this.add.text(400, currentY + 25 + index * 20, `🏆 ${achievement.name}`, {
                    fontSize: '14px',
                    fill: '#ffffff',
                    fontFamily: 'Arial, sans-serif'
                }).setOrigin(0.5);
            });

            currentY += 25 + Math.min(this.newAchievements.length, 4) * 20;
        }

        // Redirect countdown
        this.redirectCountdown = Math.ceil(GAME_CONSTANTS.LEVELS.REDIRECT_DELAY / 1000);

        this.add.text(400, Math.max(currentY + 30, 480), '━━━━━━━━━━━━━━━━━━━━', {
            fontSize: '16px',
            fill: '#666666',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.countdownText = this.add.text(400, Math.max(currentY + 60, 510), `Redirecting in ${this.redirectCountdown} seconds...`, {
            fontSize: '20px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(400, Math.max(currentY + 90, 540), 'Continue to otherstuff.ai', {
            fontSize: '14px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // Update countdown every second
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.redirectCountdown--;
                if (this.redirectCountdown > 0) {
                    this.countdownText.setText(`Redirecting in ${this.redirectCountdown} seconds...`);
                } else {
                    this.countdownText.setText('Redirecting now...');
                }
            },
            repeat: Math.ceil(GAME_CONSTANTS.LEVELS.REDIRECT_DELAY / 1000) - 1
        });

        // Automatic redirect after delay
        this.time.delayedCall(GAME_CONSTANTS.LEVELS.REDIRECT_DELAY, () => {
            try {
                console.log('Redirecting to:', GAME_CONSTANTS.LEVELS.REDIRECT_URL);
                window.location.href = GAME_CONSTANTS.LEVELS.REDIRECT_URL;
            } catch (error) {
                console.error('Error redirecting:', error);
                // Fallback: try again
                window.location.href = 'https://otherstuff.ai';
            }
        });

        // Allow manual navigation back to title if needed (ESC key)
        this.input.keyboard.once('keydown-ESC', () => {
            try {
                resetRunState();
                this.scene.start('TitleScene');
            } catch (error) {
                console.error('Error returning to title:', error);
            }
        });

        // Reset game state
        resetRunState();
    }
}
