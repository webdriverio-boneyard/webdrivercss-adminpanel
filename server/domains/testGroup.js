var vError      = require('verror');
var async       = require('async');
var _           = require('lodash');
var test        = require('./test');

var Statuses = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    ABORTED: 2,
    PASSED: 3,
    FAILED: 4,
    NEEDS_ACTION: 5
};

// Save a group
//
// This is a placeholder method for further model inegration.
function saveGroup(group, cb) {
    cb(null, group);
}

var TestGroup = module.exports = {
    // find: retrieve a single TestGroup, accept filters
    find: function(filter) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            filter = {};
        }

        next(null, {
                title: 'A great screenshot',
                status: Statuses.NOT_STARTED
            });

    },
    // findAll: retrieve a list of TestGroup, accept filters
    findAll: function(filter) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            filter = {};
        }

        next(null, [{
                title: 'A great screenshot',
                status: Statuses.NOT_STARTED
            }]);

    },
    // findTests: fetch all tests objects for provided TestGroup, accept filters.
    findTests: function (group, filter) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 2) {
            filter = {};
        }

        if (arguments.length < 2) {
            return next(new vError('TestGroup.findTests takes 2 parameters, the group and optionaly a filter'));
        }

        test.findAll({
                group_id: group.id
            },
            function (err, testList) {

                if (err) { return next(new vError('TestGroup.fetchTest', err)); }

                next(null, testList);

            });

    },
    // create: create a TestGroup from metadata
    create: function(build, metadata) {

        var next = arguments[arguments.length - 1];

        if (arguments.length < 3) {
            return next(new vError('TestGroup.create takes 2 parameters, the Build and the group metadata'));
        }

        var group = {};

        group.status = Statuses.NOT_STARTED;
        group.tests = [];

        group.title = metadata.title || 'Unknown Group';

        group.build_id = build.id;

        next(null, group);

    },
    // duplicate: duplicate former completed test group for a new build. All tests
    // have a NOT_STARTED status
    duplicate: function(formerGroup, currentBuild) {

        var next = arguments[arguments.length - 1];

        if (arguments.length < 3) {
            return next(new vError('TestGroup.duplicate takes 2 parameters, the former group object and the Build'));
        }

        var metadata = {
            title: formerGroup.title
        };

        async.waterfall([

                TestGroup.create.bind(null, currentBuild, metadata),

                saveGroup,

                function findFormerTests(newGroup, cb) {

                    TestGroup.findTests(
                        formerGroup,
                        function doneFinedFormerTests(err, formerTestList) {

                            if (err) { return cb(new vError('findFormerTests', err)); }

                            cb(null, formerTestList, newGroup);

                        });

                },

                function replicateTests(formerTestList, newGroup, cb) {

                    async.each(formerTestList, function (formerTest, doneEach) {

                            test.duplicate(formerTest, newGroup, doneEach);

                        }, function doneReplicateTests(err) {

                            if (err) { return cb(new vError('replicateTest', err)); }

                            cb(null, newGroup);

                        });

                }

            ], function (err, group) {

                if (err) { return next(new vError('TestGroup.duplicate', err)); }

                next(null, group);

            });

    },
    // updateStatus: update test group status from associated Tests statuses
    //
    // A TestGroup status is computed as follow:
    //
    // * if all Tests have the same status, this is the TestGroup status
    // * if a Test is IN_PROGRESS or NOT_STARTED, the TestGroup status is IN_PROGRESS
    // * if no Test is IN_PROGRESS and a Test NEEDS_ACTION, the TestGroup
    //   status is NEEDS_ACTION
    // * if no test needs action or is in progress and one test is FAILED, the
    //   TestGroup status is FAILED
    updateStatus: function(group) {

        var next = arguments[arguments.length - 1];

        if (arguments.length < 2) {
            return next(new vError('TestGroup.updateStatus takes 1 parameter, the group object'));
        }

        async.waterfall([

                TestGroup.findTests.bind(null, group),

                function computeStatus(testList, cb) {

                    var statuses = _.pluck(testList, 'status');
                    statuses = _.uniq(statuses);

                    // if no test associated to group
                    // then nothing to do.
                    if (!statuses.length) {
                        return cb(null, group);
                    }

                    // If all tests have the same status
                    // use it as group status
                    if (statuses.length === 1) {
                        group.status = statuses[0];
                        return cb(null, group);
                    }

                    // If a test is IN_PROGRESS or NOT_STARTED
                    // then group is IN_PROGRESS
                    if (
                        _.contains(statuses, Statuses.IN_PROGRESS) ||
                        _.contains(statuses, Statuses.NOT_STARTED)
                    ) {
                        group.status = Statuses.IN_PROGRESS;
                        return cb(null, group);
                    }

                    // If a test is NEEDS_ACTION
                    // then group is NEEDS_ACTION
                    if (_.contains(statuses, Statuses.NEEDS_ACTION)) {
                        group.status = Statuses.NEEDS_ACTION;
                        return cb(null, group);
                    }

                    // If a test is FAILED
                    // then group is FAILED
                    if (_.contains(statuses, Statuses.FAILED)) {
                        group.status = Statuses.FAILED;
                        return cb(null, group);
                    }

                    // If a test is ABORTED
                    // then group is ABORTED
                    if (_.contains(statuses, Statuses.ABORTED)) {
                        group.status = Statuses.ABORTED;
                        return cb(null, group);
                    }

                    cb(new vError('computeStatus faces an unexpected case'));

                },

                saveGroup

            ], function (err, group) {

                if (err) { return next(new vError('TestGroup.updateStatus', err)); }

                next(null, group);

            });

    },
    // terminateSession: update NOT_STARTED Tests to NEEDS_ACTION
    //
    // Then update group status
    terminateSession: function (group) {

        var next = arguments[arguments.length - 1];

        if (arguments.length < 2) {
            return next(new vError('TestGroup.terminateSession takes 1 parameter, the group object'));
        }

        async.waterfall([

                TestGroup.findTests.bind(null, group),

                function terminateTests(testList, cb) {

                    async.each(
                        testList,
                        test.terminateSession,
                        function (err) {

                            if (err) { return cb(new vError('terminateTests', err)); }

                            cb(null, group);

                        });

                },

                TestGroup.updateStatus

            ], function (err, group) {

                if (err) { return next(new vError('TestGroup.terminateSession', err)); }

                next(null, group);

            });


    }
};
