import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
  sortOrder: 'asc' | 'desc' | 'none' = 'none';
  
  // Pagination properties
  page = 1;
  pageSize = 5;
  
  // Track if we're filtering by IDs
  filteringByIds = false;
  filteredIds: string[] = [];

  constructor(
    public objectsService: ObjectsService,
    private route: ActivatedRoute
  ) {
    console.log('📝 Objects List Component initialized');
  }

  ngOnInit(): void {
    console.log('🚀 Objects List Component: ngOnInit called');
    
    // Check for ID query parameters
    this.route.queryParamMap.subscribe(params => {
      const ids = params.getAll('id');
      console.log('🔍 Parsed IDs from URL:', ids);
      
      if (ids && ids.length > 0) {
        console.log('🔍 Query parameters detected - Loading specific IDs:', ids);
        this.filteringByIds = true;
        this.filteredIds = ids;
        this.loadObjectsByIds(ids);
      } else {
        console.log('📋 No query parameters - Loading all objects');
        this.filteringByIds = false;
        this.filteredIds = [];
        this.loadObjects();
      }
    });
  }

  get filteredItems(): ApiObject[] {
    console.log('🔍 Filtering items - Query:', this.query, 'Sort:', this.sortOrder);
    let result = this.objects;
    
    // Apply search filter
    if (this.query) {
      result = result.filter(obj => obj.name.toLowerCase().includes(this.query.toLowerCase().trim()));
    }
    
    // Apply sorting
    if (this.sortOrder === 'asc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortOrder === 'desc') {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    }
    
    return result;
  }
  
  get pagedItems(): ApiObject[] {
    const start = (this.page - 1) * this.pageSize;
    const paged = this.filteredItems.slice(start, start + this.pageSize);
    console.log('📊 Pagination - Page:', this.page, 'Items:', paged.length, 'Total:', this.filteredItems.length);
    return paged;
  }
  
  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.pageSize);
  }
  
  sortAZ(): void {
    console.log('⬆️ Sorting A-Z');
    this.sortOrder = 'asc';
    this.page = 1; // Reset to first page
  }
  
  sortZA(): void {
    console.log('⬇️ Sorting Z-A');
    this.sortOrder = 'desc';
    this.page = 1; // Reset to first page
  }
  
  clearSort(): void {
    console.log('🔄 Clearing sort');
    this.sortOrder = 'none';
    this.page = 1; // Reset to first page
  }
  
  onSearchChange(): void {
    console.log('🔎 Search changed to:', this.query);
    this.page = 1; // Reset to first page when search changes
  }

  loadObjects(): void {
    console.log('📥 Loading objects from API...');
    // DEBUGGING BREAKPOINT: Set a breakpoint here to debug API calls
    this.objectsService.getObjects().subscribe({
      next: (response) => {
        console.log('✅ Objects loaded successfully');
        console.log('📦 Response:', response);
        console.log('📊 Total objects:', response.length);
        this.objects = response as ApiObject[];
        this.objectsService.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Failed to load objects:', err);
        this.objectsService.error.set('Failed to load objects');
        this.objectsService.loading.set(false);
      }
    });
  }
  
  loadObjectsByIds(ids: string[]): void {
    console.log('📥 Loading specific objects by IDs:', ids);
    // DEBUGGING BREAKPOINT: Set a breakpoint here to debug filtered API calls
    this.objectsService.getObjectsByIds(ids).subscribe({
      next: (response) => {
        console.log('✅ Objects loaded successfully (filtered by IDs)');
        console.log('📦 Response:', response);
        console.log('📊 Total objects:', response.length);
        console.log('🎯 Requested:', ids.length, 'Received:', response.length);
        this.objects = response as ApiObject[];
        this.objectsService.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Failed to load objects by IDs:', err);
        this.objectsService.error.set('Failed to load objects');
        this.objectsService.loading.set(false);
      }
    });
  }
}