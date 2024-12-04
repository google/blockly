/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from '../../build/src/core/blockly.js';
import {defineStackBlock} from './test_helpers/block_definitions.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';
import {createKeyDownEvent} from './test_helpers/user_input.js';

suite('Key Down', function () {
  setup(function () {
    sharedTestSetup.call(this);
    this.workspace = Blockly.inject('blocklyDiv', {});
    this.injectionDiv = this.workspace.getInjectionDiv();
  });
  teardown(function () {
    sharedTestTeardown.call(this);
  });

  /**
   * Creates a block and sets it as Blockly.selected.
   * @param {Blockly.Workspace} workspace The workspace to create a new block on.
   * @return {Blockly.Block} The block being selected.
   */
  function setSelectedBlock(workspace) {
    defineStackBlock();
    const block = workspace.newBlock('stack_block');
    Blockly.common.setSelected(block);
    return block;
  }

  /**
   * Creates a test for not running keyDown events when the workspace is in read only mode.
   * @param {Object} keyEvent Mocked key down event. Use createKeyDownEvent.
   * @param {string=} opt_name An optional name for the test case.
   */
  function runReadOnlyTest(keyEvent, opt_name) {
    const name = opt_name ? opt_name : 'Not called when readOnly is true';
    test(name, function () {
      this.workspace.options.readOnly = true;
      this.injectionDiv.dispatchEvent(keyEvent);
      sinon.assert.notCalled(this.hideChaffSpy);
    });
  }

  suite('Escape', function () {
    setup(function () {
      this.event = createKeyDownEvent(Blockly.utils.KeyCodes.ESC);
      this.hideChaffSpy = sinon.spy(
        Blockly.WorkspaceSvg.prototype,
        'hideChaff',
      );
    });
    test('Simple', function () {
      this.injectionDiv.dispatchEvent(this.event);
      sinon.assert.calledOnce(this.hideChaffSpy);
    });
    runReadOnlyTest(createKeyDownEvent(Blockly.utils.KeyCodes.ESC));
    test('Not called when focus is on an HTML input', function () {
      const event = createKeyDownEvent(Blockly.utils.KeyCodes.ESC);
      const input = document.createElement('textarea');
      input.dispatchEvent(event);
      sinon.assert.notCalled(this.hideChaffSpy);
    });
    test('Not called on hidden workspaces', function () {
      this.workspace.visible = false;
      this.injectionDiv.dispatchEvent(this.event);
      sinon.assert.notCalled(this.hideChaffSpy);
    });
  });

  suite('Delete Block', function () {
    setup(function () {
      this.hideChaffSpy = sinon.spy(
        Blockly.WorkspaceSvg.prototype,
        'hideChaff',
      );
      setSelectedBlock(this.workspace);
      this.deleteSpy = sinon.spy(Blockly.common.getSelected(), 'dispose');
    });
    const testCases = [
      ['Delete', createKeyDownEvent(Blockly.utils.KeyCodes.DELETE)],
      ['Backspace', createKeyDownEvent(Blockly.utils.KeyCodes.BACKSPACE)],
    ];
    // Delete a block.
    suite('Simple', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function () {
          this.injectionDiv.dispatchEvent(keyEvent);
          sinon.assert.calledOnce(this.hideChaffSpy);
          sinon.assert.calledOnce(this.deleteSpy);
        });
      });
    });
    // Do not delete a block if workspace is in readOnly mode.
    suite('Not called when readOnly is true', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        runReadOnlyTest(keyEvent, testCaseName);
      });
    });
  });

  suite('Copy', function () {
    setup(function () {
      this.block = setSelectedBlock(this.workspace);
      this.copySpy = sinon.spy(this.block, 'toCopyData');
      this.hideChaffSpy = sinon.spy(
        Blockly.WorkspaceSvg.prototype,
        'hideChaff',
      );
    });
    const testCases = [
      [
        'Control C',
        createKeyDownEvent(Blockly.utils.KeyCodes.C, [
          Blockly.utils.KeyCodes.CTRL,
        ]),
      ],
      [
        'Meta C',
        createKeyDownEvent(Blockly.utils.KeyCodes.C, [
          Blockly.utils.KeyCodes.META,
        ]),
      ],
      [
        'Alt C',
        createKeyDownEvent(Blockly.utils.KeyCodes.C, [
          Blockly.utils.KeyCodes.ALT,
        ]),
      ],
    ];
    // Copy a block.
    suite('Simple', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function () {
          this.injectionDiv.dispatchEvent(keyEvent);
          sinon.assert.calledOnce(this.copySpy);
          sinon.assert.calledOnce(this.hideChaffSpy);
        });
      });
    });
    // Do not copy a block if a workspace is in readonly mode.
    suite('Not called when readOnly is true', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        runReadOnlyTest(keyEvent, testCaseName);
      });
    });
    // Do not copy a block if a gesture is in progress.
    suite('Gesture in progress', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function () {
          sinon.stub(Blockly.Gesture, 'inProgress').returns(true);
          this.injectionDiv.dispatchEvent(keyEvent);
          sinon.assert.notCalled(this.copySpy);
          sinon.assert.notCalled(this.hideChaffSpy);
        });
      });
    });
    // Do not copy a block if is is not deletable.
    suite('Block is not deletable', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function () {
          sinon
            .stub(Blockly.common.getSelected(), 'isDeletable')
            .returns(false);
          this.injectionDiv.dispatchEvent(keyEvent);
          sinon.assert.notCalled(this.copySpy);
          sinon.assert.notCalled(this.hideChaffSpy);
        });
      });
    });
    // Do not copy a block if it is not movable.
    suite('Block is not movable', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function () {
          sinon.stub(Blockly.common.getSelected(), 'isMovable').returns(false);
          this.injectionDiv.dispatchEvent(keyEvent);
          sinon.assert.notCalled(this.copySpy);
          sinon.assert.notCalled(this.hideChaffSpy);
        });
      });
    });
  });

  suite('Undo', function () {
    setup(function () {
      this.undoSpy = sinon.spy(this.workspace, 'undo');
      this.hideChaffSpy = sinon.spy(
        Blockly.WorkspaceSvg.prototype,
        'hideChaff',
      );
    });
    const testCases = [
      [
        'Control Z',
        createKeyDownEvent(Blockly.utils.KeyCodes.Z, [
          Blockly.utils.KeyCodes.CTRL,
        ]),
      ],
      [
        'Meta Z',
        createKeyDownEvent(Blockly.utils.KeyCodes.Z, [
          Blockly.utils.KeyCodes.META,
        ]),
      ],
      [
        'Alt Z',
        createKeyDownEvent(Blockly.utils.KeyCodes.Z, [
          Blockly.utils.KeyCodes.ALT,
        ]),
      ],
    ];
    // Undo.
    suite('Simple', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function () {
          this.injectionDiv.dispatchEvent(keyEvent);
          sinon.assert.calledOnce(this.undoSpy);
          sinon.assert.calledWith(this.undoSpy, false);
          sinon.assert.calledOnce(this.hideChaffSpy);
        });
      });
    });
    // Do not undo if a gesture is in progress.
    suite('Gesture in progress', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function () {
          sinon.stub(Blockly.Gesture, 'inProgress').returns(true);
          this.injectionDiv.dispatchEvent(keyEvent);
          sinon.assert.notCalled(this.undoSpy);
          sinon.assert.notCalled(this.hideChaffSpy);
        });
      });
    });
    // Do not undo if the workspace is in readOnly mode.
    suite('Not called when readOnly is true', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        runReadOnlyTest(keyEvent, testCaseName);
      });
    });
  });

  suite('Redo', function () {
    setup(function () {
      this.redoSpy = sinon.spy(this.workspace, 'undo');
      this.hideChaffSpy = sinon.spy(
        Blockly.WorkspaceSvg.prototype,
        'hideChaff',
      );
    });
    const testCases = [
      [
        'Control Shift Z',
        createKeyDownEvent(Blockly.utils.KeyCodes.Z, [
          Blockly.utils.KeyCodes.CTRL,
          Blockly.utils.KeyCodes.SHIFT,
        ]),
      ],
      [
        'Meta Shift Z',
        createKeyDownEvent(Blockly.utils.KeyCodes.Z, [
          Blockly.utils.KeyCodes.META,
          Blockly.utils.KeyCodes.SHIFT,
        ]),
      ],
      [
        'Alt Shift Z',
        createKeyDownEvent(Blockly.utils.KeyCodes.Z, [
          Blockly.utils.KeyCodes.ALT,
          Blockly.utils.KeyCodes.SHIFT,
        ]),
      ],
    ];
    // Undo.
    suite('Simple', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function () {
          this.injectionDiv.dispatchEvent(keyEvent);
          sinon.assert.calledOnce(this.redoSpy);
          sinon.assert.calledWith(this.redoSpy, true);
          sinon.assert.calledOnce(this.hideChaffSpy);
        });
      });
    });
    // Do not undo if a gesture is in progress.
    suite('Gesture in progress', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function () {
          sinon.stub(Blockly.Gesture, 'inProgress').returns(true);
          this.injectionDiv.dispatchEvent(keyEvent);
          sinon.assert.notCalled(this.redoSpy);
          sinon.assert.notCalled(this.hideChaffSpy);
        });
      });
    });
    // Do not undo if the workspace is in readOnly mode.
    suite('Not called when readOnly is true', function () {
      testCases.forEach(function (testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        runReadOnlyTest(keyEvent, testCaseName);
      });
    });
  });

  suite('UndoWindows', function () {
    setup(function () {
      this.ctrlYEvent = createKeyDownEvent(Blockly.utils.KeyCodes.Y, [
        Blockly.utils.KeyCodes.CTRL,
      ]);
      this.undoSpy = sinon.spy(this.workspace, 'undo');
      this.hideChaffSpy = sinon.spy(
        Blockly.WorkspaceSvg.prototype,
        'hideChaff',
      );
    });
    test('Simple', function () {
      this.injectionDiv.dispatchEvent(this.ctrlYEvent);
      sinon.assert.calledOnce(this.undoSpy);
      sinon.assert.calledWith(this.undoSpy, true);
      sinon.assert.calledOnce(this.hideChaffSpy);
    });
    test('Not called when a gesture is in progress', function () {
      sinon.stub(Blockly.Gesture, 'inProgress').returns(true);
      this.injectionDiv.dispatchEvent(this.ctrlYEvent);
      sinon.assert.notCalled(this.undoSpy);
      sinon.assert.notCalled(this.hideChaffSpy);
    });
    runReadOnlyTest(
      createKeyDownEvent(Blockly.utils.KeyCodes.Y, [
        Blockly.utils.KeyCodes.CTRL,
      ]),
    );
  });
});
