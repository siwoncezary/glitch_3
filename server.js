// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var baseUrl = process.env.BASE_URI;
var colName = 'short_urls';
var newUrl = process.env.APP_URL;

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

//
app.get("/new/*", function(req, response){
  var ourl = req.path.replace("/new/","");
  mongo.connect(baseUrl, function(err, db){
    if (err) {
      response.send("Failed connection to database!");
    }
    getNextSequence(db, ourl, response, insertUrl);
  });
});
  
app.get("/:shorturl", function(req,res){
  var shortUrl = req.params.shorturl;
  console.log("short url="+shortUrl);
  mongo.connect(baseUrl, function(err, db){
    if (err) 
      throw err;
    db.collection(colName).find({short_url: shortUrl}, {original_url:1}).toArray(function (err, data){
       if (err){
         console.log(err);
         return;
       }
       if (data.length === 0)
         res.send({"error":"This url is not on the database."});
       else {
         console.log(data);
         res.redirect(data[0].original_url);
         db.close();
       }
       });
    });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

function getNextSequence(db, original_url, response, callback){
    if (!isValidUrl(original_url)){
        response.send("No valid url, cant make shortcut!!!");
        return;
    }
    db.collection(colName).find({"original_url": original_url}).toArray(function(err, data){
      if (data.length === 0){
          db.collection("counters").findAndModify(
            {name: "site_counter"},
            [],
            {$inc: { count: 1 }}, 
            {new: true},
            function(err, data){
              if (err){
                console.log("ERROR SEQUENCE = "+err);
                return;
              }
              callback(db, original_url, ""+data.value.count, response);
          });
      } else {
        response.send({"original_url": data[0].original_url, "short_url": newUrl + data[0].short_url});  
      }
    });
    
}

function insertUrl(db, original_url, short_url, response){
  var item = {"original_url": original_url, "short_url": short_url};
  db.collection(colName).save(item, function(err, element){
        if (err){
          console.log(err);
          return;
        }
        console.log(element.ops);
        response.send({'original_url':element.ops[0].original_url, 'short_url': newUrl+element.ops[0].short_url});
        db.close();
  });
}

function isValidUrl(url){
  //Regex from https://gist.github.com/dperini/729294
  var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return regex.test(url);
}