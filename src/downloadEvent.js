var download = require('./download.js');
var openPost = require('./openPost.js');
var ArcGIS = require('terraformer-arcgis-parser');
var shpwrite = require('shp-write');
var ol = require('openlayers');

module.exports = function(vecSrc, laagName){
        //return if no data in layer
        if( !(vecSrc && vecSrc.getFeatures().length) ){ return; }
		//get CRS
        var crslst = document.getElementById("crsList");
        var outSRS = crslst.options[crslst.selectedIndex].value;
        //get File
        if( document.getElementById('geoJsonChk').checked ){
            var gjsParser = new ol.format.GeoJSON();
            var gjs = gjsParser.writeFeatures( vecSrc.getFeatures(), 
                                  {dataProjection: outSRS, featureProjection:'EPSG:31370'});
            download( gjs, laagName +".geojson" , "text/plain");
        }
        else if( document.getElementById('shpChk').checked ){
            var gjsParser = new ol.format.GeoJSON();
            var gjs = JSON.parse( gjsParser.writeFeatures( vecSrc.getFeatures(), 
                                  {dataProjection: 'EPSG:4326', featureProjection:'EPSG:31370'}) );       
            var opt = {
				folder: laagName.replace("/", "_"),  
				types: { point: laagName.replace("/", "_") + '_points',
					     polygon: laagName.replace("/", "_") + '_polygons',
				         line: laagName.replace("/", "_") + '_lines' }
				}
			try {
				shpwrite.download(gjs, opt);
			}
			catch(err) {
				openPost('POST', "http://ogre.adc4gis.com/convertJson", { json: JSON.stringify(gjs), outputName: laagName +".zip"}, "_blank")
			}
        }
        else if( document.getElementById('gpxChk').checked ){
            var ftype = vecSrc.getFeatures()[0].getGeometry().getType();
            if(ftype == "MultiPolygon" || ftype == "Polygon"){
                alert("GPX kan enkel lijnen en punten opslaan");
            }
            else {
                var gpxParser = new ol.format.GPX();
                var gpx = gpxParser.writeFeatures( vecSrc.getFeatures(),
                                     {dataProjection:'EPSG:4326', featureProjection:'EPSG:31370'});
                download( gpx, laagName +".gpx" , "text/plain");
            }
        }
        else if( document.getElementById('esriJSChk').checked ){
            var gjsParser = new ol.format.GeoJSON();
            var gjs = JSON.parse( gjsParser.writeFeatures( vecSrc.getFeatures(), 
                                        {dataProjection: outSRS, featureProjection:'EPSG:31370'} ));
            var arcjs =  ArcGIS.convert( gjs );
            
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
            latestWkid = parseInt(outSRS.replace("EPSG:",""));
            wkid = latestWkid;
            if( latestWkid = 3857 ){  wkid = 102100 }
            
            var arcjsFull = { 
                spatialReference : { wkid: wkid,
                                     latestWkid: latestWkid } ,
                fields: esriFields,
                geometryType: esriGeometry,
                features: arcjs 
            }                   
            download( JSON.stringify(arcjsFull), laagName +".json" , "text/plain");
        }
		else if( document.getElementById('gmlChk').checked ){
            var gmlHead = '<featureMembers xmlns="http://www.opengis.net/gml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://schemas.opengis.net/gml/3.1.1/profiles/gmlsfProfile/1.0.0/gmlsf.xsd"></featureMembers>';
			var parser = new DOMParser();
			var gmlDoc = parser.parseFromString(gmlHead,"text/xml");

			var gmlParser = new ol.format.GML3({srsName: outSRS,
								featureNS: "http://opendata.antwerpen.be", featureType: "opendata"});
				
			vecSrc.forEachFeature(function(feature){
				var props = feature.getProperties();
				var featureMember = gmlDoc.createElementNS("http://www.opengis.net/gml","featureMember");
				var openDataNode = gmlDoc.createElementNS("http://opendata.antwerpen.be", "opendata");
				
				var geomNode = gmlParser.writeGeometryNode( feature.getGeometry(),
						{dataProjection: outSRS, featureProjection:'EPSG:31370'});
				openDataNode.insertBefore( geomNode , null );
				geomNode.firstChild.namespaceURI = "http://www.opengis.net/gml"
				for(var key in props) {
					var attrNode = gmlDoc.createElement( key );
					attrNode.innerHTML = props[ key ];
					openDataNode.insertBefore( attrNode , null );
				} 	
				featureMember.insertBefore( openDataNode, null);
				gmlDoc.firstChild.insertBefore( featureMember, null);
			});

			var xmls = new XMLSerializer();
            download( xmls.serializeToString(gmlDoc), laagName +".gml" , "text/xml");
        }
    }
