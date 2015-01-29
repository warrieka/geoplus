(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
  * Bowser - a browser detector
  * https://github.com/ded/bowser
  * MIT License | (c) Dustin Diaz 2014
  */

!function (name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports['browser'] = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else this[name] = definition()
}('bowser', function () {
  /**
    * See useragents.js for examples of navigator.userAgent
    */

  var t = true

  function detect(ua) {

    function getFirstMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[1]) || '';
    }

    var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase()
      , likeAndroid = /like android/i.test(ua)
      , android = !likeAndroid && /android/i.test(ua)
      , versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
      , tablet = /tablet/i.test(ua)
      , mobile = !tablet && /[^-]mobi/i.test(ua)
      , result

    if (/opera|opr/i.test(ua)) {
      result = {
        name: 'Opera'
      , opera: t
      , version: versionIdentifier || getFirstMatch(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/windows phone/i.test(ua)) {
      result = {
        name: 'Windows Phone'
      , windowsphone: t
      , msie: t
      , version: getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/msie|trident/i.test(ua)) {
      result = {
        name: 'Internet Explorer'
      , msie: t
      , version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
      }
    }
    else if (/chrome|crios|crmo/i.test(ua)) {
      result = {
        name: 'Chrome'
      , chrome: t
      , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    }
    else if (iosdevice) {
      result = {
        name : iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
      }
      // WTF: version is not part of user agent in web apps
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if (/sailfish/i.test(ua)) {
      result = {
        name: 'Sailfish'
      , sailfish: t
      , version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/seamonkey\//i.test(ua)) {
      result = {
        name: 'SeaMonkey'
      , seamonkey: t
      , version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/firefox|iceweasel/i.test(ua)) {
      result = {
        name: 'Firefox'
      , firefox: t
      , version: getFirstMatch(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)
      }
      if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
        result.firefoxos = t
      }
    }
    else if (/silk/i.test(ua)) {
      result =  {
        name: 'Amazon Silk'
      , silk: t
      , version : getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
      }
    }
    else if (android) {
      result = {
        name: 'Android'
      , version: versionIdentifier
      }
    }
    else if (/phantom/i.test(ua)) {
      result = {
        name: 'PhantomJS'
      , phantom: t
      , version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
      result = {
        name: 'BlackBerry'
      , blackberry: t
      , version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/(web|hpw)os/i.test(ua)) {
      result = {
        name: 'WebOS'
      , webos: t
      , version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
      };
      /touchpad\//i.test(ua) && (result.touchpad = t)
    }
    else if (/bada/i.test(ua)) {
      result = {
        name: 'Bada'
      , bada: t
      , version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
      };
    }
    else if (/tizen/i.test(ua)) {
      result = {
        name: 'Tizen'
      , tizen: t
      , version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
      };
    }
    else if (/safari/i.test(ua)) {
      result = {
        name: 'Safari'
      , safari: t
      , version: versionIdentifier
      }
    }
    else result = {}

    // set webkit or gecko flag for browsers based on these engines
    if (/(apple)?webkit/i.test(ua)) {
      result.name = result.name || "Webkit"
      result.webkit = t
      if (!result.version && versionIdentifier) {
        result.version = versionIdentifier
      }
    } else if (!result.opera && /gecko\//i.test(ua)) {
      result.name = result.name || "Gecko"
      result.gecko = t
      result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
    }

    // set OS flags for platforms that have multiple browsers
    if (android || result.silk) {
      result.android = t
    } else if (iosdevice) {
      result[iosdevice] = t
      result.ios = t
    }

    // OS version extraction
    var osVersion = '';
    if (iosdevice) {
      osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (android) {
      osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
    } else if (result.windowsphone) {
      osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
    } else if (result.webos) {
      osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
    } else if (result.blackberry) {
      osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
    } else if (result.bada) {
      osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
    } else if (result.tizen) {
      osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
    }
    if (osVersion) {
      result.osversion = osVersion;
    }

    // device type extraction
    var osMajorVersion = osVersion.split('.')[0];
    if (tablet || iosdevice == 'ipad' || (android && (osMajorVersion == 3 || (osMajorVersion == 4 && !mobile))) || result.silk) {
      result.tablet = t
    } else if (mobile || iosdevice == 'iphone' || iosdevice == 'ipod' || android || result.blackberry || result.webos || result.bada) {
      result.mobile = t
    }

    // Graded Browser Support
    // http://developer.yahoo.com/yui/articles/gbs
    if ((result.msie && result.version >= 10) ||
        (result.chrome && result.version >= 20) ||
        (result.firefox && result.version >= 20.0) ||
        (result.safari && result.version >= 6) ||
        (result.opera && result.version >= 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] >= 6) ||
        (result.blackberry && result.version >= 10.1)
        ) {
      result.a = t;
    }
    else if ((result.msie && result.version < 10) ||
        (result.chrome && result.version < 20) ||
        (result.firefox && result.version < 20.0) ||
        (result.safari && result.version < 6) ||
        (result.opera && result.version < 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
        ) {
      result.c = t
    } else result.x = t

    return result
  }

  var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent : '')


  /*
   * Set our detect method to the main bowser object so we can
   * reuse it to test other user agents.
   * This is needed to implement future tests.
   */
  bowser._detect = detect;

  return bowser
});

},{}],2:[function(require,module,exports){

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

},{"./download.js":2,"./openPost.js":9}],4:[function(require,module,exports){

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
          },
         complete: function(data) {
             $('#adres').val(''); //clear input when finished
         }
        })
      },
    });
    
}
},{}],5:[function(require,module,exports){
var geocoder = require('./geocoder.js');
var mapObj = require('./map.js');
var mapEvents = require('./mapEvents.js');
var initUI = require('./ui.js');
var bowser = require('bowser');

$( document ).ready(function() {

    if (bowser.msie && bowser.version <= 9) {
        window.location = "/notsupported.html"
     }
        
    var kaart = new mapObj('map');
    var kaartEvent = new mapEvents( kaart.map, kaart.vectorLayer, kaart.featureOverlay);
    var ui = new initUI( kaart.map , kaart.vectorLayer , kaart.featureOverlay);
    var adresFinder = new geocoder( 'adres', kaart.map , kaart.featureOverlay );
    
});



},{"./geocoder.js":4,"./map.js":6,"./mapEvents.js":7,"./ui.js":10,"bowser":1}],6:[function(require,module,exports){

module.exports = function MapObj( mapID ){
    var styles = {
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
          attributions: [new ol.Attribution({ html: 
                   'Door <a href="mailto:kaywarrie@gmail.com">Kay Warie</a>, Basiskaart door: <a href="http://www.agiv.be/" target="_blank">AGIV</a>' }) ],
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
//             logo: null,
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

},{}],7:[function(require,module,exports){

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

},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){

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
},{}],10:[function(require,module,exports){
    
var od2olParser = require('./od2ol3parser.js')
var downloadEvent = require('./downloadEvent.js');

module.exports = function( map, vectorLayer, featureOverlay ){
    var downloadDlg = $( "#downloadDlg" ).dialog({ 
        autoOpen: false,
        height:340,
        width: 400,
        modal: true,
        buttons: {
            "Download Data": function() {
                downloadEvent( vectorLayer.getSource() ); 
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

      
}
},{"./downloadEvent.js":3,"./od2ol3parser.js":8}]},{},[5]);
