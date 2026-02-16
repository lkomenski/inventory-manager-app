import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="bg-gray-900 text-gray-300 py-10 mt-auto border-t border-gray-800">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- About Section -->
          <div>
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
              </svg>
              Inventory Manager
            </h3>
            <p class="text-sm">
              A modern inventory management system built with Angular and powered by RESTful API.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-lg font-semibold mb-3 text-white">Quick Links</h3>
            <ul class="space-y-2 text-sm">
              <li>
                <a routerLink="/" class="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a routerLink="/objects" class="hover:text-white transition-colors">
                  Inventory List
                </a>
              </li>
              <li>
                <a routerLink="/objects/create" class="hover:text-white transition-colors">
                  Add New Item
                </a>
              </li>
              <li>
                <a routerLink="/account" class="hover:text-white transition-colors">
                  My Account
                </a>
              </li>
            </ul>
          </div>

          <!-- API Info -->
          <div>
            <h3 class="text-lg font-semibold mb-3 text-white">Technology</h3>
            <div class="text-sm space-y-1.5">
              <p>
                <span class="text-gray-400">API:</span> <span class="text-white">restful-api.dev</span>
              </p>
              <p>
                <span class="text-gray-400">Framework:</span> <span class="text-white">Angular 21</span>
              </p>
              <p>
                <span class="text-gray-400">Styling:</span> <span class="text-white">Tailwind CSS</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>&copy; 2026 Inventory Manager. Built for Academic Final Project.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
