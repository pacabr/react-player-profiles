var express = require('express');
var path = require('path');
var app = express();


// Define the port to run on
app.set('port', 3000);

app.use(express.static(path.join(__dirname, '/public')));

app.get('/*', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

// Listen for requests
var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('Magic happens on port ' + port);
});


