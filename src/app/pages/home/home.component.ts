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