FROM node:20.12-bookworm

RUN apt-get update && \
    apt-get install -y vim && \
		rm -rf /var/lib/apt/lists/*

RUN npm add -g @angular/cli

COPY start.sh /

CMD ["sh", "/start.sh"]