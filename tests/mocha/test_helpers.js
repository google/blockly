function _argumentsIncludeComments(expectedNumberOfNonCommentArgs, args) {
  return args.length == expectedNumberOfNonCommentArgs + 1;
}

function _commentArg(expectedNumberOfNonCommentArgs, args) {
  if (_argumentsIncludeComments(expectedNumberOfNonCommentArgs, args)) {
    return args[0];
  }

  return null;
}

function _nonCommentArg(desiredNonCommentArgIndex, expectedNumberOfNonCommentArgs, args) {
  return _argumentsIncludeComments(expectedNumberOfNonCommentArgs, args) ?
      args[desiredNonCommentArgIndex] :
      args[desiredNonCommentArgIndex - 1];
}

function _validateArguments(expectedNumberOfNonCommentArgs, args) {
  if (!( args.length == expectedNumberOfNonCommentArgs ||
      (args.length == expectedNumberOfNonCommentArgs + 1 && (typeof(args[0]) == 'string') || args[0] == null))) {
    throw new Error('Incorrect arguments passed to assert function');
  }
}
/**
 * Converts from JSUnit assertEquals to chai.assert.equal.
 */
function assertEquals() {
  _validateArguments(2, arguments);
  var var1 = _nonCommentArg(1, 2, arguments);
  var var2 = _nonCommentArg(2, 2, arguments);
  var comment = _commentArg(2, arguments);
  chai.assert.equal(var1, var2, comment);
}

/**
 * Converts from JSUnit assertTrue to chai.assert.isTrue.
 */
function assertTrue() {
  _validateArguments(1, arguments);
  var commentArg = _commentArg(1, arguments);
  var booleanValue = _nonCommentArg(1, 1, arguments);
  if (typeof(booleanValue) != 'boolean') {
    throw new Error('Bad argument to assertTrue(boolean)');
  }

  chai.assert.isTrue(booleanValue, commentArg);
}

/**
 * Converts from JSUnit assertFalse to chai.assert.isNotTrue.
 */
function assertFalse() {
  _validateArguments(1, arguments);
  var commentArg = _commentArg(1, arguments);
  var booleanValue = _nonCommentArg(1, 1, arguments);

  if (typeof(booleanValue) != 'boolean') {
    throw new Error('Bad argument to assertFalse(boolean)');
  }

  chai.assert.isNotTrue(booleanValue, commentArg);
}

/**
 * Converts from JSUnit assertNull to chai.assert.isNull.
 */
function assertNull() {
  _validateArguments(1, arguments);
  var commentArg = _commentArg(1, arguments);
  var val = _nonCommentArg(1, 1, arguments);
  chai.assert.isNull(val, commentArg);
}
