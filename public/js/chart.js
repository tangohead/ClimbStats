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

    seq_elev_profiles = calculate_grade(seq_elevation_profiles);
    console.log(seq_elevation_profiles);
    smooth_grade_groups(seq_elevation_profiles, 20);
    return seq_elevation_profiles;
}

function smooth_grade_groups(elev_points, group_size)
{
    for(var i = 0; i < elev_points.length - group_size; i=i+group_size)
    {
        console.log(i);
        var group_avg_grade = calculate_avg_grade(elev_points.slice(i, i+group_size));
        for(var j = 0; j < group_size; j++)
        {
            console.log(i + j);
            elev_points[i+j].adj_grade = group_avg_grade;
        }
    }
    //Check if we have leftover elements
    if((elev_points.length) % group_size != 0)
    {
        //If so, figure out where we left off and fill the rest in
        var start_index = Math.floor(elev_points.length / group_size);
        var group_avg_grade = calculate_avg_grade(elev_points.slice(start_index, elev_points.length));
        for(var i = start_index; i < elev_points.length; i++)
        {
            elev_points[i].adj_grade = group_avg_grade;
        }
    }
    console.log(elev_points);
}

function smooth_grade_similarity(elev_points, granularity)
{
    //TODO: Smooth gradient based on similarity
    //TODO: Allow user to select granularity of similarity

    
}

/**
 * Calculates the point-to-point gradient of the points
 * @param {array} List of elevation points
 * @return List of elevation points each with a gradient field
 */
function calculate_grade(elev_points)
{
	var avg = 0;

	//So here, we have longitude, latitude and elevation
	//From this, we need to calculate the gradient and return it
	for(var i=0; i< elev_points.length - 1; i++)
	{
        //get the diff between the two elevation points
		elev_points[i].grade = elev_points[i+1].elevation_point
            .elevation - elev_points[i].elevation_point
        .elevation;
	}
    //Bit of a hack, set the final grade to be the grade of the prev point
    elev_points[elev_points.length-1].grade = elev_points[elev_points.length-2].grade;
    return elev_points;
}


/**
 * Calculates the average gradient over a series of points
 * @param {array} List of elevation points
 * @return Average gradient
 */
function calculate_avg_grade(elev_points)
{
    //Check if gradient calc has already been run on them
    if(!'grade' in elev_points[0])
        elev_points = calculate_grade(elev_points);

    var avg = 0;
    //Average them out
	for(var i=0; i < elev_points.length; i++)
		avg += elev_points[i].grade;

	avg /= elev_points.length;
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