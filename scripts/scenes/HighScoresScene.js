import { GAME_CONSTANTS } from '../core/constants.js';
import { SoundManager } from '../core/soundManager.js';

export class HighScoresScene extends Phaser.Scene {
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
            try {
                this.soundManager.playUIClickSound();
                this.scene.start('TitleScene');
            } catch (error) {
                console.error('Error returning to title from high scores:', error);
                console.error('Attempting page reload...');
                window.location.reload();
            }
        });
    }
}
