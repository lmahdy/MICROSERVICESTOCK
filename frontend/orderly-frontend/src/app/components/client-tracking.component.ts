import { Component } from '@angular/core';
import { ApiService } from '../core/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-client-tracking',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
  <div>
    <h1 class="page-title">🚚 Track Your Delivery</h1>
    <div class="card">
      <div class="search-row">
        <input [(ngModel)]="orderId" placeholder="Enter Order ID" type="number" class="inp"/>
        <button class="btn-primary" (click)="track()" [disabled]="!orderId">Track</button>
      </div>
      <div *ngIf="error" class="error">{{error}}</div>
    </div>

    <div class="card result" *ngIf="delivery">
      <h3>Delivery #{{delivery.id}}</h3>
      <div class="status-timeline">
        <div class="step" [class.done]="isStep('ASSIGNED')" [class.active]="delivery.status === 'ASSIGNED'">
          <div class="dot">📦</div><div class="label">Assigned</div>
        </div>
        <div class="line"></div>
        <div class="step" [class.done]="isStep('PICKED_UP')" [class.active]="delivery.status === 'PICKED_UP'">
          <div class="dot">🏃</div><div class="label">Picked Up</div>
        </div>
        <div class="line"></div>
        <div class="step" [class.done]="isStep('ON_THE_WAY')" [class.active]="delivery.status === 'ON_THE_WAY'">
          <div class="dot">🚚</div><div class="label">On The Way</div>
        </div>
        <div class="line"></div>
        <div class="step" [class.done]="isStep('DELIVERED')" [class.active]="delivery.status === 'DELIVERED'">
          <div class="dot">✅</div><div class="label">Delivered</div>
        </div>
      </div>
      <div class="info-grid">
        <div><span class="label">Order:</span> #{{delivery.orderId}}</div>
        <div><span class="label">Courier:</span> #{{delivery.courierId}}</div>
        <div><span class="label">Est. Time:</span> {{delivery.estimatedTime || 'N/A'}}</div>
        <div><span class="label">Status:</span> <strong>{{delivery.status}}</strong></div>
      </div>
      <div *ngIf="delivery.status === 'DELIVERED'" class="delivered-msg">🎉 Your order has been delivered! Enjoy your meal!</div>
    </div>
    <div *ngIf="noDelivery" class="empty-state">
      <p>No delivery found for Order #{{orderId}}. It may still be processing.</p>
    </div>
  </div>
  `,
    styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 24px; }
    .card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
    .search-row { display: flex; gap: 12px; }
    .inp { border: 1.5px solid #ddd; border-radius: 10px; padding: 10px 14px; font-size: 0.9rem; flex: 1; outline: none; }
    .btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; padding: 10px 24px; cursor: pointer; font-weight: 600; white-space: nowrap; }
    .btn-primary:disabled { opacity: 0.5; }
    .error { color: #c00; margin-top: 10px; }
    .result h3 { margin: 0 0 24px; }
    .status-timeline { display: flex; align-items: center; margin-bottom: 28px; }
    .step { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
    .dot { width: 44px; height: 44px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; border: 3px solid #ddd; transition: all 0.3s; }
    .step.done .dot { background: #e0ffe8; border-color: #00a82d; }
    .step.active .dot { background: #e3f0ff; border-color: #0070f3; box-shadow: 0 0 0 4px rgba(0,112,243,0.2); }
    .label { font-size: 0.72rem; color: #888; margin-top: 6px; text-align: center; }
    .step.done .label, .step.active .label { color: #333; font-weight: 600; }
    .line { flex: 1; height: 3px; background: #eee; margin: 0 4px 18px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem; }
    .label { font-weight: 600; color: #555; margin-right: 4px; }
    .delivered-msg { margin-top: 16px; padding: 14px; background: #d4f7e0; border-radius: 12px; color: #006620; font-weight: 600; text-align: center; font-size: 1rem; }
    .empty-state { text-align: center; color: #aaa; font-style: italic; margin-top: 20px; }
  `]
})
export class ClientTrackingComponent {
    orderId: number | null = null;
    delivery: any = null;
    noDelivery = false;
    error = '';

    constructor(private api: ApiService) { }

    track() {
        this.delivery = null; this.noDelivery = false; this.error = '';
        this.api.getDeliveryByOrder(this.orderId!).subscribe({
            next: (r: any[]) => {
                if (r && r.length > 0) { this.delivery = r[0]; }
                else { this.noDelivery = true; }
            },
            error: () => { this.error = 'Error fetching delivery. Make sure services are running.'; }
        });
    }

    private STATUS_ORDER = ['ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'];
    isStep(step: string): boolean {
        return this.STATUS_ORDER.indexOf(this.delivery?.status) >= this.STATUS_ORDER.indexOf(step);
    }
}
