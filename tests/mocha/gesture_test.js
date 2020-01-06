/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
    assertEquals(gesture.mostRecentEvent_, this.e);
    assertEquals(gesture.creatorWorkspace_, this.workspace);
  });

  test('Field click - Click in workspace', function() {
    var block = new Blockly.Block(this.workspace);
    var field = new Blockly.Field();
    field.setSourceBlock(block);
    field.showEditor_ = function() {};
    var gesture = new Blockly.Gesture(this.e, this.workspace);
    gesture.setStartField(field);
  
    var isFieldClick = gesture.isFieldClick_();
    assertEquals(isFieldClick, true);
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
    assertEquals(isFieldClick, expectedResult);
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
    assertEquals(cursor.getCurNode().getType(), Blockly.ASTNode.types.WORKSPACE);
  });
});
