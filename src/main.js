var geocoder = require('./geocoder.js');
var mapObj = require('./map.js');
var mapEvents = require('./mapEvents.js');
var initUI = require('./ui.js');
var bowser = require('bowser');

$( document ).ready(function() {

    if (bowser.msie && bowser.version <= 9) {
        window.location = "/notsupported.html"
     }
        
    var kaart = new mapObj('map');
    var kaartEvent = new mapEvents( kaart.map, kaart.vectorLayer, kaart.featureOverlay);
    var ui = new initUI( kaart.map , kaart.vectorLayer , kaart.featureOverlay);
    var adresFinder = new geocoder( 'adres', kaart.map , kaart.featureOverlay );
    
});


