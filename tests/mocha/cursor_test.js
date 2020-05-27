/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Cursor', function() {
  setup(function() {
    Blockly.defineBlocksWithJsonArray([{
      "type": "input_statement",
      "message0": "%1 %2 %3 %4",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "default"
        },
        {
          "type": "field_input",
          "name": "NAME",
          "text": "default"
        },
        {
          "type": "input_value",
          "name": "NAME"
        },
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
    },
    {
      "type": "field_input",
      "message0": "%1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "default"
        }
      ],
      "output": null,
      "colour": 230,
      "tooltip": "",
      "helpUrl": ""
    }
    ]);
    this.workspace = Blockly.inject('blocklyDiv', {});
    this.cursor = this.workspace.getCursor();
    var blockA = this.workspace.newBlock('input_statement');
    var blockB = this.workspace.newBlock('input_statement');
    var blockC = this.workspace.newBlock('input_statement');
    var blockD = this.workspace.newBlock('input_statement');
    var blockE = this.workspace.newBlock('field_input');

    blockA.nextConnection.connect(blockB.previousConnection);
    blockA.inputList[0].connection.connect(blockE.outputConnection);
    blockB.inputList[1].connection.connect(blockC.previousConnection);
    this.cursor.drawer_ = null;
    this.blocks = {
      A: blockA,
      B: blockB,
      C: blockC,
      D: blockD,
      E: blockE
    };
  });
  teardown(function() {
    delete Blockly.Blocks['input_statement'];
    delete Blockly.Blocks['field_input'];

    this.workspace.dispose();
  });

  test('Next - From a Previous skip over next connection and block', function() {
    var prevNode = Blockly.ASTNode.createConnectionNode(this.blocks.A.previousConnection);
    this.cursor.setCurNode(prevNode);
    this.cursor.next();
    var curNode = this.cursor.getCurNode();
    chai.assert.equal(curNode.getLocation(), this.blocks.B.previousConnection);
  });
  test('Next - From last block in a stack go to next connection', function() {
    var prevNode = Blockly.ASTNode.createConnectionNode(this.blocks.B.previousConnection);
    this.cursor.setCurNode(prevNode);
    this.cursor.next();
    var curNode = this.cursor.getCurNode();
    chai.assert.equal(curNode.getLocation(), this.blocks.B.nextConnection);
  });

  test('In - From output connection', function() {
    var fieldBlock = this.blocks.E;
    var outputNode = Blockly.ASTNode.createConnectionNode(fieldBlock.outputConnection);
    this.cursor.setCurNode(outputNode);
    this.cursor.in();
    var curNode = this.cursor.getCurNode();
    chai.assert.equal(curNode.getLocation(), fieldBlock.inputList[0].fieldRow[0]);
  });

  test('Prev - From previous connection skip over next connection', function() {
    var prevConnection = this.blocks.B.previousConnection;
    var prevConnectionNode = Blockly.ASTNode.createConnectionNode(prevConnection);
    this.cursor.setCurNode(prevConnectionNode);
    this.cursor.prev();
    var curNode = this.cursor.getCurNode();
    chai.assert.equal(curNode.getLocation(), this.blocks.A.previousConnection);
  });

  test('Out - From field skip over block node', function() {
    var field = this.blocks.E.inputList[0].fieldRow[0];
    var fieldNode = Blockly.ASTNode.createFieldNode(field);
    this.cursor.setCurNode(fieldNode);
    this.cursor.out();
    var curNode = this.cursor.getCurNode();
    chai.assert.equal(curNode.getLocation(), this.blocks.E.outputConnection);
  });
});
