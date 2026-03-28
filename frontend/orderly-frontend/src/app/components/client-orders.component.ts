import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-client-orders',
    standalone: true,
    imports: [CommonModule],
    template: `
  <div>
    <h1 class="page-title">📋 My Order History</h1>
    <div *ngIf="loading" class="empty">Loading your orders...</div>
    <div *ngIf="!loading && orders.length === 0" class="empty">You have no orders yet. Browse stores to place one!</div>
    <div class="orders" *ngIf="orders.length > 0">
      <div class="order-card" *ngFor="let o of orders">
        <div class="order-header">
          <div>
            <div class="order-id">Order #{{o.id}}</div>
            <div class="order-date">{{o.createdAt | date:'medium'}}</div>
          </div>
          <span class="badge" [class]="o.status?.toLowerCase()">{{o.status}}</span>
        </div>
        <div class="order-items" *ngIf="o.items?.length">
          <div *ngFor="let item of o.items" class="item-row">
            <span>Product #{{item.productId}}</span>
            <span>×{{item.quantity}}</span>
            <span>{{item.unitPrice}} TND each</span>
          </div>
        </div>
        <div class="order-total">Total: <strong>{{o.totalAmount | number:'1.2-2'}} TND</strong></div>
        <div class="order-addr" *ngIf="o.deliveryAddress">📍 {{o.deliveryAddress}}</div>
      </div>
    </div>
  </div>
  `,
    styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 24px; }
    .empty { color: #aaa; font-style: italic; }
    .orders { display: flex; flex-direction: column; gap: 16px; }
    .order-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
    .order-id { font-weight: 700; font-size: 1rem; color: #1a1a2e; }
    .order-date { font-size: 0.8rem; color: #999; margin-top: 2px; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
    .badge.created { background: #e3f0ff; color: #0070f3; }
    .badge.confirmed { background: #e0ffe8; color: #00a82d; }
    .badge.preparing { background: #fff7e0; color: #b07200; }
    .badge.ready { background: #e0f8ff; color: #007bbf; }
    .badge.assigned { background: #f0e0ff; color: #7200b0; }
    .badge.delivered { background: #d4f7e0; color: #006620; }
    .badge.cancelled { background: #ffe0e0; color: #c00; }
    .order-items { border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; padding: 10px 0; margin-bottom: 10px; }
    .item-row { display: flex; gap: 16px; font-size: 0.85rem; color: #555; padding: 4px 0; }
    .order-total { font-size: 0.95rem; color: #1a1a2e; }
    .order-addr { font-size: 0.82rem; color: #888; margin-top: 4px; }
  `]
})
export class ClientOrdersComponent implements OnInit {
    orders: any[] = [];
    loading = true;

    constructor(private api: ApiService, private auth: AuthService) { }

    ngOnInit() {
        const user = this.auth.getUser();
        if (!user) return;
        this.api.getOrdersByClient(user.id).subscribe({
            next: r => { this.orders = r.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); this.loading = false; },
            error: () => this.loading = false
        });
    }
}
