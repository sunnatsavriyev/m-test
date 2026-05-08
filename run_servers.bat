@echo off
start cmd /k "cd backend && python manage.py runserver 0.0.0.0:8000"
start cmd /k "cd frontend && npm run dev -- --host 0.0.0.0"
echo Serverlar ishga tushirildi!
echo Backend: http://[Sizning_IP]:8000
echo Frontend: http://[Sizning_IP]:5173
pause
