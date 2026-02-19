import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';
import { ApiObject } from '../../models/object.model';

@Component({
  selector: 'app-objects-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './objects-list.component.html'
})
export class ObjectsListComponent implements OnInit {
  objects = signal<ApiObject[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showDeleteModal = signal(false);
  objectToDelete = signal<ApiObject | null>(null);
  deleting = signal(false);

  // Search and filter state
  searchTerm = signal<string>('');
  
  // Sorting state
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // Pagination state
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Computed properties for filtering, sorting, and pagination
  filteredObjects = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const allObjects = this.objects();
    
    if (!search) {
      return allObjects;
    }
    
    return allObjects.filter((obj: ApiObject) => 
      obj.name.toLowerCase().includes(search)
    );
  });

  sortedObjects = computed(() => {
    const filtered = [...this.filteredObjects()];
    const direction = this.sortDirection();
    
    return filtered.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      
      if (direction === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  });

  totalPages = computed(() => {
    const total = this.filteredObjects().length;
    const size = this.pageSize();
    return Math.ceil(total / size);
  });

  paginatedObjects = computed(() => {
    const sorted = this.sortedObjects();
    const page = this.currentPage();
    const size = this.pageSize();
    const startIndex = (page - 1) * size;
    
    return sorted.slice(startIndex, startIndex + size);
  });

  constructor(private readonly objectsService: ObjectsService) {}

  ngOnInit(): void {
    this.loadObjects();
  }

  loadObjects(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.objectsService.getObjects().subscribe({
      next: (data: ApiObject[]) => {
        this.objects.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  // Search methods
  onSearchChange(): void {
    // Reset to first page when search changes
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  // Sorting methods
  onSortChange(): void {
    // Reset to first page when sort changes
    this.currentPage.set(1);
  }

  // Pagination methods
  onPageSizeChange(): void {
    // Reset to first page when page size changes
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    // Show up to 5 page numbers around current page
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Delete methods
  confirmDelete(object: ApiObject): void {
    this.objectToDelete.set(object);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.objectToDelete.set(null);
  }

  deleteObject(): void {
    const object = this.objectToDelete();
    if (!object?.id) return;

    this.deleting.set(true);
    
    this.objectsService.deleteObject(object.id).subscribe({
      next: () => {
        // Remove from local list
        this.objects.update((list: ApiObject[]) => list.filter((o: ApiObject) => o.id !== object.id));
        this.showDeleteModal.set(false);
        this.objectToDelete.set(null);
        this.deleting.set(false);
        
        // Check if current page is now empty and adjust if needed
        if (this.paginatedObjects().length === 0 && this.currentPage() > 1) {
          this.currentPage.set(this.currentPage() - 1);
        }
      },
      error: (err: any) => {
        this.error.set(err.message);
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }

  // Utility method to expose Math for template
  Math = Math;
}