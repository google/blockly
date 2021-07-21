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
goog.module('Blockly.ContextMenuItems');
goog.module.declareLegacyNamespace();

goog.require('Blockly');
goog.require('Blockly.clipboard');
goog.require('Blockly.ContextMenuRegistry');
goog.require('Blockly.Events');
goog.require('Blockly.inputTypes');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
goog.require('Blockly.utils.userAgent');
goog.requireType('Blockly.WorkspaceSvg');
goog.requireType('Blockly.BlockSvg');


/** Option to undo previous action. */
const registerUndo = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const undoOption = {
    displayText: function () {
      return Blockly.Msg['UNDO'];
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      if (scope.workspace.getUndoStack().length > 0) {
        return 'enabled';
      }
      return 'disabled';
    },
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      scope.workspace.undo(false);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'undoWorkspace',
    weight: 1,
  };
  Blockly.ContextMenuRegistry.registry.register(undoOption);
};
exports.registerUndo = registerUndo;

/** Option to redo previous action. */
const registerRedo = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const redoOption = {
    displayText: function () {
      return Blockly.Msg['REDO'];
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      if (scope.workspace.getRedoStack().length > 0) {
        return 'enabled';
      }
      return 'disabled';
    },
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      scope.workspace.undo(true);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'redoWorkspace',
    weight: 2,
  };
  Blockly.ContextMenuRegistry.registry.register(redoOption);
};
exports.registerRedo = registerRedo;

/** Option to clean up blocks. */
const registerCleanup = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const cleanOption = {
    displayText: function () {
      return Blockly.Msg['CLEAN_UP'];
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      if (scope.workspace.isMovable()) {
        if (scope.workspace.getTopBlocks(false).length > 1) {
          return 'enabled';
        }
        return 'disabled';
      }
      return 'hidden';
    },
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      scope.workspace.cleanUp();
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'cleanWorkspace',
    weight: 3,
  };
  Blockly.ContextMenuRegistry.registry.register(cleanOption);
};
exports.registerCleanup = registerCleanup;

/**
 * Creates a callback to collapse or expand top blocks.
 * @param {boolean} shouldCollapse Whether a block should collapse.
 * @param {!Array<Blockly.BlockSvg>} topBlocks Top blocks in the workspace.
 * @private
 */
const toggleOption_ = function(shouldCollapse, topBlocks) {
  const DELAY = 10;
  let ms = 0;
  for (let i = 0; i < topBlocks.length; i++) {
    let block = topBlocks[i];
    while (block) {
      setTimeout(block.setCollapsed.bind(block, shouldCollapse), ms);
      block = block.getNextBlock();
      ms += DELAY;
    }
  }
};

/** Option to collapse all blocks. */
const registerCollapse = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const collapseOption = {
    displayText: function () {
      return Blockly.Msg['COLLAPSE_ALL'];
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      if (scope.workspace.options.collapse) {
        const topBlocks = scope.workspace.getTopBlocks(false);
        for (let i = 0; i < topBlocks.length; i++) {
          let block = topBlocks[i];
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
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      toggleOption_(true,
          scope.workspace.getTopBlocks(true));
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'collapseWorkspace',
    weight: 4,
  };
  Blockly.ContextMenuRegistry.registry.register(collapseOption);
};
exports.registerCollapse = registerCollapse;

/** Option to expand all blocks. */
const registerExpand = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const expandOption = {
    displayText: function () {
      return Blockly.Msg['EXPAND_ALL'];
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      if (scope.workspace.options.collapse) {
        const topBlocks = scope.workspace.getTopBlocks(false);
        for (let i = 0; i < topBlocks.length; i++) {
          let block = topBlocks[i];
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
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      toggleOption_(false,
          scope.workspace.getTopBlocks(true));
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'expandWorkspace',
    weight: 5,
  };
  Blockly.ContextMenuRegistry.registry.register(expandOption);
};
exports.registerExpand = registerExpand;

/**
 * Adds a block and its children to a list of deletable blocks.
 * @param {!Blockly.BlockSvg} block to delete.
 * @param {!Array<!Blockly.BlockSvg>} deleteList list of blocks that can be deleted. This will be
 *    modifed in place with the given block and its descendants.
 * @private
 */
const addDeletableBlocks_ = function(block, deleteList) {
  if (block.isDeletable()) {
    Array.prototype.push.apply(deleteList, block.getDescendants(false));
  } else {
    const children =  /* eslint-disable-next-line indent */
        /** @type {!Array<!Blockly.BlockSvg>} */ (block.getChildren(false));
    for (let i = 0; i < children.length; i++) {
      addDeletableBlocks_(children[i], deleteList);
    }
  }
};

/**
 * Constructs a list of blocks that can be deleted in the given workspace.
 * @param {!Blockly.WorkspaceSvg} workspace to delete all blocks from.
 * @return {!Array<!Blockly.BlockSvg>} list of blocks to delete.
 * @private
 */
const getDeletableBlocks_ = function(workspace) {
  const deleteList = [];
  const topBlocks = workspace.getTopBlocks(true);
  for (let i = 0; i < topBlocks.length; i++) {
    addDeletableBlocks_(topBlocks[i], deleteList);
  }
  return deleteList;
};

/** Deletes the given blocks. Used to delete all blocks in the workspace.
 * @param {!Array<!Blockly.BlockSvg>} deleteList list of blocks to delete.
 * @param {string} eventGroup event group ID with which all delete events should be associated.
 * @private
 */
const deleteNext_ = function(deleteList, eventGroup) {
  const DELAY = 10;
  Blockly.Events.setGroup(eventGroup);
  const block = deleteList.shift();
  if (block) {
    if (block.workspace) {
      block.dispose(false, true);
      setTimeout(deleteNext_, DELAY, deleteList, eventGroup);
    } else {
      deleteNext_(deleteList, eventGroup);
    }
  }
  Blockly.Events.setGroup(false);
};

/** Option to delete all blocks. */
const registerDeleteAll = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const deleteOption = {
    displayText: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      if (!scope.workspace) {
        return;
      }
      const deletableBlocksLength =
          getDeletableBlocks_(scope.workspace).length;
      if (deletableBlocksLength == 1) {
        return Blockly.Msg['DELETE_BLOCK'];
      } else {
        return Blockly.Msg['DELETE_X_BLOCKS'].replace('%1',
            String(deletableBlocksLength));
      }
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      if (!scope.workspace) {
        return;
      }
      const deletableBlocksLength =
          getDeletableBlocks_(scope.workspace).length;
      return deletableBlocksLength > 0 ? 'enabled' : 'disabled';
    },
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      if (!scope.workspace) {
        return;
      }
      scope.workspace.cancelCurrentGesture();
      const deletableBlocks = getDeletableBlocks_(
          scope.workspace);
      const eventGroup = Blockly.utils.genUid();
      if (deletableBlocks.length < 2) {
        deleteNext_(deletableBlocks, eventGroup);
      } else {
        Blockly.confirm(
            Blockly.Msg['DELETE_ALL_BLOCKS'].replace('%1',
                deletableBlocks.length),
            function (ok) {
              if (ok) {
                deleteNext_(deletableBlocks,
                    eventGroup);
              }
            });
      }
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'workspaceDelete',
    weight: 6,
  };
  Blockly.ContextMenuRegistry.registry.register(deleteOption);
};
exports.registerDeleteAll = registerDeleteAll;

/**
 * Registers all workspace-scoped context menu items.
 * @private
 */
const registerWorkspaceOptions_ = function() {
  registerUndo();
  registerRedo();
  registerCleanup();
  registerCollapse();
  registerExpand();
  registerDeleteAll();
};

/** Option to duplicate a block. */
const registerDuplicate = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const duplicateOption = {
    displayText: function () {
      return Blockly.Msg['DUPLICATE_BLOCK'];
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      const block = scope.block;
      if (!block.isInFlyout && block.isDeletable() && block.isMovable()) {
        if (block.isDuplicatable()) {
          return 'enabled';
        }
        return 'disabled';
      }
      return 'hidden';
    },
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      if (scope.block) {
        Blockly.clipboard.duplicate(scope.block);
      }
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDuplicate',
    weight: 1,
  };
  Blockly.ContextMenuRegistry.registry.register(duplicateOption);
};
exports.registerDuplicate = registerDuplicate;

/** Option to add or remove block-level comment. */
const registerComment = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const commentOption = {
    displayText: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      if (scope.block.getCommentIcon()) {
        // If there's already a comment,  option is to remove.
        return Blockly.Msg['REMOVE_COMMENT'];
      }
      // If there's no comment yet, option is to add.
      return Blockly.Msg['ADD_COMMENT'];
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      const block = scope.block;
      // IE doesn't support necessary features for comment editing.
      if (!Blockly.utils.userAgent.IE && !block.isInFlyout
          && block.workspace.options.comments &&
          !block.isCollapsed() && block.isEditable()) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      const block = scope.block;
      if (block.getCommentIcon()) {
        block.setCommentText(null);
      } else {
        block.setCommentText('');
      }
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockComment',
    weight: 2,
  };
  Blockly.ContextMenuRegistry.registry.register(commentOption);
};
exports.registerComment = registerComment;

/** Option to inline variables. */
const registerInline = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const inlineOption = {
    displayText: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      return (scope.block.getInputsInline()) ?
          Blockly.Msg['EXTERNAL_INPUTS'] : Blockly.Msg['INLINE_INPUTS'];
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      const block = scope.block;
      if (!block.isInFlyout && block.isMovable() && !block.isCollapsed()) {
        for (let i = 1; i < block.inputList.length; i++) {
          // Only display this option if there are two value or dummy inputs next to each other.
          if (block.inputList[i - 1].type != Blockly.inputTypes.STATEMENT &&
              block.inputList[i].type != Blockly.inputTypes.STATEMENT) {
            return 'enabled';
          }
        }
      }
      return 'hidden';
    },
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      scope.block.setInputsInline(!scope.block.getInputsInline());
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockInline',
    weight: 3,
  };
  Blockly.ContextMenuRegistry.registry.register(inlineOption);
};
exports.registerInline = registerInline;

/** Option to collapse or expand a block. */
const registerCollapseExpandBlock = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const collapseExpandOption = {
    displayText: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      return scope.block.isCollapsed() ?
          Blockly.Msg['EXPAND_BLOCK'] : Blockly.Msg['COLLAPSE_BLOCK'];
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      const block = scope.block;
      if (!block.isInFlyout && block.isMovable()
          && block.workspace.options.collapse) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      scope.block.setCollapsed(!scope.block.isCollapsed());
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockCollapseExpand',
    weight: 4,
  };
  Blockly.ContextMenuRegistry.registry.register(collapseExpandOption);
};
exports.registerCollapseExpandBlock = registerCollapseExpandBlock;

/** Option to disable or enable a block. */
const registerDisable = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const disableOption = {
    displayText: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      return (scope.block.isEnabled()) ?
          Blockly.Msg['DISABLE_BLOCK'] : Blockly.Msg['ENABLE_BLOCK'];
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      const block = scope.block;
      if (!block.isInFlyout && block.workspace.options.disable
          && block.isEditable()) {
        if (block.getInheritedDisabled()) {
          return 'disabled';
        }
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      const block = scope.block;
      const group = Blockly.Events.getGroup();
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
    weight: 5,
  };
  Blockly.ContextMenuRegistry.registry.register(disableOption);
};
exports.registerDisable = registerDisable;

/** Option to delete a block. */
const registerDelete = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const deleteOption = {
    displayText: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      const block = scope.block;
      // Count the number of blocks that are nested in this block.
      let descendantCount = block.getDescendants(false).length;
      const nextBlock = block.getNextBlock();
      if (nextBlock) {
        // Blocks in the current stack would survive this block's deletion.
        descendantCount -= nextBlock.getDescendants(false).length;
      }
      return (descendantCount == 1) ? Blockly.Msg['DELETE_BLOCK'] :
          Blockly.Msg['DELETE_X_BLOCKS'].replace('%1', String(descendantCount));
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      if (!scope.block.isInFlyout && scope.block.isDeletable()) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      Blockly.Events.setGroup(true);
      if (scope.block) {
        Blockly.deleteBlock(scope.block);
      }
      Blockly.Events.setGroup(false);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDelete',
    weight: 6,
  };
  Blockly.ContextMenuRegistry.registry.register(deleteOption);
};
exports.registerDelete = registerDelete;

/** Option to open help for a block. */
const registerHelp = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const helpOption = {
    displayText: function () {
      return Blockly.Msg['HELP'];
    },
    preconditionFn: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      const block = scope.block;
      const url = (typeof block.helpUrl == 'function') ?
          block.helpUrl() : block.helpUrl;
      if (url) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function (/** @type {!Blockly.ContextMenuRegistry.Scope} */
        scope) {
      scope.block.showHelp();
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockHelp',
    weight: 7,
  };
  Blockly.ContextMenuRegistry.registry.register(helpOption);
};
exports.registerHelp = registerHelp;

/**
 * Registers all block-scoped context menu items.
 * @private
 */
const registerBlockOptions_ = function() {
  registerDuplicate();
  registerComment();
  registerInline();
  registerCollapseExpandBlock();
  registerDisable();
  registerDelete();
  registerHelp();
};

/**
 * Registers all default context menu items. This should be called once per instance of
 * ContextMenuRegistry.
 * @package
 */
const registerDefaultOptions = function() {
  registerWorkspaceOptions_();
  registerBlockOptions_();
};
exports.registerDefaultOptions = registerDefaultOptions;

registerDefaultOptions();
