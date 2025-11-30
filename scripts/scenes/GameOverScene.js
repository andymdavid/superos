import { GAME_CONSTANTS } from '../core/constants.js';
import { gameState, resetRunState } from '../core/gameState.js';
import { SoundManager } from '../core/soundManager.js';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = typeof data?.score === 'number' ? data.score : 0;
        this.finalLevel = typeof data?.level === 'number' ? data.level : 1;
        this.completionTime = typeof data?.completionTime === 'number' ? data.completionTime : null;
        this.bitcoinsCollected = typeof data?.bitcoinsCollected === 'number' ? data.bitcoinsCollected : 0;
        this.livesRemaining = typeof data?.livesRemaining === 'number' ? data.livesRemaining : 0;
        this.highScoreResult = data?.highScoreResult || null;
        this.newAchievements = this.highScoreResult?.newAchievements || [];
        this.highScoreRank = typeof this.highScoreResult?.rank === 'number' ? this.highScoreResult.rank : null;
        this.isNewHighScore = this.highScoreRank ? this.highScoreRank === 1 : this.finalScore >= gameState.highScore;
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
        
        // Score display (spaced vertically to avoid overlapping buttons)
        let currentY = 220;
        this.add.text(400, currentY, `Final Score: ${this.finalScore}`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        currentY += 35;
        this.add.text(400, currentY, `Level Reached: ${this.finalLevel}`, {
            fontSize: '20px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        currentY += 35;
        this.add.text(400, currentY, `Bitcoins Collected: ${this.bitcoinsCollected}`, {
            fontSize: '18px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        if (this.completionTime !== null) {
            const seconds = Math.max(0, Math.round(this.completionTime / 1000));
            currentY += 30;
            this.add.text(400, currentY, `Time Survived: ${seconds}s`, {
                fontSize: '16px',
                fill: '#cccccc',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5);
        } else {
            currentY += 30;
        }

        // High score notification
        if (this.isNewHighScore) {
            currentY += 30;
            const newHighScoreText = this.add.text(400, currentY, this.highScoreRank ? `NEW HIGH SCORE! (Rank #${this.highScoreRank})` : 'NEW HIGH SCORE!', {
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

        currentY += 35;

        if (this.newAchievements.length > 0) {
            this.add.text(400, currentY, 'New Achievements Unlocked:', {
                fontSize: '18px',
                fill: '#ffd700',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold'
            }).setOrigin(0.5);

            this.newAchievements.slice(0, 3).forEach((achievement, index) => {
                this.add.text(400, currentY + 25 + index * 20, `🏆 ${achievement.name}`, {
                    fontSize: '14px',
                    fill: '#ffffff',
                    fontFamily: 'Arial, sans-serif'
                }).setOrigin(0.5);
            });

            currentY += 25 + Math.min(this.newAchievements.length, 3) * 20;
        }

        // Menu options
        currentY += 35;
        this.createMenu(Math.max(currentY, 440));
        
        // Input handling
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Reset game state for next play
        resetRunState();
    }

    createMenu(startY = 440) {
        const menuY = startY;
        const spacing = 60;
        
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
            try {
                this.returnToMenu();
            } catch (error) {
                console.error('Error returning to menu:', error);
                try {
                    this.scene.start('TitleScene');
                } catch (fallbackError) {
                    console.error('Fallback failed:', fallbackError);
                    window.location.reload();
                }
            }
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
                    try {
                        this.scene.start('TitleScene');
                    } catch (titleError) {
                        console.error('Failed to return to title screen:', titleError);
                        window.location.reload();
                    }
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
