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
    
    var uniqueLocations = [];

    function latLonInUniqueLocations(lat,lon){
        for (var i=0; i<uniqueLocations.length; i++){
            var uniqueLocation = uniqueLocations[i];
            if ((lat === uniqueLocation.lat) && (lon === uniqueLocation.lon)){
                return uniqueLocation; 
            }; 
        };
        return false;
    };

    for (var i=0; i<selected_users.length; i++){
        var selected_user = selected_users[i];
        var loc = latLonInUniqueLocations(selected_user.lat, selected_user.lon);
        // loc is false if not in array 
        if(loc){
            uniqueLocation.users.push(selected_user);
            } else {
            var uniqueLocation = {
                lat : selected_user.lat,
                lon : selected_user.lon,
                users : [selected_user]
            };
            uniqueLocations.push(uniqueLocation);
        };
        console.log(uniqueLocations);
        console.log(uniqueLocations[0].users.length);
    };
        // if so, get that pin by unique identifier (title?) - and append to div
        // else drop a pin
        // for each latlon in dictionary /object, drop a pin

    for (var m=0; m<uniqueLocations.length; m++){
        var uniqueLocation = uniqueLocations[m];
        var otherPin = L.mapbox.featureLayer({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [
                  uniqueLocation.lat,
                  uniqueLocation.lon 
                ]
            },
            properties: {
                title: 'Other',
                'marker-symbol': 'pitch',
                'marker-size': 'large',
                'marker-color': '#FF0066'
            }
        });
        var usernames = [];
        for (var l=0; l<uniqueLocation.users.length; l++){
            var user = uniqueLocation.users[l];
            usernames.push(user.username);
        };
        console.log(usernames);
        var stringToAdd = '<div class="users">';
        for (var z=0; z<uniqueLocation.users.length; z++){
            var user = uniqueLocation.users[z];
            console.log('string to add initially ');
            console.log(stringToAdd);
            stringToAdd+='<p class="info">Username: '+user.username+'<br>'+' Hobby: '+user.hobby_name+'</p>';  
            stringToAdd+=generateButtonHtml(user.username,user.hobby_name,user.lat,user.lon,user.city);
            console.log('*******');
            console.log(stringToAdd);
        };
        stringToAdd+='</div>';
        console.log('stringToAdd in unique locations part of function ');
        console.log(stringToAdd);
        otherPin.bindPopup(stringToAdd).addTo(map);    
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

// Toggles buttons to show checkout-button when checked in and checkin-button
// when not checked in anywhere
function toggleButtons(){
    if (checkedin){
        $('.checkin-button').toggle(false);
        $('.checkout-button').toggle(true);
    }else{
        $('.checkin-button').toggle(true);
        $('.checkout-button').toggle(false);
    };
};

// Sends location info to server, checks user in, and returns info about checkIn object as reply
// Also calls addCheckOutListener function with check_in_id
function checkIn(location){
    $.get('/checkin', location, function(res){
        console.log('reply from checkIn function AJAX call: ');
        console.log(res.reply);
        var check_in_id = res.reply.check_in_id;
        addCheckoutListener(check_in_id);
    });
};

function generateButtonHtml(username, hobby, lat, lon, city){
    var string = '<button class="checkin-button" id="checkin-button-'+username+'" class="trigger" data-username="'+username+'" data-hobby="'+hobby+'" data-lat="'+lat+'" data-lon="'+lon+'" data-city="'+city+'">Check in & Collaborate</button> <button class="trigger checkout-button" style="display:none" id="checkout-button-'+username+'">Check out</button>';
    return string;
};

// ****************************************************************************
// If user is checked in anywhere, add pin to map

if (checkedin){
    
    // Set map view depending on lat/lon of checked in location 
    map.setView([checkedin[1],checkedin[0]],15);
    
    addCheckoutListener(checkedin[2]);
    $('.leaflet-control-mapbox-geocoder').hide();
    
    // Listen for click on check-in button
    $('#map').on('click', '#check_in_button', function() {
        $.get('/checkin', {lat:checkedin[0], lon:checkedin[1]}, function(res){
            console.log('hi');
            console.log(res);
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
    var stringToAdd = '<p>What are you working on?</p><input type="text" id="hobby" name="hobby">'+'<br>';
    console.log('hi');
    console.log(loc.lat);
    stringToAdd+=generateButtonHtml('username','none',loc.lat,loc.lon,city);
    myPin.bindPopup(stringToAdd);
    myPin.addTo(map);


    // Deactivate any current event listeners for check-in button in order to prevent
    // multiple event listeners from accumulating.
    $('#map').off( "click", ".checkin-button");

    // *********** Checkin button listener ************

    $('#map').on('click', '.checkin-button', function(){
        var button = $(this);
        var username = button.attr('data-username');
        var hobby = button.attr('data-hobby');
        var lat = button.attr('data-lat');
        var lon = button.attr('data-lon');
        var city = button.attr('data-city');
        console.log(username,hobby,lat,lon,city);

        var loc = {
        username : username,
        lat : lat,
        lon : lon,
        city : city,
        hobby : hobby
        };
        console.log(loc);

        // Get value from hobby input field
        if($(this).data-hobby==="None"){
            var hobby = document.getElementById("hobby").value;
            if (hobby==""){
                alert("Please enter a hobby");
            }else{
                loc['hobby'] = hobby;
                console.log(loc);  
            };
            console.log(hobby);
        };

        console.log(loc);
        // Call checkIn function with loc as parameter
        checkIn(loc);
        checkedin = true;
        $('.leaflet-control-mapbox-geocoder').hide();
        $('.leaflet-popup-close-button').hide();
        toggleButtons();

        checkedin = true;
        
        // Clear searched pin from map after collaborate/checkin
        myPin.clearLayers();
        $('.leaflet-control-mapbox-geocoder').hide();
        $('.leaflet-popup-close-button').hide();

        $('.checkin-button').hide();
        $('#checkout-button-'+username).show();
        $('.info').hide();
    });

    $.get('/get_nearby', {city : city}, function(res){
        nearby_users = res.reply;
        console.log(nearby_users);
        dropNearbyPins(latlon[0],latlon[1]);
    });
});

