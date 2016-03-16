    
var od2olParser = require('./od2ol3parser.js')
var downloadEvent = require('./downloadEvent.js');

module.exports = function( kaart ){
    var vectorLayer = kaart.vectorLayer;
    var featureOverlay = kaart.featureOverlay; 
    
    var dlg = $( "#info" ).dialog({ autoOpen: false });
    
    var downloadDlg = $( "#downloadDlg" ).dialog({ 
        autoOpen: false,
        height:340, width: 400,
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
    var dataDlg = $( "#layerListDlg" ).dialog({ 
        autoOpen: false,
        height:420, width: 400,
        minHeight: 420, minWidth: 480,
        modal: false,
        buttons: {
            "Voeg Toe aan Kaart": function() {
                var lst = document.getElementById("dataList");
                var url = lst.options[lst.selectedIndex].value;
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
                $( this ).dialog( "close" );
            },
            "Cancel": function() {
                $( this ).dialog( "close" );
            }
       }   
   });
    
    $( "#toolbar" ).tooltip();
    $( "#dataListBtn").button().click(function(){dataDlg.dialog( "open" ); }) ;
    $( "#saveBtn" ).button();
    $( "#saveOpenBtn" ).button();
    $( "#basemapSwitch").buttonset();

    $.ajax({ url: "antw.json" })
    .done( function(resp)  {
            resp.sort(function(a, b) {
                    var textA = a.title.toUpperCase();
                    var textB = b.title.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
            $.each(resp , function(i, elem)
            {
                var title = $("<div/>").html(elem.title).text() ;
                var ds = elem.ds;
                var info = elem.info;
                var url = elem.url;
                $( "#dataList" ).append($("<option></option>")
                      .attr("data-url", url)
                      .attr("data-info", info)
                      .attr("value", ds).text(title));                                
            })         
        })
    .fail( function(ero) {
        console.log(ero);
        alert("Sorry. Server gaf fout, de lagen werden niet geladen.");
    });
    
    $('#dataList').change(function() {
            var pageUrl =  this.options[this.selectedIndex].value;
            displayData(pageUrl + ".json");
            });

    $( "#saveOpenBtn" ).click(function(){
        if(!(vectorLayer.getSource() && vectorLayer.getSource().getFeatures().length) ){ 
            alert("Er is geen data om te downloaden")
            return; } 
         downloadDlg.dialog( "open" );   
    });
    
    $("#lufo").click( function(){
            kaart.lufo.setVisible( this.checked );
            kaart.basiskaart.setVisible( !this.checked );
    });
    $("#basiskaart").click( function(){
            kaart.basiskaart.setVisible( this.checked );
            kaart.lufo.setVisible( !this.checked );
    });
    
    /*event handlers*/        
    var vectorSource = new ol.source.Vector({projection: 'EPSG:31370'});
    vectorLayer.setSource(vectorSource); 
    
    var displayData = function( url ) { 
        showlayerInfo();    
    }

    var showlayerInfo = function(){
         var lst = document.getElementById("dataList");
         var laagName = lst.options[lst.selectedIndex].text;
         var laagInfo = $(lst.options[lst.selectedIndex]).attr( "data-info" );
         var laagUrl =  $(lst.options[lst.selectedIndex]).attr( "data-url" );
         var msg = "<h2>" + laagName + "</h2>"
             msg += "<p>"+ laagInfo +"</p><a target='_blank' href='"+ laagUrl +"'>Meer Info</a>";
         $("#layerInfo").html(msg);
    }      
}