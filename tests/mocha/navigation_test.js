/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Navigation tests.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';


suite('Navigation', function() {
  function createNavigationWorkspace(enableKeyboardNav, readOnly) {
    var toolbox = document.getElementById('toolbox-categories');
    var workspace =
        Blockly.inject('blocklyDiv', {toolbox: toolbox, readOnly: readOnly});
    if (enableKeyboardNav) {
      Blockly.navigation.enableKeyboardAccessibility();
      Blockly.navigation.currentState_ = Blockly.navigation.STATE_WS;
    }
    return workspace;
  }

  setup(function() {
    sharedTestSetup.call(this);
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });

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
      Blockly.navigation.focusToolbox_(this.workspace);
    });

    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });

    var testCases = [
      [
        'Calls toolbox selectNext_',
        createKeyDownEvent(Blockly.utils.KeyCodes.S, 'NotAField'), 'selectNext_'
      ],
      [
        'Calls toolbox selectPrevious_',
        createKeyDownEvent(Blockly.utils.KeyCodes.W, 'NotAField'),
        'selectPrevious_'
      ],
      [
        'Calls toolbox selectParent_',
        createKeyDownEvent(Blockly.utils.KeyCodes.D, 'NotAField'),
        'selectChild_'
      ],
      [
        'Calls toolbox selectChild_',
        createKeyDownEvent(Blockly.utils.KeyCodes.A, 'NotAField'),
        'selectParent_'
      ]
    ];

    testCases.forEach(function(testCase) {
      var testCaseName = testCase[0];
      var mockEvent = testCase[1];
      var stubName = testCase[2];
      test(testCaseName, function() {
        var toolbox = this.workspace.getToolbox();
        var selectStub = sinon.stub(toolbox, stubName);
        toolbox.selectedItem_ = toolbox.contents_[0];
        Blockly.onKeyDown(mockEvent);
        sinon.assert.called(selectStub);
      });
    });

    test('Go to flyout', function() {
      var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.D, 'NotAField');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_FLYOUT);

      var flyoutCursor = Blockly.navigation.getFlyoutCursor_();
      chai.assert.equal(flyoutCursor.getCurNode().getLocation().getFieldValue("TEXT"),
          "FirstCategory-FirstBlock");
    });

    test('Focuses workspace from toolbox (e)', function() {
      Blockly.navigation.currentState_ = Blockly.navigation.STATE_TOOLBOX;
      var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.E, 'NotAField');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_WS);
    });
    test('Focuses workspace from toolbox (escape)', function() {
      Blockly.navigation.currentState_ = Blockly.navigation.STATE_TOOLBOX;
      var mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.ESC, 'NotAField');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_WS);
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
      Blockly.navigation.focusToolbox_(this.workspace);
      Blockly.navigation.focusFlyout_(this.workspace);
    });

    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });

    // Should be a no-op
    test('Previous at beginning', function() {
      var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.W, 'NotAField');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_FLYOUT);
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
      var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.W, 'NotAField');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_FLYOUT);
      flyoutBlock = Blockly.navigation.getFlyoutCursor_().getCurNode().getLocation();
      chai.assert.equal(flyoutBlock.getFieldValue("TEXT"),
          "FirstCategory-FirstBlock");
    });

    test('Next', function() {
      var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.S, 'NotAField');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_FLYOUT);
      var flyoutBlock = Blockly.navigation.getFlyoutCursor_().getCurNode().getLocation();
      chai.assert.equal(flyoutBlock.getFieldValue("TEXT"),
          "FirstCategory-SecondBlock");
    });

    test('Out', function() {
      var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.A, 'NotAField');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_TOOLBOX);
    });

    test('Mark', function() {
      var mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.ENTER, 'NotAField');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_WS);
      chai.assert.equal(this.workspace.getTopBlocks().length, 1);
    });

    test('Exit', function() {
      var mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.ESC, 'NotAField');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_WS);
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
    });

    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });

    test('Previous', function() {
      var prevSpy = sinon.spy(this.workspace.getCursor(), 'prev');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      var wEvent = createKeyDownEvent(Blockly.utils.KeyCodes.W, '');

      Blockly.onKeyDown(wEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(prevSpy);
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_WS);
    });

    test('Next', function() {
      var nextSpy = sinon.spy(this.workspace.getCursor(), 'next');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      var sEvent = createKeyDownEvent(Blockly.utils.KeyCodes.S, '');

      Blockly.onKeyDown(sEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(nextSpy);
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_WS);
    });

    test('Out', function() {
      var outSpy = sinon.spy(this.workspace.getCursor(), 'out');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      var aEvent = createKeyDownEvent(Blockly.utils.KeyCodes.A, '');

      Blockly.onKeyDown(aEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(outSpy);
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_WS);
    });

    test('In', function() {
      var inSpy = sinon.spy(this.workspace.getCursor(), 'in');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      var dEvent = createKeyDownEvent(Blockly.utils.KeyCodes.D, '');

      Blockly.onKeyDown(dEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(inSpy);
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_WS);
    });

    test('Insert', function() {
      // Stub modify as we are not testing its behavior, only if it was called.
      // Otherwise, there is a warning because there is no marked node.
      var modifyStub = sinon.stub(Blockly.navigation, 'modify_').returns(true);
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      var iEvent = createKeyDownEvent(Blockly.utils.KeyCodes.I, '');

      Blockly.onKeyDown(iEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(modifyStub);
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_WS);
    });

    test('Mark', function() {
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createConnectionNode(this.basicBlock.previousConnection));
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      var enterEvent = createKeyDownEvent(Blockly.utils.KeyCodes.ENTER, '');

      Blockly.onKeyDown(enterEvent);

      var markedNode = this.workspace.getMarker(Blockly.navigation.MARKER_NAME).getCurNode();
      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(markedNode.getLocation(), this.basicBlock.previousConnection);
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_WS);
    });

    test('Toolbox', function() {
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      var tEvent = createKeyDownEvent(Blockly.utils.KeyCodes.T, '');

      Blockly.onKeyDown(tEvent);

      var firstCategory = this.workspace.getToolbox().contents_[0];
      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          this.workspace.getToolbox().getSelectedItem(), firstCategory);
      chai.assert.equal(
          Blockly.navigation.currentState_, Blockly.navigation.STATE_TOOLBOX);
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
    });
    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });


    test('Action does not exist', function() {
      var block = this.workspace.getTopBlocks()[0];
      var field = block.inputList[0].fieldRow[0];
      var fieldSpy = sinon.spy(field, 'onBlocklyAction');
      var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.N, '');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      this.workspace.getCursor().setCurNode(Blockly.ASTNode.createFieldNode(field));

      Blockly.onKeyDown(mockEvent);

      chai.assert.isFalse(keyDownSpy.returned(true));
      sinon.assert.notCalled(fieldSpy);
    });

    test('Action exists - field handles action', function() {
      var block = this.workspace.getTopBlocks()[0];
      var field = block.inputList[0].fieldRow[0];
      var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.A, '');
      var fieldSpy = sinon.stub(field, 'onBlocklyAction').returns(true);
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      this.workspace.getCursor().setCurNode(Blockly.ASTNode.createFieldNode(field));

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(fieldSpy);

    });

    test('Action exists - field does not handle action', function() {
      var block = this.workspace.getTopBlocks()[0];
      var field = block.inputList[0].fieldRow[0];
      var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.A, '');
      var fieldSpy = sinon.spy(field, 'onBlocklyAction');
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      this.workspace.getCursor().setCurNode(Blockly.ASTNode.createFieldNode(field));

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(fieldSpy);
    });

    test('Toggle Action Off', function() {
      var mockEvent = createKeyDownEvent(
          Blockly.utils.KeyCodes.K, '',
          [Blockly.utils.KeyCodes.SHIFT, Blockly.utils.KeyCodes.CTRL]);
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      this.workspace.keyboardAccessibilityMode = true;

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.isFalse(this.workspace.keyboardAccessibilityMode);
    });

    test('Toggle Action On', function() {
      var mockEvent = createKeyDownEvent(
          Blockly.utils.KeyCodes.K, '',
          [Blockly.utils.KeyCodes.SHIFT, Blockly.utils.KeyCodes.CTRL]);
      var keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      this.workspace.keyboardAccessibilityMode = false;

      Blockly.onKeyDown(mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.isTrue(this.workspace.keyboardAccessibilityMode);
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
        this.workspace = createNavigationWorkspace(true, true);

        Blockly.mainWorkspace = this.workspace;
        this.workspace.getCursor().drawer_ = null;

        this.fieldBlock1 = this.workspace.newBlock('field_block');
      });

      teardown(function() {
        workspaceTeardown.call(this, this.workspace);
      });

      test('Perform valid action for read only', function() {
        var astNode = Blockly.ASTNode.createBlockNode(this.fieldBlock1);
        var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.S, '');
        this.workspace.getCursor().setCurNode(astNode);
        var keyDownSpy =
            sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

        Blockly.onKeyDown(mockEvent);

        chai.assert.isTrue(keyDownSpy.returned(true));
      });

      test('Perform invalid action for read only', function() {
        var astNode = Blockly.ASTNode.createBlockNode(this.fieldBlock1);
        var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.I, '');
        this.workspace.getCursor().setCurNode(astNode);
        var keyDownSpy =
            sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

        Blockly.onKeyDown(mockEvent);

        chai.assert.isTrue(keyDownSpy.returned(false));
      });

      test('Try to perform action on a field', function() {
        var field = this.fieldBlock1.inputList[0].fieldRow[0];
        var astNode = Blockly.ASTNode.createFieldNode(field);
        var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.ENTER, '');
        this.workspace.getCursor().setCurNode(astNode);
        var keyDownSpy =
            sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

        Blockly.onKeyDown(mockEvent);

        chai.assert.isTrue(keyDownSpy.returned(false));
      });
    });
  });

  suite('Insert Functions', function() {
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
        "nextStatement": null,
      }]);

      this.workspace = createNavigationWorkspace(true);

      var basicBlock = this.workspace.newBlock('basic_block');
      var basicBlock2 = this.workspace.newBlock('basic_block');

      this.basicBlock = basicBlock;
      this.basicBlock2 = basicBlock2;
    });

    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });

    test('Insert from flyout with a valid connection marked', function() {
      var previousConnection = this.basicBlock.previousConnection;
      var prevNode = Blockly.ASTNode.createConnectionNode(previousConnection);
      this.workspace.getMarker(Blockly.navigation.MARKER_NAME).setCurNode(prevNode);

      Blockly.navigation.focusToolbox_(this.workspace);
      Blockly.navigation.focusFlyout_(this.workspace);
      Blockly.navigation.insertFromFlyout(this.workspace);

      var insertedBlock = this.basicBlock.previousConnection.targetBlock();

      chai.assert.isTrue(insertedBlock !== null);
      chai.assert.equal(Blockly.navigation.currentState_,
          Blockly.navigation.STATE_WS);
    });

    test('Insert Block from flyout without marking a connection', function() {
      Blockly.navigation.focusToolbox_(this.workspace);
      Blockly.navigation.focusFlyout_(this.workspace);
      Blockly.navigation.insertFromFlyout(this.workspace);

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
      workspaceTeardown.call(this, this.workspace);
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
      chai.assert.isNull(this.basicBlock3.nextConnection.targetConnection);
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

      chai.assert.isNull(this.inlineBlock2.outputConnection.targetBlock());
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
      workspaceTeardown.call(this, this.workspace);
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
