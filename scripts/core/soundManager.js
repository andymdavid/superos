export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.musicVolume = 0.08;
        this.enabled = true;
        this.musicEnabled = true;
        this.backgroundMusic = null;
        this.musicGainNode = null;
        this.currentMusicUrl = null;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            const resumeAudio = () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume().catch(err => {
                        console.warn('Failed to resume audio context:', err);
                    });
                }
                document.removeEventListener('click', resumeAudio);
                document.removeEventListener('keydown', resumeAudio);
                document.removeEventListener('touchstart', resumeAudio);
            };

            document.addEventListener('click', resumeAudio);
            document.addEventListener('keydown', resumeAudio);
            document.addEventListener('touchstart', resumeAudio);
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }

    forceResumeAudio() {
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(error => {
                console.warn('Failed to resume audio context:', error);
            });
        }
    }

    playCollectSound() {
        if (!this.enabled || !this.audioContext) return;
        this.forceResumeAudio();

        setTimeout(() => {
            if (this.audioContext.state !== 'running') return;
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);

                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.15);
            } catch (error) {
                console.error('Error playing collect sound:', error);
            }
        }, 10);
    }

    playHitSound() {
        if (!this.enabled || !this.audioContext) return;
        this.forceResumeAudio();

        setTimeout(() => {
            if (this.audioContext.state !== 'running') return;
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
                oscillator.type = 'sawtooth';

                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.25);
            } catch (error) {
                console.error('Error playing hit sound:', error);
            }
        }, 10);
    }

    playJumpSound() {
        if (!this.enabled || !this.audioContext) return;
        this.forceResumeAudio();

        setTimeout(() => {
            if (this.audioContext.state !== 'running') return;
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
                oscillator.type = 'triangle';

                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.12);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.12);
            } catch (error) {
                console.error('Error playing jump sound:', error);
            }
        }, 10);
    }

    playVictorySound() {
        if (!this.enabled || !this.audioContext) return;

        const notes = [523.25, 659.25, 783.99, 1046.5];
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

    playGameOverSound() {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.6);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.6);
    }

    playUIClickSound() {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.05);
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.15, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.08);
    }

    playPowerUpSound() {
        if (!this.enabled || !this.audioContext) return;
        this.forceResumeAudio();

        setTimeout(() => {
            if (this.audioContext.state !== 'running') return;
            try {
                const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
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
                console.error('Error playing power-up sound:', error);
            }
        }, 10);
    }

    async loadBackgroundMusic(url) {
        try {
            if (this.backgroundMusic) {
                this.stopBackgroundMusic();
            }

            this.currentMusicUrl = url;
            this.backgroundMusic = new Audio(url);
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = this.musicVolume;
            this.backgroundMusic.preload = 'auto';

            return new Promise((resolve, reject) => {
                this.backgroundMusic.addEventListener('canplaythrough', () => resolve(), { once: true });
                this.backgroundMusic.addEventListener('error', (e) => {
                    this.backgroundMusic = null;
                    reject(e);
                }, { once: true });

                setTimeout(() => {
                    console.warn('Background music loading timeout');
                    resolve();
                }, 10000);
            });
        } catch (error) {
            this.backgroundMusic = null;
            throw error;
        }
    }

    playBackgroundMusic() {
        if (!this.musicEnabled || !this.backgroundMusic) return;

        try {
            this.forceResumeAudio();
            const playPromise = this.backgroundMusic.play();
            if (playPromise) {
                playPromise.catch(error => {
                    if (error.name !== 'NotAllowedError') {
                        console.warn('Background music play error:', error.message);
                    }
                });
            }
        } catch (error) {
            console.error('Error playing background music:', error);
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    pauseBackgroundMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
        }
    }

    resumeBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.paused && this.musicEnabled) {
            this.backgroundMusic.play().catch(error => {
                console.warn('Failed to resume background music:', error);
            });
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.resumeBackgroundMusic();
        } else {
            this.pauseBackgroundMusic();
        }
        return this.musicEnabled;
    }

    testAudio() {
        console.log('Audio enabled:', this.enabled);
        console.log('Audio context:', this.audioContext ? this.audioContext.state : 'none');
    }
}
