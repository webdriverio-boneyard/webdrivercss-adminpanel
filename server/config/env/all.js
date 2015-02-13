'use strict';

var path = require('path');

var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
    root: rootPath,
    ip: '0.0.0.0',
    imageRepo: process.env.IMAGE_REPO || path.join(__dirname, '..', '..', '..', 'repositories'),
    port: process.env.PORT || 9000,
    mongo: {
        options: {
            db: {
                safe: true
            }
        }
    }
};
