module.exports = Workflow = {
    createSession: function () {
        // find build matching metadata
        // duplicate build
        // return new build object
    },

    terminateSession: function () {
        // find associated build
        // terminate build
        // return build object
    },

    attachScreenshot: function () {
        // find or create associated build
        // find or create associated group
        // find or create associated test

        // attach screenshot to test

        // return test object
    },

    syncBaselinesFromBuild: function () {
        // retreive build from metadata
        // extract baseline images
        // copy to temp dir
        // create archive
        // return archive read stream
    },

    syncBuildFromBaseline: function () {
        // create build
        // compute metadata from file and directory structure
        // attach screenshots to build
        // end build
        // return build object
    }
};
