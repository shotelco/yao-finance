docker build -t yourdocker/finance-web .

docker container run -d -p 80:8080 yourdocker/finance-web
