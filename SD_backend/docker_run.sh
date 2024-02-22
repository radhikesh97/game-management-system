#!/bin/bash
docker rm -f sd
docker rmi sd:v1
docker build -t sd:v1 .
docker run -d -p 8000:8000 --network vnet --ip 172.18.0.10 --name sd sd:v1
