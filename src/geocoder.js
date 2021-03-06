var ol = require('openlayers');

module.exports = function geocoder( geocoderInputID, map , featureOverlay){
    var marker;
    
    $( "#"+ geocoderInputID ).autocomplete({
    source: function( request, response ) {
    $.ajax({
        url: "http://loc.api.geopunt.be/geolocation/Suggestion",
        dataType: "jsonp",
        data: {
            q: request.term, c: 5
        },
        success: function( data ) {
        var straten = [];
        $.each( data.SuggestionResult, function( index, value ){
                //var straat = value.substring( 0, value.lastIndexOf(",")).trim() ;
                if( value != "" ){
                    straten.push( value );
                }
            });
        //filter dubplicates
        straten = straten.filter(function(elem, pos) {
            return straten.indexOf(elem) == pos;
        });
        response( straten );
        }
      });
    },
    minLength: 2,
    select: function( event, ui ) {
        var adres = ui.item.label;
        
        $.ajax({
            url: "http://loc.api.geopunt.be/geolocation/Location",
            dataType: "jsonp",
            data: {
            q: adres + ", Antwerpen",
            c: 1
        },
        success: function( data ) {
        var locs = data.LocationResult;
        if( locs.length ){
            var loc = locs[0];
            var coordinates = [loc.Location.X_Lambert72, loc.Location.Y_Lambert72];
            
            if(marker){
					featureOverlay.remove(marker); 
				}
			marker = new ol.Feature({
					geometry: new ol.geom.Point(coordinates), 
					name: loc.FormattedAddress
                });
            featureOverlay.push(marker);       
            
            var view= map.getView();
            view.fit([loc.BoundingBox.LowerLeft.X_Lambert72, 
                        loc.BoundingBox.LowerLeft.Y_Lambert72, 
                        loc.BoundingBox.UpperRight.X_Lambert72,
                        loc.BoundingBox.UpperRight.Y_Lambert72],  map.getSize()) 
            }
          },
         complete: function(data) {
             $('#adres').val(''); //clear input when finished
         }
        })
      },
    });
    
}