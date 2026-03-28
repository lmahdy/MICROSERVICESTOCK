import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-client-stores',
    standalone: true,
    imports: [CommonModule],
    template: `
  <div>
    <h1 class="page-title">🏪 Browse Restaurants & Stores</h1>
    <div *ngIf="loading" class="empty">Loading stores...</div>
    <div *ngIf="!loading && stores.length === 0" class="empty">No stores available yet. Ask your admin to create some!</div>
    <div class="grid" *ngIf="stores.length > 0">
      <div class="store-card" *ngFor="let s of stores" (click)="select(s)">
        <div class="store-icon">🏪</div>
        <div class="store-name">{{s.name}}</div>
        <div class="store-desc">{{s.description || 'Great food, fast delivery!'}}</div>
        <div class="store-info" *ngIf="s.address">📍 {{s.address}}</div>
        <div class="store-info" *ngIf="s.openingHours">🕐 {{s.openingHours}}</div>
        <div class="store-info" *ngIf="s.phone">📞 {{s.phone}}</div>
        <div class="view-btn">View Menu →</div>
      </div>
    </div>
  </div>
  `,
    styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 24px; }
    .empty { color: #aaa; font-style: italic; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
    .store-card {
      background: white; border-radius: 18px; padding: 24px; cursor: pointer;
      transition: all 0.2s; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      border: 2px solid transparent;
    }
    .store-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(102,126,234,0.15); border-color: #667eea; }
    .store-icon { font-size: 2.5rem; margin-bottom: 12px; }
    .store-name { font-weight: 700; font-size: 1.1rem; color: #1a1a2e; margin-bottom: 6px; }
    .store-desc { color: #777; font-size: 0.85rem; margin-bottom: 10px; }
    .store-info { font-size: 0.8rem; color: #999; margin-bottom: 3px; }
    .view-btn { margin-top: 14px; color: #667eea; font-weight: 600; font-size: 0.88rem; }
  `]
})
export class ClientStoresComponent implements OnInit {
    stores: any[] = [];
    loading = true;

    constructor(private api: ApiService, private router: Router) { }

    ngOnInit() {
        this.api.getStores().subscribe({ next: r => { this.stores = r; this.loading = false; }, error: () => this.loading = false });
    }

    select(store: any) {
        this.router.navigate(['/client/products'], { queryParams: { storeId: store.id, storeName: store.name } });
    }
}
