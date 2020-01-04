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
 * @fileoverview Navigation tests.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';


suite('Navigation', function() {
  function createNavigationWorkspace(enableKeyboardNav) {
    var toolbox = document.getElementById('toolbox-categories');
    var workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
    if (enableKeyboardNav) {
      Blockly.navigation.enableKeyboardAccessibility();
      Blockly.navigation.currentState_ = Blockly.navigation.STATE_WS;
    }
    return workspace;
  }

  // Test that toolbox key handlers call through to the right functions and
  // transition correctly between toolbox, workspace, and flyout.
  suite('Tests toolbox keys', function() {
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
      this.workspace = createNavigationWorkspace(true);
      Blockly.navigation.focusToolbox_();
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
    });

    test('Next', function() {
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.S;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_TOOLBOX);
      chai.assert.equal(this.workspace.getToolbox().tree_.getSelectedItem(),
          this.secondCategory_);
    });

    // Should be a no-op.
    test('Next at end', function() {
      this.workspace.getToolbox().tree_.getSelectedItem().selectNext();
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.S;
      // Go forward one so that we can go back one.
      Blockly.navigation.onKeyPress(this.mockEvent);
      var startCategory = this.workspace.getToolbox().tree_.getSelectedItem();
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_TOOLBOX);
      chai.assert.equal(this.workspace.getToolbox().tree_.getSelectedItem(),
          startCategory);
    });

    test('Previous', function() {
      // Go forward one so that we can go back one:
      this.workspace.getToolbox().tree_.getSelectedItem().selectNext();
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.W;
      chai.assert.equal(this.workspace.getToolbox().tree_.getSelectedItem(),
          this.secondCategory_);
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_TOOLBOX);
      chai.assert.equal(this.workspace.getToolbox().tree_.getSelectedItem(),
          this.firstCategory_);
    });

    // Should be a no-op.
    test('Previous at start', function() {
      var startCategory = this.workspace.getToolbox().tree_.getSelectedItem();
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.W;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_TOOLBOX);
      chai.assert.equal(this.workspace.getToolbox().tree_.getSelectedItem(),
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
      var flyoutCursor = Blockly.navigation.getFlyoutCursor_();

      chai.assert.equal(flyoutCursor.getCurNode().getLocation().getFieldValue("TEXT"),
          "FirstCategory-FirstBlock");
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

  // Test that flyout key handlers call through to the right functions and
  // transition correctly between toolbox, workspace, and flyout.
  suite('Tests flyout keys', function() {
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
      this.workspace = createNavigationWorkspace(true);
      Blockly.mainWorkspace = this.workspace;
      Blockly.navigation.focusToolbox_();
      Blockly.navigation.focusFlyout_();
      this.mockEvent = {
        getModifierState: function() {
          return false;
        }
      };
    });

    teardown(function() {
      delete Blockly.Blocks['basic_block'];
      this.workspace.dispose();
    });

    // Should be a no-op
    test('Previous at beginning', function() {
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.W;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_FLYOUT);
      chai.assert.equal(Blockly.navigation.getFlyoutCursor_().getCurNode().getLocation().getFieldValue("TEXT"),
          "FirstCategory-FirstBlock");
    });

    test('Previous', function() {
      var flyoutBlocks = this.workspace.getFlyout().getWorkspace().getTopBlocks();
      Blockly.navigation.getFlyoutCursor_().setCurNode(
          Blockly.ASTNode.createStackNode(flyoutBlocks[1]));
      var flyoutBlock = Blockly.navigation.getFlyoutCursor_().getCurNode().getLocation();
      chai.assert.equal(flyoutBlock.getFieldValue("TEXT"),
          "FirstCategory-SecondBlock");
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.W;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_FLYOUT);
      flyoutBlock = Blockly.navigation.getFlyoutCursor_().getCurNode().getLocation();
      chai.assert.equal(flyoutBlock.getFieldValue("TEXT"),
          "FirstCategory-FirstBlock");
    });

    test('Next', function() {
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.S;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_FLYOUT);
      var flyoutBlock = Blockly.navigation.getFlyoutCursor_().getCurNode().getLocation();
      chai.assert.equal(flyoutBlock.getFieldValue("TEXT"),
          "FirstCategory-SecondBlock");
    });

    test('Out', function() {
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.A;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_TOOLBOX);
    });

    test('MARK', function() {
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.ENTER;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
      chai.assert.equal(this.workspace.getTopBlocks().length, 1);
    });

    test('EXIT', function() {
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.ESC;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
    });
  });

  // Test that workspace key handlers call through to the right functions and
  // transition correctly between toolbox, workspace, and flyout.
  suite('Tests workspace keys', function() {
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
        ],
        "previousStatement": null,
        "nextStatement": null
      }]);
      this.workspace = createNavigationWorkspace(true);
      this.basicBlock = this.workspace.newBlock('basic_block');
      this.firstCategory_ = this.workspace.getToolbox().tree_.firstChild_;
      this.mockEvent = {
        getModifierState: function() {
          return false;
        }
      };
    });

    teardown(function() {
      delete Blockly.Blocks['basic_block'];
      this.workspace.dispose();
    });

    test('Previous', function() {
      sinon.spy(this.workspace.getCursor(), 'prev');
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.W;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.isTrue(this.workspace.getCursor().prev.calledOnce);
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
      this.workspace.getCursor().prev.restore();
    });

    test('Next', function() {
      var cursor = this.workspace.getCursor();
      sinon.spy(cursor, 'next');
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.S;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.isTrue(cursor.next.calledOnce);
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
      cursor.next.restore();
    });

    test('Out', function() {
      var cursor = this.workspace.getCursor();
      sinon.spy(cursor, 'out');
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.A;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.isTrue(cursor.out.calledOnce);
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
      cursor.out.restore();
    });

    test('In', function() {
      var cursor = this.workspace.getCursor();
      sinon.spy(cursor, 'in');
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.D;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.isTrue(cursor.in.calledOnce);
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
      cursor.in.restore();
    });

    test('Insert', function() {
      sinon.spy(Blockly.navigation, 'modify_');
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.I;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.isTrue(Blockly.navigation.modify_.calledOnce);
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
      Blockly.navigation.modify_.restore();
    });

    test('Mark', function() {
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createConnectionNode(this.basicBlock.previousConnection));
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.ENTER;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      var markedNode = this.workspace.getMarker(Blockly.navigation.MARKER_NAME).getCurNode();
      chai.assert.equal(markedNode.getLocation(), this.basicBlock.previousConnection);
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
    });

    test('Toolbox', function() {
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.T;
      chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      chai.assert.equal(this.workspace.getToolbox().tree_.getSelectedItem(), this.firstCategory_);
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_TOOLBOX);
    });
  });

  suite('Test key press', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        "type": "basic_block",
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "OP",
            "options": [
              ["%{BKY_MATH_ADDITION_SYMBOL}", "ADD"],
              ["%{BKY_MATH_SUBTRACTION_SYMBOL}", "MINUS"],
              ["%{BKY_MATH_MULTIPLICATION_SYMBOL}", "MULTIPLY"],
              ["%{BKY_MATH_DIVISION_SYMBOL}", "DIVIDE"],
              ["%{BKY_MATH_POWER_SYMBOL}", "POWER"]
            ]
          }
        ]
      }]);
      this.workspace = createNavigationWorkspace(true);
      this.workspace.getCursor().drawer_ = null;
      this.basicBlock = this.workspace.newBlock('basic_block');
      Blockly.user.keyMap.setKeyMap(Blockly.user.keyMap.createDefaultKeyMap());
      Blockly.mainWorkspace = this.workspace;
      Blockly.getMainWorkspace().keyboardAccessibilityMode = true;
      Blockly.navigation.currentState_ = Blockly.navigation.STATE_WS;

      this.mockEvent = {
        getModifierState: function() {
          return false;
        }
      };
    });
    test('Action does not exist', function() {
      var block = this.workspace.getTopBlocks()[0];
      var field = block.inputList[0].fieldRow[0];
      sinon.spy(field, 'onBlocklyAction');
      this.workspace.getCursor().setCurNode(Blockly.ASTNode.createFieldNode(field));
      this.mockEvent.keyCode = Blockly.utils.KeyCodes.N;
      var isHandled = Blockly.navigation.onKeyPress(this.mockEvent);
      chai.assert.isFalse(isHandled);
      chai.assert.isFalse(field.onBlocklyAction.calledOnce);

      field.onBlocklyAction.restore();
    });

    test('Action exists - field handles action', function() {
      var block = this.workspace.getTopBlocks()[0];
      var field = block.inputList[0].fieldRow[0];

      sinon.stub(field, 'onBlocklyAction').callsFake(function(){
        return true;
      });
      this.workspace.getCursor().setCurNode(Blockly.ASTNode.createFieldNode(field));

      var isHandled = Blockly.navigation.onBlocklyAction(Blockly.navigation.ACTION_OUT);
      chai.assert.isTrue(isHandled);
      chai.assert.isTrue(field.onBlocklyAction.calledOnce);

      field.onBlocklyAction.restore();
    });

    test('Action exists - field does not handle action', function() {
      var block = this.workspace.getTopBlocks()[0];
      var field = block.inputList[0].fieldRow[0];
      sinon.spy(field, 'onBlocklyAction');
      this.workspace.getCursor().setCurNode(Blockly.ASTNode.createFieldNode(field));

      this.mockEvent.keyCode = Blockly.utils.KeyCodes.A;
      var isHandled = Blockly.navigation.onBlocklyAction(Blockly.navigation.ACTION_OUT);
      chai.assert.isTrue(isHandled);
      chai.assert.isTrue(field.onBlocklyAction.calledOnce);

      field.onBlocklyAction.restore();
    });

    test('Toggle Action Off', function() {
      this.mockEvent.keyCode = 'ShiftControl75';
      sinon.spy(Blockly.navigation, 'onBlocklyAction');
      Blockly.getMainWorkspace().keyboardAccessibilityMode = true;

      var isHandled = Blockly.navigation.onKeyPress(this.mockEvent);
      chai.assert.isTrue(isHandled);
      chai.assert.isTrue(Blockly.navigation.onBlocklyAction.calledOnce);
      chai.assert.isFalse(Blockly.getMainWorkspace().keyboardAccessibilityMode);
      Blockly.navigation.onBlocklyAction.restore();
    });

    test('Toggle Action On', function() {
      this.mockEvent.keyCode = 'ShiftControl75';
      sinon.stub(Blockly.navigation, 'focusWorkspace_');
      Blockly.getMainWorkspace().keyboardAccessibilityMode = false;

      var isHandled = Blockly.navigation.onKeyPress(this.mockEvent);
      chai.assert.isTrue(isHandled);
      chai.assert.isTrue(Blockly.navigation.focusWorkspace_.calledOnce);
      chai.assert.isTrue(Blockly.getMainWorkspace().keyboardAccessibilityMode);
      Blockly.navigation.focusWorkspace_.restore();
      this.workspace.dispose();
    });

    suite('Test key press in read only mode', function() {
      setup(function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_block",
          "message0": "%1 %2",
          "args0": [
            {
              "type": "field_dropdown",
              "name": "NAME",
              "options": [
                [
                  "a",
                  "optionA"
                ]
              ]
            },
            {
              "type": "input_value",
              "name": "NAME"
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "colour": 230,
          "tooltip": "",
          "helpUrl": ""
        }]);
        this.workspace = Blockly.inject('blocklyDiv', {readOnly: true});

        Blockly.mainWorkspace = this.workspace;
        this.workspace.getCursor().drawer_ = null;
        Blockly.getMainWorkspace().keyboardAccessibilityMode = true;
        Blockly.navigation.currentState_ = Blockly.navigation.STATE_WS;

        this.fieldBlock1 = this.workspace.newBlock('field_block');
        this.mockEvent = {
          getModifierState: function() {
            return false;
          }
        };
      });

      teardown(function() {
        delete Blockly.Blocks['field_block'];
        this.workspace.dispose();
      });

      test('Perform valid action for read only', function() {
        var astNode = Blockly.ASTNode.createBlockNode(this.fieldBlock1);
        this.workspace.getCursor().setCurNode(astNode);
        this.mockEvent.keyCode = Blockly.utils.KeyCodes.S;
        chai.assert.isTrue(Blockly.navigation.onKeyPress(this.mockEvent));
      });

      test('Perform invalid action for read only', function() {
        var astNode = Blockly.ASTNode.createBlockNode(this.fieldBlock1);
        this.workspace.getCursor().setCurNode(astNode);
        this.mockEvent.keyCode = Blockly.utils.KeyCodes.I;
        chai.assert.isFalse(Blockly.navigation.onKeyPress(this.mockEvent));
      });

      test('Try to perform action on a field', function() {
        var field = this.fieldBlock1.inputList[0].fieldRow[0];
        var astNode = Blockly.ASTNode.createFieldNode(field);
        this.workspace.getCursor().setCurNode(astNode);
        this.mockEvent.keyCode = Blockly.utils.KeyCodes.ENTER;
        chai.assert.isFalse(Blockly.navigation.onKeyPress(this.mockEvent));
      });
    });
  });

  suite('Insert Functions', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        "type": "basic_block",
        "message0": "",
        "previousStatement": null,
        "nextStatement": null,
      }]);

      this.workspace = createNavigationWorkspace(true);

      var basicBlock = this.workspace.newBlock('basic_block');
      var basicBlock2 = this.workspace.newBlock('basic_block');

      this.basicBlock = basicBlock;
      this.basicBlock2 = basicBlock2;
    });

    teardown(function() {
      delete Blockly.Blocks['basic_block'];
      this.workspace.dispose();
    });

    test('Insert from flyout with a valid connection marked', function() {
      var previousConnection = this.basicBlock.previousConnection;
      var prevNode = Blockly.ASTNode.createConnectionNode(previousConnection);
      this.workspace.getMarker(Blockly.navigation.MARKER_NAME).setCurNode(prevNode);

      Blockly.navigation.focusToolbox_();
      Blockly.navigation.focusFlyout_();
      Blockly.navigation.insertFromFlyout();

      var insertedBlock = this.basicBlock.previousConnection.targetBlock();

      chai.assert.isTrue(insertedBlock !== null);
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
    });

    test('Insert Block from flyout without marking a connection', function() {
      Blockly.navigation.focusToolbox_();
      Blockly.navigation.focusFlyout_();
      Blockly.navigation.insertFromFlyout();

      var numBlocks = this.workspace.getTopBlocks().length;

      // Make sure the block was not connected to anything
      chai.assert.isNull(this.basicBlock.previousConnection.targetConnection);
      chai.assert.isNull(this.basicBlock.nextConnection.targetConnection);

      // Make sure that the block was added to the workspace
      chai.assert.equal(numBlocks, 3);
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
    });

    test('Connect two blocks that are on the workspace', function() {
      var targetNode = Blockly.ASTNode.createConnectionNode(this.basicBlock.previousConnection);
      this.workspace.getMarker(Blockly.navigation.MARKER_NAME).setCurNode(targetNode);

      var sourceNode = Blockly.ASTNode.createConnectionNode(this.basicBlock2.nextConnection);
      this.workspace.getCursor().setCurNode(sourceNode);

      Blockly.navigation.modify_();
      var insertedBlock = this.basicBlock.previousConnection.targetBlock();

      chai.assert.isNotNull(insertedBlock);
    });
  });

  suite('Connect Blocks', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        "type": "basic_block",
        "message0": "",
        "previousStatement": null,
        "nextStatement": null,
      },
      {
        "type": "inline_block",
        "message0": "%1 %2",
        "args0": [
          {
            "type": "input_value",
            "name": "NAME"
          },
          {
            "type": "input_value",
            "name": "NAME"
          }
        ],
        "inputsInline": true,
        "output": null,
        "tooltip": "",
        "helpUrl": ""
      }]);

      this.workspace = createNavigationWorkspace(true);

      var basicBlock = this.workspace.newBlock('basic_block');
      var basicBlock2 = this.workspace.newBlock('basic_block');
      var basicBlock3 = this.workspace.newBlock('basic_block');
      var basicBlock4 = this.workspace.newBlock('basic_block');

      var inlineBlock1 = this.workspace.newBlock('inline_block');
      var inlineBlock2 = this.workspace.newBlock('inline_block');


      this.basicBlock = basicBlock;
      this.basicBlock2 = basicBlock2;
      this.basicBlock3 = basicBlock3;
      this.basicBlock4 = basicBlock4;

      this.inlineBlock1 = inlineBlock1;
      this.inlineBlock2 = inlineBlock2;

      this.basicBlock.nextConnection.connect(this.basicBlock2.previousConnection);

      this.basicBlock3.nextConnection.connect(this.basicBlock4.previousConnection);

      this.inlineBlock1.inputList[0].connection.connect(this.inlineBlock2.outputConnection);
    });

    teardown(function() {
      delete Blockly.Blocks['basic_block'];
      this.workspace.dispose();
    });

    test('Connect cursor on previous into stack', function() {
      var markedLocation = this.basicBlock2.previousConnection;
      var cursorLocation = this.basicBlock3.previousConnection;

      Blockly.navigation.connect_(cursorLocation, markedLocation);

      chai.assert.equal(this.basicBlock.nextConnection.targetBlock(), this.basicBlock3);
      chai.assert.equal(this.basicBlock2.previousConnection.targetBlock(), this.basicBlock4);
    });

    test('Connect marker on previous into stack', function() {
      var markedLocation = this.basicBlock3.previousConnection;
      var cursorLocation = this.basicBlock2.previousConnection;

      Blockly.navigation.connect_(cursorLocation, markedLocation);

      chai.assert.equal(this.basicBlock.nextConnection.targetBlock(), this.basicBlock3);
      chai.assert.equal(this.basicBlock2.previousConnection.targetBlock(), this.basicBlock4);

    });

    test('Connect cursor on next into stack', function() {
      var markedLocation = this.basicBlock2.previousConnection;
      var cursorLocation = this.basicBlock4.nextConnection;

      Blockly.navigation.connect_(cursorLocation, markedLocation);

      chai.assert.equal(this.basicBlock.nextConnection.targetBlock(), this.basicBlock4);
      chai.assert.equal(this.basicBlock3.nextConnection.targetConnection, null);
    });

    test('Connect cursor with parents', function() {
      var markedLocation = this.basicBlock3.previousConnection;
      var cursorLocation = this.basicBlock2.nextConnection;

      Blockly.navigation.connect_(cursorLocation, markedLocation);

      chai.assert.equal(this.basicBlock3.previousConnection.targetBlock(), this.basicBlock2);
    });

    test('Try to connect input that is descendant of output', function() {
      var markedLocation = this.inlineBlock2.inputList[0].connection;
      var cursorLocation = this.inlineBlock1.outputConnection;

      Blockly.navigation.connect_(cursorLocation, markedLocation);

      chai.assert.equal(this.inlineBlock2.outputConnection.targetBlock(), null);
      chai.assert.equal(this.inlineBlock1.outputConnection.targetBlock(), this.inlineBlock2);
    });
  });


  suite('Test cursor move on block delete', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        "type": "basic_block",
        "message0": "",
        "previousStatement": null,
        "nextStatement": null,
      }]);
      this.workspace = createNavigationWorkspace(true);
      this.basicBlockA = this.workspace.newBlock('basic_block');
      this.basicBlockB = this.workspace.newBlock('basic_block');
    });

    teardown(function() {
      delete Blockly.Blocks['basic_block'];
      this.workspace.dispose();
    });

    test('Delete block - has parent ', function() {
      this.basicBlockA.nextConnection.connect(this.basicBlockB.previousConnection);
      var astNode = Blockly.ASTNode.createBlockNode(this.basicBlockB);
      // Set the cursor to be on the child block
      this.workspace.getCursor().setCurNode(astNode);
      // Remove the child block
      this.basicBlockB.dispose();
      chai.assert.equal(this.workspace.getCursor().getCurNode().getType(),
          Blockly.ASTNode.types.NEXT);
    });

    test('Delete block - no parent ', function() {
      var astNode = Blockly.ASTNode.createBlockNode(this.basicBlockB);
      this.workspace.getCursor().setCurNode(astNode);
      this.basicBlockB.dispose();
      chai.assert.equal(this.workspace.getCursor().getCurNode().getType(),
          Blockly.ASTNode.types.WORKSPACE);
    });

    test('Delete parent block', function() {
      this.basicBlockA.nextConnection.connect(this.basicBlockB.previousConnection);
      var astNode = Blockly.ASTNode.createBlockNode(this.basicBlockB);
      // Set the cursor to be on the child block
      this.workspace.getCursor().setCurNode(astNode);
      // Remove the parent block
      this.basicBlockA.dispose();
      chai.assert.equal(this.workspace.getCursor().getCurNode().getType(),
          Blockly.ASTNode.types.WORKSPACE);
    });

    test('Delete top block in stack', function() {
      this.basicBlockA.nextConnection.connect(this.basicBlockB.previousConnection);
      var astNode = Blockly.ASTNode.createStackNode(this.basicBlockA);
      // Set the cursor to be on the stack
      this.workspace.getCursor().setCurNode(astNode);
      // Remove the top block in the stack
      this.basicBlockA.dispose();
      chai.assert.equal(this.workspace.getCursor().getCurNode().getType(),
          Blockly.ASTNode.types.WORKSPACE);
    });
  });
});
