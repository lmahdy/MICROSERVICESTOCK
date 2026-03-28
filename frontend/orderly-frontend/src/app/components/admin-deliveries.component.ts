import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const DELIVERY_STATUSES = ['ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'];

@Component({
    selector: 'app-admin-deliveries',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
  <div>
    <h1 class="page-title">🚚 Manage Deliveries</h1>
    <div class="card">
      <h3>Create Delivery</h3>
      <div class="form-row">
        <input [(ngModel)]="form.orderId" placeholder="Order ID *" type="number" class="inp"/>
        <input [(ngModel)]="form.courierId" placeholder="Courier (User) ID *" type="number" class="inp"/>
        <input [(ngModel)]="form.estimatedTime" placeholder="Estimated time (e.g. 30 min)" class="inp"/>
        <input [(ngModel)]="form.notes" placeholder="Notes" class="inp"/>
        <button class="btn-primary" (click)="create()" [disabled]="!form.orderId || !form.courierId">+ Create Delivery</button>
      </div>
      <div *ngIf="crSuccess" class="success">✅ {{crSuccess}}</div>
      <div *ngIf="crError" class="error">❌ {{crError}}</div>
    </div>
    <div class="card">
      <div class="hdr"><h3>All Deliveries ({{deliveries.length}})</h3><button class="btn-secondary" (click)="load()">↻ Refresh</button></div>
      <div *ngIf="loading" class="empty">Loading...</div>
      <div *ngIf="!loading && deliveries.length === 0" class="empty">No deliveries yet.</div>
      <table *ngIf="deliveries.length > 0">
        <thead><tr><th>ID</th><th>Order</th><th>Courier</th><th>Status</th><th>Est. Time</th><th>Update Status</th></tr></thead>
        <tbody>
          <tr *ngFor="let d of deliveries">
            <td>#{{d.id}}</td>
            <td>Order #{{d.orderId}}</td>
            <td>Courier #{{d.courierId}}</td>
            <td><span class="badge" [class]="d.status?.toLowerCase()">{{d.status}}</span></td>
            <td>{{d.estimatedTime || '—'}}</td>
            <td>
              <select class="status-sel" [(ngModel)]="d._newStatus">
                <option *ngFor="let s of statuses" [value]="s">{{s}}</option>
              </select>
              <button class="update-btn" (click)="updateStatus(d)">Update</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="updateMsg" class="success">✅ {{updateMsg}}</div>
    </div>
  </div>
  `,
    styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 24px; }
    .card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
    .hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    h3 { margin: 0; color: #333; }
    .form-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .inp { border: 1.5px solid #ddd; border-radius: 10px; padding: 10px 14px; font-size: 0.9rem; flex: 1; min-width: 140px; outline: none; }
    .btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; padding: 10px 20px; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; }
    .btn-secondary { background: #f0f2f8; border: none; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-size: 0.85rem; }
    .success { color: #00a82d; margin-top: 10px; }
    .error { color: #c00; margin-top: 10px; }
    .empty { color: #aaa; font-style: italic; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { background: #f8f9ff; padding: 10px 12px; text-align: left; color: #555; }
    td { padding: 10px 12px; border-top: 1px solid #f0f0f0; vertical-align: middle; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge.assigned { background: #e3f0ff; color: #0070f3; }
    .badge.picked_up { background: #fff7e0; color: #b07200; }
    .badge.on_the_way { background: #f0e0ff; color: #7200b0; }
    .badge.delivered { background: #d4f7e0; color: #006620; }
    .badge.cancelled { background: #ffe0e0; color: #c00; }
    .status-sel { border: 1.5px solid #ddd; border-radius: 8px; padding: 4px 8px; font-size: 0.8rem; margin-right: 6px; }
    .update-btn { background: #667eea; color: white; border: none; border-radius: 8px; padding: 5px 12px; cursor: pointer; font-size: 0.8rem; }
  `]
})
export class AdminDeliveriesComponent implements OnInit {
    deliveries: any[] = [];
    statuses = DELIVERY_STATUSES;
    form: any = {};
    crSuccess = ''; crError = ''; updateMsg = ''; loading = true;

    constructor(private api: ApiService) { }

    ngOnInit() { this.load(); }

    load() {
        this.loading = true;
        this.api.getDeliveries().subscribe({
            next: r => { this.deliveries = r.map((d: any) => ({ ...d, _newStatus: d.status })); this.loading = false; },
            error: () => this.loading = false
        });
    }

    create() {
        this.crSuccess = ''; this.crError = '';
        this.api.createDelivery({ ...this.form, orderId: +this.form.orderId, courierId: +this.form.courierId }).subscribe({
            next: () => { this.crSuccess = 'Delivery created!'; this.form = {}; this.load(); },
            error: e => this.crError = 'Error: ' + (e.error?.message || e.message)
        });
    }

    updateStatus(d: any) {
        this.api.updateDeliveryStatus(d.id, d._newStatus).subscribe({
            next: (upd) => { d.status = upd.status; this.updateMsg = `Delivery #${d.id} → ${upd.status}`; setTimeout(() => this.updateMsg = '', 3000); },
            error: e => alert('Error: ' + (e.error?.message || e.message))
        });
    }
}
