(function() {
  var oddSocket = {
    _onCallbacks: [],
    on: function() {
      var args = Array.prototype.slice.call(arguments);
      this._onCallbacks.push(args);
    },
    setConnection: function(connection) {
      this._onCallbacks.forEach(function(args) {
        console.log('setting too early callback', args);
        connection.on.apply(connection, args);
      });
      return connection;
    }
  };

  onLoad = function(io) {
    var connection = io.connect('//'+document.location.hostname+':9999');
    return oddSocket.setConnection(connection);
  };

  if (typeof define === "function" && define.amd) {
    define(['//'+document.location.hostname+':9999/socket.io/socket.io.js'], function(io) {
      return onLoad(io);
    });
  } else {
    var s = document.createElement('script')
    var onLoad;

    s.type = 'text/javascript'
    s.onload = function() {
      window.oddSocket = onLoad(io);
    };
    s.src = '//'+document.location.hostname+':9999/socket.io/socket.io.js';
    var appendTo = ( document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0] )
    appendTo.appendChild( s );
  }
})();
