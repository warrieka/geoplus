var cheerio = require('cheerio');
var request = require("request");
var fs = require('fs');

var getGent = function() {
    var urls = [];
    var requestCounter = 0;
    var page = {
      url: "http://datatank.stad.gent/4/",
      headers: {'Accept': 'text/html'}
    }
    request.get( page, function (err, res, body) {
        var $ = cheerio.load(body);  
     
        $('div.dataset').each(function(iter, elem) {          
            var url = $(elem).data('href') + ".kml" ;
            var title = $(elem).find('h4').text().trim();
            var info =  $(elem).find('div.dataset-description').text().trim();

            if (  $(elem).find('i.fa-code').length  ){
                urls.push({title: title, info: info, url: url });
            }
            
            fs.writeFile("public/gent.json", JSON.stringify(urls) )
        });
  });  
}

getGent();



