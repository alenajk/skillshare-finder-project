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
        var otherPin = L.mapbox.featureLayer({
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
    });
        otherPin.bindPopup('<p>Username: '+selected_user.username+'<br>'+' Hobby: '+selected_user.hobby_name+'</p>'+'<button id="collaborate_button" class="trigger" value="' + [selected_user.hobby_name,selected_user.lat,selected_user.lon,selected_user.city] + '">Check in & collaborate</button> <button id="check_out_button" class="trigger" style="display:none" id="check_out_button">Check out</button>').addTo(map);    
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

function checkIn(location){
    $.get('/checkin', location, function(res){
        var check_in_id = res.reply.check_in_id;
        addCheckoutListener(check_in_id);
    });
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
    var myPin = L.mapbox.featureLayer({
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
    myPin.bindPopup('<button id="check_in_button" class="trigger" style="display:none">Check in here</button>'+'<button id="check_out_button" class="trigger" id="check_out_button">Check out</button>')
    myPin.addTo(map);
};


geocoderControl.on('select', function(res) {
    // Clear all markers when re-selecting so users may not check in multiple times
    if (myPin){
        myPin.clearLayers()
    };
    
    latlon = res.feature.geometry.coordinates;
    console.log(latlon);
    var city = cityFromContext(res.feature.context);
    var loc = {
        lat : latlon[0],
        lon : latlon[1],
        city : city
    };
    // Deactivate any current event listeners for check-in button in order to prevent
    // multiple event listeners from accumulating.
    $('#map').off( "click", "#check_in_button");
    
    $('#map').on('click', '#check_in_button', function() {
        
        // Add user's hobby input to loc array
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

            // Call checkIn function with loc as parameter
            checkIn(loc);
            // change to toggleButtons()
            $('#check_in_button').toggle(false);
            $('#check_out_button').toggle(true);
        };

    });
    
    console.log(latlon);
    console.log(location);
    
    // Add a pin to the map where you searched
    var myPin = L.mapbox.featureLayer({
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
    myPin.bindPopup('<p>What are you working on?</p><input type="text" id="hobby" name="hobby">'+'<br><button id="check_in_button" class="trigger">Check in here</button>'+'<button id="check_out_button" class="trigger" style="display:none" id="check_out_button">Check out</button>')
    myPin.addTo(map);

    // *********** Collaborate button listener ************

    $('#map').on('click', '#collaborate_button', function(){
        var pinData = document.getElementById("collaborate_button").value
        pinData = pinData.split(",");
        console.log(pinData);
        hobby = pinData[0];
        lat = pinData[1];
        lon = pinData[2];
        city = pinData[3];
        console.log(hobby,lat,lon,city);

        // Defining loc to be specific to other user's pin info
        var loc = {
        lat : lat,
        lon : lon,
        city : city,
        hobby : hobby
        };

        console.log(loc);
        checkIn(loc);

        checkedin = true;
        
        // Clear searched pin from map after collaborate/checkin
        myPin.clearLayers();
        $('.leaflet-control-mapbox-geocoder').hide();
        $('.leaflet-popup-close-button').hide();

        $('#collaborate_button').toggle(false);
        $('#check_out_button').toggle(true);
    });

    $.get('/get_nearby', {city : city}, function(res){
        nearby_users = res.reply;
        console.log(nearby_users);
        dropNearbyPins(latlon[0],latlon[1]);
    });
});

