/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.icon');

import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';
import {defineEmptyBlock} from './test_helpers/block_definitions.js';

suite.only('Icon', function() {
  setup(function() {
    this.clock = sharedTestSetup.call(this, {fireEventsNow: false}).clock;
    defineEmptyBlock();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('hooks getting properly triggered by the block', function() {
    class MockIcon {
      initView() {}

      applyColour() {}

      updateEditable() {}

      updateCollapsed() {}
    }

    function createHeadlessWorkspace() {
      return new Blockly.Workspace();
    }

    function createWorkspaceSvg() {
      const workspace = new Blockly.WorkspaceSvg(new Blockly.Options({}));
      workspace.createDom();
      return workspace;
    }

    function createUninitializedBlock(workspace) {
      return workspace.newBlock('empty_block');
    }

    function createInitializedBlock(workspace) {
      const block = workspace.newBlock('empty_block');
      block.initSvg();
      block.render();
      return block;
    }

    suite('triggering view initialization', function() {
      test('initView is not called by headless blocks', function() {
        const workspace = createHeadlessWorkspace();
        const block = createUninitializedBlock(workspace);
        const icon = new MockIcon();
        const initViewSpy = sinon.spy(icon, 'initView');

        block.addIcon(icon);

        chai.assert.isFalse(
            initViewSpy.called, 'Expected initView to not be called');
      });

      test('initView is called by headful blocks during initSvg', function() {
        const workspace = createWorkspaceSvg();
        const block = createUninitializedBlock(workspace);
        const icon = new MockIcon();
        const initViewSpy = sinon.spy(icon, 'initView');

        block.addIcon(icon);
        chai.assert.isFalse(
            initViewSpy.called,
            'Expected initView to not be called before initing svg');
        block.initSvg();
        chai.assert.isTrue(
            initViewSpy.calledOnce, 'Expected initView to be called');
      });

      test(
          'initView is called by headful blocks that are currently ' +
          'rendered when the icon is added',
          function() {
            const workspace = new Blockly.WorkspaceSvg(new Blockly.Options({}));
            workspace.createDom();
            const block = createInitializedBlock(workspace);
            const icon = new MockIcon();
            const initViewSpy = sinon.spy(icon, 'initView');
    
            block.addIcon(icon);
            chai.assert.isTrue(
                initViewSpy.calledOnce, 'Expected initView to be called');
          });
    });

    suite('triggering applying colors', function() {
      test('applyColour is not called by headless blocks', function() {
        const workspace = createHeadlessWorkspace();
        const block = createUninitializedBlock(workspace);
        const icon = new MockIcon();
        const applyColourSpy = sinon.spy(icon, 'applyColour');

        block.addIcon(icon);

        chai.assert.isFalse(
            applyColourSpy.called, 'Expected applyColour to not be called');
      });

      test('applyColour is called by headful blocks during initSvg', function() {
        const workspace = createWorkspaceSvg();
        const block = createUninitializedBlock(workspace);
        const icon = new MockIcon();
        const applyColourSpy = sinon.spy(icon, 'applyColour');

        block.addIcon(icon);
        chai.assert.isFalse(
            applyColourSpy.called,
            'Expected applyCOlour to not be called before initing svg');
        block.initSvg();
        chai.assert.isTrue(
            applyColourSpy.calledOnce, 'Expected applyColour to be called');
      });

      test(
          'applyColour is called by headful blocks that are currently ' +
          'rendered when the icon is added',
          function() {
            const workspace = createWorkspaceSvg();
            const block = createInitializedBlock(workspace);
            const icon = new MockIcon();
            const applyColourSpy = sinon.spy(icon, 'applyColour');
    
            block.addIcon(icon);
            chai.assert.isTrue(
                applyColourSpy.calledOnce, 'Expected applyColour to be called');
          });

      test("applyColour is called when the block's color changes", function() {
        const workspace = createWorkspaceSvg();
        const block = createInitializedBlock(workspace);
        const icon = new MockIcon();
        const applyColourSpy = sinon.spy(icon, 'applyColour');

        block.addIcon(icon);
        applyColourSpy.resetHistory();
        block.setColour('#cccccc');
        chai.assert.isTrue(
            applyColourSpy.calledOnce, 'Expected applyColour to be called');
      });

      test("applyColour is called when the block's style changes", function() {
        const workspace = createWorkspaceSvg();
        const block = createInitializedBlock(workspace);
        const icon = new MockIcon();
        const applyColourSpy = sinon.spy(icon, 'applyColour');

        block.addIcon(icon);
        applyColourSpy.resetHistory();
        block.setStyle('logic_block');
        chai.assert.isTrue(
            applyColourSpy.calledOnce, 'Expected applyColour to be called');
      });

      test('applyColour is called when the block is disabled', function() {
        const workspace = createWorkspaceSvg();
        const block = createInitializedBlock(workspace);
        const icon = new MockIcon();
        const applyColourSpy = sinon.spy(icon, 'applyColour');

        block.addIcon(icon);
        applyColourSpy.resetHistory();
        block.setDisabled(true);
        chai.assert.isTrue(
            applyColourSpy.calledOnce, 'Expected applyColour to be called');
      });

      test('applyColour is called when the block becomes a shadow', function() {
        const workspace = createWorkspaceSvg();
        const block = createInitializedBlock(workspace);
        const icon = new MockIcon();
        const applyColourSpy = sinon.spy(icon, 'applyColour');

        block.addIcon(icon);
        applyColourSpy.resetHistory();
        block.setShadow(true);
        chai.assert.isTrue(
            applyColourSpy.calledOnce, 'Expected applyColour to be called');
      });
    });

    suite('triggering updating editability', function() {
      test('updateEditable is not called by headless blocks', function() {
        const workspace = createHeadlessWorkspace();
        const block = createUninitializedBlock(workspace);
        const icon = new MockIcon();
        const updateEditableSpy = sinon.spy(icon, 'updateEditable');

        block.addIcon(icon);

        chai.assert.isFalse(
            updateEditableSpy.called,
            'Expected updateEditable to not be called');
      });

      test('updateEditable is called by headful blocks during initSvg',
          function() {
            const workspace = createWorkspaceSvg();
            const block = createUninitializedBlock(workspace);
            const icon = new MockIcon();
            const updateEditableSpy = sinon.spy(icon, 'updateEditable');
    
            block.addIcon(icon);
            chai.assert.isFalse(
                updateEditableSpy.called,
                'Expected updateEditable to not be called before initing svg');
            block.initSvg();
            chai.assert.isTrue(
                updateEditableSpy.calledOnce, 'Expected updateEditable to be called');
          });

      test(
          'updateEditable is called by headful blocks that are currently ' +
          'rendered when the icon is added',
          function() {
            const workspace = createWorkspaceSvg();
            const block = createInitializedBlock(workspace);
            const icon = new MockIcon();
            const updateEditableSpy = sinon.spy(icon, 'updateEditable');
    
            block.addIcon(icon);
            chai.assert.isTrue(
                updateEditableSpy.calledOnce,
                'Expected updateEditable to be called');
          });

      test(
          'updateEditable is called when the block is made ineditable',
          function() {
            const workspace = createWorkspaceSvg();
            const block = createInitializedBlock(workspace);
            const icon = new MockIcon();
            const updateEditableSpy = sinon.spy(icon, 'updateEditable');
    
            block.addIcon(icon);
            updateEditableSpy.resetHistory();
            block.setEditable(false);
            chai.assert.isTrue(
                updateEditableSpy.calledOnce, 'Expected updateEditable to be called');
          });

      test(
          'updateEditable is called when the block is made editable',
          function() {
            const workspace = createWorkspaceSvg();
            const block = createInitializedBlock(workspace);
            const icon = new MockIcon();
            const updateEditableSpy = sinon.spy(icon, 'updateEditable');
    
            block.addIcon(icon);
            block.setEditable(false);
            updateEditableSpy.resetHistory();
            block.setEditable(true);
            chai.assert.isTrue(
                updateEditableSpy.calledOnce, 'Expected updateEditable to be called');
          });
    });

    suite('triggering updating collapsed-ness', function() {
      test('updateCollapsed is not called by headless blocks', function() {
        const workspace = createHeadlessWorkspace();
        const block = createUninitializedBlock(workspace);
        const icon = new MockIcon();
        const updateCollapsedSpy = sinon.spy(icon, 'updateCollapsed');

        block.addIcon(icon);
        block.setCollapsed(true);
        block.setCollapsed(false);

        chai.assert.isFalse(
            updateCollapsedSpy.called,
            'Expected updateCollapsed to not be called');
      });

      test('updateCollapsed is called when the block is collapsed', function() {
        const workspace = createWorkspaceSvg();
        const block = createInitializedBlock(workspace);
        const icon = new MockIcon();
        const updateCollapsedSpy = sinon.spy(icon, 'updateCollapsed');
        block.addIcon(icon);

        block.setCollapsed(true);

        chai.assert.isTrue(
            updateCollapsedSpy.calledOnce,
            'Expected updateCollapsed to be called');
      });

      test('updateCollapsed is called when the block is expanded', function() {
        const workspace = createWorkspaceSvg();
        const block = createInitializedBlock(workspace);
        const icon = new MockIcon();
        const updateCollapsedSpy = sinon.spy(icon, 'updateCollapsed');
        block.addIcon(icon);

        block.setCollapsed(true);
        block.setCollapsed(false);

        chai.assert.isTrue(
            updateCollapsedSpy.calledTwice,
            'Expected updateCollapsed to be called twice');
      });
    });
  });
});
