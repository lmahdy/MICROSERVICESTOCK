import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-complaints',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
  <div>
    <h1 class="page-title">📢 Complaints Management</h1>
    <div class="card">
      <div class="hdr"><h3>All Complaints ({{complaints.length}})</h3><button class="btn-secondary" (click)="load()">↻ Refresh</button></div>
      <p class="info">💡 Complaints are auto-created when an order is placed (via RabbitMQ). Admins can update the status here.</p>
      <div *ngIf="loading" class="empty">Loading...</div>
      <div *ngIf="!loading && complaints.length === 0" class="empty">No complaints yet. They appear automatically when orders are placed and RabbitMQ is running.</div>
      <div class="table-wrap" *ngIf="complaints.length > 0">
        <table>
          <thead><tr><th>ID</th><th>Order</th><th>Client</th><th>Description</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of complaints">
              <td>#{{c.id}}</td>
              <td>Order #{{c.orderId}}</td>
              <td>{{c.clientId}}</td>
              <td class="desc">{{c.description}}</td>
              <td><span class="badge" [class]="c.status?.toLowerCase()">{{c.status}}</span></td>
              <td>{{c.createdAt | date:'short'}}</td>
              <td>
                <select class="status-sel" [(ngModel)]="c._newStatus">
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
                <button class="update-btn" (click)="updateStatus(c)">Update</button>
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
    .hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    h3 { margin: 0; color: #333; }
    .info { color: #777; font-size: 0.85rem; margin: 0 0 16px; padding: 10px; background: #f8f9ff; border-radius: 8px; border-left: 3px solid #667eea; }
    .btn-secondary { background: #f0f2f8; border: none; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-size: 0.85rem; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { background: #f8f9ff; padding: 10px 12px; text-align: left; color: #555; }
    td { padding: 10px 12px; border-top: 1px solid #f0f0f0; vertical-align: middle; }
    .desc { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge.open { background: #ffe0e0; color: #c00; }
    .badge.in_progress { background: #fff7e0; color: #b07200; }
    .badge.resolved { background: #e0ffe8; color: #00a82d; }
    .badge.rejected { background: #f0f0f0; color: #666; }
    .status-sel { border: 1.5px solid #ddd; border-radius: 8px; padding: 4px 8px; font-size: 0.8rem; margin-right: 6px; }
    .update-btn { background: #667eea; color: white; border: none; border-radius: 8px; padding: 5px 12px; cursor: pointer; font-size: 0.8rem; }
    .success { color: #00a82d; margin-top: 12px; }
    .empty { color: #aaa; font-style: italic; }
  `]
})
export class AdminComplaintsComponent implements OnInit {
    complaints: any[] = [];
    loading = true; msg = '';

    constructor(private api: ApiService) { }

    ngOnInit() { this.load(); }

    load() {
        this.loading = true;
        this.api.getComplaints().subscribe({
            next: r => { this.complaints = r.map((c: any) => ({ ...c, _newStatus: c.status })); this.loading = false; },
            error: () => this.loading = false
        });
    }

    updateStatus(c: any) {
        this.api.updateComplaintStatus(c.id, c._newStatus).subscribe({
            next: (upd) => { c.status = upd.status; this.msg = `Complaint #${c.id} → ${upd.status}`; setTimeout(() => this.msg = '', 3000); },
            error: e => alert('Error: ' + (e.error?.message || e.message))
        });
    }
}
