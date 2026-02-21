import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="dash">
      <header>
        <h2>ORDERLY Admin Snapshot</h2>
        <small>Data via Gateway (9016)</small>
      </header>
      <div class="grid">
        <section>
          <h3>Stores</h3>
          <div *ngFor="let s of stores">{{ s.name }} � {{ s.description }}</div>
        </section>
        <section>
          <h3>Products</h3>
          <div *ngFor="let p of products">
            {{ p.name }} ({{ p.price }}) store {{ p.storeId }}
          </div>
        </section>
        <section>
          <h3>Orders</h3>
          <div *ngFor="let o of orders">
            #{{ o.id }} {{ o.status }} total {{ o.totalAmount }}
          </div>
        </section>
        <section>
          <h3>Deliveries</h3>
          <div *ngFor="let d of deliveries">
            #{{ d.id }} {{ d.status }} order {{ d.orderId }}
          </div>
        </section>
        <section>
          <h3>Complaints</h3>
          <div *ngFor="let c of complaints">
            #{{ c.id }} {{ c.status }} order {{ c.orderId }}
          </div>
        </section>
        <section>
          <h3>Users</h3>
          <div *ngFor="let u of users">{{ u.fullName }} ({{ u.role }})</div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .dash {
        padding: 24px;
        font-family:
          Inter,
          system-ui,
          -apple-system;
      }
      header {
        margin-bottom: 16px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 12px;
      }
      section {
        border: 1px solid #eee;
        border-radius: 10px;
        padding: 12px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
      }
      h3 {
        margin: 0 0 8px;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  stores: any[] = [];
  products: any[] = [];
  orders: any[] = [];
  deliveries: any[] = [];
  complaints: any[] = [];
  users: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.stores().subscribe((v) => (this.stores = v as any[]));
    this.api.products().subscribe((v) => (this.products = v as any[]));
    this.api.orders().subscribe((v) => (this.orders = v as any[]));
    this.api.deliveries().subscribe((v) => (this.deliveries = v as any[]));
    this.api.complaints().subscribe((v) => (this.complaints = v as any[]));
    this.api.users().subscribe((v) => (this.users = v as any[]));
  }
}
