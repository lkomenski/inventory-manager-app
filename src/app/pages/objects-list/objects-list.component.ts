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
  sortOrder: 'asc' | 'desc' | 'none' = 'none';
  
  // Pagination properties
  page = 1;
  pageSize = 5;

  constructor(public objectsService: ObjectsService) {}

  ngOnInit(): void {
    this.loadObjects();
  }

  get filteredItems(): ApiObject[] {
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
    return this.filteredItems.slice(start, start + this.pageSize);
  }
  
  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.pageSize);
  }
  
  sortAZ(): void {
    this.sortOrder = 'asc';
    this.page = 1; // Reset to first page
  }
  
  sortZA(): void {
    this.sortOrder = 'desc';
    this.page = 1; // Reset to first page
  }
  
  clearSort(): void {
    this.sortOrder = 'none';
    this.page = 1; // Reset to first page
  }
  
  onSearchChange(): void {
    this.page = 1; // Reset to first page when search changes
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
}