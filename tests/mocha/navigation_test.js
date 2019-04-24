

suite('Navigation', function() {

  suite('Handles keys', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        "type": "basic_block",
        "message0": ""
      }]);

      var toolbox = document.getElementById('toolbox-minimal');
      this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
    });

    test('Focuses workspace from flyout', function() {
      Blockly.Navigation.currentState_ = Blockly.Navigation.STATE_FLYOUT;
      var mockEvent = {
        keyCode: goog.events.KeyCodes.E
      };
      chai.assert.isTrue(Blockly.Navigation.navigate(mockEvent));
      chai.assert.equal(Blockly.Navigation.currentState_,
          Blockly.Navigation.STATE_WS);
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
      Blockly.Navigation.focusToolbox();


      this.firstCategory_ = this.workspace.getToolbox().tree_.firstChild_;
      this.secondCategory_ = this.firstCategory_.getNextShownNode();
    });

    test('Next', function() {
      chai.assert.isTrue(Blockly.Navigation.navigate({
        keyCode: goog.events.KeyCodes.S
      }));
      chai.assert.equal(Blockly.Navigation.currentState_,
          Blockly.Navigation.STATE_TOOLBOX);
      chai.assert.equal(Blockly.Navigation.currentCategory_,
          this.secondCategory_);
    });

    // Should be a no-op.
    test('Next at end', function() {
      Blockly.Navigation.nextCategory();
      var startCategory = Blockly.Navigation.currentCategory_;
      chai.assert.isTrue(Blockly.Navigation.navigate({
        keyCode: goog.events.KeyCodes.S
      }));
      chai.assert.equal(Blockly.Navigation.currentState_,
          Blockly.Navigation.STATE_TOOLBOX);
      chai.assert.equal(Blockly.Navigation.currentCategory_,
          startCategory);
    });

    test('Previous', function() {
      // Go forward one so that we can go back one:
      Blockly.Navigation.nextCategory();
      chai.assert.equal(Blockly.Navigation.currentCategory_,
          this.secondCategory_);
      chai.assert.isTrue(Blockly.Navigation.navigate({
        keyCode: goog.events.KeyCodes.W
      }));
      chai.assert.equal(Blockly.Navigation.currentState_,
          Blockly.Navigation.STATE_TOOLBOX);
      chai.assert.equal(Blockly.Navigation.currentCategory_,
          this.firstCategory_);
    });

    // Should be a no-op.
    test('Previous at start', function() {
      var startCategory = Blockly.Navigation.currentCategory_;
      chai.assert.isTrue(Blockly.Navigation.navigate({
        keyCode: goog.events.KeyCodes.W
      }));
      chai.assert.equal(Blockly.Navigation.currentState_,
          Blockly.Navigation.STATE_TOOLBOX);
      chai.assert.equal(Blockly.Navigation.currentCategory_,
          startCategory);
    });

    test('Out', function() {
      chai.assert.isTrue(Blockly.Navigation.navigate({
        keyCode: goog.events.KeyCodes.A
      }));
      // TODO (fenichel/aschmiedt): Decide whether out should go to the
      // workspace.
      chai.assert.equal(Blockly.Navigation.currentState_,
          Blockly.Navigation.STATE_TOOLBOX);
    });

    test('Go to flyout', function() {
      chai.assert.isTrue(Blockly.Navigation.navigate({
        keyCode: goog.events.KeyCodes.D
      }));
      chai.assert.equal(Blockly.Navigation.currentState_,
          Blockly.Navigation.STATE_FLYOUT);

      chai.assert.equal(Blockly.Navigation.flyoutBlock_.getFieldValue("TEXT"), "First");
    });

    test('Focuses workspace from toolbox', function() {
      Blockly.Navigation.currentState_ = Blockly.Navigation.STATE_TOOLBOX;
      var mockEvent = {
        keyCode: goog.events.KeyCodes.E
      };
      chai.assert.isTrue(Blockly.Navigation.navigate(mockEvent));
      chai.assert.equal(Blockly.Navigation.currentState_,
          Blockly.Navigation.STATE_WS);
    });
    // More tests:
    // - nested categories
    teardown(function() {
      delete Blockly.Blocks['basic_block'];
      this.workspace.dispose();
      Blockly.Navigation.currentCategory_ = null;
    });
  });
});
