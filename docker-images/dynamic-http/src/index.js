var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = new express();

var ip = require("ip");

app.get('/', function(req, res) {
    res.send(greatfunction());
});

app.listen(3000, function() {
    console.log("Great App listenning on port 3000");
});

function greatfunction() {
    var nbTrain = chance.integer({
        min: 0,
        max: 10
    });

    var trains = [];
    var now = new Date(Date.now());

    for(var i = 0; i < nbTrain; ++i) {
        var track = chance.integer({
            min: 1,
            max: 7
        });
        var departure = chance.date({
            day: now.getDate(),
            month: now.getMonth(),
            year: now.getYear()
        });
        var type = chance.pickone(['IR', 'ICN', 'S', 'IC', '-']);
        var destination = chance.city();

        trains.push({
            track: track,
            type: type,
            departure: departure,
            destination: destination
        });
    }

    return {
        trains: trains,
        ip: ip.address()
    };
}