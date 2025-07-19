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

      // Pass through response without modification since blur is now inline
      const newResponse = new Response(response.body, response);
      
      // Add performance and security headers
      newResponse.headers.set('Cache-Control', cacheControl.header);
      newResponse.headers.set('X-Content-Type-Options', 'nosniff');
      newResponse.headers.set('X-Frame-Options', 'DENY');
      newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Add Expires header for Pingdom
      const expires = new Date();
      if (isImage(url.pathname)) {
        expires.setFullYear(expires.getFullYear() + 1);
      } else if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
        expires.setFullYear(expires.getFullYear() + 1);
      } else if (url.pathname.endsWith('.html') || url.pathname === '/') {
        expires.setMinutes(expires.getMinutes() + 5);
      } else {
        expires.setDate(expires.getDate() + 7);
      }
      newResponse.headers.set('Expires', expires.toUTCString());
      
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
  // Images - cache for 1 year with immutable
  if (isImage(pathname)) {
    return {
      browserTTL: 31536000, // 1 year
      edgeTTL: 31536000,
      header: 'public, max-age=31536000, immutable'
    };
  }
  
  // CSS/JS - cache for 1 year (since we have versioned filenames)
  if (pathname.endsWith('.css') || pathname.endsWith('.js')) {
    return {
      browserTTL: 31536000, // 1 year
      edgeTTL: 31536000,
      header: 'public, max-age=31536000, immutable'
    };
  }
  
  // HTML - no cache to ensure fresh content
  if (pathname.endsWith('.html') || pathname === '/') {
    return {
      browserTTL: 0,
      edgeTTL: 60, // 1 minute edge cache
      header: 'no-cache, must-revalidate'
    };
  }
  
  // Default - cache for 1 week
  return {
    browserTTL: 604800, // 1 week
    edgeTTL: 604800,
    header: 'public, max-age=604800'
  };
}

function isImage(pathname) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
  return imageExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
}