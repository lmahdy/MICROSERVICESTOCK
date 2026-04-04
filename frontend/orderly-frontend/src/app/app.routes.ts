import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { LayoutComponent } from './components/layout.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'stores', loadComponent: () => import('./components/admin-stores.component').then(m => m.AdminStoresComponent) },
      { path: 'products', loadComponent: () => import('./components/admin-products.component').then(m => m.AdminProductsComponent) },
      { path: 'orders', loadComponent: () => import('./components/admin-orders.component').then(m => m.AdminOrdersComponent) },
      { path: 'deliveries', loadComponent: () => import('./components/admin-deliveries.component').then(m => m.AdminDeliveriesComponent) },
      { path: 'complaints', loadComponent: () => import('./components/admin-complaints.component').then(m => m.AdminComplaintsComponent) },
      { path: 'users', loadComponent: () => import('./components/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  {
    path: 'client',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'stores', loadComponent: () => import('./components/client-stores.component').then(m => m.ClientStoresComponent) },
      { path: 'products', loadComponent: () => import('./components/client-products.component').then(m => m.ClientProductsComponent) },
      { path: 'orders', loadComponent: () => import('./components/client-orders.component').then(m => m.ClientOrdersComponent) },
      { path: 'tracking', loadComponent: () => import('./components/client-tracking.component').then(m => m.ClientTrackingComponent) },
      { path: '', redirectTo: 'stores', pathMatch: 'full' },
    ]
  },
  {
    path: 'livreur',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'deliveries', loadComponent: () => import('./components/livreur-deliveries.component').then(m => m.LivreurDeliveriesComponent) },
      { path: '', redirectTo: 'deliveries', pathMatch: 'full' },
    ]
  },
  { path: '', pathMatch: 'full', component: LoginComponent },
  { path: '**', component: LoginComponent }
];
