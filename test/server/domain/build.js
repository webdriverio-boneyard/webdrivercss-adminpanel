describe('build', function() {

    var build       = require('server/domains/build');
    var group       = require('server/domains/testGroup');
    var Statuses    = require('server/domains/statuses');

    describe('#duplicate()', function() {

    });

    describe('#updateStatus()', function() {

        var originalFindGroup;
        var currentBuild;
        // create a fake set of tests with provided statuses
        function mockFindGroups(statuses) {
            build.findGroups = function () {
                var next = arguments[arguments.length - 1];
                var tmpGroups = [];
                statuses.forEach(function (s) {
                    tmpGroups.push({
                        status: s
                    });
                });

                next(null, tmpGroups);
            };
        }

        beforeEach(function () {
            currentBuild = {
                status: Statuses.NOT_STARTED
            };
            // keep reference of original findGroup method
            originalFindGroup = group.findGroups;
        });

        afterEach(function () {
            // restore original findGroup
            group.findGroups = originalFindGroup;
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

                mockFindGroups(testStatuses);

                build.updateStatus(currentBuild, function (err, updatedBuild) {

                    if (err) { return done(err); }

                    if (!updatedBuild) {
                        return done(new Error('should return updated build'));
                    }

                    if (updatedBuild.status !== expectedStatus) {
                        return done(new Error('new status should be ' + Statuses.fromNumberToId(expectedStatus) + ' but got '+ Statuses.fromNumberToId(updatedBuild.status)));
                    }

                    done();
                });
            });
        });
    });
});
