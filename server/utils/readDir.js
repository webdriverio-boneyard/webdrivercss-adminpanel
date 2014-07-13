'use strict';

/**
 * https://gist.github.com/DelvarWorld/825583
 */

var fs = require('fs'),
    path = require('path'),
    listDirectory;

/**
 * get image repository information
 * @param  {String}   start    root path
 * @param  {Function} callback to return result
 */
module.exports = function (start, callback) {

    var processed = 0,
        projectCnt = 0,
        files = {
            gz: [],
            repositories: {}
        };

    // Use lstat to resolve symlink if we are passed a symlink
    fs.lstat(start, function(err, stat) {

        if(err) {
            return callback(err);
        }

        if(stat.isDirectory()) {

            listDirectory(start, function(err,structure) {

                if(structure.directories.length === 0) {
                    callback(null, {
                        repositories: []
                    });
                }

                structure.files = structure.files.filter(function(file) {
                    if(file[0] === '.') {
                        return false;
                    }

                    return true;
                });

                files.gz = structure.files;
                projectCnt = structure.directories.length;
                structure.directories.forEach(function(dir) {

                    files.repositories[dir] = {
                        images: [],
                        diffs: []
                    };

                    // get project directory
                    listDirectory(path.join(start,dir), function(err,structure) {

                        // save regression images
                        files.repositories[dir].images = structure.files;

                        // get diffs
                        listDirectory(path.join(start,dir,'diff'), function(err,structure) {

                            files.repositories[dir].diffs = structure.files;

                            if(++processed === projectCnt) {
                                callback(null,files);
                            }
                        });

                    });
                });
            });

        } else {
            return callback(new Error('path: ' + start + ' is not a directory'));
        }
    });
};

listDirectory = function (start, cb) {

    var processed = 0,
        ret = {
        files: [],
        directories: []
    };

    fs.readdir(start, function(err, files) {

        if(err) {
            return cb(err);
        }

        if(files.length === 0) {
            cb(null,ret);
        }

        files.forEach(function(file) {

            var abspath = path.join(start,file);
            fs.stat(abspath,function(err,stat) {

                if(err) {
                    return cb(err);
                }

                if(stat.isDirectory()) {
                    ret.directories.push(file);
                } else {
                    ret.files.push(file);
                }

                if(++processed === files.length) {
                    cb(null,ret);
                }

            });
        });
    });
};
