Domains
=======

Adminpanel domains are:

* Project: Handle all the project related metadata
* Build: Handle batches of test groups, related to metadata such as branch
* TestGroup: Handle batches of tests, related to metadat such as title
* Test: Handles diff images and comparison status
* Screenshot: Handles screenshots associated to metada

## Screenshot

Screenshot domain provides following actions:

* find: retrieve a single screenshot, accept filters
* findAll: retrieve a list of screenshots, accept filters
* create: create a Screenshot from metadata and store image

A screenshot is associated with an image.

A screenshot belongs to a TestGroup.

A screenshot MAY have:

- a date
- a browser id
- a title
- an image file

## Test

A Test is a combination of two Screenshots associated with Diff image and comparison information.

Test domain provides following actions:

* find: retrieve a single Test, accept filters
* findAll: retrieve a list of Test, accept filters
* create: create a new Test from metadata, baseline and screenshot
* duplicate: duplicate former completed test for a new TestGroup. Duplicated
  test has a NOT_STARTED status
* restartTest: retry comparison of images
* attachScreenshot: attach a screenshot to a test. This starts diff comparison.
* abortTest: abort a Test when timeout is reached. No timeout is applied for
  now.
* markTestAsFailed: mark a Test as FAILED and update informations accordingly.
  Baseline Screenshot is used as baseline for further builds.
* markTestAsPassed: mark a Test as PASSED and update informations accordingly.
  Screenshot is used as baseline for further builds.
* markTestAsUnknown: mark a Test as NEEDS_ACTION and update informations
  accordingly. Default behavior for a test that needs action is to use new
  screenshot as baseline until the user takes action.
* attachDiffData: update a test diff metadata and image. If mismatch percentage
  is valid, then test is marked as passed, otherwise test is marked as uknown.
* getResultBaseline: returns future builds baseline screenshot.
* terminateSession: if Test is NOT_STARTED, then it is passed to NEEDS_ACTION as
  this is a removal

A Test belongs to a TestGroup.

A Test is a state machine with following states:

- NOT_STARTED: the test is planned for current build, but no screenshot as been
  submitted
- IN_PROGRESS: A screenshot has been submitted, diff processing is in progress
- ABORTED: The test has been aborted. Diff processing timed out.
- PASSED: The test is a success.
- FAILED: Test has failed.
- NEEDS_ACTION: Screenshot is different from baseline, user action is required.

A Test MAY have:

- a status
- a Screenshot
- a Baseline that is a reference to a previous build screenshot
- a Diff image
- a mismatchPercentage

When a Test status changes, an event is triggered. This event should be
dispatched to other domains to take action.

Example actions:

* TestGroup domain should update baseline image when a test is successful
* Screenshot domain should delete new image file with baseline image file if
  mismatchPercentage is 0

## TestGroup

TestGroup domain provides following actions:

* find: retrieve a single TestGroup, accept filters
* findAll: retrieve a list of TestGroup, accept filters
* findTests: retrieve a list of Test, accept filters
* create: create a TestCase from metadata and Baselines
* duplicate: duplicate former completed test group for a new build. All tests
  have a NOT_STARTED status
* updateStatus: update test group status from associated Tests statuses
* terminateSession: update NOT_STARTED Tests to MISSING

A TestGroup is associated with several Tests.

A TestGroup belongs to a Build.

A TestGroup status is computed as follow:

* if all Tests have the same status, this is the TestGroup status
* if a Test is IN_PROGRESS or NOT_STARTED, the TestGroup status is IN_PROGRESS
* if no Test is IN_PROGRESS and a Test NEEDS_ACTION, the TestGroup status is
  NEEDS_ACTION
* if no test needs action or is in progress and one test is FAILED, the
  TestGroup status is FAILED
* if no test needs action, is in progress or failed and one test is ABORTED, the
  TestGroup status is ABORTED


## Build

Build domain provides following actions:

* find: retrieve a single Build, accept filters
* findAll: retrieve a list of Builds, accept filters
* create: duplicate Baselines images from
* duplicate: duplicate former build to create the new one.
* terminateSession: terminate session for all TestGroups, this means no more
  tests will be run for this build

## Workflow

* findTestForScreenshot: retrieve or create Test from TestGroup and screenshot
* findTestGroupForScreenshot: retrieve or create TestGroups from Build and
  Screenshot
* attachScreenshot: Add a new screenshot to Build object from metadata. Update
  matching (or create new) new Tests and TestGroup.
* startSession: create a new build from former build or from scracth.
* terminateSession: terminate current build.

