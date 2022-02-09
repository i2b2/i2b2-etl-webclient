FROM i2b2/i2b2-web:release-v1.7.12a.0002


COPY . /var/www/html/webclient
COPY ./i2b2_proxy.conf /etc/httpd/conf.d/i2b2_proxy.conf