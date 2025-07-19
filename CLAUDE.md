# rakshith.me - Personal Blog Website

## Overview
This is a dark-themed personal blog website built with pure HTML/CSS and deployed on Cloudflare Workers/Pages. The site features a modern, minimalist design with excellent performance.

## Technical Stack
- **Frontend**: Pure HTML5 & CSS3 (no JavaScript framework)
- **Hosting**: Cloudflare Pages
- **Domain**: rakshith.me
- **Repository**: https://github.com/rakshithsajjan/rakshith.me
- **Performance**: ~20-30ms load time globally

## Design Specifications
- **Background**: #0f0f0f (near black)
- **Text**: #ffffff (white) 
- **Accent**: #4a9eff (blue)
- **Secondary Text**: #999999 (gray)
- **Card Background**: #1a1a1a
- **Font**: System font stack (-apple-system, BlinkMacSystemFont, etc.)
- **Layout**: Responsive grid, max-width 1200px
- **Hero Image**: Rounded corners (20px), full-width

## Project Structure
```
/blog-cloudflare/
├── index.html          # Main homepage
├── hero-image.jpg     # Hero section image
├── package.json       # Dependencies (optional for Pages)
├── .gitignore         # Git ignore file
└── CLAUDE.md          # This documentation
```

## Key Features
1. **Dark Theme**: Easy on the eyes with #0f0f0f background
2. **Responsive Design**: Works on all devices
3. **Fast Loading**: Static HTML/CSS, no JS frameworks
4. **SEO Friendly**: Semantic HTML structure
5. **Hover Effects**: Interactive blog post cards
6. **Clean Typography**: Professional font stack

## Deployment Process

### Initial Setup
1. Created project directory: `/Users/rakshithsajjan/blog-cloudflare/`
2. Built HTML/CSS matching the design mockup
3. Created Cloudflare Worker configuration
4. Set up GitHub repository: https://github.com/rakshithsajjan/rakshith.me

### Cloudflare Pages Deployment
Pages automatically deploys when you push to GitHub. No manual deployment needed!

### Domain Configuration
1. Domain `rakshith.me` added to Cloudflare
2. Connected via Cloudflare Dashboard → Workers & Pages → Settings → Custom Domain
3. Automatic HTTPS enabled

### Continuous Deployment
- Connected GitHub repository to Cloudflare Pages
- Auto-deploys on push to `main` branch
- Preview deployments for pull requests
- No manual deployment needed after initial setup

## Development Workflow

### Making Changes
1. Edit files locally (HTML/CSS)
2. Test locally by opening index.html in browser
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update description"
   git push
   ```
4. Changes auto-deploy to rakshith.me within ~30 seconds via Pages

### Adding New Blog Posts
1. Add new article element in `index.html`:
   ```html
   <article class="blog-post" onclick="window.location.href='/post/new-post'">
       <h2>Post Title</h2>
       <p class="date">January 20, 2025</p>
       <p>Post description...</p>
       <a href="/post/new-post" class="read-more">Read more →</a>
   </article>
   ```

2. Create individual post pages as needed

### Styling Guidelines
- Keep dark theme consistent (#0f0f0f background)
- Use system fonts for fast loading
- Maintain responsive breakpoints
- Test on mobile devices
- Keep total page size under 50KB

## Performance Optimizations
- No JavaScript frameworks (pure HTML/CSS)
- Inline critical CSS
- System font stack (no web fonts)
- Cloudflare edge caching
- Gzip compression enabled
- Total size: ~15KB

## Future Enhancements
- Individual blog post pages
- RSS feed
- Dark/light theme toggle
- Blog categories/tags
- Search functionality (if needed)
- Comments system (optional)

## Maintenance Notes
- Monitor Cloudflare analytics for performance
- Keep dependencies updated: `npm update`
- Regular content updates recommended
- Backup repository regularly
- Monitor domain renewal dates

## Commands Reference
```bash
# Test locally
open index.html

# Push changes (auto-deploys)
git add .
git commit -m "Update"
git push

# Check deployment status
# Visit Cloudflare Dashboard → Pages → rakshith.me
```

## Troubleshooting
- **Site not updating**: Check Pages deployment status in Cloudflare Dashboard
- **Image not loading**: Ensure image files are committed to GitHub
- **Domain issues**: Verify custom domain setup in Pages settings
- **Style changes not showing**: Clear browser cache or use incognito mode

## Contact
- GitHub: https://github.com/rakshithsajjan
- Website: https://rakshith.me