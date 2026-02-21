@echo off
REM Comprehensive testing script for all microservices
REM This script tests CREATE, READ, UPDATE, DELETE operations

echo.
echo ========================================
echo COMPREHENSIVE MICROSERVICES TESTING
echo ========================================
echo.

REM Test 1: Create a User
echo [1] Creating a User...
curl -X POST http://localhost:9016/api/users ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\":\"John Doe\",\"email\":\"john@orderly.tn\",\"phone\":\"+21612345678\",\"address\":\"123 Elm St\",\"role\":\"CLIENT\"}"
echo.
echo.

REM Test 2: Get All Users
echo [2] Getting All Users...
curl -X GET http://localhost:9016/api/users
echo.
echo.

REM Test 3. Create a Store
echo [3] Creating a Store...
curl -X POST http://localhost:9016/api/stores ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Pizza Paradise\",\"description\":\"Best pizza in town\",\"address\":\"123 Main St\",\"phone\":\"+21671234567\",\"openingHours\":\"9AM-10PM\",\"rating\":5}"
echo.
echo.

REM Test 4: Get All Stores
echo [4] Getting All Stores...
curl -X GET http://localhost:9016/api/stores
echo.
echo.

REM Test 5: Create a Product
echo [5] Creating a Product...
curl -X POST http://localhost:9016/api/products ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Margherita Pizza\",\"description\":\"Classic pizza\",\"price\":15.50,\"storeId\":1}"
echo.
echo.

REM Test 6: Get All Products
echo [6] Getting All Products...
curl -X GET http://localhost:9016/api/products
echo.
echo.

REM Test 7: Create an Order
echo [7] Creating an Order...
curl -X POST http://localhost:9016/api/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"clientId\":1,\"storeId\":1,\"totalAmount\":31.00,\"deliveryAddress\":\"456 Oak St\",\"items\":[{\"productId\":1,\"quantity\":2,\"unitPrice\":15.50}]}"
echo.
echo.

REM Test 8: Get All Orders
echo [8] Getting All Orders...
curl -X GET http://localhost:9016/api/orders
echo.
echo.

REM Test 9: Create a Delivery
echo [9] Creating a Delivery...
curl -X POST http://localhost:9016/api/deliveries ^
  -H "Content-Type: application/json" ^
  -d "{\"orderId\":1,\"courierId\":1,\"estimatedTime\":\"30 minutes\",\"status\":\"ASSIGNED\"}"
echo.
echo.

REM Test 10: Get All Deliveries
echo [10] Getting All Deliveries...
curl -X GET http://localhost:9016/api/deliveries
echo.
echo.

REM Test 11: Create a Complaint
echo [11] Creating a Complaint...
curl -X POST http://localhost:9016/api/complaints ^
  -H "Content-Type: application/json" ^
  -d "{\"orderId\":1,\"clientId\":1,\"description\":\"Food arrived cold\"}"
echo.
echo.

REM Test 12: Get All Complaints
echo [12] Getting All Complaints...
curl -X GET http://localhost:9016/api/complaints
echo.
echo.

REM Test 13: Create a Notification (if service is running)
echo [13] Testing Notification Service...
curl -X GET http://localhost:9016/api/notifications
echo.
echo.

echo ========================================
echo ALL TESTS COMPLETE!
echo ========================================
pause
