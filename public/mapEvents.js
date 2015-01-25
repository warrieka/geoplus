function mapEvents( map, vectorLayer, featureOverlay ){
    var highlight;
    /*event handlers*/
    this.displayFeatureInfo = function(pixel, map) {
        var vfeature, vlayer; 
        map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            vfeature = feature;
            vlayer = layer;
        });
        if (vfeature && vlayer == vectorLayer ) {
            var props = vfeature.getProperties();
            delete props.geometry;
            
            var msg = "";
            
            for(var key in props) {
                    msg += "<strong>"+ key + ":</strong> "+ props[ key ] +"<br/>";
                }
            var lst = document.getElementById("dataList")
            var laagName = lst.options[lst.selectedIndex].text;

            dlg.html(msg);
            dlg.dialog( "option", "title", laagName).dialog( "open" );   
        
            if (vfeature !== highlight) {
                if (highlight) {
                        featureOverlay.removeFeature(highlight);
                    }
                if (vfeature) {
                        featureOverlay.addFeature(vfeature);
                    }
                    highlight = vfeature;
                } 
            } 
    }
    
    /*events*/
    var displayFeatureInfo = this.displayFeatureInfo;
    map.on('click', function(evt) {
        displayFeatureInfo(evt.pixel, map);
    });
    
    dlg.on( "dialogclose", function( event, ui ) {
          if (highlight) {
                featureOverlay.removeFeature(highlight);
                highlight = null;
          } 
    });
    

}    