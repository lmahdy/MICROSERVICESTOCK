@echo off
REM Test all microservices via API Gateway

echo.
echo ======================================
echo TESTING MICROSERVICES - NO AUTHENTICATION
echo ======================================
echo.

echo [1/7] Testing User Service...
curl -X GET http://localhost:9016/api/users -H "Content-Type: application/json"
echo.
echo.

echo [2/7] Testing Store Service...
curl -X GET http://localhost:9016/api/stores -H "Content-Type: application/json"
echo.
echo.

echo [3/7] Testing Product Service...
curl -X GET http://localhost:9016/api/products -H "Content-Type: application/json"
echo.
echo.

echo [4/7] Testing Order Service...
curl -X GET http://localhost:9016/api/orders -H "Content-Type: application/json"
echo.
echo.

echo [5/7] Testing Delivery Service...
curl -X GET http://localhost:9016/api/deliveries -H "Content-Type: application/json"
echo.
echo.

echo [6/7] Testing Complaint Service...
curl -X GET http://localhost:9016/api/complaints -H "Content-Type: application/json"
echo.
echo.

echo [7/7] Testing Notification Service...
curl -X GET http://localhost:9016/api/notifications -H "Content-Type: application/json"
echo.
echo.

echo ======================================
echo ALL TESTS COMPLETE!
echo ======================================
pause
