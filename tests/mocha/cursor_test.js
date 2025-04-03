/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ASTNode} from '../../build/src/core/keyboard_nav/ast_node.js';
import {assert} from '../../node_modules/chai/chai.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Cursor', function () {
  setup(function () {
    sharedTestSetup.call(this);
    Blockly.defineBlocksWithJsonArray([
      {
        'type': 'input_statement',
        'message0': '%1 %2 %3 %4',
        'args0': [
          {
            'type': 'field_input',
            'name': 'NAME1',
            'text': 'default',
          },
          {
            'type': 'field_input',
            'name': 'NAME2',
            'text': 'default',
          },
          {
            'type': 'input_value',
            'name': 'NAME3',
          },
          {
            'type': 'input_statement',
            'name': 'NAME4',
          },
        ],
        'previousStatement': null,
        'nextStatement': null,
        'colour': 230,
        'tooltip': '',
        'helpUrl': '',
      },
      {
        'type': 'field_input',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_input',
            'name': 'NAME',
            'text': 'default',
          },
        ],
        'output': null,
        'colour': 230,
        'tooltip': '',
        'helpUrl': '',
      },
    ]);
    this.workspace = Blockly.inject('blocklyDiv', {});
    this.cursor = this.workspace.getCursor();
    const blockA = this.workspace.newBlock('input_statement');
    const blockB = this.workspace.newBlock('input_statement');
    const blockC = this.workspace.newBlock('input_statement');
    const blockD = this.workspace.newBlock('input_statement');
    const blockE = this.workspace.newBlock('field_input');

    blockA.nextConnection.connect(blockB.previousConnection);
    blockA.inputList[0].connection.connect(blockE.outputConnection);
    blockB.inputList[1].connection.connect(blockC.previousConnection);
    this.cursor.drawer = null;
    this.blocks = {
      A: blockA,
      B: blockB,
      C: blockC,
      D: blockD,
      E: blockE,
    };
  });
  teardown(function () {
    sharedTestTeardown.call(this);
  });

  test('Next - From a Previous connection go to the next block', function () {
    const prevNode = ASTNode.createConnectionNode(
      this.blocks.A.previousConnection,
    );
    this.cursor.setCurNode(prevNode);
    this.cursor.next();
    const curNode = this.cursor.getCurNode();
    assert.equal(curNode.getLocation(), this.blocks.A);
  });
  test('Next - From a block go to its statement input', function () {
    const prevNode = ASTNode.createBlockNode(this.blocks.B);
    this.cursor.setCurNode(prevNode);
    this.cursor.next();
    const curNode = this.cursor.getCurNode();
    assert.equal(
      curNode.getLocation(),
      this.blocks.B.getInput('NAME4').connection,
    );
  });

  test('In - From output connection', function () {
    const fieldBlock = this.blocks.E;
    const outputNode = ASTNode.createConnectionNode(
      fieldBlock.outputConnection,
    );
    this.cursor.setCurNode(outputNode);
    this.cursor.in();
    const curNode = this.cursor.getCurNode();
    assert.equal(curNode.getLocation(), fieldBlock);
  });

  test('Prev - From previous connection does not skip over next connection', function () {
    const prevConnection = this.blocks.B.previousConnection;
    const prevConnectionNode = ASTNode.createConnectionNode(prevConnection);
    this.cursor.setCurNode(prevConnectionNode);
    this.cursor.prev();
    const curNode = this.cursor.getCurNode();
    assert.equal(curNode.getLocation(), this.blocks.A.nextConnection);
  });

  test('Out - From field does not skip over block node', function () {
    const field = this.blocks.E.inputList[0].fieldRow[0];
    const fieldNode = ASTNode.createFieldNode(field);
    this.cursor.setCurNode(fieldNode);
    this.cursor.out();
    const curNode = this.cursor.getCurNode();
    assert.equal(curNode.getLocation(), this.blocks.E);
  });
});
