

suite('ASTNode', function() {
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
    var blockA = this.workspace.newBlock('input_statement');
    var blockB = this.workspace.newBlock('input_statement');
    var blockC = this.workspace.newBlock('input_statement');
    var blockD = this.workspace.newBlock('input_statement');
    var blockE = this.workspace.newBlock('field_input');
    var blockF = this.workspace.newBlock('value_input');

    blockA.nextConnection.connect(blockB.previousConnection);
    blockA.inputList[0].connection.connect(blockE.outputConnection);
    blockB.inputList[1].connection.connect(blockC.previousConnection);

    this.blocks = {
      A: blockA,
      B: blockB,
      C: blockC,
      D: blockD,
      E: blockE,
      F: blockF
    };
    sinon.stub(Blockly, "getMainWorkspace").returns(new Blockly.Workspace());
  });
  teardown(function() {
    delete Blockly.Blocks['input_statement'];
    delete Blockly.Blocks['field_input'];
    delete Blockly.Blocks['value_input'];

    this.workspace.dispose();
    sinon.restore();
  });

  suite('HelperFunctions', function() {
      test('findNextEditableField_', function() {
        var input = this.blocks.A.inputList[0];
        var field = input.fieldRow[0];
        var nextField = input.fieldRow[1];
        var node = new Blockly.ASTNode();
        var editableField = node.findNextEditableField_(field, input);
        assertEquals(editableField.getLocation(), nextField);
      });

      test('findNextEditableFieldFirst_', function() {
        var input = this.blocks.A.inputList[0];
        var field = input.fieldRow[1];
        var node = new Blockly.ASTNode();
        var editableField = node.findNextEditableField_(field, input, true);
        assertEquals(editableField.getLocation(), input.fieldRow[0]);
      });

      test('findPreviousEditableField_', function() {
        var input = this.blocks.A.inputList[0];
        var field = input.fieldRow[1];
        var prevField = input.fieldRow[0];
        var node = new Blockly.ASTNode();
        var editableField = node.findPreviousEditableField_(field, input);
        assertEquals(editableField.getLocation(), prevField);
      });

      test('findPreviousEditableFieldLast_', function() {
        var input = this.blocks.A.inputList[0];
        var field = input.fieldRow[0];
        var node = new Blockly.ASTNode();
        var editableField = node.findPreviousEditableField_(field, input, true);
        assertEquals(editableField.getLocation(), input.fieldRow[1]);
      });

      test('findNextForInput_', function() {
        var input = this.blocks.A.inputList[0];
        var input2 = this.blocks.A.inputList[1];
        var connection = input.connection;
        var node = new Blockly.ASTNode();
        var newASTNode = node.findNextForInput_(connection, input);
        assertEquals(newASTNode.getLocation(), input2.connection);
      });

      test('findPrevForInput_', function() {
        var input = this.blocks.A.inputList[0];
        var input2 = this.blocks.A.inputList[1];
        var connection = input2.connection;
        var node = new Blockly.ASTNode();
        var newASTNode = node.findPrevForInput_(connection, input2);
        assertEquals(newASTNode.getLocation(), input.connection);
      });

      test('findNextForField_', function() {
        var input = this.blocks.A.inputList[0];
        var field = this.blocks.A.inputList[0].fieldRow[0];
        var field2 = this.blocks.A.inputList[0].fieldRow[1];
        var node = new Blockly.ASTNode();
        var newASTNode = node.findNextForField_(field, input);
        assertEquals(newASTNode.getLocation(), field2);
      });

      test('findPrevForField_', function() {
        var input = this.blocks.A.inputList[0];
        var field = this.blocks.A.inputList[0].fieldRow[0];
        var field2 = this.blocks.A.inputList[0].fieldRow[1];
        var node = new Blockly.ASTNode();
        var newASTNode = node.findPrevForField_(field2, input);
        assertEquals(newASTNode.getLocation(), field);
      });

      test('navigateBetweenStacksForward', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.NEXT, this.blocks.A.nextConnection);
        var newASTNode = node.navigateBetweenStacks_(true);
        assertEquals(newASTNode.getLocation(), this.blocks.D);
      });

      test('navigateBetweenStacksBackward', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK, this.blocks.D);
        var newASTNode = node.navigateBetweenStacks_(false);
        assertEquals(newASTNode.getLocation(), this.blocks.A);
      });
    });

  suite('NavigationFunctions', function() {
    suite('Next', function() {
      test('previousConnection', function() {
        var node = Blockly.ASTNode.createConnectionNode(this.blocks.A.previousConnection);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.A);
      });
      test('block', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.A);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.A.nextConnection);
      });
      test('nextConnection', function() {
        var node = Blockly.ASTNode.createConnectionNode(this.blocks.A.nextConnection);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.B.previousConnection);
      });
      test('input', function() {
        var input = this.blocks.A.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.A.inputList[1].connection);
      });
      test('output', function() {
        var output = this.blocks.E.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.E);
      });
      test('field', function() {
        var field = this.blocks.A.inputList[0].fieldRow[1];
        var node = Blockly.ASTNode.createFieldNode(field);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.A.inputList[0].connection);
      });
      test('isStack', function() {
        var node = Blockly.ASTNode.createStackNode(this.blocks.A);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.D);
        assertEquals(nextNode.getType(), Blockly.ASTNode.types.STACK);
      });
      test('workspace', function() {
        var coordinate = new goog.math.Coordinate(100,100);
        var node = Blockly.ASTNode.createWorkspaceNode(this.workspace, coordinate);
        var nextNode = node.next();
        assertEquals(nextNode.wsCoordinate_.x, 110);
        assertEquals(nextNode.getLocation(), this.workspace);
        assertEquals(nextNode.getType(), Blockly.ASTNode.types.WORKSPACE);
      });
    });

    suite('Previous', function() {
      test('previousConnectionTopBlock', function() {
        var prevConnection = this.blocks.A.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        var prevNode = node.prev();
        assertEquals(prevNode, null);
      });
      test('previousConnection', function() {
        var prevConnection = this.blocks.B.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), this.blocks.A.nextConnection);
      });
      test('block', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.A);
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), this.blocks.A.previousConnection);
      });
      test('nextConnection', function() {
        var nextConnection = this.blocks.A.nextConnection;
        var node = Blockly.ASTNode.createConnectionNode(nextConnection)
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), this.blocks.A);
      });
      test('input', function() {
        var input = this.blocks.A.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), input.fieldRow[1]);
      });
      test('output', function() {
        var output = this.blocks.E.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var prevNode = node.prev();
        assertEquals(prevNode, null);
      });
      test('field', function() {
        var field = this.blocks.A.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        var prevNode = node.prev();
        assertEquals(prevNode, null);
      });
      test('isStack', function() {
        var node = Blockly.ASTNode.createStackNode(this.blocks.D);
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), this.blocks.A);
        assertEquals(prevNode.getType(), Blockly.ASTNode.types.STACK);
      });
      test('workspace', function() {
        var coordinate = new goog.math.Coordinate(100,100);
        var node = Blockly.ASTNode.createWorkspaceNode(this.workspace, coordinate);
        var nextNode = node.prev();
        assertEquals(nextNode.wsCoordinate_.x, 90);
        assertEquals(nextNode.getLocation(), this.workspace);
        assertEquals(nextNode.getType(), Blockly.ASTNode.types.WORKSPACE);
      });
    });

    suite('In', function() {
      test('block', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.A);
        var inNode = node.in();
        assertEquals(inNode.getLocation(), this.blocks.A.inputList[0].fieldRow[0]);
      });
      test('input', function() {
        var input = this.blocks.A.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var inNode = node.in();
        assertEquals(inNode.getLocation(), this.blocks.E.outputConnection);
      });
      test('blockToInput', function() {
        var input = this.blocks.F.inputList[0];
        var node = Blockly.ASTNode.createBlockNode(this.blocks.F);
        var inNode = node.in();
        assertEquals(inNode.getLocation(), input.connection);
      });
      test('output', function() {
        var output = this.blocks.E.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var inNode = node.in();
        assertEquals(inNode, null);
      });
      test('field', function() {
        var field = this.blocks.A.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        var inNode = node.in();
        assertEquals(inNode, null);
      });
      test('isStack', function() {
        var prevConnection = this.blocks.D.previousConnection;
        var node = Blockly.ASTNode.createStackNode(this.blocks.D);
        var inNode = node.in();
        assertEquals(inNode.getLocation(), prevConnection);
        assertEquals(inNode.getType(), Blockly.ASTNode.types.PREVIOUS);
      });
      test('workspace', function() {
        var coordinate = new goog.math.Coordinate(100,100);
        var node = Blockly.ASTNode.createWorkspaceNode(this.workspace, coordinate);
        var inNode = node.in();
        assertEquals(inNode.getLocation(), this.workspace.getTopBlocks()[0]);
        assertEquals(inNode.getType(), Blockly.ASTNode.types.STACK);

      });
    });

    suite('Out', function() {
      test('topBlock', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.A);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.A);
      });
      test('nestedBlock', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.C);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.B.inputList[1].connection);
      });
      test('input', function() {
        var input = this.blocks.A.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.A);
      });
      test('output', function() {
        var output = this.blocks.E.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.A.inputList[0].connection);
      });
      test('field', function() {
        var field = this.blocks.A.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.A);
      });
      test('insideStatement', function() {
        var nextConnection = this.blocks.C.nextConnection;
        var node = Blockly.ASTNode.createConnectionNode(nextConnection);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.B.inputList[1].connection);
      });
      test('stack', function() {
        var prevConnection = this.blocks.D.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.D);
        assertEquals(outNode.getType(), Blockly.ASTNode.types.STACK);
      });
      test('workspace', function() {
        var node = Blockly.ASTNode.createStackNode(this.blocks.D);
        var outNode = node.out();
        assertEquals(outNode.getType(), Blockly.ASTNode.types.WORKSPACE);
        assertEquals(outNode.wsCoordinate_.x, 100);
        assertEquals(outNode.wsCoordinate_.y, 100);
      });
    });

    suite('createFunctions', function() {
      test('createFieldNode', function() {
        var field = this.blocks.A.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        assertEquals(node.getLocation(), field);
        assertEquals(node.getType(), Blockly.ASTNode.types.FIELD);
      });
      test('createConnectionNode', function() {
        var prevConnection = this.blocks.D.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        assertEquals(node.getLocation(), prevConnection);
        assertEquals(node.getType(), Blockly.ASTNode.types.PREVIOUS);
      });
      test('createInputNode', function() {
        var input = this.blocks.A.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        assertEquals(node.getLocation(), input.connection);
        assertEquals(node.getType(), Blockly.ASTNode.types.INPUT);
      });
      test('createWorkspaceNode', function() {
        var coordinate = new goog.math.Coordinate(100,100);
        var node = Blockly.ASTNode.createWorkspaceNode(this.workspace, coordinate);
        assertEquals(node.getLocation(), this.workspace);
        assertEquals(node.getType(), Blockly.ASTNode.types.WORKSPACE);
        assertEquals(node.getWsCoordinate(), coordinate);
      });
      test('createStatementConnectionNode', function() {
        var nextConnection = this.blocks.A.inputList[1].connection;
        var node = Blockly.ASTNode.createConnectionNode(nextConnection);
        assertEquals(node.getLocation(), this.blocks.A.inputList[1].connection);
        assertEquals(node.getType(), Blockly.ASTNode.types.INPUT);
      });
    });
  });
});
