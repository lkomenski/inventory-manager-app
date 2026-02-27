import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../../services/objects.service';
import { ApiObject } from '../../../models/object.model';

/**
 * ProductDetailComponent
 *
 * Displays all stored fields for a single inventory item, resolved by
 * the :id route parameter. Also owns the delete flow: a confirmation
 * modal is shown before the DELETE request is sent, and the user is
 * returned to the list on success.
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  /** The loaded inventory item; null until the fetch completes. */
  object = signal<ApiObject | null>(null);

  /** True while the detail fetch is in flight. */
  loading = signal(false);

  /** Holds an error message if any API call fails; null otherwise. */
  error = signal<string | null>(null);

  /** Controls visibility of the delete confirmation modal. */
  showDeleteModal = signal(false);

  /** True while the DELETE request is in flight — disables modal buttons. */
  deleting = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private objectsService: ObjectsService
  ) {}

  /** Reads the :id param from the route and triggers the initial fetch. */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    } else {
      this.error.set('No product ID provided');
    }
  }

  /**
   * Fetches a single inventory item by ID. Called on init and again
   * if the user clicks "Try Again" after an error.
   */
  loadProduct(id?: string): void {
    const productId = id || this.route.snapshot.paramMap.get('id');
    if (!productId) return;

    this.loading.set(true);
    this.error.set(null);

    this.objectsService.getObject(productId).subscribe({
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

  /** Returns the keys of the item's data object, used to render custom fields. */
  getDataKeys(): string[] {
    const data = this.object()?.data;
    return data ? Object.keys(data) : [];
  }

  /** Serialises the full item to indented JSON for the raw-data section. */
  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  /** Returns a display-safe string, substituting 'N/A' for null/undefined/empty. */
  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return String(value);
  }

  /** Opens the delete confirmation modal. */
  confirmDelete(): void {
    this.showDeleteModal.set(true);
  }

  /** Closes the delete confirmation modal without deleting. */
  cancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  /**
   * Sends the DELETE request for the current item.
   * Navigates to the list on success; surfaces the error message on failure
   * and closes the modal so the user can retry.
   */
  deleteProduct(): void {
    const obj = this.object();
    if (!obj?.id) return;

    this.deleting.set(true);

    this.objectsService.deleteObject(obj.id).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.error.set(err.message);
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }
}