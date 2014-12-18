Workflows
=========

## Store Screenshots Workflow

1. Client requests a new build.
2. A new build object is created, fully populated with TestGroups embedding
   initialized tests. (This step is required to detect missing images and keep a
   reference to baselines on unfinished tests).
3. Client send screenshots associated to a build id and metadata. Every received
   screenshot is added to corresponding test group, and a comparison is
   initiated.
   Every new screenshot reset timeout for Build and enque a comparison job.
4. Each worker update status (and future baseline if possible) for corresponding
   test when comparison is over. When a Test is over, the TestGroup and build
   status is updated as well.
5. Client end the build. A CRON agent or similar tool terminates build that
   reached timeout. Comparison jobs that are planned keep processing until all
   are done.

## Screenshot Review Workflow

1. Client see all the Builds associated with statuses
2. Client selects a Build
3. Client see all tests groups associated with statuses
4. Client selects a test group
5. Client see all tests classified by status
6. Client can update future baseline for a test that is not PASSED
7. client navigates to next test group

