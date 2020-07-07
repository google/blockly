/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Registers default context menu items.
 * @author maribethb@google.com (Maribeth Bottorff)
 */
'use strict';

/**
 * @name Blockly.ContextMenuItems
 * @namespace
 */
goog.provide('Blockly.ContextMenuItems');

goog.requireType('Blockly.BlockSvg');

/** Option to undo previous action. */
Blockly.ContextMenuItems.registerUndo = function() {
  var undoOption = {};
  undoOption.displayText = function() {
    return Blockly.Msg['UNDO'];
  };
  undoOption.preconditionFn = function(scope) {
    if (scope.workspace.undoStack_.length > 0) {
      return 'enabled';
    }
    return 'disabled';
  };
  undoOption.callback = function(scope) {
    scope.workspace.undo(false);
  };
  undoOption.scopeType = Blockly.ContextMenuRegistry.ScopeType.WORKSPACE;
  undoOption.id = 'undoWorkspace';
  undoOption.weight = 0;
  Blockly.ContextMenuRegistry.registry.register(undoOption);
};

/** Option to redo previous action. */
Blockly.ContextMenuItems.registerRedo = function() {
  var redoOption = {};
  redoOption.displayText = function() { return Blockly.Msg['REDO']; };
  redoOption.preconditionFn = function(scope) {
    if (scope.workspace.redoStack_.length > 0) {
      return 'enabled';
    }
    return 'disabled';
  };
  redoOption.callback = function(scope) {
    scope.workspace.undo(true);
  };
  redoOption.scopeType = Blockly.ContextMenuRegistry.ScopeType.WORKSPACE;
  redoOption.id = 'redoWorkspace';
  redoOption.weight = 0;
  Blockly.ContextMenuRegistry.registry.register(redoOption);
};
    
/** Option to clean up blocks. */
Blockly.ContextMenuItems.registerCleanup = function() {
  var cleanOption = {};
  cleanOption.displayText = function() {
    return Blockly.Msg['CLEAN_UP'];
  };
  cleanOption.preconditionFn = function(scope) {
    if (scope.workspace.isMovable()) {
      if (scope.workspace.getTopBlocks(false).length > 1) {
        return 'enabled';
      }
      return 'disabled';
    }
    return 'hidden';
  };
  cleanOption.callback = function(scope) {
    scope.workspace.cleanUp();
  };
  cleanOption.scopeType = Blockly.ContextMenuRegistry.ScopeType.WORKSPACE;
  cleanOption.id = 'cleanWorkspace';
  cleanOption.weight = 0;
  Blockly.ContextMenuRegistry.registry.register(cleanOption);
};
  
/**
 * Creates a callback to collapse or expand top blocks.
 * @param {boolean} shouldCollapse Whether a block should collapse.
 * @param {!Array<Blockly.BlockSvg>} topBlocks Top blocks in the workspace.
 * @private
 */
Blockly.ContextMenuItems.toggleOption_ = function(shouldCollapse, topBlocks) {
  var DELAY = 10;
  var ms = 0;
  for (var i = 0; i < topBlocks.length; i++) {
    var block = topBlocks[i];
    while (block) {
      setTimeout(block.setCollapsed.bind(block, shouldCollapse), ms);
      block = block.getNextBlock();
      ms += DELAY;
    }
  }
};

/** Option to collapse all blocks. */
Blockly.ContextMenuItems.registerCollapse = function() {
  var collapseOption = {};
  collapseOption.displayText = function() {
    return Blockly.Msg['COLLAPSE_ALL'];
  };
  collapseOption.preconditionFn = function(scope) {
    if (scope.workspace.options.collapse) {
      var topBlocks = scope.workspace.getTopBlocks(false);
      for (var i = 0; i < topBlocks.length; i++) {
        var block = topBlocks[i];
        while (block) {
          if (!block.isCollapsed()) {
            return 'enabled';
          }
          block = block.getNextBlock();
        }
      }
      return 'disabled';
    }
    return 'hidden';
  };
  collapseOption.callback = function(scope) {
    Blockly.ContextMenuItems.toggleOption_(true, scope.workspace.getTopBlocks(true));
  };
  collapseOption.scopeType = Blockly.ContextMenuRegistry.ScopeType.WORKSPACE;
  collapseOption.id = 'collapseWorkspace';
  collapseOption.weight = 0;
  Blockly.ContextMenuRegistry.registry.register(collapseOption);
};
  
/** Option to expand all blocks. */
Blockly.ContextMenuItems.registerExpand = function() {
  var expandOption = {};
  expandOption.displayText = function() {
    return Blockly.Msg['EXPAND_ALL'];
  };
  expandOption.preconditionFn = function(scope) {
    if (scope.workspace.options.collapse) {
      var topBlocks = scope.workspace.getTopBlocks(false);
      for (var i = 0; i < topBlocks.length; i++) {
        var block = topBlocks[i];
        while (block) {
          if (block.isCollapsed()) {
            return 'enabled';
          }
          block = block.getNextBlock();
        }
      }
      return 'disabled';
    }
    return 'hidden';
  };
  expandOption.callback = function(scope) {
    Blockly.ContextMenuItems.toggleOption_(false, scope.workspace.getTopBlocks(true));
  };
  expandOption.scopeType = Blockly.ContextMenuRegistry.ScopeType.WORKSPACE;
  expandOption.id = 'toggleWorkspace';
  expandOption.weight = 0;
  Blockly.ContextMenuRegistry.registry.register(expandOption);
};
  
/**
 * Adds a block and its children to a list of deletable blocks.
 * @param {!Blockly.BlockSvg} block to delete.
 * @param {!Array.<!Blockly.BlockSvg>} deleteList list of blocks that can be deleted. This will be
 *    modifed in place with the given block and its descendants.
 * @private
 */
Blockly.ContextMenuItems.addDeletableBlocks_ = function(block, deleteList) {
  if (block.isDeletable()) {
    Array.prototype.push.apply(deleteList, block.getDescendants(false));
  } else {
    var children = /** @type !Array.<!Blockly.BlockSvg> */ (block.getChildren(false));
    for (var i = 0; i < children.length; i++) {
      Blockly.ContextMenuItems.addDeletableBlocks_(children[i], deleteList);
    }
  }
};
  
/**
 * Constructs a list of blocks that can be deleted in the given workspace.
 * @param {!Blockly.WorkspaceSvg} workspace to delete all blocks from.
 * @return {!Array.<!Blockly.BlockSvg>} list of blocks to delete.
 * @private
 */
Blockly.ContextMenuItems.getDeletableBlocks_ = function(workspace) {
  var deleteList = [];
  var topBlocks = workspace.getTopBlocks(true);
  for (var i = 0; i < topBlocks.length; i++) {
    Blockly.ContextMenuItems.addDeletableBlocks_(topBlocks[i], deleteList);
  }
  return deleteList;
};
    
/** Deletes the given blocks. Used to delete all blocks in the workspace.
 * @param {!Array.<!Blockly.BlockSvg>} deleteList list of blocks to delete.
 * @param {string} eventGroup event group id with which all delete events should be associated.
 * @private
 */
Blockly.ContextMenuItems.deleteNext_ = function(deleteList, eventGroup) {
  var DELAY = 10;
  Blockly.Events.setGroup(eventGroup);
  var block = deleteList.shift();
  if (block) {
    if (block.workspace) {
      block.dispose(false, true);
      setTimeout(Blockly.ContextMenuItems.deleteNext_, DELAY, deleteList, eventGroup);
    } else {
      Blockly.ContextMenuItems.deleteNext_(deleteList, eventGroup);
    }
  }
  Blockly.Events.setGroup(false);
};
  
/** Option to delete all blocks. */
Blockly.ContextMenuItems.registerDeleteAll = function() {
  var deleteOption = {};
  deleteOption.displayText = function(scope) {
    var deletableBlocksLength =
        Blockly.ContextMenuItems.getDeletableBlocks_(scope.workspace).length;
    if (deletableBlocksLength == 1) {
      return Blockly.Msg['DELETE_BLOCK'];
    } else {
      return Blockly.Msg['DELETE_X_BLOCKS'].replace('%1', String(deletableBlocksLength));
    }
  };
  deleteOption.preconditionFn = function(scope) {
    var deletableBlocksLength =
        Blockly.ContextMenuItems.getDeletableBlocks_(scope.workspace).length;
    return deletableBlocksLength > 0 ? 'enabled' : 'disabled';
  };
  deleteOption.callback = function(scope) {
    if (scope.workspace.currentGesture_) {
      scope.workspace.currentGesture_.cancel();
    }
    var deletableBlocks = Blockly.ContextMenuItems.getDeletableBlocks_(scope.workspace);
    var eventGroup = Blockly.utils.genUid();
    if (deletableBlocks.length < 2) {
      Blockly.ContextMenuItems.deleteNext_(deletableBlocks, eventGroup);
    } else {
      Blockly.confirm(
          Blockly.Msg['DELETE_ALL_BLOCKS'].replace('%1', deletableBlocks.length),
          function(ok) {
            if (ok) {
              Blockly.ContextMenuItems.deleteNext_(deletableBlocks, eventGroup);
            }
          });
    }
  };
  deleteOption.scopeType = Blockly.ContextMenuRegistry.ScopeType.WORKSPACE;
  deleteOption.id = 'workspaceDelete';
  deleteOption.weight = 0;
  Blockly.ContextMenuRegistry.registry.register(deleteOption);
};

/**
 * Registers all workspace-scoped context menu items.
 * @private
 */
Blockly.ContextMenuItems.registerWorkspaceOptions_ = function() {
  Blockly.ContextMenuItems.registerUndo();
  Blockly.ContextMenuItems.registerRedo();
  Blockly.ContextMenuItems.registerCleanup();
  Blockly.ContextMenuItems.registerCollapse();
  Blockly.ContextMenuItems.registerExpand();
  Blockly.ContextMenuItems.registerDeleteAll();
};

/**
 * Registers all default context menu items. This should be called once per instance of
 * ContextMenuRegistry.
 * @package
 */
Blockly.ContextMenuItems.registerDefaultOptions = function() {
  Blockly.ContextMenuItems.registerWorkspaceOptions_();
};
  
