import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const assetManifest = JSON.parse(manifestJSON);

// Ultra-tiny 20px blur placeholder for hero image (under 1KB)
const HERO_BLUR = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QKcRXhpZgAATU0AKgAAAAgACQEPAAIAAAAIAAAAegEQAAIAAAAJAAAAggESAAMAAAABAAEAAAEaAAUAAAABAAAAjAEbAAUAAAABAAAAlAEoAAMAAAABAAIAAAExAAIAAAAOAAAAnAEyAAIAAAAUAAAAqodpAAQAAAABAAAAvgAAAABzYW1zdW5nAFNNLVM5MDhFAAAAAABIAAAAAQAAAEgAAAABUzkwOEVYWFNDRllFMwAyMDI1OjA3OjE5IDE1OjM5OjI3AAAcgpoABQAAAAEAAAIUgp0ABQAAAAEAAAIciCIAAwAAAAEAAgAAiCcAAwAAAAEADAAAkAAABwAAAAQwMjIwkAMAAgAAABQAAAIkkAQAAgAAABQAAAI4kBAAAgAAAAcAAAJMkBEAAgAAAAcAAAJUkgEACgAAAAEAAAJckgIABQAAAAEAAAJkkgMACgAAAAEAAAJskgQACgAAAAEAAAJ0kgUABQAAAAEAAAJ8kgcAAwAAAAEAAgAAkgkAAwAAAAEAAAAAkgoABQAAAAEAAAKEkpAAAgAAAAQ4OTUAkpEAAgAAAAQ4OTUAkpIAAgAAAAQ4OTUAoAAABwAAAAQwMTAwoAIABAAAAAEAAAZAoAMABAAAAAEAAALrpAIAAwAAAAEAAAAApAMAAwAAAAEAAAAApAQABQAAAAEAAAKMpAUAAwAAAAEAFwAApAYAAwAAAAEAAAAAAAAAAAAABLEAGK13AAAACQAAAAUyMDI1OjA2OjE5IDE1OjE3OjE3ADIwMjU6MDY6MTkgMTU6MTc6MTcAKzA1OjMwAAArMDU6MzAAAAAABLEAGK13AAAAqQAAAGQAAAHrAAAAMgAAAAAAAAABAAAAqQAAAGQAAAAgAAAABQAAAAIAAAAB/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJHQiBYWVogB+AAAQABAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZGVzYwAAAPAAAAAkclhZWgAAARQAAAAUZ1hZWgAAASgAAAAUYlhZWgAAATwAAAAUd3RwdAAAAVAAAAAUclRSQwAAAWQAAAAoZ1RSQwAAAWQAAAAoYlRSQwAAAWQAAAAoY3BydAAAAYwAAAA8bWx1YwAAAAAAAAABAAAADGVuVVMAAAAIAAAAHABzAFIARwBCWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPWFlaIAAAAAAAAPbWAAEAAAAA0y1wYXJhAAAAAAAEAAAAAmZmAADypwAADVkAABPQAAAKWwAAAAAAAAAAbWx1YwAAAAAAAAABAAAADGVuVVMAAAAgAAAAHABHAG8AbwBnAGwAZQAgAEkAbgBjAC4AIAAyADAAMQA2/9sAQwD///////r//////////////////////////////////////////////////////////////////////////////9sAQwH//////////////////////////////////////////////////////////////////////////////////////8AAEQgACQAUAwEiAAIRAQMRAf/EABUAAQEAAAAAAAAAAAAAAAAAAAAB/8QAFhABAQEAAAAAAAAAAAAAAAAAABEB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwBS6gC0QQf/2Q==';

export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    ctx.startTime = startTime;
    const url = new URL(request.url);
    
    try {
      // No need for resize handling anymore - we have pre-generated sizes
      
      // Add trailing slash to directory requests
      if (!url.pathname.includes('.') && !url.pathname.endsWith('/')) {
        return Response.redirect(url.href + '/', 301);
      }

      // Custom cache rules based on file type
      const cacheControl = getCacheControl(url.pathname);
      
      // Check if browser supports WebP for automatic format negotiation
      const acceptHeader = request.headers.get('Accept') || '';
      const supportsWebP = acceptHeader.includes('image/webp');
      
      // Custom request mapper for potential WebP support
      const mapRequest = (request) => {
        const defaultAsset = mapRequestToAsset(request);
        // Future feature: could check for .webp version of images
        return defaultAsset;
      };
      
      // Serve static assets from KV
      const response = await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
          mapRequestToAsset: mapRequest,
          cacheControl: {
            browserTTL: cacheControl.browserTTL,
            edgeTTL: cacheControl.edgeTTL,
            bypassCache: false,
          },
        }
      );

      // Clone response to potentially modify HTML
      let body = response.body;
      let contentType = response.headers.get('content-type') || '';
      
      // If it's HTML, inject our progressive loading enhancements
      if (contentType.includes('text/html')) {
        const text = await response.text();
        // Inject blur placeholder and enhanced CSS for progressive loading
        body = text.replace('</head>', `
    <style>
      /* Progressive Image Loading */
      .hero-image {
        position: relative;
        background-image: url('${HERO_BLUR}');
        background-size: cover;
        background-position: center;
        filter: blur(0);
        transition: filter 0.3s ease-out;
      }
      
      .hero-image::before {
        content: '';
        position: absolute;
        inset: 0;
        background: inherit;
        filter: blur(20px);
        transform: scale(1.1);
        opacity: 1;
        transition: opacity 0.4s ease-out;
        z-index: 1;
      }
      
      .hero-image img {
        position: relative;
        z-index: 2;
        opacity: 0;
        transition: opacity 0.4s ease-out;
      }
      
      .hero-image img.loaded {
        opacity: 1;
      }
      
      .hero-image.loaded::before {
        opacity: 0;
      }
      
      /* Pure CSS loading detection */
      @supports (animation: 1s) {
        .hero-image img {
          animation: checkload 0.1s 0.1s forwards;
        }
        
        @keyframes checkload {
          to { opacity: 1; }
        }
        
        .hero-image:has(img[src]) {
          background-image: none;
        }
        
        .hero-image:has(img[src])::before {
          opacity: 0;
        }
      }
    </style>
    <script>
      // Minimal JS for browsers without :has() support
      if (!CSS.supports('selector(:has(*))')) {
        document.addEventListener('DOMContentLoaded', () => {
          const img = document.querySelector('.hero-image img');
          if (img.complete) {
            img.classList.add('loaded');
            img.parentElement.classList.add('loaded');
          } else {
            img.onload = () => {
              img.classList.add('loaded');
              img.parentElement.classList.add('loaded');
            };
          }
        });
      }
    </script>
</head>`);
      }
      
      const newResponse = new Response(body, response);
      
      // Add performance and security headers
      newResponse.headers.set('Cache-Control', cacheControl.header);
      newResponse.headers.set('X-Content-Type-Options', 'nosniff');
      newResponse.headers.set('X-Frame-Options', 'DENY');
      newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Add image optimization hints for browsers
      if (isImage(url.pathname)) {
        newResponse.headers.set('Accept-CH', 'DPR, Width, Viewport-Width');
        newResponse.headers.set('Vary', 'Accept-Encoding, DPR, Width');
        // Progressive JPEG hint
        if (url.pathname.endsWith('.jpg') || url.pathname.endsWith('.jpeg')) {
          newResponse.headers.set('X-Image-Mode', 'progressive');
        }
      }
      
      // Add timing headers for performance monitoring
      newResponse.headers.set('Server-Timing', `cf-worker;dur=${Date.now() - ctx.startTime}`);
      
      return newResponse;
      
    } catch (e) {
      // For 404s, return a custom 404 page or the index.html
      if (e.status === 404) {
        // For SPA-style routing, return index.html
        // For now, return a simple 404
        return new Response('Not Found', { 
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache'
          }
        });
      }
      
      // Log errors for debugging
      console.error(e);
      return new Response('Internal Server Error', { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache'
        }
      });
    }
  },
};

// Intelligent cache control based on file type
function getCacheControl(pathname) {
  // Images - cache for 1 year with revalidation
  if (isImage(pathname)) {
    return {
      browserTTL: 31536000, // 1 year
      edgeTTL: 31536000,
      header: 'public, max-age=31536000, stale-while-revalidate=86400'
    };
  }
  
  // CSS/JS - cache for 1 month
  if (pathname.endsWith('.css') || pathname.endsWith('.js')) {
    return {
      browserTTL: 2592000, // 30 days
      edgeTTL: 2592000,
      header: 'public, max-age=2592000, stale-while-revalidate=86400'
    };
  }
  
  // HTML - cache for 1 hour with revalidation
  if (pathname.endsWith('.html') || pathname === '/') {
    return {
      browserTTL: 3600, // 1 hour
      edgeTTL: 3600,
      header: 'public, max-age=3600, stale-while-revalidate=300'
    };
  }
  
  // Default - cache for 1 day
  return {
    browserTTL: 86400,
    edgeTTL: 86400,
    header: 'public, max-age=86400'
  };
}

function isImage(pathname) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
  return imageExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
}