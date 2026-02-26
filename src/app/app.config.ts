import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';

/**
 * Application Configuration
 * 
 * Modern Angular standalone app configuration using provider functions.
 * This replaces the traditional NgModule approach.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Global error handling for uncaught errors
    provideBrowserGlobalErrorListeners(),
    
    // Routing configuration
    provideRouter(routes),
    
    // HTTP client with modern Fetch API (replaces XMLHttpRequest)
    provideHttpClient(withFetch()),
    
    // SSR (Server-Side Rendering) configuration
    provideClientHydration(
      withEventReplay(),  // Replay user events during hydration
      withHttpTransferCacheOptions({
        // Cache API rate limit headers for SSR/client transfer
        includeHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Limit']
      })
    )
  ]
};
