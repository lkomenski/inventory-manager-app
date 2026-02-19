import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';
import { ApiObject } from '../../models/object.model';
import { AccountComponent } from '../account/account.component';

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
  ) {
    // console.log('Object Detail Component initialized');
  }

  ngOnInit(): void {
    // console.log('Object Detail Component: ngOnInit called');
    const id = this.route.snapshot.paramMap.get('id');
    // console.log('Object ID from route:', id);
    if (id) {
      this.loadObject(id);
    } else {
      // console.error('No object ID provided in route');
      this.error.set('No object ID provided');
    }
  }

  loadObject(id?: string): void {
    const objectId = id || this.route.snapshot.paramMap.get('id');
    // console.log('Loading object with ID:', objectId);
    if (!objectId) return;

    // DEBUGGING BREAKPOINT: Set a breakpoint here to debug object loading
    this.loading.set(true);
    this.error.set(null);
    
    this.objectsService.getObject(objectId).subscribe({
      next: (data) => {
        // console.log('Object loaded successfully');
        // console.log('Object data:', data);
        this.object.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        // console.error('Failed to load object:', err);
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
    // console.log('Delete confirmation requested');
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    // console.log('Delete cancelled');
    this.showDeleteModal.set(false);
  }

  deleteObject(): void {
    const obj = this.object();
    // console.log('Deleting object:', obj?.id);
    if (!obj?.id) return;

    // DEBUGGING BREAKPOINT: Set a breakpoint here to debug delete operation
    this.deleting.set(true);
    
    const itemName = obj.name; // Capture name before deletion
    
    this.objectsService.deleteObject(obj.id).subscribe({
      next: () => {
        // console.log('Object deleted successfully, navigating to list');
        
        // Log activity
        AccountComponent.logActivity('Deleted item', itemName, '🗑️');
        
        this.router.navigate(['/objects']);
      },
      error: (err) => {
        // console.error('Failed to delete object:', err);
        this.error.set(err.message);
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }
}