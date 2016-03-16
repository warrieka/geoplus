var cheerio = require('cheerio');
var request = require("request");
var sync = require('sync-request');
var fs = require('fs');
var baseUri= "http://opendata.antwerpen.be";
var maxCount = 33;
var urls = [];
var requestCounter = 0;

var getPage = function(page) {
    request.get( baseUri + "/datasets-faceted?page=" + page, function (err, res, body) {
    if (!err) { 
        var $ = cheerio.load(body);  
        $('li.library-item').each(function(iter, elem) 
          {              
             var title = $(elem).find('a').text();
             var url = baseUri + $(elem).find('a').attr('href');
             var info =  $(elem).find('p').text();

             var res = sync('GET', url, {});
             var $$ = cheerio.load(res.getBody('utf8'));
              $$('li.datatank-source').each(function(iter, i) {
                   var ds = $$(i).find('a.kml').attr('href');
                   if( ds != null && ds.indexOf( "/v4/" ) > -1){
                      urls.push({title: title, info: info, url: url, ds: ds.replace(".kml", "") })
                   }
               });

          })
          requestCounter--;
          if( requestCounter == 0 ){
              fs.writeFile("public/antw.json", JSON.stringify(urls) )
          } 
      }
      else { console.log(err) }
  });  
}

for(i=0; i <= maxCount ; i++ ){
  requestCounter++;
  getPage(i);
}
