import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    ctx.startTime = startTime;
    const url = new URL(request.url);
    
    try {
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

      // Clone response to add custom headers
      const newResponse = new Response(response.body, response);
      
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