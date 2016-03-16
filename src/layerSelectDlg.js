
module.exports = function( kaart ){
    var vectorLayer = kaart.vectorLayer;
    var featureOverlay = kaart.featureOverlay; 
    
    var dlg = $( "#dataListBtn" ).dialog({ 
        autoOpen: false,
        height:340, width: 400,
        modal: true,
        buttons: {
            "Sluiten": function() {
                $( this ).dialog( "close" );
            }
       }   
   });


}