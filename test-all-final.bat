@echo off
REM Final comprehensive test for ALL 7 microservices
REM Uses JSON files to avoid escaping issues

echo ========================================
echo ALL 7 MICROSERVICES FULL TEST
echo ========================================
echo.

echo [1] GET All Stores...
curl -X GET http://localhost:9016/api/stores
echo.
echo.

echo [2] GET All Products...
curl -X GET http://localhost:9016/api/products
echo.
echo.

echo [3] Creating Product #2...
echo {"name":"Burger Deluxe","description":"Tasty burger","price":12.00,"storeId":1} > product-test.json
curl -X POST http://localhost:9016/api/products -H "Content-Type: application/json" --data-binary "@product-test.json"
echo.
echo.

echo [4] GET All Products...
curl -X GET http://localhost:9016/api/products
echo.
echo.

echo [5] GET All Orders...
curl -X GET http://localhost:9016/api/orders
echo.
echo.

echo [6] GET All Deliveries...
curl -X GET http://localhost:9016/api/deliveries
echo.
echo.

echo [7] GET All Complaints...
curl -X GET http://localhost:9016/api/complaints
echo.
echo.

echo [8] GET All Notifications...
curl -X GET http://localhost:9016/api/notifications
echo.
echo.

echo ========================================
echo ALL 7 SERVICES TESTED!
echo ========================================
pause
