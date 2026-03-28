import { Injectable } from '@angular/core';

export type Role = 'ADMIN' | 'CLIENT';

export interface SessionUser {
  id: number;
  fullName: string;
  role: Role;
}

const DEMO_USERS: SessionUser[] = [
  { id: 1, fullName: 'Admin User', role: 'ADMIN' },
  { id: 2, fullName: 'Client User', role: 'CLIENT' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user: SessionUser | null = null;

  /** Simple demo login — no Keycloak required */
  login(role: Role): SessionUser {
    this._user = DEMO_USERS.find(u => u.role === role) ?? DEMO_USERS[0];
    sessionStorage.setItem('orderly_user', JSON.stringify(this._user));
    return this._user;
  }

  logout() {
    this._user = null;
    sessionStorage.removeItem('orderly_user');
  }

  getUser(): SessionUser | null {
    if (this._user) return this._user;
    const stored = sessionStorage.getItem('orderly_user');
    if (stored) { this._user = JSON.parse(stored); }
    return this._user;
  }

  isAdmin(): boolean { return this.getUser()?.role === 'ADMIN'; }
  isClient(): boolean { return this.getUser()?.role === 'CLIENT'; }
  isLoggedIn(): boolean { return !!this.getUser(); }
}
