import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const API = 'http://localhost:9016';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  users() {
    return this.http.get(`${API}/api/users`);
  }
  stores() {
    return this.http.get(`${API}/api/stores`);
  }
  products() {
    return this.http.get(`${API}/api/products`);
  }
  orders() {
    return this.http.get(`${API}/api/orders`);
  }
  deliveries() {
    return this.http.get(`${API}/api/deliveries`);
  }
  complaints() {
    return this.http.get(`${API}/api/complaints`);
  }
}
