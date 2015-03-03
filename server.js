var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var basicAuth = require('node-basicauth');

app.use(basicAuth({ "cha-ching" : process.env.PASSWORD }));
app.use(express.static(__dirname));
app.use(bodyParser.json());

app.post('/stripe-webhook', function(request, response){
  if (request.body.type === 'charge.succeeded') {
    io.emit('chargeSucceeded', request.body.data.object);
  }
  if (request.body.type === 'charge.failed') {
    io.emit('chargeFailed', request.body.data.object);
  }
  if (request.body.type === 'charge.refunded') {
    io.emit('chargeRefunded', request.body.data.object);
  }
  response.send('OK');
});

app.post('/heroku-webhook', function(request, response){
  io.emit('trainLeaving', "Choo Choo");
  response.send('OK');
});

io.on('connection', function (socket) {
  console.log("Connected!");
});

server.listen(process.env.PORT || 8080);