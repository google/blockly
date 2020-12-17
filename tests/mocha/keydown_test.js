/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Key Down', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = Blockly.inject('blocklyDiv', {});
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });

  /**
   * Creates a block and sets it as Blockly.selected.
   * @param {Blockly.Workspace} workspace The workspace to create a new block on.
   */
  function setSelectedBlock(workspace) {
    defineStackBlock(this.sharedCleanup);
    Blockly.selected = workspace.newBlock('stack_block');
  }

  /**
   * Creates a test for not running keyDown events when the workspace is in read only mode.
   * @param {Object} keyEvent Mocked key down event. Use createKeyDownEvent.
   * @param {string=} opt_name An optional name for the test case.
   */
  function runReadOnlyTest(keyEvent, opt_name) {
    var name = opt_name ? opt_name : 'Not called when readOnly is true';
    test(name, function() {
      this.workspace.options.readOnly = true;
      Blockly.onKeyDown(keyEvent);
      sinon.assert.notCalled(this.hideChaffSpy);
    });
  }

  suite('Escape', function() {
    setup(function() {
      this.event = createKeyDownEvent(Blockly.utils.KeyCodes.ESC, 'NotAField');
      this.hideChaffSpy = sinon.spy(Blockly, 'hideChaff');
    });
    test('Simple', function() {
      Blockly.onKeyDown(this.event);
      sinon.assert.calledOnce(this.hideChaffSpy);
    });
    runReadOnlyTest(createKeyDownEvent(Blockly.utils.KeyCodes.ESC, 'NotAField'));
    test('Not called when focus is on an HTML input', function() {
      var event = createKeyDownEvent(this.event, 'textarea');
      Blockly.onKeyDown(event);
      sinon.assert.notCalled(this.hideChaffSpy);
    });
    test('Not called on hidden workspaces', function() {
      this.workspace.isVisible_ = false;
      Blockly.onKeyDown(this.event);
      sinon.assert.notCalled(this.hideChaffSpy);
    });
  });

  suite('Delete Block', function() {
    setup(function() {
      this.hideChaffSpy = sinon.spy(Blockly, 'hideChaff');
      setSelectedBlock(this.workspace);
      this.deleteSpy = sinon.spy(Blockly.selected, 'dispose');
    });
    var testCases = [
      ['Delete', createKeyDownEvent(Blockly.utils.KeyCodes.DELETE, 'NotAField')],
      ['Backspace', createKeyDownEvent(Blockly.utils.KeyCodes.BACKSPACE, 'NotAField')]
    ];
    // Delete a block.
    suite('Simple', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        test(testCaseName, function() {
          Blockly.onKeyDown(keyEvent);
          sinon.assert.calledOnce(this.hideChaffSpy);
          sinon.assert.calledOnce(this.deleteSpy);
        });
      });
    });
    // Do not delete a block if workspace is in readOnly mode.
    suite('Not called when readOnly is true', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        runReadOnlyTest(keyEvent, testCaseName);
      });
    });
  });

  suite('Copy', function() {
    setup(function() {
      setSelectedBlock(this.workspace);
      this.copySpy = sinon.spy(Blockly, 'copy');
      this.hideChaffSpy = sinon.spy(Blockly, 'hideChaff');
    });
    var testCases = [
      ['Control C', createKeyDownEvent(Blockly.utils.KeyCodes.C, 'NotAField', [Blockly.utils.KeyCodes.CTRL])],
      ['Meta C', createKeyDownEvent(Blockly.utils.KeyCodes.C, 'NotAField', [Blockly.utils.KeyCodes.META])],
      ['Alt C', createKeyDownEvent(Blockly.utils.KeyCodes.C, 'NotAField', [Blockly.utils.KeyCodes.ALT])]
    ];
    // Copy a block.
    suite('Simple', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        test(testCaseName, function() {
          Blockly.onKeyDown(keyEvent);
          sinon.assert.calledOnce(this.copySpy);
          sinon.assert.calledOnce(this.hideChaffSpy);
        });
      });
    });
    // Do not copy a block if a workspace is in readonly mode.
    suite('Not called when readOnly is true', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        runReadOnlyTest(keyEvent, testCaseName);
      });
    });
    // Do not copy a block if a gesture is in progress.
    suite('Gesture in progress', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        test(testCaseName, function() {
          sinon.stub(Blockly.Gesture, 'inProgress').returns(true);
          Blockly.onKeyDown(keyEvent);
          sinon.assert.notCalled(this.copySpy);
          sinon.assert.notCalled(this.hideChaffSpy);
        });
      });
    });
    // Do not copy a block if is is not deletable.
    suite('Block is not deletable', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        test(testCaseName, function() {
          sinon.stub(Blockly.selected, 'isDeletable').returns(false);
          Blockly.onKeyDown(keyEvent);
          sinon.assert.notCalled(this.copySpy);
          sinon.assert.notCalled(this.hideChaffSpy);
        });
      });
    });
    // Do not copy a block if it is not movable.
    suite('Block is not movable', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        test(testCaseName, function() {
          sinon.stub(Blockly.selected, 'isMovable').returns(false);
          Blockly.onKeyDown(keyEvent);
          sinon.assert.notCalled(this.copySpy);
          sinon.assert.notCalled(this.hideChaffSpy);
        });
      });
    });
  });

  suite('Undo', function() {
    setup(function() {
      this.undoSpy = sinon.spy(this.workspace, 'undo');
      this.hideChaffSpy = sinon.spy(Blockly, 'hideChaff');
    });
    var testCases = [
      ['Control Z', createKeyDownEvent(Blockly.utils.KeyCodes.Z, 'NotAField', [Blockly.utils.KeyCodes.CTRL])],
      ['Meta Z', createKeyDownEvent(Blockly.utils.KeyCodes.Z, 'NotAField', [Blockly.utils.KeyCodes.META])],
      ['Alt Z', createKeyDownEvent(Blockly.utils.KeyCodes.Z, 'NotAField', [Blockly.utils.KeyCodes.ALT])]
    ];
    // Undo.
    suite('Simple', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        test(testCaseName, function() {
          Blockly.onKeyDown(keyEvent);
          sinon.assert.calledOnce(this.undoSpy);
          sinon.assert.calledWith(this.undoSpy, false);
          sinon.assert.calledOnce(this.hideChaffSpy);
        });
      });
    });
    // Do not undo if a gesture is in progress.
    suite('Gesture in progress', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        test(testCaseName, function() {
          sinon.stub(Blockly.Gesture, 'inProgress').returns(true);
          Blockly.onKeyDown(keyEvent);
          sinon.assert.notCalled(this.undoSpy);
          sinon.assert.notCalled(this.hideChaffSpy);
        });
      });
    });
    // Do not undo if the workspace is in readOnly mode.
    suite('Not called when readOnly is true', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        runReadOnlyTest(keyEvent, testCaseName);
      });
    });
  });

  suite('Redo', function() {
    setup(function() {
      this.redoSpy = sinon.spy(this.workspace, 'undo');
      this.hideChaffSpy = sinon.spy(Blockly, 'hideChaff');
    });
    var testCases = [
      ['Control Shift Z', createKeyDownEvent(Blockly.utils.KeyCodes.Z, 'NotAField', [Blockly.utils.KeyCodes.CTRL, Blockly.utils.KeyCodes.SHIFT])],
      ['Meta Shift Z', createKeyDownEvent(Blockly.utils.KeyCodes.Z, 'NotAField', [Blockly.utils.KeyCodes.META, Blockly.utils.KeyCodes.SHIFT])],
      ['Alt Shift Z', createKeyDownEvent(Blockly.utils.KeyCodes.Z, 'NotAField', [Blockly.utils.KeyCodes.ALT, Blockly.utils.KeyCodes.SHIFT])]
    ];
    // Undo.
    suite('Simple', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        test(testCaseName, function() {
          Blockly.onKeyDown(keyEvent);
          sinon.assert.calledOnce(this.redoSpy);
          sinon.assert.calledWith(this.redoSpy, true);
          sinon.assert.calledOnce(this.hideChaffSpy);
        });
      });
    });
    // Do not undo if a gesture is in progress.
    suite('Gesture in progress', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        test(testCaseName, function() {
          sinon.stub(Blockly.Gesture, 'inProgress').returns(true);
          Blockly.onKeyDown(keyEvent);
          sinon.assert.notCalled(this.redoSpy);
          sinon.assert.notCalled(this.hideChaffSpy);
        });
      });
    });
    // Do not undo if the workspace is in readOnly mode.
    suite('Not called when readOnly is true', function() {
      testCases.forEach(function(testCase) {
        var testCaseName = testCase[0];
        var keyEvent = testCase[1];
        runReadOnlyTest(keyEvent, testCaseName);
      });
    });
  });

  suite('UndoWindows', function() {
    setup(function() {
      this.ctrlYEvent = createKeyDownEvent(Blockly.utils.KeyCodes.Y, 'NotAField', [Blockly.utils.KeyCodes.CTRL]);
      this.undoSpy = sinon.spy(this.workspace, 'undo');
      this.hideChaffSpy = sinon.spy(Blockly, 'hideChaff');
    });
    test('Simple', function() {
      Blockly.onKeyDown(this.ctrlYEvent);
      sinon.assert.calledOnce(this.undoSpy);
      sinon.assert.calledWith(this.undoSpy, true);
      sinon.assert.calledOnce(this.hideChaffSpy);
    });
    test('Not called when a gesture is in progress', function() {
      sinon.stub(Blockly.Gesture, 'inProgress').returns(true);
      Blockly.onKeyDown(this.ctrlYEvent);
      sinon.assert.notCalled(this.undoSpy);
      sinon.assert.notCalled(this.hideChaffSpy);
    });
    runReadOnlyTest(createKeyDownEvent(Blockly.utils.KeyCodes.Y, 'NotAField', [Blockly.utils.KeyCodes.CTRL]));
  });
});
