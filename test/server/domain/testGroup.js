describe('TestGroup', function() {

    var group       = require('server/domains/testGroup');
    var test        = require('server/domains/test');
    var Statuses    = require('server/domains/statuses');

    describe('#create()', function() {
        it('should set build_id on new test group', function(done) {
            var groupData = {
                title: 'My test title'
            };

            var build = {
                id: 'new-build'
            };

            group.create(build, groupData, function (err, newGroup) {

                if (err) { return done(err); }

                if (!newGroup) {
                    return done(new Error('No new group returned'));
                }

                if (newGroup.build_id !== build.id) {
                    return done(new Error('group.create should set Group build_id property'));
                }

                done();

            });
        });
    });

    describe('#duplicate()', function() {
        var formerGroup, build;
        var originalTestDuplicate;
        beforeEach(function (done) {

            formerGroup = {
                id: 'former-group-id',
                build_id: 'former-build',
                title: 'My test title'
            };

            build = {
                id: 'new-build'
            };

            // keep a reference to test.duplicate
            originalTestDuplicate = test.duplicate;

            done();
        });

        afterEach(function () {
            // restore original duplicate method in case itwas modified/mocked
            test.duplicate = originalTestDuplicate;
        });

        it('should create a new group', function(done) {
            group.duplicate(formerGroup, build, function (err, newGroup) {

                if (err) { return done(err); }

                if (!newGroup) {
                    return done(new Error('No new group returned'));
                }

                if (newGroup.id === formerGroup.id) {
                    return done(new Error('group.duplicate should persist a different group'));
                }

                done();

            });
        });

        it('should reuse formerGroup information', function(done) {
            group.duplicate(formerGroup, build, function (err, newGroup) {

                if (err) { return done(err); }

                if (!newGroup.title || newGroup.title !== formerGroup.title) {
                    return done(new Error('Should reuse formerGroup information'));
                }

                done();

            });
        });

        it('should delegate test duplication to Test.duplicate', function(done) {
            var calledDuplicate = false;
            test.duplicate = function (metadata) {
                var next = arguments[arguments.length - 1];

                calledDuplicate = true;

                next(null, metadata);
            };

            group.duplicate(formerGroup, build, function (err, newGroup) {

                if (err) { return done(err); }

                if (!newGroup) {
                    return done(new Error('should return created test'));
                }

                if (!calledDuplicate) {
                    return done(new Error('should have called Test.duplicate'));
                }

                done();

            });
        });

    });

    describe('#updateStatus()', function() {
        var originalFindTest;
        var currentGroup;
        // create a fake set of tests with provided statuses
        function mockFindTests(statuses) {
            group.findTests = function () {
                var next = arguments[arguments.length - 1];
                var tmpTests = [];
                statuses.forEach(function (s) {
                    tmpTests.push({
                        status: s
                    });
                });

                next(null, tmpTests);
            };
        }

        beforeEach(function () {
            currentGroup = {
                status: Statuses.NOT_STARTED
            };
            // keep reference of original findTest method
            originalFindTest = group.findTests;
        });

        afterEach(function () {
            // restore original findTest
            group.findTests = originalFindTest;
        });

        [   {
            title: 'all tests are passed',
            testStatuses: [Statuses.PASSED, Statuses.PASSED, Statuses.PASSED],
            expected: Statuses.PASSED},
            {
            title: 'all tests are failed',
            testStatuses: [Statuses.FAILED, Statuses.FAILED, Statuses.FAILED],
            expected: Statuses.FAILED},
            {
            title: 'if a test is IN_PROGRESS',
            testStatuses: [Statuses.IN_PROGRESS, Statuses.PASSED, Statuses.PASSED],
            expected: Statuses.IN_PROGRESS},
            {
            title: 'if a test is NOT_STARTED',
            testStatuses: [Statuses.NOT_STARTED, Statuses.PASSED, Statuses.FAILED],
            expected: Statuses.IN_PROGRESS},
            {
            title: 'if a test is NEEDS_ACTION',
            testStatuses: [Statuses.FAILED, Statuses.NEEDS_ACTION, Statuses.PASSED],
            expected: Statuses.NEEDS_ACTION},
            {
            title: 'if a test is FAILED',
            testStatuses: [Statuses.PASSED, Statuses.FAILED, Statuses.PASSED],
            expected: Statuses.FAILED},

        ].forEach(function (testArgs) {
            var testStatuses = testArgs.testStatuses;
            var expectedStatus = testArgs.expected;

            it(testArgs.title, function(done) {

                mockFindTests(testStatuses);

                group.updateStatus(currentGroup, function (err, updatedGroup) {

                    if (err) { return done(err); }

                    if (!updatedGroup) {
                        return done(new Error('should return updated test'));
                    }

                    if (updatedGroup.status !== expectedStatus) {
                        return done(new Error('new status should be ' + Statuses.fromNumberToId(expectedStatus) + ' but got '+ Statuses.fromNumberToId(updatedGroup.status)));
                    }

                    done();
                });
            });
        });

    });
});
