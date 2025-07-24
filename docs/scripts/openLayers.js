// Import necessary OpenLayers modules (assuming OpenLayers is loaded globally via script tag)
// If using a module bundler, you would import like this:
// import 'ol/ol.css';
// import Map from 'ol/Map';
// import OSM from 'ol/source/OSM';
// import TileLayer from 'ol/layer/Tile';
// import View from 'ol/View';
// import {fromLonLat} from 'ol/proj';

// Create a new map instance
const map = new ol.Map({
  target: "map", // The id of the HTML element where the map will be rendered
  layers: [
    // Add a Tile layer with OpenStreetMap as the source
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    // Set the initial center and zoom level of the map
    // The center is set using coordinates in EPSG:3857 projection (Web Mercator)
    // fromLonLat converts longitude and latitude (EPSG:4326) to EPSG:3857
    center: ol.proj.fromLonLat([9.1829, 48.7758]), // Example coordinates (Stuttgart, Germany)
    zoom: 12,
  }),
});

// Note: To make this script dynamic (e.g., loading data based on user interaction
// or fetching data from your backend), you would add more OpenLayers code here
// to add new layers, markers, handle events, etc.
