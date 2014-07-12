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
app.listen(config.port, config.ip, function() {
    console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
