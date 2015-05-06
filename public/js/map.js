var dir_disp = null;
var markers = null;
$(document).ready(function(){
	function initialize() {
        var mapOptions = {
          center: { lat: 53.54, lng: -2.63},
          zoom: 8
        };
        dir_disp = new google.maps.DirectionsRenderer();

        var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

        markers = new Array();

        dir_disp.setMap(map);

        //Listen to the map click events and add markers
        google.maps.event.addListener(map, 'click', function(mouse_pos){
        	create_marker(map, mouse_pos.latLng);
        	console.log(markers);
        });

    };

    google.maps.event.addDomListener(window, 'load', initialize);
});


function create_marker(map, latLng){
    console.log("marker created");
	var marker = new google.maps.Marker({
    		position: latLng,
    		map:map,
    	});
	google.maps.event.addListener(marker, 'click', function(){
		marker.setMap(null);
		console.log(marker);
 	})
	markers.push(marker);

    if(markers.length > 1)
    {
    	var dir_srv = new google.maps.DirectionsService();
        console.log("Markers currently set");
        console.log(markers);

    	//Create request
        console.log(markers[0].getPosition());
    	dir_req = {
    		origin : markers[0].getPosition(),
    		destination : markers[markers.length - 1].getPosition(),
    		travelMode : google.maps.TravelMode.BICYCLING,
    		unitSystem : google.maps.UnitSystem.Metric,
   		};

        //If we've got waypoints, then we need to put the waypoints in
        if(markers.length > 2)
        {
            console.log("Calculating waypoints");
            var waypoints = new Array();

            for(var i=1; i < markers.length-1; i++)
            {
                console.log(markers[i].getPosition());
                waypoints.push(new google.maps.DirectionsWaypoint({
                    location: markers[i].getPosition(),
                    stopover: false
                })
                );
            }
            console.log(waypoints);
            dir_req.waypoints = waypoints;
        }

   		dir_srv.route(dir_req, function(result, status){
   			if(status == google.maps.DirectionsStatus.OK){
   				console.log(result);
   				dir_disp.setDirections(result);
   			}
   		});
    }
}