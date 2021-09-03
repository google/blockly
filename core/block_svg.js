/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.module('Blockly.BlockSvg');
goog.module.declareLegacyNamespace();

const ASTNode = goog.require('Blockly.ASTNode');
const Block = goog.require('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const BlockRenderingDebug = goog.requireType('Blockly.blockRendering.Debug');
/* eslint-disable-next-line no-unused-vars */
const Comment = goog.requireType('Blockly.Comment');
/* eslint-disable-next-line no-unused-vars */
const Connection = goog.requireType('Blockly.Connection');
const ContextMenu = goog.require('Blockly.ContextMenu');
const ContextMenuRegistry = goog.require('Blockly.ContextMenuRegistry');
const Coordinate = goog.require('Blockly.utils.Coordinate');
const Events = goog.require('Blockly.Events');
/* eslint-disable-next-line no-unused-vars */
const Field = goog.requireType('Blockly.Field');
const FieldLabel = goog.require('Blockly.FieldLabel');
/* eslint-disable-next-line no-unused-vars */
const IASTNodeLocationSvg = goog.requireType('Blockly.IASTNodeLocationSvg');
/* eslint-disable-next-line no-unused-vars */
const IBoundedElement = goog.requireType('Blockly.IBoundedElement');
/* eslint-disable-next-line no-unused-vars */
const ICopyable = goog.requireType('Blockly.ICopyable');
/* eslint-disable-next-line no-unused-vars */
const IDraggable = goog.requireType('Blockly.IDraggable');
/* eslint-disable-next-line no-unused-vars */
const IPathObject = goog.requireType('Blockly.blockRendering.IPathObject');
/* eslint-disable-next-line no-unused-vars */
const Icon = goog.requireType('Blockly.Icon');
/* eslint-disable-next-line no-unused-vars */
const Input = goog.requireType('Blockly.Input');
const MarkerManager = goog.require('Blockly.MarkerManager');
const Msg = goog.require('Blockly.Msg');
/* eslint-disable-next-line no-unused-vars */
const Mutator = goog.requireType('Blockly.Mutator');
const Rect = goog.require('Blockly.utils.Rect');
const RenderedConnection = goog.require('Blockly.RenderedConnection');
const Svg = goog.require('Blockly.utils.Svg');
const TabNavigateCursor = goog.require('Blockly.TabNavigateCursor');
/* eslint-disable-next-line no-unused-vars */
const Theme = goog.requireType('Blockly.Theme');
const Tooltip = goog.require('Blockly.Tooltip');
/* eslint-disable-next-line no-unused-vars */
const Warning = goog.requireType('Blockly.Warning');
/* eslint-disable-next-line no-unused-vars */
const WorkspaceSvg = goog.requireType('Blockly.WorkspaceSvg');
const blockAnimations = goog.require('Blockly.blockAnimations');
const blocks = goog.require('Blockly.serialization.blocks');
const browserEvents = goog.require('Blockly.browserEvents');
const common = goog.require('Blockly.common');
const connectionTypes = goog.require('Blockly.connectionTypes');
const constants = goog.require('Blockly.constants');
const deprecation = goog.require('Blockly.utils.deprecation');
const dom = goog.require('Blockly.utils.dom');
const internalConstants = goog.require('Blockly.internalConstants');
const object = goog.require('Blockly.utils.object');
const userAgent = goog.require('Blockly.utils.userAgent');
const utils = goog.require('Blockly.utils');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockMove');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.Selected');
/** @suppress {extraRequire} */
goog.require('Blockly.Touch');


/**
 * Class for a block's SVG representation.
 * Not normally called directly, workspace.newBlock() is preferred.
 * @param {!WorkspaceSvg} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @extends {Block}
 * @implements {IASTNodeLocationSvg}
 * @implements {IBoundedElement}
 * @implements {ICopyable}
 * @implements {IDraggable}
 * @constructor
 */
const BlockSvg = function(workspace, prototypeName, opt_id) {
  // Create core elements for the block.
  /**
   * @type {!SVGGElement}
   * @private
   */
  this.svgGroup_ = dom.createSvgElement(Svg.G, {}, null);
  this.svgGroup_.translate_ = '';

  /**
   * A block style object.
   * @type {!Theme.BlockStyle}
   */
  this.style = workspace.getRenderer().getConstants().getBlockStyle(null);

  /**
   * The renderer's path object.
   * @type {IPathObject}
   * @package
   */
  this.pathObject =
      workspace.getRenderer().makePathObject(this.svgGroup_, this.style);

  /** @type {boolean} */
  this.rendered = false;
  /**
   * Is this block currently rendering? Used to stop recursive render calls
   * from actually triggering a re-render.
   * @type {boolean}
   * @private
   */
  this.renderIsInProgress_ = false;


  /** @type {!WorkspaceSvg} */
  this.workspace = workspace;

  /** @type {RenderedConnection} */
  this.outputConnection = null;
  /** @type {RenderedConnection} */
  this.nextConnection = null;
  /** @type {RenderedConnection} */
  this.previousConnection = null;

  /**
   * Whether to move the block to the drag surface when it is dragged.
   * True if it should move, false if it should be translated directly.
   * @type {boolean}
   * @private
   */
  this.useDragSurface_ =
      utils.is3dSupported() && !!workspace.getBlockDragSurface();

  const svgPath = this.pathObject.svgPath;
  svgPath.tooltip = this;
  Tooltip.bindMouseEvents(svgPath);
  BlockSvg.superClass_.constructor.call(this, workspace, prototypeName, opt_id);

  // Expose this block's ID on its top-level SVG group.
  if (this.svgGroup_.dataset) {
    this.svgGroup_.dataset['id'] = this.id;
  } else if (userAgent.IE) {
    // SVGElement.dataset is not available on IE11, but data-* properties
    // can be set with setAttribute().
    this.svgGroup_.setAttribute('data-id', this.id);
  }
};
object.inherits(BlockSvg, Block);

/**
 * Height of this block, not including any statement blocks above or below.
 * Height is in workspace units.
 */
BlockSvg.prototype.height = 0;

/**
 * Width of this block, including any connected value blocks.
 * Width is in workspace units.
 */
BlockSvg.prototype.width = 0;

/**
 * Map from IDs for warnings text to PIDs of functions to apply them.
 * Used to be able to maintain multiple warnings.
 * @type {Object<string, number>}
 * @private
 */
BlockSvg.prototype.warningTextDb_ = null;

/**
 * Constant for identifying rows that are to be rendered inline.
 * Don't collide with Blockly.inputTypes.
 * @const
 */
BlockSvg.INLINE = -1;

/**
 * ID to give the "collapsed warnings" warning. Allows us to remove the
 * "collapsed warnings" warning without removing any warnings that belong to
 * the block.
 * @type {string}
 * @const
 */
BlockSvg.COLLAPSED_WARNING_ID = 'TEMP_COLLAPSED_WARNING_';

/**
 * An optional method called when a mutator dialog is first opened.
 * This function must create and initialize a top-level block for the mutator
 * dialog, and return it. This function should also populate this top-level
 * block with any sub-blocks which are appropriate. This method must also be
 * coupled with defining a `compose` method for the default mutation dialog
 * button and UI to appear.
 * @type {?function(WorkspaceSvg):!BlockSvg}
 */
BlockSvg.prototype.decompose;

/**
 * An optional method called when a mutator dialog saves its content.
 * This function is called to modify the original block according to new
 * settings. This method must also be coupled with defining a `decompose`
 * method for the default mutation dialog button and UI to appear.
 * @type {?function(!BlockSvg)}
 */
BlockSvg.prototype.compose;

/**
 * An optional method for defining custom block context menu items.
 * @type {?function(!Array<!Object>)}
 */
BlockSvg.prototype.customContextMenu;

/**
 * An property used internally to reference the block's rendering debugger.
 * @type {?BlockRenderingDebug}
 * @package
 */
BlockSvg.prototype.renderingDebugger;

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 */
BlockSvg.prototype.initSvg = function() {
  if (!this.workspace.rendered) {
    throw TypeError('Workspace is headless.');
  }
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    input.init();
  }
  const icons = this.getIcons();
  for (let i = 0; i < icons.length; i++) {
    icons[i].createIcon();
  }
  this.applyColour();
  this.pathObject.updateMovable(this.isMovable());
  const svg = this.getSvgRoot();
  if (!this.workspace.options.readOnly && !this.eventsInit_ && svg) {
    browserEvents.conditionalBind(svg, 'mousedown', this, this.onMouseDown_);
  }
  this.eventsInit_ = true;

  if (!svg.parentNode) {
    this.workspace.getCanvas().appendChild(svg);
  }
};

/**
 * Get the secondary colour of a block.
 * @return {?string} #RRGGBB string.
 */
BlockSvg.prototype.getColourSecondary = function() {
  return this.style.colourSecondary;
};

/**
 * Get the tertiary colour of a block.
 * @return {?string} #RRGGBB string.
 */
BlockSvg.prototype.getColourTertiary = function() {
  return this.style.colourTertiary;
};

/**
 * Get the shadow colour of a block.
 * @return {?string} #RRGGBB string.
 * @deprecated Use style.colourSecondary. (2020 January 21)
 */
BlockSvg.prototype.getColourShadow = function() {
  deprecation.warn(
      'BlockSvg.prototype.getColourShadow', 'January 2020', 'January 2021',
      'style.colourSecondary');
  return this.getColourSecondary();
};

/**
 * Get the border colour(s) of a block.
 * @return {{colourDark, colourLight, colourBorder}} An object containing
 *     colour values for the border(s) of the block. If the block is using a
 *     style the colourBorder will be defined and equal to the tertiary colour
 *     of the style (#RRGGBB string). Otherwise the colourDark and colourLight
 *     attributes will be defined (#RRGGBB strings).
 * @deprecated Use style.colourTertiary. (2020 January 21)
 */
BlockSvg.prototype.getColourBorder = function() {
  deprecation.warn(
      'BlockSvg.prototype.getColourBorder', 'January 2020', 'January 2021',
      'style.colourTertiary');
  const colourTertiary = this.getColourTertiary();
  return {colourBorder: colourTertiary, colourLight: null, colourDark: null};
};

/**
 * Selects this block. Highlights the block visually and fires a select event
 * if the block is not already selected.
 */
BlockSvg.prototype.select = function() {
  if (this.isShadow() && this.getParent()) {
    // Shadow blocks should not be selected.
    this.getParent().select();
    return;
  }
  if (common.getSelected() == this) {
    return;
  }
  let oldId = null;
  if (common.getSelected()) {
    oldId = common.getSelected().id;
    // Unselect any previously selected block.
    Events.disable();
    try {
      common.getSelected().unselect();
    } finally {
      Events.enable();
    }
  }
  const event =
      new (Events.get(Events.SELECTED))(oldId, this.id, this.workspace.id);
  Events.fire(event);
  common.setSelected(this);
  this.addSelect();
};

/**
 * Unselects this block. Unhighlights the block and fires a select (false) event
 * if the block is currently selected.
 */
BlockSvg.prototype.unselect = function() {
  if (common.getSelected() != this) {
    return;
  }
  const event =
      new (Events.get(Events.SELECTED))(this.id, null, this.workspace.id);
  event.workspaceId = this.workspace.id;
  Events.fire(event);
  common.setSelected(null);
  this.removeSelect();
};

/**
 * Block's mutator icon (if any).
 * @type {?Mutator}
 */
BlockSvg.prototype.mutator = null;

/**
 * Block's comment icon (if any).
 * @type {?Comment}
 * @deprecated August 2019. Use getCommentIcon instead.
 */
BlockSvg.prototype.comment = null;

/**
 * Block's comment icon (if any).
 * @type {?Comment}
 * @private
 */
BlockSvg.prototype.commentIcon_ = null;

/**
 * Block's warning icon (if any).
 * @type {?Warning}
 */
BlockSvg.prototype.warning = null;

/**
 * Returns a list of mutator, comment, and warning icons.
 * @return {!Array<!Icon>} List of icons.
 */
BlockSvg.prototype.getIcons = function() {
  const icons = [];
  if (this.mutator) {
    icons.push(this.mutator);
  }
  if (this.commentIcon_) {
    icons.push(this.commentIcon_);
  }
  if (this.warning) {
    icons.push(this.warning);
  }
  return icons;
};

/**
 * Sets the parent of this block to be a new block or null.
 * @param {?Block} newParent New parent block.
 * @package
 * @override
 */
BlockSvg.prototype.setParent = function(newParent) {
  const oldParent = this.parentBlock_;
  if (newParent == oldParent) {
    return;
  }

  dom.startTextWidthCache();
  BlockSvg.superClass_.setParent.call(this, newParent);
  dom.stopTextWidthCache();

  const svgRoot = this.getSvgRoot();

  // Bail early if workspace is clearing, or we aren't rendered.
  // We won't need to reattach ourselves anywhere.
  if (this.workspace.isClearing || !svgRoot) {
    return;
  }

  const oldXY = this.getRelativeToSurfaceXY();
  if (newParent) {
    newParent.getSvgRoot().appendChild(svgRoot);
    const newXY = this.getRelativeToSurfaceXY();
    // Move the connections to match the child's new position.
    this.moveConnections(newXY.x - oldXY.x, newXY.y - oldXY.y);
  }
  // If we are losing a parent, we want to move our DOM element to the
  // root of the workspace.
  else if (oldParent) {
    this.workspace.getCanvas().appendChild(svgRoot);
    this.translate(oldXY.x, oldXY.y);
  }

  this.applyColour();
};

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's origin (0,0), in workspace units.
 * If the block is on the workspace, (0, 0) is the origin of the workspace
 * coordinate system.
 * This does not change with workspace scale.
 * @return {!Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 */
BlockSvg.prototype.getRelativeToSurfaceXY = function() {
  let x = 0;
  let y = 0;

  const dragSurfaceGroup = this.useDragSurface_ ?
      this.workspace.getBlockDragSurface().getGroup() :
      null;

  let element = this.getSvgRoot();
  if (element) {
    do {
      // Loop through this block and every parent.
      const xy = utils.getRelativeXY(element);
      x += xy.x;
      y += xy.y;
      // If this element is the current element on the drag surface, include
      // the translation of the drag surface itself.
      if (this.useDragSurface_ &&
          this.workspace.getBlockDragSurface().getCurrentBlock() == element) {
        const surfaceTranslation =
            this.workspace.getBlockDragSurface().getSurfaceTranslation();
        x += surfaceTranslation.x;
        y += surfaceTranslation.y;
      }
      element = /** @type {!SVGElement} */ (element.parentNode);
    } while (element && element != this.workspace.getCanvas() &&
             element != dragSurfaceGroup);
  }
  return new Coordinate(x, y);
};

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset in workspace units.
 * @param {number} dy Vertical offset in workspace units.
 */
BlockSvg.prototype.moveBy = function(dx, dy) {
  if (this.parentBlock_) {
    throw Error('Block has parent.');
  }
  const eventsEnabled = Events.isEnabled();
  let event;
  if (eventsEnabled) {
    event = new (Events.get(Events.BLOCK_MOVE))(this);
  }
  const xy = this.getRelativeToSurfaceXY();
  this.translate(xy.x + dx, xy.y + dy);
  this.moveConnections(dx, dy);
  if (eventsEnabled) {
    event.recordNew();
    Events.fire(event);
  }
  this.workspace.resizeContents();
};

/**
 * Transforms a block by setting the translation on the transform attribute
 * of the block's SVG.
 * @param {number} x The x coordinate of the translation in workspace units.
 * @param {number} y The y coordinate of the translation in workspace units.
 */
BlockSvg.prototype.translate = function(x, y) {
  this.getSvgRoot().setAttribute('transform', 'translate(' + x + ',' + y + ')');
};

/**
 * Move this block to its workspace's drag surface, accounting for positioning.
 * Generally should be called at the same time as setDragging_(true).
 * Does nothing if useDragSurface_ is false.
 * @package
 */
BlockSvg.prototype.moveToDragSurface = function() {
  if (!this.useDragSurface_) {
    return;
  }
  // The translation for drag surface blocks,
  // is equal to the current relative-to-surface position,
  // to keep the position in sync as it move on/off the surface.
  // This is in workspace coordinates.
  const xy = this.getRelativeToSurfaceXY();
  this.clearTransformAttributes_();
  this.workspace.getBlockDragSurface().translateSurface(xy.x, xy.y);
  // Execute the move on the top-level SVG component
  const svg = this.getSvgRoot();
  if (svg) {
    this.workspace.getBlockDragSurface().setBlocksAndShow(svg);
  }
};

/**
 * Move a block to a position.
 * @param {Coordinate} xy The position to move to in workspace units.
 */
BlockSvg.prototype.moveTo = function(xy) {
  const curXY = this.getRelativeToSurfaceXY();
  this.moveBy(xy.x - curXY.x, xy.y - curXY.y);
};

/**
 * Move this block back to the workspace block canvas.
 * Generally should be called at the same time as setDragging_(false).
 * Does nothing if useDragSurface_ is false.
 * @param {!Coordinate} newXY The position the block should take on
 *     on the workspace canvas, in workspace coordinates.
 * @package
 */
BlockSvg.prototype.moveOffDragSurface = function(newXY) {
  if (!this.useDragSurface_) {
    return;
  }
  // Translate to current position, turning off 3d.
  this.translate(newXY.x, newXY.y);
  this.workspace.getBlockDragSurface().clearAndHide(this.workspace.getCanvas());
};

/**
 * Move this block during a drag, taking into account whether we are using a
 * drag surface to translate blocks.
 * This block must be a top-level block.
 * @param {!Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 * @package
 */
BlockSvg.prototype.moveDuringDrag = function(newLoc) {
  if (this.useDragSurface_) {
    this.workspace.getBlockDragSurface().translateSurface(newLoc.x, newLoc.y);
  } else {
    this.svgGroup_.translate_ = 'translate(' + newLoc.x + ',' + newLoc.y + ')';
    this.svgGroup_.setAttribute(
        'transform', this.svgGroup_.translate_ + this.svgGroup_.skew_);
  }
};

/**
 * Clear the block of transform="..." attributes.
 * Used when the block is switching from 3d to 2d transform or vice versa.
 * @private
 */
BlockSvg.prototype.clearTransformAttributes_ = function() {
  this.getSvgRoot().removeAttribute('transform');
};

/**
 * Snap this block to the nearest grid point.
 */
BlockSvg.prototype.snapToGrid = function() {
  if (!this.workspace) {
    return;  // Deleted block.
  }
  if (this.workspace.isDragging()) {
    return;  // Don't bump blocks during a drag.
  }
  if (this.getParent()) {
    return;  // Only snap top-level blocks.
  }
  if (this.isInFlyout) {
    return;  // Don't move blocks around in a flyout.
  }
  const grid = this.workspace.getGrid();
  if (!grid || !grid.shouldSnap()) {
    return;  // Config says no snapping.
  }
  const spacing = grid.getSpacing();
  const half = spacing / 2;
  const xy = this.getRelativeToSurfaceXY();
  const dx =
      Math.round(Math.round((xy.x - half) / spacing) * spacing + half - xy.x);
  const dy =
      Math.round(Math.round((xy.y - half) / spacing) * spacing + half - xy.y);
  if (dx || dy) {
    this.moveBy(dx, dy);
  }
};

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * block and any blocks stacked below it.
 * Coordinate system: workspace coordinates.
 * @return {!Rect} Object with coordinates of the bounding box.
 */
BlockSvg.prototype.getBoundingRectangle = function() {
  const blockXY = this.getRelativeToSurfaceXY();
  const blockBounds = this.getHeightWidth();
  let left;
  let right;
  if (this.RTL) {
    left = blockXY.x - blockBounds.width;
    right = blockXY.x;
  } else {
    left = blockXY.x;
    right = blockXY.x + blockBounds.width;
  }
  return new Rect(blockXY.y, blockXY.y + blockBounds.height, left, right);
};

/**
 * Notify every input on this block to mark its fields as dirty.
 * A dirty field is a field that needs to be re-rendered.
 */
BlockSvg.prototype.markDirty = function() {
  this.pathObject.constants = (/** @type {!WorkspaceSvg} */ (this.workspace))
      .getRenderer()
      .getConstants();
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    input.markDirty();
  }
};

/**
 * Set whether the block is collapsed or not.
 * @param {boolean} collapsed True if collapsed.
 */
BlockSvg.prototype.setCollapsed = function(collapsed) {
  if (this.collapsed_ == collapsed) {
    return;
  }
  BlockSvg.superClass_.setCollapsed.call(this, collapsed);
  if (!collapsed) {
    this.updateCollapsed_();
  } else if (this.rendered) {
    this.render();
    // Don't bump neighbours. Users like to store collapsed functions together
    // and bumping makes them go out of alignment.
  }
};

/**
 * Makes sure that when the block is collapsed, it is rendered correctly
 * for that state.
 * @private
 */
BlockSvg.prototype.updateCollapsed_ = function() {
  const collapsed = this.isCollapsed();
  const collapsedInputName = constants.COLLAPSED_INPUT_NAME;
  const collapsedFieldName = constants.COLLAPSED_FIELD_NAME;

  for (let i = 0, input; (input = this.inputList[i]); i++) {
    if (input.name != collapsedInputName) {
      input.setVisible(!collapsed);
    }
  }

  if (!collapsed) {
    this.updateDisabled();
    this.removeInput(collapsedInputName);
    return;
  }

  const icons = this.getIcons();
  for (let i = 0, icon; (icon = icons[i]); i++) {
    icon.setVisible(false);
  }

  const text = this.toString(internalConstants.COLLAPSE_CHARS);
  const field = this.getField(collapsedFieldName);
  if (field) {
    field.setValue(text);
    return;
  }
  const input = this.getInput(collapsedInputName) ||
      this.appendDummyInput(collapsedInputName);
  input.appendField(new FieldLabel(text), collapsedFieldName);
};

/**
 * Open the next (or previous) FieldTextInput.
 * @param {!Field} start Current field.
 * @param {boolean} forward If true go forward, otherwise backward.
 */
BlockSvg.prototype.tab = function(start, forward) {
  const tabCursor = new TabNavigateCursor();
  tabCursor.setCurNode(ASTNode.createFieldNode(start));
  const currentNode = tabCursor.getCurNode();

  if (forward) {
    tabCursor.next();
  } else {
    tabCursor.prev();
  }

  const nextNode = tabCursor.getCurNode();
  if (nextNode && nextNode !== currentNode) {
    const nextField = /** @type {!Field} */ (nextNode.getLocation());
    nextField.showEditor();

    // Also move the cursor if we're in keyboard nav mode.
    if (this.workspace.keyboardAccessibilityMode) {
      this.workspace.getCursor().setCurNode(nextNode);
    }
  }
};

/**
 * Handle a mouse-down on an SVG block.
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
BlockSvg.prototype.onMouseDown_ = function(e) {
  const gesture = this.workspace && this.workspace.getGesture(e);
  if (gesture) {
    gesture.handleBlockStart(e, this);
  }
};

/**
 * Load the block's help page in a new window.
 * @package
 */
BlockSvg.prototype.showHelp = function() {
  const url =
      (typeof this.helpUrl == 'function') ? this.helpUrl() : this.helpUrl;
  if (url) {
    window.open(url);
  }
};

/**
 * Generate the context menu for this block.
 * @return {?Array<!Object>} Context menu options or null if no menu.
 * @protected
 */
BlockSvg.prototype.generateContextMenu = function() {
  if (this.workspace.options.readOnly || !this.contextMenu) {
    return null;
  }
  const menuOptions = ContextMenuRegistry.registry.getContextMenuOptions(
      ContextMenuRegistry.ScopeType.BLOCK, {block: this});

  // Allow the block to add or modify menuOptions.
  if (this.customContextMenu) {
    this.customContextMenu(menuOptions);
  }

  return menuOptions;
};

/**
 * Show the context menu for this block.
 * @param {!Event} e Mouse event.
 * @package
 */
BlockSvg.prototype.showContextMenu = function(e) {
  const menuOptions = this.generateContextMenu();

  if (menuOptions && menuOptions.length) {
    ContextMenu.show(e, menuOptions, this.RTL);
    ContextMenu.setCurrentBlock(this);
  }
};

/**
 * Move the connections for this block and all blocks attached under it.
 * Also update any attached bubbles.
 * @param {number} dx Horizontal offset from current location, in workspace
 *     units.
 * @param {number} dy Vertical offset from current location, in workspace
 *     units.
 * @package
 */
BlockSvg.prototype.moveConnections = function(dx, dy) {
  if (!this.rendered) {
    // Rendering is required to lay out the blocks.
    // This is probably an invisible block attached to a collapsed block.
    return;
  }
  const myConnections = this.getConnections_(false);
  for (let i = 0; i < myConnections.length; i++) {
    myConnections[i].moveBy(dx, dy);
  }
  const icons = this.getIcons();
  for (let i = 0; i < icons.length; i++) {
    icons[i].computeIconLocation();
  }

  // Recurse through all blocks attached under this one.
  for (let i = 0; i < this.childBlocks_.length; i++) {
    this.childBlocks_[i].moveConnections(dx, dy);
  }
};

/**
 * Recursively adds or removes the dragging class to this node and its children.
 * @param {boolean} adding True if adding, false if removing.
 * @package
 */
BlockSvg.prototype.setDragging = function(adding) {
  if (adding) {
    const group = this.getSvgRoot();
    group.translate_ = '';
    group.skew_ = '';
    common.draggingConnections.push(...this.getConnections_(true));
    dom.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDragging');
  } else {
    common.draggingConnections.length = 0;
    dom.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDragging');
  }
  // Recurse through all blocks attached under this one.
  for (let i = 0; i < this.childBlocks_.length; i++) {
    this.childBlocks_[i].setDragging(adding);
  }
};

/**
 * Set whether this block is movable or not.
 * @param {boolean} movable True if movable.
 */
BlockSvg.prototype.setMovable = function(movable) {
  BlockSvg.superClass_.setMovable.call(this, movable);
  this.pathObject.updateMovable(movable);
};

/**
 * Set whether this block is editable or not.
 * @param {boolean} editable True if editable.
 */
BlockSvg.prototype.setEditable = function(editable) {
  BlockSvg.superClass_.setEditable.call(this, editable);
  const icons = this.getIcons();
  for (let i = 0; i < icons.length; i++) {
    icons[i].updateEditable();
  }
};

/**
 * Sets whether this block is a shadow block or not.
 * @param {boolean} shadow True if a shadow.
 * @package
 */
BlockSvg.prototype.setShadow = function(shadow) {
  BlockSvg.superClass_.setShadow.call(this, shadow);
  this.applyColour();
};

/**
 * Set whether this block is an insertion marker block or not.
 * Once set this cannot be unset.
 * @param {boolean} insertionMarker True if an insertion marker.
 * @package
 */
BlockSvg.prototype.setInsertionMarker = function(insertionMarker) {
  if (this.isInsertionMarker_ == insertionMarker) {
    return;  // No change.
  }
  this.isInsertionMarker_ = insertionMarker;
  if (this.isInsertionMarker_) {
    this.setColour(
        this.workspace.getRenderer().getConstants().INSERTION_MARKER_COLOUR);
    this.pathObject.updateInsertionMarker(true);
  }
};

/**
 * Return the root node of the SVG or null if none exists.
 * @return {!SVGGElement} The root SVG node (probably a group).
 */
BlockSvg.prototype.getSvgRoot = function() {
  return this.svgGroup_;
};

/**
 * Dispose of this block.
 * @param {boolean=} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 * @param {boolean=} animate If true, show a disposal animation and sound.
 * @suppress {checkTypes}
 */
BlockSvg.prototype.dispose = function(healStack, animate) {
  if (!this.workspace) {
    // The block has already been deleted.
    return;
  }
  Tooltip.dispose();
  Tooltip.unbindMouseEvents(this.pathObject.svgPath);
  dom.startTextWidthCache();
  // Save the block's workspace temporarily so we can resize the
  // contents once the block is disposed.
  const blockWorkspace = this.workspace;
  // If this block is being dragged, unlink the mouse events.
  if (common.getSelected() == this) {
    this.unselect();
    this.workspace.cancelCurrentGesture();
  }
  // If this block has a context menu open, close it.
  if (ContextMenu.getCurrentBlock() == this) {
    ContextMenu.hide();
  }

  if (animate && this.rendered) {
    this.unplug(healStack);
    blockAnimations.disposeUiEffect(this);
  }
  // Stop rerendering.
  this.rendered = false;

  // Clear pending warnings.
  if (this.warningTextDb_) {
    for (const n in this.warningTextDb_) {
      clearTimeout(this.warningTextDb_[n]);
    }
    this.warningTextDb_ = null;
  }

  const icons = this.getIcons();
  for (let i = 0; i < icons.length; i++) {
    icons[i].dispose();
  }
  BlockSvg.superClass_.dispose.call(this, !!healStack);

  dom.removeNode(this.svgGroup_);
  blockWorkspace.resizeContents();
  // Sever JavaScript to DOM connections.
  this.svgGroup_ = null;
  dom.stopTextWidthCache();
};

/**
 * Delete a block and hide chaff when doing so. The block will not be deleted if
 * it's in a flyout. This is called from the context menu and keyboard shortcuts
 * as the full delete action. If you are disposing of a block from the workspace
 * and don't need to perform flyout checks, handle event grouping, or hide
 * chaff, then use `block.dispose()` directly.
 * @package
 */
BlockSvg.prototype.checkAndDelete = function() {
  if (this.workspace.isFlyout) {
    return;
  }
  Blockly.Events.setGroup(true);
  this.workspace.hideChaff();
  if (this.outputConnection) {
    // Do not attempt to heal rows
    // (https://github.com/google/blockly/issues/4832)
    this.dispose(false, true);
  } else {
    this.dispose(/* heal */ true, true);
  }
  Blockly.Events.setGroup(false);
};

/**
 * Encode a block for copying.
 * @return {?ICopyable.CopyData} Copy metadata, or null if the block is
 *     an insertion marker.
 * @package
 */
BlockSvg.prototype.toCopyData = function() {
  if (this.isInsertionMarker_) {
    return null;
  }
  return {
    saveInfo: /** @type {!blocks.State} */(blocks.save(
        this, {addCoordinates: true, addNextBlocks: false})),
    source: this.workspace,
    typeCounts: utils.getBlockTypeCounts(this, true)
  };
};

/**
 * Updates the colour of the block to match the block's state.
 * @package
 */
BlockSvg.prototype.applyColour = function() {
  this.pathObject.applyColour(this);

  const icons = this.getIcons();
  for (let i = 0; i < icons.length; i++) {
    icons[i].applyColour();
  }

  for (let x = 0, input; (input = this.inputList[x]); x++) {
    for (let y = 0, field; (field = input.fieldRow[y]); y++) {
      field.applyColour();
    }
  }
};

/**
 * Updates the color of the block (and children) to match the current disabled
 * state.
 * @package
 */
BlockSvg.prototype.updateDisabled = function() {
  const children = this.getChildren(false);
  this.applyColour();
  if (this.isCollapsed()) {
    return;
  }
  for (let i = 0, child; (child = children[i]); i++) {
    if (child.rendered) {
      child.updateDisabled();
    }
  }
};

/**
 * Get the comment icon attached to this block, or null if the block has no
 * comment.
 * @return {?Comment} The comment icon attached to this block, or null.
 */
BlockSvg.prototype.getCommentIcon = function() {
  return this.commentIcon_;
};

/**
 * Set this block's comment text.
 * @param {?string} text The text, or null to delete.
 */
BlockSvg.prototype.setCommentText = function(text) {
  const Comment = goog.module.get('Blockly.Comment');
  if (!Comment) {
    throw Error('Missing require for Blockly.Comment');
  }
  if (this.commentModel.text == text) {
    return;
  }
  BlockSvg.superClass_.setCommentText.call(this, text);

  const shouldHaveComment = text != null;
  if (!!this.commentIcon_ == shouldHaveComment) {
    // If the comment's state of existence is correct, but the text is new
    // that means we're just updating a comment.
    this.commentIcon_.updateText();
    return;
  }
  if (shouldHaveComment) {
    this.commentIcon_ = new Comment(this);
    this.comment = this.commentIcon_;  // For backwards compatibility.
  } else {
    this.commentIcon_.dispose();
    this.commentIcon_ = null;
    this.comment = null;  // For backwards compatibility.
  }
  if (this.rendered) {
    this.render();
    // Adding or removing a comment icon will cause the block to change shape.
    this.bumpNeighbours();
  }
};

/**
 * Set this block's warning text.
 * @param {?string} text The text, or null to delete.
 * @param {string=} opt_id An optional ID for the warning text to be able to
 *     maintain multiple warnings.
 */
BlockSvg.prototype.setWarningText = function(text, opt_id) {
  const Warning = goog.module.get('Blockly.Warning');
  if (!Warning) {
    throw Error('Missing require for Blockly.Warning');
  }
  if (!this.warningTextDb_) {
    // Create a database of warning PIDs.
    // Only runs once per block (and only those with warnings).
    this.warningTextDb_ = Object.create(null);
  }
  const id = opt_id || '';
  if (!id) {
    // Kill all previous pending processes, this edit supersedes them all.
    for (const n of Object.keys(this.warningTextDb_)) {
      clearTimeout(this.warningTextDb_[n]);
      delete this.warningTextDb_[n];
    }
  } else if (this.warningTextDb_[id]) {
    // Only queue up the latest change.  Kill any earlier pending process.
    clearTimeout(this.warningTextDb_[id]);
    delete this.warningTextDb_[id];
  }
  if (this.workspace.isDragging()) {
    // Don't change the warning text during a drag.
    // Wait until the drag finishes.
    const thisBlock = this;
    this.warningTextDb_[id] = setTimeout(function() {
      if (thisBlock.workspace) {  // Check block wasn't deleted.
        delete thisBlock.warningTextDb_[id];
        thisBlock.setWarningText(text, id);
      }
    }, 100);
    return;
  }
  if (this.isInFlyout) {
    text = null;
  }

  let changedState = false;
  if (typeof text == 'string') {
    // Bubble up to add a warning on top-most collapsed block.
    let parent = this.getSurroundParent();
    let collapsedParent = null;
    while (parent) {
      if (parent.isCollapsed()) {
        collapsedParent = parent;
      }
      parent = parent.getSurroundParent();
    }
    if (collapsedParent) {
      collapsedParent.setWarningText(
          Msg['COLLAPSED_WARNINGS_WARNING'], BlockSvg.COLLAPSED_WARNING_ID);
    }

    if (!this.warning) {
      this.warning = new Warning(this);
      changedState = true;
    }
    this.warning.setText(/** @type {string} */ (text), id);
  } else {
    // Dispose all warnings if no ID is given.
    if (this.warning && !id) {
      this.warning.dispose();
      changedState = true;
    } else if (this.warning) {
      const oldText = this.warning.getText();
      this.warning.setText('', id);
      const newText = this.warning.getText();
      if (!newText) {
        this.warning.dispose();
      }
      changedState = oldText != newText;
    }
  }
  if (changedState && this.rendered) {
    this.render();
    // Adding or removing a warning icon will cause the block to change shape.
    this.bumpNeighbours();
  }
};

/**
 * Give this block a mutator dialog.
 * @param {?Mutator} mutator A mutator dialog instance or null to remove.
 */
BlockSvg.prototype.setMutator = function(mutator) {
  if (this.mutator && this.mutator !== mutator) {
    this.mutator.dispose();
  }
  if (mutator) {
    mutator.setBlock(this);
    this.mutator = mutator;
    mutator.createIcon();
  }
  if (this.rendered) {
    this.render();
    // Adding or removing a mutator icon will cause the block to change shape.
    this.bumpNeighbours();
  }
};

/**
 * Set whether the block is enabled or not.
 * @param {boolean} enabled True if enabled.
 */
BlockSvg.prototype.setEnabled = function(enabled) {
  if (this.isEnabled() != enabled) {
    BlockSvg.superClass_.setEnabled.call(this, enabled);
    if (this.rendered && !this.getInheritedDisabled()) {
      this.updateDisabled();
    }
  }
};

/**
 * Set whether the block is highlighted or not.  Block highlighting is
 * often used to visually mark blocks currently being executed.
 * @param {boolean} highlighted True if highlighted.
 */
BlockSvg.prototype.setHighlighted = function(highlighted) {
  if (!this.rendered) {
    return;
  }
  this.pathObject.updateHighlighted(highlighted);
};

/**
 * Adds the visual "select" effect to the block, but does not actually select
 * it or fire an event.
 * @see BlockSvg#select
 */
BlockSvg.prototype.addSelect = function() {
  this.pathObject.updateSelected(true);
};

/**
 * Removes the visual "select" effect from the block, but does not actually
 * unselect it or fire an event.
 * @see BlockSvg#unselect
 */
BlockSvg.prototype.removeSelect = function() {
  this.pathObject.updateSelected(false);
};

/**
 * Update the cursor over this block by adding or removing a class.
 * @param {boolean} enable True if the delete cursor should be shown, false
 *     otherwise.
 * @package
 */
BlockSvg.prototype.setDeleteStyle = function(enable) {
  this.pathObject.updateDraggingDelete(enable);
};


// Overrides of functions on Blockly.Block that take into account whether the
// block has been rendered.
/**
 * Get the colour of a block.
 * @return {string} #RRGGBB string.
 */
BlockSvg.prototype.getColour = function() {
  return this.style.colourPrimary;
};

/**
 * Change the colour of a block.
 * @param {number|string} colour HSV hue value, or #RRGGBB string.
 */
BlockSvg.prototype.setColour = function(colour) {
  BlockSvg.superClass_.setColour.call(this, colour);
  const styleObj =
      this.workspace.getRenderer().getConstants().getBlockStyleForColour(
          this.colour_);

  this.pathObject.setStyle(styleObj.style);
  this.style = styleObj.style;
  this.styleName_ = styleObj.name;

  this.applyColour();
};

/**
 * Set the style and colour values of a block.
 * @param {string} blockStyleName Name of the block style.
 * @throws {Error} if the block style does not exist.
 */
BlockSvg.prototype.setStyle = function(blockStyleName) {
  const blockStyle =
      this.workspace.getRenderer().getConstants().getBlockStyle(blockStyleName);
  this.styleName_ = blockStyleName;

  if (blockStyle) {
    this.hat = blockStyle.hat;
    this.pathObject.setStyle(blockStyle);
    // Set colour to match Block.
    this.colour_ = blockStyle.colourPrimary;
    this.style = blockStyle;

    this.applyColour();
  } else {
    throw Error('Invalid style name: ' + blockStyleName);
  }
};

/**
 * Move this block to the front of the visible workspace.
 * <g> tags do not respect z-index so SVG renders them in the
 * order that they are in the DOM.  By placing this block first within the
 * block group's <g>, it will render on top of any other blocks.
 * @package
 */
BlockSvg.prototype.bringToFront = function() {
  let block = this;
  do {
    const root = block.getSvgRoot();
    const parent = root.parentNode;
    const childNodes = parent.childNodes;
    // Avoid moving the block if it's already at the bottom.
    if (childNodes[childNodes.length - 1] !== root) {
      parent.appendChild(root);
    }
    block = block.getParent();
  } while (block);
};

/**
 * Set whether this block can chain onto the bottom of another block.
 * @param {boolean} newBoolean True if there can be a previous statement.
 * @param {(string|Array<string>|null)=} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 */
BlockSvg.prototype.setPreviousStatement = function(newBoolean, opt_check) {
  BlockSvg.superClass_.setPreviousStatement.call(this, newBoolean, opt_check);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours();
  }
};

/**
 * Set whether another block can chain onto the bottom of this block.
 * @param {boolean} newBoolean True if there can be a next statement.
 * @param {(string|Array<string>|null)=} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 */
BlockSvg.prototype.setNextStatement = function(newBoolean, opt_check) {
  BlockSvg.superClass_.setNextStatement.call(this, newBoolean, opt_check);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours();
  }
};

/**
 * Set whether this block returns a value.
 * @param {boolean} newBoolean True if there is an output.
 * @param {(string|Array<string>|null)=} opt_check Returned type or list
 *     of returned types.  Null or undefined if any type could be returned
 *     (e.g. variable get).
 */
BlockSvg.prototype.setOutput = function(newBoolean, opt_check) {
  BlockSvg.superClass_.setOutput.call(this, newBoolean, opt_check);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours();
  }
};

/**
 * Set whether value inputs are arranged horizontally or vertically.
 * @param {boolean} newBoolean True if inputs are horizontal.
 */
BlockSvg.prototype.setInputsInline = function(newBoolean) {
  BlockSvg.superClass_.setInputsInline.call(this, newBoolean);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours();
  }
};

/**
 * Remove an input from this block.
 * @param {string} name The name of the input.
 * @param {boolean=} opt_quiet True to prevent error if input is not present.
 * @return {boolean} True if operation succeeds, false if input is not present
 *     and opt_quiet is true
 * @throws {Error} if the input is not present and opt_quiet is not true.
 */
BlockSvg.prototype.removeInput = function(name, opt_quiet) {
  const removed = BlockSvg.superClass_.removeInput.call(this, name, opt_quiet);

  if (this.rendered) {
    this.render();
    // Removing an input will cause the block to change shape.
    this.bumpNeighbours();
  }

  return removed;
};

/**
 * Move a numbered input to a different location on this block.
 * @param {number} inputIndex Index of the input to move.
 * @param {number} refIndex Index of input that should be after the moved input.
 */
BlockSvg.prototype.moveNumberedInputBefore = function(inputIndex, refIndex) {
  BlockSvg.superClass_.moveNumberedInputBefore.call(this, inputIndex, refIndex);

  if (this.rendered) {
    this.render();
    // Moving an input will cause the block to change shape.
    this.bumpNeighbours();
  }
};

/**
 * Add a value input, statement input or local variable to this block.
 * @param {number} type One of Blockly.inputTypes.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Input} The input object created.
 * @protected
 * @override
 */
BlockSvg.prototype.appendInput_ = function(type, name) {
  const input = BlockSvg.superClass_.appendInput_.call(this, type, name);

  if (this.rendered) {
    this.render();
    // Adding an input will cause the block to change shape.
    this.bumpNeighbours();
  }
  return input;
};

/**
 * Sets whether this block's connections are tracked in the database or not.
 *
 * Used by the deserializer to be more efficient. Setting a connection's
 * tracked_ value to false keeps it from adding itself to the db when it
 * gets its first moveTo call, saving expensive ops for later.
 * @param {boolean} track If true, start tracking. If false, stop tracking.
 * @package
 */
BlockSvg.prototype.setConnectionTracking = function(track) {
  if (this.previousConnection) {
    this.previousConnection.setTracking(track);
  }
  if (this.outputConnection) {
    this.outputConnection.setTracking(track);
  }
  if (this.nextConnection) {
    this.nextConnection.setTracking(track);
    const child = this.nextConnection.targetBlock();
    if (child) {
      child.setConnectionTracking(track);
    }
  }

  if (this.collapsed_) {
    // When track is true, we don't want to start tracking collapsed
    // connections. When track is false, we're already not tracking
    // collapsed connections, so no need to update.
    return;
  }

  for (let i = 0; i < this.inputList.length; i++) {
    const conn = this.inputList[i].connection;
    if (conn) {
      conn.setTracking(track);

      // Pass tracking on down the chain.
      const block = conn.targetBlock();
      if (block) {
        block.setConnectionTracking(track);
      }
    }
  }
};

/**
 * Returns connections originating from this block.
 * @param {boolean} all If true, return all connections even hidden ones.
 *     Otherwise, for a non-rendered block return an empty list, and for a
 *     collapsed block don't return inputs connections.
 * @return {!Array<!RenderedConnection>} Array of connections.
 * @package
 */
BlockSvg.prototype.getConnections_ = function(all) {
  const myConnections = [];
  if (all || this.rendered) {
    if (this.outputConnection) {
      myConnections.push(this.outputConnection);
    }
    if (this.previousConnection) {
      myConnections.push(this.previousConnection);
    }
    if (this.nextConnection) {
      myConnections.push(this.nextConnection);
    }
    if (all || !this.collapsed_) {
      for (let i = 0, input; (input = this.inputList[i]); i++) {
        if (input.connection) {
          myConnections.push(input.connection);
        }
      }
    }
  }
  return myConnections;
};

/**
 * Walks down a stack of blocks and finds the last next connection on the stack.
 * @param {boolean} ignoreShadows If true,the last connection on a non-shadow
 *     block will be returned. If false, this will follow shadows to find the
 *     last connection.
 * @return {?RenderedConnection} The last next connection on the stack,
 *     or null.
 * @package
 * @override
 */
BlockSvg.prototype.lastConnectionInStack = function(ignoreShadows) {
  return /** @type {RenderedConnection} */ (
      BlockSvg.superClass_.lastConnectionInStack.call(this, ignoreShadows));
};

/**
 * Find the connection on this block that corresponds to the given connection
 * on the other block.
 * Used to match connections between a block and its insertion marker.
 * @param {!Block} otherBlock The other block to match against.
 * @param {!Connection} conn The other connection to match.
 * @return {?RenderedConnection} The matching connection on this block,
 *     or null.
 * @package
 * @override
 */
BlockSvg.prototype.getMatchingConnection = function(otherBlock, conn) {
  return /** @type {RenderedConnection} */ (
      BlockSvg.superClass_.getMatchingConnection.call(this, otherBlock, conn));
};

/**
 * Create a connection of the specified type.
 * @param {number} type The type of the connection to create.
 * @return {!RenderedConnection} A new connection of the specified type.
 * @protected
 */
BlockSvg.prototype.makeConnection_ = function(type) {
  return new RenderedConnection(this, type);
};

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 */
BlockSvg.prototype.bumpNeighbours = function() {
  if (!this.workspace) {
    return;  // Deleted block.
  }
  if (this.workspace.isDragging()) {
    return;  // Don't bump blocks during a drag.
  }
  const rootBlock = this.getRootBlock();
  if (rootBlock.isInFlyout) {
    return;  // Don't move blocks around in a flyout.
  }
  // Loop through every connection on this block.
  const myConnections = this.getConnections_(false);
  for (let i = 0, connection; (connection = myConnections[i]); i++) {
    // Spider down from this block bumping all sub-blocks.
    if (connection.isConnected() && connection.isSuperior()) {
      connection.targetBlock().bumpNeighbours();
    }

    const neighbours = connection.neighbours(internalConstants.SNAP_RADIUS);
    for (let j = 0, otherConnection; (otherConnection = neighbours[j]); j++) {
      // If both connections are connected, that's probably fine.  But if
      // either one of them is unconnected, then there could be confusion.
      if (!connection.isConnected() || !otherConnection.isConnected()) {
        // Only bump blocks if they are from different tree structures.
        if (otherConnection.getSourceBlock().getRootBlock() != rootBlock) {
          // Always bump the inferior block.
          if (connection.isSuperior()) {
            otherConnection.bumpAwayFrom(connection);
          } else {
            connection.bumpAwayFrom(otherConnection);
          }
        }
      }
    }
  }
};

/**
 * Schedule snapping to grid and bumping neighbours to occur after a brief
 * delay.
 * @package
 */
BlockSvg.prototype.scheduleSnapAndBump = function() {
  const block = this;
  // Ensure that any snap and bump are part of this move's event group.
  const group = Events.getGroup();

  setTimeout(function() {
    Events.setGroup(group);
    block.snapToGrid();
    Events.setGroup(false);
  }, internalConstants.BUMP_DELAY / 2);

  setTimeout(function() {
    Events.setGroup(group);
    block.bumpNeighbours();
    Events.setGroup(false);
  }, internalConstants.BUMP_DELAY);
};

/**
 * Position a block so that it doesn't move the target block when connected.
 * The block to position is usually either the first block in a dragged stack or
 * an insertion marker.
 * @param {!RenderedConnection} sourceConnection The connection on the
 *     moving block's stack.
 * @param {!RenderedConnection} targetConnection The connection that
 *     should stay stationary as this block is positioned.
 * @package
 */
BlockSvg.prototype.positionNearConnection = function(
    sourceConnection, targetConnection) {
  // We only need to position the new block if it's before the existing one,
  // otherwise its position is set by the previous block.
  if (sourceConnection.type == connectionTypes.NEXT_STATEMENT ||
      sourceConnection.type == connectionTypes.INPUT_VALUE) {
    const dx = targetConnection.x - sourceConnection.x;
    const dy = targetConnection.y - sourceConnection.y;

    this.moveBy(dx, dy);
  }
};

/**
 * Return the parent block or null if this block is at the top level.
 * @return {?BlockSvg} The block (if any) that holds the current block.
 * @override
 */
BlockSvg.prototype.getParent = function() {
  return /** @type {!BlockSvg} */ (BlockSvg.superClass_.getParent.call(this));
};

/**
 * Return the top-most block in this block's tree.
 * This will return itself if this block is at the top level.
 * @return {!BlockSvg} The root block.
 * @override
 */
BlockSvg.prototype.getRootBlock = function() {
  return /** @type {!BlockSvg} */ (
      BlockSvg.superClass_.getRootBlock.call(this));
};

/**
 * Lays out and reflows a block based on its contents and settings.
 * @param {boolean=} opt_bubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
BlockSvg.prototype.render = function(opt_bubble) {
  if (this.renderIsInProgress_) {
    return;  // Don't allow recursive renders.
  }
  this.renderIsInProgress_ = true;
  try {
    this.rendered = true;
    dom.startTextWidthCache();

    if (this.isCollapsed()) {
      this.updateCollapsed_();
    }
    this.workspace.getRenderer().render(this);
    this.updateConnectionLocations_();

    if (opt_bubble !== false) {
      const parentBlock = this.getParent();
      if (parentBlock) {
        parentBlock.render(true);
      } else {
        // Top-most block. Fire an event to allow scrollbars to resize.
        this.workspace.resizeContents();
      }
    }

    dom.stopTextWidthCache();
    this.updateMarkers_();
  } finally {
    this.renderIsInProgress_ = false;
  }
};

/**
 * Redraw any attached marker or cursor svgs if needed.
 * @protected
 */
BlockSvg.prototype.updateMarkers_ = function() {
  if (this.workspace.keyboardAccessibilityMode && this.pathObject.cursorSvg) {
    this.workspace.getCursor().draw();
  }
  if (this.workspace.keyboardAccessibilityMode && this.pathObject.markerSvg) {
    // TODO(#4592): Update all markers on the block.
    this.workspace.getMarker(MarkerManager.LOCAL_MARKER).draw();
  }
};

/**
 * Update all of the connections on this block with the new locations calculated
 * during rendering.  Also move all of the connected blocks based on the new
 * connection locations.
 * @private
 */
BlockSvg.prototype.updateConnectionLocations_ = function() {
  const blockTL = this.getRelativeToSurfaceXY();
  // Don't tighten previous or output connections because they are inferior
  // connections.
  if (this.previousConnection) {
    this.previousConnection.moveToOffset(blockTL);
  }
  if (this.outputConnection) {
    this.outputConnection.moveToOffset(blockTL);
  }

  for (let i = 0; i < this.inputList.length; i++) {
    const conn = this.inputList[i].connection;
    if (conn) {
      conn.moveToOffset(blockTL);
      if (conn.isConnected()) {
        conn.tighten();
      }
    }
  }

  if (this.nextConnection) {
    this.nextConnection.moveToOffset(blockTL);
    if (this.nextConnection.isConnected()) {
      this.nextConnection.tighten();
    }
  }
};

/**
 * Add the cursor SVG to this block's SVG group.
 * @param {SVGElement} cursorSvg The SVG root of the cursor to be added to the
 *     block SVG group.
 * @package
 */
BlockSvg.prototype.setCursorSvg = function(cursorSvg) {
  this.pathObject.setCursorSvg(cursorSvg);
};

/**
 * Add the marker SVG to this block's SVG group.
 * @param {SVGElement} markerSvg The SVG root of the marker to be added to the
 *     block SVG group.
 * @package
 */
BlockSvg.prototype.setMarkerSvg = function(markerSvg) {
  this.pathObject.setMarkerSvg(markerSvg);
};

/**
 * Returns a bounding box describing the dimensions of this block
 * and any blocks stacked below it.
 * @return {!{height: number, width: number}} Object with height and width
 *    properties in workspace units.
 * @package
 */
BlockSvg.prototype.getHeightWidth = function() {
  let height = this.height;
  let width = this.width;
  // Recursively add size of subsequent blocks.
  const nextBlock = this.getNextBlock();
  if (nextBlock) {
    const nextHeightWidth = nextBlock.getHeightWidth();
    const workspace = /** @type {!WorkspaceSvg} */ (this.workspace);
    const tabHeight = workspace.getRenderer().getConstants().NOTCH_HEIGHT;
    height += nextHeightWidth.height - tabHeight;
    width = Math.max(width, nextHeightWidth.width);
  }
  return {height: height, width: width};
};

/**
 * Visual effect to show that if the dragging block is dropped, this block will
 * be replaced.  If a shadow block, it will disappear.  Otherwise it will bump.
 * @param {boolean} add True if highlighting should be added.
 * @package
 */
BlockSvg.prototype.fadeForReplacement = function(add) {
  this.pathObject.updateReplacementFade(add);
};

/**
 * Visual effect to show that if the dragging block is dropped it will connect
 * to this input.
 * @param {Connection} conn The connection on the input to highlight.
 * @param {boolean} add True if highlighting should be added.
 * @package
 */
BlockSvg.prototype.highlightShapeForInput = function(conn, add) {
  this.pathObject.updateShapeForInputHighlight(conn, add);
};

exports = BlockSvg;
