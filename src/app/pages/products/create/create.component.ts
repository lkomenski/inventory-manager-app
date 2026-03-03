import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../../services/objects.service';
import { APIRequest } from '../../../models/object.model';
import { DynamicObjectFormComponent, FormSubmitData, FormConfig, INVENTORY_OBJECT_FIELDS } from '../../../forms';

/**
 * CreateProductComponent
 *
 * Form page for adding a new inventory item.
 *
 * On a successful POST the component waits one second (so the success
 * state is briefly visible to the user) then navigates to the new
 * item's detail page using the id returned by the API.
 *
 * Design note — why DynamicObjectFormComponent:
 *   Field definitions and validators are declared once in INVENTORY_OBJECT_FIELDS
 *   (inventory-form-config.ts). This component only needs to map the submitted
 *   values onto an APIRequest shape and handle the result — no FormBuilder
 *   boilerplate required here.
 */
@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, RouterLink, DynamicObjectFormComponent],
  templateUrl: './create.component.html'
})
export class CreateProductComponent {
  /** Field definitions for the inventory form, sourced from inventory-form-config.ts. */
  inventoryFields = INVENTORY_OBJECT_FIELDS;

  /** True while the create API call is in flight — disables the submit button. */
  submitting = signal(false);

  /** Holds an API error message if the create call fails; null otherwise. */
  error = signal<string | null>(null);

  /** Set to true for one second after a successful create, triggering the success state in the form. */
  success = signal(false);

  /**
   * FormConfig passed to DynamicObjectFormComponent.
   * create mode with customised button labels for this page.
   */
  formConfig: FormConfig = {
    mode: 'create',
    submitButtonText: 'Create Item',
    cancelButtonText: 'Back to List'
  };

  constructor(
    private router: Router,
    private objectsService: ObjectsService
  ) {}

  /**
   * Called by DynamicObjectFormComponent's (formSubmit) output once all
   * validators pass. Maps form values onto an APIRequest and POSTs via
   * ObjectsService. On success, briefly shows a success state then
   * navigates to the new item's detail page.
   */
  onFormSubmit(formData: FormSubmitData): void {
    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const newObject: APIRequest = {
      name: formData['name'] as string,
      data: {
        color: formData['color'],
        price: formData['price'],
        ...((formData['data'] as any) || {})
      }
    };

    // DEBUGGING BREAKPOINT: Inspect newObject to verify the name, color, price,
    // and any custom fields are mapped correctly before the POST is sent.
    this.objectsService.createObject(newObject).subscribe({
      next: (created) => {
        // DEBUGGING BREAKPOINT: Inspect created.id — this is the API-assigned ID
        // used for the redirect. If navigation fails, verify this value is truthy.
        this.success.set(true);
        this.submitting.set(false);

        // Brief pause so the user sees the success confirmation before navigating.
        setTimeout(() => {
          this.router.navigate(['/products', created.id]);
        }, 1000);
      },
      error: (err) => {
        this.error.set(err.message);
        this.submitting.set(false);
      }
    });
  }

  /** Navigates back to the inventory list without saving. */
  onFormCancel(): void {
    this.router.navigate(['/products']);
  }
}