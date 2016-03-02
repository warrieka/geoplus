
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
    
    var geolocation = new ol.Geolocation({
        projection: 'EPSG:31370',
        tracking: true
    });
    
    var positionPt = new ol.Feature();

    geolocation.on('change', function(evt) {
             var pt = new ol.geom.Point(geolocation.getPosition());
             positionPt.setGeometry( pt );   
        });
      
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

   this.lufo = new ol.layer.Tile({
        extent: projectionExtent,
        visible: false,
        source: new ol.source.WMTS({
          attributions: [new ol.Attribution({ html:
                   'Door <a href="mailto:kaywarrie@gmail.com">Kay Warie</a>, Basiskaart door: <a href="http://www.agiv.be/" target="_blank">AGIV</a>' }) ],
          url: 'http://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts/',
          layer: 'omwrgbmrvl',
          style: '',
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

    this.basiskaart = new ol.layer.Tile({
        extent: projectionExtent,
        source: new ol.source.WMTS({
          attributions: [new ol.Attribution({ html: 
                   'Door <a href="mailto:kaywarrie@gmail.com">Kay Warie</a>, Basiskaart door: <a href="http://www.agiv.be/" target="_blank">AGIV</a>' }) ],
          url: 'http://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts/',
          layer: 'grb_bsk_grijs',
          matrixSet: 'BPL72VL',
          style: '',
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
            layers: [ this.basiskaart, this.lufo, this.vectorLayer],
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
        features: [positionPt],
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
