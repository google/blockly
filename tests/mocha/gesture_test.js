/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tests for gesture.
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

suite('Gesture', function() {

  setup(function() {
    this.workspace = new Blockly.Workspace();
    this.e = {};
  });

  teardown(function() {
    this.e = null;
    this.workspace.dispose();
  });

  test('Constructor', function() {
    var gesture = new Blockly.Gesture(this.e, this.workspace);
    chai.assert.equal(gesture.mostRecentEvent_, this.e);
    chai.assert.equal(gesture.creatorWorkspace_, this.workspace);
  });

  test('Field click - Click in workspace', function() {
    var block = new Blockly.Block(this.workspace);
    var field = new Blockly.Field();
    field.setSourceBlock(block);
    field.showEditor_ = function() {};
    var gesture = new Blockly.Gesture(this.e, this.workspace);
    gesture.setStartField(field);
  
    var isFieldClick = gesture.isFieldClick_();
    chai.assert.isTrue(isFieldClick);
  });

  function gestureIsFieldClick_InFlyoutHelper(flyout, expectedResult){
    // Assign workspace flyout
    this.workspace.flyout_ = flyout;
    // Create a Field inside of a Block
    var block = new Blockly.Block(this.workspace);
    var field = new Blockly.Field();
    field.setSourceBlock(block);
    field.showEditor_ = function() {};
    // Create gesture from the flyout
    var gesture = new Blockly.Gesture(this.e, this.workspace.flyout_);
    // Populate gesture with click start information
    gesture.setStartField(field);
    gesture.setStartFlyout_(this.workspace.flyout_);
  
    var isFieldClick = gesture.isFieldClick_();
    chai.assert.equal(isFieldClick, expectedResult);
  }

  test('Field click - Auto close flyout', function() {
    var flyout = new Blockly.VerticalFlyout({});
    flyout.autoClose = false;
    gestureIsFieldClick_InFlyoutHelper.call(this, flyout, true);
  });

  test('Field click - Always open flyout', function() {
    var flyout = new Blockly.VerticalFlyout({});
    flyout.autoClose = false;
    gestureIsFieldClick_InFlyoutHelper.call(this, flyout, true);
  });

  test('Workspace click - Shift click enters accessibility mode', function() {
    var event = {
      shiftKey : true,
      clientX : 10,
      clientY : 10,

    };
    var ws = Blockly.inject('blocklyDiv', {});
    ws.keyboardAccessibilityMode = true;
    var gesture = new Blockly.Gesture(event, ws);
    gesture.doWorkspaceClick_(event);
    var cursor = ws.getCursor();
    chai.assert.equal(cursor.getCurNode().getType(), Blockly.ASTNode.types.WORKSPACE);
  });
});
