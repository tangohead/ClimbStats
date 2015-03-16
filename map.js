$(document).ready(function(){
	function initialize() {
        var mapOptions = {
          center: { lat: 53.54, lng: -2.63},
          zoom: 8
        };
        var dir_disp = new google.maps.DirectionsRenderer();

        var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

        var markers = new Array();

        dir_disp.setMap(map);

        //Listen to the map click events and add markers
        google.maps.event.addListener(map, 'click', function(mouse_pos){
        	create_marker(map, dir_disp, mouse_pos.latLng, markers);
        	console.log(markers);
        });

    };

    google.maps.event.addDomListener(window, 'load', initialize);
});


function create_marker(map, dir_disp, latLng, markers){
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

    	//Create request
    	dir_req = {
    		origin : markers[0].getPosition(),
    		destination : markers[1].getPosition(),
    		travelMode : google.maps.TravelMode.BICYCLING,
    		unitSystem : google.maps.UnitSystem.Metric,
   		};

   		dir_srv.route(dir_req, function(result, status){
   			if(status == google.maps.DirectionsStatus.OK){
   				console.log(result);
   				dir_disp.setDirections(result);
   			}
   		});
    }
}