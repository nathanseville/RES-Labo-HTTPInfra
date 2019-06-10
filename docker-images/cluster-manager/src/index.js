var ip = require("ip");
var dgram = require('dgram');
var Docker = require('dockerode');

var docker = new Docker({socketPath: '/var/run/docker.sock'});

const MAX_TIMEOUT = 2500;

const STATIC_PORT = 27999; // Port used by apache2 hearhbeat
const DYNAMIC_PORT = 27998; // Port user by custom node heartbeat
const MCAST_ADDR = "239.0.0.1";
var HOST = ip.address();

var static = new Map();
var dynamic = new Map();

var changed = false;

// Find server to manage
const proxy = docker.getContainer('proxy');


handleHeartbeat(static, STATIC_PORT);
handleHeartbeat(dynamic, DYNAMIC_PORT);

// Heartbeat is a UDP broadcast every second.
function handleHeartbeat(map, port){
    const s = dgram.createSocket('udp4');
    s.bind(port, function () {
        console.log("Joining multicast group");
        s.addMembership(MCAST_ADDR);
    });
    
    s.on('message', function (msg, source) {
        const mapLen = map.size;

        map.set(source.address, Date.now());
    
        changed |= map.size !== mapLen;
    });
}

// Loop to find dead server and update proxy config is needed 
setInterval(function(){
    changed |= clearMap(static);

    changed |= clearMap(dynamic);

    // Only update server if a server died or has been added
    if(changed){
        updateServer();
        changed = false;
    }
}, MAX_TIMEOUT);

// Remove dead servers.
function clearMap(map){
    const mapLen = map.size;

    map.forEach((value, key, map) => {
        if(Date.now() - value > MAX_TIMEOUT){
            map.delete(key);
        }
    });

    // has changed
    return map.size !== mapLen;
}

// Execute a script on the proxy to update alive servers
async function updateServer(){
    proxy.inspect(async function (err, data) {
        console.log(data.NetworkSettings.IPAddress);

        // Update apache2 config with ips
        var options = {
            Cmd: [ '/bin/bash', '/usr/local/bin/apache2-config', mergeIps(dynamic, 3000), mergeIps(static, 80)],
            AttachStdout: true,
            AttachStderr: true,
        };

        var exec = await proxy.exec(options);

        // Run script
        exec.start();
    });
}

// Merge all ips in map as a csv
function mergeIps(map, port){
    var out = "";
    map.forEach((value, key, map) => {
        out += key + ":"+port+",";
    });

    return out.substring(0, out.length - 1);
}