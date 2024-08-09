# Docker compose for nestjs backend and angular frontend (both with node 20.12) and nginx as proxy server

## Setup:
copy and update .env.example
run ```make setup```

## Dev:
run ```make```

## Prod:
reverse the ```DOCKER``` variable in the Makefile and run ```make```

## Other infos:
- other make commands are available, see Makefile
- volumes are defined in this current project folder for the source code (back)
- node_modules persisted in the volumes will be gitignored
- in dev additional ports are opened, see docker-compose.dev.yml