# ORDERLY - Food Delivery System - Test Guide

## Prerequisites

Make sure these services are running before starting:

| Service | Port | How to Start |
|---------|------|-------------|
| MySQL (XAMPP) | 3307 | Start XAMPP Control Panel > MySQL |
| MongoDB | 27017 | `mongod` or start MongoDB service |
| RabbitMQ | 5672 | Start RabbitMQ service (management UI at http://localhost:15672) |

RabbitMQ default credentials: `guest` / `guest`

---

## Service Startup Order

Start services in this exact order (wait for each to register with Eureka before starting the next group):

### 1. Infrastructure (start first, wait until ready)
```bash
# Terminal 1 - Config Server (port 8888)
cd config-server
mvnw spring-boot:run

# Terminal 2 - Eureka Discovery (port 8761)
cd discovery
mvnw spring-boot:run
```
Verify Eureka is running: http://localhost:8761

### 2. Gateway
```bash
# Terminal 3 - API Gateway (port 9016)
cd gateway
mvnw spring-boot:run
```

### 3. Backend Services (can start in parallel)
```bash
# Terminal 4 - User Service (port 8090)
cd services/user-service
mvnw spring-boot:run

# Terminal 5 - Store Service (port 8092)
cd services/store-service
mvnw spring-boot:run

# Terminal 6 - Product Service (port 8093)
cd services/product-service
mvnw spring-boot:run

# Terminal 7 - Complaint Service (port 8086)
cd services/complaint-service
mvnw spring-boot:run

# Terminal 8 - Notification Service (port 8087)
cd services/notification-service
npm install
npm run start:dev

# Terminal 9 - Order Service (port 8084) - start AFTER product-service is up
cd services/order-service
mvnw spring-boot:run

# Terminal 10 - Delivery Service (port 8085)
cd services/delivery-service
mvnw spring-boot:run
```

### 4. Frontend
```bash
# Terminal 11 - Angular Frontend (port 4310)
cd frontend/orderly-frontend
npm install
ng serve --port 4310
```

Open browser: http://localhost:4310

---

## Full End-to-End Demo with curl Commands

All API calls go through the Gateway at `http://localhost:9016`.

### Step 1: Create Users (Admin)

```bash
# Create an admin user
curl -s -X POST http://localhost:9016/api/users \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Admin User","email":"admin@orderly.com","phone":"12345678","address":"Admin HQ","role":"ADMIN"}'

# Create a client user
curl -s -X POST http://localhost:9016/api/users \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Client User","email":"client@orderly.com","phone":"87654321","address":"123 Main St","role":"CLIENT"}'

# Create a delivery person
curl -s -X POST http://localhost:9016/api/users \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Delivery Guy","email":"delivery@orderly.com","phone":"55555555","address":"Delivery Hub","role":"LIVREUR"}'

# Verify users
curl -s http://localhost:9016/api/users | python -m json.tool
```

### Step 2: Create a Store (Admin)

```bash
curl -s -X POST http://localhost:9016/api/stores \
  -H "Content-Type: application/json" \
  -d '{"name":"Pizza Palace","description":"Best pizza in town","address":"456 Food Street","phone":"11223344","openingHours":"10:00-23:00"}'

# Verify store created
curl -s http://localhost:9016/api/stores | python -m json.tool
```

Expected response: Store with `id: 1`

### Step 3: Create Products Linked to Store (Admin)

```bash
# Product 1
curl -s -X POST http://localhost:9016/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Margherita Pizza","description":"Classic tomato and mozzarella","price":12.50,"storeId":1}'

# Product 2
curl -s -X POST http://localhost:9016/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Pepperoni Pizza","description":"Spicy pepperoni with cheese","price":15.00,"storeId":1}'

# Product 3
curl -s -X POST http://localhost:9016/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Caesar Salad","description":"Fresh romaine with parmesan","price":8.00,"storeId":1}'

# Verify products
curl -s http://localhost:9016/api/products | python -m json.tool

# Verify products by store
curl -s http://localhost:9016/api/products/store/1 | python -m json.tool
```

### Step 4: Client Creates an Order

```bash
# Create order with 2 items (Feign validates products + auto-calculates total)
curl -s -X POST http://localhost:9016/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 2,
    "storeId": 1,
    "deliveryAddress": "789 Customer Lane",
    "items": [
      {"productId": 1, "quantity": 2},
      {"productId": 2, "quantity": 1}
    ]
  }'
```

Expected response:
- `status: "CREATED"`
- `totalAmount: 40.00` (2 x 12.50 + 1 x 15.00)
- Items with `unitPrice` auto-filled from product-service via Feign

**What happens behind the scenes:**
1. Order-service calls product-service via **OpenFeign** to validate each product and get prices
2. Total amount is auto-calculated
3. Order is saved with status `CREATED`
4. **RabbitMQ event** `ORDER_CREATED` is published to `ORDER_CREATED_EXCHANGE` (fanout)
5. **Complaint-service** receives the event and auto-creates a complaint record
6. **Notification-service** receives the event and saves a notification in MongoDB

### Step 5: Verify RabbitMQ Events Worked

```bash
# Check complaints (should have auto-created complaint for order)
curl -s http://localhost:9016/api/complaints | python -m json.tool

# Check notifications (should have "New Order Placed" notification)
curl -s http://localhost:9016/api/notifications | python -m json.tool

# Check received order events in complaint-service
curl -s http://localhost:9016/api/complaints/received-orders | python -m json.tool
```

### Step 6: View All Orders (Admin)

```bash
curl -s http://localhost:9016/api/orders | python -m json.tool

# Get orders for specific client
curl -s http://localhost:9016/api/orders/client/2 | python -m json.tool
```

### Step 7: Create a Delivery (Admin)

```bash
curl -s -X POST http://localhost:9016/api/deliveries \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1, "courierId": 3, "estimatedTime": "30 minutes", "notes": "Ring doorbell"}'

# Verify delivery
curl -s http://localhost:9016/api/deliveries | python -m json.tool
```

### Step 8: Update Delivery Status (Delivery Flow)

```bash
# Step 8a: ASSIGNED -> PICKED_UP
curl -s -X PATCH http://localhost:9016/api/deliveries/1/status/PICKED_UP

# Step 8b: PICKED_UP -> ON_THE_WAY
curl -s -X PATCH http://localhost:9016/api/deliveries/1/status/ON_THE_WAY

# Step 8c: ON_THE_WAY -> DELIVERED (triggers RabbitMQ event + order status update)
curl -s -X PATCH http://localhost:9016/api/deliveries/1/status/DELIVERED
```

**What happens when status = DELIVERED:**
1. Delivery status saved as `DELIVERED`
2. **RabbitMQ event** `DELIVERY_DELIVERED` published to notification-service
3. **Order status** automatically updated to `DELIVERED` via Gateway call
4. Notification saved in MongoDB

### Step 9: Verify Final State

```bash
# Order should now be DELIVERED
curl -s http://localhost:9016/api/orders/1 | python -m json.tool

# Delivery should be DELIVERED
curl -s http://localhost:9016/api/deliveries/order/1 | python -m json.tool

# Notifications should have both ORDER_CREATED and DELIVERY_DELIVERED
curl -s http://localhost:9016/api/notifications | python -m json.tool

# Complaints visible
curl -s http://localhost:9016/api/complaints | python -m json.tool
```

### Step 10: Admin Updates Complaint Status

```bash
# Update complaint status to RESOLVED
curl -s -X PATCH http://localhost:9016/api/complaints/1/status/RESOLVED
```

---

## Frontend Demo Walkthrough

### As Admin:
1. Open http://localhost:4310
2. Click **Admin** button
3. Go to **Stores** > Create a store (name, description, address, phone)
4. Go to **Products** > Select store > Create products (name, price, store)
5. Go to **Users** > Create users (CLIENT, LIVREUR roles)
6. Go to **Orders** > View all orders, update status
7. Go to **Deliveries** > Create delivery for an order, update status through the flow
8. Go to **Complaints** > View auto-created complaints, update status
9. **Dashboard** shows counts of all entities

### As Client:
1. Open http://localhost:4310
2. Click **Client** button
3. **Stores** > Browse available stores, click one
4. **Products** > View products, add to cart, enter delivery address, place order
5. **My Orders** > View order history with status
6. **Track Delivery** > Enter order ID, see delivery status timeline

---

## Architecture Summary

```
                        ┌─────────────┐
                        │   Angular   │ :4310
                        │  Frontend   │
                        └──────┬──────┘
                               │ HTTP
                        ┌──────▼──────┐
                        │   Gateway   │ :9016
                        │ (Spring GW) │
                        └──────┬──────┘
                               │ lb://
          ┌────────────────────┼────────────────────┐
          │           │        │         │           │
     ┌────▼───┐ ┌─────▼──┐ ┌──▼───┐ ┌───▼────┐ ┌───▼─────┐
     │ User   │ │ Store  │ │Order │ │Delivery│ │Complaint│
     │Service │ │Service │ │Svc   │ │Service │ │ Service │
     │ :8090  │ │ :8092  │ │:8084 │ │ :8085  │ │ :8086   │
     └────────┘ └────────┘ └──┬───┘ └───┬────┘ └────▲────┘
                              │         │            │
                    Feign─────┤    PATCH─┤   RabbitMQ │
                              │         │  (fanout)  │
                         ┌────▼───┐     │     ┌──────┘
                         │Product │     │     │
                         │Service │     │     │
                         │ :8093  │     │     │
                         └────────┘     │     │
                                        │     │
                              ┌─────────▼─────▼───────┐
                              │      RabbitMQ          │
                              │  ORDER_CREATED_EXCHANGE│
                              │  DELIVERY_DELIVERED_Q  │
                              └───────────┬────────────┘
                                          │
                                   ┌──────▼──────┐
                                   │Notification │
                                   │  Service    │
                                   │  :8087      │
                                   │  (NestJS)   │
                                   └─────────────┘
```

## Communication Patterns

| From | To | Method | Purpose |
|------|----|--------|---------|
| Order Service | Product Service | **OpenFeign** (sync) | Validate products, get prices |
| Order Service | Complaint + Notification | **RabbitMQ** fanout exchange (async) | ORDER_CREATED event |
| Delivery Service | Order Service | **RestTemplate** via Gateway (sync) | Update order to DELIVERED |
| Delivery Service | Notification Service | **RabbitMQ** queue (async) | DELIVERY_DELIVERED event |

## Databases

| Service | Database | Type |
|---------|----------|------|
| Order Service | H2 in-memory (orderdb) | SQL |
| Store Service | H2 in-memory (storedb) | SQL |
| Product Service | H2 in-memory (productdb) | SQL |
| User Service | MySQL orderly_users | SQL |
| Delivery Service | MySQL orderly_delivery | SQL |
| Complaint Service | MySQL orderly_complaint | SQL |
| Notification Service | MongoDB orderly_notifications | NoSQL |

## Troubleshooting

- **500 error on order creation**: Make sure product-service is running and products exist
- **No complaints after order**: Check RabbitMQ is running and complaint-service started
- **No notifications**: Check MongoDB is running and notification-service connected to RabbitMQ
- **Gateway 503**: Service not registered with Eureka yet - wait and retry
- **CORS errors in browser**: Gateway CORS is configured for all origins - clear browser cache
- **H2 data lost**: H2 is in-memory, data resets on service restart (by design for demo)
- **Old RabbitMQ queues**: If you previously ran the system, delete old queues (ORDER_CREATED_QUEUE) from RabbitMQ Management Console at http://localhost:15672 (guest/guest) to avoid confusion. The system now uses ORDER_CREATED_EXCHANGE (fanout) with separate queues per consumer.
