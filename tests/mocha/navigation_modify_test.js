suite.skip('Insert/Modify', function() {
  setup(function() {
    var xmlText = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '<block type="stack_block" id="stack_block_1" x="12" y="38"></block>' +
      '<block type="stack_block" id="stack_block_2" x="12" y="113"></block>' +
      '<block type="row_block" id="row_block_1" x="13" y="213"></block>' +
      '<block type="row_block" id="row_block_2" x="12" y="288"></block>' +
    '</xml>';
    defineStackBlock();
    defineRowBlock();

    var toolbox = document.getElementById('toolbox-connections');
    this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xmlText), this.workspace);

    this.stack_block_1 = this.workspace.getBlockById('stack_block_1');
    this.stack_block_2 = this.workspace.getBlockById('stack_block_2');
    this.row_block_1 = this.workspace.getBlockById('row_block_1');
    this.row_block_2 = this.workspace.getBlockById('row_block_2');

    Blockly.Navigation.enableKeyboardAccessibility();
    Blockly.Navigation.focusWorkspace();
  });

  teardown(function() {
    delete Blockly.Blocks['stack_block'];
    delete Blockly.Blocks['row_block'];
    this.workspace.dispose();
    // Does disposing of the workspace dispose of cursors and markers
    // correctly?
  });

  suite('Marked Connection', function() {
    suite('Marker on next', function() {
      setup(function() {
        Blockly.Navigation.marker_.setLocation(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_1.nextConnection));
      });
      test('Cursor on workspace', function() {
        Blockly.Navigation.cursor_.setLocation(
            Blockly.ASTNode.createWorkspaceNode(this.workspace,
                new goog.math.Coordinate(0, 0)));
        chai.assert.isFalse(Blockly.Navigation.modify());
      });
      test('Cursor on compatible connection', function() {
        Blockly.Navigation.cursor_.setLocation(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_2.previousConnection));
        chai.assert.isTrue(Blockly.Navigation.modify());
        chai.assert.equal(this.stack_block_1.getNextBlock().id, 'stack_block_2');
      });
      test('Cursor on incompatible connection', function() {
        Blockly.Navigation.cursor_.setLocation(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_2.nextConnection));
        chai.assert.isFalse(Blockly.Navigation.modify());
        chai.assert.isNull(this.stack_block_1.getNextBlock());
      });
      test('Cursor on really incompatible connection', function() {
        Blockly.Navigation.cursor_.setLocation(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_1.outputConnection));
        chai.assert.isFalse(Blockly.Navigation.modify());
        chai.assert.isNull(this.stack_block_1.getNextBlock());
      });
      test('Cursor on block', function() {
        Blockly.Navigation.cursor_.setLocation(
            Blockly.ASTNode.createBlockNode(
                this.stack_block_2));
        chai.assert.isTrue(Blockly.Navigation.modify());
        chai.assert.equal(this.stack_block_1.getNextBlock().id, 'stack_block_2');
      });
    });

    suite('Marker on previous', function() {
      setup(function() {
        Blockly.Navigation.marker_.setLocation(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_1.previousConnection));
      });
      test('Cursor on compatible connection', function() {
        Blockly.Navigation.cursor_.setLocation(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_2.nextConnection));
        chai.assert.isTrue(Blockly.Navigation.modify());
        chai.assert.equal(this.stack_block_1.getPreviousBlock().id, 'stack_block_2');
      });
      test('Cursor on incompatible connection', function() {
        Blockly.Navigation.cursor_.setLocation(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_2.previousConnection));
        chai.assert.isFalse(Blockly.Navigation.modify());
        chai.assert.isNull(this.stack_block_1.getPreviousBlock());
      });
      test('Cursor on really incompatible connection', function() {
        Blockly.Navigation.cursor_.setLocation(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_1.outputConnection));
        chai.assert.isFalse(Blockly.Navigation.modify());
        chai.assert.isNull(this.stack_block_1.getNextBlock());
      });
      test('Cursor on block', function() {
        Blockly.Navigation.cursor_.setLocation(
            Blockly.ASTNode.createBlockNode(
                this.stack_block_2));
        chai.assert.isTrue(Blockly.Navigation.modify());
        chai.assert.equal(this.stack_block_1.getPreviousBlock().id, 'stack_block_2');
      });
    });

    suite('Value input', function() {
      setup(function() {

      });

      teardown(function() {

      });

      test('', function() {

      });
    });

    suite('Statement input', function() {
      setup(function() {

      });

      teardown(function() {

      });

      test('', function() {

      });
    });

    suite('Output', function() {
      setup(function() {

      });

      teardown(function() {

      });

      test('', function() {

      });
    });
  });
});
