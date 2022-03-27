// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function(req, res) {
  res.json({ greeting: 'hello API' });
});

//时间戳API端点
app.get('/api', (req, res) => { res.json({ unix: Date.now(), utc: new Date() }) });

app.get('/api/:date', (req, res) => {
  if (/^(0|[1-9]\d*)$/.test(req.params.date)) { res.json({ unix: Number(req.params.date), utc: new Date(Number(req.params.date)).toUTCString() }) }
  else if (!isNaN(Date.parse(req.params.date))) { res.json({ unix: Date.parse(req.params.date), utc: new Date(req.params.date).toUTCString() }); }
  else { res.json({ error: 'Invalid Date' }); }
})


// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
