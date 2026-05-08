@echo off
echo [1/4] Creating Backend Virtual Environment...
cd backend
python -m venv venv
call venv\Scripts\activate

echo [2/4] Installing Backend Dependencies...
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt openpyxl psycopg2-binary

echo [3/4] Running Migrations...
python manage.py makemigrations
python manage.py migrate

echo [4/4] Installing Frontend Dependencies...
cd ../frontend
npm install

echo.
echo Setup complete! To start the servers:
echo Backend: cd backend ^& venv\Scripts\activate ^& python manage.py runserver
echo Frontend: cd frontend ^& npm run dev
pause
