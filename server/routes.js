'use strict';

var api = require('./controllers/api'),
    index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {

    // Server API Routes
    app.route('/api/repositories').get(api.getDirectoryList);
    app.route('/api/repositories/:file').get(api.downloadRepository);
    app.route('/api/repositories/:project/:file').get(api.getImage);
    app.route('/api/repositories/:project/diff/:diff').get(api.getImage);
    app.route('/api/repositories/confirm').post(api.acceptDiff);
    app.route('/api/repositories/*').post(api.syncImages);

    // All undefined api routes should return a 404
    app.route('/api/*').get(function(req, res) {
        res.send(404);
    });

    // All other routes to use Angular routing in app/scripts/app.js
    app.route('/partials/*').get(index.partials);
    app.get('/directives/*', index.directives);

    app.route('/*').get(index.index);

};
