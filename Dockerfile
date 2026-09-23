FROM docker.xuanyuan.run/library/nginx:1.30.4-alpine-slim

COPY dev-ops/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY dev-ops/nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY docs/.vitepress/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]