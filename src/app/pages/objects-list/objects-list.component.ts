import { Component, OnInit } from '@angular/core';
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
  objects: ApiObject[] = [];
  query: string = '';
  
  // Delete modal state
  showDeleteModal: boolean = false;
  objectToDelete: ApiObject | null = null;
  deleting: boolean = false;
  
  // Sorting state
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Pagination state
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(public objectsService: ObjectsService) {}

  ngOnInit(): void {
    this.loadObjects();
  }

  get FilteredObjects(): ApiObject[] {
    if (!this.query) {
      return this.objects;
    }
    return this.objects.filter(obj => obj.name.toLowerCase().includes(this.query.toLowerCase().trim()));
  }

  get SortedObjects(): ApiObject[] {
    const filtered = [...this.FilteredObjects];
    
    return filtered.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      
      if (this.sortDirection === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  }

  get TotalPages(): number {
    return Math.ceil(this.FilteredObjects.length / this.pageSize);
  }

  get PaginatedObjects(): ApiObject[] {
    const sorted = this.SortedObjects;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(startIndex, startIndex + this.pageSize);
  }

  loadObjects(): void {
    this.objectsService.getObjects().subscribe({
      next: (response) => {
        console.log(response);
        this.objects = response as ApiObject[];
        this.objectsService.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.objectsService.error.set('Failed to load objects');
        this.objectsService.loading.set(false);
      }
    });
  }

  // Search methods
  onSearchChange(): void {
    this.currentPage = 1;
  }

  clearSearch(): void {
    this.query = '';
    this.currentPage = 1;
  }

  // Sorting methods
  onSortChange(): void {
    this.currentPage = 1;
  }

  // Pagination methods
  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.TotalPages) {
      this.currentPage = page;
    }
  }

  getVisiblePages(): number[] {
    const total = this.TotalPages;
    const current = this.currentPage;
    const pages: number[] = [];
    
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Delete methods
  confirmDelete(object: ApiObject): void {
    this.objectToDelete = object;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.objectToDelete = null;
  }

  deleteObject(): void {
    if (!this.objectToDelete?.id) return;

    this.deleting = true;
    
    this.objectsService.deleteObject(this.objectToDelete.id).subscribe({
      next: () => {
        this.objects = this.objects.filter(o => o.id !== this.objectToDelete!.id);
        this.showDeleteModal = false;
        this.objectToDelete = null;
        this.deleting = false;
        
        // Adjust page if current page is now empty
        if (this.PaginatedObjects.length === 0 && this.currentPage > 1) {
          this.currentPage = this.currentPage - 1;
        }
      },
      error: (err: any) => {
        this.objectsService.error.set(err.message || 'Failed to delete object');
        this.deleting = false;
        this.showDeleteModal = false;
      }
    });
  }

  // Utility for Math in template
  Math = Math;
}