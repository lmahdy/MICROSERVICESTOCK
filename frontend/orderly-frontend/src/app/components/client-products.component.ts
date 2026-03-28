import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';

@Component({
    selector: 'app-client-products',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
  <div>
    <button class="back-btn" (click)="back()">&larr; Back to Stores</button>
    <h1 class="page-title">Products at {{storeName}}</h1>
    <div *ngIf="loading" class="empty">Loading products...</div>
    <div *ngIf="!loading && products.length === 0" class="empty">No products available in this store.</div>
    <div class="grid" *ngIf="products.length > 0">
      <div class="product-card" *ngFor="let p of products" [class.in-cart]="isInCart(p)">
        <div class="product-name">{{p.name}}</div>
        <div class="product-desc">{{p.description || ''}}</div>
        <div class="product-price">{{p.price | number:'1.2-2'}} TND</div>
        <div class="avail" [class.unavail]="!p.available">{{p.available !== false ? 'Available' : 'Unavailable'}}</div>
        <div class="qty-row" *ngIf="p.available !== false">
          <button class="qty-btn" (click)="decQty(p)">-</button>
          <span class="qty-display">{{p._qty}}</span>
          <button class="qty-btn" (click)="incQty(p)">+</button>
          <button class="add-btn" (click)="addToCart(p)">
            {{isInCart(p) ? 'Update Cart' : 'Add to Cart'}}
          </button>
        </div>
        <div *ngIf="p._added" class="added-msg">Added!</div>
      </div>
    </div>

    <div class="cart-panel" *ngIf="cart.length > 0">
      <h3>My Order ({{cart.length}} item{{cart.length > 1 ? 's' : ''}})</h3>
      <div *ngFor="let item of cart; let i = index" class="cart-item">
        <div class="cart-item-info">
          <span class="cart-item-name">{{item.name}}</span>
          <span class="cart-item-detail">{{item.price | number:'1.2-2'}} TND x {{item.qty}}</span>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-total">{{(item.price * item.qty) | number:'1.2-2'}} TND</span>
          <button class="remove-btn" (click)="removeFromCart(i)" title="Remove">&times;</button>
        </div>
      </div>
      <div class="cart-total">Total: <strong>{{cartTotal | number:'1.2-2'}} TND</strong></div>
      <input [(ngModel)]="deliveryAddress" placeholder="Enter your delivery address" class="inp"/>
      <button class="order-btn" (click)="placeOrder()" [disabled]="!deliveryAddress.trim() || ordering || cart.length === 0">
        {{ordering ? 'Placing order...' : 'Place Order'}}
      </button>
      <div *ngIf="orderSuccess" class="success">{{orderSuccess}}</div>
      <div *ngIf="orderError" class="error">{{orderError}}</div>
    </div>
  </div>
  `,
    styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 24px; }
    .back-btn { background: none; border: 1.5px solid #ddd; border-radius: 8px; padding: 6px 14px; cursor: pointer; margin-bottom: 16px; color: #555; }
    .back-btn:hover { background: #f5f5f5; }
    .empty { color: #aaa; font-style: italic; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; margin-bottom: 28px; }
    .product-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 2px solid transparent; transition: border-color 0.2s; }
    .product-card.in-cart { border-color: #667eea; }
    .product-name { font-weight: 700; font-size: 1rem; margin-bottom: 4px; }
    .product-desc { color: #777; font-size: 0.82rem; margin-bottom: 8px; }
    .product-price { color: #667eea; font-weight: 700; font-size: 1.1rem; margin-bottom: 6px; }
    .avail { font-size: 0.8rem; margin-bottom: 10px; color: #00a82d; }
    .unavail { color: #c00; }
    .qty-row { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
    .qty-btn { width: 30px; height: 30px; border: 1.5px solid #ddd; border-radius: 8px; background: #f8f9ff; cursor: pointer; font-size: 1rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .qty-btn:hover { background: #e8eaff; border-color: #667eea; }
    .qty-display { min-width: 28px; text-align: center; font-weight: 700; font-size: 1rem; }
    .add-btn { background: #667eea; color: white; border: none; border-radius: 8px; padding: 6px 14px; cursor: pointer; font-size: 0.82rem; margin-left: auto; }
    .add-btn:hover { background: #5a6fd6; }
    .added-msg { color: #00a82d; font-size: 0.8rem; margin-top: 6px; font-weight: 600; }
    .cart-panel { background: white; border-radius: 16px; padding: 24px; margin-top: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    h3 { margin: 0 0 14px; color: #1a1a2e; }
    .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .cart-item-info { display: flex; flex-direction: column; }
    .cart-item-name { font-weight: 600; font-size: 0.9rem; }
    .cart-item-detail { font-size: 0.8rem; color: #888; }
    .cart-item-right { display: flex; align-items: center; gap: 12px; }
    .cart-item-total { font-weight: 600; }
    .remove-btn { background: none; border: none; cursor: pointer; color: #c00; font-size: 1.2rem; padding: 4px; }
    .remove-btn:hover { color: #900; }
    .cart-total { text-align: right; margin: 14px 0; font-size: 1.1rem; }
    .inp { border: 1.5px solid #ddd; border-radius: 10px; padding: 10px 14px; font-size: 0.9rem; width: 100%; box-sizing: border-box; margin-bottom: 12px; outline: none; }
    .inp:focus { border-color: #667eea; }
    .order-btn { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; padding: 14px; width: 100%; cursor: pointer; font-size: 1rem; font-weight: 600; }
    .order-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .success { color: #00a82d; margin-top: 10px; padding: 10px; background: #e8ffe0; border-radius: 8px; }
    .error { color: #c00; margin-top: 10px; padding: 10px; background: #ffe8e8; border-radius: 8px; }
  `]
})
export class ClientProductsComponent implements OnInit {
    products: any[] = [];
    storeId = 0;
    storeName = '';
    cart: any[] = [];
    deliveryAddress = '';
    orderSuccess = ''; orderError = '';
    loading = true; ordering = false;

    get cartTotal(): number { return this.cart.reduce((sum: number, i: any) => sum + i.price * i.qty, 0); }

    constructor(private api: ApiService, private route: ActivatedRoute, private router: Router, private auth: AuthService) { }

    ngOnInit() {
        this.route.queryParams.subscribe((params: any) => {
            this.storeId = Number(params['storeId']) || 0;
            this.storeName = params['storeName'] || 'Store';
            if (this.storeId) {
                this.loading = true;
                this.api.getProductsByStore(this.storeId).subscribe({
                    next: (r: any[]) => {
                        this.products = r.map((p: any) => ({ ...p, _qty: 1, _added: false }));
                        this.loading = false;
                    },
                    error: () => this.loading = false
                });
            }
        });
    }

    incQty(p: any) { p._qty = Math.min((p._qty || 1) + 1, 99); }
    decQty(p: any) { p._qty = Math.max((p._qty || 1) - 1, 1); }

    isInCart(p: any): boolean { return this.cart.some((i: any) => i.productId === p.id); }

    addToCart(p: any) {
        const qty = Number(p._qty) || 1;
        const existing = this.cart.find((i: any) => i.productId === p.id);
        if (existing) { existing.qty = qty; }
        else { this.cart.push({ productId: Number(p.id), name: p.name, price: Number(p.price), qty }); }
        p._added = true;
        setTimeout(() => p._added = false, 1500);
    }

    removeFromCart(index: number) { this.cart.splice(index, 1); }

    back() { this.router.navigate(['/client/stores']); }

    placeOrder() {
        this.orderSuccess = ''; this.orderError = ''; this.ordering = true;
        const user = this.auth.getUser();
        const body = {
            clientId: Number(user?.id ?? 2),
            storeId: Number(this.storeId),
            deliveryAddress: this.deliveryAddress.trim(),
            items: this.cart.map((i: any) => ({
                productId: Number(i.productId),
                quantity: Number(i.qty)
            }))
        };
        this.api.createOrder(body).subscribe({
            next: (order: any) => {
                this.orderSuccess = `Order #${order.id} placed successfully! Total: ${order.totalAmount} TND`;
                this.cart = []; this.deliveryAddress = ''; this.ordering = false;
            },
            error: (e: any) => {
                let msg = '';
                if (e.error?.errors?.length) {
                    msg = e.error.errors.map((err: any) => err.defaultMessage || err.message).join(', ');
                } else if (e.error?.message) {
                    msg = e.error.message;
                } else if (typeof e.error === 'string') {
                    msg = e.error;
                } else {
                    msg = e.message || 'Unknown error';
                }
                this.orderError = msg;
                this.ordering = false;
            }
        });
    }
}
