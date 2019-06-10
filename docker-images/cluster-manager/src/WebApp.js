const express = require('express');
const Docker = require('dockerode');
const uuidv1 = require('uuid/v1');


const docker = new Docker({socketPath: '/var/run/docker.sock'});



module.exports = class WebApp{
    constructor(){
        this.app = new express();

        this.app.get('/', function(req, res) {
            res.sendFile(__dirname + '/public/index.html');
        });

        this.app.get('/stop/:containerId', async function(req, res) {
            let container = docker.getContainer(req.params.containerId);
            await container.stop();
            await container.remove();
            res.send({deleted:req.params.containerId});
        });

        this.app.get('/add/dynamic', function(req, res) {
            const id = uuidv1();

            //docker run -d --name dynamic-$i -e NAME=dynamic-$i res/dynamichttp
            docker.createContainer({
                Image: "res/dynamichttp",
                name: `dynamic-${id}`,
                Env:[`NAME=dynamic-${id}`]
            }, (err, container) => {
                console.log(err);
                container.start(() => res.send({created: `static-${id}`}))
            });
        });

        this.app.get('/add/static', function(req, res) {
            const id = uuidv1();
            //docker run -d --name static-$i -e NAME=static-$i res/statichttp
            docker.createContainer({
                Image: "res/statichttp",
                name: `static-${id}`,
                Env:[`NAME=static-${id}`]
            }, (err, container) => {
                console.log(err);
                container.start(() => res.send({created: `static-${id}`}))
            });
        });

        this.app.get('/containers', async function(req, res) {
            const containers = await docker.listContainers();

            const data = {
                other:[],
                static:[],
                dynamic:[]
            };

            containers.forEach((elem, index, array) => {
                let addTo = data.other;
                if(elem.Names[0].includes("static")){
                    addTo = data.static;
                } else if(elem.Names[0].includes("dynamic")){
                    addTo = data.dynamic;
                }

                addTo.push({
                    id:elem.Id,
                    ip:elem.NetworkSettings.Networks.bridge.IPAddress,
                    name:elem.Names[0]
                })
            });

            res.send(data);
        });

        this.app.use(express.static(__dirname + '/public'));

        this.app.listen(1234, function() {
            console.log("Great App listenning on port 1234");
        });
    }
};