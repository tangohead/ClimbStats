var dir_disp = null;
var markers = null;
var elev_srv = null;
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
	var marker = new google.maps.Marker({
    		position: latLng,
    		map:map,
    	});
	google.maps.event.addListener(marker, 'click', function(){
		marker.setMap(null);
		console.log(marker);
 	})
	markers.push(marker);
    calculate_route(markers);
}

function calculate_route(markers)
{
    if(markers.length > 1)
    {
        var dir_srv = new google.maps.DirectionsService();

        //Create request
        dir_req = {
            origin : markers[0].getPosition(),
            destination : markers[markers.length - 1].getPosition(),
            travelMode : google.maps.TravelMode.BICYCLING,
            unitSystem : google.maps.UnitSystem.Metric,
        };

        //If we've got waypoints, then we need to put the waypoints in
        if(markers.length > 2)
        {
            var waypoints = new Array();

            for(var i=1; i < markers.length-1; i++)
            {
                waypoints.push({
                    location: markers[i].getPosition(),
                    stopover: false
                });
            }
            dir_req.waypoints = waypoints;
        }

        dir_srv.route(dir_req, function(result, status){
            switch(status)
            {
            case google.maps.DirectionsStatus.OK:
                dir_disp.setDirections(result);
                retrieve_elevation(result.routes[0].overview_path);
                break;
             case google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED:
                console.error("Too many waypoints specified for directions");
                break;
            case google.maps.DirectionsStatus.NOT_FOUND:
                console.error("One of the origin, destination or waypoints could not be found");
                break;
            case google.maps.DirectionsStatus.ZERO_RESULTS:
                console.error("No route could be found between origin and destination");
                break;
            case google.maps.DirectionsStatus.INVALID_REQUEST:
                console.error("Invalid request to Directions Service");
                break;
            case google.maps.DirectionsStatus.REQUEST_DENIED:
                console.error("Request denied to Directions Service");
                break;
            case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
                console.error("Too many requests to Directions Service");
                break;
            case google.maps.DirectionsStatus.UNKNOWN_ERROR:
                console.error("Unknown error from Directions Service");
                break;
            default:
                console.error("Internal error on directions");
                break;
            }

        });
    }
}

function retrieve_elevation(path)
{
    elev_srv = new google.maps.ElevationService();
    elev_srv.getElevationAlongPath({
        path: path,
        samples: path.length
    }, function(results, status){
        switch(status)
        {
        case google.maps.ElevationStatus.OK:
            draw_elevation_profile(results);
            break;
        case google.maps.ElevationStatus.INVALID_REQUEST:
            console.error("Invalid request to Elevation Service");
            break;
        case google.maps.ElevationStatus.REQUEST_DENIED:
            console.error("Request denied to Elevation Service");
            break;
        case google.maps.ElevationStatus.OVER_QUERY_LIMIT:
            console.error("Too many requests to Elevation Service");
            break;
        case google.maps.ElevationStatus.UNKNOWN_ERROR:
            console.error("Unknown error from Elevation Service");
            break;
        default:
            console.error("Internal error on elevation");
            break;
        }
    });
}

