import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';
import { ApiObject } from '../../models/object.model';

/**
 * Objects List Component
 * 
 * Displays a paginated, searchable, and sortable list of inventory items.
 * Features:
 * - Search/filter by item name (case-insensitive)
 * - Sort by name (A-Z or Z-A)
 * - Pagination (5 items per page)
 * - Support for filtering by specific IDs via query params
 */
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
  
  // Pagination configuration
  page = 1;  
  pageSize = 5;  
  
  // Track if we're filtering by specific IDs from URL query params
  filteringByIds = false;
  filteredIds: string[] = [];

  constructor(
    public objectsService: ObjectsService,
    private route: ActivatedRoute
  ) {
    // console.log('Objects List Component initialized');
  }

  ngOnInit(): void {
    // Subscribe to URL query parameters to check if we should filter by specific IDs
    // Example: /objects?id=1&id=2&id=3 will only load objects with those IDs
    this.route.queryParamMap.subscribe(params => {
      const ids = params.getAll('id');
      
      if (ids && ids.length > 0) {
        // URL has ID filters - load only those specific objects
        this.filteringByIds = true;
        this.filteredIds = ids;
        this.loadObjectsByIds(ids);
      } else {
        // No filters - load all objects
        this.filteringByIds = false;
        this.filteredIds = [];
        this.loadObjects();
      }
    });
  }

  /**
   * Computed property that returns filtered and sorted items
   * This is the data pipeline: objects -> filter by search -> sort -> return
   */
  get filteredItems(): ApiObject[] {
    let result = this.objects;
    
    // Step 1: Apply search filter if user entered a query
    // Filters by name, case-insensitive (e.g., "iPhone" matches "Apple iPhone 13")
    if (this.query) {
      result = result.filter(obj => 
        obj.name.toLowerCase().includes(this.query.toLowerCase().trim())
      );
    }
    
    // Step 2: Apply sorting if user selected a sort order
    if (this.sortOrder === 'asc') {
      // Sort A to Z using locale-aware comparison
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortOrder === 'desc') {
      // Sort Z to A
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    }
    
    return result;
  }
  
  /**
   * Returns only the items for the current page
   * Uses array.slice() to extract the relevant subset
   * Example: Page 2 with pageSize 5 shows items 5-9
   */
  get pagedItems(): ApiObject[] {
    const start = (this.page - 1) * this.pageSize;  // Calculate starting index
    return this.filteredItems.slice(start, start + this.pageSize);
  }
  
  /**
   * Calculates total number of pages based on filtered items
   */
  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.pageSize);
  }
  
  /** Sort items alphabetically A→Z and reset to first page */
  sortAZ(): void {
    this.sortOrder = 'asc';
    this.page = 1; 
  }
  
  /** Sort items reverse alphabetically Z→A and reset to first page */
  sortZA(): void {
    this.sortOrder = 'desc';
    this.page = 1;  
  }
  
  /** Clear sorting and return to default order */
  clearSort(): void {
    this.sortOrder = 'none';
    this.page = 1; 
  }
  
  /** Called when search query changes - resets pagination to page 1 */
  onSearchChange(): void {
    this.page = 1;  
  }

  /** Load all objects from the API */
  loadObjects(): void {
    this.objectsService.getObjects().subscribe({
      next: (response) => {
        // console.log('Objects loaded successfully');
        // console.log('Response:', response);
        // console.log('Total objects:', response.length);
        this.objects = response as ApiObject[];
        this.objectsService.loading.set(false);
      },
      error: (err) => {
        // console.error('Failed to load objects:', err);
        this.objectsService.error.set('Failed to load objects');
        this.objectsService.loading.set(false);
      }
    });
  }
  
  /** Load specific objects by their IDs (used when URL has query params) */
  loadObjectsByIds(ids: string[]): void {
    this.objectsService.getObjectsByIds(ids).subscribe({
      next: (response) => {
        // console.log('Objects loaded successfully (filtered by IDs)');
        // console.log('Response:', response);
        // console.log('Total objects:', response.length);
        // console.log('Requested:', ids.length, 'Received:', response.length);
        this.objects = response as ApiObject[];
        this.objectsService.loading.set(false);
      },
      error: (err) => {
        // console.error('Failed to load objects by IDs:', err);
        this.objectsService.error.set('Failed to load objects');
        this.objectsService.loading.set(false);
      }
    });
  }
}