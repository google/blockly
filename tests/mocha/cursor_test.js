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
  suite('Movement', function () {
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
  suite('Searching', function () {
    setup(function () {
      sharedTestSetup.call(this);
      Blockly.defineBlocksWithJsonArray([
        {
          'type': 'empty_block',
          'message0': '',
        },
        {
          'type': 'stack_block',
          'message0': '',
          'previousStatement': null,
          'nextStatement': null,
        },
        {
          'type': 'row_block',
          'message0': '%1',
          'args0': [
            {
              'type': 'input_value',
              'name': 'INPUT',
            },
          ],
          'output': null,
        },
        {
          'type': 'statement_block',
          'message0': '%1',
          'args0': [
            {
              'type': 'input_statement',
              'name': 'STATEMENT',
            },
          ],
          'previousStatement': null,
          'nextStatement': null,
        },
        {
          'type': 'c_hat_block',
          'message0': '%1',
          'args0': [
            {
              'type': 'input_statement',
              'name': 'STATEMENT',
            },
          ],
        },
      ]);
      this.workspace = Blockly.inject('blocklyDiv', {});
      this.cursor = this.workspace.getCursor();
    });
    teardown(function () {
      sharedTestTeardown.call(this);
    });
    suite('one empty block', function () {
      setup(function () {
        this.blockA = this.workspace.newBlock('empty_block');
      });
      teardown(function () {
        this.workspace.clear();
      });
      test('getFirstNode', function () {
        const node = this.cursor.getFirstNode();
        assert.equal(node.getLocation(), this.blockA);
      });
      test('getLastNode', function () {
        const node = this.cursor.getLastNode();
        assert.equal(node.getLocation(), this.blockA);
      });
    });

    suite('one stack block', function () {
      setup(function () {
        this.blockA = this.workspace.newBlock('stack_block');
      });
      teardown(function () {
        this.workspace.clear();
      });
      test('getFirstNode', function () {
        const node = this.cursor.getFirstNode();
        assert.equal(node.getLocation(), this.blockA.previousConnection);
      });
      test('getLastNode', function () {
        const node = this.cursor.getLastNode();
        assert.equal(node.getLocation(), this.blockA.nextConnection);
      });
    });

    suite('one row block', function () {
      setup(function () {
        this.blockA = this.workspace.newBlock('row_block');
      });
      teardown(function () {
        this.workspace.clear();
      });
      test('getFirstNode', function () {
        const node = this.cursor.getFirstNode();
        assert.equal(node.getLocation(), this.blockA.outputConnection);
      });
      test('getLastNode', function () {
        const node = this.cursor.getLastNode();
        assert.equal(node.getLocation(), this.blockA.inputList[0].connection);
      });
    });
    suite('one c-hat block', function () {
      setup(function () {
        this.blockA = this.workspace.newBlock('c_hat_block');
      });
      teardown(function () {
        this.workspace.clear();
      });
      test('getFirstNode', function () {
        const node = this.cursor.getFirstNode();
        assert.equal(node.getLocation(), this.blockA);
      });
      test('getLastNode', function () {
        const node = this.cursor.getLastNode();
        assert.equal(node.getLocation(), this.blockA.inputList[0].connection);
      });
    });

    suite('multiblock stack', function () {
      setup(function () {
        const state = {
          'blocks': {
            'languageVersion': 0,
            'blocks': [
              {
                'type': 'stack_block',
                'id': 'A',
                'x': 0,
                'y': 0,
                'next': {
                  'block': {
                    'type': 'stack_block',
                    'id': 'B',
                  },
                },
              },
            ],
          },
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
      });
      teardown(function () {
        this.workspace.clear();
      });
      test('getFirstNode', function () {
        const node = this.cursor.getFirstNode();
        const blockA = this.workspace.getBlockById('A');
        assert.equal(node.getLocation(), blockA.previousConnection);
      });
      test('getLastNode', function () {
        const node = this.cursor.getLastNode();
        const blockB = this.workspace.getBlockById('B');
        assert.equal(node.getLocation(), blockB.nextConnection);
      });
    });

    suite('multiblock row', function () {
      setup(function () {
        const state = {
          'blocks': {
            'languageVersion': 0,
            'blocks': [
              {
                'type': 'row_block',
                'id': 'A',
                'x': 0,
                'y': 0,
                'inputs': {
                  'INPUT': {
                    'block': {
                      'type': 'row_block',
                      'id': 'B',
                    },
                  },
                },
              },
            ],
          },
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
      });
      teardown(function () {
        this.workspace.clear();
      });
      test('getFirstNode', function () {
        const node = this.cursor.getFirstNode();
        const blockA = this.workspace.getBlockById('A');
        assert.equal(node.getLocation(), blockA.outputConnection);
      });
      test('getLastNode', function () {
        const node = this.cursor.getLastNode();
        const blockB = this.workspace.getBlockById('B');
        assert.equal(node.getLocation(), blockB.inputList[0].connection);
      });
    });
    suite('two stacks', function () {
      setup(function () {
        const state = {
          'blocks': {
            'languageVersion': 0,
            'blocks': [
              {
                'type': 'stack_block',
                'id': 'A',
                'x': 0,
                'y': 0,
                'next': {
                  'block': {
                    'type': 'stack_block',
                    'id': 'B',
                  },
                },
              },
              {
                'type': 'stack_block',
                'id': 'C',
                'x': 100,
                'y': 100,
                'next': {
                  'block': {
                    'type': 'stack_block',
                    'id': 'D',
                  },
                },
              },
            ],
          },
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
      });
      teardown(function () {
        this.workspace.clear();
      });
      test('getFirstNode', function () {
        const node = this.cursor.getFirstNode();
        const location = node.getLocation();
        const previousConnection =
          this.workspace.getBlockById('A').previousConnection;
        assert.equal(location, previousConnection);
      });
      test('getLastNode', function () {
        const node = this.cursor.getLastNode();
        const location = node.getLocation();
        const nextConnection = this.workspace.getBlockById('D').nextConnection;
        assert.equal(location, nextConnection);
      });
    });
  });
  suite.only('Get next node', function () {
    setup(function () {
      sharedTestSetup.call(this);
      Blockly.defineBlocksWithJsonArray([
        {
          'type': 'empty_block',
          'message0': '',
        },
        {
          'type': 'stack_block',
          'message0': '%1',
          'args0': [
            {
              'type': 'field_input',
              'name': 'FIELD',
              'text': 'default',
            },
          ],
          'previousStatement': null,
          'nextStatement': null,
        },
        {
          'type': 'row_block',
          'message0': '%1 %2',
          'args0': [
            {
              'type': 'field_input',
              'name': 'FIELD',
              'text': 'default',
            },
            {
              'type': 'input_value',
              'name': 'INPUT',
            },
          ],
          'output': null,
        },
      ]);
      this.workspace = Blockly.inject('blocklyDiv', {});
      this.cursor = this.workspace.getCursor();
      this.neverValid = () => false;
      this.alwaysValid = () => true;
      this.isConnection = (node) => {
        return node && node.isConnection();
      };
    });
    teardown(function () {
      sharedTestTeardown.call(this);
    });
    suite('stack', function () {
      setup(function () {
        const state = {
          'blocks': {
            'languageVersion': 0,
            'blocks': [
              {
                'type': 'stack_block',
                'id': 'A',
                'x': 0,
                'y': 0,
                'next': {
                  'block': {
                    'type': 'stack_block',
                    'id': 'B',
                    'next': {
                      'block': {
                        'type': 'stack_block',
                        'id': 'C',
                      },
                    },
                  },
                },
              },
            ],
          },
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
        this.blockA = this.workspace.getBlockById('A');
        this.blockB = this.workspace.getBlockById('B');
        this.blockC = this.workspace.getBlockById('C');
      });
      teardown(function () {
        this.workspace.clear();
      });
      test('Never valid - start at top', function () {
        const startNode = ASTNode.createConnectionNode(
          this.blockA.previousConnection,
        );
        const nextNode = this.cursor.getNextNode(
          startNode,
          this.neverValid,
          false,
        );
        assert.isNull(nextNode);
      });
      test('Never valid - start in middle', function () {
        const startNode = ASTNode.createBlockNode(this.blockB);
        const nextNode = this.cursor.getNextNode(
          startNode,
          this.neverValid,
          false,
        );
        assert.isNull(nextNode);
      });
      test('Never valid - start at end', function () {
        const startNode = ASTNode.createConnectionNode(
          this.blockC.nextConnection,
        );
        const nextNode = this.cursor.getNextNode(
          startNode,
          this.neverValid,
          false,
        );
        assert.isNull(nextNode);
      });

      test('Always valid - start at top', function () {
        const startNode = ASTNode.createConnectionNode(
          this.blockA.previousConnection,
        );
        const nextNode = this.cursor.getNextNode(
          startNode,
          this.alwaysValid,
          false,
        );
        assert.equal(nextNode.getLocation(), this.blockA);
      });
      test('Always valid - start in middle', function () {
        const startNode = ASTNode.createBlockNode(this.blockB);
        const nextNode = this.cursor.getNextNode(
          startNode,
          this.alwaysValid,
          false,
        );
        assert.equal(nextNode.getLocation(), this.blockB.getField('FIELD'));
      });
      test('Always valid - start at end', function () {
        const startNode = ASTNode.createConnectionNode(
          this.blockC.nextConnection,
        );
        const nextNode = this.cursor.getNextNode(
          startNode,
          this.alwaysValid,
          false,
        );
        assert.isNull(nextNode);
      });

      test('Valid if connection - start at top', function () {
        const startNode = ASTNode.createConnectionNode(
          this.blockA.previousConnection,
        );
        const nextNode = this.cursor.getNextNode(
          startNode,
          this.isConnection,
          false,
        );
        assert.equal(nextNode.getLocation(), this.blockA.nextConnection);
      });
      test('Valid if connection - start in middle', function () {
        const startNode = ASTNode.createBlockNode(this.blockB);
        const nextNode = this.cursor.getNextNode(
          startNode,
          this.isConnection,
          false,
        );
        assert.equal(nextNode.getLocation(), this.blockB.nextConnection);
      });
      test('Valid if connection - start at end', function () {
        const startNode = ASTNode.createConnectionNode(
          this.blockC.nextConnection,
        );
        const nextNode = this.cursor.getNextNode(
          startNode,
          this.isConnection,
          false,
        );
        assert.isNull(nextNode);
      });
      test('Never valid - start at end - with loopback', function () {
        const startNode = ASTNode.createConnectionNode(
          this.blockC.nextConnection,
        );
        const nextNode = this.cursor.getNextNode(
          startNode,
          this.neverValid,
          true,
        );
        assert.isNull(nextNode);
      });
      test('Always valid - start at end - with loopback', function () {
        const startNode = ASTNode.createConnectionNode(
          this.blockC.nextConnection,
        );
        const nextNode = this.cursor.getNextNode(
          startNode,
          this.alwaysValid,
          true,
        );
        assert.equal(nextNode.getLocation(), this.blockA.previousConnection);
      });
  
      test('Valid if connection - start at end - with loopback', function () {
        const startNode = ASTNode.createConnectionNode(
          this.blockC.nextConnection,
        );
        const nextNode = this.cursor.getNextNode(
          startNode,
          this.isConnection,
          true,
        );
        // todo
        assert.equal(nextNode.getLocation(), this.blockA.previousConnection);
      });
    });
  });
});