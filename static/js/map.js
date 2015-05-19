// Variable and function definitions

L.mapbox.accessToken = 'pk.eyJ1IjoiZW5hamthbCIsImEiOiJIREZaeThRIn0.C31-vYXMj9y0TTujzEGNZQ';

var loc = {};
var nearby_users = [];
var latlon = [];
console.log(checkedin);
var output = document.getElementById('output');
var map = L.mapbox.map('map', 'mapbox.streets');
var geocoderControl = L.mapbox.geocoderControl('mapbox.places');
geocoderControl.addTo(map);

function cityFromContext(context) {
    for(var i = 0; i < context.length; i++) {
        var dictionary = context[i];
        if (dictionary.id.indexOf('place') >= 0 ){
            return dictionary.text;
        };
    };
    return null
};

function haversine(lat1, lon1, lat2, lon2){
    console.log(lat1, lon1, lat2, lon2);
    var r = 6372.8 // Earth radius in km
    var dlat = (lat2-lat1)*Math.PI/180;
    var dlon = (lon2-lon1)*Math.PI/180;
    var a = Math.sin(dlat/2) * Math.sin(dlat/2) +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
            Math.sin(dlon/2) * Math.sin(dlon/2);
    var c = 2 * Math.asin(Math.sqrt(a));
    var d = r * c;
    console.log(d);
    return d
};

function dropNearbyPins(lat, lon) {
    selected_users = [];
    for (var i=0; i<nearby_users.length; i++){
        var nearby_user = nearby_users[i];
        var dist = haversine(latlon[0],latlon[1],nearby_user.lat, nearby_user.lon);
        console.log(nearby_user,dist);
        if (dist<1){
            selected_users.push(nearby_user);
        };
    };
    console.log(selected_users);
    for (var i=0; i<selected_users.length; i++){
        var selected_user = selected_users[i];
        L.mapbox.featureLayer({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [
              selected_user.lat,
              selected_user.lon 
            ]
        },
        properties: {
            title: 'Other',
            'marker-symbol': 'pitch',
            'marker-size': 'large',
            'marker-color': '#FF0066'
        }
    }).bindPopup('<p>User_id: '+selected_user.user_id+'</p>').addTo(map);    
    };
};

function addCheckoutListener(new_id){
    $('#map').on('click', '#check_out_button', function() {
        $.get('/checkout', {check_in_id : new_id});
        $('#check_in_button').toggle(true);
        $('#check_out_button').toggle(false);
        // remove marker instead of toggling buttons?
        // show search bar
    });
}

// ****************************************************************************
// If user is checked in anywhere, add pin to map

if (checkedin){
    map.setView([checkedin[1],checkedin[0]],15);
    addCheckoutListener(checkedin[2]);
    // remove geocodeController - search option
    // Listen for click on check-in button
    $('#map').on('click', '#check_in_button', function() {
        $.get('/checkin', loc, function(res){
            var check_in_id_num = res.reply.check_in_id;
            addCheckoutListener(check_in_id_num);
        });
        $('#check_in_button').toggle(false);
        $('#check_out_button').toggle(true);
    });
    
    // Add a pin to the map
    L.mapbox.featureLayer({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [
          checkedin[0],
          checkedin[1] 
        ]
    },
    properties: {
        title: 'You',
        description: 'Latitude: ' + checkedin[0] + 'Longitude: ' + checkedin[1],
        'marker-symbol': 'star-stroked',
        'marker-size': 'large',
        'marker-color': '#2EB8B8',
    }
}).bindPopup('<button id="check_in_button" class="trigger" style="display:none">Check in here</button>'+'<button id="check_out_button" class="trigger" id="check_out_button">Check out</button>')
    .addTo(map);
};

geocoderControl.on('select', function(res) {
    latlon = res.feature.geometry.coordinates;
    console.log(latlon);
    var city = cityFromContext(res.feature.context);
    var loc = {
        lat : latlon[0],
        lon : latlon[1],
        city : city
    };
    $('#map').on('click', '#check_in_button', function() {
        $.get('/checkin', loc, function(res){
            var check_in_id_num = res.reply.check_in_id;
            addCheckoutListener(check_in_id_num);
        });
        $('#check_in_button').toggle(false);
        $('#check_out_button').toggle(true);
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
        'marker-symbol': 'star-stroked',
        'marker-size': 'large',
        'marker-color': '#2EB8B8',
    }
}).bindPopup('<button id="check_in_button" class="trigger">Check in here</button>'+'<button id="check_out_button" class="trigger" style="display:none" id="check_out_button">Check out</button>')
    .addTo(map);
    $.get('/get_nearby', {city : city}, function(res){
        console.log(res.reply);
        nearby_users = res.reply;
        dropNearbyPins(latlon[0],latlon[1]);
    });
});
