import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export type Role = 'ADMIN' | 'CLIENT' | 'LIVREUR';

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router, private keycloak: KeycloakService) {}

  getUser(): SessionUser | null {
    if (!this.keycloak.isLoggedIn()) return null;
    const token = this.keycloak.getKeycloakInstance().tokenParsed;
    if (!token) return null;
    return {
      id: token['sub'] || '',
      fullName: token['name'] || token['preferred_username'] || '',
      email: token['email'] || '',
      role: this.getRole() || 'CLIENT'
    };
  }

  getUserId(): string {
    return this.keycloak.getKeycloakInstance().tokenParsed?.['sub'] || '';
  }

  getRole(): Role | null {
    const roles = this.keycloak.getUserRoles(true);
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('LIVREUR')) return 'LIVREUR';
    if (roles.includes('CLIENT')) return 'CLIENT';
    return null;
  }

  isAdmin(): boolean { return this.getRole() === 'ADMIN'; }
  isClient(): boolean { return this.getRole() === 'CLIENT'; }
  isLivreur(): boolean { return this.getRole() === 'LIVREUR'; }
  isLoggedIn(): boolean { return this.keycloak.isLoggedIn(); }

  getToken(): Promise<string> {
    return this.keycloak.getToken();
  }

  login(): void {
    this.keycloak.login({ redirectUri: window.location.origin + '/login' });
  }

  register(): void {
    const kc = this.keycloak.getKeycloakInstance();
    kc.register({ redirectUri: window.location.origin + '/login' });
  }

  logout(): void {
    this.keycloak.logout(window.location.origin + '/login');
  }

  navigateByRole(): void {
    const role = this.getRole();
    switch (role) {
      case 'ADMIN': this.router.navigate(['/admin/dashboard']); break;
      case 'LIVREUR': this.router.navigate(['/livreur/deliveries']); break;
      default: this.router.navigate(['/client/stores']); break;
    }
  }
}
