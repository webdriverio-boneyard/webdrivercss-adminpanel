module.exports = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    ABORTED: 2,
    PASSED: 3,
    FAILED: 4,
    NEEDS_ACTION: 5
};

module.exports.fromNumberToId = function (nb) {
    var i;
    for (i in module.exports) {
        if (module.exports[i] === nb) {
            return i;
        }
    }

    return 'Unknown status ' + nb;
};
