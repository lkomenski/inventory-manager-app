import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';
import { ApiObject } from '../../models/object.model';
import { AccountComponent } from '../account/account.component';

/**
 * Object Detail Component
 *
 * Displays detailed information for a single inventory item including:
 * - All item properties (name, color, price, custom fields)
 * - Quick Rename via PATCH (updates only the name, leaves data intact)
 * - Full Edit via PUT (navigates to the edit form)
 * - Delete confirmation modal
 * - Loading and error states
 */
@Component({
  selector: 'app-object-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './object-detail.component.html'
})
export class ObjectDetailComponent implements OnInit {
  object = signal<ApiObject | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  showDeleteModal = signal(false);
  deleting = signal(false);

  // PATCH – quick rename
  renaming = signal(false);
  renameValue = signal('');
  renameError = signal<string | null>(null);
  renameSuccess = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private objectsService: ObjectsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadObject(id);
    } else {
      this.error.set('No object ID provided');
    }
  }

  loadObject(id?: string): void {
    const objectId = id ?? this.route.snapshot.paramMap.get('id');
    if (!objectId) return;

    this.loading.set(true);
    this.error.set(null);

    this.objectsService.getObject(objectId).subscribe({
      next: (data) => {
        this.object.set(data);
        this.renameValue.set(data.name);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  // ── PATCH – quick rename ──────────────────────────────────────────────────

  /**
   * Sends PATCH /objects/{id} with only { name } in the body.
   * The API merges this into the existing object — data fields are untouched.
   */
  patchName(): void {
    const obj = this.object();
    const newName = this.renameValue().trim();
    if (!obj?.id || !newName || newName.length < 3) {
      this.renameError.set('Name must be at least 3 characters.');
      return;
    }

    this.renaming.set(true);
    this.renameError.set(null);
    this.renameSuccess.set(false);

    this.objectsService.patchObject(obj.id, { name: newName }).subscribe({
      next: (updated) => {
        this.object.set(updated);
        this.renaming.set(false);
        this.renameSuccess.set(true);
        AccountComponent.logActivity('Renamed item', updated.name, '✏️');
        setTimeout(() => this.renameSuccess.set(false), 3000);
      },
      error: (err) => {
        this.renameError.set(err.message);
        this.renaming.set(false);
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getDataKeys(): string[] {
    const data = this.object()?.data;
    return data ? Object.keys(data) : [];
  }

  formatJson(obj: object): string {
    return JSON.stringify(obj, null, 2);
  }

  formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return 'N/A';
    return String(value);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  confirmDelete(): void { this.showDeleteModal.set(true); }
  cancelDelete(): void { this.showDeleteModal.set(false); }

  deleteObject(): void {
    const obj = this.object();
    if (!obj?.id) return;

    this.deleting.set(true);
    const itemName = obj.name;

    this.objectsService.deleteObject(obj.id).subscribe({
      next: () => {
        AccountComponent.logActivity('Deleted item', itemName, '🗑️');
        this.router.navigate(['/objects']);
      },
      error: (err) => {
        this.error.set(err.message);
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }
}
