var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , port = '9999'
  , fs = require('fs')
  , exec = require('child_process').exec
  ;
  
server.listen(port)

statics = [
  ['', 'index.html'],
  'socks.js',
  ['remote','remote.html'],
  'jquery.min.js',
  'jquerymob.js',
  'zepto.js',
  'font-awesome.css',
  'font/fontawesome-webfont.eot',
  'font/fontawesome-webfont.svg',
  'font/fontawesome-webfont.ttf',
  'font/fontawesome-webfont.woff',
  'remote.css'
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

var myIp = function() {
  var os = require('os');
  var ifaces = os.networkInterfaces();
  
  var ips = [];
  for (var device in ifaces) {
    ifaces[device].forEach(function(details) {
      if (details.family == 'IPv4' && details.address != '127.0.0.1') {
        ips.push(details.address);
      }
    });
  }
  return ips;
};

var getApps = function() {
  var appsDir = process.env.HOME+'/remotes'
  var files = fs.readdirSync(appsDir);
  files = files.filter(function(f) {
    return !fs.statSync(appsDir+'/'+f).isDirectory();
  });
  files = files.map(function(f) {
    return f.split('.')[0];
  });
  return files;
};

app.get('/apps', function(req, res) {
  res.send(getApps());
});

app.get('/app', function(req, res) {
  var file = process.env.HOME+'/remotes/'+req.query['app']+'.json';
  delete require.cache[file];
  var config = require(file);
  res.send(config);
});

var appExec = function(app, command) {
  console.log(app, command);
  var config = require(process.env.HOME+'/remotes/'+app+'.json');

  if (!config.commands) {
    exec("osascript -e 'tell application \""+config.app+"\" to "+command+"'")
  } else {
    var cmd = config.commands[command];
    cmd = cmd.replace(/^~/, process.env.HOME);
    exec(config.commands[command])
  }
};


io.sockets.on('connection', function (socket) {
  socket.emit('welcome', {
    ip: myIp()[0],
    port: port
  });

  socket.on('remote', function (data) {
    if (data.app == 'browser') {
      socket.broadcast.emit('remote', data);
    } else {
      appExec(data.app, data.event);
    }
  });
});
