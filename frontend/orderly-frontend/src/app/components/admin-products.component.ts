import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-products',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
  <div>
    <h1 class="page-title">🍔 Manage Products</h1>
    <div class="card">
      <h3>Create New Product</h3>
      <div class="form-row">
        <input [(ngModel)]="form.name" placeholder="Product name *" class="inp"/>
        <input [(ngModel)]="form.description" placeholder="Description" class="inp"/>
        <input [(ngModel)]="form.price" placeholder="Price (TND) *" type="number" class="inp"/>
        <select [(ngModel)]="form.storeId" class="inp">
          <option value="">Select Store *</option>
          <option *ngFor="let s of stores" [value]="s.id">{{s.name}} (ID: {{s.id}})</option>
        </select>
        <label class="check-label">
          <input type="checkbox" [(ngModel)]="form.available" style="margin-right:6px"/>Available
        </label>
        <button class="btn-primary" (click)="create()" [disabled]="!form.name || !form.price || !form.storeId">+ Create</button>
      </div>
      <div *ngIf="success" class="success">✅ {{success}}</div>
      <div *ngIf="error" class="error">❌ {{error}}</div>
    </div>
    <div class="card">
      <h3>All Products ({{products.length}})</h3>
      <input [(ngModel)]="search" placeholder="🔍 Filter by name..." class="inp search"/>
      <div class="empty" *ngIf="loading">Loading...</div>
      <table *ngIf="!loading">
        <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Store</th><th>Available</th></tr></thead>
        <tbody>
          <tr *ngFor="let p of filtered">
            <td>#{{p.id}}</td>
            <td>{{p.name}}</td>
            <td>{{p.price}} TND</td>
            <td>Store #{{p.storeId}}</td>
            <td><span [class]="p.available ? 'avail' : 'unavail'">{{p.available ? '✅ Yes' : '❌ No'}}</span></td>
          </tr>
        </tbody>
      </table>
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
    .search { max-width: 300px; margin-bottom: 16px; flex: none; }
    select.inp { background: white; }
    .check-label { font-size: 0.85rem; display: flex; align-items: center; white-space: nowrap; }
    .btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; padding: 10px 20px; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .success { color: #00a82d; margin-top: 10px; }
    .error { color: #c00; margin-top: 10px; }
    .empty { color: #aaa; font-style: italic; }
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    th { background: #f8f9ff; padding: 10px 12px; text-align: left; color: #555; }
    td { padding: 10px 12px; border-top: 1px solid #f0f0f0; }
    .avail { color: #00a82d; } .unavail { color: #c00; }
  `]
})
export class AdminProductsComponent implements OnInit {
    products: any[] = []; stores: any[] = [];
    form: any = { available: true };
    success = ''; error = ''; loading = true; search = '';

    get filtered() { return this.products.filter(p => p.name?.toLowerCase().includes(this.search.toLowerCase())); }

    constructor(private api: ApiService) { }

    ngOnInit() {
        this.api.getProducts().subscribe({ next: r => { this.products = r; this.loading = false; }, error: () => this.loading = false });
        this.api.getStores().subscribe({ next: r => this.stores = r, error: () => { } });
    }

    create() {
        this.success = ''; this.error = '';
        this.api.createProduct({ ...this.form, price: +this.form.price, storeId: +this.form.storeId }).subscribe({
            next: () => { this.success = 'Product created!'; this.form = { available: true }; this.ngOnInit(); },
            error: e => this.error = 'Error: ' + (e.error?.message || e.message)
        });
    }
}
