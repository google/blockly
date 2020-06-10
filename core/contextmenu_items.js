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

// Option to undo previous action.
var registerUndo = function() {
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

// Option to redo previous action.
var registerRedo = function() {
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
    
// Option to clean up blocks.
var registerCleanup = function() {
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
 * @param {!Array<?>} topBlocks Top blocks in the workspace.
 * @private
 */
var toggleOption = function(shouldCollapse, topBlocks) {
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

// Option to collapse all blocks.
var registerCollapse = function() {
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
    toggleOption(true, scope.workspace.getTopBlocks(true));
  };
  collapseOption.scopeType = Blockly.ContextMenuRegistry.ScopeType.WORKSPACE;
  collapseOption.id = 'collapseWorkspace';
  collapseOption.weight = 0;
  Blockly.ContextMenuRegistry.registry.register(collapseOption);
};
  
var registerExpand = function() {
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
    toggleOption(false, scope.workspace.getTopBlocks(true));
  };
  expandOption.scopeType = Blockly.ContextMenuRegistry.ScopeType.WORKSPACE;
  expandOption.id = 'toggleWorkspace';
  expandOption.weight = 0;
  Blockly.ContextMenuRegistry.registry.register(expandOption);
};
  
var addDeletableBlocks = function(block, deleteList) {
  if (block.isDeletable()) {
    deleteList = Array.prototype.push.apply(deleteList, block.getDescendants(false));
  } else {
    var children = block.getChildren(false);
    for (var i = 0; i < children.length; i++) {
      addDeletableBlocks(children[i], deleteList);
    }
  }
};
  
var getDeletableBlocks = function(workspace) {
  var deleteList = [];
  var topBlocks = workspace.getTopBlocks(true);
  for (var i = 0; i < topBlocks.length; i++) {
    addDeletableBlocks(topBlocks[i], deleteList);
  }
  return deleteList;
};
    
var deleteNext = function(deleteList, eventGroup) {
  var DELAY = 10;
  Blockly.Events.setGroup(eventGroup);
  var block = deleteList.shift();
  if (block) {
    if (block.workspace) {
      block.dispose(false, true);
      setTimeout(deleteNext, DELAY, deleteList, eventGroup);
    } else {
      deleteNext(deleteList, eventGroup);
    }
  }
  Blockly.Events.setGroup(false);
};
  
// Option to delete all blocks.
var registerDeleteAll = function() {
  var deleteOption = {};
  deleteOption.displayText = function(scope) {
    var deletableBlocksLength = getDeletableBlocks(scope.workspace).length;
    if (deletableBlocksLength == 1) {
      return Blockly.Msg['DELETE_BLOCK'];
    } else {
      return Blockly.Msg['DELETE_X_BLOCKS'].replace('%1', String(deletableBlocksLength));
    }
  };
  deleteOption.preconditionFn = function(scope) {
    var deletableBlocksLength = getDeletableBlocks(scope.workspace).length;
    return deletableBlocksLength > 0 ? 'enabled' : 'disabled';
  };
  deleteOption.callback = function(scope) {
    if (scope.workspace.currentGesture_) {
      scope.workspace.currentGesture_.cancel();
    }
    var deletableBlocks = getDeletableBlocks(scope.workspace);
    var eventGroup = Blockly.utils.genUid();
    if (deletableBlocks.length < 2) {
      deleteNext(deletableBlocks, eventGroup);
    } else {
      Blockly.confirm(
          Blockly.Msg['DELETE_ALL_BLOCKS'].replace('%1', deletableBlocks.length),
          function(ok) {
            if (ok) {
              deleteNext(deletableBlocks, eventGroup);
            }
          });
    }
  };
  deleteOption.scopeType = Blockly.ContextMenuRegistry.ScopeType.WORKSPACE;
  deleteOption.id = 'workspaceDelete';
  deleteOption.weight = 0;
  Blockly.ContextMenuRegistry.registry.register(deleteOption);
};


var registerWorkspaceOptions = function() {
  registerUndo();
  registerRedo();
  registerCleanup();
  registerCollapse();
  registerExpand();
  registerDeleteAll();
};

Blockly.ContextMenuItems.registerDefaultOptions = function() {
  registerWorkspaceOptions();
};
  
