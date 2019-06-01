$(function() {
    function loadTrains() {
        $.getJSON("/api/trains/", function(trains) {
            console.log(trains);

            var message = "No trains here";
            if(trains.length > 0) {
                message = trains[0].type + " for " + trains[0].destination + " on track " + trains[0].track;
            }

            $(".trains").text(message);
        });
    };

    setInterval(loadTrains, 2000);
});