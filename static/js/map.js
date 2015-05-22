// Variable and function definitions

L.mapbox.accessToken = 'pk.eyJ1IjoiZW5hamthbCIsImEiOiJIREZaeThRIn0.C31-vYXMj9y0TTujzEGNZQ';

var loc = {}; // don't need?
var nearby_users = [];
var latlon = [];
var markerLayer
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
    console.log('selected users are ', selected_users);
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
    }).bindPopup('<p>Username: '+selected_user.username+'<br>'+' Hobby: '+selected_user.hobby_name+'</p>'+'<button id="collaborate_button" class="trigger" value="' + [selected_user.hobby_name,selected_user.lat,selected_user.lon] + '">Check in & collaborate</button>').addTo(map);    
    };
};

// When user clicks the check-out button, show search bar again
// and hide pins, in addition to loggin check-out action in db.
function addCheckoutListener(new_id){
    // remove all listeners on button
    $('#map').off( "click", "#check_out_button");
    $('#map').on('click', '#check_out_button', function() {
        checkedin = false;
        $('.leaflet-control-mapbox-geocoder').show();
        $('.leaflet-marker-icon').hide();
        $('.leaflet-popup').hide();
        $.get('/checkout', {check_in_id : new_id});
        $('#check_in_button').toggle(true);
        $('#check_out_button').toggle(false);
    });
}

function toggleButtons(){
    if (checkedin){
        $('#check_in_button').toggle(false);
        $('#check_out_button').toggle(true);
    }else{
        $('#check_in_button').toggle(true);
        $('#check_out_button').toggle(false);
    };
};

// ****************************************************************************
// If user is checked in anywhere, add pin to map

if (checkedin){
    
    map.setView([checkedin[1],checkedin[0]],15);
    addCheckoutListener(checkedin[2]);
    $('.leaflet-control-mapbox-geocoder').hide();
    // Listen for click on check-in button
    $('#map').on('click', '#check_in_button', function() {
        $.get('/checkin', {lat:checkedin[0], lon:checkedin[1]}, function(res){
            check_in_id_num = res.reply.check_in_id;
            addCheckoutListener(check_in_id_num);
        });
        toggleButtons();
    });
    
    // Add a pin to the map if already checked in
    markerLayer = L.mapbox.featureLayer({
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
})
    markerLayer.bindPopup('<button id="check_in_button" class="trigger" style="display:none">Check in here</button>'+'<button id="check_out_button" class="trigger" id="check_out_button">Check out</button>')
    markerLayer.addTo(map);
};


geocoderControl.on('select', function(res) {
    // Clear all markers when re-selecting so users may not check in multiple times
    if (markerLayer){
        markerLayer.clearLayers()
    };
    latlon = res.feature.geometry.coordinates;
    console.log(latlon);
    var city = cityFromContext(res.feature.context);
    var loc = {
        lat : latlon[0],
        lon : latlon[1],
        city : city
    };
    $('#map').off( "click", "#check_in_button");
    $('#map').on('click', '#check_in_button', function() {
        var hobby = document.getElementById("hobby").value

        // Check to make sure user entered something in the text box
        // If empty string, alert user to enter something.
        if (hobby==""){
            alert("Please enter a hobby");
        }else{
            loc['hobby'] = hobby;
            console.log(loc);
            checkedin = true;
            $('.leaflet-control-mapbox-geocoder').hide();
            $('.leaflet-popup-close-button').hide();
            $.get('/checkin', loc, function(res){
                var check_in_id_num = res.reply.check_in_id;
                addCheckoutListener(check_in_id_num);
            });

            // change to toggleButtons()
            $('#check_in_button').toggle(false);
            $('#check_out_button').toggle(true);
        };

    });

    // Listener for #collaborate button
    // Need to get lat/lon data from other user's pinm
    $('#map').on('click', '#collaborate_button', function(){
        // ************ Need to unpack the string to access individual elements ***********
        var hobby = document.getElementById("collaborate_button").value
        console.log(hobby);
        console.log(typeof hobby);
        // loc['hobby'] = hobby;
        // console.log(loc);
        // checkedin = true;
        // $('.leaflet-control-mapbox-geocoder').hide();
        // $('.leaflet-popup-close-button').hide();
        // $.get('/checkin', loc, function(res){
        //     var check_in_id_num = res.reply.check_in_id;
        //     addCheckoutListener(check_in_id_num);
        // });

        //     // change to toggleButtons()
        // $('#check_in_button').toggle(false);
        // $('#check_out_button').toggle(true);
    });
    
    console.log(latlon);
    console.log(location);
    
    // Add a pin to the map where you searched
    markerLayer = L.mapbox.featureLayer({
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
});
    markerLayer.bindPopup('<p>What are you working on?</p><input type="text" id="hobby" name="hobby">'+'<br><button id="check_in_button" class="trigger">Check in here</button>'+'<button id="check_out_button" class="trigger" style="display:none" id="check_out_button">Check out</button>')
    markerLayer.addTo(map);

    $.get('/get_nearby', {city : city}, function(res){
        nearby_users = res.reply;
        console.log(nearby_users);
        dropNearbyPins(latlon[0],latlon[1]);
    });
    $('#map').on('click', '#collaborate_button', function() {
        // stuff
    });
});

