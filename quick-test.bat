@echo off
echo ===== QUICK SERVICE TEST =====
echo.
echo Testing User Service...
curl -s -X GET http://localhost:8090/api/users
echo.
echo.
echo Testing Order Service...
curl -s -X GET http://localhost:8084/api/orders
echo.
echo.
echo All done!
pause
