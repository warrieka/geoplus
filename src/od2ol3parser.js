var ol = require('openlayers');

module.exports = function(data){
        var gjsParser = new ol.format.GeoJSON();
        var features =  [];
        for ( var i = 0; i < data.length; ++i ){
            var item = data[i];
            var geometry;
            if( item.point_lat && item.point_lng ) {
                var coords = ol.proj.transform(
                        [parseFloat(item.point_lng), parseFloat(item.point_lat)],'EPSG:4326','EPSG:31370')
                geometry= new ol.geom.Point( coords );
                delete item.point_lng;
                delete item.point_lat;
                }
            else if( item.geometry ) {
                try{
                geometry = gjsParser.readGeometry( item.geometry, {
                                    featureProjection:'EPSG:31370', dataProjection:'EPSG:4326'});            
                }
                catch(ero) {
                    console.log("Kon geometry op record "+ item.id + " niet parseren" )
                }
                delete item.geometry;
                delete item.objectid; //obsolete
            }
            else { 
                throw 'Niet alle records geografisch'; 
            }
            item.geometry = geometry ;
            var feature = new ol.Feature(item);
            features.push( feature );
        }
        return features;
    }