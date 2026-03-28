import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="login-wrap">
    <div class="login-card">
      <div class="logo">🍕 ORDERLY</div>
      <h2>Welcome Back</h2>
      <p class="sub">Select your role to enter the demo</p>
      <button class="btn admin" (click)="enter('ADMIN')">
        <span class="icon">🛠️</span>
        <div>
          <div class="role">Admin</div>
          <div class="desc">Manage stores, products, orders & deliveries</div>
        </div>
      </button>
      <button class="btn client" (click)="enter('CLIENT')">
        <span class="icon">🛍️</span>
        <div>
          <div class="role">Client</div>
          <div class="desc">Browse stores, order food & track delivery</div>
        </div>
      </button>
    </div>
  </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      background: white;
      border-radius: 20px;
      padding: 48px 40px;
      text-align: center;
      width: 380px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .logo { font-size: 2.5rem; margin-bottom: 8px; }
    h2 { margin: 0 0 4px; color: #1a1a2e; font-size: 1.6rem; }
    .sub { color: #888; margin: 0 0 32px; }
    .btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
      border: 2px solid transparent;
      border-radius: 14px;
      cursor: pointer;
      margin-bottom: 14px;
      text-align: left;
      transition: all 0.2s;
      background: #f8f9ff;
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    .btn.admin:hover { border-color: #667eea; background: #f0f4ff; }
    .btn.client:hover { border-color: #f093fb; background: #fef0ff; }
    .icon { font-size: 2rem; flex-shrink: 0; }
    .role { font-weight: 700; font-size: 1rem; color: #1a1a2e; }
    .desc { font-size: 0.8rem; color: #888; margin-top: 2px; }
  `]
})
export class LoginComponent {
  constructor(private auth: AuthService, private router: Router) { }

  enter(role: 'ADMIN' | 'CLIENT') {
    this.auth.login(role);
    this.router.navigate([role === 'ADMIN' ? '/admin/dashboard' : '/client/stores']);
  }
}
