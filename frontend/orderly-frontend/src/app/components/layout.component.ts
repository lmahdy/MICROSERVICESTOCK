import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterOutlet],
    template: `
  <div class="shell">
    <nav class="sidebar">
      <div class="brand">🍕 Orderly</div>
      <div class="user-badge" [class.admin]="isAdmin">
        {{ isAdmin ? '🛠️ Admin' : '🛍️ Client' }}
      </div>
      <ul *ngIf="isAdmin">
        <li><a routerLink="/admin/dashboard">📊 Dashboard</a></li>
        <li><a routerLink="/admin/stores">🏪 Stores</a></li>
        <li><a routerLink="/admin/products">🍔 Products</a></li>
        <li><a routerLink="/admin/orders">📦 Orders</a></li>
        <li><a routerLink="/admin/deliveries">🚚 Deliveries</a></li>
        <li><a routerLink="/admin/complaints">📢 Complaints</a></li>
        <li><a routerLink="/admin/users">👥 Users</a></li>
      </ul>
      <ul *ngIf="!isAdmin">
        <li><a routerLink="/client/stores">🏪 Stores</a></li>
        <li><a routerLink="/client/orders">📋 My Orders</a></li>
        <li><a routerLink="/client/tracking">🚚 Track Delivery</a></li>
      </ul>
      <button class="logout-btn" (click)="logout()">🚪 Logout</button>
    </nav>
    <main class="content">
      <router-outlet></router-outlet>
    </main>
  </div>
  `,
    styles: [`
    .shell { display: flex; height: 100vh; font-family: Inter, system-ui, sans-serif; }
    .sidebar {
      width: 220px;
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
      flex-shrink: 0;
    }
    .brand { font-size: 1.4rem; font-weight: 800; margin-bottom: 12px; }
    .user-badge {
      font-size: 0.75rem;
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 4px 12px;
      margin-bottom: 28px;
      display: inline-block;
      width: fit-content;
    }
    .user-badge.admin { background: rgba(102,126,234,0.4); }
    ul { list-style: none; padding: 0; margin: 0; flex: 1; }
    li { margin-bottom: 4px; }
    a {
      display: block;
      padding: 10px 14px;
      border-radius: 10px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    a:hover, a.active { background: rgba(255,255,255,0.15); color: white; }
    .logout-btn {
      background: rgba(255,80,80,0.2);
      border: none;
      color: #ff8080;
      padding: 10px;
      border-radius: 10px;
      cursor: pointer;
      width: 100%;
      font-size: 0.9rem;
      margin-top: 16px;
    }
    .logout-btn:hover { background: rgba(255,80,80,0.4); }
    .content { flex: 1; overflow-y: auto; background: #f0f2f8; padding: 32px; }
  `]
})
export class LayoutComponent {
    isAdmin = false;
    constructor(private auth: AuthService, private router: Router) {
        this.isAdmin = auth.isAdmin();
    }
    logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
