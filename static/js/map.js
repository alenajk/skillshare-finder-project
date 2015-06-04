// Variable and function definitions

L.mapbox.accessToken = 'pk.eyJ1IjoiZW5hamthbCIsImEiOiJIREZaeThRIn0.C31-vYXMj9y0TTujzEGNZQ';

console.log(checkedin);
if(fav_hobbies){
    console.log(fav_hobbies)
};
var map = L.mapbox.map('map', 'mapbox.streets');
var geocoderControl = L.mapbox.geocoderControl('mapbox.places');
geocoderControl.addTo(map);
var otherPin;
var myPin;
var locFromId = {};
var loc = {};
var otherPins = map.featureLayer;

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
    var r = 6372.8 // Earth radius in km
    var dlat = (lat2-lat1)*Math.PI/180;
    var dlon = (lon2-lon1)*Math.PI/180;
    var a = Math.sin(dlat/2) * Math.sin(dlat/2) +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
            Math.sin(dlon/2) * Math.sin(dlon/2);
    var c = 2 * Math.asin(Math.sqrt(a));
    var d = r * c;
    return d
};

function dropNearbyPins(nearbyUsers, lat, lon) {
    selectedUsers = [];
    for (var i=0; i<nearbyUsers.length; i++){
        var nearbyUser = nearbyUsers[i];
        var dist = haversine(lat,lon,nearbyUser.lat, nearbyUser.lon);
        if (dist<1){
            selectedUsers.push(nearbyUser);
        };
    };
    // console.log('selected users are ', selectedUsers);
    
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

    for (var i=0; i<selectedUsers.length; i++){
        var selected_user = selectedUsers[i];
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
        // console.log(uniqueLocations);
        // console.log(uniqueLocations[0].users.length);
    };
        
    // for each latlon in dictionary /object, drop a pin
    
    // var marker_object_dict = { "type": "FeatureCollection"};

    var features = [];

    for (var m=0; m<uniqueLocations.length; m++){
        var uniqueLocation = uniqueLocations[m];
        otherPin = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [
                  uniqueLocation.lat,
                  uniqueLocation.lon 
                ]
            },
            properties: {
                // title: 'Other',
                'marker-symbol': 'pitch',
                'marker-size': 'large',
                'marker-color': '#FF0066',
                'hobbies': []
            }
        };
        features.push(otherPin);
        console.log("featuressssss", features);



        var usernames = [];
        for (var l=0; l<uniqueLocation.users.length; l++){
            var user = uniqueLocation.users[l];
            usernames.push(user.username);
        };

        var stringToAdd = '<div class="users">';
        for (var z=0; z<uniqueLocation.users.length; z++){
            var user = uniqueLocation.users[z];
            stringToAdd+='<p class="info">Username: '+user.username+'<br>'+' Hobby: '+user.hobby_name+'</p><p>Customize your message to this user below!</p><input type="text" id="message" name="message"><br><br>';  
            stringToAdd+=generateButtonHtml(user.username);
            locFromId[user.username] = {
                "username": user.username,
                "hobby": user.hobby_name,
                "lat": user.lat,
                "lon": user.lon,
                "city": user.city
            };
            otherPin.properties.hobbies.push(user.hobby_name);
        };
        stringToAdd+='</div>';
        otherPin.properties.description=stringToAdd;
        // otherPin.bindPopup(stringToAdd).addTo(map);   
    };
    var geoObject = {
        type: "FeatureCollection",
        features: features
    };
    console.log(geoObject)
    // map.featureLayer.setGeoJSON(geoObject);
    otherPins.setGeoJSON(geoObject);
    createCheckboxes();
};

// When user clicks the check-out button, show search bar again
// and hide pins, in addition to loggin check-out action in db.
function addCheckoutListeners(checkinId){
    // remove all listeners on button
    $('#map').off( "click", "#solo-checkout-button");
    $('#map').on('click', '#solo-checkout-button', function() {
        checkedin = false;
        $('.leaflet-control-mapbox-geocoder').show();
        $('.leaflet-marker-icon').hide();
        $('.leaflet-popup').hide();
        $.get('/checkout', {check_in_id : checkinId});
    });
    $('#map').on('click', '.checkout-button', function(){
        checkedin = false;
        $('.leaflet-control-mapbox-geocoder').show();
        $('.leaflet-marker-icon').hide()
        $('.leaflet-popup').hide();
        $.get('/checkout', {check_in_id : checkinId});
    });
};

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
// Also calls addCheckOutListeners function with check_in_id
function checkIn(location){
    $.post('/checkin', location, function(res){
        var checkinId = res.reply.checkinId;
        addCheckoutListeners(checkinId);
    });
};

function generateButtonHtml(username){
    return '<button class="checkin-button" id="'+username+'">Check in & Collaborate</button> <button class="trigger checkout-button" style="display:none" id="checkout-button-'+username+'">Check out</button>';
};

function createCheckboxes() {
  var typesObj = {}, types = [];
  var features = map.featureLayer.getGeoJSON().features;
  for (var i = 0; i < features.length; i++) {
    typesObj[features[i].properties['hobbies']] = true;
  }
  for (var k in typesObj) types.push(k);

  var checkboxes = [];
  for (var i = 0; i < types.length; i++) {
    var item = filters.appendChild(document.createElement('div'));
    var checkbox = item.appendChild(document.createElement('input'));
    var label = item.appendChild(document.createElement('label'));
    checkbox.type = 'checkbox';
    checkbox.id = types[i];
    checkbox.checked = true;
    label.innerHTML = types[i];
    label.setAttribute('for', types[i]);
    checkbox.addEventListener('change', update);
    checkboxes.push(checkbox);
  };

  function update() {
    var enabled = {};
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) enabled[checkboxes[i].id] = true;
    }
    map.featureLayer.setFilter(function(feature) {
      return (feature.properties['hobbies'] in enabled);
    });
  };
};



//**************************************************************************
// If user is checked in anywhere, add marker to map
// Set marker's tooltip to display solo-checkout-button

if (checkedin){
    // Set map view depending on lat/lon of checked in location 
    map.setView([checkedin[1],checkedin[0]],15);
    
    var checkinId = checkedin[2];
    console.log('checkinId, ', checkinId);
    addCheckoutListeners(checkinId);
    
    $('.leaflet-control-mapbox-geocoder').hide();
    
    // Listen for click on solo-checkin button
    $('#map').on('click', '#solo-checkin-button', function() {
        $.get('/checkin', {lat:checkedin[0], lon:checkedin[1]}, function(res){
            check_in_id_num = res.reply.check_in_id;
            addCheckoutListeners(check_in_id_num);
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
    });
    myPin.bindPopup('<button id="solo-checkin-button" class="trigger" style="display:none">Check in here</button>'+'<button id="solo-checkout-button" class="trigger">Check out</button>')
    myPin.addTo(map);

};


geocoderControl.on('select', function(res) {
    // Clear all markers when re-selecting so users may not check in multiple times
    $('#filters').empty();
    if (myPin){
        myPin.clearLayers();
    };
    if (otherPins){
        otherPins.clearLayers();
        console.log('otherPins, ', otherPins);
    };
    
    var latlon = res.feature.geometry.coordinates;
    var city = cityFromContext(res.feature.context);

    loc['lat']=latlon[0];
    loc['lon']=latlon[1];
    loc['city']=city;
    loc['hobby']='none';

    // Add a pin to the map where you searched
    myPin = L.mapbox.featureLayer({
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
    var selectHtml = '<select id="selecthobby" name="selecthobby">'+'<option id="none" value="none">Or select a favorited hobby</option>'; 
    
    console.log('fav_hobbies: ', fav_hobbies);
    for (var key in fav_hobbies){
        var fav_hobby = key;
        var selectOption = '<option id="'+key+'">'+key+'</option>';
        console.log('selectOption: ', selectOption);
        selectHtml+=selectOption;
    };

    selectHtml+='</select><br><br>'
    stringToAdd+=selectHtml;
    stringToAdd+=generateButtonHtml(session['username']);
    myPin.bindPopup(stringToAdd);
    myPin.addTo(map);

    $('#map').on('change', '#selecthobby', function(){
        var selected = $('#selecthobby').find(":selected").text();
        if((selected)!='Or select a favorited hobby'){
            console.log(selected);
            document.getElementById("hobby").value=selected;
        };
    });

    // Deactivate any current event listeners for check-in button in order to prevent
    // multiple event listeners from accumulating.
    $('#map').off( "click", ".checkin-button");
    // *********** Checkin-button listener ************

    $('#map').on('click', '.checkin-button', function(){
        var button = $(this);
        var id = button.attr('id');

        // If checking in through self pin
        if(id===session['username']){
            // Get value from hobby input field
            var hobby = document.getElementById("hobby").value;
            if (hobby==""){
                alert("Please enter a hobby");
            } else {
                loc['hobby'] = hobby;  
                checkIn(loc);
                
                // Clear searched pin from map after collaborate/checkin
                if (otherPins){
                    otherPins.clearLayers();
                };
                
                // Toggle button display and hide search bar / tooltip close functionality
                $('.leaflet-control-mapbox-geocoder').hide();
                $('.leaflet-popup-close-button').hide();
                $('.checkin-button').hide();
                $('.checkout-button').show();
                $('.info').hide();
            };
        } else {
            // If checking in through other user's pin
            var message = document.getElementById('message').value;
            loc = {};
            loc = locFromId[id];
            console.log('checkin button other pin ', loc)
            loc['send_message'] = true;
            loc['message'] = message;            
            var username = loc['username'];
            loc['other_username'] = username;
            
            // Call checkIn function with loc
            checkIn(loc);
            $('.leaflet-control-mapbox-geocoder').hide();
            $('.leaflet-popup-close-button').hide();
            
            // Clear other pins from map after collaborate/checkin
            map.eachLayer(function(layer){ 
                try{
                    var coordinates = layer.feature.geometry.coordinates;
                    if(coordinates[0] != +lat && coordinates[1] != +lon){
                        try{map.removeLayer(layer);}catch(e){console.log(e)};
                    }   
                } catch(TypeError){
                    // Suppress type error
                }
            });
            // Clear searched pin
            myPin.clearLayers();

            $('.leaflet-control-mapbox-geocoder').hide();
            $('.leaflet-popup-close-button').hide();

            $('.checkin-button').hide();
            $('#checkout-button-'+username).show();
            $('.info').hide();
        };
    });

    // Get nearby checked-in users and call dropNearbyPins function
    $.get('/get_nearby', {city : city}, function(res){
        dropNearbyPins(res.reply,latlon[0],latlon[1]);
    });
});