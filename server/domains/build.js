var vError      = require('verror');
var async       = require('async');
var _           = require('lodash');
var group       = require('./testGroup');

var Statuses    = require('./statuses');

// Save a build
//
// This is a placeholder method for further model inegration.
function saveBuild(build, cb) {
    cb(null, build);
}

var Build = module.exports = {
    // find: retrieve a single Build, accept filters
    find: function(filter) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            filter = {};
        }

        next(null, {
                title: 'A great Build',
                capabilities: {browserName: 'firefox'},
                status: Statuses.NOT_STARTED
            });

    },
    // findAll: retrieve a list of Build, accept filters
    findAll: function(filter) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            filter = {};
        }

        next(null, [{
                title: 'A great Build',
                capabilities: {browserName: 'firefox'},
                status: Statuses.NOT_STARTED
            }]);

    },
    // findGroups: fetch all groups objects for provided Build, accept filters.
    findGroups: function (build, filter) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 2) {
            filter = {};
        }

        if (arguments.length < 2) {
            return next(new vError('Build.findGroups takes 2 parameters, the build and optionaly a filter'));
        }

        group.findAll({
                build_id: build.id
            },
            function (err, groupList) {

                if (err) { return next(new vError(err, 'Build.fetchGroup')); }

                next(null, groupList);

            });

    },
    // create: create a Build from metadata
    create: function(metadata) {

        var next = arguments[arguments.length - 1];

        if (arguments.length < 3) {
            return next(new vError('Build.create takes 2 parameters, the Build and the build metadata'));
        }

        var build = {};

        build.status = Statuses.NOT_STARTED;
        build.groups = [];

        build.title = metadata.title || 'Unknown Build';

        next(null, build);

    },
    // duplicate: duplicate former completed group build for a new build. All groups
    // have a NOT_STARTED status
    duplicate: function(formerBuild) {

        var next = arguments[arguments.length - 1];

        if (arguments.length < 3) {
            return next(new vError('Build.duplicate takes 2 parameters, the former build object and the Build'));
        }

        var metadata = {
            title: formerBuild.title
        };

        async.waterfall([

                Build.create.bind(null, metadata),

                saveBuild,

                function findFormerGroups(newBuild, cb) {

                    Build.findGroups(
                        formerBuild,
                        function doneFinedFormerGroups(err, formerGroupList) {

                            if (err) { return cb(new vError(err, 'findFormerGroups')); }

                            cb(null, formerGroupList, newBuild);

                        });

                },

                function replicateGroups(formerGroupList, newBuild, cb) {

                    async.each(formerGroupList, function (formerGroup, doneEach) {

                            group.duplicate(formerGroup, newBuild, doneEach);

                        }, function doneReplicateGroups(err) {

                            if (err) { return cb(new vError(err, 'replicateGroup')); }

                            cb(null, newBuild);

                        });

                }

            ], function (err, build) {

                if (err) { return next(new vError(err, 'Build.duplicate')); }

                next(null, build);

            });

    },
    // updateStatus: update group build status from associated Groups statuses
    //
    // A Build status is computed as follow:
    //
    // * if all Groups have the same status, this is the Build status
    // * if a Group is IN_PROGRESS or NOT_STARTED, the Build status is IN_PROGRESS
    // * if no Group is IN_PROGRESS and a Group NEEDS_ACTION, the Build
    //   status is NEEDS_ACTION
    // * if no group needs action or is in progress and one group is FAILED, the
    //   Build status is FAILED
    updateStatus: function(build) {

        var next = arguments[arguments.length - 1];

        if (arguments.length < 2) {
            return next(new vError('Build.updateStatus takes 1 parameter, the build object'));
        }

        async.waterfall([

                Build.findGroups.bind(null, build),

                function computeStatus(groupList, cb) {

                    var statuses = _.pluck(groupList, 'status');
                    statuses = _.uniq(statuses);

                    // if no group associated to build
                    // then nothing to do.
                    if (!statuses.length) {
                        return cb(null, build);
                    }

                    // If all groups have the same status
                    // use it as build status
                    if (statuses.length === 1) {
                        build.status = statuses[0];
                        return cb(null, build);
                    }

                    // If a group is IN_PROGRESS or NOT_STARTED
                    // then build is IN_PROGRESS
                    if (
                        _.contains(statuses, Statuses.IN_PROGRESS) ||
                        _.contains(statuses, Statuses.NOT_STARTED)
                    ) {
                        build.status = Statuses.IN_PROGRESS;
                        return cb(null, build);
                    }

                    // If a group is NEEDS_ACTION
                    // then build is NEEDS_ACTION
                    if (_.contains(statuses, Statuses.NEEDS_ACTION)) {
                        build.status = Statuses.NEEDS_ACTION;
                        return cb(null, build);
                    }

                    // If a group is FAILED
                    // then build is FAILED
                    if (_.contains(statuses, Statuses.FAILED)) {
                        build.status = Statuses.FAILED;
                        return cb(null, build);
                    }

                    // If a group is ABORTED
                    // then build is ABORTED
                    if (_.contains(statuses, Statuses.ABORTED)) {
                        build.status = Statuses.ABORTED;
                        return cb(null, build);
                    }

                    cb(new vError('computeStatus faces an unexpected case'));

                },

                saveBuild

            ], function (err, build) {

                if (err) { return next(new vError(err, 'Build.updateStatus')); }

                next(null, build);

            });

    },
    // terminateSession: terminate session for all groups
    //
    // Then update build status
    terminateSession: function (build) {

        var next = arguments[arguments.length - 1];

        if (arguments.length < 2) {
            return next(new vError('Build.terminateSession takes 1 parameter, the build object'));
        }

        async.waterfall([

                Build.findGroups.bind(null, build),

                function terminateGroups(groupList, cb) {

                    async.each(
                        groupList,
                        group.terminateSession,
                        function (err) {

                            if (err) { return cb(new vError(err, 'terminateGroups')); }

                            cb(null, build);

                        });

                },

                Build.updateStatus

            ], function (err, build) {

                if (err) { return next(new vError(err, 'Build.terminateSession')); }

                next(null, build);

            });


    }
};
