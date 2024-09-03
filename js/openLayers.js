// Create a new map instance
const map = new ol.Map({
  target: "map", // The id of the element where the map should be rendered
  layers: [
    // Add a Tile layer with OpenStreetMap as the source
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([9.1829, 48.7758]),
    zoom: 12,
  }),
});
