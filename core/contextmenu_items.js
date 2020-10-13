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

goog.require('Blockly.constants');

goog.requireType('Blockly.BlockSvg');

/** Option to undo previous action. */
Blockly.ContextMenuItems.registerUndo = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var undoOption = {
    displayText: function() {
      return Blockly.Msg['UNDO'];
    },
    preconditionFn: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      if (scope.workspace.getUndoStack().length > 0) {
        return 'enabled';
      }
      return 'disabled';
    },
    callback: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      scope.workspace.undo(false);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'undoWorkspace',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(undoOption);
};

/** Option to redo previous action. */
Blockly.ContextMenuItems.registerRedo = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var redoOption = {
    displayText: function() { return Blockly.Msg['REDO']; },
    preconditionFn: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      if (scope.workspace.getRedoStack().length > 0) {
        return 'enabled';
      }
      return 'disabled';
    },
    callback: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      scope.workspace.undo(true);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'redoWorkspace',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(redoOption);
};
    
/** Option to clean up blocks. */
Blockly.ContextMenuItems.registerCleanup = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var cleanOption = {
    displayText: function() {
      return Blockly.Msg['CLEAN_UP'];
    },
    preconditionFn: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      if (scope.workspace.isMovable()) {
        if (scope.workspace.getTopBlocks(false).length > 1) {
          return 'enabled';
        }
        return 'disabled';
      }
      return 'hidden';
    },
    callback: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      scope.workspace.cleanUp();
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'cleanWorkspace',
    weight: 0,
  };
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
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var collapseOption = {
    displayText:  function() {
      return Blockly.Msg['COLLAPSE_ALL'];
    },
    preconditionFn:  function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
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
    },
    callback:  function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      Blockly.ContextMenuItems.toggleOption_(true, scope.workspace.getTopBlocks(true));
    },
    scopeType:  Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id:  'collapseWorkspace',
    weight:  0,
  };
  Blockly.ContextMenuRegistry.registry.register(collapseOption);
};
  
/** Option to expand all blocks. */
Blockly.ContextMenuItems.registerExpand = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var expandOption = {
    displayText: function() {
      return Blockly.Msg['EXPAND_ALL'];
    },
    preconditionFn: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
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
    },
    callback: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      Blockly.ContextMenuItems.toggleOption_(false, scope.workspace.getTopBlocks(true));
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'expandWorkspace',
    weight: 0,
  };
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
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var deleteOption = {
    displayText: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      if (!scope.workspace) {
        return;
      }
      var deletableBlocksLength =
          Blockly.ContextMenuItems.getDeletableBlocks_(scope.workspace).length;
      if (deletableBlocksLength == 1) {
        return Blockly.Msg['DELETE_BLOCK'];
      } else {
        return Blockly.Msg['DELETE_X_BLOCKS'].replace('%1', String(deletableBlocksLength));
      }
    },
    preconditionFn: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      if (!scope.workspace) {
        return;
      }
      var deletableBlocksLength =
         Blockly.ContextMenuItems.getDeletableBlocks_(scope.workspace).length;
      return deletableBlocksLength > 0 ? 'enabled' : 'disabled';
    },
    callback: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      if (!scope.workspace) {
        return;
      }
      scope.workspace.cancelCurrentGesture();
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
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'workspaceDelete',
    weight: 0,
  };
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

/** Option to duplicate a block. */
Blockly.ContextMenuItems.registerDuplicate = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var duplicateOption = {
    displayText: function() {
      return Blockly.Msg['DUPLICATE_BLOCK'];
    },
    preconditionFn: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      var block = scope.block;
      if (!block.isInFlyout && block.isDeletable() && block.isMovable()) {
        if (block.isDuplicatable()) {
          return 'enabled';
        }
        return 'disabled';
      }
      return 'hidden';
    },
    callback: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      if (scope.block) {
        Blockly.duplicate(scope.block);
      }
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDuplicate',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(duplicateOption);
};

/** Option to add or remove block-level comment. */
Blockly.ContextMenuItems.registerComment = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var commentOption = {
    displayText: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      if (scope.block.getCommentIcon()) {
        // If there's already a comment,  option is to remove.
        return Blockly.Msg['REMOVE_COMMENT'];
      }
      // If there's no comment yet, option is to add.
      return Blockly.Msg['ADD_COMMENT'];
    },
    preconditionFn: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      var block = scope.block;
      // IE doesn't support necessary features for comment editing.
      if (!Blockly.utils.userAgent.IE && !block.isInFlyout && block.workspace.options.comments &&
        !block.isCollapsed() && block.isEditable()) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      var block = scope.block;
      if (block.getCommentIcon()) {
        block.setCommentText(null);
      } else {
        block.setCommentText('');
      }
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockComment',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(commentOption);
};

/** Option to inline variables. */
Blockly.ContextMenuItems.registerInline = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var inlineOption = {
    displayText: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      return (scope.block.getInputsInline()) ?
          Blockly.Msg['EXTERNAL_INPUTS'] : Blockly.Msg['INLINE_INPUTS'];
    },
    preconditionFn: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      var block = scope.block;
      if (!block.isInFlyout && block.isMovable() && !block.isCollapsed()) {
        for (var i = 1; i < block.inputList.length; i++) {
          // Only display this option if there are two value or dummy inputs next to each other.
          if (block.inputList[i - 1].type != Blockly.NEXT_STATEMENT &&
              block.inputList[i].type != Blockly.NEXT_STATEMENT) {
            return 'enabled';
          }
        }
      }
      return 'hidden';
    },
    callback: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      scope.block.setInputsInline(!scope.block.getInputsInline());
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockInline',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(inlineOption);
};

/** Option to collapse or expand a block. */
Blockly.ContextMenuItems.registerCollapseExpandBlock = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var collapseExpandOption = {
    displayText: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      if (scope.block.isCollapsed()) {
        return Blockly.Msg['EXPAND_BLOCK'];
      }
      return Blockly.Msg['COLLAPSE_BLOCK'];
    },
    preconditionFn: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      var block = scope.block;
      if (!block.isInFlyout && block.isMovable()) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      scope.block.setCollapsed(!scope.block.isCollapsed());
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockCollapseExpand',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(collapseExpandOption);
};

/** Option to disable or enable a block. */
Blockly.ContextMenuItems.registerDisable = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var disableOption = {
    displayText: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      return (scope.block.isEnabled()) ?
          Blockly.Msg['DISABLE_BLOCK'] : Blockly.Msg['ENABLE_BLOCK'];
    },
    preconditionFn: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      var block = scope.block;
      if (!block.isInFlyout && block.workspace.options.disable && block.isEditable()) {
        if (block.getInheritedDisabled()) {
          return 'disabled';
        }
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      var block = scope.block;
      var group = Blockly.Events.getGroup();
      if (!group) {
        Blockly.Events.setGroup(true);
      }
      block.setEnabled(!block.isEnabled());
      if (!group) {
        Blockly.Events.setGroup(false);
      }
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDisable',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(disableOption);
};

/** Option to delete a block. */
Blockly.ContextMenuItems.registerDelete = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var deleteOption = {
    displayText: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      var block = scope.block;
      // Count the number of blocks that are nested in this block.
      var descendantCount = block.getDescendants(false).length;
      var nextBlock = block.getNextBlock();
      if (nextBlock) {
        // Blocks in the current stack would survive this block's deletion.
        descendantCount -= nextBlock.getDescendants(false).length;
      }
      return (descendantCount == 1) ? Blockly.Msg['DELETE_BLOCK'] :
          Blockly.Msg['DELETE_X_BLOCKS'].replace('%1', String(descendantCount));
    },
    preconditionFn: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      if (!scope.block.isInFlyout && scope.block.isDeletable()) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      Blockly.Events.setGroup(true);
      scope.block.dispose(true, true);
      Blockly.Events.setGroup(false);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDelete',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(deleteOption);
};

/** Option to open help for a block. */
Blockly.ContextMenuItems.registerHelp = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  var helpOption = {
    displayText: function() {
      return Blockly.Msg['HELP'];
    },
    preconditionFn: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      var block = scope.block;
      var url = (typeof block.helpUrl == 'function') ?
          block.helpUrl() : block.helpUrl;
      if (url) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function(/** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      scope.block.showHelp();
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockHelp',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(helpOption);
};

/**
 * Registers all block-scoped context menu items.
 * @private
 */
Blockly.ContextMenuItems.registerBlockOptions_ = function() {
  Blockly.ContextMenuItems.registerDuplicate();
  Blockly.ContextMenuItems.registerComment();
  Blockly.ContextMenuItems.registerInline();
  Blockly.ContextMenuItems.registerCollapseExpandBlock();
  Blockly.ContextMenuItems.registerDisable();
  Blockly.ContextMenuItems.registerDelete();
  Blockly.ContextMenuItems.registerHelp();
};

/**
 * Registers all default context menu items. This should be called once per instance of
 * ContextMenuRegistry.
 * @package
 */
Blockly.ContextMenuItems.registerDefaultOptions = function() {
  Blockly.ContextMenuItems.registerWorkspaceOptions_();
  Blockly.ContextMenuItems.registerBlockOptions_();
};
  
