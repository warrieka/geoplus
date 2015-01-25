
function initUI( map, vectorLayer, featureOverlay ){
 
    $.ajax({ url: "http://datasets.antwerpen.be/v4/gis.json" })
    .done( function(resp)  {
            var indexJson = resp.data.datasets;
            
            $.each(indexJson , function(i, elem)
            {
                var title = elem.split("/").slice(-1)[0];
                $( "#dataList" ).append($("<option></option>")
                                .attr("value", elem).text(title));                                
            })         
        })
    .fail( function() {alert("Sorry. Server gaf fout")});
    
    $('#dataList').change(function() {
            var pageUrl =  this.options[this.selectedIndex].value;
            displayData(pageUrl + ".json");
            });

    $( "#saveBtn" ).click(function(){
        
        var vecSrc = vectorLayer.getSource();
        var outSRS= 'EPSG:31370';
        
        if( !(vecSrc && vecSrc.getFeatures().length) ){ return; }
        
        var lst = document.getElementById("dataList")
        var laagName = lst.options[lst.selectedIndex].text;
        
        if( document.getElementById('geoJsonChk').checked ){
            var gjsParser = new ol.format.GeoJSON();
            var gjs = gjsParser.writeFeatures( vecSrc.getFeatures(), 
                                        {dataProjection: outSRS, featureProjection:'EPSG:31370'} );
            downloadString( gjs, laagName +".json" , "text/plain");
        }
        else if( document.getElementById('gpxChk').checked ){
            var ftype = vecSrc.getFeatures()[0].getGeometry().getType();
            if(ftype == "MultiPolygon" || ftype == "Polygon"){
                alert("GPX kan enkel lijnen en punten opslaan");
            }
            else {
                var gmlParser = new ol.format.GPX();
                var gml = gmlParser.writeFeatures( vecSrc.getFeatures(),
                                        { dataProjection:'EPSG:4326', featureProjection:'EPSG:31370'});
                downloadString( gml, laagName +".gpx" , "text/plain");
            }
        }
        else if( document.getElementById('shpChk').checked ){
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
                esriGeometry = "esriGeometryNull";
            }
            var esriFields = [] ;
            for( var key in gjs.features[0].properties ){ 
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
            }
            var arcjsFull = { 
                spatialReference : {latestWkid: parseFloat(outSRS.replace("EPSG:","")) } ,
                fields: esriFields,
                geometryType: esriGeometry,
                features: arcjs 
            }
                    
            downloadString( JSON.stringify(arcjsFull), laagName +".json" , "text/plain");
        }
    });

    $( "#saveBtn" ).button({});
    $( "#radio" ).buttonset();

    /*event handlers*/        
    var vectorSource = new ol.source.Vector({projection: 'EPSG:31370'});
    vectorLayer.setSource(vectorSource); 
    
    var displayData = function( url ) { 
        console.log(url)
        vectorSource.clear(1)
        $.ajax({ url: url, dataType: 'json'}).done(function(resp) {
            var pages = resp.paging.pages 
            var features = od2olParser(resp.data);
            vectorSource.addFeatures(features);
            
            for ( var i = 2; i <= pages; ++i ){ 
                $.ajax({url: url +"?page="+ i , dataType: 'json'}).done(function(resp2) {
                    var features = od2olParser(resp2.data);
                    vectorSource.addFeatures(features);
                });
            }
        });     
    }
    
    var od2olParser = function(data){
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
                geometry = gjsParser.readGeometry( item.geometry, {
                                    featureProjection:'EPSG:31370', dataProjection:'EPSG:4326'});
                delete item.geometry;
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
      
}