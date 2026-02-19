import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';
import { ApiObject } from '../../models/object.model';

@Component({
  selector: 'app-object-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './object-detail.component.html'
})
export class ObjectDetailComponent implements OnInit {
  object = signal<ApiObject | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  showDeleteModal = signal(false);
  deleting = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private objectsService: ObjectsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadObject(id);
    } else {
      this.error.set('No object ID provided');
    }
  }

  loadObject(id?: string): void {
    const objectId = id || this.route.snapshot.paramMap.get('id');
    if (!objectId) return;

    this.loading.set(true);
    this.error.set(null);
    
    this.objectsService.getObject(objectId).subscribe({
      next: (data) => {
        this.object.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  getDataKeys(): string[] {
    const data = this.object()?.data;
    return data ? Object.keys(data) : [];
  }

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
  
  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return String(value);
  }

  confirmDelete(): void {
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  deleteObject(): void {
    const obj = this.object();
    if (!obj?.id) return;

    this.deleting.set(true);
    
    this.objectsService.deleteObject(obj.id).subscribe({
      next: () => {
        this.router.navigate(['/objects']);
      },
      error: (err) => {
        this.error.set(err.message);
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }
}