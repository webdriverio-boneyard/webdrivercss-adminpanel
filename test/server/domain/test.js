describe('test', function() {

    var test = require('server/domains/test');
    var Statuses = require('server/domains/statuses');

    describe('#create()', function() {

        it('should create a new test from no metadata', function (done) {
            test.create(function (err, newTest) {

                if (err) { done(err); }

                if (!newTest) { done(new Error('should return a test object')); }

                done();

            });
        });

        it('should create a new test from metadata', function (done) {
            test.create({}, function (err, newTest) {

                if (err) { done(err); }

                if (!newTest) { done(new Error('should return a test object')); }

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

                if (err) { done(err); }

                if (!newTest) {
                    done(new Error('should return a test object'));
                }

                done();

            });
        });

        it('should set new test properties', function (done) {
            test.duplicate(originalTest, group, function (err, newTest) {

                if (err) { done(err); }

                if (!newTest.group_id) {
                    done(new Error('should have group_id set'));
                }
                if (newTest.group_id !== group.id) {
                    done(new Error('should have group_id set to group id'));
                }
                if (newTest.status !== Statuses.NOT_STARTED) {
                    done(new Error('should have status set to NOT_STARTED'));
                }

                done();

            });
        });

        it('should use resultBaseline as new baseline', function (done) {
            originalTest.baseline = 'old';
            originalTest.resultBaseline = 'new';

            test.duplicate(originalTest, group, function (err, newTest) {

                if (err) { done(err); }

                if (!newTest.baseline) {
                    done(new Error('should have a baseline set'));
                }
                if (newTest.baseline !== 'new') {
                    done(new Error('should have original resultBaseline as baseline'));
                }

                done();

            });
        });

        it('should not have a resultBaseline yet', function (done) {
            originalTest.baseline = 'old';
            originalTest.resultBaseline = 'new';

            test.duplicate(originalTest, group, function (err, newTest) {

                if (err) { done(err); }

                if (newTest.resultBaseline) {
                    done(new Error('should not have a resultBaseline'));
                }

                done();

            });
        });
    });

    describe.skip('#attachScreenshot()', function() {

        it('should update screenshot field', function (done) {
            done(new Error('Not implemented yet'));
        });

        it('should updateStatus to PASSED if isWithinMismatchTolerance is true', function (done) {
            done(new Error('Not implemented yet'));
        });

        it('should updateStatus to NEEDS_ACTION if isWithinMismatchTolerance is false', function (done) {
            done(new Error('Not implemented yet'));
        });

        it('should update diff information if provided', function (done) {
            done(new Error('Not implemented yet'));
        });

        it('should set test status to IN_PROGRESS if no diff data is provided', function (done) {
            done(new Error('Not implemented yet'));
        });

        it('should trigger comparison if no diff is provided', function (done) {
            done(new Error('Not implemented yet'));
        });

    });
});
