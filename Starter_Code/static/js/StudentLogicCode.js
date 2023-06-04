// Creating our initial map object
var myMap = L.map("map", {
    center: [37.7749, -122.4194],
    zoom: 5
  });
  
  // Adding a tile layer (the background map image) to our map
  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: "pk.eyJ1IjoiZW1hcnRpbjgxNjkiLCJhIjoiY2xoY2tpcHd4MTI0NDN0b2FxZjdycnpvNSJ9.oDrlFWj5gnVx1-ynFcfUtg"
    }
  ).addTo(myMap);
  
  // Store our API endpoints
  var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  
  // Perform GET requests to fetch earthquake and tectonic plate data
  Promise.all([d3.json(earthquakeUrl), d3.json(plateUrl)]).then(function(response) {
    var earthquakeData = response[0];
    var plateData = response[1];
  
    // Create a layer group for earthquake markers
    var earthquakes = L.geoJSON(earthquakeData.features, {
      onEachFeature: function(feature, layer) {
        var magnitude = feature.properties.mag;
        var color = getColor(magnitude);
        
        layer.bindPopup(
          "<h3>" +
            feature.properties.place +
            "</h3><hr><p>Magnitude: " +
            feature.properties.mag +
            "</p><p>" +
            new Date(feature.properties.time) +
            "</p>",
          {
            className: "popup-" + magnitude,
            closeButton: false
          }
        );
      },
      pointToLayer: function(feature, latlng) {
        var magnitude = feature.properties.mag;
        var color = getColor(magnitude);
  
        var geojsonMarkerOptions = {
          radius: 4 * magnitude,
          fillColor: color,
          color: "black",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        };
        return L.circleMarker(latlng, geojsonMarkerOptions);
      }
    });
  
    // Create a layer group for tectonic plate outlines
    var plates = L.geoJSON(plateData, {
      style: {
        color: "#FF0000",
        weight: 2
      }
    });
  
    // Add earthquake and plate layers to the map
    earthquakes.addTo(myMap);
    plates.addTo(myMap);
  
    // Create a legend control
    var legend = L.control({ position: 'bottomleft' });
  
    legend.onAdd = function(map) {
      // Create a separate div for the legend
      var legendDiv = L.DomUtil.create('div', 'legend');
  
      // Add the legend title
      legendDiv.innerHTML += '<div class="legend-title">Earthquake Magnitude Last 7 days</div>';
  
      // Define the magnitude ranges and labels
      var magnitudeRanges = [
        { min: 0, max: 1, label: '0 - 1' },
        { min: 1, max: 2, label: '1 - 2' },
        { min: 2, max: 3, label: '2 - 3' },
        { min: 3, max: 4, label: '3 - 4' },
        { min: 4, max: 5, label: '4 - 5' },
        { min: 5, max: Infinity, label: '5+' }
      ];
  
      // Generate color swatches and labels for each magnitude range
      for (var i = 0; i < magnitudeRanges.length; i++) {
        var range = magnitudeRanges[i];
        var color = getColor((range.min + range.max) / 2); // Get color based on average magnitude
        
        if (range.max === Infinity) {
          color = "#800080"; // Custom color for "5+" range
        }
  
        legendDiv.innerHTML +=
          '<div>' +
            '<i style="background:' + color + '"></i>' +
            range.label +
          '</div>';
      }
  
      return legendDiv;
    };
  
    legend.addTo(myMap);
  }).catch(function(error) {
    console.log(error);
  });
  
  // Helper function to assign color based on magnitude
  function getColor(magnitude) {
    var colors = ["#00FF00", "#99FF00", "#FFFF00", "#FFCC00", "#FF6600", "#FF0000", "#800080"];
    return colors[Math.floor(magnitude)];
  }
  






  
  
  
  
  
  
  
  
  
  
  
