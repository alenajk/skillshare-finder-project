L.mapbox.accessToken = 'pk.eyJ1IjoiZW5hamthbCIsImEiOiJIREZaeThRIn0.C31-vYXMj9y0TTujzEGNZQ';

var output = document.getElementById('output');
var map = L.mapbox.map('map', 'mapbox.streets');
var geocoderControl = L.mapbox.geocoderControl('mapbox.places');
geocoderControl.addTo(map);
geocoderControl.on('select', function(res) {
    console.log(res);
    var latlon = res.feature.geometry.coordinates;
    var data = {
    	lat : latlon[0],
    	lon : latlon[1]
    };
    console.log(latlon);
    $.get('/store_latlon', data);
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
        title: 'Peregrine Espresso',
        description: '1718 14th St NW, Washington, DC',
        'marker-size': 'large',
        'marker-color': '#2EB8B8',
    }
}).addTo(map);
});
