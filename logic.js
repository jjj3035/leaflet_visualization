// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var faultline_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_steps.json"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  function createCircleMarker(feature, latlng){

    function getColor(mag) {
        return mag >= 5 ? '#FF0000' :
            mag >= 4 ? '#FF3300' :
            mag >= 3 ? '#FF6600' : 
            mag >= 2 ? '#FF9900' : 
            mag >= 1 ? '#FFCC00':
            '#FFFF00';
        }
        // Change the values of these options to change the symbol's appearance
    let options = {
        radius: 3 * feature.properties.mag,
        fillColor: getColor(feature.properties.mag),
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }
    return L.circleMarker( latlng, options );
    }

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: createCircleMarker
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiampqMzAzNSIsImEiOiJjamh2YnoxZzAweGpoM3Bsc2FzeWw0a3M0In0.0zSavyapLc2dwkvxxYPPrA");

  var outdoor = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiampqMzAzNSIsImEiOiJjamh2YnoxZzAweGpoM3Bsc2FzeWw0a3M0In0.0zSavyapLc2dwkvxxYPPrA");

  var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiampqMzAzNSIsImEiOiJjamh2YnoxZzAweGpoM3Bsc2FzeWw0a3M0In0.0zSavyapLc2dwkvxxYPPrA");

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellite,
    "Outdoors": outdoor,
    "Grayscale": grayscale
  };
  var myLines=[]
   // Perform a GET request to the fault line query URL
  
   d3.json(faultline_url, function(data) {
       data.features.forEach(function(element) {
       myLines.push(element.geometry);
      });
   });

   console.log(myLines)

   var myStyle = {
    "stroke": true,
    "color": "#ff7800",
    "weight": 5
    //"opacity": 0.65
  };
 
  var faultlines = L.geoJSON(myLines, {
    style: myStyle});
  // Create our map, giving it the satellite and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satellite, earthquakes, faultlines]
  });
 
  
  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault lines": faultlines
  };

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

 // var polyline = L.polyline(faultlines, {color: 'red'}).addTo(myMap);

    // Setting up the legend

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (myMap) {
    
        var div = L.DomUtil.create('div', 'info legend');
            colors = ['#FFFF00', '#FFCC00', '#FF9900', '#FF6600','#FF3300', '#FF0000'];
            magnitude = [0, 1, 2, 3, 4, 5];
            labels = [];
    
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < colors.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    
    legend.addTo(myMap);

};
