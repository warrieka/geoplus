
var express = require('express');
var request = require("request");
var fs = require('fs');
var cheerio = require('cheerio');

var app = express();
/*CORS*/
app.use( function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
/*handle static*/
app.use(express.static(__dirname + '/public'));
/*redirects*/
app.get('/', function(req, res){ 
  if( req.originalUrl == '/' ){ 
      res.redirect('/index.html');
      return; }
});

app.get('/getresource', function(req, res){
  var pageUrl = req.query.url;
  if( pageUrl == undefined ){
          res.status(404);
          res.send({ error: 'verplichte url parameter ontbreekt' });
          return; }
          
  request.get( pageUrl , function (err, resp, body) {    
        var $ = cheerio.load(body);  
        var haskml = false; 
        var kml = $('.kml').attr('href');
        if( kml ){
           haskml = true;
        }
        res.send( {hasklm: haskml, kml: kml} );  
  });
});

app.get('/od2geojson', function(req, res){
  var pageUrl = req.query.url;
  
  if( pageUrl == undefined ){
          res.status(404).send({ error: 'verplichte url parameter ontbreekt' });
          return; }
  if( req.query.download ){
      res.header("Content-Disposition", 'attachment; filename="geo.json"');
  }
          
  request.get({url: pageUrl, json: true }, function (err, resp, body) {    
     var geojson = { type: "FeatureCollection", "features": [] };
     var pageJson, pageNrs, features;
     
     
     if( !(body.paging && body.data) ){
          res.status(500).send({error: "kan JSON niet parseren", body: body});
          return;
        }      
     pageJson = body.data;
     pageNrs  = body.paging.pages ;
     try {
        features =  mapGeojson( pageJson );  
        geojson.features= geojson.features.concat(features);   
     }
     catch (er){
          res.status(500).send({error: er , body: pageJson});
          return;
     }
     if( pageNrs > 1 ){
         var requestCounter = 0;
         var ero;
         for ( var i = 2; i <= pageNrs; ++i ){ 
             requestCounter ++;
             request.get({url: pageUrl +"?page="+ i , json: true }, function (err, resp, body) { 
                requestCounter--;
                try {
                    geojson.features= geojson.features.concat( mapGeojson( body.data ));  
                    }
                catch (er){
                    ero = er;
                    }
                if( requestCounter == 0 && ero ) {
                     res.status(500).send({error: ero +" op pagina " + i , body: pageJson});
                    }
                else if (requestCounter == 0 ){
                     res.send( geojson );  
                    }     
            });
         }
     }
     else {res.send( geojson ) }     
    });
});
/*helpers*/
function mapGeojson(pageJson){
    var seed = [];  
    
    for ( var i = 0; i < pageJson.length; ++i ){
        item = pageJson[i];
        var feature =  { "type": "Feature" }
        var geometry = {};
        
        if( item.point_lat && item.point_lng ) {
            geometry.type = "Point";
            geometry.coordinates = [ parseFloat(item.point_lng), parseFloat(item.point_lat)];
            delete item.point_lng;
            delete item.point_lat;
            }
        else if( item.geometry ) {
            try {
                geometry = JSON.parse( item.geometry );
            }
            catch(err) {
                throw  "Kan JSON niet parseren";
            }
            delete item.geometry;
        }
        else { 
            throw 'Niet alle records geografisch'; 
        }  
        feature.geometry = geometry;
        feature.properties = item;
        seed.push( feature );
    }  
    return seed;
}

/*Error handling*/
app.use(function(req, res, next){
  res.status(404);
  res.send({ error: 'Bron niet gevonden' });
});
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Er liep iets fout!');
});

/*start the server*/
var server = app.listen(process.env.PORT || 3000, '127.0.0.1', function () {
  var host = server.address().address
  var port = server.address().port

  console.log('app listening at http://%s:%s', host, port)
});