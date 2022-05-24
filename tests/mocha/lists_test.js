/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.lists');

const {runSerializationTestSuite} = goog.require('Blockly.test.helpers.serialization');
const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');
const {ConnectionType} = goog.require('Blockly.ConnectionType');
const {defineStatementBlock} = goog.require('Blockly.test.helpers.blockDefinitions');


suite('Lists', function() {
  setup(function() {
    defineStatementBlock();
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('ListsGetIndex', function() {
    /**
     * Test cases for serialization tests.
     * @type {Array<SerializationTestCase>}
     */
    const testCases = [
      {
        title: 'JSON not requiring mutations',
        json: {
          type: 'lists_getIndex',
          id: '1',
          fields: {MODE: 'GET', WHERE: 'FIRST'},
        },
        assertBlockStructure: (block) => {
          chai.assert.equal(block.type, 'lists_getIndex');
          chai.assert.exists(block.outputConnection);
        },
      },
      {
        title: 'JSON requiring mutations',
        json: {
          type: 'lists_getIndex',
          id: '1',
          extraState: {isStatement: true},
          fields: {MODE: 'REMOVE', WHERE: 'FROM_START'},
        },
        assertBlockStructure: (block) => {
          chai.assert.equal(block.type, 'lists_getIndex');
          chai.assert.isNotTrue(block.outputConnection);
          chai.assert.isTrue(
            block.getInput('AT').type === ConnectionType.INPUT_VALUE
          );
        },
      },
      {
        title:
          'JSON requiring mutations and extra state for previous connection',
        json: {
          type: 'statement_block',
          id: '1',
          next: {
            block: {
              type: 'lists_getIndex',
              id: '2',
              extraState: {isStatement: true},
              fields: {MODE: 'REMOVE', WHERE: 'FROM_START'},
            },
          },
        },
        assertBlockStructure: (block) => {},
      },
      {
        title:
          'JSON requiring mutations with XML extra state',
        json: {
          type: 'statement_block',
          id: '1',
          next: {
            block: {
              type: 'lists_getIndex',
              id: '2',
              extraState: '<mutation statement="true" at="true"></mutation>',
              fields: {MODE: 'REMOVE', WHERE: 'FROM_START'},
            },
          },
        },
        expectedJson: {
          type: 'statement_block',
          id: '1',
          next: {
            block: {
              type: 'lists_getIndex',
              id: '2',
              extraState: {isStatement: true},
              fields: {MODE: 'REMOVE', WHERE: 'FROM_START'},
            },
          },
        },
        assertBlockStructure: (block) => {},
      },
    ];
    runSerializationTestSuite(testCases);
  });
});
