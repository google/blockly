suite('Navigation', function() {

  suite('Handles keys', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        "type": "basic_block",
        "message0": ""
      }]);

      var toolbox = document.getElementById('toolbox-minimal');
      this.mockEvent = {
        getModifierState: function() {
          return false;
        }
      };
      this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
    });

    test('Focuses workspace from flyout (e)', function() {
      Blockly.navigation.currentState_ = Blockly.navigation.STATE_FLYOUT;
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.E;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
    });

    test('Focuses workspace from flyout (escape)', function() {
      Blockly.navigation.currentState_ = Blockly.navigation.STATE_FLYOUT;
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.ESC;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
    });
    teardown(function() {
      delete Blockly.Blocks['basic_block'];
      this.workspace.dispose();
    });
  });
  // Test that toolbox key handlers call through to the right functions and
  // transition correctly between toolbox, workspace, and flyout.
  suite('Handles toolbox keys', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        "type": "basic_block",
        "message0": "%1",
        "args0": [
          {
            "type": "field_input",
            "name": "TEXT",
            "text": "default"
          }
        ]
      }]);
      var toolbox = document.getElementById('toolbox-categories');
      this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
      Blockly.navigation.focusToolbox();
      this.mockEvent = {
        getModifierState: function() {
          return false;
        }
      };

      this.firstCategory_ = this.workspace.getToolbox().tree_.firstChild_;
      this.secondCategory_ = this.firstCategory_.getNextShownNode();
    });

    teardown(function() {
      delete Blockly.Blocks['basic_block'];
      this.workspace.dispose();
      Blockly.navigation.currentCategory_ = null;
    });

    test('Next', function() {
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.S;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_TOOLBOX);
      chai.assert.equal(Blockly.navigation.currentCategory_,
          this.secondCategory_);
    });

    // Should be a no-op.
    test('Next at end', function() {
      Blockly.navigation.nextCategory();
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.S;
      var startCategory = Blockly.navigation.currentCategory_;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_TOOLBOX);
      chai.assert.equal(Blockly.navigation.currentCategory_,
          startCategory);
    });

    test('Previous', function() {
      // Go forward one so that we can go back one:
      Blockly.navigation.nextCategory();
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.W;
      chai.assert.equal(Blockly.navigation.currentCategory_,
          this.secondCategory_);
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_TOOLBOX);
      chai.assert.equal(Blockly.navigation.currentCategory_,
          this.firstCategory_);
    });

    // Should be a no-op.
    test('Previous at start', function() {
      var startCategory = Blockly.navigation.currentCategory_;
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.W;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_TOOLBOX);
      chai.assert.equal(Blockly.navigation.currentCategory_,
          startCategory);
    });

    test('Out', function() {
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.A;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      // TODO (fenichel/aschmiedt): Decide whether out should go to the
      // workspace.
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_TOOLBOX);
    });

    test('Go to flyout', function() {
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.D;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_FLYOUT);

      chai.assert.equal(Blockly.navigation.flyoutBlock_.getFieldValue("TEXT"), "First");
    });

    test('Focuses workspace from toolbox (e)', function() {
      Blockly.navigation.currentState_ = Blockly.navigation.STATE_TOOLBOX;
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.E;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
    });
    test('Focuses workspace from toolbox (escape)', function() {
      Blockly.navigation.currentState_ = Blockly.navigation.STATE_TOOLBOX;
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.E;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
    });
    // More tests:
    // - nested categories
  });
  suite('Insert Functions', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        "type": "basic_block",
        "message0": "",
        "previousStatement": null,
        "nextStatement": null,
      }]);

      var toolbox = document.getElementById('toolbox-categories');
      this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});

      var basicBlock = this.workspace.newBlock('basic_block');
      var basicBlock2 = this.workspace.newBlock('basic_block');

      this.basicBlock = basicBlock;
      this.basicBlock2 = basicBlock2;
    });

    test('Insert from flyout with a valid connection marked', function() {
      var previousConnection = this.basicBlock.previousConnection;
      var prevNode = Blockly.ASTNode.createConnectionNode(previousConnection);
      Blockly.navigation.marker_.setLocation(prevNode);

      Blockly.navigation.focusToolbox();
      Blockly.navigation.focusFlyout();
      Blockly.navigation.insertFromFlyout();

      var insertedBlock = this.basicBlock.previousConnection.targetBlock();

      chai.assert.isTrue(insertedBlock !== null);
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
    });

    test('Insert Block from flyout without marking a connection', function() {
      Blockly.navigation.focusToolbox();
      Blockly.navigation.focusFlyout();
      Blockly.navigation.insertFromFlyout();

      var numBlocks = this.workspace.getTopBlocks().length;

      //Make sure the block was not connected to anything
      chai.assert.isNull(this.basicBlock.previousConnection.targetConnection);
      chai.assert.isNull(this.basicBlock.nextConnection.targetConnection);

      //Make sure that the block was added to the workspace
      chai.assert.equal(numBlocks, 3);
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
    });

    test('Connect two blocks that are on the workspace', function() {
      var targetNode = Blockly.ASTNode.createConnectionNode(this.basicBlock.previousConnection);
      Blockly.navigation.marker_.setLocation(targetNode);

      var sourceNode = Blockly.ASTNode.createConnectionNode(this.basicBlock2.nextConnection);
      Blockly.navigation.cursor_.setLocation(sourceNode);

      Blockly.navigation.modify();
      var insertedBlock = this.basicBlock.previousConnection.targetBlock();

      chai.assert.isNotNull(insertedBlock);
    });


    teardown(function() {
      delete Blockly.Blocks['basic_block'];
      this.workspace.dispose();
      Blockly.navigation.currentCategory_ = null;
    });
  });
});
