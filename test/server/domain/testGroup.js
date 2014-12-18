describe('TestGroup', function() {

    var group       = require('server/domains/testGroup');
    var Statuses    = require('server/domains/statuses');

    describe('#duplicate()', function() {
        var formerGroup;
        beforeEach(function (done) {
            formerGroup = {};

            done();
        });

        it('should create a new group', function(done) {
            group.duplicate(function (err, newGroup) {

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
            group.duplicate(function (err, newGroup) {

                if (err) { return done(err); }

                if (!newGroup.title || newGroup.title !== formerGroup.title) {
                    return done(new Error('Should reuse formerGroup information'));
                }

                done();

            });
        });

        it('should have only NOT_STARTED tests', function(done) {
            group.duplicate(function (err, newGroup) {

                if (err) { return done(err); }

                group.findTests(newGroup, function (err, testList) {

                    if (err) { return done(err); }

                    if (!testList.length) {
                        return done(new Error('list of tests should not be empty'));
                    }

                    testList.forEach(function (testItem) {
                        if (testItem.status !== Statuses.NOT_STARTED) {
                            done(new Error('status should be NOT_STARTED but is ' + testItem.status));
                        }
                    });

                    done();

                });

            });
        });

        it('should leave formerGroup tests unchanged', function(done) {
            done(new Error('Not implmeented yet'));
        });
    });
});
