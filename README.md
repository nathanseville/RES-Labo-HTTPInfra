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



## Step 3: Reverse proxy with apache (static configuration)

> Dockerized apache reverse proxy with static configuration based on `php:5.6-apache` image. Sites configuration can be found in `conf/`. Any files located in `conf/` will be copied on container to `/etc/apache2`. There is two sites configured on the reverse proxy, the default one does nothing. The second one will transmit `/api/trains/` requests to the `dynamic http server`, all others to the `static http sever`.
>
> The static configuration of the reverse proxy is: 
>
> - `172.17.0.2` for the static http
> - `172.17.0.3` for the dynamic http



Before running the reverse proxy, start the `static` and `dynamic` http server.

```bash
docker run -d res/statichttp
docker run -d res/dynamichttp
```



*Build*: `docker build -t res/rp .`

*Run*: `docker run -p 8080:80 res/rp`



## Step 4: AJAX requests with JQuery

> We have now ajax request on our website, request are made from our brand new script `train.js`. Each 2 seconds a new train is displayed on front-page. Trains array are logged in console, reverse proxy is necessary as the dynamic server isn't located on the same server of the website and browser block script request going to a different domain from the one it comes for security reason *(same origin policy)*.

