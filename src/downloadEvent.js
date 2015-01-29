var download = require('./download.js');
var openPost = require('./openPost.js');

module.exports = function(vecSrc){
        
        if( !(vecSrc && vecSrc.getFeatures().length) ){ return; }
        
        var lst = document.getElementById("dataList");
        var laagName = lst.options[lst.selectedIndex].text;
        
        var crslst = document.getElementById("crsList");
        var outSRS = crslst.options[crslst.selectedIndex].value;
        
        if( document.getElementById('geoJsonChk').checked ){
            var gjsParser = new ol.format.GeoJSON();
            var gjs = gjsParser.writeFeatures( vecSrc.getFeatures(), 
                                  {dataProjection: outSRS, featureProjection:'EPSG:31370'});
            download( gjs, laagName +".geojson" , "text/plain");
        }
        else if( document.getElementById('shpChk').checked ){
            var gjsParser = new ol.format.GeoJSON();
            var gjs = gjsParser.writeFeatures( vecSrc.getFeatures(), 
                                  {dataProjection: 'EPSG:4326', featureProjection:'EPSG:31370'});       
            openPost('POST', "http://ogre.adc4gis.com/convertJson", { json: gjs, outputName: laagName +".zip"}, "_blank")
        }
        else if( document.getElementById('gpxChk').checked ){
            var ftype = vecSrc.getFeatures()[0].getGeometry().getType();
            if(ftype == "MultiPolygon" || ftype == "Polygon"){
                alert("GPX kan enkel lijnen en punten opslaan");
            }
            else {
                var gpxParser = new ol.format.GPX();
                var gpx = gpxParser.writeFeatures( vecSrc.getFeatures(),
                                        { dataProjection:'EPSG:4326', featureProjection:'EPSG:31370'});
                download( gpx, laagName +".gpx" , "text/plain");
            }
        }
        else if( document.getElementById('esriJSChk').checked ){
            var gjsParser = new ol.format.GeoJSON();
            var gjs = JSON.parse( gjsParser.writeFeatures( vecSrc.getFeatures(), 
                                        {dataProjection: outSRS, featureProjection:'EPSG:31370'} ));
            
            var arcjs =  Terraformer.ArcGIS.convert( gjs );
            
            var esriGeometry;
            var ftype = gjs.features[0].geometry.type;
            switch(ftype) {
                case "Point":
                    esriGeometry = "esriGeometryPoint";
                    break;
                case "LineString":
                    esriGeometry = "esriGeometryPolyline";
                    break;
                case "MultiLineString":
                    esriGeometry = "esriGeometryPolyline";
                    break;
                case "MultiPoint":
                    esriGeometry = "esriGeometryMultipoint";
                    break;
                case "Polygon":
                    esriGeometry = "esriGeometryPolygon";                
                    break;          
                case "MultiPolygon":
                    esriGeometry = "esriGeometryPolygon";
                    break;                
                default:
                    esriGeometry = null;
            }
            var esriFields = [] ;
            for( var key in gjs.features[0].properties ){ 
                if ( key.toLowerCase() == "objectid") { continue; }
                
                feat = gjs.features[0].properties[key];
                if( typeof(feat) == "number" ){ 
                    esriFields.push({name:key, type:"esriFieldTypeDouble" }) 
                }
                else {
                    esriFields.push({name:key, type:"esriFieldTypeString", length: 254 }) 
                }
            }
                    
            for( var i= 0; i < arcjs.length; i++ ){
                delete arcjs[i].geometry.spatialReference  //remove wrong prj
                delete arcjs[i].attributes.objectid  //can't have 2 objectID 's
            }
            var arcjsFull = { 
                spatialReference : {latestWkid: parseInt(outSRS.replace("EPSG:","")) } ,
                fields: esriFields,
                geometryType: esriGeometry,
                features: arcjs 
            }                   
            download( JSON.stringify(arcjsFull), laagName +".json" , "text/plain");
        }
    }
