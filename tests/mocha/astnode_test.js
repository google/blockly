/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

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
    var statementInput1 = this.workspace.newBlock('input_statement');
    var statementInput2 = this.workspace.newBlock('input_statement');
    var statementInput3 = this.workspace.newBlock('input_statement');
    var statementInput4 = this.workspace.newBlock('input_statement');
    var fieldWithOutput = this.workspace.newBlock('field_input');
    var valueInput = this.workspace.newBlock('value_input');

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
      var input = this.blocks.statementInput1.inputList[0];
      var input2 = this.blocks.statementInput1.inputList[1];
      var connection = input.connection;
      var node = Blockly.ASTNode.createConnectionNode(connection);
      var newASTNode = node.findNextForInput_(input);
      chai.assert.equal(newASTNode.getLocation(), input2.connection);
    });

    test('findPrevForInput_', function() {
      var input = this.blocks.statementInput1.inputList[0];
      var input2 = this.blocks.statementInput1.inputList[1];
      var connection = input2.connection;
      var node = Blockly.ASTNode.createConnectionNode(connection);
      var newASTNode = node.findPrevForInput_(input2);
      chai.assert.equal(newASTNode.getLocation(), input.connection);
    });

    test('findNextForField_', function() {
      var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
      var field2 = this.blocks.statementInput1.inputList[0].fieldRow[1];
      var node = Blockly.ASTNode.createFieldNode(field);
      var newASTNode = node.findNextForField_(field);
      chai.assert.equal(newASTNode.getLocation(), field2);
    });

    test('findPrevForField_', function() {
      var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
      var field2 = this.blocks.statementInput1.inputList[0].fieldRow[1];
      var node = Blockly.ASTNode.createFieldNode(field2);
      var newASTNode = node.findPrevForField_(field2);
      chai.assert.equal(newASTNode.getLocation(), field);
    });

    test('navigateBetweenStacks_Forward', function() {
      var node = new Blockly.ASTNode(
          Blockly.ASTNode.types.NEXT, this.blocks.statementInput1.nextConnection);
      var newASTNode = node.navigateBetweenStacks_(true);
      chai.assert.equal(newASTNode.getLocation(), this.blocks.statementInput4);
    });

    test('navigateBetweenStacks_Backward', function() {
      var node = new Blockly.ASTNode(
          Blockly.ASTNode.types.BLOCK, this.blocks.statementInput4);
      var newASTNode = node.navigateBetweenStacks_(false);
      chai.assert.equal(newASTNode.getLocation(), this.blocks.statementInput1);
    });
    test('getOutAstNodeForBlock_', function() {
      var node = new Blockly.ASTNode(
          Blockly.ASTNode.types.BLOCK, this.blocks.statementInput2);
      var newASTNode = node.getOutAstNodeForBlock_(this.blocks.statementInput2);
      chai.assert.equal(newASTNode.getLocation(), this.blocks.statementInput1);
    });
    test('getOutAstNodeForBlock_OneBlock', function() {
      var node = new Blockly.ASTNode(
          Blockly.ASTNode.types.BLOCK, this.blocks.statementInput4);
      var newASTNode = node.getOutAstNodeForBlock_(this.blocks.statementInput4);
      chai.assert.equal(newASTNode.getLocation(), this.blocks.statementInput4);
    });
    test('findFirstFieldOrInput_', function() {
      var node = new Blockly.ASTNode(
          Blockly.ASTNode.types.BLOCK, this.blocks.statementInput4);
      var field = this.blocks.statementInput4.inputList[0].fieldRow[0];
      var newASTNode = node.findFirstFieldOrInput_(this.blocks.statementInput4);
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
      var noNextConnection = this.workspace.newBlock('top_connection');
      var fieldAndInputs = this.workspace.newBlock('fields_and_input');
      var twoFields = this.workspace.newBlock('two_fields');
      var fieldAndInputs2 = this.workspace.newBlock('fields_and_input2');
      var noPrevConnection = this.workspace.newBlock('start_block');
      this.blocks.noNextConnection = noNextConnection;
      this.blocks.fieldAndInputs = fieldAndInputs;
      this.blocks.twoFields = twoFields;
      this.blocks.fieldAndInputs2 = fieldAndInputs2;
      this.blocks.noPrevConnection = noPrevConnection;

      var dummyInput = this.workspace.newBlock('dummy_input');
      var dummyInputValue = this.workspace.newBlock('dummy_inputValue');
      var fieldWithOutput2 = this.workspace.newBlock('field_input');
      this.blocks.dummyInput = dummyInput;
      this.blocks.dummyInputValue = dummyInputValue;
      this.blocks.fieldWithOutput2 = fieldWithOutput2;

      var secondBlock = this.workspace.newBlock('input_statement');
      var outputNextBlock = this.workspace.newBlock('output_next');
      this.blocks.secondBlock = secondBlock;
      this.blocks.outputNextBlock = outputNextBlock;
    });
    suite('Next', function() {
      setup(function() {
        this.singleBlockWorkspace = new Blockly.Workspace();
        var singleBlock = this.singleBlockWorkspace.newBlock('two_fields');
        this.blocks.singleBlock = singleBlock;
      });
      teardown(function() {
        workspaceTeardown.call(this, this.singleBlockWorkspace);
      });

      test('fromPreviousToBlock', function() {
        var prevConnection = this.blocks.statementInput1.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        var nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromBlockToNext', function() {
        var nextConnection = this.blocks.statementInput1.nextConnection;
        var node = Blockly.ASTNode.createBlockNode(this.blocks.statementInput1);
        var nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), nextConnection);
      });
      test('fromBlockToNull', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.noNextConnection);
        var nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
      test('fromNextToPrevious', function() {
        var nextConnection = this.blocks.statementInput1.nextConnection;
        var prevConnection = this.blocks.statementInput2.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(nextConnection);
        var nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), prevConnection);
      });
      test('fromNextToNull', function() {
        var nextConnection = this.blocks.statementInput2.nextConnection;
        var node = Blockly.ASTNode.createConnectionNode(nextConnection);
        var nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
      test('fromInputToInput', function() {
        var input = this.blocks.statementInput1.inputList[0];
        var inputConnection = this.blocks.statementInput1.inputList[1].connection;
        var node = Blockly.ASTNode.createInputNode(input);
        var nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), inputConnection);
      });
      test('fromInputToStatementInput', function() {
        var input = this.blocks.fieldAndInputs2.inputList[1];
        var inputConnection = this.blocks.fieldAndInputs2.inputList[2].connection;
        var node = Blockly.ASTNode.createInputNode(input);
        var nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), inputConnection);
      });
      test('fromInputToField', function() {
        var input = this.blocks.fieldAndInputs2.inputList[0];
        var field = this.blocks.fieldAndInputs2.inputList[1].fieldRow[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), field);
      });
      test('fromInputToNull', function() {
        var input = this.blocks.fieldAndInputs2.inputList[2];
        var node = Blockly.ASTNode.createInputNode(input);
        var nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
      test('fromOutputToBlock', function() {
        var output = this.blocks.fieldWithOutput.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), this.blocks.fieldWithOutput);
      });
      test('fromFieldToInput', function() {
        var field = this.blocks.statementInput1.inputList[0].fieldRow[1];
        var inputConnection = this.blocks.statementInput1.inputList[0].connection;
        var node = Blockly.ASTNode.createFieldNode(field);
        var nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), inputConnection);
      });
      test('fromFieldToField', function() {
        var field = this.blocks.fieldAndInputs.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        var field2 = this.blocks.fieldAndInputs.inputList[1].fieldRow[0];
        var nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), field2);
      });
      test('fromFieldToNull', function() {
        var field = this.blocks.twoFields.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        var nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
      test('fromStackToStack', function() {
        var node = Blockly.ASTNode.createStackNode(this.blocks.statementInput1);
        var nextNode = node.next();
        chai.assert.equal(nextNode.getLocation(), this.blocks.statementInput4);
        chai.assert.equal(nextNode.getType(), Blockly.ASTNode.types.STACK);
      });
      test('fromStackToNull', function() {
        var node = Blockly.ASTNode.createStackNode(this.blocks.singleBlock);
        var nextNode = node.next();
        chai.assert.isNull(nextNode);
      });
    });

    suite('Previous', function() {
      test('fromPreviousToNull', function() {
        var prevConnection = this.blocks.statementInput1.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        var prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromPreviousToNext', function() {
        var prevConnection = this.blocks.statementInput2.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        var prevNode = node.prev();
        var nextConnection = this.blocks.statementInput1.nextConnection;
        chai.assert.equal(prevNode.getLocation(), nextConnection);
      });
      test('fromPreviousToInput', function() {
        var prevConnection = this.blocks.statementInput3.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        var prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromBlockToPrevious', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.statementInput1);
        var prevNode = node.prev();
        var prevConnection = this.blocks.statementInput1.previousConnection;
        chai.assert.equal(prevNode.getLocation(), prevConnection);
      });
      test('fromBlockToNull', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.noPrevConnection);
        var prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromBlockToOutput', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.fieldWithOutput);
        var prevNode = node.prev();
        var outputConnection = this.blocks.fieldWithOutput.outputConnection;
        chai.assert.equal(prevNode.getLocation(), outputConnection);
      });
      test('fromNextToBlock', function() {
        var nextConnection = this.blocks.statementInput1.nextConnection;
        var node = Blockly.ASTNode.createConnectionNode(nextConnection);
        var prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromInputToField', function() {
        var input = this.blocks.statementInput1.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), input.fieldRow[1]);
      });
      test('fromInputToNull', function() {
        var input = this.blocks.fieldAndInputs2.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromInputToInput', function() {
        var input = this.blocks.fieldAndInputs2.inputList[2];
        var inputConnection = this.blocks.fieldAndInputs2.inputList[1].connection;
        var node = Blockly.ASTNode.createInputNode(input);
        var prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), inputConnection);
      });
      test('fromOutputToNull', function() {
        var output = this.blocks.fieldWithOutput.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromFieldToNull', function() {
        var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        var prevNode = node.prev();
        chai.assert.isNull(prevNode);
      });
      test('fromFieldToInput', function() {
        var field = this.blocks.fieldAndInputs2.inputList[1].fieldRow[0];
        var inputConnection = this.blocks.fieldAndInputs2.inputList[0].connection;
        var node = Blockly.ASTNode.createFieldNode(field);
        var prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), inputConnection);
      });
      test('fromFieldToField', function() {
        var field = this.blocks.fieldAndInputs.inputList[1].fieldRow[0];
        var field2 = this.blocks.fieldAndInputs.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        var prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), field2);
      });
      test('fromStackToStack', function() {
        var node = Blockly.ASTNode.createStackNode(this.blocks.statementInput4);
        var prevNode = node.prev();
        chai.assert.equal(prevNode.getLocation(), this.blocks.statementInput1);
        chai.assert.equal(prevNode.getType(), Blockly.ASTNode.types.STACK);
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
        var input = this.blocks.statementInput1.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var inNode = node.in();
        var outputConnection = this.blocks.fieldWithOutput.outputConnection;
        chai.assert.equal(inNode.getLocation(), outputConnection);
      });
      test('fromInputToNull', function() {
        var input = this.blocks.statementInput2.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromInputToPrevious', function() {
        var input = this.blocks.statementInput2.inputList[1];
        var previousConnection = this.blocks.statementInput3.previousConnection;
        var node = Blockly.ASTNode.createInputNode(input);
        var inNode = node.in();
        chai.assert.equal(inNode.getLocation(), previousConnection);
      });
      test('fromBlockToInput', function() {
        var input = this.blocks.valueInput.inputList[0];
        var node = Blockly.ASTNode.createBlockNode(this.blocks.valueInput);
        var inNode = node.in();
        chai.assert.equal(inNode.getLocation(), input.connection);
      });
      test('fromBlockToField', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.statementInput1);
        var inNode = node.in();
        var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        chai.assert.equal(inNode.getLocation(), field);
      });
      test('fromBlockToPrevious', function() {
        var prevConnection = this.blocks.statementInput4.previousConnection;
        var node = Blockly.ASTNode.createStackNode(this.blocks.statementInput4);
        var inNode = node.in();
        chai.assert.equal(inNode.getLocation(), prevConnection);
        chai.assert.equal(inNode.getType(), Blockly.ASTNode.types.PREVIOUS);
      });
      test('fromBlockToNull_DummyInput', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.dummyInput);
        var inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromBlockToInput_DummyInputValue', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.dummyInputValue);
        var inputConnection = this.blocks.dummyInputValue.inputList[1].connection;
        var inNode = node.in();
        chai.assert.equal(inNode.getLocation(), inputConnection);
      });
      test('fromOuputToNull', function() {
        var output = this.blocks.fieldWithOutput.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromFieldToNull', function() {
        var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        var inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromWorkspaceToStack', function() {
        var coordinate = new Blockly.utils.Coordinate(100, 100);
        var node = Blockly.ASTNode.createWorkspaceNode(this.workspace, coordinate);
        var inNode = node.in();
        chai.assert.equal(inNode.getLocation(), this.workspace.getTopBlocks()[0]);
        chai.assert.equal(inNode.getType(), Blockly.ASTNode.types.STACK);
      });
      test('fromWorkspaceToNull', function() {
        var coordinate = new Blockly.utils.Coordinate(100, 100);
        var node = Blockly.ASTNode.createWorkspaceNode(
            this.emptyWorkspace, coordinate);
        var inNode = node.in();
        chai.assert.isNull(inNode);
      });
      test('fromStackToPrevious', function() {
        var node = Blockly.ASTNode.createStackNode(this.blocks.statementInput1);
        var previous = this.blocks.statementInput1.previousConnection;
        var inNode = node.in();
        chai.assert.equal(inNode.getLocation(), previous);
        chai.assert.equal(inNode.getType(), Blockly.ASTNode.types.PREVIOUS);
      });
      test('fromStackToOutput', function() {
        var node = Blockly.ASTNode.createStackNode(this.blocks.fieldWithOutput2);
        var output = this.blocks.fieldWithOutput2.outputConnection;
        var inNode = node.in();
        chai.assert.equal(inNode.getLocation(), output);
        chai.assert.equal(inNode.getType(), Blockly.ASTNode.types.OUTPUT);
      });
      test('fromStackToBlock', function() {
        var node = Blockly.ASTNode.createStackNode(this.blocks.dummyInput);
        var inNode = node.in();
        chai.assert.equal(inNode.getLocation(), this.blocks.dummyInput);
        chai.assert.equal(inNode.getType(), Blockly.ASTNode.types.BLOCK);
      });
    });

    suite('Out', function() {
      setup(function() {
        var secondBlock = this.blocks.secondBlock;
        var outputNextBlock = this.blocks.outputNextBlock;
        this.blocks.noPrevConnection.nextConnection.connect(secondBlock.previousConnection);
        secondBlock.inputList[0].connection
            .connect(outputNextBlock.outputConnection);
      });

      test('fromInputToBlock', function() {
        var input = this.blocks.statementInput1.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.BLOCK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromOutputToInput', function() {
        var output = this.blocks.fieldWithOutput.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(),
            this.blocks.statementInput1.inputList[0].connection);
      });
      test('fromOutputToStack', function() {
        var output = this.blocks.fieldWithOutput2.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.fieldWithOutput2);
      });
      test('fromFieldToBlock', function() {
        var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.BLOCK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromStackToWorkspace', function() {
        var stub = sinon.stub(this.blocks.statementInput4,
            "getRelativeToSurfaceXY").returns({x: 10, y:10});
        var node = Blockly.ASTNode.createStackNode(this.blocks.statementInput4);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.WORKSPACE);
        chai.assert.equal(outNode.wsCoordinate_.x, 10);
        chai.assert.equal(outNode.wsCoordinate_.y, -10);
        stub.restore();
      });
      test('fromPreviousToInput', function() {
        var previous = this.blocks.statementInput3.previousConnection;
        var inputConnection = this.blocks.statementInput2.inputList[1].connection;
        var node = Blockly.ASTNode.createConnectionNode(previous);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), inputConnection);
      });
      test('fromPreviousToStack', function() {
        var previous = this.blocks.statementInput2.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(previous);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromNextToInput', function() {
        var next = this.blocks.statementInput3.nextConnection;
        var inputConnection = this.blocks.statementInput2.inputList[1].connection;
        var node = Blockly.ASTNode.createConnectionNode(next);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), inputConnection);
      });
      test('fromNextToStack', function() {
        var next = this.blocks.statementInput2.nextConnection;
        var node = Blockly.ASTNode.createConnectionNode(next);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromNextToStack_NoPreviousConnection', function() {
        var next = this.blocks.secondBlock.nextConnection;
        var node = Blockly.ASTNode.createConnectionNode(next);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.noPrevConnection);
      });
      /**
       * This is where there is a block with both an output connection and a
       * next connection attached to an input.
       */
      test('fromNextToInput_OutputAndPreviousConnection', function() {
        var next = this.blocks.outputNextBlock.nextConnection;
        var node = Blockly.ASTNode.createConnectionNode(next);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(),
            this.blocks.secondBlock.inputList[0].connection);
      });
      test('fromBlockToStack', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.statementInput2);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromBlockToInput', function() {
        var input = this.blocks.statementInput2.inputList[1].connection;
        var node = Blockly.ASTNode.createBlockNode(this.blocks.statementInput3);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), input);
      });
      test('fromTopBlockToStack', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.statementInput1);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromBlockToStack_OutputConnection', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.fieldWithOutput2);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.fieldWithOutput2);
      });
      test('fromBlockToInput_OutputConnection', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.outputNextBlock);
        var inputConnection = this.blocks.secondBlock.inputList[0].connection;
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), inputConnection);
      });
    });

    suite('createFunctions', function() {
      test('createFieldNode', function() {
        var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        chai.assert.equal(node.getLocation(), field);
        chai.assert.equal(node.getType(), Blockly.ASTNode.types.FIELD);
        chai.assert.isFalse(node.isConnection());
      });
      test('createConnectionNode', function() {
        var prevConnection = this.blocks.statementInput4.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        chai.assert.equal(node.getLocation(), prevConnection);
        chai.assert.equal(node.getType(), Blockly.ASTNode.types.PREVIOUS);
        chai.assert.isTrue(node.isConnection());
      });
      test('createInputNode', function() {
        var input = this.blocks.statementInput1.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        chai.assert.equal(node.getLocation(), input.connection);
        chai.assert.equal(node.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.isTrue(node.isConnection());
      });
      test('createWorkspaceNode', function() {
        var coordinate = new Blockly.utils.Coordinate(100, 100);
        var node = Blockly.ASTNode
            .createWorkspaceNode(this.workspace, coordinate);
        chai.assert.equal(node.getLocation(), this.workspace);
        chai.assert.equal(node.getType(), Blockly.ASTNode.types.WORKSPACE);
        chai.assert.equal(node.getWsCoordinate(), coordinate);
        chai.assert.isFalse(node.isConnection());
      });
      test('createStatementConnectionNode', function() {
        var nextConnection = this.blocks.statementInput1.inputList[1].connection;
        var inputConnection = this.blocks.statementInput1.inputList[1].connection;
        var node = Blockly.ASTNode.createConnectionNode(nextConnection);
        chai.assert.equal(node.getLocation(), inputConnection);
        chai.assert.equal(node.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.isTrue(node.isConnection());
      });
      test('createTopNode-previous', function() {
        var block = this.blocks.statementInput1;
        var topNode = Blockly.ASTNode.createTopNode(block);
        chai.assert.equal(topNode.getLocation(), block.previousConnection);
      });
      test('createTopNode-block', function() {
        var block = this.blocks.noPrevConnection;
        var topNode = Blockly.ASTNode.createTopNode(block);
        chai.assert.equal(topNode.getLocation(), block);
      });
      test('createTopNode-output', function() {
        var block = this.blocks.outputNextBlock;
        var topNode = Blockly.ASTNode.createTopNode(block);
        chai.assert.equal(topNode.getLocation(), block.outputConnection);
      });
    });
  });
});
