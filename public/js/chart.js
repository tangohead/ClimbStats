var width = 800;
var height = 400;
//top, right, bottom, left
var m = [20, 30, 50, 40],
    w = width - m[1] - m[3],
    h = height - m[0] - m[2];

function preprocess_data(elevation_profile)
{
	//We need to attach a sequence number to each elev point for now 
    //so we can plot it on the x axis
    var seq_elevation_profiles = Array();
    console.log(elevation_profile);
    for(var i = 0; i < elevation_profile.length; i++)
    {
        var temp_prof_point = {
            elevation_point: elevation_profile[i],
            sequence_no: i 
        };
        var start_index = -1, end_index = -1;
        var elev_points = new Array();
        if(i < 5)
        	start_index = 0;
        else if(i > (elevation_profile.length - 6))
	        	end_index = (elevation_profile.length - 1);
        else
        {
        	start_index = i - 5;
        	end_index = i + 5;
        }

        elev_points = elevation_profile.slice(start_index, end_index);

        //ASSIGN HERE!!
        seq_elevation_profiles.push(temp_prof_point);
    }
    return seq_elevation_profiles;
}

function calculate_grade(elev_points)
{
	var diffs = new Array();
	var avg = 0;

	//So here, we have longitude, latitude and elevation
	//From this, we need to calculate the gradient and return it
	for(var i=0; i< elev_points.length - 1; i++)
	{
		diffs.push(elev_points[i] - elev_points[i+1]);
	}

	for(var i=0; i < diffs.length; i++)
		avg += diffs[i];

	avg /= diffs.length;
	return avg;
}

function draw_elevation_profile(elevation_profile)
{
    //console.log(elevation_profile);

    //Attach sequence numbers, calculate gradient
    var seq_elevation_profiles = preprocess_data(elevation_profile);

    var svg = d3.select('#chart-canvas').append('svg')
                .attr('width', width)
                .attr('height', height);

    //console.log(seq_elevation_profiles);

    var elev_scale = d3.scale.linear()
                        .domain(d3.extent(elevation_profile.map(function (obj) { return obj['elevation'] } )))
                        .range([h+m[0], m[0]]),
        //Change the dist scale to work out from coords
        dist_scale = d3.scale.linear()
                        .domain([0, elevation_profile.length])
                        .range([m[3], w+m[3]]);

    var x_axis = d3.svg.axis()
                    .scale(dist_scale)
                    .tickSize(5)
                    .orient('bottom')
                    .tickSubdivide(true),
        y_axis = d3.svg.axis()
                    .scale(elev_scale)
                    .orient('left')
                    .tickSize(5)
                    .tickSubdivide(true);

    var elev_line = d3.svg.line()
                        .x(function(d){
                            return dist_scale(d.sequence_no);
                        })
                        .y(function(d){
                            return elev_scale(d.elevation_point['elevation']);
                        })
                        .interpolate('linear');

    var foreground = svg.append('svg:g')
                        .attr('class', 'foreground')
                        .append('svg:path')
                        .attr('d', elev_line(seq_elevation_profiles))
                        .attr('class', 'dataline');


    //Draw scales
    svg.append('svg:g')
        .attr('class', 'axis')
        .attr('id', 'x_axis')
        .attr('transform', 'translate(0, ' + (h+m[0]) + ')')
        .call(x_axis);
    svg.append('svg:g')
        .attr('class', 'axis')
        .attr('id', 'y_axis')
        .attr('transform', 'translate(' + m[3] + ',0)')
        .call(y_axis);


    function path(d){
        return d3.svg.line(
            seq_elevation_profiles.map(function(seq_elev_point) 
            {   
                console.log(seq_elev_point);
                return [dist_scale(seq_elev_point.sequence_no), elev_scale(seq_elev_point.elevation_point['elevation'])]; 

            }));
    }

}