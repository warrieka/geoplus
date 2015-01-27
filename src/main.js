var geocoder = require('./geocoder.js');
var mapObj = require('./map.js');
var mapEvents = require('./mapEvents.js');
var initUI = require('./ui.js');

$( document ).ready(function() {

    var kaart = new mapObj('map');
    var kaartEvent = new mapEvents( kaart.map, kaart.vectorLayer, kaart.featureOverlay);
    var ui = new initUI( kaart.map , kaart.vectorLayer , kaart.featureOverlay);
    var adresFinder = new geocoder( 'adres', kaart.map , kaart.featureOverlay );
    
});


