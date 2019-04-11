

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

    blockA.nextConnection.connect(blockB.previousConnection);
    blockA.inputList[0].connection.connect(blockE.outputConnection);
    blockB.inputList[1].connection.connect(blockC.previousConnection);

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

  suite('HelperFunctions', function() {
    // test('setLocationForStackNotAtTop', function() {
    //     var input = this.blocks.A.inputList[0];
    //     this.cursor.setLocation(input, true, false);
    //     assertEquals(this.cursor.isStack_, false)
    //   });
    // test('setLocationForStackAtTopBlock', function() {
    //     var input = this.blocks.A.previousConnection;
    //     this.cursor.setLocation(input, true, false);
    //     assertEquals(this.cursor.isStack_, true)
    //   });

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

      // test('findPreviousEditableField_', function() {
      //   var input = this.blocks.A.inputList[0];
      //   var field = input.fieldRow[1];
      //   var prevField = input.fieldRow[0];
      //   var editableField = this.cursor.findPreviousEditableField_(field, input);
      //   assertEquals(editableField, prevField);
      // });

      // test('findPreviousEditableFieldLast_', function() {
      //   var input = this.blocks.A.inputList[0];
      //   var field = input.fieldRow[0];
      //   var editableField = this.cursor.findPreviousEditableField_(field, input, true);
      //   assertEquals(editableField, input.fieldRow[1]);
      // });

      // test('findNextForInput_', function() {
      //   var input = this.blocks.A.inputList[0];
      //   var input2 = this.blocks.A.inputList[1];
      //   var connection = input.connection;
      //   var nextLocation = this.cursor.findNextForInput_(connection, input);
      //   assertEquals(nextLocation, input2.connection);
      //   assertEquals(input2, this.cursor.parentInput_);
      // });

      // test('findPrevForInput_', function() {
      //   var input = this.blocks.A.inputList[0];
      //   var input2 = this.blocks.A.inputList[1];
      //   var connection = input2.connection;
      //   var nextLocation = this.cursor.findPrevForInput_(connection, input2);
      //   assertEquals(nextLocation, input.connection);
      //   assertEquals(input, this.cursor.parentInput_);
      // });

      // test('findNextForField_', function() {
      //   var input = this.blocks.A.inputList[0];
      //   var field = this.blocks.A.inputList[0].fieldRow[0];
      //   var field2 = this.blocks.A.inputList[0].fieldRow[1];
      //   var nextLocation = this.cursor.findNextForField_(field, input);
      //   assertEquals(nextLocation, field2);
      // });

      // test('findPrevForField_', function() {
      //   var input = this.blocks.A.inputList[0];
      //   var field = this.blocks.A.inputList[0].fieldRow[0];
      //   var field2 = this.blocks.A.inputList[0].fieldRow[1];
      //   var nextLocation = this.cursor.findPrevForField_(field2, input);
      //   assertEquals(nextLocation, field);
      // });

      // test('findTop_', function() {
      //   var topBlock = this.cursor.findTop_(this.blocks.C);
      //   assertEquals(topBlock, this.blocks.C);
      // });

      // test('navigateBetweenStacksForward', function() {
      //   this.cursor.setLocation(this.blocks.A.nextConnection);
      //   var nextStack = this.cursor.navigateBetweenStacks_(true);
      //   assertEquals(nextStack, this.blocks.D);
      // });

      // test('navigateBetweenStacksBackward', function() {
      //   this.cursor.setLocation(this.blocks.D);
      //   var nextStack = this.cursor.navigateBetweenStacks_(false);
      //   assertEquals(nextStack, this.blocks.A);
      // });

      // test('checkIfStackFalse', function() {
      //   this.cursor.setLocation(this.blocks.B);
      //   var isStack = this.cursor.checkIfStack_();
      //   assertEquals(isStack, false);
      // });

      // test('checkIfStackTrue', function() {
      //   this.cursor.setLocation(this.blocks.A.previousConnection);
      //   var isStack = this.cursor.checkIfStack_();
      //   assertEquals(isStack, true);
      // });

      // test('findTopConnection', function() {
      //   var topConnection = this.cursor.findTopConnection_(this.blocks.A);
      //   assertEquals(topConnection, this.blocks.A.previousConnection);
      // });
    });

  suite('NavigationFunctions', function() {
    suite('Next', function() {
      test('previousConnection', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.PREVIOUS,
            this.blocks.A.previousConnection);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.A);
      });
      test('block', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK,
            this.blocks.A);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.A.nextConnection);
      });
      test('nextConnection', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.NEXT,
            this.blocks.A.nextConnection);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.B.previousConnection);
      });
      test('input', function() {
        var input = this.blocks.A.inputList[0];
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.INPUT, input.connection);

        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.A.inputList[1].connection);
      });
      test('output', function() {
        var output = this.blocks.E.outputConnection;
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.OUTPUT, output);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.E);
      });
      test('field', function() {
        var field = this.blocks.A.inputList[0].fieldRow[1];
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.FIELD, field);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.A.inputList[0].connection);
      });
      test('isStack', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.STACK, this.blocks.A.previousConnection);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.D.previousConnection);
        assertEquals(nextNode.getLocationType(), Blockly.ASTNode.types.STACK);
      });
    });
    suite('Previous', function() {
      test('previousConnectionTopBlock', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.PREVIOUS, this.blocks.A.previousConnection);
        var prevNode = node.prev();
        assertEquals(prevNode, null);
      });
      test('previousConnection', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.PREVIOUS, this.blocks.B.previousConnection);
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), this.blocks.A.nextConnection);
      });
      test('block', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK, this.blocks.A);
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), this.blocks.A.previousConnection);
      });
      test('nextConnection', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.NEXT, this.blocks.A.nextConnection);
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), this.blocks.A);
      });
      test('input', function() {
        var input = this.blocks.A.inputList[0];
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.INPUT, input.connection);
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), input.fieldRow[1]);
      });
      test('output', function() {
        var output = this.blocks.E.outputConnection;
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.OUTPUT, output);
        var prevNode = node.prev();
        assertEquals(prevNode, null);
      });
      test('field', function() {
        var field = this.blocks.A.inputList[0].fieldRow[0];
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.FIELD, field);
        var prevNode = node.prev();
        assertEquals(prevNode, null);
      });
      test('isStack', function() {
        var prevConnection = this.blocks.D.previousConnection;
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.STACK, prevConnection);
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), this.blocks.A.previousConnection);
        assertEquals(prevNode.getLocationType(), Blockly.ASTNode.types.STACK);
      });
    });
    suite('In', function() {
      test('block', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK, this.blocks.A);
        var inNode = node.in();
        assertEquals(inNode.getLocation(), this.blocks.A.inputList[0].fieldRow[0]);
      });
      test('input', function() {
        var input = this.blocks.A.inputList[0];
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.INPUT, input.connection);
        var inNode = node.in();
        assertEquals(inNode.getLocation(), this.blocks.E.outputConnection);
      });
      test('output', function() {
        var output = this.blocks.E.outputConnection;
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.OUTPUT, output);
        var inNode = node.in();
        assertEquals(inNode, null);
      });
      test('field', function() {
        var field = this.blocks.A.inputList[0].fieldRow[0];
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.FIELD, field);
        var inNode = node.in();
        assertEquals(inNode, null);
      });
      test('isStack', function() {
        var prevConnection = this.blocks.D.previousConnection;
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.STACK, prevConnection);
        var inNode = node.in();
        assertEquals(inNode.getLocation(), prevConnection);
        assertEquals(inNode.getLocationType(), Blockly.ASTNode.types.PREVIOUS);
      });
    });

    suite('Out', function() {
      test('topBlock', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK, this.blocks.A);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.A.previousConnection);
      });
      test('nestedBlock', function() {
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK, this.blocks.C);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.B.inputList[1].connection);
      });
      test('input', function() {
        var input = this.blocks.A.inputList[0];
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.INPUT, input.connection);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.A);
      });
      test('output', function() {
        var output = this.blocks.E.outputConnection;
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.OUTPUT, output);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.A.inputList[0].connection);
      });
      test('field', function() {
        var field = this.blocks.A.inputList[0].fieldRow[0];
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.FIELD, field);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.A);
      });
      test('insideStatement', function() {
        var nextConnection = this.blocks.C.nextConnection;
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.NEXT, nextConnection);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), this.blocks.B.inputList[1].connection);
      });
      test('stack', function() {
        var prevConnection = this.blocks.D.previousConnection;
        var node = new Blockly.ASTNode(Blockly.ASTNode.types.PREVIOUS, prevConnection);
        var outNode = node.out();
        assertEquals(outNode.getLocation(), prevConnection);
        assertEquals(outNode.getLocationType(), Blockly.ASTNode.types.STACK);
      });
    });
  });
});
