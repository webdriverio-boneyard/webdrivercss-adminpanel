'use strict';

var express = require('express');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./server/config/config');

// Setup Express
var app = express();
require('./server/config/express')(app);
require('./server/routes')(app);

// Start server
var server = app.listen(config.port, config.ip, function() {
    console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

process.on('SIGINT', function () {
  // Make ^C work nicely in docker containers.
  // Close gracefully, and when done shut down.

  // Print a new line so that the "^C" that bash prints is on its own line.
  console.log("");
  server.close(function () {
    process.exit(0);
  });
});
//Set the idle timeout on any new connection
server.addListener("connection",function(stream) {
    stream.setTimeout(4000);
});

// Expose app
exports = module.exports = app;
