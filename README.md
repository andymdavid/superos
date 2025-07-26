# Bitcoin Adventure 🎮₿

A fun 2D platformer game celebrating Bitcoin and financial freedom! Collect Bitcoin while avoiding central banking obstacles in this retro-style web game.

![Bitcoin Adventure](assets/images/background.png)

## 🎯 Game Features

- **Engaging Platformer Gameplay**: Classic 2D platforming with modern web technology
- **Bitcoin Theme**: Collect Bitcoin coins and avoid central bank enemies
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Fullscreen Support**: Immersive gaming experience with F11 or fullscreen button
- **Progressive Levels**: Multiple levels with increasing difficulty
- **High Score System**: Track your best performances locally
- **Smooth Animations**: Fluid character movements and particle effects
- **Keyboard & Touch Controls**: Full support for both input methods

## 🎮 How to Play

### Controls
- **Arrow Keys** or **WASD**: Move left/right
- **Spacebar** or **Up Arrow**: Jump
- **P**: Pause game
- **F**: Toggle fullscreen
- **?**: Show help panel

### Objectives
- Collect as many Bitcoin (₿) as possible
- Avoid central bank enemies (they reduce your lives!)
- Reach the goal flag to complete each level
- Survive all levels to achieve victory!

### Scoring
- **Bitcoin Collection**: +100 points per coin
- **Level Completion**: +500 bonus points
- **Enemy Avoidance**: Keep your 3 lives intact for maximum score

## 🚀 Quick Start

### Option 1: Direct Play
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Start playing immediately!

### Option 2: Web Server Hosting
1. Upload all files to your web hosting service
2. Ensure the folder structure is maintained:
   ```
   your-domain.com/
   ├── index.html
   ├── styles/
   │   └── main.css
   ├── scripts/
   │   └── game_clean.js
   └── assets/
       └── images/
           ├── background.png
           ├── AndySprite.png
           ├── BTC.png
           └── Yellen.png
   ```
3. Navigate to your domain and enjoy!

## 📱 Mobile Support

Bitcoin Adventure is fully optimized for mobile devices:

- **Touch Controls**: Tap and swipe gestures
- **Responsive Layout**: Adapts to any screen size
- **Performance Optimized**: Smooth 60fps gameplay on mobile
- **Portrait & Landscape**: Works in both orientations

## ⚡ Technical Specifications

### Browser Requirements
- **Modern Web Browser** with HTML5 support
- **JavaScript Enabled**
- **Canvas Support**
- **Audio Support** (optional)

### Performance
- **Target FPS**: 60fps
- **Minimum FPS**: 30fps (with automatic optimization)
- **Memory Usage**: <50MB typical
- **Loading Time**: <5 seconds on broadband

### Technologies Used
- **Phaser.js 3.70.0**: Game engine
- **HTML5 Canvas**: Rendering
- **Web Audio API**: Sound effects
- **Local Storage**: High score persistence
- **CSS3**: Responsive styling

## 🎨 Assets & Graphics

All game assets are included:

- **Character Sprites**: Custom pixel art animations
- **Background**: Detailed parallax scrolling background
- **Bitcoin Graphics**: Animated spinning coins
- **Enemy Sprites**: Central bank themed characters
- **UI Elements**: Clean, modern interface

## 🔧 Customization

### Modifying Game Settings
Edit `scripts/game_clean.js` to customize:

```javascript
// Game configuration
const config = {
    width: 800,        // Game width
    height: 600,       // Game height
    // ... other settings
};

// Game state
window.gameState = {
    lives: 3,          // Starting lives
    level: 1,          // Starting level
    // ... other state
};
```

### Adding Levels
Extend the `createLevel()` function in `GameScene`:

```javascript
createLevel() {
    // Add more platforms
    this.platforms.create(x, y, 'platform');
    
    // Add more bitcoins
    this.bitcoins.create(x, y, 'bitcoin');
    
    // Add more enemies
    this.enemies.create(x, y, 'enemy');
}
```

### Styling
Modify `styles/main.css` to customize appearance:

```css
/* Change game container styling */
.game-container {
    border-radius: 15px;
    box-shadow: 0 0 50px rgba(247, 147, 26, 0.3);
}

/* Customize loading screen */
.loading-screen {
    background: your-custom-gradient;
}
```

## 🌐 Hosting Recommendations

### Shared Hosting
- Works with any basic web hosting
- Upload files via FTP/SFTP
- Ensure proper MIME types for .js files

### CDN & Performance
- Consider using a CDN for the assets folder
- Enable gzip compression for faster loading
- Optimize images for web if needed

### HTTPS
- Recommended for fullscreen API support
- Required for some mobile features
- Free SSL certificates available from Let's Encrypt

## 🛠️ Development

### Local Development
1. Clone the repository
2. Use a local web server (Python, Node.js, or similar)
3. Navigate to `http://localhost:PORT`

### Building for Production
The game is already production-ready! No build process required.

### Adding Features
1. Fork the repository
2. Make your changes to the appropriate files
3. Test thoroughly across different devices
4. Submit a pull request

## 📊 Performance Optimization

### Already Implemented
- **Object Pooling**: Efficient memory management
- **Sprite Batching**: Optimized rendering
- **Asset Preloading**: Faster startup times
- **FPS Monitoring**: Automatic performance tracking
- **Responsive Scaling**: Adaptive quality settings

### Manual Optimization
- Use a fast, reliable hosting service
- Enable server-side compression (gzip)
- Optimize images if loading is slow
- Use a CDN for global distribution

## 🔒 Security Features

- **Input Validation**: All user inputs are sanitized
- **CSP Headers**: Content Security Policy protection
- **XSS Protection**: Cross-site scripting prevention
- **Safe Asset Loading**: Graceful fallbacks for missing assets

## 🎯 Game Design

### Core Mechanics
- **Physics-Based Movement**: Realistic jumping and gravity
- **Collision Detection**: Precise hit detection
- **Progressive Difficulty**: Each level introduces new challenges
- **Score System**: Encourages exploration and skill improvement

### Visual Design
- **Retro Pixel Art**: Nostalgic 16-bit aesthetic
- **Bitcoin Orange**: Consistent color theming (#f7931a)
- **Smooth Animations**: 60fps character and object animations
- **Particle Effects**: Visual feedback for actions

## 📞 Support & Issues

### Common Issues

**Game won't load?**
- Check browser console for errors
- Ensure all files are uploaded correctly
- Verify web server configuration

**Poor performance?**
- Close other browser tabs
- Check system resources
- Try a different browser

**Controls not working?**
- Click on the game area to focus
- Check if JavaScript is enabled
- Try refreshing the page

### Getting Help
1. Check browser console for error messages
2. Verify all game files are present
3. Test on a different device/browser
4. Check hosting service status

## 📝 License

This project is open source and available under the MIT License.

## 🎉 Credits

- **Game Engine**: Phaser.js Community
- **Concept**: Bitcoin and cryptocurrency education
- **Development**: Built with modern web technologies
- **Inspiration**: Classic platformer games and financial freedom

---

**Ready to start your Bitcoin Adventure?** 

Just open `index.html` and begin collecting those coins! 🚀₿

*Remember: This is for educational and entertainment purposes only. Always do your own research when it comes to cryptocurrency investments.* 