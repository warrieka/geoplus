var ol = require('openlayers');

module.exports = function mapEvents( map, vectorLayer, highlightLayer ){
    var dlg = $( "#info" ).dialog({ autoOpen: false });
    var highlight;
    /*event handlers*/
    this.displayFeatureInfo = function(pixel, map, laagName) {
        var vfeature, vlayer; 
        map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            vfeature = feature;
            vlayer = layer;
        });
        if (vfeature && vlayer == vectorLayer ) {
            var props = vfeature.getProperties();
            delete props.geometry;
			delete props.description;
            
            var msg = "";
            
            for(var key in props) {
                    msg += "<strong>"+ key + ":</strong> "+ props[ key ] +"<br/>";
                }
            dlg.html(msg);
            dlg.dialog( "option", "title", laagName).dialog( "open" );   
        
            if (vfeature !== highlight) {
				 if (vfeature) {
                        highlightLayer.remove(highlight);
                    }
                 highlight = vfeature;
				 highlightLayer.push(highlight);
            } 
        } 
	}
    /*events*/
    var displayFeatureInfo = this.displayFeatureInfo;
    map.on('click', function(evt) {
		var laagName;
		if( $( "#tabs" ).tabs('option', 'active') === 0 ){
			var lst = document.getElementById("dataList");
			if(!lst || lst.selectedIndex < 0){return;}
			laagName = lst.options[lst.selectedIndex].text;
		}
		else {
			var lst = document.getElementById("gentDataList");
			if(!lst || lst.selectedIndex < 0){return;}
			laagName = lst.options[lst.selectedIndex].text;
		}
        displayFeatureInfo(evt.pixel, map, laagName);
    });
    dlg.on( "dialogclose", function( event, ui ) {
          if (highlight) {
                highlightLayer.remove(highlight);
                highlight = null;
          } 
    });
}   
