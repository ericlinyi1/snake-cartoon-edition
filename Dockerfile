FROM nginx:stable-alpine
COPY ./index.html /usr/share/nginx/html/index.html
COPY ./main.js /usr/share/nginx/html/main.js
COPY ./style.css /usr/share/nginx/html/style.css
# 如果有其他资源也一并显式拷贝
RUN chmod -R 755 /usr/share/nginx/html
EXPOSE 80
