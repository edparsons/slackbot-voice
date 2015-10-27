var express = require('express');
var app = express();
var requester = require('request');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var basicAuth = require('node-basicauth');
var password;
if (process.env.PASSWORD) {
  password = process.env.PASSWORD;
} else {
  password = "test";
}

app.use(basicAuth({ "cha-ching" : password }));
app.use(express.static(__dirname));
app.use(bodyParser.json({limit: '50mb'}));

app.post('/stripe-webhook', function(request, response){
  if (request.body.type === 'charge.succeeded') {
    io.emit('chargeSucceeded', request.body.data.object);
  }
  if (request.body.type === 'charge.failed' || request.body.type === 'charge.refunded') {
    io.emit('chargeFailed', request.body.data.object);
  }
  response.send('OK');
});

app.get('/volume', function(request, response){
  var volume = decodeURIComponent(request.query.text);
  if (request.query.text === "refresh") {
    io.emit('refresh', volume);
  } else {
    io.emit('volume', volume);
  }  
  response.send('Volume set to ' + volume);
});

app.get('/payment', function(request, response){
  io.emit('chargeSucceeded', "Cha-ching!");
  response.send('OK');
});

app.get('/denied', function(request, response){
  io.emit('chargeFailed', "Denied!");
  response.send('OK');
});

app.get('/choo-choo', function(request, response){
  io.emit('trainDone', "Choo-choo!");
  response.send('OK');
});

app.get('/applause', function(request, response){
  io.emit('applause', "Yay!");
  response.send('OK');
});

app.get('/crashed', function(request, response){
  io.emit('trainCrashed', "Crashed!");
  response.send('OK');
});

app.post('/circle-webhook', function(request, response){
  if (request.body.payload.branch === "master") {
    if (request.body.payload.outcome === "success") {
      io.emit('trainDone', "Choo Choo");
    } else {
      io.emit('trainCrashed', "Choo Choo");
    }
  } else if (request.body.payload.branch === "develop") {
    if (request.body.payload.outcome != "success") {
      io.emit('trainCrashed', "Choo Choo");
    }
  }

  response.send('OK');
});

app.post('/deploy', function(request, response){
  io.emit('deploy', "New Deploy");
  response.send('OK');
});

app.post('/downtime', function(request, response){
  io.emit('downtime', request.query.env);
  response.send('OK');
});

app.get('/downtime', function(request, response){
  io.emit('downtime', request.query.env);
  response.send('OK');
});

app.get('/refresh', function(request, response){
  io.emit('refresh', "Refreshed!");
  response.send('OK');
});

app.get('/ten', function(request, response){
  io.emit('ten', "I give it a ten!");
  response.send('OK');
});

app.get('/live-chat', function(request, response){
  io.emit('liveChat', "Live chat needs attention!");
  response.send('OK');
});

app.get('/any-url', function(request, response){
  console.log(request.query);
  var url;
  
  if (request.query.text) {
    url = request.query.text;
  } else {
    url = request.query.url;
  }

  if (url === "applause") {
    io.emit('applause', "Yay!");
  } else if (url === "cha-ching" || url === "payment" || url === "cha ching") {
    io.emit('chargeSucceeded', "Cha-ching!");
  } else if (url === "rim-shot" || url === "rim shot" || url === "joke") {
    io.emit('rimShot', "bad joke");
  } else if (url === "choo-choo" || url === "choo choo" || url === "train") {
    io.emit('trainDone', "choo choo");
  } else if (url === "crash") {
    io.emit('trainCrashed', "crash");
  } else if (url === "denied") {
    io.emit('chargeFailed', "Denied");
  } else {
    io.emit('anyURL', url);
  }
  
  response.send(url);
});

app.get('/speak', function(request, response){
  console.log(request.query);
  var text = request.query.text.split("|")[0];
  var voice_split = request.query.text.split("|")[1];
  var voice = request.query.voice;  
  if (!voice) { voice = voice_split; }
  if (!voice) { voice = "US English Female"; }
  io.emit('speak', text, voice);
  response.send(request.query.text);
});

app.get('/spotify', function(request, response){
  requester({
    url: process.env.SPOTIFY_URL + '/' + request.query.text
  }, function (error, resp, body) {
    requester({
      url: process.env.SPOTIFY_URL + '/nowplaying'
    }, function (error, resp, body) {
      response.send('[' + response.query.text + '] Now Playing: ' + body);
    });
  });
});

io.on('connection', function (socket) {
  console.log("Connected!");
});

server.listen(process.env.PORT || 8080);