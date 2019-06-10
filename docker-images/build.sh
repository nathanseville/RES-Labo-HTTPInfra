#! /bin/bash
docker build -t res/statichttp ./static-http
docker build -t res/dynamichttp ./dynamic-http
docker build -t res/rp ./reverse-proxy
docker build -t res/rpmanager ./cluster-manager

