/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/* exported assertArrayEquals, defineRowBlock, defineStackBlock,
   defineStatementBlock, createTestBlock */

/**
 * Check that two arrays have the same content.
 * @param {!Array.<string>} array1 The first array.
 * @param {!Array.<string>} array2 The second array.
 * @param {?string} opt_message Optional message to pass into assert.
 */
function isEqualArrays(array1, array2, opt_message) {
  chai.assert.equal(array1.length, array2.length, opt_message);
  for (var i = 0; i < array1.length; i++) {
    chai.assert.equal(array1[i], array2[i], opt_message);
  }
}

function assertArrayEquals(actualArray, expectedArray, opt_message) {
  isEqualArrays(actualArray, expectedArray, opt_message);
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

function createTestBlock() {
  return {
    id: 'test',
    rendered: false,
    workspace: {
      rendered: false
    }
  };
}

