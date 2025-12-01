# Satoshi's Garden 🎮₿

A browser-based 2D platformer built with Phaser 3 where you dash through a single, handcrafted level, collect sats, dodge central bankers, and race to the garden's goal flag.

![Satoshi's Garden](assets/images/background.png)

## What You Get Right Now
- **One level**: A 4,000px wide course split into six themed sections with floating platforms, pitfalls, and hostile bankers (`scripts/data/levelLayouts.js`).
- **Two playable characters**: Andy and Pete have their own idle/walk animations and can be swapped from the title screen.
- **Score + lives HUD**: Earn 10 points per bitcoin, +25 for power-up pickups, and a 100 point bonus for clearing every coin in a run (tracked as `SATS` in `GameScene`).
- **Double jump power-up**: Occasionally spawns from collected coins, lasts 10 seconds, and displays a countdown badge.
- **Local highscores & achievements**: `HighScoreManager` stores the top 10 runs, play stats, and unlocks entirely in `localStorage` (`bitcoinAdventureData`).
- **Mobile-ready UI**: When a touch device is detected the game spawns left/right/jump overlays and uses haptic feedback on hits and pickups.
- **Persistent audio state**: `SoundManager` generates SFX with the Web Audio API and streams `assets/music/CryptoQuest.mp3`, keeping music playing across scenes with toggle controls.
- **Scene set**: Title, Game, Game Over, Victory (with redirect), and High Scores screens are all wired up and switched through `scripts/main.js`.

## Controls & UI
### Keyboard
- `←` / `→` or `A` / `D`: move
- `Space` or `↑`: jump (tap twice while a power-up is active for a double jump)
- `P`: pause/resume the current scene
- `F`: toggle fullscreen (also works from DOM overlay when the canvas has focus)
- `Esc`: dismiss overlays and exit the Victory countdown back to the title screen

### Touch & On-Screen Buttons
- Touch controls (left, right, jump) appear automatically on phones/tablets.
- The `⛶` floating button toggles fullscreen for the canvas.
- The `?` floating button reveals the DOM-based instructions panel defined in `index.html`/`styles/main.css`.

## Gameplay & Scoring
- Start every run with **3 lives**; colliding with an enemy subtracts one life and respawns the player at the entrance. Zero lives routes to the Game Over scene.
- Collecting a bitcoin is worth **10 points** and increments the session's SAT counter (`gameState.currentGameBitcoins`).
- Picking up a power-up grants **25 points** and either a double-jump window (current implementation) or a future life-up.
- Clear every bitcoin in the level to receive a **100-point collection bonus**.
- Finish the level without dying to flag the run as *perfect*, which unlocks specific achievements in the High Scores scene.

## Scene Flow
- **Title Scene** (`scripts/scenes/TitleScene.js`): Loading screen fades into Satoshi's Garden branding, character cards, fullscreen + music toggles, and buttons for starting the run or reviewing highscores.
- **Game Scene** (`scripts/scenes/GameScene.js`): Builds static/floating platforms, coins, banker patrols, power-up drops, HUD elements, parallax background, sprite pooling for score text, and particle flourishes. Pacing is tuned through constants in `scripts/core/constants.js`.
- **Game Over Scene**: Shows score, coins collected, survival time, new achievements, and offers Play Again/Main Menu.
- **Victory Scene**: Displays end-of-run stats, highlights leaderboard rank + achievements, then automatically redirects to `https://otherstuff.ai` after 7 seconds (Esc cancels).
- **High Scores Scene**: Reads from `HighScoreManager` to show the leaderboard, aggregate stats (games/jumps/double jumps/power-ups/best time), and the latest unlocked achievements.

## Technology Stack
- [Phaser 3.70.0](https://phaser.io/) (CDN-loaded) for rendering, physics, camera, and scenes
- Modern HTML5 + CSS3 for loading/instructions overlays (`index.html`, `styles/main.css`)
- Vanilla ES modules (`scripts/main.js` bootstraps everything) with no bundler required
- Web Audio API based `SoundManager` for sound effects/background music
- `localStorage` for persistent highscores, statistics, and achievements

## Run It Locally
1. Clone or download the repository.
2. Because `scripts/main.js` uses ES module imports, serve the folder over HTTP (e.g. `python3 -m http.server 8080`).
3. Open `http://localhost:8080/index.html` in a modern desktop or mobile browser.
4. Click **START GAME** on the title screen to begin a run. The High Scores screen is available from the footer button on the same menu.

No additional build, transpile, or dependency steps are required.

## Project Structure
```
assets/                Static art and music (sprites, background, BTC coin, soundtrack)
scripts/
  core/               Constants, shared game state, sound + high score managers
  data/               Level layouts (platforms, coins, enemies, power-ups)
  entities/           Supporting classes (SpritePool, PowerUp)
  scenes/             Phaser scenes (Title, Game, GameOver, Victory, HighScores)
  game.js             Phaser configuration + global helpers
game.js
styles/main.css       Loading screen, fullscreen/help buttons, DOM instructions UI
index.html            Bootstraps Phaser, loading UI, and fullscreen/help controls
```

## Customize the Game
- **Gameplay tuning**: Update `scripts/core/constants.js` to tweak physics, jump force, scoring values, HUD text, or redirect targets.
- **Level content**: `scripts/data/levelLayouts.js` defines platform, coin, enemy, gap, and power-up positions for each level ID. Level 1 (Satoshi's Garden) is currently the only active level.
- **Scene logic**: Extend `scripts/scenes/GameScene.js` for new mechanics (additional power-up types, hazards, checkpoints) or add new scenes via `config.scene` in `scripts/main.js`.
- **UI/overlays**: Adjust the DOM-based loading screen, fullscreen/help buttons, or instructions panel in `index.html` and `styles/main.css`.
- **Assets & audio**: Replace or add sprites/music under `assets/` and update the loaders in `TitleScene.preload()`.

## Persistence & Save Data
`HighScoreManager` serializes data to `localStorage` under the `bitcoinAdventureData` key. It tracks:
- Top 10 high scores with completion time, sats collected, and lives remaining
- Aggregate stats (games played, coins collected, jumps, double jumps, power-ups)
- Achievement unlocks such as *First Victory*, score milestones, and collection milestones

Delete that key in DevTools if you need a clean slate for testing.

## Performance & Mobile Notes
- Phaser's FIT scaling keeps the canvas within 800×600 while supporting up to 2× resolution for fullscreen/hi-dpi displays.
- Lightweight FPS monitoring (every 10 seconds) warns in the console when the loop dips below 30 FPS.
- Object pooling (`SpritePool`) powers floating score text, and particles/power-ups are cleaned up aggressively to avoid leaks.
- Touch detection, mobile-friendly hit areas, and optional haptic feedback (`navigator.vibrate`) keep the game responsive on phones/tablets.

## Hosting Tips
- Any static host works (GitHub Pages, Netlify, S3, etc.). Keep the folder structure intact so Phaser can load assets.
- Enable gzip/HTTP compression on production hosts for faster texture/audio transfer.
- Serve over HTTPS if you want fullscreen and vibration APIs to behave consistently on mobile.

## License
This project is open source under the MIT License.

## Credits
- Design & development: SuperOS team
- Engine: Phaser.js community
- Concept inspiration: Bitcoin education meets classic platformers
