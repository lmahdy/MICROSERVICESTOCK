import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const ORDER_STATUSES = ['CREATED', 'CONFIRMED', 'PREPARING', 'READY', 'ASSIGNED', 'DELIVERED', 'CANCELLED'];

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
  <div>
    <h1 class="page-title">📦 Manage Orders</h1>
    <div class="card">
      <div class="hdr">
        <h3>All Orders ({{orders.length}})</h3>
        <button class="btn-secondary" (click)="load()">↻ Refresh</button>
      </div>
      <div *ngIf="loading" class="empty">Loading...</div>
      <div *ngIf="!loading && orders.length === 0" class="empty">No orders yet.</div>
      <div class="table-wrap" *ngIf="orders.length > 0">
        <table>
          <thead><tr><th>ID</th><th>Client</th><th>Store</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            <tr *ngFor="let o of orders">
              <td>#{{o.id}}</td>
              <td>{{o.clientId}}</td>
              <td>{{o.storeId}}</td>
              <td><strong>{{o.totalAmount | number:'1.2-2'}} TND</strong></td>
              <td><span class="badge" [class]="o.status?.toLowerCase()">{{o.status}}</span></td>
              <td>{{o.createdAt | date:'short'}}</td>
              <td>
                <select class="status-sel" [(ngModel)]="o._newStatus">
                  <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
                </select>
                <button class="update-btn" (click)="updateStatus(o)">Update</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div *ngIf="msg" class="success">✅ {{msg}}</div>
    </div>
  </div>
  `,
    styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 24px; }
    .card { background: white; border-radius: 16px; padding: 24px; }
    .hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    h3 { margin: 0; color: #333; }
    .btn-secondary { background: #f0f2f8; border: none; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-size: 0.85rem; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { background: #f8f9ff; padding: 10px 12px; text-align: left; color: #555; font-weight: 600; }
    td { padding: 10px 12px; border-top: 1px solid #f0f0f0; vertical-align: middle; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge.created { background: #e3f0ff; color: #0070f3; }
    .badge.confirmed { background: #e0ffe8; color: #00a82d; }
    .badge.preparing { background: #fff7e0; color: #b07200; }
    .badge.ready { background: #e0f8ff; color: #007bbf; }
    .badge.assigned { background: #f0e0ff; color: #7200b0; }
    .badge.delivered { background: #d4f7e0; color: #006620; }
    .badge.cancelled { background: #ffe0e0; color: #c00; }
    .status-sel { border: 1.5px solid #ddd; border-radius: 8px; padding: 4px 8px; font-size: 0.8rem; margin-right: 6px; }
    .update-btn { background: #667eea; color: white; border: none; border-radius: 8px; padding: 5px 12px; cursor: pointer; font-size: 0.8rem; }
    .success { color: #00a82d; margin-top: 12px; }
    .empty { color: #aaa; font-style: italic; }
  `]
})
export class AdminOrdersComponent implements OnInit {
    orders: any[] = [];
    statuses = ORDER_STATUSES;
    loading = true; msg = '';

    constructor(private api: ApiService) { }

    ngOnInit() { this.load(); }

    load() {
        this.loading = true;
        this.api.getOrders().subscribe({
            next: r => { this.orders = r.map((o: any) => ({ ...o, _newStatus: o.status })); this.loading = false; },
            error: () => this.loading = false
        });
    }

    updateStatus(order: any) {
        this.api.updateOrderStatus(order.id, order._newStatus).subscribe({
            next: (updated) => { order.status = updated.status; this.msg = `Order #${order.id} → ${updated.status}`; setTimeout(() => this.msg = '', 3000); },
            error: e => alert('Error: ' + (e.error?.message || e.message))
        });
    }
}
