    
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