FROM nginx:stable-alpine
# 暴力拷贝到所有可能的路径
COPY ./index.html /usr/share/nginx/html/index.html
COPY ./main.js /usr/share/nginx/html/main.js
COPY ./style.css /usr/share/nginx/html/style.css

COPY ./index.html /var/www/html/index.html
COPY ./main.js /var/www/html/main.js
COPY ./style.css /var/www/html/style.css

# 设置极其宽松的权限
RUN chmod -R 777 /usr/share/nginx/html
RUN chmod -R 777 /var/www/html
EXPOSE 80
