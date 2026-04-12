import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
  <div>
    <h1 class="page-title">👥 Manage Users</h1>
    <div class="card">
      <h3>Create User</h3>
      <div class="form-row">
        <input [(ngModel)]="form.fullName" placeholder="Full Name *" class="inp"/>
        <input [(ngModel)]="form.email" placeholder="Email *" type="email" class="inp"/>
        <input [(ngModel)]="form.phone" placeholder="Phone" class="inp"/>
        <input [(ngModel)]="form.address" placeholder="Address" class="inp"/>
        <select [(ngModel)]="form.role" class="inp">
          <option value="">Select Role *</option>
          <option value="CLIENT">CLIENT</option>
          <option value="LIVREUR">LIVREUR (Delivery)</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button class="btn-primary" (click)="create()" [disabled]="!form.fullName || !form.email || !form.role">+ Create</button>
      </div>
      <div *ngIf="success" class="success">✅ {{success}}</div>
      <div *ngIf="error" class="error">❌ {{error}}</div>
    </div>
    <div class="card">
      <h3>All Users ({{users.length}})</h3>
      <div *ngIf="loading" class="empty">Loading...</div>
      <table *ngIf="!loading && users.length > 0">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th></tr></thead>
        <tbody>
          <tr *ngFor="let u of users">
            <td>#{{u.id}}</td>
            <td>{{u.fullName}}</td>
            <td>{{u.email}}</td>
            <td>{{u.phone || '—'}}</td>
            <td><span class="badge" [class]="u.role?.toLowerCase()">{{u.role}}</span></td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="!loading && users.length === 0" class="empty">No users yet.</div>
    </div>
  </div>
  `,
    styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 24px; }
    .card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
    h3 { margin: 0 0 16px; color: #333; }
    .form-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .inp { border: 1.5px solid #ddd; border-radius: 10px; padding: 10px 14px; font-size: 0.9rem; flex: 1; min-width: 160px; outline: none; }
    select.inp { background: white; }
    .btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; padding: 10px 20px; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; }
    .success { color: #00a82d; margin-top: 10px; }
    .error { color: #c00; margin-top: 10px; }
    .empty { color: #aaa; font-style: italic; }
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    th { background: #f8f9ff; padding: 10px 12px; text-align: left; color: #555; }
    td { padding: 10px 12px; border-top: 1px solid #f0f0f0; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge.client { background: #e0f0ff; color: #0060c0; }
    .badge.livreur { background: #e0ffe8; color: #007820; }
    .badge.admin { background: #f5e0ff; color: #7000a8; }
  `]
})
export class AdminUsersComponent implements OnInit {
    users: any[] = [];
    form: any = {};
    success = ''; error = ''; loading = true;

    constructor(private api: ApiService) { }

    ngOnInit() { this.load(); }

    load() {
        this.loading = true;
        this.api.getUsers().subscribe({ next: r => { this.users = r; this.loading = false; }, error: () => this.loading = false });
    }

    create() {
        this.success = ''; this.error = '';
        this.api.createUser(this.form).subscribe({
            next: () => { this.success = 'User created!'; this.form = {}; this.load(); },
            error: e => this.error = 'Error: ' + (e.error?.message || e.message)
        });
    }
}
