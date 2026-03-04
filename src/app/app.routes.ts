import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/products/list/list.component';
import { ProductDetailComponent } from './pages/products/detail/detail.component';
import { CreateProductComponent } from './pages/products/create/create.component';
import { EditProductComponent } from './pages/products/edit/edit.component';
import { AccountComponent } from './pages/account/account.component';
import { AdminComponent } from './pages/admin/admin-component';
import { LoginComponent } from './pages/auth/login/login-component';
import { RegisterComponent } from './pages/auth/register/register-component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { noAuthGuard } from './guards/no-auth.guard';

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
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [noAuthGuard],
    title: 'Login - Inventory Manager'
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
    canActivate: [noAuthGuard],
    title: 'Register - Inventory Manager'
  },
  {
    path: 'products',
    component: ProductListComponent,
    title: 'Inventory List - Inventory Manager'
  },
  {
    path: 'products/create',
    component: CreateProductComponent,
    canActivate: [authGuard, adminGuard],
    title: 'Create Item - Inventory Manager'
  },
  {
    path: 'products/:id',
    component: ProductDetailComponent,
    title: 'Item Details - Inventory Manager'
  },
  {
    path: 'products/:id/edit',
    component: EditProductComponent,
    canActivate: [authGuard, adminGuard],
    title: 'Edit Item - Inventory Manager'
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [authGuard],
    title: 'My Account - Inventory Manager'
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard],
    title: 'Admin Panel - Inventory Manager'
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 Not Found - Inventory Manager'
  }
];
