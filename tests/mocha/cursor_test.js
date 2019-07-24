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

  test('Next - From a block skip over next connection', function() {
    var blockNode = Blockly.ASTNode.createBlockNode(this.blocks.A);
    this.cursor.setLocation(blockNode);
    this.cursor.next();
    var curNode = this.cursor.getCurNode();
    assertEquals(curNode.getLocation(), this.blocks.B.previousConnection);
  });
  test('Next - From last block in a stack go to next connection', function() {
    var blockNode = Blockly.ASTNode.createBlockNode(this.blocks.B);
    this.cursor.setLocation(blockNode);
    this.cursor.next();
    var curNode = this.cursor.getCurNode();
    assertEquals(curNode.getLocation(), this.blocks.B.nextConnection);
  });

  test('In - From input skip over output connection', function() {
    var inputNode = Blockly.ASTNode.createInputNode(this.blocks.A.inputList[0]);
    this.cursor.setLocation(inputNode);
    this.cursor.in();
    var curNode = this.cursor.getCurNode();
    assertEquals(curNode.getLocation(), this.blocks.E);
  });

  test('Prev - From previous connection skip over next connection', function() {
    var prevConnection = this.blocks.B.previousConnection;
    var prevConnectionNode = Blockly.ASTNode.createConnectionNode(prevConnection);
    this.cursor.setLocation(prevConnectionNode);
    this.cursor.prev();
    var curNode = this.cursor.getCurNode();
    assertEquals(curNode.getLocation(), this.blocks.A);
  });
});
