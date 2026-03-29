import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export type Role = 'ADMIN' | 'CLIENT' | 'LIVREUR';

export interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user: SessionUser | null = null;

  constructor(private router: Router) { }

  /** Login with a user object from user-service */
  loginWithUser(user: SessionUser): void {
    this._user = user;
    sessionStorage.setItem('orderly_user', JSON.stringify(this._user));
  }

  logout(): void {
    this._user = null;
    sessionStorage.removeItem('orderly_user');
    this.router.navigate(['/login']);
  }

  getUser(): SessionUser | null {
    if (this._user) return this._user;
    const stored = sessionStorage.getItem('orderly_user');
    if (stored) {
      this._user = JSON.parse(stored);
    }
    return this._user;
  }

  getUserId(): number {
    return this.getUser()?.id ?? 0;
  }

  getRole(): Role | null {
    return this.getUser()?.role ?? null;
  }

  isAdmin(): boolean { return this.getUser()?.role === 'ADMIN'; }
  isClient(): boolean { return this.getUser()?.role === 'CLIENT'; }
  isLivreur(): boolean { return this.getUser()?.role === 'LIVREUR'; }
  isLoggedIn(): boolean { return !!this.getUser(); }
}
