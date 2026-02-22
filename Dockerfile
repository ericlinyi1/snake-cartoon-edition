FROM nginx:stable-alpine
# 删除默认的 nginx 页面
RUN rm -rf /usr/share/nginx/html/*
# 拷贝当前目录下的所有文件到 nginx 静态目录
COPY . /usr/share/nginx/html/
# 确保所有文件都有正确的权限
RUN chmod -R 755 /usr/share/nginx/html
EXPOSE 80
