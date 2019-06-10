const ip = require("ip");
const Docker = require('dockerode');
const Heartbeat = require('./heartbeat.js');

const docker = new Docker({socketPath: '/var/run/docker.sock'});

const heartbeat = new Heartbeat();
