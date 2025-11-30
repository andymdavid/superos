import { GAME_CONSTANTS } from '../core/constants.js';

export class PowerUp extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type) {
        if (!scene.textures.exists('powerup_' + type)) {
            scene.createPowerUpTexture(type);
        }

        super(scene, x, y, 'powerup_' + type);

        this.scene = scene;
        this.powerType = type;
        this.isCollected = false;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(GAME_CONSTANTS.POWERUP.SCALE);
        this.body.setSize(this.width * 0.8, this.height * 0.8);

        this.createVisualEffects();

        scene.time.delayedCall(30000, () => {
            if (!this.isCollected) {
                this.destroy();
            }
        });
    }

    createVisualEffects() {
        this.scene.tweens.add({
            targets: this,
            scaleX: GAME_CONSTANTS.POWERUP.SCALE * 1.2,
            scaleY: GAME_CONSTANTS.POWERUP.SCALE * 1.2,
            duration: GAME_CONSTANTS.POWERUP.PULSE_SPEED / 2,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: GAME_CONSTANTS.POWERUP.PULSE_SPEED,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        if (this.powerType === 'doubleJump') {
            this.setTint(GAME_CONSTANTS.POWERUP.DOUBLE_JUMP_COLOR);
        }
    }

    collect(player) {
        if (this.isCollected) return;

        this.isCollected = true;

        switch (this.powerType) {
            case 'doubleJump':
                this.scene.activateDoubleJump();
                break;
            case 'lifeUp':
                this.scene.lives += 1;
                this.scene.updateLivesDisplay();
                break;
            default:
                break;
        }

        this.scene.createPowerUpCollectionEffect(this.x, this.y, this.powerType);
        this.scene.createPowerUpParticleEffect(this.x, this.y, this.powerType);

        this.scene.soundManager.forceResumeAudio();
        this.scene.soundManager.playPowerUpSound();

        this.scene.score += GAME_CONSTANTS.POWERUP.COLLECTION_POINTS;
        this.scene.updateScoreDisplay();

        this.destroy();
    }
}
