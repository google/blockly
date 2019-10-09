/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* exported assertEquals, assertNotEquals, assertArrayEquals, assertTrue, assertFalse,
   assertNull, assertNotNull, assertNotNullNorUndefined, assert,
   isEqualArrays, assertUndefined, assertNotUndefined,
   defineRowBlock, defineStackBlock, defineStatementBlock */
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

function defineStackBlock() {
  Blockly.defineBlocksWithJsonArray([{
    "type": "stack_block",
    "message0": "",
    "previousStatement": null,
    "nextStatement": null
  }]);
}

function defineRowBlock() {
  Blockly.defineBlocksWithJsonArray([{
    "type": "row_block",
    "message0": "%1",
    "args0": [
      {
        "type": "input_value",
        "name": "INPUT"
      }
    ],
    "output": null
  }]);
}

function defineStatementBlock() {
  Blockly.defineBlocksWithJsonArray([{
    "type": "statement_block",
    "message0": "%1",
    "args0": [
      {
        "type": "input_statement",
        "name": "NAME"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  }]);
}
