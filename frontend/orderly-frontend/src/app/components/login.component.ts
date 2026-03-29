import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Role } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="login-wrap">
    <div class="login-card">
      <div class="logo">🍕 ORDERLY</div>
      <h2>{{ isSignup ? 'Create Account' : 'Welcome Back' }}</h2>
      <p class="sub">{{ isSignup ? 'Create your account to get started' : 'Sign in to continue' }}</p>

      <!-- SIGNUP FORM -->
      <div *ngIf="isSignup">
        <input class="inp" [(ngModel)]="signupForm.fullName" placeholder="Full Name *" />
        <input class="inp" [(ngModel)]="signupForm.email" placeholder="Email *" type="email" />
        <input class="inp" [(ngModel)]="signupForm.password" placeholder="Password *" type="password" />
        <input class="inp" [(ngModel)]="signupForm.phone" placeholder="Phone (optional)" />
        <input class="inp" [(ngModel)]="signupForm.address" placeholder="Address" />
        <div class="role-select">
          <label class="role-option" *ngFor="let r of roleOptions"
            [class.selected]="signupForm.role === r.value"
            (click)="signupForm.role = r.value">
            <span class="role-icon">{{r.icon}}</span>
            <span class="role-name">{{r.label}}</span>
          </label>
        </div>
        <button class="btn-main" (click)="signup()"
          [disabled]="!signupForm.fullName || !signupForm.email || !signupForm.password || !signupForm.role || loading">
          {{ loading ? 'Creating...' : '✨ Create Account' }}
        </button>
        <p class="switch-link">Already have an account? <a (click)="isSignup = false">Sign In</a></p>
      </div>

      <!-- LOGIN FORM -->
      <div *ngIf="!isSignup">
        <input class="inp" [(ngModel)]="loginEmail" placeholder="Email" type="email" />
        <input class="inp" [(ngModel)]="loginPassword" placeholder="Password" type="password"
               (keyup.enter)="login()" />
        <button class="btn-main" (click)="login()" [disabled]="!loginEmail || !loginPassword || loading">
          {{ loading ? 'Signing in...' : '🔑 Sign In' }}
        </button>
        <p class="switch-link">Don't have an account? <a (click)="isSignup = true">Sign Up</a></p>
      </div>

      <div *ngIf="error" class="error-msg">❌ {{error}}</div>
      <div *ngIf="success" class="success-msg">✅ {{success}}</div>
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
      width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .logo { font-size: 2.5rem; margin-bottom: 8px; }
    h2 { margin: 0 0 4px; color: #1a1a2e; font-size: 1.6rem; }
    .sub { color: #888; margin: 0 0 24px; }
    .inp {
      width: 100%;
      padding: 14px 18px;
      border: 2px solid #e8e8f0;
      border-radius: 12px;
      font-size: 0.95rem;
      outline: none;
      margin-bottom: 12px;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .inp:focus { border-color: #667eea; }
    .role-select {
      display: flex; gap: 10px; margin-bottom: 16px;
    }
    .role-option {
      flex: 1;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 12px 8px; border: 2px solid #e8e8f0; border-radius: 14px;
      cursor: pointer; transition: all 0.2s; background: #f8f9ff;
    }
    .role-option:hover { border-color: #667eea; background: #f0f4ff; }
    .role-option.selected { border-color: #667eea; background: #e8eeff; box-shadow: 0 0 0 3px rgba(102,126,234,0.15); }
    .role-icon { font-size: 1.5rem; }
    .role-name { font-size: 0.75rem; font-weight: 600; color: #444; }
    .btn-main {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white; border: none; border-radius: 12px;
      font-size: 1rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s; margin-top: 8px;
    }
    .btn-main:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(102,126,234,0.3); }
    .btn-main:disabled { opacity: 0.5; transform: none; }
    .switch-link { color: #888; font-size: 0.85rem; margin-top: 16px; }
    .switch-link a { color: #667eea; font-weight: 600; cursor: pointer; text-decoration: underline; }
    .error-msg { color: #e74c3c; font-size: 0.85rem; margin-top: 12px; background: #ffeaea; padding: 10px; border-radius: 8px; }
    .success-msg { color: #27ae60; font-size: 0.85rem; margin-top: 12px; background: #eafff0; padding: 10px; border-radius: 8px; }
  `]
})
export class LoginComponent {
  isSignup = false;
  loading = false;
  error = '';
  success = '';

  loginEmail = '';
  loginPassword = '';
  signupForm: any = { fullName: '', email: '', password: '', phone: '', address: '', role: 'CLIENT' };

  roleOptions = [
    { value: 'CLIENT', label: 'Client', icon: '🛍️' },
    { value: 'LIVREUR', label: 'Courier', icon: '🏍️' },
    { value: 'ADMIN', label: 'Admin', icon: '🛠️' },
  ];

  constructor(private auth: AuthService, private api: ApiService, private router: Router) { }

  login() {
    this.error = '';
    this.success = '';
    this.loading = true;

    this.api.loginUser({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: (user) => {
        this.auth.loginWithUser({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address
        });
        this.loading = false;
        this.navigateByRole(user.role);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 404) {
          this.error = 'No account found with this email. Please sign up first!';
        } else if (err.status === 400) {
          this.error = 'Invalid password. Please try again.';
        } else {
          this.error = 'Could not connect to server. Make sure all services are running.';
        }
      }
    });
  }

  signup() {
    this.error = '';
    this.success = '';
    this.loading = true;

    this.api.createUser(this.signupForm).subscribe({
      next: (user) => {
        this.loading = false;
        this.success = 'Account created! Signing you in...';
        setTimeout(() => {
          this.auth.loginWithUser({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address
          });
          this.navigateByRole(user.role);
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || err.error?.error || 'Could not create account. Email may already be in use.';
      }
    });
  }

  private navigateByRole(role: string) {
    switch (role) {
      case 'ADMIN': this.router.navigate(['/admin/dashboard']); break;
      case 'LIVREUR': this.router.navigate(['/livreur/deliveries']); break;
      default: this.router.navigate(['/client/stores']); break;
    }
  }
}
