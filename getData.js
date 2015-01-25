var cheerio = require('cheerio');
var request = require("request");
var fs = require('fs');
var baseUri= "http://opendata.antwerpen.be";
var maxCount = 30;
var urls = [];
var requestCounter = 0;

var getPage = function(page) {
    request.get( baseUri + "/datasets-faceted?page=" + page, function (err, res, body) {
    if (!err) { 
        var $ = cheerio.load(body);  
        $('li.library-item').each(function(iter, elem) 
          {              
             title = $(elem).find('a').html();
             url = baseUri + $(elem).find('a').attr('href') ; 
             urls.push({title: title, url: url })            
          })
          requestCounter--;
          if( requestCounter == 0 ){
              fs.writeFile("public/index.json", JSON.stringify(urls) )
          } 
      }
      else { console.log(err) }
  });  
}

for(i=0; i <= maxCount ; i++ ){ 
  requestCounter++;  
  getPage(i);
}
