import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  template: `
  <div class="login-wrap">
    <div class="login-card">
      <div class="logo">ORDERLY</div>
      <p>Redirecting...</p>
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
    .logo { font-size: 2.5rem; margin-bottom: 8px; font-weight: 800; }
  `]
})
export class LoginComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.auth.navigateByRole();
    }
  }
}
