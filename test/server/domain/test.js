describe('test', function() {

    var test = require('server/domains/test');
    var Statuses = require('server/domains/statuses');

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

    describe('#ducplicate()', function() {
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
        var testObject, screenshotData;

        beforeEach(function (done) {
            screenshotData = {
                screenshotBase64: 'XYZ'
            };

            test.create({}, function (err, createdTest) {
                if (err) { return done(err); }

                testObject = createdTest;

                done();
            });
        });


        it('should update screenshot field', function (done) {
            test.attachScreenshot(testObject, screenshotData, function (err, updatedTest) {
                if (err) { return done(err); }

                if (updatedTest.screenshot !== screenshotData.screenshotPath) {
                    return done(new Error('should update screenshot field with given screenshot'));
                }

                done();
            });
        });

        it.skip('should updateStatus to PASSED if isWithinMisMatchTolerance is true', function (done) {
            done(new Error('Not implemented yet'));
        });

        it.skip('should updateStatus to NEEDS_ACTION if isWithinMisMatchTolerance is false', function (done) {
            done(new Error('Not implemented yet'));
        });

        it.skip('should update diff information if provided', function (done) {
            done(new Error('Not implemented yet'));
        });

        it.skip('should set test status to IN_PROGRESS if no diff data is provided', function (done) {
            done(new Error('Not implemented yet'));
        });

        it.skip('should trigger comparison if no diff is provided', function (done) {
            done(new Error('Not implemented yet'));
        });

    });
});
