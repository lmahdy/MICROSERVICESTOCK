import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Proxied via angular dev server to Keycloak to avoid CORS during dev
  // proxied: /realms/* -> http://localhost:8081/realms/*
  private tokenUrl = '/realms/orderly/protocol/openid-connect/token';
  private clientId = environment.keycloakClientId;
  private clientSecret = environment.keycloakClientSecret; // empty for public client

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    const params: Record<string, string> = {
      client_id: this.clientId,
      grant_type: 'password',
      username,
      password
    };
    if (this.clientSecret) {
      params['client_secret'] = this.clientSecret;
    }
    const body = new URLSearchParams(params);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<any>(this.tokenUrl, body.toString(), { headers }).pipe(
      tap(res => localStorage.setItem('token', res.access_token))
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
}
