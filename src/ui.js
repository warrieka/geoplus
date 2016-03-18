var ol = require('openlayers');
var od2olParser = require('./od2ol3parser.js')
var downloadEvent = require('./downloadEvent.js');

module.exports = function( kaart ){
    var vectorLayer = kaart.vectorLayer;
    var featureOverlay = kaart.featureOverlay; 
	var vectorSource = new ol.source.Vector({projection: 'EPSG:31370'});
	var activeLayer ; 
    
    var dlg = $( "#info" ).dialog({autoOpen: false});
    
    var downloadDlg = $( "#downloadDlg" ).dialog({ 
        autoOpen: false,
        height:340, width: 400,
        modal: true,
        buttons: {
            "Download Data": function() {
                downloadEvent( vectorLayer.getSource(), activeLayer ); 
                $( this ).dialog( "close" );
            },
            "Cancel": function() {
                $( this ).dialog( "close" );
            }
       }     
    });
    var dataDlg = $( "#layerListDlg" ).dialog({ 
        autoOpen: false,
        height:420, width: 520,
        minHeight: 420, minWidth: 400,
        modal: false,
        buttons: {
            "Voeg Toe aan Kaart": function() {
				if( $( "#tabs" ).tabs('option', 'active') === 0 ){				
					var lst = document.getElementById("dataList");
					var url = lst.options[lst.selectedIndex].value;
					$.ajax({ url: url, dataType: 'json'}).done(function(resp) {
						var pages = resp.paging.pages 
						var features = od2olParser(resp.data);
						vectorLayer.setSource(vectorSource);
						vectorSource.clear(1);
						vectorSource.addFeatures(features);
						
						for ( var i = 2; i <= pages; ++i ){ 
							$.ajax({url: url +"?page="+ i , dataType: 'json'}).done(function(resp2) {
								var features = od2olParser(resp2.data);
								vectorSource.addFeatures(features);
							});
						}
					}); 
				}
				else {
					var lst = document.getElementById("gentDataList");
					var url = lst.options[lst.selectedIndex].value;
					var kml = new ol.source.Vector({ url: url,
							    format: new ol.format.KML({extractStyles: false, showPointNames: false}) });
					vectorLayer.setSource( kml );
				}

                $( this ).dialog( "close" );
            },
            "Cancel": function() {
                $( this ).dialog( "close" );
            }
        }   , 
		resize: function( event, ui ) {
			var antList = document.getElementById("dataList");
			var gentList = document.getElementById("gentDataList");
			var height = ui.size.height;
			antList.setAttribute("size", Math.round( height / 21 ) -10 );
			gentList.setAttribute("size", Math.round( height / 21 ) -10 );
		}
	});
    $( "#tabs" ).tabs();
    $( "#toolbar" ).tooltip();
    $( "#dataListBtn").button().click(function(){dataDlg.dialog("open"); }) ;
    $( "#saveBtn" ).button();
    $( "#saveOpenBtn" ).button();
    $( "#basemapSwitch").buttonset();
	
	//get Antwerpen
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
    //get Gent
	$.ajax({ url: "gent.json" })
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
                $( "#gentDataList" ).append($("<option></option>")
                      .attr("data-url", url.replace(".kml","") )
                      .attr("data-info", info)
                      .attr("value", url).text(title));                                
            })         
        })
    .fail( function(ero) {
        console.log(ero);
        alert("Sorry. Server gaf fout, de lagen werden niet geladen.");
    });
    
    $('#dataList').change(function() {
            showlayerInfo("dataList", "layerInfo" );
         });
    $('#gentDataList').change(function() {
            showlayerInfo("gentDataList", "gentLayerInfo" );
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
    
    var showlayerInfo = function( srcID, targetID ){
         var lst = document.getElementById(srcID);
         activeLayer = lst.options[lst.selectedIndex].text;
         var laagInfo = $(lst.options[lst.selectedIndex]).attr( "data-info" );
         var laagUrl =  $(lst.options[lst.selectedIndex]).attr( "data-url" );
         var msg = "<h2>" + activeLayer.replace("/",": ") + "</h2>"
             msg += "<p>"+ laagInfo +"</p><a target='_blank' href='"+ laagUrl +"'>Meer Info</a>";
         $("#"+targetID ).html(msg);
    }      
}