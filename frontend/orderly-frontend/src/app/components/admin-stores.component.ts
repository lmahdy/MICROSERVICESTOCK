import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-stores',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
  <div>
    <h1 class="page-title">🏪 Manage Stores</h1>
    <div class="card">
      <h3>Create New Store</h3>
      <div class="form-row">
        <input [(ngModel)]="form.name" placeholder="Store name *" class="inp"/>
        <input [(ngModel)]="form.description" placeholder="Description" class="inp"/>
        <input [(ngModel)]="form.address" placeholder="Address" class="inp"/>
        <input [(ngModel)]="form.phone" placeholder="Phone" class="inp"/>
        <input [(ngModel)]="form.openingHours" placeholder="Opening hours (e.g. 8:00-22:00)" class="inp"/>
        <button class="btn-primary" (click)="create()" [disabled]="!form.name">+ Create Store</button>
      </div>
      <div *ngIf="success" class="success">✅ {{success}}</div>
      <div *ngIf="error" class="error">❌ {{error}}</div>
    </div>
    <div class="card">
      <h3>All Stores ({{stores.length}})</h3>
      <div *ngIf="loading" class="empty">Loading...</div>
      <div *ngIf="!loading && stores.length === 0" class="empty">No stores found. Create one above!</div>
      <div class="grid" *ngIf="stores.length > 0">
        <div class="store-card" *ngFor="let s of stores">
          <div class="store-name">{{s.name}}</div>
          <div class="store-desc">{{s.description || '—'}}</div>
          <div class="store-meta">📍 {{s.address || '—'}} | 📞 {{s.phone || '—'}}</div>
          <div class="store-meta">🕐 {{s.openingHours || '—'}}</div>
          <div class="store-id">ID: {{s.id}}</div>
        </div>
      </div>
    </div>
  </div>
  `,
    styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 24px; }
    .card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
    h3 { margin: 0 0 16px; color: #333; }
    .form-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .inp { border: 1.5px solid #ddd; border-radius: 10px; padding: 10px 14px; font-size: 0.9rem; flex: 1; min-width: 160px; outline: none; }
    .inp:focus { border-color: #667eea; }
    .btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; padding: 10px 20px; cursor: pointer; font-size: 0.9rem; white-space: nowrap; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .success { color: #00a82d; margin-top: 10px; font-size: 0.9rem; }
    .error { color: #c00; margin-top: 10px; font-size: 0.9rem; }
    .empty { color: #aaa; font-style: italic; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-top: 12px; }
    .store-card { border: 1.5px solid #eee; border-radius: 14px; padding: 16px; }
    .store-name { font-weight: 700; font-size: 1rem; margin-bottom: 4px; }
    .store-desc { color: #777; font-size: 0.85rem; margin-bottom: 6px; }
    .store-meta { font-size: 0.8rem; color: #999; }
    .store-id { font-size: 0.75rem; color: #bbb; margin-top: 8px; }
  `]
})
export class AdminStoresComponent implements OnInit {
    stores: any[] = [];
    form: any = {};
    success = '';
    error = '';
    loading = true;

    constructor(private api: ApiService) { }

    ngOnInit() { this.load(); }

    load() {
        this.loading = true;
        this.api.getStores().subscribe({ next: r => { this.stores = r; this.loading = false; }, error: () => { this.loading = false; } });
    }

    create() {
        this.success = ''; this.error = '';
        this.api.createStore(this.form).subscribe({
            next: () => { this.success = 'Store created!'; this.form = {}; this.load(); },
            error: e => this.error = 'Error: ' + (e.error?.message || e.message)
        });
    }
}
