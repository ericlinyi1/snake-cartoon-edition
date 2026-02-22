FROM nginx:stable-alpine
# 删除默认文件
RUN rm -rf /usr/share/nginx/html/*
# 显式拷贝到根目录
COPY index.html /usr/share/nginx/html/index.html
COPY main.js /usr/share/nginx/html/main.js
COPY style.css /usr/share/nginx/html/style.css
# 权限
RUN chmod -R 755 /usr/share/nginx/html
EXPOSE 80
