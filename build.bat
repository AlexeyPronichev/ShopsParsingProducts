mkdir .\parser_backend\backend\static
mkdir .\parser_backend\backend\templates
cd .\parser_frontend
call npm install
call npm run build

copy .\build\index.html ..\parser_backend\backend\templates\index.html /a
robocopy .\build\static ..\parser_backend\backend\static /E

cd ..\parser_backend
call python -m venv venv
call .\venv\Scripts\activate.bat
call pip install -r requirements.txt
set FLASK_APP=backend
flask db init
flask db migrate
flask db upgrade

pause
