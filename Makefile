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
re:		down start

logs:
			${DOCKER} logs
flogs:
			${DOCKER} logs -f
sh:
			${DOCKER} exec back bash

.PHONY:	all start down setup re logs flogs sh
