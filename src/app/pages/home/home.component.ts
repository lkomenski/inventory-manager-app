import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';
import { AuthService } from '../../services/auth-service';

/**
 * HomeComponent
 *
 * Landing page dashboard. Fetches inventory statistics on init and
 * displays them alongside quick-action navigation cards.
 *
 * objectsService is injected publicly so the template can read
 * rate-limit signals (rateLimitRemaining, rateLimitTotal) directly
 * without needing wrapper properties on this class.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);

  /** True when the current user has the admin role. */
  isAdmin = () => this.authService.getRole() === 'admin';

  /** Running total of inventory items fetched from the API. */
  objectCount = signal(0);

  /** True while the stats fetch is in flight. */
  loading = signal(false);

  /** Holds an error message if the stats fetch fails; null otherwise. */
  error = signal<string | null>(null);

  /** Reflects whether the most recent API call succeeded. */
  apiConnected = signal(true);

  /** Timestamp of the most recent successful fetch. */
  lastUpdated = signal<Date | null>(null);

  constructor(public objectsService: ObjectsService) {}

  /** Triggers the initial stats load when the component mounts. */
  ngOnInit(): void {
    this.loadStats();
  }

  /**
   * Fetches all inventory objects to compute the item count and confirm
   * API connectivity. On error, marks the API as disconnected and
   * surfaces the message to the template via the error signal.
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