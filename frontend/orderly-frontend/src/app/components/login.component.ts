import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
  <div class="auth">
    <h2>ORDERLY Login</h2>
    <form (ngSubmit)="submit()">
      <label>Email</label>
      <input [(ngModel)]="email" name="email" required type="email" />
      <label>Password</label>
      <input [(ngModel)]="password" name="password" required type="password" />
      <button type="submit">Login</button>
      <p class="hint">Demo users: admin&#64;orderly.tn / Admin123! etc.</p>
      <p *ngIf="error" class="error">{{error}}</p>
    </form>
  </div>
  `,
  styles: [`.auth{max-width:360px;margin:48px auto;padding:24px;border:1px solid #ddd;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,0.06);} input,button{width:100%;margin:8px 0;padding:10px;} button{background:#0078ff;border:none;color:#fff;border-radius:6px;cursor:pointer;} .error{color:#c00;}`]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.error = 'Login failed. Check Keycloak or credentials.'
    });
  }
}
