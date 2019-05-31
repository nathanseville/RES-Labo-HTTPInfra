<div style="text-align: right">Nathan Séville & Julien Quartier</div>

# RES-Labo-HTTPInfra

## Step 1: Static HTTP server with apache httpd

> Static dockerized http server based on `php:5.6-apache` image. Bootstrap template can be found in `src/` (tempalte from: https://startbootstrap.com/themes/stylish-portfolio/). Any files located in `src/` will be copied on container to `/var/www/html/`.

*Build*: `docker build -t res/statichttp .`

*Run*: `docker run -p 9090:80 -d res/statichttp`

