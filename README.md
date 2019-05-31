<div style="text-align: right">Nathan Séville & Julien Quartier</div>

# RES-Labo-HTTPInfra

## Step 1: Static HTTP server with apache httpd

> Static dockerized http server based on `php:5.6-apache` image. Bootstrap template can be found in `src/` (tempalte from: https://startbootstrap.com/themes/stylish-portfolio/). Any files located in `src/` will be copied on container to `/var/www/html/`.

*Build*: `docker build -t res/statichttp .`

*Run*: `docker run -p 9090:80 -d res/statichttp`



## Step 2: Dynamic HTTP server with express.js

> Dynamic dockerized http server based on `node:10.16` image. The application can be found in `src/`, it require chance & express `npm` modules. `npm install` is made when building the container as specified in the `Dockerfile`. Any files located in `src/` will be copied on container to `/opt/app/`.
>
> The actual application returns a random list of train with information on their destination, track, departure time and type.

*Build*: `docker build -t res/dynamichttp .`

*Run*: `docker run -p 3000:3000 -d res/dynamichttp`

