FROM nginx:stable-bookworm

RUN apt-get update && \
    apt-get install -y vim && \
		rm -rf /var/lib/apt/lists/*

COPY local.conf /etc/nginx/conf.d/default.conf

COPY start.sh /

CMD ["sh", "/start.sh"]