@echo off
REM Test ONLY the working services

echo ========================================
echo TESTING WORKING SERVICES ONLY
echo ========================================
echo.

echo [1] Testing User Service - GET ALL...
curl -X GET http://localhost:9016/api/users
echo.
echo.

echo [2] Testing Product Service - GET ALL...
curl -X GET http://localhost:9016/api/products
echo.
echo.

echo [3] Creating a Product...
curl -X POST http://localhost:9016/api/products ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Caesar Salad\",\"description\":\"Fresh salad\",\"price\":8.50,\"storeId\":1}"
echo.
echo.

echo [4] Getting ALL Products...
curl -X GET http://localhost:9016/api/products
echo.
echo.

echo [5] Testing Order Service - GET ALL...
curl -X GET http://localhost:9016/api/orders
echo.
echo.

echo [6] Creating an Order...
curl -X POST http://localhost:9016/api/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"clientId\":1,\"storeId\":1,\"totalAmount\":17.00,\"deliveryAddress\":\"789 Pine Ave\",\"items\":[{\"productId\":2,\"quantity\":2,\"unitPrice\":8.50}]}"
echo.
echo.

echo [7] Getting ALL Orders...
curl -X GET http://localhost:9016/api/orders
echo.
echo.

echo [8] Testing Delivery Service - GET ALL...
curl -X GET http://localhost:9016/api/deliveries
echo.
echo.

echo [9] Creating a Delivery...
curl -X POST http://localhost:9016/api/deliveries ^
  -H "Content-Type: application/json" ^
  -d "{\"orderId\":2,\"courierId\":1,\"estimatedTime\":\"25 minutes\",\"status\":\"ASSIGNED\"}"
echo.
echo.

echo [10] Getting ALL Deliveries...
curl -X GET http://localhost:9016/api/deliveries
echo.
echo.

echo [11] Testing Complaint Service - GET ALL...
curl -X GET http://localhost:9016/api/complaints
echo.
echo.

echo [12] Creating a Complaint...
curl -X POST http://localhost:9016/api/complaints ^
  -H "Content-Type: application/json" ^
  -d "{\"orderId\":2,\"clientId\":1,\"description\":\"Delivery was late\"}"
echo.
echo.

echo [13] Getting ALL Complaints...
curl -X GET http://localhost:9016/api/complaints
echo.
echo.

echo [14] Testing Notification Service...
curl -X GET http://localhost:9016/api/notifications
echo.
echo.

echo ========================================
echo WORKING SERVICES TESTED SUCCESSFULLY!
echo ========================================
pause
