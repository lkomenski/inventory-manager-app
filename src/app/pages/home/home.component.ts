import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  objectCount = signal(0);
  loading = signal(false);
  error = signal<string | null>(null);
  apiConnected = signal(true);
  lastUpdated = signal<Date | null>(null);

  constructor(public objectsService: ObjectsService) {}

  ngOnInit(): void {
    this.loadStats();
  }

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