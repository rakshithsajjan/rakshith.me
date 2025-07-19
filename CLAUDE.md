# rakshith.me - Personal Blog Website

## Overview
This is a dark-themed personal blog website built with pure HTML/CSS and deployed on Cloudflare Workers/Pages. The site features a modern, minimalist design with excellent performance.

## Technical Stack
- **Frontend**: Pure HTML5 & CSS3 (minimal JavaScript for fallback)
- **Hosting**: Cloudflare Workers with KV Storage
- **Domain**: rakshith.me
- **Repository**: https://github.com/rakshithsajjan/rakshith.me
- **Performance**: ~20-30ms load time globally
- **Image Loading**: Advanced progressive loading with blur placeholders

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

## Blog System

### Overview
The blog uses a simple HTML-only approach - no JavaScript, no build process, just plain HTML files.

### Blog Structure
```
/public/
  /blog/
    index.html         # Blog listing page
    template.html      # Template for new posts
    getting-started.html  # Example post
    [your-posts].html  # Your blog posts
```

### Creating a New Blog Post

#### Method 1: Manual Creation
1. Copy the template: `cp public/blog/template.html public/blog/new-post-name.html`
2. Edit the HTML file with your content
3. Update `/blog/index.html` to add the post to the listing
4. Update navigation links in adjacent posts
5. Deploy: `wrangler deploy`

#### Method 2: Converting Text to Blog Post
When you give me a blob of text to convert to a blog post, I will:

1. **Create the HTML file** with proper formatting:
   - Convert paragraphs to `<p>` tags
   - Create headings from text structure
   - Format lists properly
   - Add code blocks with syntax highlighting CSS
   - Ensure proper spacing and typography

2. **Add metadata**:
   - Title in `<title>` and `<h1>` tags
   - Meta description for SEO
   - Date of publication
   - Proper navigation links

3. **Update the blog index** automatically

4. **Update homepage** if needed (latest 3 posts)

Just tell me: "Convert this to a blog post: [your text]" and I'll handle everything!

### Adding Images to Blog Posts

#### Option 1: Local Images (Recommended)
1. Add images to `/public/images/` directory
2. In your blog post HTML:
```html
<img src="/images/your-image.jpg" alt="Description of image" loading="lazy">
```

For responsive images:
```html
<picture>
    <source srcset="/images/your-image.webp" type="image/webp">
    <img src="/images/your-image.jpg" alt="Description" loading="lazy">
</picture>
```

#### Option 2: External Images
```html
<img src="https://example.com/image.jpg" alt="Description" loading="lazy">
```

#### Image Styling
The blog CSS already includes basic image styling:
```css
.post-content img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 20px 0;
}
```

For centered images with captions:
```html
<figure style="text-align: center;">
    <img src="/images/screenshot.png" alt="Screenshot description">
    <figcaption style="color: #666; font-size: 0.9em; margin-top: 10px;">
        Caption text here
    </figcaption>
</figure>
```

### Blog Post Best Practices

1. **File Naming**: Use kebab-case: `my-awesome-post.html`
2. **Titles**: Keep under 60 characters for SEO
3. **Excerpts**: Write compelling 1-2 sentence summaries
4. **Images**: 
   - Optimize before uploading (use WebP when possible)
   - Always include alt text
   - Keep under 200KB per image
5. **Code Blocks**: Use `<pre><code>` for multi-line code
6. **Links**: Use descriptive anchor text, not "click here"

### Common HTML Elements for Blog Posts

```html
<!-- Paragraph -->
<p>Your text here...</p>

<!-- Headings -->
<h2>Section Title</h2>
<h3>Subsection Title</h3>

<!-- Bold text -->
<strong>Important text</strong>

<!-- Italic text -->
<em>Emphasized text</em>

<!-- Links -->
<a href="https://example.com">Link text</a>

<!-- Unordered list -->
<ul>
    <li>First item</li>
    <li>Second item</li>
</ul>

<!-- Ordered list -->
<ol>
    <li>First step</li>
    <li>Second step</li>
</ol>

<!-- Code inline -->
<code>const variable = 'value';</code>

<!-- Code block -->
<pre><code>function example() {
    return 'Hello World';
}</code></pre>

<!-- Blockquote -->
<blockquote style="border-left: 3px solid #4a9eff; padding-left: 20px; margin: 20px 0; color: #999;">
    <p>Quote text here...</p>
</blockquote>

<!-- Horizontal rule -->
<hr style="border: 0; border-top: 1px solid #2a2a2a; margin: 40px 0;">
```

### Quick Copy-Paste Blog Post Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Title - Rakshith Sajjan</title>
    <meta name="description" content="Brief description for SEO">
    
    <style>
        /* Copy from template.html */
    </style>
</head>
<body>
    <div class="container">
        <header>
            <a href="/blog/" class="back-link">← Back to Blog</a>
        </header>

        <article>
            <h1>Your Title</h1>
            <div class="post-meta">January 20, 2025</div>

            <div class="post-content">
                <p>Introduction paragraph...</p>

                <h2>First Section</h2>
                <p>Content...</p>

                <img src="/images/example.jpg" alt="Description" loading="lazy">

                <h2>Second Section</h2>
                <p>More content...</p>

                <pre><code>// Code example
console.log('Hello');</code></pre>
            </div>
        </article>

        <nav class="post-nav">
            <a href="/blog/previous.html">← Previous Post</a>
            <a href="/blog/next.html">Next Post →</a>
        </nav>
    </div>
</body>
</html>
```

## Future Enhancements
- RSS feed (generate static XML file)
- Dark/light theme toggle (CSS custom properties)
- Blog categories/tags (separate HTML pages)
- Search functionality (would need JavaScript)
- Comments system (3rd party service like Disqus)

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