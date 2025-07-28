class SpriteTestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SpriteTestScene' });
    }

    preload() {
        // Load both sprites for comparison
        this.load.spritesheet('female_player', 'assets/images/SydSprite.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('player', 'assets/images/AndySprite.png', {
            frameWidth: 341,
            frameHeight: 512
        });

        // Add load event listeners
        this.load.on('filecomplete-spritesheet-female_player', (key, type, data) => {
            console.log('✅ Female player loaded:', {
                key: key,
                type: type,
                frameWidth: data.frameWidth,
                frameHeight: data.frameHeight,
                frameTotal: data.frameTotal
            });
        });
    }

    create() {
        // Add background
        this.add.rectangle(400, 300, 800, 600, 0x333333);

        // Create grid for visual reference
        for (let x = 0; x < 800; x += 32) {
            this.add.line(0, 0, x, 0, x, 600, 0x666666);
        }
        for (let y = 0; y < 600; y += 32) {
            this.add.line(0, 0, 0, y, 800, y, 0x666666);
        }

        // Display female sprite frames
        if (this.textures.exists('female_player')) {
            console.log('🎨 Creating female sprite test display');
            
            // Display each frame
            for (let i = 0; i < 8; i++) {
                const x = 100 + (i % 4) * 100;
                const y = 100 + Math.floor(i / 4) * 100;
                
                const sprite = this.add.sprite(x, y, 'female_player', i);
                sprite.setScale(2);
                
                // Add frame number text
                this.add.text(x, y + 40, `Frame ${i}`, {
                    fontSize: '16px',
                    fill: '#ffffff'
                }).setOrigin(0.5);
            }
        } else {
            console.error('❌ Female player texture not loaded');
        }

        // Add debug info
        const debugText = [
            'Sprite Test Scene',
            '----------------',
            `Female player texture exists: ${this.textures.exists('female_player')}`,
            `Frame count: ${this.textures.get('female_player').frameTotal}`,
            'Press SPACE to animate test sprite'
        ].join('\n');

        this.add.text(400, 500, debugText, {
            fontSize: '16px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Add animated test sprite
        const testSprite = this.add.sprite(600, 300, 'female_player', 0);
        testSprite.setScale(3);

        // Create test animations
        this.anims.create({
            key: 'test_walk',
            frames: this.anims.generateFrameNumbers('female_player', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        // Add keyboard control
        this.input.keyboard.on('keydown-SPACE', () => {
            testSprite.play('test_walk');
        });
    }
}

// Add test scene to game config
config.scene.push(SpriteTestScene);

// Add button to switch to test scene
document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.createElement('button');
    testButton.textContent = 'Sprite Test';
    testButton.style.position = 'fixed';
    testButton.style.top = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '1000';
    testButton.onclick = () => {
        game.scene.start('SpriteTestScene');
    };
    document.body.appendChild(testButton);
}); 