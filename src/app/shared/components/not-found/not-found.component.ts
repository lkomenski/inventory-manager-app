import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div class="text-center px-4">
        <!-- 404 Illustration -->
        <div class="text-8xl font-bold text-gray-900 mb-4">404</div>
        
        <!-- Error Message -->
        <h1 class="text-3xl font-semibold text-gray-900 mb-3">Page Not Found</h1>
        <p class="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <!-- Icon -->
        <div class="mb-8">
          <svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a routerLink="/" 
             class="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium">
            Go to Home
          </a>
          <a routerLink="/objects" 
             class="bg-gray-600 text-white px-6 py-2.5 rounded-md hover:bg-gray-700 transition-colors font-medium">
            View Inventory
          </a>
        </div>
        
        <!-- Help Text -->
        <div class="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
