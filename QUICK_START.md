# Orderly Microservices - Quick Start Testing Guide

## ✅ Everything is Fixed and Ready!

All your microservices are running and authentication has been temporarily disabled for easy testing.

## 🚀 Quick Test in Postman

1. **Import the Collection**:
   - Open Postman
   - Click "Import"
   - Select file: `docs/Orderly_Microservices_Postman_Collection.json`
   - The collection includes ALL CRUD operations for all 7 services

2. **Start Testing** (No authentication needed!):
   - Just click "Send" on any request
   - All requests go through Gateway: `http://localhost:9016`
   
## 📝 Recommended Test Sequence

**Step 1**: Create a Client User
- Collection → 1. User Service → CREATE User
- Use the default body (email: test@orderly.tn)
- **Note the returned `id`** (usually 1)

**Step 2**: Create a Store  
- Collection → 2. Store Service → CREATE Store
- **Note the returned `id`**

**Step 3**: Create a Product
- Collection → 3. Product Service → CREATE Product
- Make sure `storeId` matches your store ID
- **Note the returned `id`**

**Step 4**: Create an Order
- Collection → 4. Order Service → CREATE Order
- Update IDs: `clientId`, `storeId`, `productId` with your values
- **Note the returned `id`**

**Step 5**: Confirm Order
- Collection → 4. Order Service → UPDATE Order Status - CONFIRMED
- Update URL with your order ID

**Step 6**: Create Delivery
- Collection → 5. Delivery Service → CREATE Delivery
- Update `orderId` with your order ID
- Update `courierId` with a user ID (create another user with role "LIVREUR" first)

**Step 7**: Update Delivery
- Collection → 5. Delivery Service → UPDATE Delivery Status - ON_THE_WAY

**Step 8**: Create Complaint (optional)
- Collection → 6. Complaint Service → CREATE Complaint

**Step 9**: Send Notification
- Collection → 7. Notification Service → CREATE Notification

## 🌐 Test Frontend

```bash
cd frontend/orderly-frontend
npm start
```

Go to: `http://localhost:4310`

**Expected Result**: Dashboard loads WITHOUT 401 errors! 

## 📊 Quick Service URLs

- **Gateway API**: http://localhost:9016/api/*
- **Eureka Dashboard**: http://localhost:8761
- **Swagger UIs**:
  - User: http://localhost:8089/swagger-ui.html
  - Order: http://localhost:8084/swagger-ui.html
  - Product: http://localhost:8093/swagger-ui.html
  - Store: http://localhost:8092/swagger-ui.html
  - Delivery: http://localhost:8085/swagger-ui.html
  - Complaint: http://localhost:8086/swagger-ui.html

## ⚡ All Services Status

✅ Eureka (8761)
✅ Config Server (8888)
✅ Gateway (9016)
✅ User Service (8089, 8090)
✅ Order Service (8084)
✅ Store Service (8092)
✅ Product Service (8093)
✅ Delivery Service (8085)
✅ Complaint Service (8086)
✅ Notification Service (8087)

**Everything is running and ready to test!** 🎉

For complete details, see: `walkthrough.md`
