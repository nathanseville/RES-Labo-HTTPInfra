const ip = require("ip");
const dgram = require('dgram');
const Docker = require('dockerode');

const docker = new Docker({socketPath: '/var/run/docker.sock'});

const MAX_TIMEOUT = 2500;

const STATIC_PORT = 27999; // Port used by apache2 hearhbeat
const DYNAMIC_PORT = 27998; // Port user by custom node heartbeat
const MCAST_ADDR = "239.0.0.1";
const HOST = ip.address();


module.exports = class ClusterManager {

    constructor() {
        this.changed = false;
        this.proxy = docker.getContainer('proxy');

        this.static = new Map();
        this.dynamic = new Map();

        this.handleHeartbeat(this.static, STATIC_PORT);
        this.handleHeartbeat(this.dynamic, DYNAMIC_PORT);

        const self = this;

        setInterval(function(){
            self.changed |= self.clearMap(self.static);

            self.changed |= self.clearMap(self.dynamic);

            // Only update server if a server died or has been added
            if(self.changed){
                self.updateServer();
                self.changed = false;
            }
        }, MAX_TIMEOUT);
    }


    // Heartbeat is a UDP broadcast every second.
    handleHeartbeat(map, port) {
        const s = dgram.createSocket('udp4');
        s.bind(port, function () {
            console.log("Joining multicast group");
            s.addMembership(MCAST_ADDR);
        });

        const self = this;

        s.on('message', function (msg, source) {
            const mapLen = map.size;

            map.set(source.address, Date.now());

            self.changed |= map.size !== mapLen;
        });
    }

    // Remove dead servers.
    clearMap(map) {
        const mapLen = map.size;

        map.forEach((value, key, map) => {
            if (Date.now() - value > MAX_TIMEOUT) {
                map.delete(key);
            }
        });

        // has changed
        return map.size !== mapLen;
    }

    // Execute a script on the proxy to update alive servers
    async updateServer() {

        console.log("Updating server");
        console.log(this.mergeIps(this.dynamic, 3000));
        console.log(this.mergeIps(this.static, 3000));

        // Update apache2 config with ips
        const options = {
            Cmd: [
                '/bin/bash',
                '/usr/local/bin/apache2-config',
                this.mergeIps(this.dynamic, 3000),
                this.mergeIps(this.static, 80)
            ],
            AttachStdout: true,
            AttachStderr: true,
        };

        const exec = await this.proxy.exec(options);

        // Run script
        exec.start();
    }

    // Merge all ips in map as a csv
    mergeIps(map, port) {
        let out = "";
        map.forEach((value, key, map) => {
            out += key + ":" + port + ",";
        });

        return out.substring(0, out.length - 1);
    }
}

