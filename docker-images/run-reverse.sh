#! /bin/bash


docker kill $(docker ps -q) > /dev/null
docker rm $(docker ps -a -q)  > /dev/null

staticPort=80
dynamicPort=3000

dynamicHosts=""
staticHosts=""

for i in {0..5}
do
    dynamicName=$(docker run -d --name dynamic-$i -e NAME=dynamic-$i res/dynamichttp)
    dynamicIP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $dynamicName)
    dynamicHosts+="$dynamicIP:$dynamicPort,"
done

for i in {0..4}
do
    staticName=$(docker run -d --name static-$i -e NAME=static-$i res/statichttp)
    staticIP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $staticName)
    staticHosts+="$staticIP:$staticPort,"
done


proxyName=$(docker run -d --name proxy -p 8080:80 res/rp)

proxyIP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $proxyName)

docker run -d --name proxy-manager -v /var/run/docker.sock:/var/run/docker.sock res/rpmanager


echo "Infra UP"
echo "Reverse proxy IP: $proxyIP"


