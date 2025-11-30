import { GAME_CONSTANTS } from '../core/constants.js';

export function getPlatformLayout(level) {
    switch (level) {
        case 1:
            // LEVEL 1: Rebuilt to match the design spec (six themed sections)
            // Platform types: frame 0=Platform1 (safe), 1=Platform2 (precision), 2=Platform3 (bridges)
            return [
                // SECTION 1: THE ENTRANCE (0-700)
                { x: 200, y: 520, scale: 1.2, frame: 0 },
                { x: 360, y: 460, scale: 1.2, frame: 0 },
                { x: 520, y: 380, scale: 1.2, frame: 0 },
                { x: 680, y: 260, scale: 1.2, frame: 0 },

                // SECTION 2: FIRST BLOOD (700-1400)
                { x: 800, y: 440, scale: 1.0, frame: 1 },
                { x: 900, y: 400, scale: 1.0, frame: 1 },
                { x: 1020, y: 280, scale: 1.0, frame: 2 },
                { x: 1010, y: 485, scale: 1.2, frame: 0 },
                { x: 1064, y: 280, scale: 1.0, frame: 2 },
                { x: 1108, y: 280, scale: 1.0, frame: 2 },
                { x: 1152, y: 280, scale: 1.0, frame: 2 },
                { x: 1160, y: 450, scale: 1.2, frame: 0 },
                { x: 1280, y: 400, scale: 1.0, frame: 1 },
                { x: 1320, y: 275, scale: 1.2, frame: 0 },
                { x: 1400, y: 460, scale: 1.2, frame: 0 },
                { x: 1450, y: 140, scale: 1.0, frame: 2 },
                { x: 1494, y: 140, scale: 1.0, frame: 2 },
                { x: 1538, y: 140, scale: 1.0, frame: 2 },

                // SECTION 3: THE CHOICE (1400-2200)
                { x: 1520, y: 315, scale: 1.0, frame: 1 },
                { x: 1680, y: 280, scale: 1.0, frame: 1 },
                { x: 1840, y: 280, scale: 1.0, frame: 2 },
                { x: 1884, y: 280, scale: 1.0, frame: 2 },
                { x: 1928, y: 280, scale: 1.0, frame: 2 },
                { x: 1972, y: 280, scale: 1.0, frame: 2 },
                { x: 1600, y: 460, scale: 1.2, frame: 0 },
                { x: 1900, y: 485, scale: 1.2, frame: 0 },
                { x: 2050, y: 440, scale: 1.2, frame: 0 },
                { x: 2150, y: 290, scale: 1.2, frame: 0 },
                { x: 2275, y: 160, scale: 1.0, frame: 2 },
                { x: 2319, y: 160, scale: 1.0, frame: 2 },

                // SECTION 4: THE GAUNTLET (2200-2900)
                { x: 2320, y: 420, scale: 1.0, frame: 1 },
                { x: 2450, y: 200, scale: 1.0, frame: 2 },
                { x: 2494, y: 200, scale: 1.0, frame: 2 },
                { x: 2538, y: 200, scale: 1.0, frame: 2 },
                { x: 2450, y: 485, scale: 1.2, frame: 0 },
                { x: 2580, y: 420, scale: 1.0, frame: 1 },
                { x: 2710, y: 390, scale: 1.0, frame: 1 },
                { x: 2810, y: 295, scale: 1.0, frame: 2 },
                { x: 2854, y: 295, scale: 1.0, frame: 2 },
                { x: 2970, y: 400, scale: 1.2, frame: 0 },

                // SECTION 5: THE LEAP (2970-3400)
                { x: 3100, y: 400, scale: 1.2, frame: 0 },
                { x: 3340, y: 480, scale: 1.0, frame: 1 },
                { x: 3370, y: 250, scale: 1.0, frame: 2 },
                { x: 3414, y: 250, scale: 1.0, frame: 2 },
                { x: 3458, y: 250, scale: 1.0, frame: 2 },

                // SECTION 6: VICTORY LAP + TOWER (3400-4000)
                { x: 3500, y: 480, scale: 1.2, frame: 0 },
                { x: 3700, y: 480, scale: 1.0, frame: 2 },
                { x: 3744, y: 480, scale: 1.0, frame: 2 },
                { x: 3788, y: 480, scale: 1.0, frame: 2 },
                { x: 3600, y: 380, scale: 1.0, frame: 1 },
                { x: 3680, y: 300, scale: 1.0, frame: 1 },
                { x: 3760, y: 220, scale: 1.0, frame: 1 },
                { x: 3840, y: 140, scale: 1.0, frame: 1 }
            ];
        case 2:
            return [
                { x: 250, y: 450, scale: 1.5 },
                { x: 500, y: 350, scale: 1 },
                { x: 750, y: 280, scale: 2 },
                { x: 1050, y: 380, scale: 1 },
                { x: 1350, y: 250, scale: 1.5 },
                { x: 1650, y: 400, scale: 2.5 },
                { x: 1950, y: 200, scale: 1 },
                { x: 2250, y: 200, scale: 1.5 },
                { x: 2550, y: 200, scale: 1 },
                { x: 2850, y: 200, scale: 2 },
                { x: 3150, y: 180, scale: 1.5 },
                { x: 3450, y: 280, scale: 1 },
                { x: 3700, y: 200, scale: 3 },
                { x: 400, y: 520, scale: 1.5 },
                { x: 650, y: 500, scale: 1 },
                { x: 900, y: 480, scale: 2 },
                { x: 1200, y: 520, scale: 1 },
                { x: 1500, y: 500, scale: 1.5 },
                { x: 1800, y: 480, scale: 1 },
                { x: 2100, y: 460, scale: 2 },
                { x: 2400, y: 500, scale: 1 },
                { x: 2700, y: 480, scale: 1.5 },
                { x: 3000, y: 450, scale: 1 },
                { x: 3300, y: 520, scale: 2 },
                { x: 3550, y: 450, scale: 1 }
            ];
        case 3:
            return [
                { x: 200, y: 300, scale: 1 },
                { x: 400, y: 200, scale: 1.5 },
                { x: 650, y: 150, scale: 1 },
                { x: 900, y: 120, scale: 2 },
                { x: 1200, y: 180, scale: 1 },
                { x: 1450, y: 100, scale: 1.5 },
                { x: 1700, y: 150, scale: 1 },
                { x: 1950, y: 200, scale: 2.5 },
                { x: 2250, y: 120, scale: 1 },
                { x: 2500, y: 160, scale: 1.5 },
                { x: 2800, y: 100, scale: 1 },
                { x: 3100, y: 180, scale: 2 },
                { x: 3400, y: 140, scale: 1.5 },
                { x: 3700, y: 200, scale: 3 },
                { x: 250, y: 400, scale: 1.5 },
                { x: 500, y: 350, scale: 1 },
                { x: 750, y: 300, scale: 2 },
                { x: 1000, y: 280, scale: 1 },
                { x: 1300, y: 320, scale: 1.5 },
                { x: 1600, y: 280, scale: 1 },
                { x: 1850, y: 350, scale: 2 },
                { x: 2150, y: 300, scale: 1.5 },
                { x: 2450, y: 280, scale: 1 },
                { x: 2750, y: 320, scale: 2 },
                { x: 3050, y: 300, scale: 1 },
                { x: 3350, y: 350, scale: 1.5 },
                { x: 300, y: 500, scale: 2 },
                { x: 600, y: 480, scale: 1.5 },
                { x: 850, y: 460, scale: 1 },
                { x: 1150, y: 520, scale: 2 },
                { x: 1400, y: 480, scale: 1 },
                { x: 1750, y: 500, scale: 1.5 },
                { x: 2000, y: 460, scale: 1 },
                { x: 2300, y: 480, scale: 2 },
                { x: 2600, y: 520, scale: 1 },
                { x: 2900, y: 460, scale: 1.5 },
                { x: 3200, y: 500, scale: 1 },
                { x: 3500, y: 480, scale: 2 }
            ];
        case 4:
            return [
                { x: 200, y: 480, scale: 2 },
                { x: 450, y: 420, scale: 1.5 },
                { x: 700, y: 360, scale: 2 },
                { x: 950, y: 480, scale: 1 },
                { x: 1050, y: 420, scale: 1 },
                { x: 1150, y: 360, scale: 1 },
                { x: 1250, y: 300, scale: 1.5 },
                { x: 1500, y: 450, scale: 2.5 },
                { x: 1750, y: 350, scale: 1.5 },
                { x: 2000, y: 280, scale: 2 },
                { x: 2300, y: 400, scale: 1 },
            { x: 2500, y: 200, scale: 1 },
                { x: 2700, y: 480, scale: 1.5 },
                { x: 2900, y: 320, scale: 1 },
                { x: 3200, y: 380, scale: 2.5 },
                { x: 3450, y: 250, scale: 2 },
                { x: 3700, y: 180, scale: 3 },
                { x: 800, y: 520, scale: 1.5 },
                { x: 1400, y: 520, scale: 1.5 },
                { x: 1900, y: 500, scale: 1 },
                { x: 2400, y: 520, scale: 1.5 },
                { x: 2800, y: 500, scale: 1 },
                { x: 3100, y: 520, scale: 2 },
                { x: 3500, y: 480, scale: 1.5 }
            ];
        case 5:
            return [
                { x: 250, y: 450, scale: 2 },
                { x: 500, y: 380, scale: 1.8 },
                { x: 750, y: 320, scale: 1.5 },
                { x: 1000, y: 280, scale: 1.2 },
                { x: 1200, y: 150, scale: 1 },
                { x: 1400, y: 500, scale: 1 },
                { x: 1600, y: 200, scale: 1 },
                { x: 1800, y: 450, scale: 1.5 },
                { x: 2000, y: 120, scale: 1 },
                { x: 2200, y: 350, scale: 2 },
                { x: 2450, y: 280, scale: 1.5 },
                { x: 2700, y: 400, scale: 2 },
                { x: 2950, y: 180, scale: 1 },
                { x: 3150, y: 480, scale: 1 },
                { x: 3300, y: 350, scale: 1.5 },
                { x: 3500, y: 250, scale: 2 },
                { x: 3750, y: 160, scale: 3 },
                { x: 400, y: 520, scale: 1.5 },
                { x: 850, y: 500, scale: 1 },
                { x: 1300, y: 520, scale: 1.5 },
                { x: 1700, y: 510, scale: 1 },
                { x: 2100, y: 520, scale: 1.5 },
                { x: 2500, y: 500, scale: 1 },
                { x: 2850, y: 520, scale: 1.5 },
                { x: 3200, y: 500, scale: 1 },
                { x: 3600, y: 480, scale: 2 }
            ];
        case 6:
            return [
                { x: 200, y: 400, scale: 2 },
                { x: 450, y: 350, scale: 1.5 },
                { x: 700, y: 300, scale: 1.5 },
                { x: 950, y: 350, scale: 1 },
                { x: 1150, y: 300, scale: 1 },
                { x: 1350, y: 250, scale: 1 },
                { x: 1550, y: 200, scale: 1.5 },
                { x: 1800, y: 180, scale: 1 },
                { x: 2000, y: 320, scale: 1.5 },
                { x: 2200, y: 150, scale: 1 },
                { x: 2450, y: 280, scale: 2 },
                { x: 2700, y: 200, scale: 1.5 },
                { x: 2900, y: 350, scale: 1 },
                { x: 3100, y: 180, scale: 1.5 },
                { x: 3300, y: 300, scale: 2 },
                { x: 3550, y: 220, scale: 1.5 },
                { x: 3750, y: 140, scale: 3 },
                { x: 350, y: 520, scale: 2 },
                { x: 600, y: 480, scale: 1.5 },
                { x: 850, y: 500, scale: 1 },
                { x: 1100, y: 480, scale: 1.5 },
                { x: 1400, y: 520, scale: 1 },
                { x: 1700, y: 500, scale: 1.5 },
                { x: 2050, y: 480, scale: 1 },
                { x: 2350, y: 520, scale: 1.5 },
                { x: 2650, y: 500, scale: 1 },
                { x: 2950, y: 480, scale: 1.5 },
                { x: 3250, y: 520, scale: 1 },
                { x: 3500, y: 480, scale: 2 }
            ];
        default:
            return generateAdvancedPlatforms(level);
    }
}

export function getGroundGaps(level) {
    switch (level) {
        case 1:
            // Ground gaps aligned with the new section layout
            return [
                { start: 900, end: 1400 },  // After first bridge
                { start: 1850, end: 2350 },  // Before gauntlet
                { start: 2450, end: 2710 },  // Gauntlet gap
                { start: 3050, end: 3350 }   // The leap gap
            ];
        default:
            return [];
    }
}

export function generateAdvancedPlatforms(level) {
    const platformCount = Math.min(15 + level * 2, 25);
    const platforms = [];

    for (let i = 0; i < platformCount; i++) {
        platforms.push({
            x: Phaser.Math.Between(200, GAME_CONSTANTS.WORLD.WIDTH - 200),
            y: Phaser.Math.Between(120, 500),
            scale: Phaser.Math.Between(1, 3)
        });
    }

    return platforms;
}

export function getBitcoinPositions(level) {
    switch (level) {
        case 1:
            // Coins mirror the six-section design for Level 1
            return [
                // SECTION 1: THE ENTRANCE
                { x: 200, y: 470 }, { x: 360, y: 410 }, { x: 520, y: 330 }, { x: 680, y: 210 },

                // SECTION 2: FIRST BLOOD
                { x: 800, y: 390 }, { x: 900, y: 350 },
                { x: 1010, y: 435 }, { x: 1160, y: 400 },
                { x: 1280, y: 350 }, { x: 1320, y: 225 }, { x: 1400, y: 410 },
                { x: 1538, y: 90 }, { x: 1538, y: 60 }, { x: 1538, y: 30 },

                // SECTION 3: THE CHOICE
                { x: 1520, y: 265 }, { x: 1600, y: 410 }, { x: 1680, y: 230 },
                { x: 1900, y: 435 }, { x: 2050, y: 390 }, { x: 2150, y: 240 },
                { x: 2319, y: 110 }, { x: 2319, y: 80 }, { x: 2319, y: 50 },

                // SECTION 4: THE GAUNTLET
                { x: 2320, y: 370 }, { x: 2450, y: 435 }, { x: 2580, y: 370 }, { x: 2710, y: 340 }, { x: 2854, y: 245 }, { x: 2970, y: 350 },

                // SECTION 5: THE LEAP
                { x: 3100, y: 350 }, { x: 3340, y: 430 },

                // SECTION 6: VICTORY LAP + TOWER
                { x: 3370, y: 200 }, { x: 3370, y: 170 }, { x: 3370, y: 140 },
                { x: 3500, y: 430 }, { x: 3600, y: 330 }, { x: 3680, y: 250 }, { x: 3760, y: 170 }, { x: 3788, y: 430 },
                { x: 3820, y: 90 }, { x: 3820, y: 60 }, { x: 3820, y: 30 },
                { x: 3860, y: 90 }, { x: 3860, y: 60 }, { x: 3860, y: 30 },
                { x: 2970, y: 570 }, { x: 2970, y: 540 }, { x: 2970, y: 510 },
                { x: 3600, y: 570 }, { x: 3600, y: 540 }, { x: 3600, y: 510 }
            ];
        case 2:
            return [
                { x: 300, y: 390 }, { x: 550, y: 290 }, { x: 800, y: 220 },
                { x: 1100, y: 320 }, { x: 1400, y: 190 }, { x: 1700, y: 340 },
                { x: 2000, y: 120 }, { x: 2300, y: 260 }, { x: 2600, y: 160 },
                { x: 2900, y: 290 }, { x: 3200, y: 120 }, { x: 3500, y: 220 },
                { x: 3750, y: 140 }, { x: 450, y: 460 }, { x: 700, y: 440 },
                { x: 950, y: 420 }, { x: 1250, y: 460 }, { x: 1550, y: 440 },
                { x: 1850, y: 420 }, { x: 2150, y: 400 }, { x: 2450, y: 440 },
                { x: 2750, y: 420 }, { x: 3050, y: 390 }, { x: 3350, y: 460 },
                { x: 3600, y: 390 }
            ];
        case 3:
            return [
                { x: 250, y: 240 }, { x: 450, y: 140 }, { x: 700, y: 90 },
                { x: 950, y: 60 }, { x: 1250, y: 120 }, { x: 1500, y: 40 },
                { x: 1750, y: 90 }, { x: 2000, y: 140 }, { x: 2300, y: 60 },
                { x: 2550, y: 100 }, { x: 2850, y: 40 }, { x: 3150, y: 120 },
                { x: 3450, y: 80 }, { x: 3750, y: 140 }, { x: 300, y: 340 },
                { x: 550, y: 290 }, { x: 800, y: 240 }, { x: 1050, y: 220 },
                { x: 1350, y: 260 }, { x: 1650, y: 220 }, { x: 1900, y: 290 },
                { x: 2200, y: 240 }, { x: 2500, y: 220 }, { x: 2800, y: 260 },
                { x: 3100, y: 240 }, { x: 3400, y: 290 }, { x: 350, y: 440 },
                { x: 650, y: 420 }, { x: 900, y: 400 }, { x: 1200, y: 460 },
                { x: 1450, y: 420 }, { x: 1800, y: 440 }
            ];
        case 4:
            return [
                { x: 250, y: 420 }, { x: 500, y: 360 }, { x: 750, y: 300 },
                { x: 1000, y: 420 }, { x: 1100, y: 360 }, { x: 1200, y: 300 },
                { x: 1300, y: 240 }, { x: 1550, y: 390 }, { x: 1800, y: 290 },
                { x: 2050, y: 220 }, { x: 2350, y: 340 }, { x: 2550, y: 140 },
                { x: 2750, y: 420 }, { x: 2950, y: 260 }, { x: 3250, y: 320 },
                { x: 3500, y: 190 }, { x: 3750, y: 120 }, { x: 850, y: 460 },
                { x: 1450, y: 460 }, { x: 1950, y: 440 }, { x: 2450, y: 460 },
                { x: 2850, y: 440 }, { x: 3150, y: 460 }, { x: 3550, y: 420 },
                { x: 1350, y: 180 }, { x: 2100, y: 160 }, { x: 3550, y: 60 }
            ];
        case 5:
            return [
                { x: 300, y: 390 }, { x: 550, y: 320 }, { x: 800, y: 260 },
                { x: 1050, y: 220 }, { x: 1250, y: 90 }, { x: 1450, y: 440 },
                { x: 1650, y: 140 }, { x: 1850, y: 390 }, { x: 2050, y: 60 },
                { x: 2250, y: 290 }, { x: 2500, y: 220 }, { x: 2750, y: 340 },
                { x: 3000, y: 120 }, { x: 3200, y: 420 }, { x: 3350, y: 290 },
                { x: 3550, y: 190 }, { x: 3800, y: 100 }, { x: 450, y: 460 },
                { x: 900, y: 440 }, { x: 1350, y: 460 }, { x: 1750, y: 450 },
                { x: 2150, y: 460 }, { x: 2550, y: 440 }, { x: 2900, y: 460 },
                { x: 3250, y: 440 }, { x: 3650, y: 420 }, { x: 1300, y: 300 },
                { x: 1750, y: 250 }, { x: 2400, y: 350 }
            ];
        case 6:
            return [
                { x: 250, y: 340 }, { x: 500, y: 290 }, { x: 750, y: 240 },
                { x: 1000, y: 290 }, { x: 1200, y: 240 }, { x: 1400, y: 190 },
                { x: 1600, y: 140 }, { x: 1850, y: 120 }, { x: 2050, y: 260 },
                { x: 2250, y: 90 },{ x: 2500, y: 220 }, { x: 2750, y: 140 },
                { x: 2950, y: 290 }, { x: 3150, y: 120 }, { x: 3350, y: 240 },
                { x: 3600, y: 160 }, { x: 3800, y: 80 }, { x: 400, y: 460 },
                { x: 650, y: 420 }, { x: 900, y: 440 }, { x: 1150, y: 420 },
                { x: 1450, y: 460 }, { x: 1750, y: 440 }, { x: 2100, y: 420 },
                { x: 2400, y: 460 }, { x: 2700, y: 440 }, { x: 3000, y: 420 },
                { x: 3300, y: 460 }, { x: 3550, y: 420 }, { x: 1100, y: 200 },
                { x: 1800, y: 300 }, { x: 2600, y: 180 }, { x: 3400, y: 100 }
            ];
        default:
            return generateAdvancedBitcoinPositions(level);
    }
}

export function generateAdvancedBitcoinPositions(level) {
    const bitcoinCount = Math.min(20 + level * 2, 35);
    const positions = [];

    for (let i = 0; i < bitcoinCount; i++) {
        positions.push({
            x: Phaser.Math.Between(300, GAME_CONSTANTS.WORLD.WIDTH - 300),
            y: Phaser.Math.Between(150, 500)
        });
    }

    return positions;
}

export function getEnemyPlacements(level) {
    switch (level) {
        case 1:
            // Enemy placement mirrors the new section-based narrative
            return [
                // SECTION 1: THE ENTRANCE - ground patrol
                { x: 360, y: 560, patrolMin: 200, patrolMax: 520, platform: 'ground' },

                // SECTION 2: FIRST BLOOD - bridge patrol
                { x: 1086, y: 256, patrolMin: 1020, patrolMax: 1152, platform: 'platform' },

                // SECTION 3: THE CHOICE - bridge guard
                { x: 1906, y: 256, patrolMin: 1840, patrolMax: 1972, platform: 'platform' },

                // SECTION 3: THE CHOICE - ground patrol
                { x: 1625, y: 560, patrolMin: 1450, patrolMax: 1800, platform: 'ground' },

                // SECTION 4: THE GAUNTLET - bridge patrol
                { x: 2494, y: 176, patrolMin: 2450, patrolMax: 2538, platform: 'platform' },

                // SECTION 4: THE GAUNTLET - ground patrol
                { x: 2840, y: 560, patrolMin: 2800, patrolMax: 2950, platform: 'ground' },

                // SECTION 6: VICTORY LAP - ground patrols
                { x: 3600, y: 560, patrolMin: 3500, patrolMax: 3700, platform: 'ground' },
                { x: 3788, y: 560, patrolMin: 3700, patrolMax: 3850, platform: 'ground' }
            ];
        case 2:
            return [
                { x: 800, y: 560, patrolMin: 700, patrolMax: 900, platform: 'ground' },
                { x: 1400, y: 560, patrolMin: 1250, patrolMax: 1550, platform: 'ground' },
                { x: 2000, y: 560, patrolMin: 1850, patrolMax: 2150, platform: 'ground' },
                { x: 2600, y: 560, patrolMin: 2450, patrolMax: 2750, platform: 'ground' },
                { x: 3400, y: 560, patrolMin: 3250, patrolMax: 3550, platform: 'ground' },
                { x: 600, y: 340, patrolMin: 500, patrolMax: 700, platform: 'platform' },
                { x: 1100, y: 300, patrolMin: 1000, patrolMax: 1200, platform: 'platform' },
                { x: 1700, y: 260, patrolMin: 1600, patrolMax: 1800, platform: 'platform' },
                { x: 2300, y: 320, patrolMin: 2200, patrolMax: 2400, platform: 'platform' }
            ];
        case 3:
            return [
                { x: 900, y: 560, patrolMin: 800, patrolMax: 1000, platform: 'ground' },
                { x: 1500, y: 560, patrolMin: 1400, patrolMax: 1600, platform: 'ground' },
                { x: 2100, y: 560, patrolMin: 2000, patrolMax: 2200, platform: 'ground' },
                { x: 2700, y: 560, patrolMin: 2600, patrolMax: 2800, platform: 'ground' },
                { x: 3300, y: 560, patrolMin: 3200, patrolMax: 3400, platform: 'ground' },
                { x: 500, y: 300, patrolMin: 400, patrolMax: 600, platform: 'platform' },
                { x: 1200, y: 200, patrolMin: 1100, patrolMax: 1300, platform: 'platform' },
                { x: 1900, y: 260, patrolMin: 1800, patrolMax: 2000, platform: 'platform' },
                { x: 2600, y: 200, patrolMin: 2500, patrolMax: 2700, platform: 'platform' },
                { x: 3300, y: 260, patrolMin: 3200, patrolMax: 3400, platform: 'platform' }
            ];
        case 4:
            return [
                { x: 900, y: 560, patrolMin: 800, patrolMax: 1000, platform: 'ground' },
                { x: 1500, y: 560, patrolMin: 1400, patrolMax: 1600, platform: 'ground' },
                { x: 2100, y: 560, patrolMin: 2000, patrolMax: 2200, platform: 'ground' },
                { x: 2700, y: 560, patrolMin: 2600, patrolMax: 2800, platform: 'ground' },
                { x: 3300, y: 560, patrolMin: 3200, patrolMax: 3400, platform: 'ground' },
                { x: 400, y: 360, patrolMin: 300, patrolMax: 500, platform: 'platform' },
                { x: 1200, y: 300, patrolMin: 1100, patrolMax: 1300, platform: 'platform' },
                { x: 2000, y: 260, patrolMin: 1900, patrolMax: 2100, platform: 'platform' },
                { x: 2800, y: 320, patrolMin: 2700, patrolMax: 2900, platform: 'platform' }
            ];
        case 5:
            return [
                { x: 900, y: 560, patrolMin: 800, patrolMax: 1000, platform: 'ground' },
                { x: 1500, y: 560, patrolMin: 1400, patrolMax: 1600, platform: 'ground' },
                { x: 2100, y: 560, patrolMin: 2000, patrolMax: 2200, platform: 'ground' },
                { x: 2700, y: 560, patrolMin: 2600, patrolMax: 2800, platform: 'ground' },
                { x: 3300, y: 560, patrolMin: 3200, patrolMax: 3400, platform: 'ground' },
                { x: 500, y: 320, patrolMin: 400, patrolMax: 600, platform: 'platform' },
                { x: 1300, y: 260, patrolMin: 1200, patrolMax: 1400, platform: 'platform' },
                { x: 2100, y: 200, patrolMin: 2000, patrolMax: 2200, platform: 'platform' },
                { x: 2900, y: 260, patrolMin: 2800, patrolMax: 3000, platform: 'platform' }
            ];
        case 6:
            return [
                { x: 900, y: 560, patrolMin: 800, patrolMax: 1000, platform: 'ground' },
                { x: 1500, y: 560, patrolMin: 1400, patrolMax: 1600, platform: 'ground' },
                { x: 2100, y: 560, patrolMin: 2000, patrolMax: 2200, platform: 'ground' },
                { x: 2700, y: 560, patrolMin: 2600, patrolMax: 2800, platform: 'ground' },
                { x: 3300, y: 560, patrolMin: 3200, patrolMax: 3400, platform: 'ground' },
                { x: 500, y: 320, patrolMin: 400, patrolMax: 600, platform: 'platform' },
                { x: 1300, y: 260, patrolMin: 1200, patrolMax: 1400, platform: 'platform' },
                { x: 2100, y: 200, patrolMin: 2000, patrolMax: 2200, platform: 'platform' },
                { x: 2900, y: 260, patrolMin: 2800, patrolMax: 3000, platform: 'platform' }
            ];
        default:
            return generateAdvancedEnemyPlacements(level);
    }
}

export function getPowerUpPlacements(level) {
    switch (level) {
        case 1:
            return [];
        default:
            return [];
    }
}

export function generateAdvancedEnemyPlacements(level) {
    const enemyCount = Math.min(6 + level, 12);
    const placements = [];

    for (let i = 0; i < enemyCount; i++) {
        const ground = Math.random() > 0.5;
        const y = ground ? 560 : Phaser.Math.Between(180, 360);
        const patrolRange = Phaser.Math.Between(80, 160);
        const center = Phaser.Math.Between(300, GAME_CONSTANTS.WORLD.WIDTH - 300);

        placements.push({
            x: center,
            y,
            patrolMin: center - patrolRange,
            patrolMax: center + patrolRange,
            platform: ground ? 'ground' : 'platform'
        });
    }

    return placements;
}
