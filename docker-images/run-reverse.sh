#! /bin/bash


docker kill $(docker ps -q) > /dev/null
docker rm $(docker ps -a -q)  > /dev/null

staticName=$(docker run -d res/statichttp)
dynamicName=$(docker run -d res/dynamichttp)

staticIP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $staticName)
dynamicIP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $dynamicName)


proxyName=$(docker run -d --name proxy -e DYNAMIC_APP=$dynamicIP:3000 -e STATIC_APP=$staticIP:80 -p 8080:80 res/rp)

proxyIP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $proxyName)

echo "Infra UP"
echo "Reverse proxy IP: $proxyIP"


