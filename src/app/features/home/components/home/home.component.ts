import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ObjectsService } from '../../../objects/services/objects.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-12">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-4xl md:text-5xl font-semibold mb-3 text-gray-900">
            Inventory Manager
          </h1>
          <p class="text-xl text-gray-600">
            Streamline your inventory management with ease
          </p>
        </div>

        <!-- Stats Card -->
        <div class="max-w-5xl mx-auto mb-12">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
            <h2 class="text-2xl font-semibold mb-6 text-gray-900">Overview</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
                <div class="text-4xl font-semibold mb-2 text-blue-700">
                  {{ objectCount() }}
                </div>
                <div class="text-gray-700 font-medium">Total Items</div>
              </div>
              <div class="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
                <div class="flex items-center justify-center mb-2">
                  <svg class="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div class="text-gray-700 font-medium">System Active</div>
              </div>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <div class="text-xl font-semibold mb-2 text-gray-700">
                  API
                </div>
                <div class="text-gray-600 font-medium">Connected</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Cards -->
        <div class="max-w-5xl mx-auto">
          <h2 class="text-2xl font-semibold mb-6 text-gray-900">Quick Actions</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- View All Items -->
            <a routerLink="/objects" 
               class="action-card group">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <div class="flex-grow">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    View All Items
                  </h3>
                  <p class="text-gray-600">
                    Browse and manage your complete inventory list
                  </p>
                </div>
              </div>
            </a>

            <!-- Add New Item -->
            <a routerLink="/objects/create" 
               class="action-card group">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </div>
                <div class="flex-grow">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    Add New Item
                  </h3>
                  <p class="text-gray-600">
                    Create and add a new item to your inventory
                  </p>
                </div>
              </div>
            </a>

            <!-- Account -->
            <a routerLink="/account" 
               class="action-card group">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div class="flex-grow">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    My Account
                  </h3>
                  <p class="text-gray-600">
                    View and manage your account information
                  </p>
                </div>
              </div>
            </a>

            <!-- API Info -->
            <div class="bg-white border border-gray-200 rounded-lg p-8">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div class="flex-grow">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    API Status
                  </h3>
                  <p class="text-gray-600">
                    Connected to <span class="font-medium">restful-api.dev</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <div class="text-center mt-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p class="text-gray-600 mt-4 font-medium">Loading data...</p>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="max-w-5xl mx-auto mt-12">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-700 font-medium">{{ error() }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  objectCount = signal(0);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private objectsService: ObjectsService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.loading.set(true);
    this.objectsService.getObjects().subscribe({
      next: (objects) => {
        this.objectCount.set(objects.length);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Unable to load stats');
        this.loading.set(false);
      }
    });
  }
}
