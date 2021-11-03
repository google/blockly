/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.astNode');

const {ASTNode} = goog.require('Blockly.ASTNode');
const {sharedTestSetup, sharedTestTeardown, workspaceTeardown} = goog.require('Blockly.test.helpers');


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
      "type": "value_input",
      "message0": "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "NAME"
        }
      ],
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
    this.workspace = new Blockly.Workspace();
    this.cursor = this.workspace.cursor;
    let statementInput1 = this.workspace.newBlock('input_statement');
    let statementInput2 = this.workspace.newBlock('input_statement');
    let statementInput3 = this.workspace.newBlock('input_statement');
    let statementInput4 = this.workspace.newBlock('input_statement');
    let fieldWithOutput = this.workspace.newBlock('field_input');
    let valueInput = this.workspace.newBlock('value_input');

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
      valueInput: valueInput
    };
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('HelperFunctions', function() {
    test('findNextForInput_', function() {
      let input = this.blocks.statementInput1.inputList[0];
      let input2 = this.blocks.statementInput1.inputList[1];
      let connection = input.connection;
      let node = ASTNode.createConnectionNode(connection);
      let newASTNode = node.findNextForInput_(input);
      chai.assert.equal(newASTNode.getLocation(), input2.connection);
    });

    test('findPrevForInput_', function() {
      let input = this.blocks.statementInput1.inputList[0];
      let input2 = this.blocks.statementInput1.inputList[1];
      let connection = input2.connection;
      let node = ASTNode.createConnectionNode(connection);
      let newASTNode = node.findPrevForInput_(input2);
      chai.assert.equal(newASTNode.getLocation(), input.connection);
    });

    test('findNextForField_', function() {
      let field = this.blocks.statementInput1.inputList[0].fieldRow[0];
      let field2 = this.blocks.statementInput1.inputList[0].fieldRow[1];
      let node = ASTNode.createFieldNode(field);
      let newASTNode = node.findNextForField_(field);
      chai.assert.equal(newASTNode.getLocation(), field2);
    });

    test('findPrevForField_', function() {
      let field = this.blocks.statementInput1.inputList[0].fieldRow[0];
      let field2 = this.blocks.statementInput1.inputList[0].fieldRow[1];
      let node = ASTNode.createFieldNode(field2);
      let newASTNode = node.findPrevForField_(field2);
      chai.assert.equal(newASTNode.getLocation(), field);
    });

    test('navigateBetweenStacks_Forward', function() {
      let node = new ASTNode(
          ASTNode.types.NEXT, this.blocks.statementInput1.nextConnection);
      let newASTNode = node.navigateBetweenStacks_(true);
      chai.assert.equal(newASTNode.getLocation(), this.blocks.statementInput4);
    });

    test('navigateBetweenStacks_Backward', function() {
      let node = new ASTNode(
          ASTNode.types.BLOCK, this.blocks.statementInput4);
      let newASTNode = node.navigateBetweenStacks_(false);
      chai.assert.equal(newASTNode.getLocation(), this.blocks.statementInput1);
    });
    test('getOutAstNodeForBlock_', function() {
      let node = new ASTNode(
          ASTNode.types.BLOCK, this.blocks.statementInput2);
      let newASTNode = node.getOutAstNodeForBlock_(this.blocks.statementInput2);
      chai.assert.equal(newASTNode.getLocation(), this.blocks.statementInput1);
    });
    test('getOutAstNodeForBlock_OneBlock', function() {
      let node = new ASTNode(
          ASTNode.types.BLOCK, this.blocks.statementInput4);
      let newASTNode = node.getOutAstNodeForBlock_(this.blocks.statementInput4);
      chai.assert.equal(newASTNode.getLocation(), this.blocks.statementInput4);
    });
    test('findFirstFieldOrInput_', function() {
      let node = new ASTNode(
          ASTNode.types.BLOCK, this.blocks.statementInput4);
      let field = this.blocks.statementInput4.inputList[0].fieldRow[0];
      let newASTNode = node.findFirstFieldOrInput_(this.blocks.statementInput4);
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
        "helpUrl": ""
      },
      {
        "type": "start_block",
        "message0": "",
        "nextStatement": null,
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "fields_and_input",
        "message0": "%1 hi %2 %3 %4",
        "args0": [
          {
            "type": "field_input",
            "name": "NAME",
            "text": "default"
          },
          {
            "type": "input_dummy"
          },
          {
            "type": "field_input",
            "name": "NAME",
            "text": "default"
          },
          {
            "type": "input_value",
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
        "type": "two_fields",
        "message0": "%1 hi",
        "args0": [
          {
            "type": "field_input",
            "name": "NAME",
            "text": "default"
          }
        ],
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "fields_and_input2",
        "message0": "%1 %2 %3 hi %4 bye",
        "args0": [
          {
            "type": "input_value",
            "name": "NAME"
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
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "dummy_input",
        "message0": "Hello",
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "dummy_inputValue",
        "message0": "Hello %1  %2",
        "args0": [
          {
            "type": "input_dummy"
          },
          {
            "type": "input_value",
            "name": "NAME"
          }
        ],
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""
      },
      {
        "type": "output_next",
        "message0": "",
        "output": null,
        "colour": 230,
        "tooltip": "",
        "helpUrl": "",
        "nextStatement": null
      }]);
      let noNextConnection = this.workspace.newBlock('top_connection');
      let fieldAndInputs = this.workspace.newBlock('fields_and_input');
      let twoFields = this.workspace.newBlock('two_fields');
      let fieldAndInputs2 = this.workspace.newBlock('fields_and_input2');
      let noPrevConnection = this.workspace.newBlock('start_block');
      this.blocks.noNextConnection = noNextConnection;
      this.blocks.fieldAndInputs = fieldAndInputs;
      this.blocks.twoFields = twoFields;
      this.blocks.fieldAndInputs2 = fieldAndInputs2;
      this.blocks.noPrevConnection = noPrevConnection;

      let dummyInput = this.workspace.newBlock('dummy_input');
      let dummyInputValue = this.workspace.newBlock('dummy_inputValue');
      let fieldWithOutput2 = this.workspace.newBlock('field_input');
      this.blocks.dummyInput = dummyInput;
      this.blocks.dummyInputValue = dummyInputValue;
      this.blocks.fieldWithOutput2 = fieldWithOutput2;

      let secondBlock = this.workspace.newBlock('input_statement');
      let outputNextBlock = this.workspace.newBlock('output_next');
      this.blocks.secondBlock = secondBlock;
      this.blocks.outputNextBlock = outputNextBlock;
    });
    suite('Next', function() {
      setup(function() {
        this.singleBlockWorkspace = new Blockly.Workspace();
        let singleBlock = this.singleBlockWorkspace.newBlock('two_fields');
        this.blocks.singleBlock = singleBlock;
      });
      teardown(function() {
        workspaceTeardown.call(this, this.singleBlockWorkspace);
      });

      test('fromPreviousToBlock', function() {
        let prevConnection = this.blocks.statementInput1.previousConnection;
        let node = ASTNode.createConnectionNode(prevConnection);
        let nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromBlockToNext', function() {
        let nextConnection = this.blocks.statementInput1.nextConnection;
        let node = ASTNode.createBlockNode(this.blocks.statementInput1);
        let nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), nextConnection);
      });
      test('fromBlockToNull', function() {
        let node = ASTNode.createBlockNode(this.blocks.noNextConnection);
        let nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
      test('fromNextToPrevious', function() {
        let nextConnection = this.blocks.statementInput1.nextConnection;
        let prevConnection = this.blocks.statementInput2.previousConnection;
        let node = ASTNode.createConnectionNode(nextConnection);
        let nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), prevConnection);
      });
      test('fromNextToNull', function() {
        let nextConnection = this.blocks.statementInput2.nextConnection;
        let node = ASTNode.createConnectionNode(nextConnection);
        let nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
      test('fromInputToInput', function() {
        let input = this.blocks.statementInput1.inputList[0];
        let inputConnection = this.blocks.statementInput1.inputList[1].connection;
        let node = ASTNode.createInputNode(input);
        let nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), inputConnection);
      });
      test('fromInputToStatementInput', function() {
        let input = this.blocks.fieldAndInputs2.inputList[1];
        let inputConnection = this.blocks.fieldAndInputs2.inputList[2].connection;
        let node = ASTNode.createInputNode(input);
        let nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), inputConnection);
      });
      test('fromInputToField', function() {
        let input = this.blocks.fieldAndInputs2.inputList[0];
        let field = this.blocks.fieldAndInputs2.inputList[1].fieldRow[0];
        let node = ASTNode.createInputNode(input);
        let nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), field);
      });
      test('fromInputToNull', function() {
        let input = this.blocks.fieldAndInputs2.inputList[2];
        let node = ASTNode.createInputNode(input);
        let nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
      test('fromOutputToBlock', function() {
        let output = this.blocks.fieldWithOutput.outputConnection;
        let node = ASTNode.createConnectionNode(output);
        let nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), this.blocks.fieldWithOutput);
      });
      test('fromFieldToInput', function() {
        let field = this.blocks.statementInput1.inputList[0].fieldRow[1];
        let inputConnection = this.blocks.statementInput1.inputList[0].connection;
        let node = ASTNode.createFieldNode(field);
        let nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), inputConnection);
      });
      test('fromFieldToField', function() {
        let field = this.blocks.fieldAndInputs.inputList[0].fieldRow[0];
        let node = ASTNode.createFieldNode(field);
        let field2 = this.blocks.fieldAndInputs.inputList[1].fieldRow[0];
        let nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), field2);
      });
      test('fromFieldToNull', function() {
        let field = this.blocks.twoFields.inputList[0].fieldRow[0];
        let node = ASTNode.createFieldNode(field);
        let nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
      test('fromStackToStack', function() {
        let node = ASTNode.createStackNode(this.blocks.statementInput1);
        let nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), this.blocks.statementInput4);
        chai.assert.equal(nextNode.getType(), ASTNode.types.STACK);
      });
      test('fromStackToNull', function() {
        let node = ASTNode.createStackNode(this.blocks.singleBlock);
        let nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
    });

    suite('Previous', function() {
      test('fromPreviousToNull', function() {
        let prevConnection = this.blocks.statementInput1.previousConnection;
        let node = ASTNode.createConnectionNode(prevConnection);
        let prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromPreviousToNext', function() {
        let prevConnection = this.blocks.statementInput2.previousConnection;
        let node = ASTNode.createConnectionNode(prevConnection);
        let prevNode = node.prev();
        let nextConnection = this.blocks.statementInput1.nextConnection;
        chai.assert.equal(prevNode.getLocation(), nextConnection);
      });
      test('fromPreviousToInput', function() {
        let prevConnection = this.blocks.statementInput3.previousConnection;
        let node = ASTNode.createConnectionNode(prevConnection);
        let prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromBlockToPrevious', function() {
        let node = ASTNode.createBlockNode(this.blocks.statementInput1);
        let prevNode = node.prev();
        let prevConnection = this.blocks.statementInput1.previousConnection;
        chai.assert.equal(prevNode.getLocation(), prevConnection);
      });
      test('fromBlockToNull', function() {
        let node = ASTNode.createBlockNode(this.blocks.noPrevConnection);
        let prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromBlockToOutput', function() {
        let node = ASTNode.createBlockNode(this.blocks.fieldWithOutput);
        let prevNode = node.prev();
        let outputConnection = this.blocks.fieldWithOutput.outputConnection;
        chai.assert.equal(prevNode.getLocation(), outputConnection);
      });
      test('fromNextToBlock', function() {
        let nextConnection = this.blocks.statementInput1.nextConnection;
        let node = ASTNode.createConnectionNode(nextConnection);
        let prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromInputToField', function() {
        let input = this.blocks.statementInput1.inputList[0];
        let node = ASTNode.createInputNode(input);
        let prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), input.fieldRow[1]);
      });
      test('fromInputToNull', function() {
        let input = this.blocks.fieldAndInputs2.inputList[0];
        let node = ASTNode.createInputNode(input);
        let prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromInputToInput', function() {
        let input = this.blocks.fieldAndInputs2.inputList[2];
        let inputConnection = this.blocks.fieldAndInputs2.inputList[1].connection;
        let node = ASTNode.createInputNode(input);
        let prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), inputConnection);
      });
      test('fromOutputToNull', function() {
        let output = this.blocks.fieldWithOutput.outputConnection;
        let node = ASTNode.createConnectionNode(output);
        let prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromFieldToNull', function() {
        let field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        let node = ASTNode.createFieldNode(field);
        let prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromFieldToInput', function() {
        let field = this.blocks.fieldAndInputs2.inputList[1].fieldRow[0];
        let inputConnection = this.blocks.fieldAndInputs2.inputList[0].connection;
        let node = ASTNode.createFieldNode(field);
        let prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), inputConnection);
      });
      test('fromFieldToField', function() {
        let field = this.blocks.fieldAndInputs.inputList[1].fieldRow[0];
        let field2 = this.blocks.fieldAndInputs.inputList[0].fieldRow[0];
        let node = ASTNode.createFieldNode(field);
        let prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), field2);
      });
      test('fromStackToStack', function() {
        let node = ASTNode.createStackNode(this.blocks.statementInput4);
        let prevNode = node.prev();
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
        let input = this.blocks.statementInput1.inputList[0];
        let node = ASTNode.createInputNode(input);
        let inNode = node.in();
        let outputConnection = this.blocks.fieldWithOutput.outputConnection;
        chai.assert.equal(inNode.getLocation(), outputConnection);
      });
      test('fromInputToNull', function() {
        let input = this.blocks.statementInput2.inputList[0];
        let node = ASTNode.createInputNode(input);
        let inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromInputToPrevious', function() {
        let input = this.blocks.statementInput2.inputList[1];
        let previousConnection = this.blocks.statementInput3.previousConnection;
        let node = ASTNode.createInputNode(input);
        let inNode = node.in();
        chai.assert.equal(inNode.getLocation(), previousConnection);
      });
      test('fromBlockToInput', function() {
        let input = this.blocks.valueInput.inputList[0];
        let node = ASTNode.createBlockNode(this.blocks.valueInput);
        let inNode = node.in();
        chai.assert.equal(inNode.getLocation(), input.connection);
      });
      test('fromBlockToField', function() {
        let node = ASTNode.createBlockNode(this.blocks.statementInput1);
        let inNode = node.in();
        let field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        chai.assert.equal(inNode.getLocation(), field);
      });
      test('fromBlockToPrevious', function() {
        let prevConnection = this.blocks.statementInput4.previousConnection;
        let node = ASTNode.createStackNode(this.blocks.statementInput4);
        let inNode = node.in();
        chai.assert.equal(inNode.getLocation(), prevConnection);
        chai.assert.equal(inNode.getType(), ASTNode.types.PREVIOUS);
      });
      test('fromBlockToNull_DummyInput', function() {
        let node = ASTNode.createBlockNode(this.blocks.dummyInput);
        let inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromBlockToInput_DummyInputValue', function() {
        let node = ASTNode.createBlockNode(this.blocks.dummyInputValue);
        let inputConnection = this.blocks.dummyInputValue.inputList[1].connection;
        let inNode = node.in();
        chai.assert.equal(inNode.getLocation(), inputConnection);
      });
      test('fromOuputToNull', function() {
        let output = this.blocks.fieldWithOutput.outputConnection;
        let node = ASTNode.createConnectionNode(output);
        let inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromFieldToNull', function() {
        let field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        let node = ASTNode.createFieldNode(field);
        let inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromWorkspaceToStack', function() {
        let coordinate = new Blockly.utils.Coordinate(100, 100);
        let node = ASTNode.createWorkspaceNode(this.workspace, coordinate);
        let inNode = node.in();
        chai.assert.equal(inNode.getLocation(), this.workspace.getTopBlocks()[0]);
        chai.assert.equal(inNode.getType(), ASTNode.types.STACK);
      });
      test('fromWorkspaceToNull', function() {
        let coordinate = new Blockly.utils.Coordinate(100, 100);
        let node = ASTNode.createWorkspaceNode(
            this.emptyWorkspace, coordinate);
        let inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromStackToPrevious', function() {
        let node = ASTNode.createStackNode(this.blocks.statementInput1);
        let previous = this.blocks.statementInput1.previousConnection;
        let inNode = node.in();
        chai.assert.equal(inNode.getLocation(), previous);
        chai.assert.equal(inNode.getType(), ASTNode.types.PREVIOUS);
      });
      test('fromStackToOutput', function() {
        let node = ASTNode.createStackNode(this.blocks.fieldWithOutput2);
        let output = this.blocks.fieldWithOutput2.outputConnection;
        let inNode = node.in();
        chai.assert.equal(inNode.getLocation(), output);
        chai.assert.equal(inNode.getType(), ASTNode.types.OUTPUT);
      });
      test('fromStackToBlock', function() {
        let node = ASTNode.createStackNode(this.blocks.dummyInput);
        let inNode = node.in();
        chai.assert.equal(inNode.getLocation(), this.blocks.dummyInput);
        chai.assert.equal(inNode.getType(), ASTNode.types.BLOCK);
      });
    });

    suite('Out', function() {
      setup(function() {
        let secondBlock = this.blocks.secondBlock;
        let outputNextBlock = this.blocks.outputNextBlock;
        this.blocks.noPrevConnection.nextConnection.connect(secondBlock.previousConnection);
        secondBlock.inputList[0].connection
            .connect(outputNextBlock.outputConnection);
      });

      test('fromInputToBlock', function() {
        let input = this.blocks.statementInput1.inputList[0];
        let node = ASTNode.createInputNode(input);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.BLOCK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromOutputToInput', function() {
        let output = this.blocks.fieldWithOutput.outputConnection;
        let node = ASTNode.createConnectionNode(output);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(),
            this.blocks.statementInput1.inputList[0].connection);
      });
      test('fromOutputToStack', function() {
        let output = this.blocks.fieldWithOutput2.outputConnection;
        let node = ASTNode.createConnectionNode(output);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.fieldWithOutput2);
      });
      test('fromFieldToBlock', function() {
        let field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        let node = ASTNode.createFieldNode(field);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.BLOCK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromStackToWorkspace', function() {
        let stub = sinon.stub(this.blocks.statementInput4,
            "getRelativeToSurfaceXY").returns({x: 10, y:10});
        let node = ASTNode.createStackNode(this.blocks.statementInput4);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.WORKSPACE);
        chai.assert.equal(outNode.wsCoordinate_.x, 10);
        chai.assert.equal(outNode.wsCoordinate_.y, -10);
        stub.restore();
      });
      test('fromPreviousToInput', function() {
        let previous = this.blocks.statementInput3.previousConnection;
        let inputConnection = this.blocks.statementInput2.inputList[1].connection;
        let node = ASTNode.createConnectionNode(previous);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), inputConnection);
      });
      test('fromPreviousToStack', function() {
        let previous = this.blocks.statementInput2.previousConnection;
        let node = ASTNode.createConnectionNode(previous);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromNextToInput', function() {
        let next = this.blocks.statementInput3.nextConnection;
        let inputConnection = this.blocks.statementInput2.inputList[1].connection;
        let node = ASTNode.createConnectionNode(next);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), inputConnection);
      });
      test('fromNextToStack', function() {
        let next = this.blocks.statementInput2.nextConnection;
        let node = ASTNode.createConnectionNode(next);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromNextToStack_NoPreviousConnection', function() {
        let next = this.blocks.secondBlock.nextConnection;
        let node = ASTNode.createConnectionNode(next);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.noPrevConnection);
      });
      /**
       * This is where there is a block with both an output connection and a
       * next connection attached to an input.
       */
      test('fromNextToInput_OutputAndPreviousConnection', function() {
        let next = this.blocks.outputNextBlock.nextConnection;
        let node = ASTNode.createConnectionNode(next);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(),
            this.blocks.secondBlock.inputList[0].connection);
      });
      test('fromBlockToStack', function() {
        let node = ASTNode.createBlockNode(this.blocks.statementInput2);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromBlockToInput', function() {
        let input = this.blocks.statementInput2.inputList[1].connection;
        let node = ASTNode.createBlockNode(this.blocks.statementInput3);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), input);
      });
      test('fromTopBlockToStack', function() {
        let node = ASTNode.createBlockNode(this.blocks.statementInput1);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromBlockToStack_OutputConnection', function() {
        let node = ASTNode.createBlockNode(this.blocks.fieldWithOutput2);
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.fieldWithOutput2);
      });
      test('fromBlockToInput_OutputConnection', function() {
        let node = ASTNode.createBlockNode(this.blocks.outputNextBlock);
        let inputConnection = this.blocks.secondBlock.inputList[0].connection;
        let outNode = node.out();
        chai.assert.equal(outNode.getType(), ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), inputConnection);
      });
    });

    suite('createFunctions', function() {
      test('createFieldNode', function() {
        let field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        let node = ASTNode.createFieldNode(field);
        chai.assert.equal(node.getLocation(), field);
        chai.assert.equal(node.getType(), ASTNode.types.FIELD);
        chai.assert.isFalse(node.isConnection());
      });
      test('createConnectionNode', function() {
        let prevConnection = this.blocks.statementInput4.previousConnection;
        let node = ASTNode.createConnectionNode(prevConnection);
        chai.assert.equal(node.getLocation(), prevConnection);
        chai.assert.equal(node.getType(), ASTNode.types.PREVIOUS);
        chai.assert.isTrue(node.isConnection());
      });
      test('createInputNode', function() {
        let input = this.blocks.statementInput1.inputList[0];
        let node = ASTNode.createInputNode(input);
        chai.assert.equal(node.getLocation(), input.connection);
        chai.assert.equal(node.getType(), ASTNode.types.INPUT);
        chai.assert.isTrue(node.isConnection());
      });
      test('createWorkspaceNode', function() {
        let coordinate = new Blockly.utils.Coordinate(100, 100);
        let node = ASTNode
            .createWorkspaceNode(this.workspace, coordinate);
        chai.assert.equal(node.getLocation(), this.workspace);
        chai.assert.equal(node.getType(), ASTNode.types.WORKSPACE);
        chai.assert.equal(node.getWsCoordinate(), coordinate);
        chai.assert.isFalse(node.isConnection());
      });
      test('createStatementConnectionNode', function() {
        let nextConnection = this.blocks.statementInput1.inputList[1].connection;
        let inputConnection = this.blocks.statementInput1.inputList[1].connection;
        let node = ASTNode.createConnectionNode(nextConnection);
        chai.assert.equal(node.getLocation(), inputConnection);
        chai.assert.equal(node.getType(), ASTNode.types.INPUT);
        chai.assert.isTrue(node.isConnection());
      });
      test('createTopNode-previous', function() {
        let block = this.blocks.statementInput1;
        let topNode = ASTNode.createTopNode(block);
        chai.assert.equal(topNode.getLocation(), block.previousConnection);
      });
      test('createTopNode-block', function() {
        let block = this.blocks.noPrevConnection;
        let topNode = ASTNode.createTopNode(block);
        chai.assert.equal(topNode.getLocation(), block);
      });
      test('createTopNode-output', function() {
        let block = this.blocks.outputNextBlock;
        let topNode = ASTNode.createTopNode(block);
        chai.assert.equal(topNode.getLocation(), block.outputConnection);
      });
    });
  });
});
