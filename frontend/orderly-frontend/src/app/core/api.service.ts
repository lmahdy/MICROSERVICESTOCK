import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

const G = environment.gateway;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) { }

  // ── Users ──────────────────────────────────────────────
  getUsers(): Observable<any[]> { return this.http.get<any[]>(`${G}/api/users`); }
  getUserByEmail(email: string): Observable<any> { return this.http.get<any>(`${G}/api/users/email/${email}`); }
  loginUser(body: { email: string, password: string }): Observable<any> { return this.http.post<any>(`${G}/api/users/login`, body); }
  createUser(body: any): Observable<any> { return this.http.post<any>(`${G}/api/users`, body); }
  deleteUser(id: number): Observable<any> { return this.http.delete(`${G}/api/users/${id}`); }

  // ── Stores ─────────────────────────────────────────────
  getStores(): Observable<any[]> { return this.http.get<any[]>(`${G}/api/stores`); }
  getStore(id: number): Observable<any> { return this.http.get<any>(`${G}/api/stores/${id}`); }
  createStore(body: any): Observable<any> { return this.http.post<any>(`${G}/api/stores`, body); }
  updateStore(id: number, body: any): Observable<any> { return this.http.put<any>(`${G}/api/stores/${id}`, body); }
  deleteStore(id: number): Observable<any> { return this.http.delete(`${G}/api/stores/${id}`); }

  // ── Products ───────────────────────────────────────────
  getProducts(): Observable<any[]> { return this.http.get<any[]>(`${G}/api/products`); }
  getProductsByStore(storeId: number): Observable<any[]> { return this.http.get<any[]>(`${G}/api/products/store/${storeId}`); }
  createProduct(body: any): Observable<any> { return this.http.post<any>(`${G}/api/products`, body); }
  deleteProduct(id: number): Observable<any> { return this.http.delete(`${G}/api/products/${id}`); }

  // ── Orders ─────────────────────────────────────────────
  getOrders(): Observable<any[]> { return this.http.get<any[]>(`${G}/api/orders`); }
  getOrdersByClient(clientId: string | number): Observable<any[]> { return this.http.get<any[]>(`${G}/api/orders/client/${clientId}`); }
  createOrder(body: any): Observable<any> { return this.http.post<any>(`${G}/api/orders`, body); }
  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${G}/api/orders/${id}/status/${status}`, null);
  }

  // ── Deliveries ─────────────────────────────────────────
  getDeliveries(): Observable<any[]> { return this.http.get<any[]>(`${G}/api/deliveries`); }
  getDeliveryByOrder(orderId: number): Observable<any[]> { return this.http.get<any[]>(`${G}/api/deliveries/order/${orderId}`); }
  getDeliveriesByCourier(courierId: string | number): Observable<any[]> { return this.http.get<any[]>(`${G}/api/deliveries/courier/${courierId}`); }
  createDelivery(body: any): Observable<any> { return this.http.post<any>(`${G}/api/deliveries`, body); }
  updateDeliveryStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${G}/api/deliveries/${id}/status/${status}`, null);
  }

  // ── Complaints ─────────────────────────────────────────
  getComplaints(): Observable<any[]> { return this.http.get<any[]>(`${G}/api/complaints`); }
  createComplaint(body: any): Observable<any> { return this.http.post<any>(`${G}/api/complaints`, body); }
  updateComplaintStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${G}/api/complaints/${id}/status/${status}`, null);
  }

  // ── Notifications ──────────────────────────────────────
  getNotifications(): Observable<any[]> { return this.http.get<any[]>(`${G}/api/notifications`); }
  getNotificationsByUser(userId: string | number): Observable<any[]> { return this.http.get<any[]>(`${G}/api/notifications/user/${userId}`); }
  getUnreadCount(userId: string | number): Observable<any> { return this.http.get<any>(`${G}/api/notifications/user/${userId}/unread-count`); }
  markNotificationRead(id: string): Observable<any> { return this.http.patch<any>(`${G}/api/notifications/${id}/read`, null); }
  markAllRead(userId: string | number): Observable<any> { return this.http.patch<any>(`${G}/api/notifications/user/${userId}/read-all`, null); }
}
