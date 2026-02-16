import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/components/home/home.component';
import { ObjectsListComponent } from './features/objects/components/objects-list/objects-list.component';
import { ObjectDetailComponent } from './features/objects/components/object-detail/object-detail.component';
import { CreateObjectComponent } from './features/objects/components/create-object/create-object.component';
import { EditObjectComponent } from './features/objects/components/edit-object/edit-object.component';
import { AccountComponent } from './features/account/components/account/account.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home - Inventory Manager'
  },
  {
    path: 'objects',
    component: ObjectsListComponent,
    title: 'Inventory List - Inventory Manager'
  },
  {
    path: 'objects/create',
    component: CreateObjectComponent,
    title: 'Create Item - Inventory Manager'
  },
  {
    path: 'objects/:id',
    component: ObjectDetailComponent,
    title: 'Item Details - Inventory Manager'
  },
  {
    path: 'objects/:id/edit',
    component: EditObjectComponent,
    title: 'Edit Item - Inventory Manager'
  },
  {
    path: 'account',
    component: AccountComponent,
    title: 'My Account - Inventory Manager'
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 Not Found - Inventory Manager'
  }
];
