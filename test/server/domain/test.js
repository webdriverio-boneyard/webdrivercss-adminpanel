describe('test', function() {

    var test        = require('server/domains/test');
    var Statuses    = require('server/domains/statuses');
    var _           = require('lodash');

    describe('#create()', function() {

        it('should create a new test from no metadata', function (done) {
            test.create(function (err, newTest) {

                if (err) { return done(err); }

                if (!newTest) { return done(new Error('should return a test object')); }

                done();

            });
        });

        it('should create a new test from metadata', function (done) {
            test.create({}, function (err, newTest) {

                if (err) { return done(err); }

                if (!newTest) { return done(new Error('should return a test object')); }

                done();

            });
        });

    });

    describe('#duplicate()', function() {
        var originalTest, group;

        beforeEach(function () {
            originalTest = {
                group_id: 'my_original_group',
                file: 'data/screenshots/xyz.png',
                date: new Date(),
                title: 'A great screenshot',
                status: Statuses.PASSED
            };

            group = {
                id: 'my_new_group'
            };
        });

        it('should create a new test object for group', function (done) {
            test.duplicate(originalTest, group, function (err, newTest) {

                if (err) { return done(err); }

                if (!newTest) {
                    return done(new Error('should return a test object'));
                }

                done();

            });
        });

        it('should set new test properties', function (done) {
            test.duplicate(originalTest, group, function (err, newTest) {

                if (err) { return done(err); }

                if (!newTest.group_id) {
                    return done(new Error('should have group_id set'));
                }
                if (newTest.group_id !== group.id) {
                    return done(new Error('should have group_id set to group id'));
                }

                done();

            });
        });

        it('should set new test status to NOT_STARTED', function (done) {
            test.duplicate(originalTest, group, function (err, newTest) {

                if (err) { return done(err); }

                if (newTest.status !== Statuses.NOT_STARTED) {
                    return done(new Error('should have status set to NOT_STARTED'));
                }

                done();

            });
        });

        it('should use resultBaseline as new baseline', function (done) {
            originalTest.baseline = 'old';
            originalTest.resultBaseline = 'new';

            test.duplicate(originalTest, group, function (err, newTest) {

                if (err) { return done(err); }

                if (!newTest.baseline) {
                    return done(new Error('should have a baseline set'));
                }
                if (newTest.baseline !== 'new') {
                    return done(new Error('should have original resultBaseline as baseline'));
                }

                done();

            });
        });

        it('should not have a resultBaseline yet', function (done) {
            originalTest.baseline = 'old';
            originalTest.resultBaseline = 'new';

            test.duplicate(originalTest, group, function (err, newTest) {

                if (err) { return done(err); }

                if (newTest.resultBaseline) {
                    return done(new Error('should not have a resultBaseline'));
                }

                done();

            });
        });
    });

    describe('#attachScreenshot()', function() {
        var testObject;

        var screenshotDataNoDiff = {
            screenshotBase64: 'XYZ'
        };
        var screenshotDataWithDiff = {
             screenshotBase64: 'XYZ',
             isWithinMisMatchTolerance: null,
             misMatchPercentage: null,
             isExactSameImage: null,
             isSameDimensions: null,
             diffBase64: 'XYZ',
             baselineBase64: 'XZY'
        };

        function getSampleScreenshotData(withDiff) {
            if (withDiff) {
                return _.clone(screenshotDataWithDiff);
            }

            return _.clone(screenshotDataNoDiff);
        }

        beforeEach(function (done) {
            test.create({}, function (err, createdTest) {
                if (err) { return done(err); }

                testObject = createdTest;

                done();
            });
        });


        it('should update screenshot field', function (done) {
            var withDiff = false;
            var screenshotData = getSampleScreenshotData(withDiff);

            test.attachScreenshot(testObject, screenshotData, function (err, updatedTest) {
                if (err) { return done(err); }

                if (updatedTest.screenshot !== screenshotData.screenshotPath) {
                    return done(new Error('should update screenshot field with given screenshot'));
                }

                done();
            });
        });

        it('should updateStatus to PASSED if isWithinMisMatchTolerance is true', function (done) {
            var withDiff = true;
            var screenshotData = getSampleScreenshotData(withDiff);
            screenshotData.isWithinMisMatchTolerance = true;
            screenshotData.misMatchPercentage = 0;
            screenshotData.isExactSameImage = true;
            screenshotData.isSameDimensions = true;

            test.attachScreenshot(testObject, screenshotData, function (err, updatedTest) {
                if (err) { return done(err); }

                if (updatedTest.status !== Statuses.PASSED) {
                    return done(new Error('should set status to PASSED when isWithinMisMatchTolerance (received '+Statuses.fromNumberToId(updatedTest.status)+')'));
                }

                done();
            });
        });

        it('should updateStatus to NEEDS_ACTION if isWithinMisMatchTolerance is false', function (done) {
            var withDiff = true;
            var screenshotData = getSampleScreenshotData(withDiff);
            screenshotData.isWithinMisMatchTolerance = false;
            screenshotData.misMatchPercentage = 0.30;
            screenshotData.isExactSameImage = false;
            screenshotData.isSameDimensions = false;

            test.attachScreenshot(testObject, screenshotData, function (err, updatedTest) {
                if (err) { return done(err); }

                if (updatedTest.status !== Statuses.NEEDS_ACTION) {
                    return done(new Error('should set status to NEEDS_ACTION when NOT isWithinMisMatchTolerance'));
                }

                done();
            });
        });

        it('should set test status to IN_PROGRESS if no diff data is provided', function (done) {
            var withDiff = false;
            var screenshotData = getSampleScreenshotData(withDiff);

            test.attachScreenshot(testObject, screenshotData, function (err, updatedTest) {
                if (err) { return done(err); }

                if (updatedTest.status !== Statuses.IN_PROGRESS) {
                    return done(new Error('should set status to IN_PROGRESS when diff information is not available'));
                }

                done();
            });
        });

        it('should update diff information if provided', function (done) {
            var withDiff = true;
            var screenshotData = getSampleScreenshotData(withDiff);
            screenshotData.isWithinMisMatchTolerance = false;
            screenshotData.misMatchPercentage = 0.30;
            screenshotData.isExactSameImage = false;
            screenshotData.isSameDimensions = false;

            test.attachScreenshot(testObject, screenshotData, function (err, updatedTest) {
                if (err) { return done(err); }

                if (updatedTest.isWithinMisMatchTolerance !== screenshotData.isWithinMisMatchTolerance) {
                    return done(new Error('should update test `isWithinMisMatchTolerance`'));
                }

                if (updatedTest.misMatchPercentage !== screenshotData.misMatchPercentage) {
                    return done(new Error('should update test `misMatchPercentage`'));
                }

                if (updatedTest.isExactSameImage !== screenshotData.isExactSameImage) {
                    return done(new Error('should update test `isExactSameImage`'));
                }

                if (updatedTest.isSameDimensions !== screenshotData.isSameDimensions) {
                    return done(new Error('should update test `isSameDimensions`'));
                }

                done();
            });
        });

        it.skip('should trigger comparison if no diff is provided', function (done) {
            done(new Error('Not implemented yet'));
        });

    });

    describe('#attachDiffData()', function() {
        var testObject;

        beforeEach(function (done) {
            test.create({}, function (err, createdTest) {
                if (err) { return done(err); }

                testObject = createdTest;

                done();
            });
        });

        it('should mark test as PASSED if isWithinMisMatchTolerance', function(done) {
            var diffData = {
                isWithinMisMatchTolerance: true
            };
            test.attachDiffData(test, diffData, function (err, updatedTest) {
                if (err) { return done(err); }

                if (updatedTest.status !== Statuses.PASSED) {
                    return done(new Error('should set status to PASSED when isWithinMisMatchTolerance'));
                }

                done();
            });
        });

        it('should mark test as NEEDS_ACTION if not isWithinMisMatchTolerance', function(done) {
            var diffData = {
                isWithinMisMatchTolerance: false
            };
            test.attachDiffData(test, diffData, function (err, updatedTest) {
                if (err) { return done(err); }

                if (updatedTest.status !== Statuses.NEEDS_ACTION) {
                    return done(new Error('should set status to NEEDS_ACTION when NOT isWithinMisMatchTolerance'));
                }

                done();
            });
        });
    });
});
