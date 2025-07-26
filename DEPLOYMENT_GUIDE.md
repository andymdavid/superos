# Bitcoin Adventure - Deployment Guide 🚀

This guide will help you deploy Bitcoin Adventure to various hosting platforms for standalone web hosting.

## 📁 Required Files

Ensure you have all these files for deployment:

```
bitcoin-adventure/
├── index.html              # Main game page
├── styles/
│   └── main.css            # Game styling
├── scripts/
│   └── game_clean.js       # Clean game code (no Wix dependencies)
├── assets/
│   └── images/
│       ├── background.png  # Game background
│       ├── AndySprite.png  # Player character sprites
│       ├── BTC.png         # Bitcoin coin sprites
│       └── Yellen.png      # Enemy sprites
├── README.md               # Documentation
└── DEPLOYMENT_GUIDE.md     # This file
```

## 🌐 Hosting Platforms

### 1. GitHub Pages (Free)

**Steps:**
1. Create a new GitHub repository
2. Upload all game files to the repository
3. Go to Settings → Pages
4. Select "Deploy from a branch" → "main" → "/ (root)"
5. Your game will be available at: `https://username.github.io/repository-name`

**Pros:** Free, automatic HTTPS, easy updates
**Cons:** Public repositories only (for free accounts)

### 2. Netlify (Free Tier Available)

**Steps:**
1. Create account at netlify.com
2. Drag and drop your game folder to Netlify dashboard
3. Get instant deployment with custom domain option
4. Automatic HTTPS and CDN included

**Pros:** Easy deployment, excellent performance, custom domains
**Cons:** Limited bandwidth on free tier

### 3. Vercel (Free Tier Available)

**Steps:**
1. Create account at vercel.com
2. Connect your GitHub repository or upload files
3. Automatic deployment with global CDN
4. Custom domain support

**Pros:** Excellent performance, automatic deployments
**Cons:** Primarily designed for frameworks (but works great for static sites)

### 4. Traditional Web Hosting

**Steps:**
1. Purchase hosting from any provider (Bluehost, SiteGround, etc.)
2. Upload files via FTP/SFTP to public_html or www folder
3. Ensure proper file permissions (644 for files, 755 for folders)
4. Access via your domain name

**Pros:** Full control, custom server configuration
**Cons:** Costs money, requires more technical knowledge

### 5. Firebase Hosting (Free Tier Available)

**Steps:**
1. Create Firebase project at firebase.google.com
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Initialize hosting: `firebase init hosting`
4. Deploy: `firebase deploy`

**Pros:** Google infrastructure, excellent performance
**Cons:** Requires Node.js and CLI knowledge

## ⚙️ Server Configuration

### MIME Types
Ensure your server serves these files with correct MIME types:

```
.html → text/html
.css  → text/css
.js   → application/javascript
.png  → image/png
.ico  → image/x-icon
```

### Compression
Enable gzip compression for better performance:

**Apache (.htaccess):**
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

**Nginx:**
```nginx
gzip on;
gzip_types text/html text/css application/javascript;
```

### Caching Headers
Set appropriate cache headers for assets:

**Apache (.htaccess):**
```apache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>
```

## 🔒 Security Considerations

### HTTPS
- **Required for:** Fullscreen API, some mobile features
- **Recommended for:** All deployments
- **Free options:** Let's Encrypt, Cloudflare

### Content Security Policy
The game includes CSP headers in the HTML. Adjust if needed:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;">
```

## 📊 Performance Optimization

### Image Optimization
If loading is slow, optimize images:

```bash
# Using ImageMagick
convert background.png -quality 85 background.png

# Using online tools
# TinyPNG, ImageOptim, or similar
```

### CDN Setup
For global performance, use a CDN:

1. **Cloudflare** (Free): Add your domain to Cloudflare
2. **AWS CloudFront**: Upload assets to S3, distribute via CloudFront
3. **jsDelivr**: For the Phaser.js library (already configured)

### Asset Loading
The game already includes:
- Progressive loading with fallbacks
- Asset preloading
- Error handling for missing files

## 🧪 Testing Your Deployment

### Pre-Deployment Checklist
- [ ] All files uploaded correctly
- [ ] Folder structure maintained
- [ ] HTTPS enabled
- [ ] MIME types configured
- [ ] Compression enabled

### Testing Steps
1. **Load Test**: Open the game URL in browser
2. **Console Check**: Open browser dev tools, check for errors
3. **Mobile Test**: Test on actual mobile devices
4. **Performance Test**: Check loading speed and FPS
5. **Cross-Browser Test**: Test in Chrome, Firefox, Safari, Edge

### Common Issues

**Game doesn't load:**
- Check browser console for 404 errors
- Verify all files are uploaded
- Check file permissions (644/755)

**Poor performance:**
- Enable compression
- Optimize images
- Use a CDN
- Check server response times

**Fullscreen not working:**
- Ensure HTTPS is enabled
- Check browser compatibility

## 📱 Mobile Optimization

### Viewport Configuration
Already included in index.html:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
```

### Touch Events
The game includes touch support, but ensure your server:
- Serves files quickly (< 200ms response time)
- Has good mobile network optimization
- Uses appropriate image sizes

## 🔄 Updates and Maintenance

### Updating the Game
1. Make changes to local files
2. Test locally using a web server
3. Upload changed files to your hosting
4. Clear browser cache if needed

### Version Control
Consider using Git for version control:
```bash
git init
git add .
git commit -m "Initial Bitcoin Adventure deployment"
git remote add origin your-repo-url
git push -u origin main
```

### Monitoring
- Check game performance regularly
- Monitor server logs for errors
- Update Phaser.js version occasionally
- Keep security headers up to date

## 🎯 Platform-Specific Tips

### GitHub Pages
- Use relative paths only
- Keep repository public for free hosting
- Enable HTTPS in repository settings

### Netlify
- Use `_redirects` file for custom redirects
- Enable form handling if adding contact forms
- Use Netlify Functions for advanced features

### Traditional Hosting
- Use FTP clients like FileZilla
- Set up automatic backups
- Monitor bandwidth usage

### Firebase
- Use Firebase Analytics for game metrics
- Consider Firebase Performance Monitoring
- Utilize Firebase's global CDN

## 🚀 Going Live

### Final Steps
1. **Domain Setup**: Point your domain to hosting
2. **SSL Certificate**: Ensure HTTPS is working
3. **Testing**: Final cross-platform testing
4. **Launch**: Share your game with the world!

### Sharing Your Game
- Social media posts with screenshots
- Gaming communities and forums
- Bitcoin/crypto communities
- Friends and family

---

**Your Bitcoin Adventure is ready for the world!** 🎮₿

Need help? Check the main README.md for troubleshooting tips. 