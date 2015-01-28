(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var download = require('./download.js');
var openPost = require('./openPost.js');

module.exports = function(vecSrc, outSRS){
        
        if( !(vecSrc && vecSrc.getFeatures().length) ){ return; }
        
        var lst = document.getElementById("dataList")
        var laagName = lst.options[lst.selectedIndex].text;
        
        if( document.getElementById('geoJsonChk').checked ){
            var gjsParser = new ol.format.GeoJSON();
            var gjs = gjsParser.writeFeatures( vecSrc.getFeatures(), 
                                  {dataProjection: outSRS, featureProjection:'EPSG:31370'});
            download( gjs, laagName +".geojson" , "text/plain");
        }
        else if( document.getElementById('shpChk').checked ){
            var gjsParser = new ol.format.GeoJSON();
            var gjs = gjsParser.writeFeatures( vecSrc.getFeatures(), 
                                  {dataProjection: outSRS, featureProjection:'EPSG:31370'});       
            openPost('POST', "http://ogre.adc4gis.com/convertJson", { json: gjs, outputName: laagName }, "_blank")
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
                download( gml, laagName +".gpx" , "text/plain");
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

},{"./download.js":2,"./openPost.js":7}],2:[function(require,module,exports){

// modified from https://github.com/rndme/download
// data can be a string, Blob, File, or dataURL

module.exports = function (data, strFileName, strMimeType) {
	
	var self = window, // this script is only for browsers anyway...
		u = "application/octet-stream", // this default mime also triggers iframe downloads
		m = strMimeType || u, 
		x = data,
		D = document,
		a = D.createElement("a"),
		z = function(a){return String(a);},
		B = (self.Blob || self.MozBlob || self.WebKitBlob || z);
		B=B.call ? B.bind(self) : Blob ;
		var fn = strFileName || "download",
		blob, 
		fr;

	
	if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
		x=[x, m];
		m=x[0];
		x=x[1]; 
	}
	
	


	//go ahead and download dataURLs right away
	if(String(x).match(/^data\:[\w+\-]+\/[\w+\-]+[,;]/)){
		return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
			navigator.msSaveBlob(d2b(x), fn) : 
			saver(x) ; // everyone else can save dataURLs un-processed
	}//end if dataURL passed?
	
	blob = x instanceof B ? 
		x : 
		new B([x], {type: m}) ;
	
	
	function d2b(u) {
		var p= u.split(/[:;,]/),
		t= p[1],
		dec= p[2] == "base64" ? atob : decodeURIComponent,
		bin= dec(p.pop()),
		mx= bin.length,
		i= 0,
		uia= new Uint8Array(mx);

		for(i;i<mx;++i) uia[i]= bin.charCodeAt(i);

		return new B([uia], {type: t});
	 }
	  
	function saver(url, winMode){
		
		if ('download' in a) { //html5 A[download] 			
			a.href = url;
			a.setAttribute("download", fn);
			a.innerHTML = "downloading...";
			D.body.appendChild(a);
			setTimeout(function() {
				a.click();
				D.body.removeChild(a);
				if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(a.href);}, 250 );}
			}, 66);
			return true;
		}

		if(typeof safari !=="undefined" ){ // handle non-a[download] safari as best we can:
			url="data:"+url.replace(/^data:([\w\/\-\+]+)/, u);
			if(!window.open(url)){ // popup blocked, offer direct download: 
				if(confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")){ location.href=url; }
			}
			return true;
		}
		
		//do iframe dataURL download (old ch+FF):
		var f = D.createElement("iframe");
		D.body.appendChild(f);
		
		if(!winMode){ // force a mime that will download:
			url="data:"+url.replace(/^data:([\w\/\-\+]+)/, u);
		}
		f.src=url;
		setTimeout(function(){ D.body.removeChild(f); }, 333);
		
	}//end saver 
		



	if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
		return navigator.msSaveBlob(blob, fn);
	} 	
	
	if(self.URL){ // simple fast and modern way using Blob and URL:
		saver(self.URL.createObjectURL(blob), true);
	}else{
		// handle non-Blob()+non-URL browsers:
		if(typeof blob === "string" || blob.constructor===z ){
			try{
				return saver( "data:" +  m   + ";base64,"  +  self.btoa(blob)  ); 
			}catch(y){
				return saver( "data:" +  m   + "," + encodeURIComponent(blob)  ); 
			}
		}
		
		// Blob but not URL:
		fr=new FileReader();
		fr.onload=function(e){
			saver(this.result); 
		};
		fr.readAsDataURL(blob);
	}	
	return true;
} /* end download() */
},{}],3:[function(require,module,exports){

module.exports = function geocoder( geocoderInputID, map , featureOverlay){
    var marker;
    
    $( "#"+ geocoderInputID ).autocomplete({
    source: function( request, response ) {
    $.ajax({
        url: "http://loc.api.geopunt.be/geolocation/Suggestion",
        dataType: "jsonp",
        data: {
            q: request.term + ", Antwerpen",
            c: 20
        },
        success: function( data ) {
        var straten = [];
        $.each( data.SuggestionResult, function( index, value ){
                var straat = value.substring( 0, value.lastIndexOf(",")).trim() ;
                if( straat != "" ){
                    straten.push( straat );
                }
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
            
            if(marker){ featureOverlay.removeFeature(marker); }
            marker = new ol.Feature({
                geometry: new ol.geom.Point(coordinates), 
                name: loc.FormattedAddress
                });

            featureOverlay.addFeature(marker);       
            
            var view= map.getView();
            view.fitExtent([loc.BoundingBox.LowerLeft.X_Lambert72, 
                            loc.BoundingBox.LowerLeft.Y_Lambert72, 
                            loc.BoundingBox.UpperRight.X_Lambert72,
                            loc.BoundingBox.UpperRight.Y_Lambert72],  map.getSize()) 
            }
          }
        })
      },
    });
    
}
},{}],4:[function(require,module,exports){
var geocoder = require('./geocoder.js');
var mapObj = require('./map.js');
var mapEvents = require('./mapEvents.js');
var initUI = require('./ui.js');

$( document ).ready(function() {

    var kaart = new mapObj('map');
    var kaartEvent = new mapEvents( kaart.map, kaart.vectorLayer, kaart.featureOverlay);
    var ui = new initUI( kaart.map , kaart.vectorLayer , kaart.featureOverlay);
    var adresFinder = new geocoder( 'adres', kaart.map , kaart.featureOverlay );
    
});



},{"./geocoder.js":3,"./map.js":5,"./mapEvents.js":6,"./ui.js":8}],5:[function(require,module,exports){

module.exports = function MapObj( mapID ){
    styles = {
        'Point': [new ol.style.Style({
            image: new ol.style.Circle({
                        radius: 5, 
                        fill: new ol.style.Fill({ color: 'rgba(255, 255, 0, 0.5)'}),
                        stroke: new ol.style.Stroke({color: 'yellow', width: 1})
                    })
                })],
        'LineString': [new ol.style.Style({
                stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            })
            })],
        'MultiLineString': [new ol.style.Style({
                stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            })
        })],
        'MultiPoint': [new ol.style.Style({
            image: new ol.style.Circle({
                    radius: 5, 
                    fill: new ol.style.Fill({ color: 'rgba(255, 255, 0, 0.5)'}),
                    stroke: new ol.style.Stroke({color: 'yellow', width: 1})
                }),
            })],
        'MultiPolygon': [new ol.style.Style({
            stroke: new ol.style.Stroke({
                    color: 'yellow',
                    width: 2
                }),
            fill: new ol.style.Fill({
            color: 'rgba(255, 255, 0, 0.1)'
            })
        })],
        'Polygon': [new ol.style.Style({
            stroke: new ol.style.Stroke({
            color: 'yellow',
            width: 2
            }),
            fill: new ol.style.Fill({
            color: 'rgba(255, 255, 0, 0.1)'
            })
        })]
        };
    
    this.styleFunction = function(feature, resolution) {
            return styles[feature.getGeometry().getType()];
        }
    
    this.vectorLayer = new ol.layer.Vector({style: this.styleFunction}) ;   
    
    /*basiskaart*/ 
    var projectionExtent = [9928.00, 66928.00, 272072.00, 329072.00];
    var projection = ol.proj.get('EPSG:31370');
    projection.setExtent(projectionExtent);
    var size = ol.extent.getWidth(projectionExtent) / 256;
    var resolutions = new Array(16);
    var matrixIds = new Array(16);
    for (var z = 0; z < 16; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
    }

    this.basiskaart = new ol.layer.Tile({
        extent: projectionExtent,
        source: new ol.source.WMTS({
        url: 'http://grb.agiv.be/geodiensten/raadpleegdiensten/geocache/wmts/',
        layer: 'grb_bsk_gr',
        matrixSet: 'BPL72VL',
        format: 'image/png',
        projection: projection,
        tileGrid: new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds
            })
        })
    }); 

    this.map = new ol.Map({
            target: mapID,
            layers: [ this.basiskaart, this.vectorLayer  ],
            view: new ol.View({
                projection: 'EPSG:31370',
                center: [152223, 213544],
                extent: projectionExtent,              
                zoom: 4,
                maxZoom: 16
            })
        });
    this.map.addControl(new ol.control.ScaleLine());

    this.featureOverlay = new ol.FeatureOverlay({
        map: this.map,
        style:  new ol.style.Style({
            image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({color: 'red', width: 1})
                }),
            stroke: new ol.style.Stroke({
                    color: '#f00',
                    width: 1
                }),
            fill: new ol.style.Fill({
                    color: 'rgba(255,0,0,0.1)'
                }),
            })       
    });           
}

},{}],6:[function(require,module,exports){

module.exports = function mapEvents( map, vectorLayer, featureOverlay ){
    
    var dlg = $( "#info" ).dialog({ autoOpen: false });
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

},{}],7:[function(require,module,exports){

module.exports = function(verb, url, data, target) {
  var form = document.createElement("form");
  form.action = url;
  form.method = verb;
  form.target = target || "_self";
  if (data) {
    for (var key in data) {
      var input = document.createElement("textarea");
      input.name = key;
      input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
      form.appendChild(input);
    }
  }
  form.style.display = 'none';
  document.body.appendChild(form);
  form.submit();
};
},{}],8:[function(require,module,exports){

var downloadEvent = require('./DownloadEvent.js');

module.exports = function( map, vectorLayer, featureOverlay ){
    var downloadDlg = $( "#downloadDlg" ).dialog({ 
        autoOpen: false,
        height:280,
        modal: true,
        buttons: {
            "Download Data": function() {
                downloadEvent( vectorLayer.getSource(), 'EPSG:31370' ); 
                $( this ).dialog( "close" );
            },
            "Cancel": function() {
                $( this ).dialog( "close" );
            }
      }
        
    });
    
    $( "#saveBtn" ).button();
    $( "#saveOpenBtn" ).button();
    
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

    $( "#saveOpenBtn" ).click(function(){
         downloadDlg.dialog( "open" );   
    });
    
    /*event handlers*/        
    var vectorSource = new ol.source.Vector({projection: 'EPSG:31370'});
    vectorLayer.setSource(vectorSource); 
    
    var displayData = function( url ) { 
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
                try{
                geometry = gjsParser.readGeometry( item.geometry, {
                                    featureProjection:'EPSG:31370', dataProjection:'EPSG:4326'});            
                }
                catch(ero) {
                    console.log("Kon geometry op record "+ item.id + " niet parseren" )
                }
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
},{"./DownloadEvent.js":1}]},{},[4]);
