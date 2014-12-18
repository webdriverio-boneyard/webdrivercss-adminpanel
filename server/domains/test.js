var vError      = require('verror');
var async       = require('async');
var screenshot  = require('./screenshot');

var Statuses    = require('./statuses');

// launch a comparison for a given test
function compare(test, cb) {
    test.status = Statuses.IN_PROGRESS;
    cb(null);
}

// Save a test
//
// This is a placeholder method for further model inegration.
function saveTest(test, cb) {
    cb(null, test);
}

var Test = module.exports = {

    find: function (filter) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            filter = {};
        }

        next(null, {
                group_id: 'my_group',
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
                group_id: 'my_group',
                file: 'data/screenshots/xyz.png',
                date: new Date(),
                title: 'A great screenshot'
            }]);

    },

    create: function (metadata) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            metadata = {};
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

    // duplicate: duplicate former completed test for a new TestGroup. Duplicated
    // test has a NOT_STARTED status
    duplicate: function (test, currentGroup) {

        var next = arguments[arguments.length - 1];

        if (arguments.length < 3) {
            return next(new vError('Test.duplicate takes 2 parameters, the former test object and the Group'));
        }

        var metadata = {
            title: test.title,
            baseline: test.resultBaseline
        };

        async.waterfall([

                Test.create.bind(null, metadata),

                function updateTestData(newTest, cb) {

                    newTest.status = Statuses.NOT_STARTED;
                    newTest.group_id = currentGroup.id;

                    cb(null, newTest);
                },

                saveTest

            ], function (err, test) {

                if (err) { return next(new vError(err, 'Test.duplicate')); }

                next(null, test);

            });
    },

    // Set Screenshot for a Test
    //
    // Metadata is the screenshot information containing `screenshotBase64`,
    // `isWithinMisMatchTolerance`, `misMatchPercentage`, `isExactSameImage`,
    // `isSameDimensions`, `diffBase64`, `baselineBase64`
    //
    // As a test can be created before screenshots are sent, it is a way to
    // update a test with a screenshot.
    //
    // If diffData is provided, then test is updated with diff information,
    // otherwise a comparison is triggered
    attachScreenshot: function (test, metadata) {

        var next = arguments[arguments.length - 1];

        if (arguments.length <= 2) {
            return next(new vError('Test.updateScreenshot takes 2 parameters, the test to update and the screenshot object'));
        }

        async.waterfall([

                screenshot.create.bind(null, metadata.screenshotBase64),

                function updateScreenshotField(screenshotObject, cb) {

                    test.screenshot = screenshotObject.path;

                    cb(null, test);

                },

                function computeDiffData(test, cb) {
                    // if no diff information has been provided
                    // then start comparison
                    if (metadata.misMatchPercentage == null) {
                        return compare(test, function comparisonStarted(err) {
                            if (err) { return cb(new vError(err, 'computeDiffData')); }
                            cb(err, test);
                        });
                    }

                    // diff informations are given, let's save them
                    Test.attachDiffData(
                        test, {
                            isWithinMisMatchTolerance: metadata.isWithinMisMatchTolerance,
                            misMatchPercentage: metadata.misMatchPercentage,
                            isExactSameImage: metadata.isExactSameImage,
                            isSameDimensions: metadata.isSameDimensions,
                            diffBase64: metadata.diffBase64,
                            diffImage: metadata.diffImage
                        },
                        function diffAttached(err, test) {
                            if (err) { return cb(new vError(err, 'computeDiffData')); }
                            cb(err, test);
                        });
                }

            ], function (err, test) {

                if (err) { return next(new vError(err, 'Test.attachScreenshot')); }

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

    // Attach diff data.
    //
    // Accept following metadata:
    //
    // * `isWithinMisMatchTolerance`
    // * `misMatchPercentage`
    // * `isExactSameImage`
    // * `isSameDimensions`
    // * `diffImage`: the reference to screenshot object
    // * `diffBase64`: the base64 diff image
    //
    // > Note that one and only one of `diffImage` and `diffBase64` is required
    attachDiffData: function (test, metadata) {

        var next = arguments[arguments.length - 1];

        if (arguments.length <= 2) {
            return next(new vError('Test.attachDiffData takes 2 parameters, the test to update and the diff result'));
        }

        async.waterfall([
                function initData(cb) {
                    cb(null, test);
                },

                function saveDiffImage(test, cb) {
                    // If a diff image
                    if (metadata.diffImage) {
                        test.diffImage = metadata.path;
                        metadata.diffBase64 = null;
                        metadata.diffImage = metadata.path;
                    }
                    // if no diff content has been provided
                    // then continue
                    if (!metadata.diffBase64) {
                        return cb(null, test);
                    }

                    screenshot.create(metadata.diffBase64, function (err, screenshotObject) {
                        if (err) { return cb(new vError(err, 'saveDiffImage')); }

                        test.diffImage = screenshotObject.path;

                        cb(null, test);
                    });

                },

                function attachInformation (test, cb) {

                    test.isWithinMisMatchTolerance = metadata.isWithinMisMatchTolerance;
                    test.misMatchPercentage = metadata.misMatchPercentage;
                    test.isExactSameImage = metadata.isExactSameImage;
                    test.isSameDimensions = metadata.isSameDimensions;

                    cb(null, test);
                },

                function updateStatus (test, cb) {
                    if (metadata.isWithinMisMatchTolerance) {
                        return Test.markTestAsPassed(test, cb);
                    }

                    Test.markTestAsUnknown(test, cb);
                }

            ], function (err, test) {
                if (err) { return next(new vError(err, 'Test.attachDiffData')); }

                next(null, test);
            });

    },

    markTestAsPassed: function (test) {

        var next = arguments[arguments.length - 1];

        if (arguments.length === 1) {
            return next(new vError('Test.markTestAsPassed takes 1 parameter: the test object'));
        }

        async.waterfall([

                updateResultBaseline.bind(null, test),

                function updateStatus(test, done) {
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

                keepResultBaseline.bind(null, test),

                function updateStatus(test, done) {
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

                keepResultBaseline.bind(null, test),

                function updateStatus(test, done) {
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
