export class SpritePool {
    constructor(scene, initialSize) {
        this.scene = scene;
        this.pool = [];
        this.activeSprites = [];

        for (let i = 0; i < initialSize; i++) {
            this.createPooledSprite();
        }
    }

    createPooledSprite() {
        const sprite = this.scene.add.text(0, 0, '+10', {
            fontSize: '24px',
            fill: '#f7931a',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        sprite.setVisible(false);
        sprite.setActive(false);

        this.pool.push(sprite);
        return sprite;
    }

    get() {
        let sprite;

        if (this.pool.length > 0) {
            sprite = this.pool.pop();
        } else {
            sprite = this.createPooledSprite();
        }

        sprite.setVisible(true);
        sprite.setActive(true);
        sprite.setAlpha(1);

        this.activeSprites.push(sprite);
        return sprite;
    }

    release(sprite) {
        const index = this.activeSprites.indexOf(sprite);
        if (index > -1) {
            this.activeSprites.splice(index, 1);
        }

        sprite.setVisible(false);
        sprite.setActive(false);
        sprite.setPosition(0, 0);
        sprite.setAlpha(1);

        this.pool.push(sprite);
    }
}
