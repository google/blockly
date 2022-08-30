/**
 * @license
 * Copyright 2022 Varwin
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Mass operations handler for workspace
 */
'use strict';

/**
 * Mass operations handler for workspace
 * @class
 */
goog.module('Blockly.MassOperations.Handler');

const {ShortcutRegistry} = goog.require('Blockly.ShortcutRegistry');
const {KeyCodes} = goog.require('Blockly.utils.KeyCodes');
const {Msg} = goog.require('Blockly.Msg');
const {config} = goog.require('Blockly.config');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
const {ContextMenuRegistry} = goog.require('Blockly.ContextMenuRegistry');
const ContextMenu = goog.require('Blockly.ContextMenu');
const clipboard = goog.require('Blockly.clipboard');
const registry = goog.require('Blockly.registry');
const browserEvents = goog.require('Blockly.browserEvents');
const eventUtils = goog.require('Blockly.Events.utils');
const common = goog.require('Blockly.common');

/** @suppress {extraRequire} */
goog.require('Blockly.BlockDragger');

/**
 * Mass operations handler for workspace
 * @param {!WorkspaceSvg} workspace The block's workspace.
 * @constructor
 * @alias Blockly.MassOperations.Handler
 */
const MassOperationsHandler = function(workspace) {
  if (workspace.isFlyout) return;

  this.workspace_ = workspace;
  this.selectedBlocks_ = [];
  this.lastMouseDownBlock_ = null;
  this.mouseDownXY_ = null;
  this.initBlockStartCoordinates = null;
  this.onMoveBlockWrapper_ = null;
  this.onMouseUpBlockWrapper_ = null;
  this.blocksCopyData_ = null;
  this.currentDragDeltaXY_ = new Coordinate(0, 0);
  this.dragSurfacePadding_ = 50;

  workspace.addChangeListener(this.changeListener.bind(this));

  // Add "deleteAll" method to shortcut registry with ctrl+D key
  const deleteAllShortcut = {
    name: 'massOperationDelete',
    preconditionFn: (workspace) => {
      return !workspace.options.readOnly && !workspace.isFlyout && this.selectedBlocks_.length;
    },
    callback: (workspace, e) => {
      this.deleteAll();
      e.preventDefault();
      e.stopPropagation();
      return true;
    },
  };
  ShortcutRegistry.registry.register(deleteAllShortcut, true);

  ShortcutRegistry.registry.addKeyMapping(KeyCodes.DELETE, deleteAllShortcut.name, true);
  ShortcutRegistry.registry.addKeyMapping(KeyCodes.BACKSPACE, deleteAllShortcut.name, true);

  // Add "selectAll" method to shortcut registry with ctrl+A key
  const selectAllShortcut = {
    name: 'massOperationSelect',
    preconditionFn: (workspace) => {
      return !workspace.options.readOnly && !workspace.isFlyout;
    },
    callback: (workspace, e) => {
      this.selectAll();
      e.preventDefault();
      e.stopPropagation();
      return true;
    },
  };
  ShortcutRegistry.registry.register(selectAllShortcut, true);

  const ctrlA = ShortcutRegistry.registry.createSerializedKey(KeyCodes.A, [KeyCodes.CTRL]);
  ShortcutRegistry.registry.addKeyMapping(ctrlA, selectAllShortcut.name, true);

  // Add "copy" method to shortcut registry with ctrl+C key
  const copyShortcut = {
    name: 'massOperationCopy',
    preconditionFn: (workspace) => {
      return this.selectedBlocks_.length && !workspace.options.readOnly && !workspace.isFlyout;
    },
    callback: (workspace, e) => {
      const gesture = workspace.getGesture(e);
      if (gesture) gesture.dispose();

      // Clear default clipboard
      clipboard.clear();

      this.copySelected_();

      e.preventDefault();
      e.stopPropagation();
      return true;
    },
  };
  ShortcutRegistry.registry.register(copyShortcut, true);

  const ctrlC = ShortcutRegistry.registry.createSerializedKey(KeyCodes.C, [KeyCodes.CTRL]);
  ShortcutRegistry.registry.addKeyMapping(ctrlC, copyShortcut.name, true);

  // Add "pasteShortcut" method to shortcut registry with ctrl+V key
  const pasteShortcut = {
    name: 'massOperationPaste',
    preconditionFn: (workspace) => {
      return this.blocksCopyData_ && !workspace.options.readOnly && !workspace.isFlyout;
    },
    callback: (workspace, e) => {
      e.preventDefault();
      e.stopPropagation();

      this.pasteCopiedBlocks_();
      return true;
    },
  };
  ShortcutRegistry.registry.register(pasteShortcut, true);

  const ctrlV = ShortcutRegistry.registry.createSerializedKey(KeyCodes.V, [KeyCodes.CTRL]);
  ShortcutRegistry.registry.addKeyMapping(ctrlV, pasteShortcut.name, true);

  // Add "duplicateShortcut" method to shortcut registry with ctrl+D key
  const duplicateShortcut = {
    name: 'massOperationDuplicate',
    preconditionFn: (workspace) => {
      return this.selectedBlocks_.length && !workspace.options.readOnly && !workspace.isFlyout;
    },
    callback: (workspace, e) => {
      this.copySelected_();

      e.preventDefault();
      e.stopPropagation();

      this.pasteCopiedBlocks_();
      return true;
    },
  };
  ShortcutRegistry.registry.register(duplicateShortcut, true);

  const ctrlD = ShortcutRegistry.registry.createSerializedKey(KeyCodes.D, [KeyCodes.CTRL]);
  ShortcutRegistry.registry.addKeyMapping(ctrlD, duplicateShortcut.name, true);
};

/** Methods */

MassOperationsHandler.prototype.changeListener = function(event) {
  switch (event.type) {
    case eventUtils.MODULE_ACTIVATE: {
      if (this.moveBlocksToAnotherModule) {
        this.moveBlocksToAnotherModule = false;
      } else {
        this.cleanUp();
      }
    }
  }
};

MassOperationsHandler.prototype.selectedBlockMouseDown = function(block, e) {
  this.lastMouseDownBlock_ = block;
  this.mouseDownXY_ = new Coordinate(e.clientX, e.clientY);
  this.onMoveBlockWrapper_ = browserEvents.conditionalBind(document, 'mousemove', null, this.handleMove_.bind(this));
  this.onMouseUpBlockWrapper_ = browserEvents.conditionalBind(document, 'mouseup', null, this.handleUp_.bind(this));
};

MassOperationsHandler.prototype.handleMove_ = function(e) {
   if (!e.ctrlKey || !this.selectedBlocks_.length) {
    this.lastMouseDownBlock_ = null;
    browserEvents.unbind(this.onMoveBlockWrapper_);

    return;
  }

  const currentXY = new Coordinate(e.clientX, e.clientY);

  const initBlockCoordinates = this.lastMouseDownBlock_.getRelativeToSurfaceXY();
  this.currentDragDeltaXY_ = Coordinate.difference(currentXY, this.mouseDownXY_);

  if (this.blockDraggers_) {
    // We need use drag() only for one of draggers, because all sraggers use one drag_surface
    this.blockDraggers_[0].drag(e, this.currentDragDeltaXY_, this.initBlockStartCoordinates);
    return;
  }

  if (!this.hasExceededDragRadius_) {
    const currentDragDelta = Coordinate.magnitude(this.currentDragDeltaXY_);
    const limitRadius = config.dragRadius;
    this.hasExceededDragRadius_ = currentDragDelta > limitRadius;
  }

  if (!this.hasExceededDragRadius_) return;

  const BlockDraggerClass = registry.getClassFromOptions(registry.Type.BLOCK_DRAGGER, this.workspace_.options, true);
  this.blockDraggers_ = this.selectedBlocks_.map((block) => new BlockDraggerClass(block, this.workspace_, true));

  // coordinates of start dragging may be not on top left block and we need to find
  // top left angle for get right position of drag surface under all blocks
  const dragSurfaceMinCoordinate = initBlockCoordinates.clone();
  const dragSurfaceMaxCoordinate = initBlockCoordinates.clone();
  let blockSvgWithMaxX;
  let blockSvgWithMaxY;

  this.selectedBlocks_.forEach((block, index) => {
    const blockSvg = block.getSvgRoot();
    const coordinates = block.getRelativeToSurfaceXY();

    if (index === 0) {
      blockSvgWithMaxX = blockSvg;
      blockSvgWithMaxY = blockSvg;
    }

    if (dragSurfaceMinCoordinate.x > coordinates.x) {
      dragSurfaceMinCoordinate.x = coordinates.x;
    }

    if (dragSurfaceMaxCoordinate.x < coordinates.x) {
      dragSurfaceMaxCoordinate.x = coordinates.x;
      blockSvgWithMaxX = blockSvg;
    }

    if (dragSurfaceMinCoordinate.y > coordinates.y) {
      dragSurfaceMinCoordinate.y = coordinates.y;
    }

    if (dragSurfaceMaxCoordinate.y < coordinates.y) {
      dragSurfaceMaxCoordinate.y = coordinates.y;
      blockSvgWithMaxY = blockSvg;
    }
  });

  const workspaceCanvas = this.workspace_.getCanvas();
  const workspaceCanvasTransform = window.getComputedStyle(workspaceCanvas).transform;
  const workspaceCanvasMatrix = new WebKitCSSMatrix(workspaceCanvasTransform);

  dragSurfaceMinCoordinate.x += workspaceCanvasMatrix.e / this.workspace_.scale;
  dragSurfaceMinCoordinate.y += workspaceCanvasMatrix.f / this.workspace_.scale;
  dragSurfaceMaxCoordinate.x += workspaceCanvasMatrix.e / this.workspace_.scale;
  dragSurfaceMaxCoordinate.y += workspaceCanvasMatrix.f / this.workspace_.scale;

  dragSurfaceMinCoordinate.x -= this.dragSurfacePadding_;
  dragSurfaceMinCoordinate.y -= this.dragSurfacePadding_;
  dragSurfaceMaxCoordinate.x += this.dragSurfacePadding_;
  dragSurfaceMaxCoordinate.y += this.dragSurfacePadding_;

  // Now we can place all blocks to relative position on drag surface and keep positions between blocks
  this.blockDraggers_.forEach((dragger, index) => {
    const block = this.selectedBlocks_[index];
    const coordinates = block.getRelativeToSurfaceXY();

    let diff = Coordinate.difference(coordinates, dragSurfaceMinCoordinate);
    if (diff.x === 0 && diff.y === 0) diff = null;

    dragger.beforeStartDrag(this.currentDragDeltaXY_, false, diff);
    block.prepareForMoveToDragSurface(diff);
  });

  const dragSurfaceWidth = (dragSurfaceMaxCoordinate.x - dragSurfaceMinCoordinate.x) + blockSvgWithMaxX.getBBox().width;
  const dragSurfaceHeight = (dragSurfaceMaxCoordinate.y - dragSurfaceMinCoordinate.y) + blockSvgWithMaxY.getBBox().height;
  const dragSurface = this.workspace_.getBlockDragSurface();
  const blocksSvg = this.selectedBlocks_.map((b) => b.getSvgRoot());

  this.initBlockStartCoordinates = dragSurfaceMinCoordinate.clone();

  dragSurface.translateSurface(this.initBlockStartCoordinates.x, this.initBlockStartCoordinates.y, true);
  dragSurface.setBlocksAndShow(blocksSvg, dragSurfaceWidth, dragSurfaceHeight, true);

  this.blockDraggers_[0].drag(e, this.currentDragDeltaXY_, this.initBlockStartCoordinates);
};

MassOperationsHandler.prototype.blockMouseUp = function(block, e) {
  if (this.lastMouseDownBlock_ && this.lastMouseDownBlock_.id === block.id) {
    // Full "Click" event closed on the block -> add this block to selected
    this.addBlockToSelected(block);
  }

  this.lastMouseDownBlock_ = null;
  browserEvents.unbind(this.onMoveBlockWrapper_);
  this.onMoveBlockWrapper_ = null;

  if (this.blockDraggers_) {
    this.blockDraggers_.forEach((dragger) => dragger.endDrag(e, this.currentDragDeltaXY_));
    this.blockDraggers_ = null;
    this.currentDragDeltaXY_ = null;
  }

  if (this.onMouseUpBlockWrapper_) {
    browserEvents.unbind(this.onMouseUpBlockWrapper_);
    this.onMouseUpBlockWrapper_ = null;
  }
};

MassOperationsHandler.prototype.handleUp_ = function(e) {
  if (!browserEvents.isLeftButton(e)) return;

  if (this.blockDraggers_) {
    this.blockDraggers_.forEach((dragger) => dragger.endDrag(e, this.currentDragDeltaXY_));
    this.blockDraggers_ = null;
  }

  // Cleanup all data except for selected blocks
  this.cleanUpLastMouseDownData_();
  this.cleanUpEventWrappers_();
  this.currentDragDeltaXY_ = null;
  this.initBlockStartCoordinates = null;
};

MassOperationsHandler.prototype.addBlockToSelected = function(block) {
  if (!this.workspace_) return;

  const selected = common.getSelected();
  if (selected) selected.unselect();

  if (this.selectedBlocks_.find((b) => b.id === block.id)) return;

  if (block.isShadow() && block.getParent()) {
    this.addBlockToSelected(block.getParent());
    return;
  }

  if (!block.getParent()) {
    this.selectedBlocks_.forEach((b, i) => {
      const root = this.getRootBlock_(b);

      if (root.id === block.id) {
        this.selectedBlocks_.splice(i, 1);
        b.removeSelectAsMassSelection();
      }
    });

    this.selectedBlocks_.push(block);
    block.addSelectAsMassSelection();
    return;
  }

  const rootBlock = this.getRootBlock_(block);
  const blockWithSameRootParentIndex = this.selectedBlocks_.findIndex((b) => this.getRootBlock_(b).id === rootBlock.id);
  const blockWithSameRootParent = this.selectedBlocks_[blockWithSameRootParentIndex];

  if (blockWithSameRootParent) {
    if (blockWithSameRootParent.id === rootBlock.id) return;

    const parentOfSameBlock = blockWithSameRootParent.getParent();

    if (parentOfSameBlock.id === block.id) {
      this.selectedBlocks_.push(block);
      block.addSelectAsMassSelection();

      this.selectedBlocks_.splice(blockWithSameRootParentIndex, 1);
      blockWithSameRootParent.removeSelectAsMassSelection();
      return;
    }

    const isBlockOnTop = this.findParentBlock_(blockWithSameRootParent, block.id);

    if (isBlockOnTop) {
      this.selectedBlocks_.push(block);
      block.addSelectAsMassSelection();

      this.selectedBlocks_.splice(blockWithSameRootParentIndex, 1);
      blockWithSameRootParent.removeSelectAsMassSelection();
      return;
    }

    const sameBlockOnTop = this.findParentBlock_(block, blockWithSameRootParent.id);

    if (sameBlockOnTop) return;

    const commonParent = this.findCommonParentBlock_(block, blockWithSameRootParent);

    if (commonParent) {
      this.selectedBlocks_.push(commonParent);
      commonParent.addSelectAsMassSelection();

      this.selectedBlocks_.splice(blockWithSameRootParentIndex, 1);
      blockWithSameRootParent.removeSelectAsMassSelection();
      return;
    }
  } else {
    this.selectedBlocks_.push(block);
    block.addSelectAsMassSelection();
  }
};

/**
 * Simple finding block in selected list
 * */
MassOperationsHandler.prototype.isBlockInSelectedGroup = function(block) {
  return !!this.selectedBlocks_.find((b) => b.id === block.id);
};

/**
 * Recursive finding locale root block (last parent in chain)
 * @private
 * */
MassOperationsHandler.prototype.getRootBlock_ = function(block) {
  const parent = block.getParent();

  return parent ? this.getRootBlock_(parent) : block;
};

/**
 * Recursive search for the parent block by id.
 * This is necessary to check that a block is a deep child of another block.
 * @private
 * */
MassOperationsHandler.prototype.findParentBlock_ = function(block, targetBlockId) {
  const parent = block.getParent();

  if (!parent) return false;

  if (parent.id === targetBlockId) return true;

  return this.findParentBlock_(parent, targetBlockId);
};

/**
 * Recursive finding a common parent block by id.
 * @private
 * */
MassOperationsHandler.prototype.findCommonParentBlock_ = function(blockA, blockB) {
  const parentsA = this.getBlockParentsIds_(blockA, []);

  return this.getFirstParentByIds_(blockB, [], parentsA);
};

/**
 * Collect the IDs of all block parents
 * @private
 */
MassOperationsHandler.prototype.getBlockParentsIds_ = function(block, ids) {
  const parent = block.getParent();

  if (!parent) return ids;

  ids.push(parent.id);

  return this.getBlockParentsIds_(parent, ids);
};

/**
 * Once we have a list of block parent IDs,
 * we can check if the block has one of those parents at one of its levels.
 * @private
 */
MassOperationsHandler.prototype.getFirstParentByIds_ = function(block, ids, targetIds = []) {
  const parent = block.getParent();

  if (!parent) return false;

  if (targetIds.includes(parent.id)) return parent;

  ids.push(parent.id);

  return this.getFirstParentByIds_(parent, ids, targetIds);
};

/**
 *
 * @returns {boolean|*}
 */
MassOperationsHandler.prototype.checkBlockInSelectGroup = function(block) {
  if (!this.workspace_) return false;
  if (!this.selectedBlocks_.length) return false;
  if (this.selectedBlocks_.find((b) => b.id === block.id)) return true;

  const blockParent = block.getParent();
  if (blockParent) return this.checkBlockInSelectGroup(blockParent);

  return false;
};

MassOperationsHandler.prototype.cleanUp = function() {
  this.cleanUpSelectedBlocks_();
  this.cleanUpLastMouseDownData_();

  this.currentDragDeltaXY_ = null;
  this.initBlockStartCoordinates = null;
  this.moveBlocksToAnotherModule = null;

  this.cleanUpEventWrappers_();
};

MassOperationsHandler.prototype.cleanUpSelectedBlocks_ = function() {
  if (this.selectedBlocks_.length) {
    this.selectedBlocks_.forEach((block) => block.removeSelectAsMassSelection());
    this.selectedBlocks_ = [];
  }
};

MassOperationsHandler.prototype.cleanUpLastMouseDownData_ = function() {
  this.lastMouseDownBlock_ = null;
  this.mouseDownXY_ = null;
};

MassOperationsHandler.prototype.cleanUpEventWrappers_ = function() {
  if (this.onMoveBlockWrapper_) {
    browserEvents.unbind(this.onMoveBlockWrapper_);
    this.onMoveBlockWrapper_ = null;
  }

  if (this.onMouseUpBlockWrapper_) {
    browserEvents.unbind(this.onMouseUpBlockWrapper_);
    this.onMouseUpBlockWrapper_ = null;
  }
};

MassOperationsHandler.prototype.cleanUpClipboard = function() {
  this.blocksCopyData_ = null;
};

MassOperationsHandler.prototype.deleteAll = function() {
  if (this.selectedBlocks_.length) {
    eventUtils.setGroup(true);
    this.selectedBlocks_.forEach((block) => !block.disposed && block.dispose());
    eventUtils.setGroup(false);
    this.selectedBlocks_ = [];
  }
};

MassOperationsHandler.prototype.selectAll = function() {
  const selected = common.getSelected();
  if (selected) selected.unselect();

  this.workspace_.getAllBlocks().forEach((block) => {
    if (block.inActiveModule()) this.addBlockToSelected(block);
  });
};

MassOperationsHandler.prototype.copySelected_ = function() {
  this.blocksCopyData_ = this.selectedBlocks_.map((block) => block.toCopyData(true));

  const firstBlockCoordinates = this.selectedBlocks_[0].getRelativeToSurfaceXY();

  this.selectedBlocks_.slice(1).forEach((block, i) => {
    const diff = Coordinate.difference(block.getRelativeToSurfaceXY(), firstBlockCoordinates);
    this.blocksCopyData_[i + 1].saveInfo.pasteOffset = diff;
  });
};

MassOperationsHandler.prototype.pasteCopiedBlocks_ = function() {
  this.cleanUp();

  // All paste operations will be groped
  eventUtils.setGroup(true);

  const pastedBlocks = [];

  this.blocksCopyData_.forEach((copyData) => {
    const block = this.workspace_.paste(copyData.saveInfo, {dontSelectNewBLock: true});
    if (block) {
      pastedBlocks.push(block);
      this.addBlockToSelected(block);
    }
  });

  eventUtils.setGroup(false);
};

/**
 * Show the context menu for selected group.
 * @param {!Event} e Mouse event.
 * @package
 */
MassOperationsHandler.prototype.showContextMenu = function(e) {
  e.preventDefault();
  e.stopPropagation();

  if (!this.selectedBlocks_.length) return;

  const menuOptions = this.generateContextMenu();

  if (menuOptions && menuOptions.length) {
    ContextMenu.show(e, menuOptions, this.RTL);
    ContextMenu.setCurrentBlock(this);
  }
};

/**
 * Generate the context menu for the selected blocks.
 * @return {?Array<!Object>} Context menu options or null if no menu.
 * @protected
 */
MassOperationsHandler.prototype.generateContextMenu = function() {
  if (this.workspace_.options.readOnly) return null;

  const menuOptions = ContextMenuRegistry.registry.getContextMenuOptions(
    ContextMenuRegistry.ScopeType.GROUP, {blocks: this.selectedBlocks_}
  );

  menuOptions.push({
    text: Msg['DELETE_ALL_SELECTED'],
    callback: () => {
      this.deleteAll();
    },
    enabled: true,
  });

  menuOptions.push({
    text: Msg['COPY_ALL_SELECTED'],
    callback: () => {
      this.copySelected_();
    },
    enabled: true,
  });

  menuOptions.push({
    text: Msg['DUPLICATE_ALL_SELECTED'],
    callback: () => {
      this.copySelected_();
      this.pasteCopiedBlocks_();
    },
    enabled: true,
  });

  if (this.workspace_.options.showModuleBar && this.workspace_.getModuleManager().getAllModules().length > 1) {
    const aBlock = this.selectedBlocks_[0];

    const moduleManager = this.workspace_.getModuleManager();

    moduleManager.getAllModules().forEach((module) => {
      if (aBlock.getModuleId() !== module.getId()) {
        menuOptions.push({
          text: Msg['MOVE_SELECTED_BLOCKS_TO_MODULE'].replace('%1', module.getName()),
          enabled: true,
          callback: () => {
            this.moveBlocksToAnotherModule = true;
            moduleManager.moveBlocksToModule(this.selectedBlocks_, module, this);
          },
        });
      }
    });
  }

  return menuOptions;
};

exports.MassOperationsHandler = MassOperationsHandler;
