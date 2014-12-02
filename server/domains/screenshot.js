var vError      = require('verror');
var fs          = require('fs-extra');

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

        fs.writeFile('data/screenshots/xyz.png', base64, {enc: 'utf8'}, function (err) {
            if (err) { return next(err); }
            next(null, {
                file: 'data/screenshots/xyz.png',
                date: new Date(),
                title: 'A great screenshot'
            });
        });

    }
};
