/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Context Menu Items', function() {
  var workspace;
  var registry;

  setup(function() {
    // Creates a WorkspaceSVG
    var toolbox = document.getElementById('toolbox-categories');
    workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});

    // Declare a new registry to ensure default options are called.
    new Blockly.ContextMenuRegistry();
    registry = Blockly.ContextMenuRegistry.registry;

    sinon.stub(Blockly.Events, "setGroup").returns(null);
    sharedTestSetup.call(this);
  });
  
  teardown(function() {
    workspace.dispose();
    sinon.restore();
    sharedTestTeardown.call(this);
  });
  
  suite('Workspace Items', function() {
    var scope;
    setup(function() {
      scope = {workspace: workspace};
    });

    suite('undo', function() {
      var undoOption;

      setup(function() {
        undoOption = registry.getItem('undoWorkspace');
      });

      test('Disabled when nothing to undo', function() {
        var precondition = undoOption.preconditionFn(scope);
        chai.assert.equal(precondition, 'disabled',
            'Should be disabled when there is nothing to undo');
      });

      test('Enabled when something to undo', function() {
        // Create a new block, which should be undoable.
        workspace.newBlock('text');
        var precondition = undoOption.preconditionFn(scope);
        chai.assert.equal(precondition, 'enabled',
            'Should be enabled when there are actions to undo');
      });

      test('Undoes adding a new block', function() {
        workspace.newBlock('text');
        chai.assert.equal(workspace.getTopBlocks(false).length, 1);
        undoOption.callback(scope);
        chai.assert.equal(workspace.getTopBlocks(false).length, 0,
            'Should be no blocks after undo');
      });

      test('Has correct label', function() {
        chai.assert.equal(undoOption.displayText(), 'Undo');
      });

    });

    suite('Redo', function() {
      var redoOption;
        
      setup(function() {
        redoOption = registry.getItem('redoWorkspace');
      });

      test('Disabled when nothing to redo', function() {
        // Create a new block. There should be something to undo, but not redo.
        workspace.newBlock('text');
        var precondition = redoOption.preconditionFn(scope);
        chai.assert.equal(precondition, 'disabled',
            'Should be disabled when there is nothing to redo');
      });

      test('Enabled when something to redo', function() {
        // Create a new block, then undo it, which means there is something to redo.
        workspace.newBlock('text');
        workspace.undo(false);
        var precondition = redoOption.preconditionFn(scope);
        chai.assert.equal(precondition, 'enabled',
            'Should be enabled when there are actions to redo');
      });

      test('Redoes adding new block', function() {
        // Add a new block, then undo it, then redo it.
        workspace.newBlock('text');
        workspace.undo(false);
        chai.assert.equal(workspace.getTopBlocks(false).length, 0);
        redoOption.callback(scope);
        chai.assert.equal(workspace.getTopBlocks(false).length, 1,
            'Should be 1 block after redo');
      });

      test('Has correct label', function() {
        chai.assert.equal(redoOption.displayText(), 'Redo');
      });
    });

    suite('Cleanup', function() {
      var cleanupOption;
      var cleanupStub;

      setup(function() {
        cleanupOption = registry.getItem('cleanWorkspace');
        cleanupStub = sinon.stub(workspace, 'cleanUp');
      });

      teardown(function() {
        cleanupStub.restore();
      });

      test('Enabled when multiple blocks', function() {
        workspace.newBlock('text');
        workspace.newBlock('text');
        chai.assert.equal(cleanupOption.preconditionFn(scope), 'enabled',
            'Should be enabled if there are multiple blocks');
      });

      test('Disabled when no blocks', function() {
        chai.assert.equal(cleanupOption.preconditionFn(scope), 'disabled',
            'Should be disabled if there are no blocks');
      });

      test('Hidden when not movable', function() {
        sinon.stub(workspace, 'isMovable').returns(false);
        chai.assert.equal(cleanupOption.preconditionFn(scope), 'hidden',
            'Should be hidden if the workspace is not movable');
      });

      test('Calls workspace cleanup', function() {
        cleanupOption.callback(scope);
        sinon.assert.calledOnce(cleanupStub);
      });

      test('Has correct label', function() {
        chai.assert.equal(cleanupOption.displayText(), 'Clean up Blocks');
      });
    });

    suite('Collapse', function() {
      var collapseOption;

      setup(function() {
        collapseOption = registry.getItem('collapseWorkspace');
      });

      test('Enabled when uncollapsed blocks', function() {
        workspace.newBlock('text');
        var block2 = workspace.newBlock('text');
        block2.setCollapsed(true);
        chai.assert.equal(collapseOption.preconditionFn(scope), 'enabled',
            'Should be enabled when any blocks are expanded');
      });

      test('Disabled when all blocks collapsed', function() {
        workspace.newBlock('text').setCollapsed(true);
        chai.assert.equal(collapseOption.preconditionFn(scope), 'disabled',
            'Should be disabled when no blocks are expanded');
      });

      test('Hidden when no collapse option', function() {
        var workspaceWithOptions = new Blockly.Workspace(new Blockly.Options({collapse: false}));
        scope.workspace = workspaceWithOptions;

        chai.assert.equal(collapseOption.preconditionFn(scope), 'hidden',
            'Should be hidden if collapse is disabled in options');

        workspaceWithOptions.dispose();

      });

      test('Collapses all blocks', function() {
        // All blocks should be collapsed, even if some already were.
        var block1 = workspace.newBlock('text');
        var block2 = workspace.newBlock('text');
        // Need to render block to properly collapse it.
        block1.initSvg();
        block1.render();
        block1.setCollapsed(true);

        collapseOption.callback(scope);
        this.clock.runAll();

        chai.assert.isTrue(block1.isCollapsed(),
            'Previously collapsed block should still be collapsed');
        chai.assert.isTrue(block2.isCollapsed(),
            'Previously expanded block should now be collapsed');
      });

      test('Has correct label', function() {
        chai.assert.equal(collapseOption.displayText(), 'Collapse Blocks');
      });
    });

    suite('Expand', function() {
      var expandOption;
      setup(function() {
        expandOption = registry.getItem('expandWorkspace');
      });

      test('Enabled when collapsed blocks', function() {
        workspace.newBlock('text');
        var block2 = workspace.newBlock('text');
        block2.setCollapsed(true);

        chai.assert.equal(expandOption.preconditionFn(scope), 'enabled',
            'Should be enabled when any blocks are collapsed');
      });

      test('Disabled when no collapsed blocks', function() {
        workspace.newBlock('text');
        chai.assert.equal(expandOption.preconditionFn(scope), 'disabled',
            'Should be disabled when no blocks are collapsed');
      });

      test('Hidden when no collapse option', function() {
        var workspaceWithOptions = new Blockly.Workspace(new Blockly.Options({collapse: false}));
        scope.workspace = workspaceWithOptions;

        chai.assert.equal(expandOption.preconditionFn(scope), 'hidden',
            'Should be hidden if collapse is disabled in options');

        workspaceWithOptions.dispose();
      });

      test('Expands all blocks', function() {
        // All blocks should be expanded, even if some already were.
        var block1 = workspace.newBlock('text');
        var block2 = workspace.newBlock('text');
        // Need to render block to properly collapse it.
        block2.initSvg();
        block2.render();
        block2.setCollapsed(true);

        expandOption.callback(scope);
        this.clock.runAll();

        chai.assert.isFalse(block1.isCollapsed(),
            'Previously expanded block should still be expanded');
        chai.assert.isFalse(block2.isCollapsed(),
            'Previously collapsed block should now be expanded');
      });

      test('Has correct label', function() {
        chai.assert.equal(expandOption.displayText(), 'Expand Blocks');
      });
    });

    suite('Delete', function() {
      var deleteOption;
      setup(function() {
        deleteOption = registry.getItem('workspaceDelete');
      });

      test('Enabled when blocks to delete', function() {
        workspace.newBlock('text');
        chai.assert.equal(deleteOption.preconditionFn(scope), 'enabled');
      });

      test('Disabled when no blocks to delete', function() {
        chai.assert.equal(deleteOption.preconditionFn(scope), 'disabled');
      });

      test('Deletes all blocks after confirming', function() {
        // Mocks the confirmation dialog and calls the callback with 'true' simulating ok.
        sinon.stub(Blockly, 'confirm').callsArgWith(1, true);

        workspace.newBlock('text');
        workspace.newBlock('text');
        deleteOption.callback(scope);
        this.clock.runAll();
        chai.assert.equal(workspace.getTopBlocks(false).length, 0);
      });

      test('Does not delete blocks if not confirmed', function() {
        // Mocks the confirmation dialog and calls the callback with 'true' simulating ok.
        sinon.stub(Blockly, 'confirm').callsArgWith(1, false);

        workspace.newBlock('text');
        workspace.newBlock('text');
        deleteOption.callback(scope);
        this.clock.runAll();
        chai.assert.equal(workspace.getTopBlocks(false).length, 2);
      });

      test('No dialog for single block', function() {
        var confirmStub = sinon.stub(Blockly, 'confirm');
        workspace.newBlock('text');
        deleteOption.callback(scope);
        this.clock.runAll();

        sinon.assert.notCalled(confirmStub);
        chai.assert.equal(workspace.getTopBlocks(false).length, 0);
      });

      test('Has correct label for multiple blocks', function() {
        workspace.newBlock('text');
        workspace.newBlock('text');

        chai.assert.equal(deleteOption.displayText(scope), 'Delete 2 Blocks');
      });

      test('Has correct label for single block', function() {
        workspace.newBlock('text');
        chai.assert.equal(deleteOption.displayText(scope), 'Delete Block');
      });
    });
  });

  suite('Block Items', function() {
    var scope;
    var block;

    setup(function() {
      block = workspace.newBlock('text');
      scope = {block: block};
    });

    teardown(function() {
      block.dispose();
    });

    suite('Duplicate', function() {
      var duplicateOption;
      
      setup(function() {
        duplicateOption = registry.getItem('blockDuplicate');
      });

      test('Enabled when block is duplicatable', function() {
        // Block is duplicatable by default
        chai.assert.equal(duplicateOption.preconditionFn(scope), 'enabled');
      });

      test('Disabled when block is not dupicatable', function() {
        sinon.stub(block, 'isDuplicatable').returns(false);
        chai.assert.equal(duplicateOption.preconditionFn(scope), 'disabled');
      });

      test('Hidden when in flyout', function() {
        block.isInFlyout = true;
        chai.assert.equal(duplicateOption.preconditionFn(scope), 'hidden');
      });

      test('Calls duplicate', function() {
        var stub = sinon.stub(Blockly, 'duplicate');

        duplicateOption.callback(scope);

        sinon.assert.calledOnce(stub);
        sinon.assert.calledWith(stub, block);
      });

      test('Has correct label', function() {
        chai.assert.equal(duplicateOption.displayText(), 'Duplicate');
      });
    });

    suite('Comment', function() {
      var commentOption;

      setup(function() {
        commentOption = registry.getItem('blockComment');
      });

      test('Enabled for normal block', function() {
        chai.assert.equal(commentOption.preconditionFn(scope), 'enabled');
      });

      test('Hidden for IE', function() {
        Blockly.utils.userAgent.IE = true;
        chai.assert.equal(commentOption.preconditionFn(scope), 'hidden');
      });

      test('Hidden for collapsed block', function() {
        // Must render block to collapse it properly.
        block.initSvg();
        block.render();
        block.setCollapsed(true);

        chai.assert.equal(commentOption.preconditionFn(scope), 'hidden');
      });

      test('Creates comment if one did not exist', function() {
        chai.assert.isNull(block.getCommentIcon(), 'New block should not have a comment');
        commentOption.callback(scope);
        chai.assert.isEmpty(block.getCommentText(), 'Block should have empty comment text');
      });

      test('Removes comment if block had one', function() {
        block.setCommentText('Test comment');
        commentOption.callback(scope);
        chai.assert.isNull(block.getCommentText(), 'Block should not have comment after removal');
      });

      test('Has correct label for add comment', function() {
        chai.assert.equal(commentOption.displayText(scope), 'Add Comment');
      });

      test('Has correct label for remove comment', function() {
        block.setCommentText('Test comment');
        chai.assert.equal(commentOption.displayText(scope), 'Remove Comment');
      });
    });

    suite('Inline Variables', function() {
      var inlineOption;
      setup(function() {
        inlineOption = registry.getItem('blockInline');
      });

      test('Enabled when inputs to inline', function() {
        block.appendValueInput('test1');
        block.appendValueInput('test2');
        chai.assert.equal(inlineOption.preconditionFn(scope), 'enabled');
      });
    });
  });
});
