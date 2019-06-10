#! /bin/bash

./build.sh

docker kill $(docker ps -q) > /dev/null
docker rm $(docker ps -a -q)  > /dev/null

staticPort=80
dynamicPort=3000

dynamicHosts=""
staticHosts=""


proxyName=$(docker run -d --name proxy -p 8080:80 res/rp)
proxyIP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $proxyName)

managerName=$(docker run -i --name proxy-manager -v /var/run/docker.sock:/var/run/docker.sock -p 1234:1234  res/rpmanager )
managerIP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $managerName)


echo "Infra UP"
echo "Reverse proxy IP: $proxyIP"
echo "Manager IP: $managerIP"


