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



## Step 5: Dynamic reverse proxy configuration

> Our dockerized apache reverse proxy takes now the static and dynamic app ip address from the environements variables, respectively `STATIC_APP` and `DYNAMIC_APP`. Those environements variables can be pass as argument when running the container with docker with the `-e` option. The `.conf` is built with a template `php` file before runing apache, the `apache2-foreground` script has been modified for this purposes (the line before `exec apache2 -DFOREGROUND "$@"`).



Before running the reverse proxy, start the `static` and `dynamic` http server.

```bash
docker run -d res/statichttp
docker run -d res/dynamichttp
```



*Build*: `docker build -t res/rp .`

*Run*: `docker run -d -e DYNAMIC_APP=<ip>:3000 -e STATIC_APP=<ip>:80 -p 8080:80 res/rp`

> Replace the `<ip>` fields by the ip address of the correcponding container (dynamic or static).



To reach the reverse proxy edit your `/etc/hosts` and add an entry as following:

```
<docker network ip>				lab.demo.res
```

You can know reach your infrastructure in any browser at `lab.demo.res`.



## Load balancing: multiple server nodes

> Our dockerized apache reverse proxy can now take multiple static and dynamic ip separated by a `,` in the docker `-e` argument. The requests will be reparted between the servers by the load balancer, there is a cluster for the static app and one for the dynamic one.



*Build*: `docker build -t res/rp .`

*Run*: `docker run -d -e DYNAMIC_APP=<ip>:3000 -e STATIC_APP=<ip>:80 -p 8080:80 res/rp`

> Replace the `<ip>` fields by the ip address of the correcponding container (dynamic or static).
>
> Multiple `<ip>:port` can be set for `DYNAMIC_APP` either `STATIC_APP` by seperating the field by a `,`.
>
> e.g. `-e DYNAMIC_APP=<ip>:3000,<ip>:3000,<ip>:3000`



The script `run-reverse.sh` starts 5 static, 5 dynamic servers and configure proxy/loadbalancer to use those servers.

For validation purposes, the server name wich has served the website or the one who has served the actual dynamic data is written on the website.


## Load balancing: round-robin vs sticky sessions

> Our loadbalencer can now stick a session to a specific server. On the first request the reverse proxy asign a server to the user. The server is stored in a cookie.

### Proof

To prove that the sticky sessions are working, we displayed the serving server on the webpage. We can see that the serving server isn't changing reloads upon reloads. 

The ip and name of the dynamic server is also displayed after each ajax request alowing us to see the server name and ip changing between requests.   

### Config

The sticky sessions require two more apache modules `lbmethod_byrequests` and `headers`. They have been added in the Docker file.

We modified the apache config adding configuration for sticky sessions.
The following line add a cookie, is used to attach a server to a session:
```
Header add Set-Cookie "ROUTEID=.%{BALANCER_WORKER_ROUTE}e; path=/" env=BALANCER_ROUTE_CHANGED
```

Each balancer member must be named to match the session with it. The property `route` of `BalancerMember` allow us to name the server:
```
BalancerMember 'http://<?= $static ?>' route=static-<?= $i ?>
```

The `ProxPass` configuration for static has been modified to add the cookie name used to store the server name. In our case the name is **ROUTEID**
```
ProxyPass '/' 'balancer://static-cluster/' stickysession=ROUTEID
```

