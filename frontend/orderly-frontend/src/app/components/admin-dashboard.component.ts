import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
  <div>
    <h1 class="page-title">📊 Admin Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card blue"><div class="stat-num">{{counts.stores}}</div><div class="stat-label">Stores</div></div>
      <div class="stat-card green"><div class="stat-num">{{counts.products}}</div><div class="stat-label">Products</div></div>
      <div class="stat-card orange"><div class="stat-num">{{counts.orders}}</div><div class="stat-label">Orders</div></div>
      <div class="stat-card red"><div class="stat-num">{{counts.complaints}}</div><div class="stat-label">Complaints</div></div>
      <div class="stat-card purple"><div class="stat-num">{{counts.deliveries}}</div><div class="stat-label">Deliveries</div></div>
      <div class="stat-card teal"><div class="stat-num">{{counts.notifications}}</div><div class="stat-label">Notifications</div></div>
    </div>
    <div class="section">
      <h3>🕐 Recent Orders</h3>
      <div class="table-wrap" *ngIf="orders.length > 0; else noOrders">
        <table>
          <thead><tr><th>ID</th><th>Client</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            <tr *ngFor="let o of orders | slice:0:8">
              <td>#{{o.id}}</td>
              <td>{{o.clientId}}</td>
              <td>{{o.totalAmount | number:'1.2-2'}} TND</td>
              <td><span class="badge" [class]="o.status.toLowerCase()">{{o.status}}</span></td>
              <td>{{o.createdAt | date:'short'}}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #noOrders><p class="empty">No orders yet.</p></ng-template>
    </div>
  </div>
  `,
    styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .stat-card { border-radius: 16px; padding: 20px; text-align: center; color: white; }
    .stat-card.blue { background: linear-gradient(135deg, #667eea, #764ba2); }
    .stat-card.green { background: linear-gradient(135deg, #11998e, #38ef7d); }
    .stat-card.orange { background: linear-gradient(135deg, #f7971e, #ffd200); }
    .stat-card.red { background: linear-gradient(135deg, #fc4a1a, #f7b733); }
    .stat-card.purple { background: linear-gradient(135deg, #a18cd1, #fbc2eb); }
    .stat-card.teal { background: linear-gradient(135deg, #2af598, #009efd); }
    .stat-num { font-size: 2rem; font-weight: 800; }
    .stat-label { font-size: 0.8rem; opacity: 0.85; }
    .section { background: white; border-radius: 16px; padding: 20px; }
    h3 { margin: 0 0 16px; font-size: 1rem; color: #444; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    th { background: #f8f9ff; padding: 10px 12px; text-align: left; color: #555; font-weight: 600; }
    td { padding: 10px 12px; border-top: 1px solid #f0f0f0; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .badge.created { background: #e3f0ff; color: #0070f3; }
    .badge.confirmed { background: #e0ffe8; color: #00a82d; }
    .badge.delivered { background: #e8ffe0; color: #1d8a00; }
    .badge.cancelled { background: #ffe0e0; color: #c00; }
    .badge.preparing { background: #fff7e0; color: #b07200; }
    .empty { color: #aaa; font-style: italic; }
  `]
})
export class AdminDashboardComponent implements OnInit {
    counts = { stores: 0, products: 0, orders: 0, complaints: 0, deliveries: 0, notifications: 0 };
    orders: any[] = [];

    constructor(private api: ApiService) { }

    ngOnInit() {
        this.api.getStores().subscribe({ next: r => this.counts.stores = r.length, error: () => { } });
        this.api.getProducts().subscribe({ next: r => this.counts.products = r.length, error: () => { } });
        this.api.getOrders().subscribe({ next: r => { this.counts.orders = r.length; this.orders = r; }, error: () => { } });
        this.api.getComplaints().subscribe({ next: r => this.counts.complaints = r.length, error: () => { } });
        this.api.getDeliveries().subscribe({ next: r => this.counts.deliveries = r.length, error: () => { } });
        this.api.getNotifications().subscribe({ next: r => this.counts.notifications = r.length, error: () => { } });
    }
}
