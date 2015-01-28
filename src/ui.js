
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