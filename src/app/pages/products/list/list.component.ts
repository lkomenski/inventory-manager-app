import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ObjectsService } from '../../../services/objects.service';
import { ApiObject } from '../../../models/object.model';

/**
 * ProductListComponent
 *
 * Displays a searchable, sortable, paginated list of inventory items.
 * On init it checks the URL for ?id= query params: when present it fetches
 * only those specific items (filteringByIds mode); otherwise it loads
 * the full inventory.
 *
 * Filtering, sorting, and pagination are all applied client-side via the
 * filteredItems and pagedItems getters so no additional API calls are
 * needed when the user changes the search query, sort order, or page.
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list.component.html'
})
export class ProductListComponent implements OnInit {
  /** Full array of items returned by the last API call. */
  objects: ApiObject[] = [];

  /** Current value of the name search field; drives filteredItems. */
  query: string = '';

  /** Current sort direction; 'none' preserves API order. */
  sortOrder: 'asc' | 'desc' | 'none' = 'none';

  /** Current page number (1-based). */
  page = 1;

  /** Number of items shown per page. */
  pageSize = 5;

  /** True when the list was opened with ?id= query params. */
  filteringByIds = false;

  /** The IDs extracted from the URL query params when filteringByIds is true. */
  filteredIds: string[] = [];

  constructor(
    public objectsService: ObjectsService,
    private route: ActivatedRoute
  ) {}

  /**
   * Subscribes to URL query params so the list reacts to navigation changes.
   * Loads only the requested IDs when ?id= params are present,
   * otherwise fetches the full inventory.
   */
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const ids = params.getAll('id');

      if (ids && ids.length > 0) {
        this.filteringByIds = true;
        this.filteredIds = ids;
        this.loadObjectsByIds(ids);
      } else {
        this.filteringByIds = false;
        this.filteredIds = [];
        this.loadObjects();
      }
    });
  }

  /**
   * Applies search and sort to the full objects array.
   * Filtering is case-insensitive and trims leading/trailing whitespace.
   * Sorting uses localeCompare for correct alphabetical ordering.
   */
  get filteredItems(): ApiObject[] {
    let result = this.objects;

    if (this.query) {
      result = result.filter(obj =>
        obj.name.toLowerCase().includes(this.query.toLowerCase().trim())
      );
    }

    if (this.sortOrder === 'asc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortOrder === 'desc') {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }

  /**
   * Slices filteredItems down to the current page window.
   * Example: page 2 with pageSize 5 returns items at indexes 5–9.
   */
  get pagedItems(): ApiObject[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  /** Total number of pages based on the filtered item count. */
  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.pageSize);
  }

  /** Sorts items A → Z and resets to page 1. */
  sortAZ(): void {
    this.sortOrder = 'asc';
    this.page = 1;
  }

  /** Sorts items Z → A and resets to page 1. */
  sortZA(): void {
    this.sortOrder = 'desc';
    this.page = 1;
  }

  /** Clears the current sort and resets to page 1. */
  clearSort(): void {
    this.sortOrder = 'none';
    this.page = 1;
  }

  /** Resets to page 1 whenever the search query changes. */
  onSearchChange(): void {
    this.page = 1;
  }

  /** Fetches all inventory items from the API. */
  loadObjects(): void {
    this.objectsService.getObjects().subscribe({
      next: (response: any) => {
        this.objects = response as ApiObject[];
        this.objectsService.loading.set(false);
      },
      error: (err: any) => {
        this.objectsService.error.set('Failed to load objects');
        this.objectsService.loading.set(false);
      }
    });
  }

  /** Fetches only the items whose IDs appear in the ?id= query params. */
  loadObjectsByIds(ids: string[]): void {
    this.objectsService.getObjectsByIds(ids).subscribe({
      next: (response: any) => {
        this.objects = response as ApiObject[];
        this.objectsService.loading.set(false);
      },
      error: (err: any) => {
        this.objectsService.error.set('Failed to load objects');
        this.objectsService.loading.set(false);
      }
    });
  }
}