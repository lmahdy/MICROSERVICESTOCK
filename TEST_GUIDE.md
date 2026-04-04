# ORDERLY - Food Delivery System - Complete Test Guide

## Prerequisites

Make sure these services are running before starting:

| Service       | Port  | How to Start                                                     |
| ------------- | ----- | ---------------------------------------------------------------- |
| MySQL (XAMPP) | 3307  | Start XAMPP Control Panel > MySQL                                |
| MongoDB       | 27017 | `mongod` or start MongoDB service                                |
| RabbitMQ      | 5672  | Start RabbitMQ service (management UI at http://localhost:15672) |

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
# Terminal 11 - Angular Frontend (port 4200)
cd frontend/orderly-frontend
npm install
ng serve
```

Open browser: http://localhost:4200

---

## 🖥️ FRONTEND TEST WALKTHROUGH (Step by Step)

### ✅ Test 1: Sign Up as Client

1. Open http://localhost:4200
2. You will see the **login/signup page** (gradient background with form)
3. Click **"Sign Up"** link at the bottom
4. Fill in:
   - **Full Name:** `Ahmed Client`
   - **Email:** `ahmed@orderly.com`
   - **Password:** `password123`
   - **Phone:** `12345678`
   - **Address:** `123 Rue Tunis`
   - **Role:** Click the **🛍️ Client** button
5. Click **"✨ Create Account"**
6. You should see "✅ Account created! Signing you in..."
7. You will be redirected to the **Client > Stores** page
8. Notice the **sidebar** shows: 🛍️ Ahmed Client, and menu items: Stores, My Orders, Track Delivery
9. Notice the **🔔 bell icon** in the top-right with no unread badge (no notifications yet)

### ✅ Test 2: Log Out and Sign Up as Admin

1. Click **🚪 Logout** at the bottom of the sidebar
2. Back on login page, click **"Sign Up"**
3. Fill in:
   - **Full Name:** `Admin Orderly`
   - **Email:** `admin@orderly.com`
   - **Role:** Click **🛠️ Admin**
4. Click **"✨ Create Account"**
5. You will be redirected to **Admin > Dashboard**
6. Dashboard shows stat cards (all 0 since we just started)

### ✅ Test 3: Admin Creates Store & Products

1. Go to **🏪 Stores** in the sidebar
2. Create a store:
   - **Name:** `Pizza Palace`
   - **Description:** `Best pizza in town`
   - **Address:** `456 Food Street`
   - **Phone:** `11223344`
3. Click **Create Store**
4. Go to **🍔 Products** in the sidebar
5. Select **Pizza Palace** from the dropdown
6. Create products:
   - **Product 1:** Name: `Margherita`, Price: `12.50`, Store ID: `1`
   - **Product 2:** Name: `Pepperoni`, Price: `15.00`, Store ID: `1`
7. Both products should appear in the list

### ✅ Test 4: Sign Up as Courier (LIVREUR)

1. **Logout** from Admin
2. **Sign Up** with:
   - **Full Name:** `Courier Express`
   - **Email:** `courier@orderly.com`
   - **Role:** Click **🏍️ Courier**
3. You will be redirected to **Livreur > My Deliveries**
4. You should see the empty state: "No deliveries assigned to you yet."
5. **Logout**

### ✅ Test 5: Client Places an Order (triggers notifications!)

1. **Sign In** with email: `ahmed@orderly.com`
2. Go to **🏪 Stores** - you should see "Pizza Palace"
3. Click on **Pizza Palace** to view the menu
4. Add items to cart:
   - Margherita x1
   - Pepperoni x1
5. Enter **Delivery Address:** `789 Customer Lane`
6. Click **🛒 Place Order**
7. Order should be created successfully!
8. **Check the 🔔 bell icon** - you should now see a **red unread badge (1)**
9. Click the **🔔 bell** to open the notification dropdown
10. You should see: **"🛒 New Order Placed"** - "Your order #1 has been placed successfully! Total: 27.50 TND"
11. Click on the notification to mark it as read - the unread badge disappears

### ✅ Test 6: Admin Creates Delivery (triggers courier + client notifications!)

1. **Logout** and **Sign In** as `admin@orderly.com`
2. Go to **🚚 Deliveries**
3. Create delivery:
   - **Order ID:** `1`
   - **Courier ID:** `3` (the courier we created)
4. Click **Create Delivery**
5. The delivery should appear with status **ASSIGNED**

### ✅ Test 7: Check Notifications as Client

1. **Logout** and **Sign In** as `ahmed@orderly.com`
2. Check the **🔔 bell** - you should see **new notification(s)**:
   - "🚚 Courier Assigned" - "A courier has been assigned to your order #1..."
3. This shows the **async event flow**: Delivery Service → RabbitMQ → Notification Service → MongoDB → Frontend

### ✅ Test 8: Check Notifications as Courier

1. **Logout** and **Sign In** as `courier@orderly.com`
2. Check the **🔔 bell** - you should see:
   - "📦 New Delivery Assignment" - "You have been assigned to deliver order #1..."
3. Go to **📦 My Deliveries** - you should see Delivery #1 with status ASSIGNED

### ✅ Test 9: Courier Updates Delivery Status (full delivery flow)

1. Still logged in as `courier@orderly.com`
2. In **My Deliveries**, select **PICKED_UP** from dropdown, click **Update Status**
3. Status changes to PICKED_UP ✅
4. Select **ON_THE_WAY**, click **Update Status**
5. Status changes to ON_THE_WAY ✅
6. Select **DELIVERED**, click **Update Status**
7. Status changes to DELIVERED ✅ - shows "✅ Delivered successfully"

### ✅ Test 10: Client Sees Full Delivery Progression Notifications

1. **Logout** and **Sign In** as `ahmed@orderly.com`
2. Click the **🔔 bell** - you should see ALL delivery notifications in chronological order:
   - "✅ Order Delivered!" - "Your order #1 has been delivered successfully!"
   - "🏍️ On The Way!" - "Your order #1 is on its way to you!"
   - "📦 Order Picked Up" - "Your order #1 has been picked up by the courier!"
   - "🚚 Courier Assigned"
   - "🛒 New Order Placed"
3. Click **"Mark all read"** to clear all unread badges
4. Go to **📋 My Orders** - your order should show status **DELIVERED**
5. Go to **🚚 Track Delivery** - search for Order ID 1 - delivery should be visible

### ✅ Test 11: Auth Guard Verification (security)

1. While logged in as Client, try to navigate to `http://localhost:4200/admin/dashboard`
2. You should be **redirected back to login** (auth guard blocks access)
3. Try `http://localhost:4200/livreur/deliveries` - also blocked
4. **Log out**, try any protected URL - redirected to login

### ✅ Test 12: Admin Dashboard Stats

1. **Sign In** as `admin@orderly.com`
2. Go to **📊 Dashboard**
3. You should see real stats:
   - Stores: 1
   - Products: 2
   - Orders: 1
   - Deliveries: 1
   - Notifications: (several)
4. Recent orders table should show Order #1 with status DELIVERED

---

## 🔧 API (curl) Test Commands

All API calls go through the Gateway at `http://localhost:9016`.

### Users

```bash
# Create users (if not already created via frontend)
curl -s -X POST http://localhost:9016/api/users -H "Content-Type: application/json" \
  -d '{"fullName":"Admin User","email":"admin@orderly.com","password":"password123","phone":"12345678","address":"Admin HQ","role":"ADMIN"}'

curl -s -X POST http://localhost:9016/api/users -H "Content-Type: application/json" \
  -d '{"fullName":"Client User","email":"client@orderly.com","password":"password123","phone":"87654321","address":"123 Main St","role":"CLIENT"}'

curl -s -X POST http://localhost:9016/api/users -H "Content-Type: application/json" \
  -d '{"fullName":"Delivery Guy","email":"delivery@orderly.com","password":"password123","phone":"55555555","address":"Delivery Hub","role":"LIVREUR"}'

# Login by email and password
curl -s -X POST http://localhost:9016/api/users/login -H "Content-Type: application/json" \
  -d '{"email":"admin@orderly.com","password":"password123"}'

# All users
curl -s http://localhost:9016/api/users
```

### Stores & Products

```bash
curl -s -X POST http://localhost:9016/api/stores -H "Content-Type: application/json" \
  -d '{"name":"Pizza Palace","description":"Best pizza in town","address":"456 Food Street","phone":"11223344","openingHours":"10:00-23:00"}'

curl -s -X POST http://localhost:9016/api/products -H "Content-Type: application/json" \
  -d '{"name":"Margherita Pizza","description":"Classic tomato and mozzarella","price":12.50,"storeId":1}'

curl -s -X POST http://localhost:9016/api/products -H "Content-Type: application/json" \
  -d '{"name":"Pepperoni Pizza","description":"Spicy pepperoni with cheese","price":15.00,"storeId":1}'
```

### Orders (triggers RabbitMQ events)

```bash
curl -s -X POST http://localhost:9016/api/orders -H "Content-Type: application/json" \
  -d '{"clientId":2,"storeId":1,"deliveryAddress":"789 Customer Lane","items":[{"productId":1,"quantity":2},{"productId":2,"quantity":1}]}'
```

### Deliveries (triggers events for each status change)

```bash
# Create delivery (auto-resolves clientId from order-service)
curl -s -X POST http://localhost:9016/api/deliveries -H "Content-Type: application/json" \
  -d '{"orderId":1,"courierId":3,"estimatedTime":"30 minutes","notes":"Ring doorbell"}'

# Status transitions (each one triggers a RabbitMQ event + notification)
curl -s -X PATCH http://localhost:9016/api/deliveries/1/status/PICKED_UP
curl -s -X PATCH http://localhost:9016/api/deliveries/1/status/ON_THE_WAY
curl -s -X PATCH http://localhost:9016/api/deliveries/1/status/DELIVERED
```

### Notifications (per-user access)

```bash
# Get notifications for a specific user
curl -s http://localhost:9016/api/notifications/user/2

# Get unread count
curl -s http://localhost:9016/api/notifications/user/2/unread-count

# Mark a notification as read
curl -s -X PATCH http://localhost:9016/api/notifications/{notification_id}/read

# Mark all as read for a user
curl -s -X PATCH http://localhost:9016/api/notifications/user/2/read-all

# Get all notifications (admin view)
curl -s http://localhost:9016/api/notifications
```

### Complaints

```bash
curl -s http://localhost:9016/api/complaints
curl -s -X PATCH http://localhost:9016/api/complaints/1/status/RESOLVED
```

---

## Architecture Summary

```
                        ┌─────────────┐
                        │   Angular   │ :4200
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
                   RabbitMQ (Events)     │     │
                ┌───────────────────────┘     │
                │                              │
    ┌───────────▼────────────────┐   ┌────────┘
    │ ORDER_CREATED_EXCHANGE     │   │
    │ (fanout)                   │   │
    │   → COMPLAINT_QUEUE        │   │
    │   → NOTIFICATION_QUEUE     │   │
    ├────────────────────────────┤   │
    │ DELIVERY_EVENTS_EXCHANGE   │   │
    │ (topic)                    │   │
    │   → delivery.ASSIGNED      │   │
    │   → delivery.PICKED_UP     │   │
    │   → delivery.ON_THE_WAY    │   │
    │   → delivery.DELIVERED     │   │
    └───────────┬────────────────┘   │
                │                     │
         ┌──────▼──────┐      ┌──────▼──────┐
         │Notification │      │ Complaint   │
         │  Service    │      │  Service    │
         │  :8087      │      │  :8086      │
         │  (NestJS)   │      │             │
         │  (MongoDB)  │      │  (MySQL)    │
         └─────────────┘      └─────────────┘
```

## Communication Patterns

| From                 | To                       | Method                               | Purpose                                                                 |
| -------------------- | ------------------------ | ------------------------------------ | ----------------------------------------------------------------------- |
| **Order Service**    | Product Service          | **OpenFeign** (sync)                 | Validate products, get prices during order creation                     |
| **Order Service**    | Complaint + Notification | **RabbitMQ** fanout exchange (async) | ORDER_CREATED event — triggers auto-complaint + notification            |
| **Delivery Service** | Notification Service     | **RabbitMQ** topic exchange (async)  | ALL delivery status events (ASSIGNED, PICKED_UP, ON_THE_WAY, DELIVERED) |
| **Delivery Service** | Order Service            | **RestTemplate** via Gateway (sync)  | Update order to DELIVERED when delivery completes                       |
| **Delivery Service** | Order Service            | **RestTemplate** via Gateway (sync)  | Resolve clientId when creating delivery                                 |
| **Frontend**         | Notification Service     | **REST** via Gateway (sync)          | Fetch per-user notifications, unread count, mark read                   |
| **Frontend**         | User Service             | **REST** via Gateway (sync)          | Login (email lookup), signup (create user)                              |

### Sync vs Async Explained

- **Synchronous (Feign/REST):** Used when the caller NEEDS the response immediately (e.g., order creation needs product prices, delivery needs to update order status)
- **Asynchronous (RabbitMQ):** Used for **event notification** — the caller does NOT need to wait (e.g., order created → notify complaint-service and notification-service in the background)

### Notification Flow (end-to-end)

```
1. Client places order → Order Service saves order
2. Order Service → RabbitMQ (ORDER_CREATED_EXCHANGE, fanout)
3. Notification Service consumes → creates notification in MongoDB (userId = clientId)
4. Admin creates delivery → Delivery Service saves + publishes ASSIGNED event
5. Notification Service consumes → creates notification for CLIENT + LIVREUR
6. Courier updates to PICKED_UP → Delivery Service publishes PICKED_UP event
7. Notification Service consumes → creates notification for CLIENT
8. ... same for ON_THE_WAY and DELIVERED
9. Frontend polls unread count every 15 seconds
10. User clicks bell → GET /api/notifications/user/:userId → shows dropdown
```

## Databases

| Service              | Database                      | Type  |
| -------------------- | ----------------------------- | ----- |
| Order Service        | H2 in-memory (orderdb)        | SQL   |
| Store Service        | H2 in-memory (storedb)        | SQL   |
| Product Service      | H2 in-memory (productdb)      | SQL   |
| User Service         | MySQL orderly_users           | SQL   |
| Delivery Service     | MySQL orderly_delivery        | SQL   |
| Complaint Service    | MySQL orderly_complaint       | SQL   |
| Notification Service | MongoDB orderly_notifications | NoSQL |

## Troubleshooting

- **500 error on order creation**: Make sure product-service is running and products exist
- **No complaints after order**: Check RabbitMQ is running and complaint-service started
- **No notifications**: Check MongoDB is running and notification-service connected to RabbitMQ
- **Gateway 503**: Service not registered with Eureka yet - wait and retry
- **CORS errors in browser**: Gateway CORS is configured for all origins - clear browser cache
- **H2 data lost**: H2 is in-memory, data resets on service restart (by design for demo)
- **"No account found" on login**: You need to sign up first — there are no hardcoded demo users anymore
- **Notifications not appearing**: Check notification-service terminal for RabbitMQ connection logs. You must see `[RABBITMQ] Connected! Listening to all queues...` at startup. If you see retry/ECONNRESET errors, make sure: (1) RabbitMQ is running on port 5672, (2) amqplib is version 1.0.2+ (`npm ls amqplib` to check — older versions like 0.10.x are incompatible with Node.js 22+ and RabbitMQ 4.x)
- **Old RabbitMQ queues**: If you previously ran the system, delete old queues from RabbitMQ Management Console at http://localhost:15672 (guest/guest). The system now uses `ORDER_CREATED_EXCHANGE` (fanout) and `DELIVERY_EVENTS_EXCHANGE` (topic)
- **Auth guard blocking access**: Clear sessionStorage if stuck — `sessionStorage.removeItem('orderly_user')` in browser console

---

---

# HOW MY PROJECT WORKS — SIMPLE EXPLANATION

_(This section is designed to help you understand and explain the project to your professor.)_

---

## 1. The Big Picture (super simple)

ORDERLY is a **food delivery app** built with **microservices**.

That means: instead of one big program, we have **7 small programs** (services). Each one does ONE job. They talk to each other when they need to.

Here is the full picture:

- **Frontend** (Angular) = the website the user sees in the browser (port 4200)
- **Gateway** (Spring Cloud Gateway) = the "front door" — all requests go through it (port 9016)
- **Eureka** = the "phone book" — services register here so the Gateway can find them (port 8761)
- **Config Server** = stores shared settings for all services (port 8888)
- **RabbitMQ** = the "mailbox" — services drop messages here and other services pick them up later (port 5672)
- **7 backend services** = User, Store, Product, Order, Delivery, Complaint, Notification
- **Databases** = MySQL for most services, MongoDB for notifications, H2 (in-memory) for orders/stores/products

---

## 2. Sync vs Async — Explained Like You're a Beginner

### What is synchronous communication?

**Simple definition:** Service A asks Service B a question and **waits** for the answer before continuing.

**Like in real life:** You call someone on the phone. You wait on the line until they answer. You can't do anything else until they respond.

**ORDERLY example:**
When a client places an order, the **order-service** needs to check if the products exist and get their prices. So it **calls** the **product-service** and **waits** for the response. If product-service is down, the order fails.

**Technologies used:**

- **OpenFeign** = a tool that lets one Spring service call another using a simple Java interface. It finds the other service through Eureka (no URL needed).
- **RestTemplate** = another tool for making HTTP calls. Simpler, but you write the URL yourself.

---

### What is asynchronous communication?

**Simple definition:** Service A sends a message to a "mailbox" (RabbitMQ) and **moves on immediately**. It does NOT wait. Service B reads the message from the mailbox later, on its own time.

**Like in real life:** You send a text message. You don't wait for the person to read it. You go on with your day. They read it whenever they can.

**ORDERLY example:**
After the order is saved, the **order-service** drops a message in RabbitMQ saying "hey, order #5 was just created." Then it moves on. The **notification-service** picks up that message later and creates a notification. The **complaint-service** also picks up a copy and creates a complaint. Order-service doesn't know or care when they do it.

**Technology used:**

- **RabbitMQ** = a message broker. Think of it as a post office. Services send letters (messages) to a mailbox (exchange). Other services have their own inbox (queue) and pick up the letters.

---

### Quick comparison

|                                | Synchronous                          | Asynchronous                                          |
| ------------------------------ | ------------------------------------ | ----------------------------------------------------- |
| **Meaning**                    | Ask and WAIT for the answer          | Send a message and MOVE ON                            |
| **Real life**                  | Phone call                           | Text message                                          |
| **ORDERLY example**            | Order asks Product for the price     | Order tells Notification "order was created"          |
| **What if the other is down?** | The request FAILS                    | The message stays in the queue and is delivered later |
| **Technology**                 | OpenFeign / RestTemplate             | RabbitMQ                                              |
| **When to use**                | When you NEED the answer to continue | When you just want to INFORM other services           |

---

## 3. Communication by Service

---

### ORDER-SERVICE

**What it does:** Saves customer orders.

**It communicates with:**

| Talks to             | How?             | Sync or Async? | Technology        | Why?                                                                     |
| -------------------- | ---------------- | -------------- | ----------------- | ------------------------------------------------------------------------ |
| Product Service      | Directly         | **Sync**       | OpenFeign         | To check if products exist and get the real prices                       |
| Notification Service | Through RabbitMQ | **Async**      | RabbitMQ (fanout) | To tell it "a new order was created" so it can notify the client         |
| Complaint Service    | Through RabbitMQ | **Async**      | RabbitMQ (fanout) | To tell it "a new order was created" so it can create a complaint record |

**Real user-flow example:**

> Ahmed opens the app, picks 2 pizzas, and clicks "Place Order."
>
> 1. Order-service **calls** product-service (sync): "Does product #1 exist? What's its price?" → gets the answer → calculates total
> 2. Order-service saves the order in the database
> 3. Order-service **sends a message** to RabbitMQ (async): "Order #5 was created, clientId=2, total=27.50"
> 4. Notification-service picks up the message → creates a notification for Ahmed
> 5. Complaint-service picks up the same message → creates a complaint record

**What I can say to the professor:**

- "Order-service uses **synchronous** communication with product-service via **OpenFeign** because it needs the product prices before it can save the order."
- "After saving, it uses **asynchronous** communication via **RabbitMQ** to inform notification-service and complaint-service, because it doesn't need to wait for them."

**Code locations:**

- Feign call: `OrderService.java` line 90 → `productClient.getProductById(item.getProductId())`
- RabbitMQ publish: `OrderProducer.java` line 32 → `rabbitTemplate.convertAndSend(ORDER_CREATED_EXCHANGE, "", event)`
- Exchange config: `RabbitMQConfig.java` → `FanoutExchange("ORDER_CREATED_EXCHANGE")`

---

### DELIVERY-SERVICE

**What it does:** Manages deliveries — assigning couriers and tracking status.

**It communicates with:**

| Talks to             | How?                   | Sync or Async? | Technology       | Why?                                                                      |
| -------------------- | ---------------------- | -------------- | ---------------- | ------------------------------------------------------------------------- |
| Order Service        | Directly (via Gateway) | **Sync**       | RestTemplate     | (1) To get the clientId from the order (2) To mark the order as DELIVERED |
| Notification Service | Through RabbitMQ       | **Async**      | RabbitMQ (topic) | To notify the client and courier about every status change                |

**Real user-flow example:**

> The admin assigns a courier to Ahmed's order:
>
> 1. Delivery-service **calls** order-service (sync): "What is the clientId for order #5?" → gets clientId=2
> 2. Saves the delivery with status ASSIGNED
> 3. **Sends a message** to RabbitMQ (async): "delivery.ASSIGNED — deliveryId=1, orderId=5, courierId=3, clientId=2"
> 4. Notification-service picks it up → creates notification for Ahmed ("Courier Assigned") AND for the courier ("New Delivery Assignment")
>
> Later, the courier updates status to PICKED_UP, ON_THE_WAY, DELIVERED:
>
> - Each time, delivery-service publishes a new event to RabbitMQ
> - Notification-service creates a new notification for the client each time
> - When DELIVERED: delivery-service ALSO **calls** order-service (sync) to update the order status

**What I can say to the professor:**

- "Delivery-service uses **synchronous** RestTemplate to call order-service when it needs data (clientId) or needs to update the order status."
- "It uses **asynchronous** RabbitMQ to inform notification-service about every delivery status change, so the user sees live progress."

**Code locations:**

- Sync call (get clientId): `DeliveryService.java` line 62 → `restTemplate.getForObject(url, Map.class)`
- Sync call (update order): `DeliveryService.java` line 110 → `restTemplate.exchange(url, PATCH, ...)`
- Async publish: `DeliveryMessagingConfig.java` line 76 → `rabbitTemplate.convertAndSend(DELIVERY_EVENTS_EXCHANGE, routingKey, event)`
- Exchange config: `DeliveryMessagingConfig.java` → `TopicExchange("DELIVERY_EVENTS_EXCHANGE")`

---

### NOTIFICATION-SERVICE

**What it does:** Receives events from RabbitMQ and creates notifications in MongoDB. The frontend reads from it.

**It communicates with:**

| Talks to         | How?                           | Sync or Async? | Technology           | Why?                                                           |
| ---------------- | ------------------------------ | -------------- | -------------------- | -------------------------------------------------------------- |
| Order Service    | Through RabbitMQ (it RECEIVES) | **Async**      | RabbitMQ (fanout)    | Receives "order created" events to notify the client           |
| Delivery Service | Through RabbitMQ (it RECEIVES) | **Async**      | RabbitMQ (topic)     | Receives all delivery status events to notify client + courier |
| Frontend         | Directly (it is CALLED)        | **Sync**       | REST API via Gateway | Frontend reads notifications, unread count, marks as read      |

**Important:** Notification-service does NOT call anyone. It only **listens** and **is called**.

**Who gets notified for what:**

| Event             | Who gets the notification                                                               |
| ----------------- | --------------------------------------------------------------------------------------- |
| Order created     | The **client** who placed the order                                                     |
| Delivery assigned | The **client** ("a courier was assigned") + the **courier** ("you have a new delivery") |
| Picked up         | The **client** ("your order was picked up")                                             |
| On the way        | The **client** ("your order is on its way")                                             |
| Delivered         | The **client** ("your order was delivered")                                             |

**How it knows which user to notify:**

- The event message contains `clientId` and `courierId`
- Notification-service saves the notification with `userId = clientId` (or `courierId` for the courier)
- The frontend queries notifications by the logged-in user's ID

**What I can say to the professor:**

- "Notification-service is a NestJS app that listens to RabbitMQ for order and delivery events."
- "It is completely decoupled from order-service and delivery-service — they never call each other directly."
- "It saves notifications in MongoDB, and the frontend polls for new ones every 15 seconds."

**Code locations:**

- RabbitMQ connection + queue setup: `rabbitmq.consumer.ts` lines 48-68
- ORDER_CREATED consumer: `rabbitmq.consumer.ts` lines 76-97
- DELIVERY_ASSIGNED consumer: `rabbitmq.consumer.ts` lines 100-137
- REST API: `notification.controller.ts` — endpoints like `GET /api/notifications/user/:userId`

---

### COMPLAINT-SERVICE

**What it does:** Automatically creates a complaint record when an order is placed.

| Talks to      | How?                           | Sync or Async? | Technology        | Why?                                          |
| ------------- | ------------------------------ | -------------- | ----------------- | --------------------------------------------- |
| Order Service | Through RabbitMQ (it RECEIVES) | **Async**      | RabbitMQ (fanout) | Creates an auto-complaint for every new order |

**What I can say to the professor:**

- "When an order is created, complaint-service automatically receives the event from RabbitMQ and creates a complaint with status OPEN."
- "This works like notification-service — it listens to the same exchange but has its own queue."

**Code location:** `OrderConsumer.java` line 27 → `@RabbitListener(queues = ORDER_CREATED_COMPLAINT_QUEUE)`

---

### USER-SERVICE, STORE-SERVICE, PRODUCT-SERVICE

These 3 services are simple. They **do not communicate** with any other service.

| Service             | What it does                    | Communicates with other services?                    |
| ------------------- | ------------------------------- | ---------------------------------------------------- |
| **User Service**    | Creates accounts, handles login | **No.** Only called by the frontend.                 |
| **Store Service**   | Creates and lists stores        | **No.** Only called by the frontend.                 |
| **Product Service** | Creates and lists products      | **No.** But it IS called by order-service via Feign. |

---

### GATEWAY

**What it does:** The single entry point for ALL requests from the frontend.

The frontend never calls services directly. It always calls the Gateway on port 9016, and the Gateway **forwards** the request to the right service using Eureka to find it.

| Frontend calls          | Gateway forwards to  |
| ----------------------- | -------------------- |
| `/api/users/**`         | user-service         |
| `/api/stores/**`        | store-service        |
| `/api/products/**`      | product-service      |
| `/api/orders/**`        | order-service        |
| `/api/deliveries/**`    | delivery-service     |
| `/api/complaints/**`    | complaint-service    |
| `/api/notifications/**` | notification-service |

**What I can say:** "The Gateway is like a receptionist. The frontend asks the receptionist, and the receptionist knows which department to forward the call to."

---

### FRONTEND (Angular)

**What it does:** The website the user interacts with.

**How notifications work in the frontend:**

1. When you log in, the app stores your `userId` in session storage
2. The bell icon in the top-right corner polls `GET /api/notifications/user/{userId}/unread-count` every 15 seconds
3. When you click the bell, it fetches `GET /api/notifications/user/{userId}` to show the list
4. When you click a notification, it calls `PATCH /api/notifications/{id}/read` to mark it as read
5. "Mark all read" calls `PATCH /api/notifications/user/{userId}/read-all`

All these calls go through the Gateway to the notification-service.

---

## 4. The Notification Flow — Step by Step

This is the most important flow to understand. Let's follow it from start to finish.

### A. Order is placed → Client gets notification

```
Step 1: Client clicks "Place Order" in the frontend
Step 2: Frontend → Gateway → Order Service
Step 3: Order Service saves the order in the database
Step 4: Order Service → RabbitMQ (drops message in ORDER_CREATED_EXCHANGE)
Step 5: RabbitMQ → Notification Service (picks up message from ORDER_CREATED_NOTIFICATION_QUEUE)
Step 6: Notification Service creates notification in MongoDB (userId = clientId)
Step 7: Frontend polls → finds 1 unread → shows red badge on the bell
Step 8: Client clicks bell → sees "New Order Placed — Your order #5 has been placed!"
```

**Is it a communication even though they don't call each other directly?**
**YES.** Order → Notification is a real communication. It just goes THROUGH RabbitMQ instead of directly. This is called **indirect/asynchronous** communication.

### B. Delivery status changes → Client gets notifications

```
Admin creates delivery (ASSIGNED):
   Delivery Service → RabbitMQ (delivery.ASSIGNED) → Notification Service
   → Notification for CLIENT: "Courier Assigned"
   → Notification for COURIER: "New Delivery Assignment"

Courier updates to PICKED_UP:
   Delivery Service → RabbitMQ (delivery.PICKED_UP) → Notification Service
   → Notification for CLIENT: "Order Picked Up"

Courier updates to ON_THE_WAY:
   Delivery Service → RabbitMQ (delivery.ON_THE_WAY) → Notification Service
   → Notification for CLIENT: "On The Way!"

Courier updates to DELIVERED:
   Delivery Service → RabbitMQ (delivery.DELIVERED) → Notification Service
   → Notification for CLIENT: "Order Delivered!"
   ALSO: Delivery Service → Order Service (sync REST) → marks order as DELIVERED
```

### C. How does a notification know which user it belongs to?

Every event message contains these IDs:

- `clientId` = the customer who placed the order (comes from the order)
- `courierId` = the delivery person (comes from the delivery)

Notification-service uses these to set the `userId` field:

- For client notifications: `userId = clientId`
- For courier notifications: `userId = courierId`

The frontend queries: `GET /api/notifications/user/2` (where 2 is the logged-in user's ID).
So each user only sees their own notifications.

### D. How to show the RabbitMQ flow to your professor

1. Open **http://localhost:15672** (RabbitMQ Management UI, login: guest/guest)
2. Go to **Exchanges** tab → click on `ORDER_CREATED_EXCHANGE`
   - Show that it's type **fanout** (sends to ALL bound queues)
   - Show the **Bindings**: 2 queues are bound (complaint + notification)
3. Go to **Exchanges** tab → click on `DELIVERY_EVENTS_EXCHANGE`
   - Show that it's type **topic** (sends to queues based on the routing key)
   - Show the **Bindings**: 4 queues with routing keys (delivery.ASSIGNED, etc.)
4. Go to **Queues** tab → show the 8 queues (as in your screenshot)
5. **Live demo**: place an order in the frontend → refresh RabbitMQ UI → see the "incoming" rate spike briefly → show the notification in the bell

---

## 5. Final Communication Table

| #   | From             | To                   | Sync/Async | Technology               | Why it exists                                         | If it fails?                               |
| --- | ---------------- | -------------------- | ---------- | ------------------------ | ----------------------------------------------------- | ------------------------------------------ |
| 1   | Order Service    | Product Service      | **Sync**   | OpenFeign                | Get product prices to calculate total                 | Order creation fails (500 error)           |
| 2   | Order Service    | Notification Service | **Async**  | RabbitMQ (fanout)        | Notify client that order was placed                   | Order still saved, notification delayed    |
| 3   | Order Service    | Complaint Service    | **Async**  | RabbitMQ (fanout)        | Auto-create complaint for new order                   | Order still saved, complaint delayed       |
| 4   | Delivery Service | Order Service        | **Sync**   | RestTemplate             | Get clientId from order / mark order as DELIVERED     | Warning logged, delivery still saved       |
| 5   | Delivery Service | Notification Service | **Async**  | RabbitMQ (topic)         | Notify client+courier of every delivery status change | Delivery still saved, notification delayed |
| 6   | Frontend         | All services         | **Sync**   | HTTP via Gateway         | User interacts with the app                           | User sees error in the UI                  |
| 7   | Gateway          | All services         | **Sync**   | Eureka service discovery | Route requests to the right service                   | Gateway returns 503                        |

---

## 6. Easy Memory Version

**Order Service:**

- talks to **Product Service** (sync, Feign) → to get prices
- talks to **Notification Service** (async, RabbitMQ) → to notify client
- talks to **Complaint Service** (async, RabbitMQ) → to create complaint

**Delivery Service:**

- talks to **Order Service** (sync, RestTemplate) → to get clientId + update order status
- talks to **Notification Service** (async, RabbitMQ) → to notify client and courier

**Notification Service:**

- receives from **Order Service** (async, RabbitMQ)
- receives from **Delivery Service** (async, RabbitMQ)
- the **Frontend** reads from it (sync, REST)

**Complaint Service:**

- receives from **Order Service** (async, RabbitMQ)

**User / Store / Product Service:**

- standalone (no inter-service communication)
- only called by the frontend through the Gateway

---

## 7. What I Say to the Professor

### A. Oral explanation in English (1 minute)

> "Our project ORDERLY is a food delivery application built with 7 microservices. Each service has its own database and runs on its own port.
>
> Services communicate in two ways. **Synchronous** communication is when a service needs an answer right away — for example, when order-service calls product-service using OpenFeign to get product prices. If product-service doesn't respond, the order fails.
>
> **Asynchronous** communication is when a service sends information but doesn't wait — for example, after saving an order, order-service publishes an event to RabbitMQ. The notification-service and complaint-service each pick up a copy and process it independently. The order-service doesn't wait for them.
>
> For notifications, we have two RabbitMQ exchanges: a **fanout** exchange for order events that sends to both complaint and notification queues, and a **topic** exchange for delivery events that uses routing keys like delivery.ASSIGNED and delivery.DELIVERED. The notification service stores everything in MongoDB, and the Angular frontend polls every 15 seconds to show them in the bell icon."

### B. Oral explanation in French (1 minute)

> "Notre projet ORDERLY est une application de livraison de nourriture construite avec 7 microservices. Chaque service a sa propre base de données.
>
> Les services communiquent de deux façons. La communication **synchrone**, c'est quand un service a besoin d'une réponse tout de suite — par exemple, order-service appelle product-service avec OpenFeign pour avoir les prix des produits.
>
> La communication **asynchrone**, c'est quand un service envoie une information sans attendre de réponse — par exemple, après avoir sauvegardé la commande, order-service publie un événement dans RabbitMQ. Le notification-service et le complaint-service récupèrent chacun une copie du message et le traitent indépendamment.
>
> On a deux exchanges RabbitMQ : un **fanout** pour les événements de commande, qui diffuse vers les queues complaint et notification, et un **topic** pour les événements de livraison, avec des routing keys comme delivery.ASSIGNED, delivery.PICKED_UP. Le service de notification stocke tout dans MongoDB, et le frontend Angular interroge les notifications toutes les 15 secondes pour les afficher dans l'icône cloche."

### C. Answers to likely professor questions

**Q: Why did you use RabbitMQ?**

> "To decouple the services. Order-service doesn't need to know about notification-service. It just publishes an event. If notification-service is down, the message stays in the queue and is processed when it comes back."

**Q: Why is Order → Product synchronous?**

> "Because order-service NEEDS the product prices to calculate the total before saving. It can't continue without the answer."

**Q: Why is Order → Notification asynchronous?**

> "Because order-service doesn't need to wait for the notification to be created. The order is already saved. The notification is a background task that can happen later."

**Q: Is Order → Notification still a communication even without direct REST?**

> "Yes! It's an indirect communication through RabbitMQ. Order-service publishes, notification-service consumes. They just don't call each other directly."

**Q: Why does Delivery communicate with Order?**

> "Two reasons: (1) When creating a delivery, it needs to get the clientId from the order, so it knows who to send notifications to. (2) When a delivery is marked DELIVERED, it updates the order status to DELIVERED too."

**Q: How do notifications know which user receives them?**

> "The event message contains the clientId and courierId. Notification-service saves the notification with the right userId. The frontend queries by the logged-in user's ID."

**Q: What is the role of the Gateway?**

> "It's the single entry point. The frontend never calls services directly. It calls the Gateway, and the Gateway uses Eureka to find and forward the request to the correct service."

**Q: What is the role of Eureka?**

> "It's the service registry — like a phone book. Each service registers itself when it starts. The Gateway and Feign clients look up service addresses from Eureka instead of using hardcoded URLs."

**Q: What does Keycloak add?**

> "Keycloak would add OAuth2 security — token-based authentication. The code is prepared (security config exists but is commented out). We disabled it for development but it can be activated by starting a Keycloak server and uncommenting the config."

**Q: What is the difference between fanout and topic exchanges?**

> "Fanout sends a copy of every message to ALL bound queues — we use it for ORDER_CREATED because both complaint and notification need the same event. Topic lets you filter messages by routing key — we use it for delivery events so notification-service can subscribe to specific statuses like delivery.ASSIGNED or delivery.DELIVERED."

---

## Code Extracts for Professor Reference

_(These are the real code snippets with exact file paths, to show during the presentation if needed.)_

### OpenFeign — Order calls Product (Synchronous)

```java
// 📁 services/order-service/.../client/ProductClient.java

@FeignClient(name = "product-service")
public interface ProductClient {
    @GetMapping("/api/products/{id}")
    ProductDTO getProductById(@PathVariable("id") Long id);
}
```

```java
// 📁 services/order-service/.../service/OrderService.java (line 90)

ProductDTO product = productClient.getProductById(item.getProductId());
// ⚡ SYNCHRONOUS — waits for response from product-service
```

### RabbitMQ — Order publishes event (Asynchronous)

```java
// 📁 services/order-service/.../messaging/OrderProducer.java (line 32)

rabbitTemplate.convertAndSend(ORDER_CREATED_EXCHANGE, "", event);
// 📤 ASYNCHRONOUS — sends to RabbitMQ and moves on
```

```java
// 📁 services/order-service/.../messaging/RabbitMQConfig.java

@Bean
public FanoutExchange orderCreatedExchange() {
    return new FanoutExchange("ORDER_CREATED_EXCHANGE", true, false);
}
// FANOUT = every bound queue receives a copy
```

### RestTemplate — Delivery calls Order (Synchronous)

```java
// 📁 services/delivery-service/.../service/DeliveryService.java (line 62)

String url = "http://localhost:9016/api/orders/" + d.getOrderId();
var response = restTemplate.getForObject(url, Map.class);
// ⚡ SYNCHRONOUS — calls order-service through the Gateway
```

### RabbitMQ — Delivery publishes events (Asynchronous)

```java
// 📁 services/delivery-service/.../messaging/DeliveryMessagingConfig.java (line 76)

String routingKey = "delivery." + status;  // e.g., "delivery.ASSIGNED"
rabbitTemplate.convertAndSend(DELIVERY_EVENTS_EXCHANGE, routingKey, event);
// 📤 ASYNCHRONOUS — topic exchange with routing key filtering
```

### RabbitMQ — Complaint consumes (Spring Boot)

```java
// 📁 services/complaint-service/.../messaging/OrderConsumer.java

@RabbitListener(queues = "ORDER_CREATED_COMPLAINT_QUEUE")
public void receiveOrderEvent(OrderEventDTO event) {
    complaintService.receiveOrderEvent(event);
    // 📥 ASYNCHRONOUS — auto-receives + auto-deserializes from RabbitMQ
}
```

### RabbitMQ — Notification consumes (NestJS)

```typescript
// 📁 services/notification-service/src/rabbitmq.consumer.ts (line 76)

this.channel.consume("ORDER_CREATED_NOTIFICATION_QUEUE", async (msg) => {
  const event = JSON.parse(msg.content.toString());
  await this.notificationService.create({
    title: "New Order Placed",
    userId: String(event.clientId),
    type: "ORDER_CREATED",
  });
  this.channel.ack(msg);
  // 📥 ASYNCHRONOUS — receives from RabbitMQ, saves to MongoDB
});
```

---

## Visual Schema

```
SYNCHRONOUS (direct calls, waits for response):

   Order Service ──── OpenFeign ────→ Product Service
      "What is the price of product #1?"  →  "12.50 TND"

   Delivery Service ── RestTemplate ──→ Order Service (via Gateway)
      "What is the clientId of order #5?"  →  "clientId = 2"
      "Mark order #5 as DELIVERED"         →  "OK"


ASYNCHRONOUS (messages via RabbitMQ, does NOT wait):

   Order Service ──→ ORDER_CREATED_EXCHANGE (fanout)
                        ├──→ Complaint Service  (creates complaint)
                        └──→ Notification Service (creates notification)

   Delivery Service ──→ DELIVERY_EVENTS_EXCHANGE (topic)
                        ├── delivery.ASSIGNED   ──→ Notification Service
                        ├── delivery.PICKED_UP  ──→ Notification Service
                        ├── delivery.ON_THE_WAY ──→ Notification Service
                        └── delivery.DELIVERED  ──→ Notification Service


STANDALONE (no inter-service communication):

   User Service      ← called by frontend only
   Store Service     ← called by frontend only
   Product Service   ← called by frontend + Order Service (via Feign)
```
