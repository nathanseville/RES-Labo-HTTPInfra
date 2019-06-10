FROM php:5.6-apache

COPY conf/ /etc/apache2
COPY src/ /var/www/html/

RUN a2enmod heartbeat
RUN a2enconf 000-*

