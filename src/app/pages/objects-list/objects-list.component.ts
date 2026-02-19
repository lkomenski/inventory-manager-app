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