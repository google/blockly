/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.astNode');

const {ASTNode} = goog.require('Blockly.ASTNode');
const {sharedTestSetup, sharedTestTeardown, workspaceTeardown} = goog.require('Blockly.test.helpers.setupTeardown');


suite('ASTNode', function() {
  setup(function() {
    sharedTestSetup.call(this);
    Blockly.defineBlocksWithJsonArray([{
      "type": "input_statement",
      "message0": "%1 %2 %3 %4",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "default",
        },
        {
          "type": "field_input",
          "name": "NAME",
          "text": "default",
        },
        {
          "type": "input_value",
          "name": "NAME",
        },
        {
          "type": "input_statement",
          "name": "NAME",
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "",
      "helpUrl": "",
    },
    {
      "type": "value_input",
      "message0": "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "NAME",
        },
      ],
      "colour": 230,
      "tooltip": "",
      "helpUrl": "",
    },
    {
      "type": "field_input",
      "message0": "%1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "default",
        },
      ],
      "output": null,
      "colour": 230,
      "tooltip": "",
      "helpUrl": "",
    },
    ]);
    this.workspace = new Blockly.Workspace();
    this.cursor = this.workspace.cursor;
    const statementInput1 = this.workspace.newBlock('input_statement');
    const statementInput2 = this.workspace.newBlock('input_statement');
    const statementInput3 = this.workspace.newBlock('input_statement');
    const statementInput4 = this.workspace.newBlock('input_statement');
    const fieldWithOutput = this.workspace.newBlock('field_input');
    const valueInput = this.workspace.newBlock('value_input');

    statementInput1.nextConnection.connect(statementInput2.previousConnection);
    statementInput1.inputList[0].connection
        .connect(fieldWithOutput.outputConnection);
    statementInput2.inputList[1].connection
        .connect(statementInput3.previousConnection);

    this.blocks = {
      statementInput1: statementInput1,
      statementInput2: statementInput2,
      statementInput3: statementInput3,
      statementInput4: statementInput4,
      fieldWithOutput: fieldWithOutput,
      valueInput: valueInput,
    };
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('HelperFunctions', function() {
    test('findNextForInput_', function() {
      const input = this.blocks.statementInput1.inputList[0];
      const input2 = this.blocks.statementInput1.inputList[1];
      const connection = input.connection;
      const node = ASTNode.createConnectionNode(connection);
      const newASTNode = node.findNextForInput_(input);
      chai.assert.equal(newASTNode.getLocation(), input2.connection);
    });

    test('findPrevForInput_', function() {
      const input = this.blocks.statementInput1.inputList[0];
      const input2 = this.blocks.statementInput1.inputList[1];
      const connection = input2.connection;
      const node = ASTNode.createConnectionNode(connection);
      const newASTNode = node.findPrevForInput_(input2);
      chai.assert.equal(newASTNode.getLocation(), input.connection);
    });

    test('findNextForField_', function() {
      const field = this.blocks.statementInput1.inputList[0].fieldRow[0];
      const field2 = this.blocks.statementInput1.inputList[0].fieldRow[1];
      const node = ASTNode.createFieldNode(field);
      const newASTNode = node.findNextForField_(field);
      chai.assert.equal(newASTNode.getLocation(), field2);
    });

    test('findPrevForField_', function() {
      const field = this.blocks.statementInput1.inputList[0].fieldRow[0];
      const field2 = this.blocks.statementInput1.inputList[0].fieldRow[1];
      const node = ASTNode.createFieldNode(field2);
      const newASTNode = node.findPrevForField_(field2);
      chai.assert.equal(newASTNode.getLocation(), field);
    });

    test('navigateBetweenStacks_Forward', function() {
      const node = new ASTNode(
          ASTNode.types.NEXT, this.blocks.statementInput1.nextConnection);
      const newASTNode = node.navigateBetweenStacks_(true);
      chai.assert.equal(newASTNode.getLocation(), this.blocks.statementInput4);
    });

    test('navigateBetweenStacks_Backward', function() {
      const node = new ASTNode(
          ASTNode.types.BLOCK, this.blocks.statementInput4);
      const newASTNode = node.navigateBetweenStacks_(false);
      chai.assert.equal(newASTNode.getLocation(), this.blocks.statementInput1);
    });
    test('getOutAstNodeForBlock_', function() {
      const node = new ASTNode(
          ASTNode.types.BLOCK, this.blocks.statementInput2);
      const newASTNode = node.getOutAstNodeForBlock_(this.blocks.statementInput2);
      chai.assert.equal(newASTNode.getLocation(), this.blocks.statementInput1);
    });
    test('getOutAstNodeForBlock_OneBlock', function() {
      const node = new ASTNode(
          ASTNode.types.BLOCK, this.blocks.statementInput4);
      const newASTNode = node.getOutAstNodeForBlock_(this.blocks.statementInput4);
      chai.assert.equal(newASTNode.getLocation(), this.blocks.statementInput4);
    });
    test('findFirstFieldOrInput_', function() {
      const node = new ASTNode(
          ASTNode.types.BLOCK, this.blocks.statementInput4);
      const field = this.blocks.statementInput4.inputList[0].fieldRow[0];
      const newASTNode = node.findFirstFieldOrInput_(this.blocks.statementInput4);
      chai.assert.equal(newASTNode.getLocation(), field);
    });
  });

  suite('NavigationFunctions', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        "type": "top_connection",
        "message0": "",
        "previousStatement": null,
        "colour": 230,
        "tooltip": "",
        "helpUrl": "",
      },
      {
        "type": "start_block",
        "message0": "",
        "nextStatement": null,
        "colour": 230,
        "tooltip": "",
        "helpUrl": "",
      },
      {
        "type": "fields_and_input",
        "message0": "%1 hi %2 %3 %4",
        "args0": [
          {
            "type": "field_input",
            "name": "NAME",
            "text": "default",
          },
          {
            "type": "input_dummy",
          },
          {
            "type": "field_input",
            "name": "NAME",
            "text": "default",
          },
          {
            "type": "input_value",
            "name": "NAME",
          },
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "",
        "helpUrl": "",
      },
      {
        "type": "two_fields",
        "message0": "%1 hi",
        "args0": [
          {
            "type": "field_input",
            "name": "NAME",
            "text": "default",
          },
        ],
        "colour": 230,
        "tooltip": "",
        "helpUrl": "",
      },
      {
        "type": "fields_and_input2",
        "message0": "%1 %2 %3 hi %4 bye",
        "args0": [
          {
            "type": "input_value",
            "name": "NAME",
          },
          {
            "type": "field_input",
            "name": "NAME",
            "text": "default",
          },
          {
            "type": "input_value",
            "name": "NAME",
          },
          {
            "type": "input_statement",
            "name": "NAME",
          },
        ],
        "colour": 230,
        "tooltip": "",
        "helpUrl": "",
      },
      {
        "type": "dummy_input",
        "message0": "Hello",
        "colour": 230,
        "tooltip": "",
        "helpUrl": "",
      },
      {
        "type": "dummy_inputValue",
        "message0": "Hello %1  %2",
        "args0": [
          {
            "type": "input_dummy",
          },
          {
            "type": "input_value",
            "name": "NAME",
          },
        ],
        "colour": 230,
        "tooltip": "",
        "helpUrl": "",
      },
      {
        "type": "output_next",
        "message0": "",
        "output": null,
        "colour": 230,
        "tooltip": "",
        "helpUrl": "",
        "nextStatement": null,
      }]);
      const noNextConnection = this.workspace.newBlock('top_connection');
      const fieldAndInputs = this.workspace.newBlock('fields_and_input');
      const twoFields = this.workspace.newBlock('two_fields');
      const fieldAndInputs2 = this.workspace.newBlock('fields_and_input2');
      const noPrevConnection = this.workspace.newBlock('start_block');
      this.blocks.noNextConnection = noNextConnection;
      this.blocks.fieldAndInputs = fieldAndInputs;
      this.blocks.twoFields = twoFields;
      this.blocks.fieldAndInputs2 = fieldAndInputs2;
      this.blocks.noPrevConnection = noPrevConnection;

      const dummyInput = this.workspace.newBlock('dummy_input');
      const dummyInputValue = this.workspace.newBlock('dummy_inputValue');
      const fieldWithOutput2 = this.workspace.newBlock('field_input');
      this.blocks.dummyInput = dummyInput;
      this.blocks.dummyInputValue = dummyInputValue;
      this.blocks.fieldWithOutput2 = fieldWithOutput2;

      const secondBlock = this.workspace.newBlock('input_statement');
      const outputNextBlock = this.workspace.newBlock('output_next');
      this.blocks.secondBlock = secondBlock;
      this.blocks.outputNextBlock = outputNextBlock;
    });
    suite('Next', function() {
      setup(function() {
        this.singleBlockWorkspace = new Blockly.Workspace();
        const singleBlock = this.singleBlockWorkspace.newBlock('two_fields');
        this.blocks.singleBlock = singleBlock;
      });
      teardown(function() {
        workspaceTeardown.call(this, this.singleBlockWorkspace);
      });

      test('fromPreviousToBlock', function() {
        const prevConnection = this.blocks.statementInput1.previousConnection;
        const node = ASTNode.createConnectionNode(prevConnection);
        const nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromBlockToNext', function() {
        const nextConnection = this.blocks.statementInput1.nextConnection;
        const node = ASTNode.createBlockNode(this.blocks.statementInput1);
        const nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), nextConnection);
      });
      test('fromBlockToNull', function() {
        const node = ASTNode.createBlockNode(this.blocks.noNextConnection);
        const nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
      test('fromNextToPrevious', function() {
        const nextConnection = this.blocks.statementInput1.nextConnection;
        const prevConnection = this.blocks.statementInput2.previousConnection;
        const node = ASTNode.createConnectionNode(nextConnection);
        const nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), prevConnection);
      });
      test('fromNextToNull', function() {
        const nextConnection = this.blocks.statementInput2.nextConnection;
        const node = ASTNode.createConnectionNode(nextConnection);
        const nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
      test('fromInputToInput', function() {
        const input = this.blocks.statementInput1.inputList[0];
        const inputConnection = this.blocks.statementInput1.inputList[1].connection;
        const node = ASTNode.createInputNode(input);
        const nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), inputConnection);
      });
      test('fromInputToStatementInput', function() {
        const input = this.blocks.fieldAndInputs2.inputList[1];
        const inputConnection = this.blocks.fieldAndInputs2.inputList[2].connection;
        const node = ASTNode.createInputNode(input);
        const nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), inputConnection);
      });
      test('fromInputToField', function() {
        const input = this.blocks.fieldAndInputs2.inputList[0];
        const field = this.blocks.fieldAndInputs2.inputList[1].fieldRow[0];
        const node = ASTNode.createInputNode(input);
        const nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), field);
      });
      test('fromInputToNull', function() {
        const input = this.blocks.fieldAndInputs2.inputList[2];
        const node = ASTNode.createInputNode(input);
        const nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
      test('fromOutputToBlock', function() {
        const output = this.blocks.fieldWithOutput.outputConnection;
        const node = ASTNode.createConnectionNode(output);
        const nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), this.blocks.fieldWithOutput);
      });
      test('fromFieldToInput', function() {
        const field = this.blocks.statementInput1.inputList[0].fieldRow[1];
        const inputConnection = this.blocks.statementInput1.inputList[0].connection;
        const node = ASTNode.createFieldNode(field);
        const nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), inputConnection);
      });
      test('fromFieldToField', function() {
        const field = this.blocks.fieldAndInputs.inputList[0].fieldRow[0];
        const node = ASTNode.createFieldNode(field);
        const field2 = this.blocks.fieldAndInputs.inputList[1].fieldRow[0];
        const nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), field2);
      });
      test('fromFieldToNull', function() {
        const field = this.blocks.twoFields.inputList[0].fieldRow[0];
        const node = ASTNode.createFieldNode(field);
        const nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
      test('fromStackToStack', function() {
        const node = ASTNode.createStackNode(this.blocks.statementInput1);
        const nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), this.blocks.statementInput4);
        chai.assert.equal(nextNode.getType(), ASTNode.types.STACK);
      });
      test('fromStackToNull', function() {
        const node = ASTNode.createStackNode(this.blocks.singleBlock);
        const nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
    });

    suite('Previous', function() {
      test('fromPreviousToNull', function() {
        const prevConnection = this.blocks.statementInput1.previousConnection;
        const node = ASTNode.createConnectionNode(prevConnection);
        const prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromPreviousToNext', function() {
        const prevConnection = this.blocks.statementInput2.previousConnection;
        const node = ASTNode.createConnectionNode(prevConnection);
        const prevNode = node.prev();
        const nextConnection = this.blocks.statementInput1.nextConnection;
        chai.assert.equal(prevNode.getLocation(), nextConnection);
      });
      test('fromPreviousToInput', function() {
        const prevConnection = this.blocks.statementInput3.previousConnection;
        const node = ASTNode.createConnectionNode(prevConnection);
        const prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromBlockToPrevious', function() {
        const node = ASTNode.createBlockNode(this.blocks.statementInput1);
        const prevNode = node.prev();
        const prevConnection = this.blocks.statementInput1.previousConnection;
        chai.assert.equal(prevNode.getLocation(), prevConnection);
      });
      test('fromBlockToNull', function() {
        const node = ASTNode.createBlockNode(this.blocks.noPrevConnection);
        const prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromBlockToOutput', function() {
        const node = ASTNode.createBlockNode(this.blocks.fieldWithOutput);
        const prevNode = node.prev();
        const outputConnection = this.blocks.fieldWithOutput.outputConnection;
        chai.assert.equal(prevNode.getLocation(), outputConnection);
      });
      test('fromNextToBlock', function() {
        const nextConnection = this.blocks.statementInput1.nextConnection;
        const node = ASTNode.createConnectionNode(nextConnection);
        const prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromInputToField', function() {
        const input = this.blocks.statementInput1.inputList[0];
        const node = ASTNode.createInputNode(input);
        const prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), input.fieldRow[1]);
      });
      test('fromInputToNull', function() {
        const input = this.blocks.fieldAndInputs2.inputList[0];
        const node = ASTNode.createInputNode(input);
        const prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromInputToInput', function() {
        const input = this.blocks.fieldAndInputs2.inputList[2];
        const inputConnection = this.blocks.fieldAndInputs2.inputList[1].connection;
        const node = ASTNode.createInputNode(input);
        const prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), inputConnection);
      });
      test('fromOutputToNull', function() {
        const output = this.blocks.fieldWithOutput.outputConnection;
        const node = ASTNode.createConnectionNode(output);
        const prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromFieldToNull', function() {
        const field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        const node = ASTNode.createFieldNode(field);
        const prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromFieldToInput', function() {
        const field = this.blocks.fieldAndInputs2.inputList[1].fieldRow[0];
        const inputConnection = this.blocks.fieldAndInputs2.inputList[0].connection;
        const node = ASTNode.createFieldNode(field);
        const prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), inputConnection);
      });
      test('fromFieldToField', function() {
        const field = this.blocks.fieldAndInputs.inputList[1].fieldRow[0];
        const field2 = this.blocks.fieldAndInputs.inputList[0].fieldRow[0];
        const node = ASTNode.createFieldNode(field);
        const prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), field2);
      });
      test('fromStackToStack', function() {
        const node = ASTNode.createStackNode(this.blocks.statementInput4);
        const prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), this.blocks.statementInput1);
        chai.assert.equal(prevNode.getType(), ASTNode.types.STACK);
      });
    });

    suite('In', function() {
      setup(function() {
        this.emptyWorkspace = new Blockly.Workspace();
      });
      teardown(function() {
        workspaceTeardown.call(this, this.emptyWorkspace);
      });

      test('fromInputToOutput', function() {
        const input = this.blocks.statementInput1.inputList[0];
        const node = ASTNode.createInputNode(input);
        const inNode = node.in();
        const outputConnection = this.blocks.fieldWithOutput.outputConnection;
        chai.assert.equal(inNode.getLocation(), outputConnection);
      });
      test('fromInputToNull', function() {
        const input = this.blocks.statementInput2.inputList[0];
        const node = ASTNode.createInputNode(input);
        const inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromInputToPrevious', function() {
        const input = this.blocks.statementInput2.inputList[1];
        const previousConnection = this.blocks.statementInput3.previousConnection;
        const node = ASTNode.createInputNode(input);
        const inNode = node.in();
        chai.assert.equal(inNode.getLocation(), previousConnection);
      });
      test('fromBlockToInput', function() {
        const input = this.blocks.valueInput.inputList[0];
        const node = ASTNode.createBlockNode(this.blocks.valueInput);
        const inNode = node.in();
        chai.assert.equal(inNode.getLocation(), input.connection);
      });
      test('fromBlockToField', function() {
        const node = ASTNode.createBlockNode(this.blocks.statementInput1);
        const inNode = node.in();
        const field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        chai.assert.equal(inNode.getLocation(), field);
      });
      test('fromBlockToPrevious', function() {
        const prevConnection = this.blocks.statementInput4.previousConnection;
        const node = ASTNode.createStackNode(this.blocks.statementInput4);
        const inNode = node.in();
        chai.assert.equal(inNode.getLocation(), prevConnection);
        chai.assert.equal(inNode.getType(), ASTNode.types.PREVIOUS);
      });
      test('fromBlockToNull_DummyInput', function() {
        const node = ASTNode.createBlockNode(this.blocks.dummyInput);
        const inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromBlockToInput_DummyInputValue', function() {
        const node = ASTNode.createBlockNode(this.blocks.dummyInputValue);
        const inputConnection = this.blocks.dummyInputValue.inputList[1].connection;
        const inNode = node.in();
        chai.assert.equal(inNode.getLocation(), inputConnection);
      });
      test('fromOuputToNull', function() {
        const output = this.blocks.fieldWithOutput.outputConnection;
        const node = ASTNode.createConnectionNode(output);
        const inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromFieldToNull', function() {
        const field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        const node = ASTNode.createFieldNode(field);
        const inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromWorkspaceToStack', function() {
        const coordinate = new Blockly.utils.Coordinate(100, 100);
        const node = ASTNode.createWorkspaceNode(this.workspace, coordinate);
        const inNode = node.in();
        chai.assert.equal(inNode.getLocation(), this.workspace.getTopBlocks()[0]);
        chai.assert.equal(inNode.getType(), ASTNode.types.STACK);
      });
      test('fromWorkspaceToNull', function() {
        const coordinate = new Blockly.utils.Coordinate(100, 100);
        const node = ASTNode.createWorkspaceNode(
            this.emptyWorkspace, coordinate);
        const inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromStackToPrevious', function() {
        const node = ASTNode.createStackNode(this.blocks.statementInput1);
        const previous = this.blocks.statementInput1.previousConnection;
        const inNode = node.in();
        chai.assert.equal(inNode.getLocation(), previous);
        chai.assert.equal(inNode.getType(), ASTNode.types.PREVIOUS);
      });
      test('fromStackToOutput', function() {
        const node = ASTNode.createStackNode(this.blocks.fieldWithOutput2);
        const output = this.blocks.fieldWithOutput2.outputConnection;
        const inNode = node.in();
        chai.assert.equal(inNode.getLocation(), output);
        chai.assert.equal(inNode.getType(), ASTNode.types.OUTPUT);
      });
      test('fromStackToBlock', function() {
        const node = ASTNode.createStackNode(this.blocks.dummyInput);
        const inNode = node.in();
        chai.assert.equal(inNode.getLocation(), this.blocks.dummyInput);
        chai.assert.equal(inNode.getType(), ASTNode.types.BLOCK);
      });
    });

    suite('Out', function() {
      setup(function() {
        const secondBlock = this.blocks.secondBlock;
        const outputNextBlock = this.blocks.outputNextBlock;
        this.blocks.noPrevConnection.nextConnection.connect(secondBlock.previousConnection);
        secondBlock.inputList[0].connection
            .connect(outputNextBlock.outputConnection);
      });

      test('fromInputToBlock', function() {
        const input = this.blocks.statementInput1.inputList[0];
        const node = ASTNode.createInputNode(input);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.BLOCK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromOutputToInput', function() {
        const output = this.blocks.fieldWithOutput.outputConnection;
        const node = ASTNode.createConnectionNode(output);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(),
            this.blocks.statementInput1.inputList[0].connection);
      });
      test('fromOutputToStack', function() {
        const output = this.blocks.fieldWithOutput2.outputConnection;
        const node = ASTNode.createConnectionNode(output);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.fieldWithOutput2);
      });
      test('fromFieldToBlock', function() {
        const field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        const node = ASTNode.createFieldNode(field);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.BLOCK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromStackToWorkspace', function() {
        const stub = sinon.stub(this.blocks.statementInput4,
            "getRelativeToSurfaceXY").returns({x: 10, y: 10});
        const node = ASTNode.createStackNode(this.blocks.statementInput4);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.WORKSPACE);
        chai.assert.equal(outNode.wsCoordinate_.x, 10);
        chai.assert.equal(outNode.wsCoordinate_.y, -10);
        stub.restore();
      });
      test('fromPreviousToInput', function() {
        const previous = this.blocks.statementInput3.previousConnection;
        const inputConnection = this.blocks.statementInput2.inputList[1].connection;
        const node = ASTNode.createConnectionNode(previous);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), inputConnection);
      });
      test('fromPreviousToStack', function() {
        const previous = this.blocks.statementInput2.previousConnection;
        const node = ASTNode.createConnectionNode(previous);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromNextToInput', function() {
        const next = this.blocks.statementInput3.nextConnection;
        const inputConnection = this.blocks.statementInput2.inputList[1].connection;
        const node = ASTNode.createConnectionNode(next);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), inputConnection);
      });
      test('fromNextToStack', function() {
        const next = this.blocks.statementInput2.nextConnection;
        const node = ASTNode.createConnectionNode(next);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromNextToStack_NoPreviousConnection', function() {
        const next = this.blocks.secondBlock.nextConnection;
        const node = ASTNode.createConnectionNode(next);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.noPrevConnection);
      });
      /**
       * This is where there is a block with both an output connection and a
       * next connection attached to an input.
       */
      test('fromNextToInput_OutputAndPreviousConnection', function() {
        const next = this.blocks.outputNextBlock.nextConnection;
        const node = ASTNode.createConnectionNode(next);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(),
            this.blocks.secondBlock.inputList[0].connection);
      });
      test('fromBlockToStack', function() {
        const node = ASTNode.createBlockNode(this.blocks.statementInput2);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromBlockToInput', function() {
        const input = this.blocks.statementInput2.inputList[1].connection;
        const node = ASTNode.createBlockNode(this.blocks.statementInput3);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), input);
      });
      test('fromTopBlockToStack', function() {
        const node = ASTNode.createBlockNode(this.blocks.statementInput1);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromBlockToStack_OutputConnection', function() {
        const node = ASTNode.createBlockNode(this.blocks.fieldWithOutput2);
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.fieldWithOutput2);
      });
      test('fromBlockToInput_OutputConnection', function() {
        const node = ASTNode.createBlockNode(this.blocks.outputNextBlock);
        const inputConnection = this.blocks.secondBlock.inputList[0].connection;
        const outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), inputConnection);
      });
    });

    suite('createFunctions', function() {
      test('createFieldNode', function() {
        const field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        const node = ASTNode.createFieldNode(field);
        chai.assert.equal(node.getLocation(), field);
        chai.assert.equal(node.getType(), ASTNode.types.FIELD);
        chai.assert.isFalse(node.isConnection());
      });
      test('createConnectionNode', function() {
        const prevConnection = this.blocks.statementInput4.previousConnection;
        const node = ASTNode.createConnectionNode(prevConnection);
        chai.assert.equal(node.getLocation(), prevConnection);
        chai.assert.equal(node.getType(), ASTNode.types.PREVIOUS);
        chai.assert.isTrue(node.isConnection());
      });
      test('createInputNode', function() {
        const input = this.blocks.statementInput1.inputList[0];
        const node = ASTNode.createInputNode(input);
        chai.assert.equal(node.getLocation(), input.connection);
        chai.assert.equal(node.getType(), ASTNode.types.INPUT);
        chai.assert.isTrue(node.isConnection());
      });
      test('createWorkspaceNode', function() {
        const coordinate = new Blockly.utils.Coordinate(100, 100);
        const node = ASTNode
            .createWorkspaceNode(this.workspace, coordinate);
        chai.assert.equal(node.getLocation(), this.workspace);
        chai.assert.equal(node.getType(), ASTNode.types.WORKSPACE);
        chai.assert.equal(node.getWsCoordinate(), coordinate);
        chai.assert.isFalse(node.isConnection());
      });
      test('createStatementConnectionNode', function() {
        const nextConnection = this.blocks.statementInput1.inputList[1].connection;
        const inputConnection = this.blocks.statementInput1.inputList[1].connection;
        const node = ASTNode.createConnectionNode(nextConnection);
        chai.assert.equal(node.getLocation(), inputConnection);
        chai.assert.equal(node.getType(), ASTNode.types.INPUT);
        chai.assert.isTrue(node.isConnection());
      });
      test('createTopNode-previous', function() {
        const block = this.blocks.statementInput1;
        const topNode = ASTNode.createTopNode(block);
        chai.assert.equal(topNode.getLocation(), block.previousConnection);
      });
      test('createTopNode-block', function() {
        const block = this.blocks.noPrevConnection;
        const topNode = ASTNode.createTopNode(block);
        chai.assert.equal(topNode.getLocation(), block);
      });
      test('createTopNode-output', function() {
        const block = this.blocks.outputNextBlock;
        const topNode = ASTNode.createTopNode(block);
        chai.assert.equal(topNode.getLocation(), block.outputConnection);
      });
    });
  });
});
