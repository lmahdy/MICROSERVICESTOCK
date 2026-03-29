import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const DELIVERY_STATUSES = ['ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'];

@Component({
    selector: 'app-livreur-deliveries',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
  <div>
    <h1 class="page-title">📦 My Deliveries</h1>
    <div *ngIf="loading" class="empty">Loading your deliveries...</div>
    <div *ngIf="!loading && deliveries.length === 0" class="card empty-state">
      <div class="empty-icon">🏍️</div>
      <p>No deliveries assigned to you yet.</p>
      <p class="sub">When an admin assigns a delivery to you, it will appear here.</p>
    </div>
    <div *ngIf="deliveries.length > 0">
      <div class="delivery-card" *ngFor="let d of deliveries" [class]="d.status?.toLowerCase()">
        <div class="card-header">
          <span class="delivery-id">Delivery #{{d.id}}</span>
          <span class="badge" [class]="d.status?.toLowerCase()">{{d.status | titlecase}}</span>
        </div>
        <div class="card-body">
          <div class="info-row"><span class="label">📦 Order:</span> #{{d.orderId}}</div>
          <div class="info-row" *ngIf="d.estimatedTime"><span class="label">⏱️ Est. Time:</span> {{d.estimatedTime}}</div>
          <div class="info-row" *ngIf="d.notes"><span class="label">📝 Notes:</span> {{d.notes}}</div>
          <div class="info-row"><span class="label">📅 Assigned:</span> {{d.createdAt | date:'medium'}}</div>
        </div>
        <div class="card-actions" *ngIf="d.status !== 'DELIVERED' && d.status !== 'CANCELLED'">
          <select class="status-sel" [(ngModel)]="d._newStatus">
            <option *ngFor="let s of statuses" [value]="s">{{s | titlecase}}</option>
          </select>
          <button class="update-btn" (click)="updateStatus(d)">Update Status</button>
        </div>
        <div class="card-done" *ngIf="d.status === 'DELIVERED'">
          ✅ Delivered successfully
        </div>
      </div>
    </div>
    <div *ngIf="updateMsg" class="toast success">{{updateMsg}}</div>
  </div>
  `,
    styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 24px; }
    .empty { color: #aaa; font-style: italic; }
    .card { background: white; border-radius: 16px; padding: 24px; }
    .empty-state { text-align: center; padding: 60px 40px; }
    .empty-icon { font-size: 3rem; margin-bottom: 12px; }
    .empty-state p { color: #888; margin: 4px 0; }
    .sub { font-size: 0.85rem; color: #aaa; }
    .delivery-card {
      background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px;
      border-left: 4px solid #667eea;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .delivery-card.assigned { border-left-color: #0070f3; }
    .delivery-card.picked_up { border-left-color: #f0a500; }
    .delivery-card.on_the_way { border-left-color: #9b59b6; }
    .delivery-card.delivered { border-left-color: #27ae60; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .delivery-id { font-weight: 700; font-size: 1.05rem; color: #1a1a2e; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge.assigned { background: #e3f0ff; color: #0070f3; }
    .badge.picked_up { background: #fff7e0; color: #b07200; }
    .badge.on_the_way { background: #f0e0ff; color: #7200b0; }
    .badge.delivered { background: #d4f7e0; color: #006620; }
    .card-body { margin-bottom: 14px; }
    .info-row { font-size: 0.88rem; color: #555; margin-bottom: 6px; }
    .label { font-weight: 600; color: #333; }
    .card-actions { display: flex; gap: 10px; align-items: center; }
    .status-sel { border: 1.5px solid #ddd; border-radius: 10px; padding: 8px 12px; font-size: 0.85rem; }
    .update-btn {
      background: linear-gradient(135deg, #667eea, #764ba2); color: white;
      border: none; border-radius: 10px; padding: 8px 20px;
      cursor: pointer; font-size: 0.85rem; font-weight: 600;
    }
    .card-done { color: #27ae60; font-weight: 600; font-size: 0.9rem; }
    .toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 24px;
      border-radius: 12px; font-size: 0.9rem; z-index: 999; }
    .toast.success { background: #27ae60; color: white; }
  `]
})
export class LivreurDeliveriesComponent implements OnInit {
    deliveries: any[] = [];
    statuses = DELIVERY_STATUSES;
    loading = true;
    updateMsg = '';

    constructor(private api: ApiService, private auth: AuthService) { }

    ngOnInit() { this.load(); }

    load() {
        this.loading = true;
        const courierId = this.auth.getUserId();
        this.api.getDeliveriesByCourier(courierId).subscribe({
            next: (r) => {
                this.deliveries = r.map((d: any) => ({ ...d, _newStatus: d.status }));
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    updateStatus(d: any) {
        this.api.updateDeliveryStatus(d.id, d._newStatus).subscribe({
            next: (upd) => {
                d.status = upd.status;
                this.updateMsg = `✅ Delivery #${d.id} updated to ${upd.status}`;
                setTimeout(() => this.updateMsg = '', 3000);
            },
            error: (e) => alert('Error: ' + (e.error?.message || e.message))
        });
    }
}
