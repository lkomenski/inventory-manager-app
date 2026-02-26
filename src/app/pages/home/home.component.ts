import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';

/**
 * Home Page Component
 * 
 * Displays dashboard with inventory statistics including:
 * - Total item count
 * - API connection status
 * - Rate limit information 
 * - Last update timestamp
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  // Dashboard statistics
  objectCount = signal(0);
  loading = signal(false);
  error = signal<string | null>(null);
  apiConnected = signal(true);
  lastUpdated = signal<Date | null>(null);

  constructor(public objectsService: ObjectsService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  /**
   * Load dashboard statistics from API
   * Fetches all objects to count them and verify API connectivity
   */
  private loadStats(): void {
    this.loading.set(true);
    this.objectsService.getObjects().subscribe({
      next: (objects) => {
        this.objectCount.set(objects.length);
        this.apiConnected.set(true);
        this.lastUpdated.set(new Date());
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.apiConnected.set(false);
        const errorMsg = err.message || 'Unable to load stats';
        this.error.set(errorMsg);
        this.loading.set(false);
      }
    });
  }
}