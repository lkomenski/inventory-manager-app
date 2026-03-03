import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ObjectsListComponent } from './pages/objects-list/objects-list.component';
import { ObjectDetailComponent } from './pages/object-detail/object-detail.component';
import { CreateObjectComponent } from './pages/object-create/object-create.component';
import { EditObjectComponent } from './pages/object-edit/object-edit.component';
import { AccountComponent } from './pages/account/account.component';
import { LoginComponent } from './pages/auth/login/login-component';
import { RegisterComponent } from './pages/auth/register/register-component';
import { AdminComponent } from './pages/admin/admin-component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home - Inventory Manager'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login - Inventory Manager'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Register - Inventory Manager'
  },
  {
    path: 'objects',
    component: ObjectsListComponent,
    title: 'Inventory List - Inventory Manager'
  },
  {
    path: 'objects/create',
    component: CreateObjectComponent,
    title: 'Create Item - Inventory Manager',
    canActivate: [authGuard]
  },
  {
    path: 'objects/:id',
    component: ObjectDetailComponent,
    title: 'Item Details - Inventory Manager'
  },
  {
    path: 'objects/:id/edit',
    component: EditObjectComponent,
    title: 'Edit Item - Inventory Manager',
    canActivate: [authGuard]
  },
  {
    path: 'account',
    component: AccountComponent,
    title: 'My Account - Inventory Manager',
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    title: 'Admin - Inventory Manager',
    canActivate: [adminGuard]
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 Not Found - Inventory Manager'
  }
];
