@echo off
echo Testing ALL Services - No Auth Required
echo.

echo Testing User Service (8090)...
curl -X GET http://localhost:8090/api/users
echo.
echo.

echo Testing Order Service (8084)...
curl -X GET http://localhost:8084/api/orders
echo.
echo.

echo Testing Product Service (8093)...
curl -X GET http://localhost:8093/api/products
echo.
echo.

echo Testing Store Service (8092)...
curl -X GET http://localhost:8092/api/stores
echo.
echo.

echo Testing Delivery Service (8085)...
curl -X GET http://localhost:8085/api/deliveries
echo.
echo.

echo Testing Complaint Service (8086)...
curl -X GET http://localhost:8086/api/complaints
echo.
echo.

echo ===== ALL TESTS COMPLETE =====
pause
