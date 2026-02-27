import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../../services/objects.service';
import { ApiObject } from '../../../models/object.model';

/**
 * Product Detail Component
 * 
 * Displays detailed information for a single inventory item including:
 * - All item properties (name, color, price, custom fields)
 * - Delete confirmation modal
 * - Loading and error states
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.component.html'
})
export class ProductDetailComponent implements OnInit {
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
    // console.log('Product Detail Component initialized');
  }

  ngOnInit(): void {
    // console.log('Product Detail Component: ngOnInit called');
    const id = this.route.snapshot.paramMap.get('id');
    // console.log('Product ID from route:', id);
    if (id) {
      this.loadProduct(id);
    } else {
      // console.error('No product ID provided in route');
      this.error.set('No product ID provided');
    }
  }

  /**
   * Load product data from API by ID
   * Sets loading/error states appropriately
   */
  loadProduct(id?: string): void {
    const productId = id || this.route.snapshot.paramMap.get('id');
    // console.log('Loading product with ID:', productId);
    if (!productId) return;

    // DEBUGGING BREAKPOINT: Set a breakpoint here to debug product loading
    this.loading.set(true);
    this.error.set(null);
    
    this.objectsService.getObject(productId).subscribe({
      next: (data) => {
        // console.log('Product loaded successfully');
        // console.log('Product data:', data);
        this.object.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        // console.error('Failed to load product:', err);
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  /** Extract all custom field keys from object.data */
  getDataKeys(): string[] {
    const data = this.object()?.data;
    return data ? Object.keys(data) : [];
  }

  /** Format object as pretty-printed JSON */
  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
  
  /** Format value for display, showing 'N/A' for empty values */
  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return String(value);
  }

  /** Show delete confirmation modal */
  confirmDelete(): void {
    // console.log('Delete confirmation requested');
    this.showDeleteModal.set(true);
  }

  /** Close delete confirmation modal */
  cancelDelete(): void {
    // console.log('Delete cancelled');
    this.showDeleteModal.set(false);
  }

  /**
   * Delete the current product permanently
   * Navigates back to list on success
   */
  deleteProduct(): void {
    const obj = this.object();
    // console.log('Deleting product:', obj?.id);
    if (!obj?.id) return;

    // DEBUGGING BREAKPOINT: Set a breakpoint here to debug delete operation
    this.deleting.set(true);
    
    this.objectsService.deleteObject(obj.id).subscribe({
      next: () => {
        // console.log('Product deleted successfully, navigating to list');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        // console.error('Failed to delete product:', err);
        this.error.set(err.message);
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }
}