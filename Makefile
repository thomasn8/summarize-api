include .env

DOCKER = docker-compose -f ./docker-compose.dev.yml -p ${APP_NAME}
# DOCKER = docker-compose -f ./docker-compose.prod.yml -p ${APP_NAME}

all:	start

start:
			${DOCKER} up -d --build
down:
			${DOCKER} down
setup:
			${DOCKER} -f ./docker-compose.setup.yml up -d --build
clean: down
			 rm -rf back _build/nginx/certs
re:		down start

certs:
			openssl req -x509 -nodes -days 365 -newkey rsa:2048 -subj '/C=CH/ST=Valais/L=Sierre/O=private/OU=IT/CN=localhost' -keyout _build/nginx/certs/nginx.key -out _build/nginx/certs/nginx.crt

logs:
			${DOCKER} logs
flogs:
			${DOCKER} logs -f

back:
			${DOCKER} logs -f back
nginx:
			${DOCKER} logs -f nginx


runback:
			${DOCKER} exec back bash
runnginx:
			${DOCKER} exec nginx bash

.PHONY:	all start down setup clean re logs flogs back nginx runback runnginx
