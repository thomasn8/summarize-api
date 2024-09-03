# Docker compose for nestjs backend and angular frontend (both with node 20.12) and nginx as proxy server

## Setup:
copy and update .env.example
run ```make setup```

## Dev:
run ```make```

## Prod:
reverse the ```DOCKER``` variable in the Makefile and run ```make```