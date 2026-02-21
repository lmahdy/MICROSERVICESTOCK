# ORDERLY Testing Guide (Local, No Docker)

## 1. Startup order
1. Start MySQL (XAMPP) on port 3307 and MongoDB on 127.0.0.1:27017.
2. Run Eureka discovery: `cd discovery && mvn spring-boot:run` (port 8761).
3. Run Config Server: `cd config-server && mvn spring-boot:run` (port 8888).
4. Start API Gateway: `cd gateway && mvn spring-boot:run` (port 9001).
5. Start microservices (separate terminals):
   - `cd services/user-service && mvn spring-boot:run` (port 8089, MySQL)
   - `cd services/store-service && mvn spring-boot:run` (8092, H2)
   - `cd services/product-service && mvn spring-boot:run` (8093, H2)
   - `cd services/order-service && mvn spring-boot:run` (8084, H2)
   - `cd services/delivery-service && mvn spring-boot:run` (8085, MySQL)
   - `cd services/complaint-service && mvn spring-boot:run` (8086, MySQL)
   - `cd services/notification-service && npm run start:dev` (NestJS, MongoDB)
6. Frontend Angular: `cd frontend/orderly-frontend && npm start` (ng serve --port 4310 with proxy to Keycloak).
7. Keycloak (port 8081): realm `orderly`
   - Roles: `ADMIN`, `CLIENT`, `LIVREUR`
   - Client `orderly-frontend`: Public, Direct Access Grants ON, Web Origins `http://localhost:4310` (or `*`), Redirect `http://localhost:4310/*`
   - (Optional) Client `orderly-gateway` same settings
   - Demo users:
     - admin@orderly.tn / Admin123! (role ADMIN)
     - client@orderly.tn / Client123! (role CLIENT)
     - courier@orderly.tn / Courier123! (role LIVREUR)

## 2. Ports table
- discovery: 8761
- config-server: 8888
- gateway: 9001
- keycloak: 8081 (fallback 8088 if busy)
- user-service: 8089 (MySQL 3307)
- store-service: 8092 (H2)
- product-service: 8093 (H2)
- order-service: 8084 (H2)
- delivery-service: 8085 (MySQL 3307)
- complaint-service: 8086 (MySQL 3307)
- notification-service: 8087 (NestJS + MongoDB)
- Angular: 4310
- MongoDB: 27017
- MySQL: 3307

## 3. Database setup
- **MySQL (XAMPP)**: ensure service runs on 3307. Schemas auto-created: `orderly_users`, `orderly_delivery`, `orderly_complaint`.
- **MongoDB**: start `mongosh` on default URI. Notification collection is created in `orderly_notifications`.
- **H2 consoles**: available at `/h2-console` for order/product/store services; JDBC URLs are in their `application.properties`.

## 4. JWT testing
1. Open Keycloak admin, realm `orderly`, create clients `orderly-gateway` (public) and `orderly-frontend` (public), set valid redirect `http://localhost:4310/*` (and Web Origin `http://localhost:4310`).
2. Get token via direct grant:
   ```bash
   curl -X POST \
     -d "client_id=orderly-gateway" \
     -d "username=admin@orderly.tn" \
     -d "password=Admin123!" \
     -d "grant_type=password" \
     http://localhost:8081/realms/orderly/protocol/openid-connect/token
   ```
3. Copy `access_token` and use in Postman `Authorization: Bearer <token>`.

## 5. Postman CRUD (through gateway)
Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`.
- Users: `GET/POST/PUT/DELETE http://localhost:9001/api/users` body `{ "fullName": "John Doe", "email": "john@orderly.tn", "role": "CLIENT" }`
- Stores: `POST http://localhost:9001/api/stores` body `{ "name":"Pizza Box","description":"Fast pizza","address":"Main","phone":"123" }`
- Products: `POST http://localhost:9001/api/products` body `{ "name":"Margherita","price":12.5,"storeId":1 }`
- Orders: `POST http://localhost:9001/api/orders` body `{ "clientId":1,"storeId":1,"totalAmount":25,"deliveryAddress":"Street 1","items":[{"productId":1,"quantity":2,"unitPrice":12.5}] }`
- Update order status: `PATCH http://localhost:9001/api/orders/1/status/CONFIRMED`
- Deliveries: `POST http://localhost:9001/api/deliveries` body `{ "orderId":1,"courierId":3,"estimatedTime":"30m" }`
- Update delivery status: `PATCH http://localhost:9001/api/deliveries/1/status/ON_THE_WAY`
- Complaints: `POST http://localhost:9001/api/complaints` body `{ "orderId":1,"clientId":1,"description":"Late" }`
- Notifications: `POST http://localhost:9001/api/notifications` body `{ "title":"Order created","message":"Order #1 created","userId":"1","type":"ORDER" }`

## 6. Business scenario
1. ADMIN creates store + products.
2. CLIENT logs in, creates order with items.
3. ADMIN/auto confirms order, sets status `PREPARING` ? `PICKED_UP` ? `ON_THE_WAY` ? `DELIVERED`.
4. LIVREUR updates delivery status to `DELIVERED`.
5. CLIENT files complaint if needed.
6. Notifications service stores each created/updated notification; POST `/api/notifications` when order/delivery events occur.

## 7. Angular UI flow (minimal scaffold)
- Login screen obtains Keycloak token via password grant and saves it to localStorage.
- Dashboard page fetches and lists Users/Stores/Products/Orders/Deliveries/Complaints through Gateway.
- Start with `npm start` inside `frontend/orderly-frontend`; gateway base URL is hardcoded to `http://localhost:9001`.

## 8. DB verification
- MySQL: open phpMyAdmin (port 3307) check tables `users`, `deliveries`, `complaints`.
- H2: `/h2-console`, use JDBC URLs from properties.
- Mongo: `mongosh orderly_notifications` and `db.notifications.find()` once running.

## 9. Troubleshooting
- **Port busy**: change `server.port` in the service `application.properties` and matching `config-repo/*.yml`, restart.
- **Eureka not registering**: ensure `eureka.client.service-url.defaultZone` points to running registry; check system clock.
- **401/403**: token missing/expired or wrong audience; fetch fresh token from Keycloak.
- **MySQL connection refused**: confirm XAMPP MySQL is on 3307 and user root has no password; adjust URL in config repo.
- **Gateway route 404**: verify service `spring.application.name` matches gateway route `lb://` target and service is up.
- **H2 console issues**: enable path `/h2-console` and disable frame options (already done in configs).
- **Mongo connection**: ensure mongod running on 127.0.0.1:27017; update `MONGO_URI` env for notification service if you change it.
