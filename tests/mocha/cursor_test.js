

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
    test('getFieldParentInput_', function() {
        var input = this.blocks.A.inputList[0];
        var parentInput = this.cursor.getFieldParentInput_(input.fieldRow[0]);
        assertEquals(parentInput, input);
      });

      test('getConnectionParentInput_', function() {
        var input = this.blocks.A.inputList[1];
        var connection = input.connection;
        var parentInput = this.cursor.getConnectionParentInput_(connection);
        assertEquals(parentInput, input);
      });

      test('getConnectionParentInputNotFound_', function() {
        var nextConnection = this.blocks.A.nextConnection;
        var parentInput = this.cursor.getConnectionParentInput_(nextConnection);
        assertEquals(parentInput, undefined);
      });

      test('findNextEditableField_', function() {
        var input = this.blocks.A.inputList[0];
        var field = input.fieldRow[0];
        var nextField = input.fieldRow[1];
        var editableField = this.cursor.findNextEditableField_(field, input);
        assertEquals(editableField, nextField);
      });

      test('findNextEditableFieldFirst_', function() {
        var input = this.blocks.A.inputList[0];
        var field = input.fieldRow[1];
        var editableField = this.cursor.findNextEditableField_(field, input, true);
        assertEquals(editableField, input.fieldRow[0]);
      });

      test('findPreviousEditableField_', function() {
        var input = this.blocks.A.inputList[0];
        var field = input.fieldRow[1];
        var prevField = input.fieldRow[0];
        var editableField = this.cursor.findPreviousEditableField_(field, input);
        assertEquals(editableField, prevField);
      });

      test('findPreviousEditableFieldLast_', function() {
        var input = this.blocks.A.inputList[0];
        var field = input.fieldRow[0];
        var editableField = this.cursor.findPreviousEditableField_(field, input, true);
        assertEquals(editableField, input.fieldRow[1]);
      });

      test('findNextForInput_', function() {
        var input = this.blocks.A.inputList[0];
        var input2 = this.blocks.A.inputList[1];
        var connection = input.connection;
        var nextLocation = this.cursor.findNextForInput_(connection, input);
        assertEquals(nextLocation, input2.connection);
        assertEquals(input2, this.cursor.getParentInput());
      });

      test('findPrevForInput_', function() {
        var input = this.blocks.A.inputList[0];
        var input2 = this.blocks.A.inputList[1];
        var connection = input2.connection;
        var nextLocation = this.cursor.findPrevForInput_(connection, input2);
        assertEquals(nextLocation, input.connection);
        assertEquals(input, this.cursor.getParentInput());
      });

      test('findNextForField_', function() {
        var input = this.blocks.A.inputList[0];
        var field = this.blocks.A.inputList[0].fieldRow[0];
        var field2 = this.blocks.A.inputList[0].fieldRow[1];
        var nextLocation = this.cursor.findNextForField_(field, input);
        assertEquals(nextLocation, field2);
      });

      test('findPrevForField_', function() {
        var input = this.blocks.A.inputList[0];
        var field = this.blocks.A.inputList[0].fieldRow[0];
        var field2 = this.blocks.A.inputList[0].fieldRow[1];
        var nextLocation = this.cursor.findPrevForField_(field2, input);
        assertEquals(nextLocation, field);
      });

      test('findTop_', function() {
        var topBlock = this.cursor.findTop_(this.blocks.C);
        assertEquals(topBlock, this.blocks.C);
      });

      test('navigateBetweenStacksForward', function() {
        this.cursor.setLocation(this.blocks.A.nextConnection);
        var nextStack = this.cursor.navigateBetweenStacks_(true);
        assertEquals(nextStack, this.blocks.D);
      });

      test('navigateBetweenStacksBackward', function() {
        this.cursor.setLocation(this.blocks.D);
        var nextStack = this.cursor.navigateBetweenStacks_(false);
        assertEquals(nextStack, this.blocks.A);
      });

      test('isStackFalse', function() {
        this.cursor.setLocation(this.blocks.B);
        var isStack = this.cursor.isStack();
        assertEquals(isStack, false);
      });

      test('isStackTrue', function() {
        this.cursor.setLocation(this.blocks.A.previousConnection);
        var isStack = this.cursor.isStack();
        assertEquals(isStack, true);
      });

      test('findTopConnection', function() {
        var topConnection = this.cursor.findTopConnection_(this.blocks.A);
        assertEquals(topConnection, this.blocks.A.previousConnection);
      });
    });

  suite('NavigationFunctions', function() {
    suite('Next', function() {
      test('previousConnection', function() {
        this.cursor.setLocation(this.blocks.A.previousConnection);
        this.cursor.next();
        assertEquals(this.cursor.getLocation(), this.blocks.A);
      });
      test('block', function() {
        this.cursor.setLocation(this.blocks.A);
        this.cursor.next();
        assertEquals(this.cursor.getLocation(), this.blocks.A.nextConnection);
      });
      test('nextConnection', function() {
        this.cursor.setLocation(this.blocks.A.nextConnection);
        this.cursor.next();
        assertEquals(this.cursor.getLocation(), this.blocks.B.previousConnection);
      });
      test('input', function() {
        var input = this.blocks.A.inputList[0];
        //need to pass in parent input
        //This will normally get set in the in function
        this.cursor.setLocation(input.connection, input);
        this.cursor.next();
        assertEquals(this.cursor.getLocation(), this.blocks.A.inputList[1].connection);
      });
      test('output', function() {
        var output = this.blocks.E.outputConnection;
        this.cursor.setLocation(output);
        this.cursor.next();
        assertEquals(this.cursor.getLocation(), this.blocks.E);
      });
      test('field', function() {
        var field = this.blocks.A.inputList[0].fieldRow[1];
        this.cursor.setLocation(field, this.blocks.A.inputList[0]);
        this.cursor.next();
        assertEquals(this.cursor.getLocation(), this.blocks.A.inputList[0].connection);
      });
      test('isStack', function() {
        this.cursor.isStack_ = true;
        this.cursor.setLocation(this.blocks.A.previousConnection);
        this.cursor.next();
        assertEquals(this.cursor.getLocation(), this.blocks.D.previousConnection);
        assertEquals(this.cursor.isStack_, true);
      });
    });

    suite('Previous', function() {
      test('previousConnectionTopBlock', function() {
        this.cursor.setLocation(this.blocks.A.previousConnection);
        this.cursor.prev();
        assertEquals(this.cursor.getLocation(), this.blocks.A.previousConnection);
      });
      test('previousConnection', function() {
        this.cursor.setLocation(this.blocks.B.previousConnection);
        this.cursor.prev();
        assertEquals(this.cursor.getLocation(), this.blocks.A.nextConnection);
      });
      test('block', function() {
        this.cursor.setLocation(this.blocks.A);
        this.cursor.prev();
        assertEquals(this.cursor.getLocation(), this.blocks.A.previousConnection);
      });
      test('nextConnection', function() {
        this.cursor.setLocation(this.blocks.A.nextConnection);
        this.cursor.prev();
        assertEquals(this.cursor.getLocation(), this.blocks.A);
      });
      test('input', function() {
        var input = this.blocks.A.inputList[0];
        //need to pass in parent input
        //This will normally get set in the in function
        this.cursor.setLocation(input.connection, input);
        this.cursor.prev();
        assertEquals(this.cursor.getLocation(), input.fieldRow[1]);
      });
      test('output', function() {
        var output = this.blocks.E.outputConnection;
        this.cursor.setLocation(output);
        //cursor.prev should return null but cursor should stay on same location
        assertEquals(this.cursor.prev(), null);
        assertEquals(this.cursor.getLocation(), output);
      });
      test('field', function() {
        var field = this.blocks.A.inputList[0].fieldRow[0];
        this.cursor.setLocation(field, this.blocks.A.inputList[0]);
        assertEquals(this.cursor.prev(), null);
        assertEquals(this.cursor.getLocation(), field);
      });
      test('isStack', function() {
        this.cursor.isStack_ = true;
        this.cursor.setLocation(this.blocks.D.previousConnection);
        this.cursor.prev();
        assertEquals(this.cursor.getLocation(), this.blocks.A.previousConnection);
        assertEquals(this.cursor.isStack_, true);
      });
      test('hasParentInput', function() {
        var input = this.blocks.B.inputList[1];
        this.cursor.setLocation(input.connection, input);
        this.cursor.prev();
        assertEquals(this.cursor.getLocation(), this.blocks.B.inputList[0].connection);
        assertEquals(this.cursor.getParentInput(), this.blocks.B.inputList[0]);
      });
    });

    suite('In', function() {
      test('block', function() {
        this.cursor.setLocation(this.blocks.A);
        this.cursor.in();
        assertEquals(this.cursor.getLocation(), this.blocks.A.inputList[0].fieldRow[0]);
      });
      test('input', function() {
        var input = this.blocks.A.inputList[0];
        //need to pass in parent input
        //This will normally get set in the in function
        this.cursor.setLocation(input.connection, input);
        this.cursor.in();
        assertEquals(this.cursor.getLocation(), this.blocks.E.outputConnection);
      });
      test('output', function() {
        var output = this.blocks.E.outputConnection;
        this.cursor.setLocation(output);
        //cursor.prev should return null but cursor should stay on same location
        assertEquals(this.cursor.in(), null);
        assertEquals(this.cursor.getLocation(), output);
      });
      test('field', function() {
        var field = this.blocks.A.inputList[0].fieldRow[0];
        this.cursor.setLocation(field, this.blocks.A.inputList[0]);
        assertEquals(this.cursor.in(), null);
        assertEquals(this.cursor.getLocation(), field);
      });
      test('isStack', function() {
        this.cursor.isStack_ = true;
        this.cursor.setLocation(this.blocks.D.previousConnection);
        this.cursor.in();
        assertEquals(this.cursor.getLocation(), this.blocks.D.previousConnection);
        assertEquals(this.cursor.isStack_, false);
      });
    });

    suite('Out', function() {
      test('topBlock', function() {
        this.cursor.setLocation(this.blocks.A);
        this.cursor.out();
        assertEquals(this.cursor.getLocation(), this.blocks.A.previousConnection);
      });
      test('nestedBlock', function() {
        this.cursor.setLocation(this.blocks.C);
        this.cursor.out();
        assertEquals(this.cursor.getLocation(), this.blocks.B.inputList[1].connection);
      });
      test('input', function() {
        var input = this.blocks.A.inputList[0];
        //need to pass in parent input
        //This will normally get set in the in function
        this.cursor.setLocation(input.connection, input);
        this.cursor.out();
        assertEquals(this.cursor.getLocation(), this.blocks.A);
      });
      test('output', function() {
        var output = this.blocks.E.outputConnection;
        this.cursor.setLocation(output);
        this.cursor.out();
        assertEquals(this.cursor.getLocation(), this.blocks.A.inputList[0].connection);
      });
      test('field', function() {
        var field = this.blocks.A.inputList[0].fieldRow[0];
        this.cursor.setLocation(field, this.blocks.A.inputList[0]);
        assertEquals(this.cursor.out(), this.blocks.A);
      });
      test('insideStatement', function() {
        var nextConnection = this.blocks.C.nextConnection;
        this.cursor.setLocation(nextConnection);
        assertEquals(this.cursor.out(), this.blocks.B.inputList[1].connection);
        assertEquals(this.cursor.getParentInput(), this.blocks.B.inputList[1]);
      });
    });
  });
});
