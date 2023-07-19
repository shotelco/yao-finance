docker build -t yourdocker/finance-backend .

docker container run -d -p 8000:8000 yourdocker/finance-backend