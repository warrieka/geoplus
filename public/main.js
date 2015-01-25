var kaart , ui, adresFinder, dlg;

$( document ).ready(function() {
        /*info dialog*/
    dlg = $( "#info" ).dialog({ autoOpen: false });
    
    kaart = new Map('map');
    kaartEvent = new mapEvents(kaart.map, kaart.vectorLayer, kaart.featureOverlay);
    ui = new initUI( kaart.map , kaart.vectorLayer , kaart.featureOverlay);
    adresFinder = new geocoder( 'adres', kaart.map , kaart.featureOverlay );
    
    
    
});


