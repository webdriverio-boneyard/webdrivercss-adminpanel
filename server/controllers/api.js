'use strict';

/**
 * Using Rails-like standard naming convention for endpoints.
 * GET   /api/repositories                     ->  getDirectoryList
 * GET   /api/repositories/:file               ->  downloadRepository
 * GET   /api/repositories/:project/:file      ->  getImage
 * GET   /api/repositories/:project/diff/:diff ->  getImage
 * POST  /api/repositories/confirm             ->  acceptDiff
 * POST  /api/repositories/*                   ->  syncImages
 */

var fs = require('fs-extra'),
    path = require('path'),
    glob = require('glob'),
    targz = require('tar.gz'),
    async = require('async'),
    readDir = require('../utils/readDir'),
    config = require('../config/config');

exports.syncImages = function(req, res) {

    if (!req.files) {
        return res.send(500);
    }

    fs.readFile(req.files.gz.path, function(err, data) {
        var newPath = path.join(config.imageRepo, req.files.gz.name);

        fs.remove(newPath.replace(/\.tar\.gz/, ''), function(err) {
            if (err) {
                throw err;
            }

            fs.writeFile(newPath, data, function(err) {
                if (err) {
                    throw (err);
                }

                new targz().extract(newPath, config.imageRepo);
                res.send(200);
            });

        });
    });

};

exports.getDirectoryList = function(req, res) {

    readDir(config.imageRepo, function(err, list) {
        if (err) {
            throw err;
        }

        res.send(list);
    });

};

exports.getImage = function(req, res) {

    var processed = 0,
        filepath;

    /**
     * read directory to check if hash matches given files
     */
    fs.readdir(config.imageRepo, function(err, files) {

        if (err || files.length === 0) {
            return res.send(404);
        }

        files.forEach(function(file) {

            /**
             * continue if hash doesnt match url param
             */
            if (file !== req.params.project) {

                /**
                 * return 404 after all directories were checked
                 */
                if (++processed === files.length) {
                    return res.send(404);
                }

                return true;
            }

            /**
             * directory was found
             * generate file path
             */
            if (req.params.file) {
                filepath = path.join(config.imageRepo, file, req.params.file);
            } else {
                filepath = path.join(config.imageRepo, file, 'diff', req.params.diff);
            }

            /**
             * check if requested file exists
             * return 404 if file doesn't exist otherwise send file content
             */
            res.sendfile(filepath, {}, function(err) {
                if (err) {
                    return res.send(404);
                }
            });

        });

    });

};

exports.downloadRepository = function(req, res) {

    var file = req.params.file,
        project = file.replace(/\.tar\.gz/, ''),
        tmpPath = path.join(__dirname, '..', '..', '.tmp', 'webdrivercss-adminpanel' , project),
        tarPath = tmpPath + '.tar.gz',
        projectPath = path.join(config.imageRepo, project);

    /**
     * create tmp directory and create tarball to download on the fly
     */
    async.waterfall([
        /**
         * check if project exists
         */
        function(done) {
            return fs.exists(projectPath, done.bind(this, null));
        },
        /**
         * make tmp dir
         */
        function(isExisting, done) {
            if (!isExisting) {
                return res.send(404);
            }

            return glob(projectPath + '/**/*.baseline.png', done);
        },
        /**
         * copy these files
         */
        function(files, done) {
            return async.map(files, function(file, cb) {
                return fs.copy(file, file.replace(projectPath, tmpPath), cb);
            }, done);
        },
        /**
         * create diff directory (webdrivercss breaks otherwise)
         */
        function(res, done) {
            return fs.ensureDir(tmpPath + '/diff', done);
        },
        /**
         * zip cleared
         */
        function(res, done) {
            return new targz().compress(tmpPath, tarPath, done);
        }
    ], function(err) {

        if (err) {
            return res.send(500);
        }

        res.sendfile(tarPath);

        /**
         * delete tmp directory
         */
        fs.remove(path.join(tmpPath, '..'));

    });

};

exports.acceptDiff = function(req, res) {

    var newFile = req.body.file,
        currentFile = newFile.replace('.new.png', '.baseline.png'),
        diffFile = newFile.replace('.new.png', '.diff.png'),
        project = null,
        processed = 0;

    /**
     * read directory to check if hash matches given files
     */
    async.waterfall([
        /**
         * get uploads dir filestructure
         */
        function(done) {
            return fs.readdir(config.imageRepo, done);
        },
        /**
         * iterate through all files
         */
        function(files, done) {

            if (files.length === 0) {
                return done(404);
            }

            return files.forEach(function(file) {
                return done(null, files, file);
            });
        },
        /**
         * check if directory matches with given hash and overwrite new file with current file
         */
        function(files, file, done) {

            /**
             * continue if hash doesnt match url param
             */
            if (file !== req.body.project) {

                /**
                 * return 404 after all directories were checked
                 */
                if (++processed === files.length) {
                    return done(403);
                }

                return true;
            }

            project = file;

            var source = path.join(config.imageRepo, project, newFile),
                dest = path.join(config.imageRepo, project, currentFile);

            return fs.copy(source, dest, done);

        },
        /**
         * remove obsolete new.png file
         */
        function(done) {
            return fs.remove(path.join(config.imageRepo, project, newFile), done);
        },
        /**
         * remove diff file
         */
        function(done) {
            return fs.remove(path.join(config.imageRepo, project, 'diff', diffFile), done);
        }
    ], function(err) {

        if (err) {
            return res.send(err);
        }

        res.send(200);

    });

};
