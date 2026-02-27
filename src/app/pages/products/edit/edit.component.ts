import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../../services/objects.service';
import { ApiObject, APIRequest } from '../../../models/object.model';
import { DynamicObjectFormComponent, FormSubmitData, FormConfig, INVENTORY_OBJECT_FIELDS } from '../../../forms';

/**
 * EditProductComponent
 *
 * Pre-populates the inventory form with the existing item data fetched
 * by the :id route parameter, then PUTs the updated values back to the
 * API on submit. On success, waits one second (so the user sees the
 * success state) before navigating to the item's detail page.
 *
 * Two separate error signals are used so the template can distinguish
 * a failed initial load (loadError — replaces the form entirely) from
 * a failed PUT (error — shown inline inside the form).
 */
@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, RouterLink, DynamicObjectFormComponent],
  templateUrl: './edit.component.html'
})
export class EditProductComponent implements OnInit {
  /** Field definitions for the inventory form, sourced from inventory-form-config.ts. */
  inventoryFields = INVENTORY_OBJECT_FIELDS;

  /** The route :id value, stored so cancel/success navigation can reference it. */
  objectId = signal<string>('');

  /** True while the initial GET fetch is in flight. */
  loading = signal(false);

  /** Holds an error message if the initial GET fails; replaces the form in the template. */
  loadError = signal<string | null>(null);

  /** True while the PUT request is in flight — disables the submit button. */
  submitting = signal(false);

  /** Holds an error message if the PUT fails; displayed inline in the form. */
  error = signal<string | null>(null);

  /** Set to true for one second after a successful update, triggering the success state in the form. */
  success = signal(false);

  /** The raw item loaded from the API, retained so initialData can be passed to FormConfig. */
  objectData = signal<ApiObject | null>(null);

  /**
   * FormConfig passed to DynamicObjectFormComponent.
   * edit mode with customised button labels; initialData is added after
   * the item is fetched so the form fields are pre-populated.
   */
  formConfig: FormConfig = {
    mode: 'edit',
    submitButtonText: 'Update Item',
    cancelButtonText: 'Back to Details'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private objectsService: ObjectsService
  ) {}

  /** Reads the :id param from the route and triggers the initial fetch. */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.objectId.set(id);
      this.formConfig.objectId = id;
      this.loadProduct(id);
    } else {
      this.loadError.set('No product ID provided');
    }
  }

  /**
   * Fetches the existing item and merges it into formConfig as initialData
   * so DynamicObjectFormComponent pre-fills the fields.
   */
  loadProduct(id: string): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.objectsService.getObject(id).subscribe({
      next: (data) => {
        this.objectData.set(data);
        // Spread the existing config so all other options are preserved.
        this.formConfig = { ...this.formConfig, initialData: data };
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(err.message);
        this.loading.set(false);
      }
    });
  }

  /**
   * Called by DynamicObjectFormComponent's (formSubmit) output once all
   * validators pass. Maps form values onto an APIRequest and PUTs via
   * ObjectsService. On success, briefly shows a success state then
   * navigates to the item's detail page.
   */
  onFormSubmit(formData: FormSubmitData): void {
    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const updatedObject: APIRequest = {
      name: formData['name'] as string,
      data: {
        color: formData['color'],
        price: formData['price'],
        ...((formData['data'] as any) || {})
      }
    };

    this.objectsService.updateObject(this.objectId(), updatedObject).subscribe({
      next: () => {
        this.success.set(true);
        this.submitting.set(false);
        // Brief pause so the user sees the success confirmation before navigating.
        setTimeout(() => {
          this.router.navigate(['/products', this.objectId()]);
        }, 1000);
      },
      error: (err: any) => {
        this.error.set(err.message);
        this.submitting.set(false);
      }
    });
  }

  /** Navigates back to the item's detail page without saving. */
  onFormCancel(): void {
    this.router.navigate(['/products', this.objectId()]);
  }
}