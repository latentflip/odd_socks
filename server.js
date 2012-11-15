var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

server.listen('9999')

statics = [
  'socks.js',
  ['remote','remote.html'],
  'jquery.min.js'
];

statics.forEach(function(p) { 
  var path, url;
  if (p.toString() === p) {
    path = url = '/'+p;
  } else {
    url = '/'+p[0];
    path = '/'+p[1];
  }
  app.get(url, function(req, res) {
    res.sendfile(__dirname + path);
  });
});


io.sockets.on('connection', function (socket) {
  socket.on('remote', function (data) {
    console.log('remote', data);
    socket.broadcast.emit('remote', data);
  });
});
