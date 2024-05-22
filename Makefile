include .env

DOCKER = docker compose -f ./docker-compose.dev.yml -p ${APP_NAME}
# DOCKER = docker compose -f ./docker-compose.prod.yml -p ${APP_NAME}

all:	start

start:
			${DOCKER} up -d --build
build:
			${DOCKER} build
down:
			${DOCKER} down
setup:
			${DOCKER} -f ./docker-compose.setup.yml up -d --build
started:
			${DOCKER} -f ./docker-compose.started.yml up -d --build
clean: down
			 rm -rf back front _build/nginx/certs
re:		down start

# certs:
# 			openssl req -x509 -nodes -days 365 -newkey rsa:2048 -subj '/C=CH/ST=Valais/L=Sierre/O=private/OU=IT/CN=localhost' -keyout _build/nginx/certs/nginx.key -out _build/nginx/certs/nginx.crt

logs:
			${DOCKER} logs
flogs:
			${DOCKER} logs -f

front:
			${DOCKER} logs -f front
back:
			${DOCKER} logs -f back
nginx:
			${DOCKER} logs -f nginx
db:
			${DOCKER} logs -f db


runfront:
			${DOCKER} exec front bash
runback:
			${DOCKER} exec back bash
runnginx:
			${DOCKER} exec nginx bash
rundb:
			${DOCKER} exec db bash


.PHONY:		all start build down setup clean re logs flogs front back nginx db runfront runback runningx rundb