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
    $('#map').on('click', '.trigger', function() {
        '/checkin', loc;
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
        'marker-size': 'large',
        'marker-color': '#2EB8B8',
    }
}).bindPopup('<button id="check_in_button" class="trigger">Check in here</button>'+'<button id="check_out_button" style="display:none" id="check_out_button" class="trigger">Check out</button>')
    .addTo(map);
});

// var message = document.getElementById("message-to-change");
// button = document.getElementById("change-hello-to-goodbye-button");
// button.addEventListener('click', makeGoodbye);

// function makeGoodbye(){
//   message.innerText = "goodbye";
// }

