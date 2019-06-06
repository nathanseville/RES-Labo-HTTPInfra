$(function() {
    function loadTrains() {
        $.getJSON("/api/trains/", function(data) {
            trains = data.trains;
            
            console.log("Served by ", data.ip)
            console.log(trains);

            var message = "No trains here";
            if(trains.length > 0) {
                message = trains[0].type + " for " + trains[0].destination + " on track " + trains[0].track;
            }

            $(".trains").text(message);
            $(".ip").text(data.ip);
        });
    };

    setInterval(loadTrains, 2000);
});