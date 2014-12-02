var vError      = require('verror');
var async       = require('async');

var Statuses = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    ABORTED: 2,
    PASSED: 3,
    FAILED: 4,
    NEEDS_ACTION: 5
};

// launch a comparison for a given test
function compare(test, cb) {
    cb(null);
}

var Test = module.exports = {

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

    create: function (testGroup, metadata) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 2) {
            metadata = {};
        }

        if (arguments.length < 2) {
            return next(new vError('Test.create takes 2 parameters, the testGroup and the test metadata'));
        }

        var test = {};

        test.status = Statuses.NOT_STARTED;
        test.resultBaseline = null;
        test.diffImage = null;
        test.diffData = {};

        test.title = metadata.title || 'Unknown Test';
        test.baseline = metadata.baseline;
        test.screenshot = metadata.screenshot;

        next(null, test);

    },

    // Set Screenshot for a Test
    //
    // As a test can be create before screenshots are sent, it is a way to
    attachScreenshot: function (test, screenshot) {

        var next = arguments[arguments.length - 1];

        if (arguments.length <= 2) {
            return next(new vError('Test.updateScreenshot takes 2 parameters, the test to update and the screenshot object'));
        }

        test.screenshot = screenshot;

        compare(test, function comparisonStarted(err) {
            next(err, test);
        });

    },

    restartTest: function (test) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            return next(new vError('Test.restartTest takes 1 parameter: the test to restart'));
        }

        compare(test, function comparisonStarted(err) {
            next(err, test);
        });

    },


    // set no baseline for further tests.
    //
    // Test is not supposed to be executed anymore, so if it appears again it
    // will now be considered as new.
    removeTest:  function (test) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            return next(new vError('Test.markTestAsRemoved takes 1 parameter: the test to update'));
        }

        Test.setResultBaseline(test, null, next);

    },

    getResultBaseline: function (test) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            return next(new vError('Test.getResultBaseline takes 1 parameter: the test object'));
        }

        next(null, test.resultBaseline);

    },

    getScreenshot: function (test) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            return next(new vError('Test.getScreenshot takes 1 parameter: the test object'));
        }

        next(null, test.screenshot);

    },

    attachDiffData: function (test, diffImage, diffData) {

        var next = arguments[arguments.length - 1];

        if (arguments.length <= 2) {
            return next(new vError('Test.attachDiffData takes 2 parameters, the test to update and the diff result'));
        }

        test.diffData = diffData;
        test.diffImage = diffImage;

        if (diffData.isWithinMisMatchTolerance) {
          return Test.markTestAsPassed(test, next);
        }

        Test.markTestAsUnknown(Test, next);

    },

    markTestAsPassed: function (test) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            return next(new vError('Test.markTestAsPassed takes 1 parameter: the test object'));
        }

        async.waterfall([

                updateResultBaseline,

                function updateStatus(done) {
                    test.status = Statuses.PASSED;
                    done(null);
                }

            ], function (err) {
                next(err, test);
            });

    },

    markTestAsUnknown: function (test) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            return next(new vError('Test.markTestAsUnknown takes 1 parameter: the test object'));
        }

        async.waterfall([

                keepResultBaseline,

                function updateStatus(done) {
                    test.status = Statuses.NEEDS_ACTION;
                    done(null);
                }

            ], function (err) {
                next(err, test);
            });

    },

    markTestAsFailed: function (test) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            return next(new vError('Test.markTestAsFailed takes 1 parameter: the test object'));
        }

        async.waterfall([

                keepResultBaseline,

                function updateStatus(done) {
                    test.status = Statuses.FAILED;
                    done(null);
                }

            ], function (err) {
                next(err, test);
            });

    },

    terminateSession: function (test) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            return next(new vError('Test.terminateSession takes 1 parameter: the test object'));
        }

        Test.markTestAsUnknown(test, next);

    }
};

// Set the result baseline, used for further tests.
//
// Baseline is a Screenshot object
function setResultBaseline(test, baseline) {

    var next = arguments[arguments.length - 1];

    if (arguments.length <= 2) {
        return next(new vError('setResultBaseline takes 2 parameters, the test to update and the baseline'));
    }

    test.resultBaseline = baseline;

    next(null, test);
}



// Update baseline with current screenshot as reference for further tests.
//
// The new screenshot is used as reference for further test.
function updateResultBaseline(test) {

    var next = arguments[arguments.length - 1];

    if (arguments.length === 1) {
        return next(new vError('updateResultBaseline takes 1 parameter: the test to update'));
    }

    setResultBaseline(test, test.baseline, next);

}

// keep the original baseline as reference for further tests.
//
// The original baseline screenshot is used as reference for further test.
function keepResultBaseline(test) {

    var next = arguments[arguments.length - 1];

    if (arguments.length === 1) {
        return next(new vError('keepResultBaseline takes 1 parameter: the test to update'));
    }

    setResultBaseline(test, test.baseline, next);

}
