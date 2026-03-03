import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { MockAuthService } from '../../services/mock-auth-service';
import { ObjectsService } from '../../services/objects.service';
import { PublicUser } from '../../models/user-model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-component.html'
})
export class AdminComponent implements OnInit {
  auth = inject(AuthService);
  private mockAuth = inject(MockAuthService);
  private objectsService = inject(ObjectsService);

  users = signal<PublicUser[]>([]);
  objectCount = signal(0);
  loadingObjects = signal(false);

  ngOnInit(): void {
    this.users.set(this.mockAuth.getUsers());
    this.loadObjectCount();
  }

  private loadObjectCount(): void {
    this.loadingObjects.set(true);
    this.objectsService.getObjects().subscribe({
      next: (objects) => {
        this.objectCount.set(objects.length);
        this.loadingObjects.set(false);
      },
      error: () => this.loadingObjects.set(false)
    });
  }
}
