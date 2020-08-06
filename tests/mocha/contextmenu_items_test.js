/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Context Menu Items', function() {
  setup(function() {
    sharedTestSetup.call(this);

    // Creates a WorkspaceSVG
    var toolbox = document.getElementById('toolbox-categories');
    this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});

    // Declare a new registry to ensure default options are called.
    new Blockly.ContextMenuRegistry();
    this.registry = Blockly.ContextMenuRegistry.registry;
  });
  
  teardown(function() {
    sharedTestTeardown.call(this);
  });
  
  suite('Workspace Items', function() {
    setup(function() {
      this.scope = {workspace: this.workspace};
    });

    suite('undo', function() {
      setup(function() {
        this.undoOption = this.registry.getItem('undoWorkspace');
      });

      test('Disabled when nothing to undo', function() {
        var precondition = this.undoOption.preconditionFn(this.scope);
        chai.assert.equal(precondition, 'disabled',
            'Should be disabled when there is nothing to undo');
      });

      test('Enabled when something to undo', function() {
        // Create a new block, which should be undoable.
        this.workspace.newBlock('text');
        var precondition = this.undoOption.preconditionFn(this.scope);
        chai.assert.equal(precondition, 'enabled',
            'Should be enabled when there are actions to undo');
      });

      test('Undoes adding a new block', function() {
        this.workspace.newBlock('text');
        chai.assert.equal(this.workspace.getTopBlocks(false).length, 1);
        this.undoOption.callback(this.scope);
        chai.assert.equal(this.workspace.getTopBlocks(false).length, 0,
            'Should be no blocks after undo');
      });

      test('Has correct label', function() {
        chai.assert.equal(this.undoOption.displayText(), 'Undo');
      });
    });

    suite('Redo', function() {
      setup(function() {
        this.redoOption = this.registry.getItem('redoWorkspace');
      });

      test('Disabled when nothing to redo', function() {
        // Create a new block. There should be something to undo, but not redo.
        this.workspace.newBlock('text');
        var precondition = this.redoOption.preconditionFn(this.scope);
        chai.assert.equal(precondition, 'disabled',
            'Should be disabled when there is nothing to redo');
      });

      test('Enabled when something to redo', function() {
        // Create a new block, then undo it, which means there is something to redo.
        this.workspace.newBlock('text');
        this.workspace.undo(false);
        var precondition = this.redoOption.preconditionFn(this.scope);
        chai.assert.equal(precondition, 'enabled',
            'Should be enabled when there are actions to redo');
      });

      test('Redoes adding new block', function() {
        // Add a new block, then undo it, then redo it.
        this.workspace.newBlock('text');
        this.workspace.undo(false);
        chai.assert.equal(this.workspace.getTopBlocks(false).length, 0);
        this.redoOption.callback(this.scope);
        chai.assert.equal(this.workspace.getTopBlocks(false).length, 1,
            'Should be 1 block after redo');
      });

      test('Has correct label', function() {
        chai.assert.equal(this.redoOption.displayText(), 'Redo');
      });
    });

    suite('Cleanup', function() {
      setup(function() {
        this.cleanupOption = this.registry.getItem('cleanWorkspace');
        this.cleanupStub = sinon.stub(this.workspace, 'cleanUp');
      });

      test('Enabled when multiple blocks', function() {
        this.workspace.newBlock('text');
        this.workspace.newBlock('text');
        chai.assert.equal(this.cleanupOption.preconditionFn(this.scope), 'enabled',
            'Should be enabled if there are multiple blocks');
      });

      test('Disabled when no blocks', function() {
        chai.assert.equal(this.cleanupOption.preconditionFn(this.scope), 'disabled',
            'Should be disabled if there are no blocks');
      });

      test('Hidden when not movable', function() {
        sinon.stub(this.workspace, 'isMovable').returns(false);
        chai.assert.equal(this.cleanupOption.preconditionFn(this.scope), 'hidden',
            'Should be hidden if the workspace is not movable');
      });

      test('Calls workspace cleanup', function() {
        this.cleanupOption.callback(this.scope);
        sinon.assert.calledOnce(this.cleanupStub);
      });

      test('Has correct label', function() {
        chai.assert.equal(this.cleanupOption.displayText(), 'Clean up Blocks');
      });
    });

    suite('Collapse', function() {
      setup(function() {
        this.collapseOption = this.registry.getItem('collapseWorkspace');
      });

      test('Enabled when uncollapsed blocks', function() {
        this.workspace.newBlock('text');
        var block2 = this.workspace.newBlock('text');
        block2.setCollapsed(true);
        chai.assert.equal(this.collapseOption.preconditionFn(this.scope), 'enabled',
            'Should be enabled when any blocks are expanded');
      });

      test('Disabled when all blocks collapsed', function() {
        this.workspace.newBlock('text').setCollapsed(true);
        chai.assert.equal(this.collapseOption.preconditionFn(this.scope), 'disabled',
            'Should be disabled when no blocks are expanded');
      });

      test('Hidden when no collapse option', function() {
        var workspaceWithOptions = new Blockly.Workspace(new Blockly.Options({collapse: false}));
        this.scope.workspace = workspaceWithOptions;

        try {
          chai.assert.equal(this.collapseOption.preconditionFn(this.scope), 'hidden',
              'Should be hidden if collapse is disabled in options');
        } finally {
          workspaceTeardown.call(this, workspaceWithOptions);
        }
      });

      test('Collapses all blocks', function() {
        // All blocks should be collapsed, even if some already were.
        var block1 = this.workspace.newBlock('text');
        var block2 = this.workspace.newBlock('text');
        // Need to render block to properly collapse it.
        block1.initSvg();
        block1.render();
        block1.setCollapsed(true);

        this.collapseOption.callback(this.scope);
        this.clock.runAll();

        chai.assert.isTrue(block1.isCollapsed(),
            'Previously collapsed block should still be collapsed');
        chai.assert.isTrue(block2.isCollapsed(),
            'Previously expanded block should now be collapsed');
      });

      test('Has correct label', function() {
        chai.assert.equal(this.collapseOption.displayText(), 'Collapse Blocks');
      });
    });

    suite('Expand', function() {
      setup(function() {
        this.expandOption = this.registry.getItem('expandWorkspace');
      });

      test('Enabled when collapsed blocks', function() {
        this.workspace.newBlock('text');
        var block2 = this.workspace.newBlock('text');
        block2.setCollapsed(true);

        chai.assert.equal(this.expandOption.preconditionFn(this.scope), 'enabled',
            'Should be enabled when any blocks are collapsed');
      });

      test('Disabled when no collapsed blocks', function() {
        this.workspace.newBlock('text');
        chai.assert.equal(this.expandOption.preconditionFn(this.scope), 'disabled',
            'Should be disabled when no blocks are collapsed');
      });

      test('Hidden when no collapse option', function() {
        var workspaceWithOptions = new Blockly.Workspace(new Blockly.Options({collapse: false}));
        this.scope.workspace = workspaceWithOptions;

        try {
          chai.assert.equal(this.expandOption.preconditionFn(this.scope), 'hidden',
              'Should be hidden if collapse is disabled in options');
        } finally {
          workspaceTeardown.call(this, workspaceWithOptions);
        }
      });

      test('Expands all blocks', function() {
        // All blocks should be expanded, even if some already were.
        var block1 = this.workspace.newBlock('text');
        var block2 = this.workspace.newBlock('text');
        // Need to render block to properly collapse it.
        block2.initSvg();
        block2.render();
        block2.setCollapsed(true);

        this.expandOption.callback(this.scope);
        this.clock.runAll();

        chai.assert.isFalse(block1.isCollapsed(),
            'Previously expanded block should still be expanded');
        chai.assert.isFalse(block2.isCollapsed(),
            'Previously collapsed block should now be expanded');
      });

      test('Has correct label', function() {
        chai.assert.equal(this.expandOption.displayText(), 'Expand Blocks');
      });
    });

    suite('Delete', function() {
      setup(function() {
        this.deleteOption = this.registry.getItem('workspaceDelete');
      });

      test('Enabled when blocks to delete', function() {
        this.workspace.newBlock('text');
        chai.assert.equal(this.deleteOption.preconditionFn(this.scope), 'enabled');
      });

      test('Disabled when no blocks to delete', function() {
        chai.assert.equal(this.deleteOption.preconditionFn(this.scope), 'disabled');
      });

      test('Deletes all blocks after confirming', function() {
        // Mocks the confirmation dialog and calls the callback with 'true' simulating ok.
        var confirmStub = sinon.stub(Blockly, 'confirm').callsArgWith(1, true);

        this.workspace.newBlock('text');
        this.workspace.newBlock('text');
        this.deleteOption.callback(this.scope);
        this.clock.runAll();
        sinon.assert.calledOnce(confirmStub);
        chai.assert.equal(this.workspace.getTopBlocks(false).length, 0);
      });

      test('Does not delete blocks if not confirmed', function() {
        // Mocks the confirmation dialog and calls the callback with 'false' simulating cancel.
        var confirmStub = sinon.stub(Blockly, 'confirm').callsArgWith(1, false);

        this.workspace.newBlock('text');
        this.workspace.newBlock('text');
        this.deleteOption.callback(this.scope);
        this.clock.runAll();
        sinon.assert.calledOnce(confirmStub);
        chai.assert.equal(this.workspace.getTopBlocks(false).length, 2);
      });

      test('No dialog for single block', function() {
        var confirmStub = sinon.stub(Blockly, 'confirm');
        this.workspace.newBlock('text');
        this.deleteOption.callback(this.scope);
        this.clock.runAll();

        sinon.assert.notCalled(confirmStub);
        chai.assert.equal(this.workspace.getTopBlocks(false).length, 0);
      });

      test('Has correct label for multiple blocks', function() {
        this.workspace.newBlock('text');
        this.workspace.newBlock('text');

        chai.assert.equal(this.deleteOption.displayText(this.scope), 'Delete 2 Blocks');
      });

      test('Has correct label for single block', function() {
        this.workspace.newBlock('text');
        chai.assert.equal(this.deleteOption.displayText(this.scope), 'Delete Block');
      });
    });
  });

  suite('Block Items', function() {
    setup(function() {
      this.block = this.workspace.newBlock('text');
      this.scope = {block: this.block};
    });

    suite('Duplicate', function() {
      setup(function() {
        this.duplicateOption = this.registry.getItem('blockDuplicate');
      });

      test('Enabled when block is duplicatable', function() {
        // Block is duplicatable by default
        chai.assert.equal(this.duplicateOption.preconditionFn(this.scope), 'enabled');
      });

      test('Disabled when block is not dupicatable', function() {
        sinon.stub(this.block, 'isDuplicatable').returns(false);
        chai.assert.equal(this.duplicateOption.preconditionFn(this.scope), 'disabled');
      });

      test('Hidden when in flyout', function() {
        this.block.isInFlyout = true;
        chai.assert.equal(this.duplicateOption.preconditionFn(this.scope), 'hidden');
      });

      test('Calls duplicate', function() {
        var stub = sinon.stub(Blockly, 'duplicate');

        this.duplicateOption.callback(this.scope);

        sinon.assert.calledOnce(stub);
        sinon.assert.calledWith(stub, this.block);
      });

      test('Has correct label', function() {
        chai.assert.equal(this.duplicateOption.displayText(), 'Duplicate');
      });
    });

    suite('Comment', function() {
      setup(function() {
        this.commentOption = this.registry.getItem('blockComment');
      });

      test('Enabled for normal block', function() {
        chai.assert.equal(this.commentOption.preconditionFn(this.scope), 'enabled');
      });

      test('Hidden for IE', function() {
        var oldState = Blockly.utils.userAgent.IE;
        try {
          Blockly.utils.userAgent.IE = true;
          chai.assert.equal(this.commentOption.preconditionFn(this.scope), 'hidden');
        } finally {
          Blockly.utils.userAgent.IE = oldState;
        }
      });

      test('Hidden for collapsed block', function() {
        // Must render block to collapse it properly.
        this.block.initSvg();
        this.block.render();
        this.block.setCollapsed(true);

        chai.assert.equal(this.commentOption.preconditionFn(this.scope), 'hidden');
      });

      test('Creates comment if one did not exist', function() {
        chai.assert.isNull(this.block.getCommentIcon(), 'New block should not have a comment');
        this.commentOption.callback(this.scope);
        chai.assert.exists(this.block.getCommentIcon());
        chai.assert.isEmpty(this.block.getCommentText(), 'Block should have empty comment text');
      });

      test('Removes comment if block had one', function() {
        this.block.setCommentText('Test comment');
        this.commentOption.callback(this.scope);
        chai.assert.isNull(this.block.getCommentText(),
            'Block should not have comment after removal');
      });

      test('Has correct label for add comment', function() {
        chai.assert.equal(this.commentOption.displayText(this.scope), 'Add Comment');
      });

      test('Has correct label for remove comment', function() {
        this.block.setCommentText('Test comment');
        chai.assert.equal(this.commentOption.displayText(this.scope), 'Remove Comment');
      });
    });

    suite('Inline Variables', function() {
      setup(function() {
        this.inlineOption = this.registry.getItem('blockInline');
      });

      test('Enabled when inputs to inline', function() {
        this.block.appendValueInput('test1');
        this.block.appendValueInput('test2');
        chai.assert.equal(this.inlineOption.preconditionFn(this.scope), 'enabled');
      });
    });
  });
});
