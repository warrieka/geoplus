
function Map( mapID ){
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
            layers: [ this.basiskaart, this.vectorLayer ],
            view: new ol.View({
                projection: 'EPSG:31370',
                center: [152223, 213544],
                extent: projectionExtent,              
                zoom: 4,
                maxZoom: 16
            })
        });

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
