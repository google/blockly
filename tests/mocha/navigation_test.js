

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

    test('Focuses workspace from toolbox', function() {
      Blockly.Navigation.currentState_ = Blockly.Navigation.STATE_TOOLBOX;
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
});
