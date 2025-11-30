import { GAME_CONSTANTS } from './constants.js';

export class HighScoreManager {
    constructor(storageKey = 'bitcoinAdventureData') {
        this.storageKey = storageKey;
        this.data = this.loadData();
    }

    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
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
        this.data.highScores = this.data.highScores.slice(0, 10);

        if (!this.data.bestCompletionTime || (completionTime && completionTime < this.data.bestCompletionTime)) {
            this.data.bestCompletionTime = completionTime;
        }

        this.data.totalGamesPlayed++;
        this.saveData();

        const newAchievements = this.checkAchievements(scoreEntry);

        return {
            rank: this.getScoreRank(score),
            newAchievements
        };
    }

    getScoreRank(score) {
        const rank = this.data.highScores.findIndex(entry => entry.score === score) + 1;
        return rank <= 10 && rank > 0 ? rank : null;
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

        if (this.data.totalGamesPlayed === 1 && !this.hasAchievement('first_win')) {
            newAchievements.push({
                id: 'first_win',
                name: 'First Victory',
                description: 'Complete your first game',
                date: new Date().toISOString()
            });
        }

        if (scoreEntry.perfect && !this.hasAchievement('perfect_game')) {
            newAchievements.push({
                id: 'perfect_game',
                name: 'Flawless Victory',
                description: 'Complete the game without losing a life',
                date: new Date().toISOString()
            });
        }

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

        newAchievements.forEach(achievement => {
            this.data.achievements.push(achievement);
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
