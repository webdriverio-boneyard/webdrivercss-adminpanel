var vError      = require('verror');
var fs          = require('fs-extra');
var async       = require('async');
var path        = require('path');

module.exports = {

    find: function (filter) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            filter = {};
        }

        next(null, {
                file: 'data/screenshots/xyz.png',
                date: new Date(),
                title: 'A great screenshot'
            });

    },

    findAll: function (filter) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            filter = {};
        }

        next(null, [{
                file: 'data/screenshots/xyz.png',
                date: new Date(),
                title: 'A great screenshot'
            }]);

    },

    create: function (base64, metadata) {

        var next = arguments[arguments.length - 1];

        if (arguments.length <= 2) {
            metadata = {};
        }

        if (arguments.length === 1) {
            return next(new vError('You must provide a base64 image to Screenshot.create'));
        }

        var dataDir = path.join('data', 'screenshots');

        async.waterfall([

                function ensureDirExists(cb) {
                    fs.mkdirs(dataDir, function (err) {
                        cb(err);
                    });
                },

                function generateUniqueId(cb) {
                    cb(null, 'xyz');
                },

                function saveFile(uuid, cb) {
                    var filename = path.join(dataDir, uuid + '.png');

                    fs.writeFile(filename, base64, {enc: 'utf8'}, function (err) {
                        if (err) { return cb(err); }
                        cb(null, {
                            file: filename,
                            date: new Date(),
                            title: metadata.title || 'no title'
                        });
                    });

                }

            ], function (err, screenshot) {

                if (err) { return next(new vError(err, 'Screenshot.create')); }

                next(null, screenshot);

            });

    }
};
