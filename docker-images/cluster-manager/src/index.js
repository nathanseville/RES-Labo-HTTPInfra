const ip = require("ip");
const Docker = require('dockerode');
const Heartbeat = require('./ClusterManager.js');
const WebApp = require('./WebApp');


const docker = new Docker({socketPath: '/var/run/docker.sock'});

const heartbeat = new Heartbeat();
const webApp = new WebApp();
