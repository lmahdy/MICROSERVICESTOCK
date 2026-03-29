import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
  <div class="shell">
    <nav class="sidebar">
      <div class="brand">🍕 Orderly</div>
      <div class="user-badge" [class.admin]="isAdmin" [class.livreur]="isLivreur">
        {{ roleIcon }} {{ user?.fullName || 'User' }}
      </div>

      <!-- ADMIN NAV -->
      <ul *ngIf="isAdmin">
        <li><a routerLink="/admin/dashboard">📊 Dashboard</a></li>
        <li><a routerLink="/admin/stores">🏪 Stores</a></li>
        <li><a routerLink="/admin/products">🍔 Products</a></li>
        <li><a routerLink="/admin/orders">📦 Orders</a></li>
        <li><a routerLink="/admin/deliveries">🚚 Deliveries</a></li>
        <li><a routerLink="/admin/complaints">📢 Complaints</a></li>
        <li><a routerLink="/admin/users">👥 Users</a></li>
      </ul>

      <!-- CLIENT NAV -->
      <ul *ngIf="isClient">
        <li><a routerLink="/client/stores">🏪 Stores</a></li>
        <li><a routerLink="/client/orders">📋 My Orders</a></li>
        <li><a routerLink="/client/tracking">🚚 Track Delivery</a></li>
      </ul>

      <!-- LIVREUR NAV -->
      <ul *ngIf="isLivreur">
        <li><a routerLink="/livreur/deliveries">📦 My Deliveries</a></li>
      </ul>

      <button class="logout-btn" (click)="logout()">🚪 Logout</button>
    </nav>

    <main class="content">
      <!-- TOP BAR with notification bell -->
      <div class="top-bar">
        <div class="spacer"></div>
        <div class="bell-wrap" (click)="toggleNotifications()">
          <span class="bell-icon">🔔</span>
          <span class="unread-badge" *ngIf="unreadCount > 0">{{unreadCount > 9 ? '9+' : unreadCount}}</span>
        </div>
      </div>

      <!-- NOTIFICATION DROPDOWN -->
      <div class="notif-overlay" *ngIf="showNotifications" (click)="showNotifications = false"></div>
      <div class="notif-panel" *ngIf="showNotifications">
        <div class="notif-header">
          <h3>🔔 Notifications</h3>
          <button class="mark-all-btn" (click)="markAllRead()" *ngIf="unreadCount > 0">Mark all read</button>
        </div>
        <div class="notif-list" *ngIf="notifications.length > 0">
          <div class="notif-item" *ngFor="let n of notifications"
               [class.unread]="!n.read" (click)="markRead(n)">
            <div class="notif-title">{{n.title}}</div>
            <div class="notif-msg">{{n.message}}</div>
            <div class="notif-meta">
              <span class="notif-type">{{n.type}}</span>
              <span class="notif-time">{{n.createdAt | date:'short'}}</span>
            </div>
          </div>
        </div>
        <div class="notif-empty" *ngIf="notifications.length === 0">
          <div class="empty-icon">🔕</div>
          <p>No notifications yet</p>
        </div>
      </div>

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
      padding: 6px 14px;
      margin-bottom: 28px;
      display: inline-block;
      width: fit-content;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .user-badge.admin { background: rgba(102,126,234,0.4); }
    .user-badge.livreur { background: rgba(255,165,0,0.4); }
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
    a:hover { background: rgba(255,255,255,0.15); color: white; }
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
    .content { flex: 1; overflow-y: auto; background: #f0f2f8; display: flex; flex-direction: column; position: relative; }

    /* TOP BAR */
    .top-bar {
      display: flex; align-items: center; padding: 12px 32px;
      background: white; border-bottom: 1px solid #e8e8f0;
    }
    .spacer { flex: 1; }
    .bell-wrap {
      position: relative; cursor: pointer; padding: 8px;
      border-radius: 12px; transition: background 0.2s;
    }
    .bell-wrap:hover { background: #f0f2f8; }
    .bell-icon { font-size: 1.5rem; }
    .unread-badge {
      position: absolute; top: 2px; right: 2px;
      background: #e74c3c; color: white;
      font-size: 0.65rem; font-weight: 700;
      min-width: 18px; height: 18px;
      border-radius: 10px; display: flex;
      align-items: center; justify-content: center;
      padding: 0 4px;
    }

    /* NOTIFICATION PANEL */
    .notif-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      z-index: 99;
    }
    .notif-panel {
      position: absolute; top: 56px; right: 32px;
      width: 380px; max-height: 480px;
      background: white; border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      z-index: 100; overflow: hidden;
      display: flex; flex-direction: column;
    }
    .notif-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid #f0f0f0;
    }
    .notif-header h3 { margin: 0; font-size: 1rem; color: #1a1a2e; }
    .mark-all-btn {
      background: none; border: none; color: #667eea;
      font-size: 0.8rem; cursor: pointer; font-weight: 600;
    }
    .notif-list { overflow-y: auto; max-height: 400px; }
    .notif-item {
      padding: 14px 20px; border-bottom: 1px solid #f8f8f8;
      cursor: pointer; transition: background 0.2s;
    }
    .notif-item:hover { background: #f8f9ff; }
    .notif-item.unread { background: #f0f4ff; border-left: 3px solid #667eea; }
    .notif-title { font-weight: 600; font-size: 0.88rem; color: #1a1a2e; margin-bottom: 4px; }
    .notif-msg { font-size: 0.8rem; color: #666; line-height: 1.4; }
    .notif-meta { display: flex; justify-content: space-between; margin-top: 6px; }
    .notif-type {
      font-size: 0.7rem; background: #e8eeff; color: #667eea;
      padding: 2px 8px; border-radius: 10px; font-weight: 600;
    }
    .notif-time { font-size: 0.7rem; color: #aaa; }
    .notif-empty { text-align: center; padding: 40px 20px; color: #aaa; }
    .empty-icon { font-size: 2.5rem; margin-bottom: 8px; }
    .notif-empty p { margin: 0; }

    /* Main content padding */
    router-outlet ~ * { padding: 32px; flex: 1; }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  isAdmin = false;
  isClient = false;
  isLivreur = false;
  user: any = null;
  roleIcon = '';

  // Notifications
  showNotifications = false;
  notifications: any[] = [];
  unreadCount = 0;
  private pollInterval: any;

  constructor(private auth: AuthService, private api: ApiService, private router: Router) {
    this.user = auth.getUser();
    this.isAdmin = auth.isAdmin();
    this.isClient = auth.isClient();
    this.isLivreur = auth.isLivreur();
    this.roleIcon = this.isAdmin ? '🛠️' : this.isLivreur ? '🏍️' : '🛍️';
  }

  ngOnInit() {
    this.loadNotifications();
    // Poll for new notifications every 15 seconds
    this.pollInterval = setInterval(() => this.loadUnreadCount(), 15000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadNotifications() {
    const userId = this.auth.getUserId();
    if (!userId) return;
    this.api.getNotificationsByUser(userId).subscribe({
      next: (notifs) => {
        this.notifications = notifs;
        this.unreadCount = notifs.filter((n: any) => !n.read).length;
      },
      error: () => { }
    });
  }

  loadUnreadCount() {
    const userId = this.auth.getUserId();
    if (!userId) return;
    this.api.getUnreadCount(userId).subscribe({
      next: (res) => this.unreadCount = res.count,
      error: () => { }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.loadNotifications();
  }

  markRead(n: any) {
    if (n.read) return;
    const id = n._id || n.id;
    this.api.markNotificationRead(id).subscribe({
      next: () => {
        n.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: () => { }
    });
  }

  markAllRead() {
    const userId = this.auth.getUserId();
    this.api.markAllRead(userId).subscribe({
      next: () => {
        this.notifications.forEach((n: any) => n.read = true);
        this.unreadCount = 0;
      },
      error: () => { }
    });
  }

  logout() {
    this.auth.logout();
  }
}
