var loc = {};

function cityFromContext(context) {
    for(var i = 0; i < context.length; i++) {
        var dictionary = context[i] 
        console.log(dictionary)
        console.log(dictionary.id)
        if (dictionary.id.indexOf('place') >= 0 ){
            return dictionary.text;
        }
    }
    return null
};

L.mapbox.accessToken = 'pk.eyJ1IjoiZW5hamthbCIsImEiOiJIREZaeThRIn0.C31-vYXMj9y0TTujzEGNZQ';

var output = document.getElementById('output');
var map = L.mapbox.map('map', 'mapbox.streets');
var geocoderControl = L.mapbox.geocoderControl('mapbox.places');
geocoderControl.addTo(map);
geocoderControl.on('select', function(res) {
    console.log(res);
    var latlon = res.feature.geometry.coordinates;
    console.log(res.feature.context)
    var city = cityFromContext(res.feature.context);
    console.log(city)
    var loc = {
    	lat : latlon[0],
    	lon : latlon[1],
        city : city
    };
    $('#map').on('click', '#check_in_button', function() {
        $.get('/checkin', loc, function(res){
            check_in_id_num = res.reply.check_in_id;
            data = {
                check_in_id : check_in_id_num
            };
        });
        $('#check_in_button').toggle(false);
        $('#check_out_button').toggle(true);
    });
    $('#map').on('click', '#check_out_button', function() {
        $.get('/checkout', data);
        console.log('hi');
        console.log(data)
        $('#check_in_button').toggle(true);
        $('#check_out_button').toggle(false);
    });
    console.log(latlon);
    console.log(location);
    // Add a pin to the map
    L.mapbox.featureLayer({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [
          latlon[0],
          latlon[1] 
        ]
    },
    properties: {
        title: 'You',
        description: 'Latitude: ' + latlon[0] + 'Longitude: ' + latlon[1],
        'marker-size': 'large',
        'marker-color': '#2EB8B8',
    }
}).bindPopup('<button id="check_in_button" class="trigger">Check in here</button>'+'<button id="check_out_button" class="trigger" style="display:none" id="check_out_button">Check out</button>')
    .addTo(map);
});
