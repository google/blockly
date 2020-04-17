/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

 /**
 * @fileoverview Test utilities.
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';


/**
 * The normal blockly event fire function.  We sometimes override this.  This
 * handle lets us reset after an override.
 */
var savedFireFunc = Blockly.Events.fire;

/**
 * A helper function to replace Blockly.Events.fire in tests.
 */
function temporary_fireEvent(event) {
  if (!Blockly.Events.isEnabled()) {
    return;
  }
  Blockly.Events.FIRE_QUEUE_.push(event);
  Blockly.Events.fireNow_();
}

/**
 * Check that two arrays have the same content.
 * @param {!Array.<string>} array1 The first array.
 * @param {!Array.<string>} array2 The second array.
 */
function isEqualArrays(array1, array2) {
  assertEquals(array1.length, array2.length);
  for (var i = 0; i < array1.length; i++) {
    assertEquals(array1[i], array2[i]);
  }
}

/**
 * Creates a new method stub. Sets the expected return values and
 *     the parameters if any exist.
 * @param {!Object} scope The scope of the method to be mocked out.
 * @param {!string} funcName The name of the function we're going to mock.
 * @param {Array.<Object>} parameters The parameters to call the mock with.
 * @param {Array.<!Object>} return_values The values to return when called.
 * @return {!sinon.SinonStub} The stub method.
 */
function setUpMockMethod(scope, funcName, parameters, return_values) {
  var stub = sinon.stub(scope, funcName);
  if (return_values) {
    for (var i = 0, return_value; return_value = return_values[i]; i++) {
      if (parameters && i < parameters.length) {
        stub(parameters[i]).returns(return_value);
      }
      else {
        stub.onCall(i).returns(return_value);
      }
    }
  }
  // If there are no return values but there are parameters, we are only
  // recording specific method calls.
  else if (parameters) {
    for (var i = 0; i < parameters.length; i++) {
      stub(parameters[i]);
    }
  }
  return stub;
}

/**
 * Check if a variable with the given values exists.
 * @param {Blockly.Workspace|Blockly.VariableMap} container The workspace  or
 *     variableMap the checked variable belongs to.
 * @param {!string} name The expected name of the variable.
 * @param {!string} type The expected type of the variable.
 * @param {!string} id The expected id of the variable.
 */
function checkVariableValues(container, name, type, id) {
  var variable = container.getVariableById(id);
  assertNotUndefined(variable);
  assertEquals(name, variable.name);
  assertEquals(type, variable.type);
  assertEquals(id, variable.getId());
}

/**
 * Create a test get_var_block.
 * Will fail if get_var_block isn't defined.
 * @param {!Blockly.Workspace} workspace The workspace on which to create the
 *     block.
 * @param {!string} variable_id The id of the variable to reference.
 * @return {!Blockly.Block} The created block.
 */
function createMockVarBlock(workspace, variable_id) {
  if (!Blockly.Blocks['get_var_block']) {
    fail();
  }
  // Turn off events to avoid testing XML at the same time.
  Blockly.Events.disable();
  var block = new Blockly.Block(workspace, 'get_var_block');
  block.inputList[0].fieldRow[0].setValue(variable_id);
  Blockly.Events.enable();
  return block;
}

function createTwoVariablesAndBlocks(workspace) {
  // Create two variables of different types.
  workspace.createVariable('name1', 'type1', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  // Create blocks to refer to both of them.
  createMockVarBlock(workspace, 'id1');
  createMockVarBlock(workspace, 'id2');
}

function createVariableAndBlock(workspace) {
  workspace.createVariable('name1', 'type1', 'id1');
  createMockVarBlock(workspace, 'id1');
}

function defineGetVarBlock() {
  Blockly.defineBlocksWithJsonArray([{
    "type": "get_var_block",
    "message0": "%1",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR",
        "variableTypes": ["", "type1", "type2"]
      }
    ]
  }]);
}

function undefineGetVarBlock() {
  delete Blockly.Blocks['get_var_block'];
}

/**
 * Capture the strings sent to console.warn() when calling a function.
 * @param {function} innerFunc The function where warnings may called.
 * @return {string[]} The warning messages (only the first arguments).
 */
function captureWarnings(innerFunc) {
  var msgs = [];
  var nativeConsoleWarn = console.warn;
  try {
    console.warn = function(msg) {
      msgs.push(msg);
      nativeConsoleWarn.apply(console, arguments);
    };
    innerFunc();
  } finally {
    console.warn = nativeConsoleWarn;
  }
  return msgs;
}

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
    throw Error('Incorrect arguments passed to assert function');
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
 * Converts from JSUnit assertNotEquals to chai.assert.notEquals.
 */
function assertNotEquals() {
  _validateArguments(2, arguments);
  var var1 = _nonCommentArg(1, 2, arguments);
  var var2 = _nonCommentArg(2, 2, arguments);
  var comment = _commentArg(2, arguments);
  chai.assert.notEqual(var1, var2, comment);
}

/**
 * Converts from JSUnit assertTrue to chai.assert.isTrue.
 */
function assertTrue() {
  _validateArguments(1, arguments);
  var commentArg = _commentArg(1, arguments);
  var booleanValue = _nonCommentArg(1, 1, arguments);
  if (typeof(booleanValue) != 'boolean') {
    throw Error('Bad argument to assertTrue(boolean)');
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
    throw Error('Bad argument to assertFalse(boolean)');
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

function assertNotNull() {
  _validateArguments(1, arguments);
  var commentArg = _commentArg(1, arguments);
  var val = _nonCommentArg(1, 1, arguments);
  chai.assert.isNotNull(val, commentArg);
}

function assertNotNullNorUndefined() {
  assertNotNull(arguments);
}

function assert() {
  chai.assert(arguments);
}

function assertUndefined() {
  _validateArguments(1, arguments);
  var commentArg = _commentArg(1, arguments);
  var val = _nonCommentArg(1, 1, arguments);
  chai.assert.isUndefined(val, commentArg);
}

function assertNotUndefined() {
  _validateArguments(1, arguments);
  var commentArg = _commentArg(1, arguments);
  var val = _nonCommentArg(1, 1, arguments);
  chai.assert.isDefined(val, commentArg);
}

function assertArrayEquals() {
  _validateArguments(2, arguments);
  var var1 = _nonCommentArg(1, 2, arguments);
  var var2 = _nonCommentArg(2, 2, arguments);
  isEqualArrays(var1, var2);
}