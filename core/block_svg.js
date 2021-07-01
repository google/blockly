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

goog.provide('Blockly.BlockSvg');

goog.require('Blockly.ASTNode');
goog.require('Blockly.Block');
goog.require('Blockly.blockAnimations');
goog.require('Blockly.blockRendering.IPathObject');
goog.require('Blockly.browserEvents');
goog.require('Blockly.connectionTypes');
/** @suppress {extraRequire} */
goog.require('Blockly.constants');
goog.require('Blockly.ContextMenu');
goog.require('Blockly.ContextMenuRegistry');
goog.require('Blockly.Events');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockMove');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.Selected');
goog.require('Blockly.IASTNodeLocationSvg');
goog.require('Blockly.IBoundedElement');
goog.require('Blockly.ICopyable');
goog.require('Blockly.IDraggable');
goog.require('Blockly.Msg');
goog.require('Blockly.RenderedConnection');
goog.require('Blockly.TabNavigateCursor');
goog.require('Blockly.Tooltip');
/** @suppress {extraRequire} */
goog.require('Blockly.Touch');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.deprecation');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.Svg');
goog.require('Blockly.utils.userAgent');
goog.require('Blockly.Xml');

goog.requireType('Blockly.blockRendering.Debug');
goog.requireType('Blockly.Comment');
goog.requireType('Blockly.Connection');
goog.requireType('Blockly.Field');
goog.requireType('Blockly.Input');
goog.requireType('Blockly.Mutator');
goog.requireType('Blockly.Theme');
goog.requireType('Blockly.Warning');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Class for a block's SVG representation.
 * Not normally called directly, workspace.newBlock() is preferred.
 * @param {!Blockly.WorkspaceSvg} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @extends {Blockly.Block}
 * @implements {Blockly.IASTNodeLocationSvg}
 * @implements {Blockly.IBoundedElement}
 * @implements {Blockly.ICopyable}
 * @implements {Blockly.IDraggable}
 * @constructor
 */
Blockly.BlockSvg = function(workspace, prototypeName, opt_id) {
  // Create core elements for the block.
  /**
   * @type {!SVGGElement}
   * @private
   */
  this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G, {}, null);
  this.svgGroup_.translate_ = '';

  /**
   * A block style object.
   * @type {!Blockly.Theme.BlockStyle}
   */
  this.style = workspace.getRenderer().getConstants().getBlockStyle(null);

  /**
   * The renderer's path object.
   * @type {Blockly.blockRendering.IPathObject}
   * @package
   */
  this.pathObject = workspace.getRenderer().makePathObject(
      this.svgGroup_, this.style);

  /** @type {boolean} */
  this.rendered = false;
  /**
   * Is this block currently rendering? Used to stop recursive render calls
   * from actually triggering a re-render.
   * @type {boolean}
   * @private
   */
  this.renderIsInProgress_ = false;


  /** @type {!Blockly.WorkspaceSvg} */
  this.workspace = workspace;

  /** @type {Blockly.RenderedConnection} */
  this.outputConnection = null;
  /** @type {Blockly.RenderedConnection} */
  this.nextConnection = null;
  /** @type {Blockly.RenderedConnection} */
  this.previousConnection = null;

  /**
   * Whether to move the block to the drag surface when it is dragged.
   * True if it should move, false if it should be translated directly.
   * @type {boolean}
   * @private
   */
  this.useDragSurface_ =
      Blockly.utils.is3dSupported() && !!workspace.getBlockDragSurface();

  var svgPath = this.pathObject.svgPath;
  svgPath.tooltip = this;
  Blockly.Tooltip.bindMouseEvents(svgPath);
  Blockly.BlockSvg.superClass_.constructor.call(this,
      workspace, prototypeName, opt_id);

  // Expose this block's ID on its top-level SVG group.
  if (this.svgGroup_.dataset) {
    this.svgGroup_.dataset['id'] = this.id;
  } else if (Blockly.utils.userAgent.IE) {
    // SVGElement.dataset is not available on IE11, but data-* properties
    // can be set with setAttribute().
    this.svgGroup_.setAttribute('data-id', this.id);
  }
};
Blockly.utils.object.inherits(Blockly.BlockSvg, Blockly.Block);

/**
 * Height of this block, not including any statement blocks above or below.
 * Height is in workspace units.
 */
Blockly.BlockSvg.prototype.height = 0;

/**
 * Width of this block, including any connected value blocks.
 * Width is in workspace units.
 */
Blockly.BlockSvg.prototype.width = 0;

/**
 * Map from IDs for warnings text to PIDs of functions to apply them.
 * Used to be able to maintain multiple warnings.
 * @type {Object<string, number>}
 * @private
 */
Blockly.BlockSvg.prototype.warningTextDb_ = null;

/**
 * Constant for identifying rows that are to be rendered inline.
 * Don't collide with Blockly.inputTypes.
 * @const
 */
Blockly.BlockSvg.INLINE = -1;

/**
 * ID to give the "collapsed warnings" warning. Allows us to remove the
 * "collapsed warnings" warning without removing any warnings that belong to
 * the block.
 * @type {string}
 * @const
 */
Blockly.BlockSvg.COLLAPSED_WARNING_ID = 'TEMP_COLLAPSED_WARNING_';

/**
 * An optional method called when a mutator dialog is first opened.
 * This function must create and initialize a top-level block for the mutator
 * dialog, and return it. This function should also populate this top-level
 * block with any sub-blocks which are appropriate. This method must also be
 * coupled with defining a `compose` method for the default mutation dialog
 * button and UI to appear.
 * @type {?function(Blockly.WorkspaceSvg):!Blockly.BlockSvg}
 */
Blockly.BlockSvg.prototype.decompose;

/**
 * An optional method called when a mutator dialog saves its content.
 * This function is called to modify the original block according to new
 * settings. This method must also be coupled with defining a `decompose`
 * method for the default mutation dialog button and UI to appear.
 * @type {?function(!Blockly.BlockSvg)}
 */
Blockly.BlockSvg.prototype.compose;

/**
 * An optional method for defining custom block context menu items.
 * @type {?function(!Array<!Object>)}
 */
Blockly.BlockSvg.prototype.customContextMenu;

/**
 * An property used internally to reference the block's rendering debugger.
 * @type {?Blockly.blockRendering.Debug}
 * @package
 */
Blockly.BlockSvg.prototype.renderingDebugger;

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 */
Blockly.BlockSvg.prototype.initSvg = function() {
  if (!this.workspace.rendered) {
    throw TypeError('Workspace is headless.');
  }
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    input.init();
  }
  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].createIcon();
  }
  this.applyColour();
  this.pathObject.updateMovable(this.isMovable());
  var svg = this.getSvgRoot();
  if (!this.workspace.options.readOnly && !this.eventsInit_ && svg) {
    Blockly.browserEvents.conditionalBind(
        svg, 'mousedown', this, this.onMouseDown_);
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
Blockly.BlockSvg.prototype.getColourSecondary = function() {
  return this.style.colourSecondary;
};

/**
 * Get the tertiary colour of a block.
 * @return {?string} #RRGGBB string.
 */
Blockly.BlockSvg.prototype.getColourTertiary = function() {
  return this.style.colourTertiary;
};

/**
 * Get the shadow colour of a block.
 * @return {?string} #RRGGBB string.
 * @deprecated Use style.colourSecondary. (2020 January 21)
 */
Blockly.BlockSvg.prototype.getColourShadow = function() {
  Blockly.utils.deprecation.warn(
      'BlockSvg.prototype.getColourShadow',
      'January 2020',
      'January 2021',
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
Blockly.BlockSvg.prototype.getColourBorder = function() {
  Blockly.utils.deprecation.warn(
      'BlockSvg.prototype.getColourBorder',
      'January 2020',
      'January 2021',
      'style.colourTertiary');
  var colourTertiary = this.getColourTertiary();
  return {
    colourBorder: colourTertiary,
    colourLight: null,
    colourDark: null
  };
};

/**
 * Select this block.  Highlight it visually.
 */
Blockly.BlockSvg.prototype.select = function() {
  if (this.isShadow() && this.getParent()) {
    // Shadow blocks should not be selected.
    this.getParent().select();
    return;
  }
  if (Blockly.selected == this) {
    return;
  }
  var oldId = null;
  if (Blockly.selected) {
    oldId = Blockly.selected.id;
    // Unselect any previously selected block.
    Blockly.Events.disable();
    try {
      Blockly.selected.unselect();
    } finally {
      Blockly.Events.enable();
    }
  }
  var event = new (Blockly.Events.get(Blockly.Events.SELECTED))(oldId, this.id,
      this.workspace.id);
  Blockly.Events.fire(event);
  Blockly.selected = this;
  this.addSelect();
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.BlockSvg.prototype.unselect = function() {
  if (Blockly.selected != this) {
    return;
  }
  var event = new (Blockly.Events.get(Blockly.Events.SELECTED))(this.id, null,
      this.workspace.id);
  event.workspaceId = this.workspace.id;
  Blockly.Events.fire(event);
  Blockly.selected = null;
  this.removeSelect();
};

/**
 * Block's mutator icon (if any).
 * @type {?Blockly.Mutator}
 */
Blockly.BlockSvg.prototype.mutator = null;

/**
 * Block's comment icon (if any).
 * @type {?Blockly.Comment}
 * @deprecated August 2019. Use getCommentIcon instead.
 */
Blockly.BlockSvg.prototype.comment = null;

/**
 * Block's comment icon (if any).
 * @type {?Blockly.Comment}
 * @private
 */
Blockly.BlockSvg.prototype.commentIcon_ = null;

/**
 * Block's warning icon (if any).
 * @type {?Blockly.Warning}
 */
Blockly.BlockSvg.prototype.warning = null;

/**
 * Returns a list of mutator, comment, and warning icons.
 * @return {!Array<!Blockly.Icon>} List of icons.
 */
Blockly.BlockSvg.prototype.getIcons = function() {
  var icons = [];
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
 * Set parent of this block to be a new block or null.
 * @param {?Blockly.Block} newParent New parent block.
 * @override
 */
Blockly.BlockSvg.prototype.setParent = function(newParent) {
  var oldParent = this.parentBlock_;
  if (newParent == oldParent) {
    return;
  }

  Blockly.utils.dom.startTextWidthCache();
  Blockly.BlockSvg.superClass_.setParent.call(this, newParent);
  Blockly.utils.dom.stopTextWidthCache();

  var svgRoot = this.getSvgRoot();

  // Bail early if workspace is clearing, or we aren't rendered.
  // We won't need to reattach ourselves anywhere.
  if (this.workspace.isClearing || !svgRoot) {
    return;
  }

  var oldXY = this.getRelativeToSurfaceXY();
  if (newParent) {
    newParent.getSvgRoot().appendChild(svgRoot);
    var newXY = this.getRelativeToSurfaceXY();
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
 * @return {!Blockly.utils.Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 */
Blockly.BlockSvg.prototype.getRelativeToSurfaceXY = function() {
  var x = 0;
  var y = 0;

  var dragSurfaceGroup = this.useDragSurface_ ?
      this.workspace.getBlockDragSurface().getGroup() : null;

  var element = this.getSvgRoot();
  if (element) {
    do {
      // Loop through this block and every parent.
      var xy = Blockly.utils.getRelativeXY(element);
      x += xy.x;
      y += xy.y;
      // If this element is the current element on the drag surface, include
      // the translation of the drag surface itself.
      if (this.useDragSurface_ &&
          this.workspace.getBlockDragSurface().getCurrentBlock() == element) {
        var surfaceTranslation =
            this.workspace.getBlockDragSurface().getSurfaceTranslation();
        x += surfaceTranslation.x;
        y += surfaceTranslation.y;
      }
      element = /** @type {!SVGElement} */ (element.parentNode);
    } while (element && element != this.workspace.getCanvas() &&
        element != dragSurfaceGroup);
  }
  return new Blockly.utils.Coordinate(x, y);
};

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset in workspace units.
 * @param {number} dy Vertical offset in workspace units.
 */
Blockly.BlockSvg.prototype.moveBy = function(dx, dy) {
  if (this.parentBlock_) {
    throw Error('Block has parent.');
  }
  var eventsEnabled = Blockly.Events.isEnabled();
  if (eventsEnabled) {
    var event = new (Blockly.Events.get(Blockly.Events.BLOCK_MOVE))(this);
  }
  var xy = this.getRelativeToSurfaceXY();
  this.translate(xy.x + dx, xy.y + dy);
  this.moveConnections(dx, dy);
  if (eventsEnabled) {
    event.recordNew();
    Blockly.Events.fire(event);
  }
  this.workspace.resizeContents();
};

/**
 * Transforms a block by setting the translation on the transform attribute
 * of the block's SVG.
 * @param {number} x The x coordinate of the translation in workspace units.
 * @param {number} y The y coordinate of the translation in workspace units.
 */
Blockly.BlockSvg.prototype.translate = function(x, y) {
  this.getSvgRoot().setAttribute('transform',
      'translate(' + x + ',' + y + ')');
};

/**
 * Move this block to its workspace's drag surface, accounting for positioning.
 * Generally should be called at the same time as setDragging_(true).
 * Does nothing if useDragSurface_ is false.
 * @package
 */
Blockly.BlockSvg.prototype.moveToDragSurface = function() {
  if (!this.useDragSurface_) {
    return;
  }
  // The translation for drag surface blocks,
  // is equal to the current relative-to-surface position,
  // to keep the position in sync as it move on/off the surface.
  // This is in workspace coordinates.
  var xy = this.getRelativeToSurfaceXY();
  this.clearTransformAttributes_();
  this.workspace.getBlockDragSurface().translateSurface(xy.x, xy.y);
  // Execute the move on the top-level SVG component
  var svg = this.getSvgRoot();
  if (svg) {
    this.workspace.getBlockDragSurface().setBlocksAndShow(svg);
  }
};

/**
 * Move a block to a position.
 * @param {Blockly.utils.Coordinate} xy The position to move to in workspace units.
 */
Blockly.BlockSvg.prototype.moveTo = function(xy) {
  var curXY = this.getRelativeToSurfaceXY();
  this.moveBy(xy.x - curXY.x, xy.y - curXY.y);
};

/**
 * Move this block back to the workspace block canvas.
 * Generally should be called at the same time as setDragging_(false).
 * Does nothing if useDragSurface_ is false.
 * @param {!Blockly.utils.Coordinate} newXY The position the block should take on
 *     on the workspace canvas, in workspace coordinates.
 * @package
 */
Blockly.BlockSvg.prototype.moveOffDragSurface = function(newXY) {
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
 * @param {!Blockly.utils.Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 * @package
 */
Blockly.BlockSvg.prototype.moveDuringDrag = function(newLoc) {
  if (this.useDragSurface_) {
    this.workspace.getBlockDragSurface().translateSurface(newLoc.x, newLoc.y);
  } else {
    this.svgGroup_.translate_ = 'translate(' + newLoc.x + ',' + newLoc.y + ')';
    this.svgGroup_.setAttribute('transform',
        this.svgGroup_.translate_ + this.svgGroup_.skew_);
  }
};

/**
 * Clear the block of transform="..." attributes.
 * Used when the block is switching from 3d to 2d transform or vice versa.
 * @private
 */
Blockly.BlockSvg.prototype.clearTransformAttributes_ = function() {
  this.getSvgRoot().removeAttribute('transform');
};

/**
 * Snap this block to the nearest grid point.
 */
Blockly.BlockSvg.prototype.snapToGrid = function() {
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
  var grid = this.workspace.getGrid();
  if (!grid || !grid.shouldSnap()) {
    return;  // Config says no snapping.
  }
  var spacing = grid.getSpacing();
  var half = spacing / 2;
  var xy = this.getRelativeToSurfaceXY();
  var dx = Math.round((xy.x - half) / spacing) * spacing + half - xy.x;
  var dy = Math.round((xy.y - half) / spacing) * spacing + half - xy.y;
  dx = Math.round(dx);
  dy = Math.round(dy);
  if (dx != 0 || dy != 0) {
    this.moveBy(dx, dy);
  }
};

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * block and any blocks stacked below it.
 * Coordinate system: workspace coordinates.
 * @return {!Blockly.utils.Rect} Object with coordinates of the bounding box.
 */
Blockly.BlockSvg.prototype.getBoundingRectangle = function() {
  var blockXY = this.getRelativeToSurfaceXY();
  var blockBounds = this.getHeightWidth();
  var left, right;
  if (this.RTL) {
    left = blockXY.x - blockBounds.width;
    right = blockXY.x;
  } else {
    left = blockXY.x;
    right = blockXY.x + blockBounds.width;
  }
  return new Blockly.utils.Rect(
      blockXY.y, blockXY.y + blockBounds.height, left, right);
};

/**
 * Notify every input on this block to mark its fields as dirty.
 * A dirty field is a field that needs to be re-rendered.
 */
Blockly.BlockSvg.prototype.markDirty = function() {
  this.pathObject.constants =
    (/** @type {!Blockly.WorkspaceSvg} */ (this.workspace))
        .getRenderer().getConstants();
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    input.markDirty();
  }
};

/**
 * Set whether the block is collapsed or not.
 * @param {boolean} collapsed True if collapsed.
 */
Blockly.BlockSvg.prototype.setCollapsed = function(collapsed) {
  if (this.collapsed_ == collapsed) {
    return;
  }
  Blockly.BlockSvg.superClass_.setCollapsed.call(this, collapsed);
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
Blockly.BlockSvg.prototype.updateCollapsed_ = function() {
  var collapsed = this.isCollapsed();
  var collapsedInputName = Blockly.constants.COLLAPSED_INPUT_NAME;
  var collapsedFieldName = Blockly.constants.COLLAPSED_FIELD_NAME;

  for (var i = 0, input; (input = this.inputList[i]); i++) {
    if (input.name != collapsedInputName) {
      input.setVisible(!collapsed);
    }
  }

  if (!collapsed) {
    this.updateDisabled();
    this.removeInput(collapsedInputName);
    return;
  }

  var icons = this.getIcons();
  for (var i = 0, icon; (icon = icons[i]); i++) {
    icon.setVisible(false);
  }

  var text = this.toString(Blockly.COLLAPSE_CHARS);
  var field = this.getField(collapsedFieldName);
  if (field) {
    field.setValue(text);
    return;
  }
  var input = this.getInput(collapsedInputName) ||
      this.appendDummyInput(collapsedInputName);
  input.appendField(new Blockly.FieldLabel(text), collapsedFieldName);
};

/**
 * Open the next (or previous) FieldTextInput.
 * @param {!Blockly.Field} start Current field.
 * @param {boolean} forward If true go forward, otherwise backward.
 */
Blockly.BlockSvg.prototype.tab = function(start, forward) {
  var tabCursor = new Blockly.TabNavigateCursor();
  tabCursor.setCurNode(Blockly.ASTNode.createFieldNode(start));
  var currentNode = tabCursor.getCurNode();

  if (forward) {
    tabCursor.next();
  } else {
    tabCursor.prev();
  }

  var nextNode = tabCursor.getCurNode();
  if (nextNode && nextNode !== currentNode) {
    var nextField = /** @type {!Blockly.Field} */ (nextNode.getLocation());
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
Blockly.BlockSvg.prototype.onMouseDown_ = function(e) {
  var gesture = this.workspace && this.workspace.getGesture(e);
  if (gesture) {
    gesture.handleBlockStart(e, this);
  }
};

/**
 * Load the block's help page in a new window.
 * @package
 */
Blockly.BlockSvg.prototype.showHelp = function() {
  var url = (typeof this.helpUrl == 'function') ? this.helpUrl() : this.helpUrl;
  if (url) {
    window.open(url);
  }
};

/**
 * Generate the context menu for this block.
 * @protected
 * @return {?Array<!Object>} Context menu options or null if no menu.
 */
Blockly.BlockSvg.prototype.generateContextMenu = function() {
  if (this.workspace.options.readOnly || !this.contextMenu) {
    return null;
  }
  var menuOptions = Blockly.ContextMenuRegistry.registry.getContextMenuOptions(
      Blockly.ContextMenuRegistry.ScopeType.BLOCK, {block: this});

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
Blockly.BlockSvg.prototype.showContextMenu = function(e) {
  var menuOptions = this.generateContextMenu();

  if (menuOptions && menuOptions.length) {
    Blockly.ContextMenu.show(e, menuOptions, this.RTL);
    Blockly.ContextMenu.currentBlock = this;
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
Blockly.BlockSvg.prototype.moveConnections = function(dx, dy) {
  if (!this.rendered) {
    // Rendering is required to lay out the blocks.
    // This is probably an invisible block attached to a collapsed block.
    return;
  }
  var myConnections = this.getConnections_(false);
  for (var i = 0; i < myConnections.length; i++) {
    myConnections[i].moveBy(dx, dy);
  }
  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].computeIconLocation();
  }

  // Recurse through all blocks attached under this one.
  for (var i = 0; i < this.childBlocks_.length; i++) {
    this.childBlocks_[i].moveConnections(dx, dy);
  }
};

/**
 * Recursively adds or removes the dragging class to this node and its children.
 * @param {boolean} adding True if adding, false if removing.
 * @package
 */
Blockly.BlockSvg.prototype.setDragging = function(adding) {
  if (adding) {
    var group = this.getSvgRoot();
    group.translate_ = '';
    group.skew_ = '';
    Blockly.draggingConnections =
        Blockly.draggingConnections.concat(this.getConnections_(true));
    Blockly.utils.dom.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDragging');
  } else {
    Blockly.draggingConnections = [];
    Blockly.utils.dom.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDragging');
  }
  // Recurse through all blocks attached under this one.
  for (var i = 0; i < this.childBlocks_.length; i++) {
    this.childBlocks_[i].setDragging(adding);
  }
};

/**
 * Set whether this block is movable or not.
 * @param {boolean} movable True if movable.
 */
Blockly.BlockSvg.prototype.setMovable = function(movable) {
  Blockly.BlockSvg.superClass_.setMovable.call(this, movable);
  this.pathObject.updateMovable(movable);
};

/**
 * Set whether this block is editable or not.
 * @param {boolean} editable True if editable.
 */
Blockly.BlockSvg.prototype.setEditable = function(editable) {
  Blockly.BlockSvg.superClass_.setEditable.call(this, editable);
  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].updateEditable();
  }
};

/**
 * Set whether this block is a shadow block or not.
 * @param {boolean} shadow True if a shadow.
 */
Blockly.BlockSvg.prototype.setShadow = function(shadow) {
  Blockly.BlockSvg.superClass_.setShadow.call(this, shadow);
  this.applyColour();
};

/**
 * Set whether this block is an insertion marker block or not.
 * Once set this cannot be unset.
 * @param {boolean} insertionMarker True if an insertion marker.
 * @package
 */
Blockly.BlockSvg.prototype.setInsertionMarker = function(insertionMarker) {
  if (this.isInsertionMarker_ == insertionMarker) {
    return;  // No change.
  }
  this.isInsertionMarker_ = insertionMarker;
  if (this.isInsertionMarker_) {
    this.setColour(this.workspace.getRenderer().getConstants().
        INSERTION_MARKER_COLOUR);
    this.pathObject.updateInsertionMarker(true);
  }
};

/**
 * Return the root node of the SVG or null if none exists.
 * @return {!SVGGElement} The root SVG node (probably a group).
 */
Blockly.BlockSvg.prototype.getSvgRoot = function() {
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
Blockly.BlockSvg.prototype.dispose = function(healStack, animate) {
  if (!this.workspace) {
    // The block has already been deleted.
    return;
  }
  Blockly.Tooltip.dispose();
  Blockly.Tooltip.unbindMouseEvents(this.pathObject.svgPath);
  Blockly.utils.dom.startTextWidthCache();
  // Save the block's workspace temporarily so we can resize the
  // contents once the block is disposed.
  var blockWorkspace = this.workspace;
  // If this block is being dragged, unlink the mouse events.
  if (Blockly.selected == this) {
    this.unselect();
    this.workspace.cancelCurrentGesture();
  }
  // If this block has a context menu open, close it.
  if (Blockly.ContextMenu.currentBlock == this) {
    Blockly.ContextMenu.hide();
  }

  if (animate && this.rendered) {
    this.unplug(healStack);
    Blockly.blockAnimations.disposeUiEffect(this);
  }
  // Stop rerendering.
  this.rendered = false;

  // Clear pending warnings.
  if (this.warningTextDb_) {
    for (var n in this.warningTextDb_) {
      clearTimeout(this.warningTextDb_[n]);
    }
    this.warningTextDb_ = null;
  }

  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].dispose();
  }
  Blockly.BlockSvg.superClass_.dispose.call(this, !!healStack);

  Blockly.utils.dom.removeNode(this.svgGroup_);
  blockWorkspace.resizeContents();
  // Sever JavaScript to DOM connections.
  this.svgGroup_ = null;
  Blockly.utils.dom.stopTextWidthCache();
};

/**
 * Encode a block for copying.
 * @return {?Blockly.ICopyable.CopyData} Copy metadata, or null if the block is
 *     an insertion marker.
 * @package
 */
Blockly.BlockSvg.prototype.toCopyData = function() {
  if (this.isInsertionMarker_) {
    return null;
  }
  var xml = /** @type {!Element} */ (Blockly.Xml.blockToDom(this, true));
  // Copy only the selected block and internal blocks.
  Blockly.Xml.deleteNext(xml);
  // Encode start position in XML.
  var xy = this.getRelativeToSurfaceXY();
  xml.setAttribute('x', this.RTL ? -xy.x : xy.x);
  xml.setAttribute('y', xy.y);
  return {
    xml: xml,
    source: this.workspace,
    typeCounts: Blockly.utils.getBlockTypeCounts(this, true)
  };
};

/**
 * Change the colour of a block.
 * @package
 */
Blockly.BlockSvg.prototype.applyColour = function() {
  this.pathObject.applyColour(this);

  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].applyColour();
  }

  for (var x = 0, input; (input = this.inputList[x]); x++) {
    for (var y = 0, field; (field = input.fieldRow[y]); y++) {
      field.applyColour();
    }
  }
};

/**
 * Enable or disable a block.
 */
Blockly.BlockSvg.prototype.updateDisabled = function() {
  var children = this.getChildren(false);
  this.applyColour();
  if (this.isCollapsed()) {
    return;
  }
  for (var i = 0, child; (child = children[i]); i++) {
    if (child.rendered) {
      child.updateDisabled();
    }
  }
};

/**
 * Get the comment icon attached to this block, or null if the block has no
 * comment.
 * @return {?Blockly.Comment} The comment icon attached to this block, or null.
 */
Blockly.BlockSvg.prototype.getCommentIcon = function() {
  return this.commentIcon_;
};

/**
 * Set this block's comment text.
 * @param {?string} text The text, or null to delete.
 */
Blockly.BlockSvg.prototype.setCommentText = function(text) {
  if (!Blockly.Comment) {
    throw Error('Missing require for Blockly.Comment');
  }
  if (this.commentModel.text == text) {
    return;
  }
  Blockly.BlockSvg.superClass_.setCommentText.call(this, text);

  var shouldHaveComment = text != null;
  if (!!this.commentIcon_ == shouldHaveComment) {
    // If the comment's state of existence is correct, but the text is new
    // that means we're just updating a comment.
    this.commentIcon_.updateText();
    return;
  }
  if (shouldHaveComment) {
    this.commentIcon_ = new Blockly.Comment(this);
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
Blockly.BlockSvg.prototype.setWarningText = function(text, opt_id) {
  if (!Blockly.Warning) {
    throw Error('Missing require for Blockly.Warning');
  }
  if (!this.warningTextDb_) {
    // Create a database of warning PIDs.
    // Only runs once per block (and only those with warnings).
    this.warningTextDb_ = Object.create(null);
  }
  var id = opt_id || '';
  if (!id) {
    // Kill all previous pending processes, this edit supersedes them all.
    for (var n in this.warningTextDb_) {
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
    var thisBlock = this;
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

  var changedState = false;
  if (typeof text == 'string') {
    // Bubble up to add a warning on top-most collapsed block.
    var parent = this.getSurroundParent();
    var collapsedParent = null;
    while (parent) {
      if (parent.isCollapsed()) {
        collapsedParent = parent;
      }
      parent = parent.getSurroundParent();
    }
    if (collapsedParent) {
      collapsedParent.setWarningText(Blockly.Msg['COLLAPSED_WARNINGS_WARNING'],
          Blockly.BlockSvg.COLLAPSED_WARNING_ID);
    }

    if (!this.warning) {
      this.warning = new Blockly.Warning(this);
      changedState = true;
    }
    this.warning.setText(/** @type {string} */ (text), id);
  } else {
    // Dispose all warnings if no ID is given.
    if (this.warning && !id) {
      this.warning.dispose();
      changedState = true;
    } else if (this.warning) {
      var oldText = this.warning.getText();
      this.warning.setText('', id);
      var newText = this.warning.getText();
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
 * @param {?Blockly.Mutator} mutator A mutator dialog instance or null to remove.
 */
Blockly.BlockSvg.prototype.setMutator = function(mutator) {
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
Blockly.BlockSvg.prototype.setEnabled = function(enabled) {
  if (this.isEnabled() != enabled) {
    Blockly.BlockSvg.superClass_.setEnabled.call(this, enabled);
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
Blockly.BlockSvg.prototype.setHighlighted = function(highlighted) {
  if (!this.rendered) {
    return;
  }
  this.pathObject.updateHighlighted(highlighted);
};

/**
 * Select this block.  Highlight it visually.
 */
Blockly.BlockSvg.prototype.addSelect = function() {
  this.pathObject.updateSelected(true);
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.BlockSvg.prototype.removeSelect = function() {
  this.pathObject.updateSelected(false);
};

/**
 * Update the cursor over this block by adding or removing a class.
 * @param {boolean} enable True if the delete cursor should be shown, false
 *     otherwise.
 * @package
 */
Blockly.BlockSvg.prototype.setDeleteStyle = function(enable) {
  this.pathObject.updateDraggingDelete(enable);
};


// Overrides of functions on Blockly.Block that take into account whether the
// block has been rendered.
/**
 * Get the colour of a block.
 * @return {string} #RRGGBB string.
 */
Blockly.BlockSvg.prototype.getColour = function() {
  return this.style.colourPrimary;
};

/**
 * Change the colour of a block.
 * @param {number|string} colour HSV hue value, or #RRGGBB string.
 */
Blockly.BlockSvg.prototype.setColour = function(colour) {
  Blockly.BlockSvg.superClass_.setColour.call(this, colour);
  var styleObj = this.workspace.getRenderer().getConstants()
      .getBlockStyleForColour(this.colour_);

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
Blockly.BlockSvg.prototype.setStyle = function(blockStyleName) {
  var blockStyle = this.workspace.getRenderer()
      .getConstants().getBlockStyle(blockStyleName);
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
Blockly.BlockSvg.prototype.bringToFront = function() {
  var block = this;
  do {
    var root = block.getSvgRoot();
    var parent = root.parentNode;
    var childNodes = parent.childNodes;
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
Blockly.BlockSvg.prototype.setPreviousStatement = function(newBoolean,
    opt_check) {
  Blockly.BlockSvg.superClass_.setPreviousStatement.call(this, newBoolean,
      opt_check);

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
Blockly.BlockSvg.prototype.setNextStatement = function(newBoolean, opt_check) {
  Blockly.BlockSvg.superClass_.setNextStatement.call(this, newBoolean,
      opt_check);

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
Blockly.BlockSvg.prototype.setOutput = function(newBoolean, opt_check) {
  Blockly.BlockSvg.superClass_.setOutput.call(this, newBoolean, opt_check);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours();
  }
};

/**
 * Set whether value inputs are arranged horizontally or vertically.
 * @param {boolean} newBoolean True if inputs are horizontal.
 */
Blockly.BlockSvg.prototype.setInputsInline = function(newBoolean) {
  Blockly.BlockSvg.superClass_.setInputsInline.call(this, newBoolean);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours();
  }
};

/**
 * Remove an input from this block.
 * @param {string} name The name of the input.
 * @param {boolean=} opt_quiet True to prevent error if input is not present.
 * @return {boolean} True if operation succeeds, false if input is not present and opt_quiet is true
 * @throws {Error} if the input is not present and
 *     opt_quiet is not true.
 */
Blockly.BlockSvg.prototype.removeInput = function(name, opt_quiet) {
  var removed = Blockly.BlockSvg.superClass_.removeInput.call(this, name, opt_quiet);

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
Blockly.BlockSvg.prototype.moveNumberedInputBefore = function(
    inputIndex, refIndex) {
  Blockly.BlockSvg.superClass_.moveNumberedInputBefore.call(this, inputIndex,
      refIndex);

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
 * @return {!Blockly.Input} The input object created.
 * @protected
 * @override
 */
Blockly.BlockSvg.prototype.appendInput_ = function(type, name) {
  var input = Blockly.BlockSvg.superClass_.appendInput_.call(this, type, name);

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
Blockly.BlockSvg.prototype.setConnectionTracking = function(track) {
  if (this.previousConnection) {
    this.previousConnection.setTracking(track);
  }
  if (this.outputConnection) {
    this.outputConnection.setTracking(track);
  }
  if (this.nextConnection) {
    this.nextConnection.setTracking(track);
    var child = this.nextConnection.targetBlock();
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

  for (var i = 0; i < this.inputList.length; i++) {
    var conn = this.inputList[i].connection;
    if (conn) {
      conn.setTracking(track);

      // Pass tracking on down the chain.
      var block = conn.targetBlock();
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
 * @return {!Array<!Blockly.RenderedConnection>} Array of connections.
 * @package
 */
Blockly.BlockSvg.prototype.getConnections_ = function(all) {
  var myConnections = [];
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
      for (var i = 0, input; (input = this.inputList[i]); i++) {
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
 * @return {?Blockly.RenderedConnection} The last next connection on the stack,
 *     or null.
 * @package
 * @override
 */
Blockly.BlockSvg.prototype.lastConnectionInStack = function(ignoreShadows) {
  return /** @type {Blockly.RenderedConnection} */ (
    Blockly.BlockSvg.superClass_
        .lastConnectionInStack.call(this, ignoreShadows));
};

/**
 * Find the connection on this block that corresponds to the given connection
 * on the other block.
 * Used to match connections between a block and its insertion marker.
 * @param {!Blockly.Block} otherBlock The other block to match against.
 * @param {!Blockly.Connection} conn The other connection to match.
 * @return {?Blockly.RenderedConnection} The matching connection on this block,
 *     or null.
 * @package
 * @override
 */
Blockly.BlockSvg.prototype.getMatchingConnection = function(otherBlock, conn) {
  return /** @type {Blockly.RenderedConnection} */ (
    Blockly.BlockSvg.superClass_.getMatchingConnection.call(this,
        otherBlock, conn));
};

/**
 * Create a connection of the specified type.
 * @param {number} type The type of the connection to create.
 * @return {!Blockly.RenderedConnection} A new connection of the specified type.
 * @protected
 */
Blockly.BlockSvg.prototype.makeConnection_ = function(type) {
  return new Blockly.RenderedConnection(this, type);
};

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 */
Blockly.BlockSvg.prototype.bumpNeighbours = function() {
  if (!this.workspace) {
    return;  // Deleted block.
  }
  if (this.workspace.isDragging()) {
    return;  // Don't bump blocks during a drag.
  }
  var rootBlock = this.getRootBlock();
  if (rootBlock.isInFlyout) {
    return;  // Don't move blocks around in a flyout.
  }
  // Loop through every connection on this block.
  var myConnections = this.getConnections_(false);
  for (var i = 0, connection; (connection = myConnections[i]); i++) {

    // Spider down from this block bumping all sub-blocks.
    if (connection.isConnected() && connection.isSuperior()) {
      connection.targetBlock().bumpNeighbours();
    }

    var neighbours = connection.neighbours(Blockly.SNAP_RADIUS);
    for (var j = 0, otherConnection; (otherConnection = neighbours[j]); j++) {

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
Blockly.BlockSvg.prototype.scheduleSnapAndBump = function() {
  var block = this;
  // Ensure that any snap and bump are part of this move's event group.
  var group = Blockly.Events.getGroup();

  setTimeout(function() {
    Blockly.Events.setGroup(group);
    block.snapToGrid();
    Blockly.Events.setGroup(false);
  }, Blockly.BUMP_DELAY / 2);

  setTimeout(function() {
    Blockly.Events.setGroup(group);
    block.bumpNeighbours();
    Blockly.Events.setGroup(false);
  }, Blockly.BUMP_DELAY);
};

/**
 * Position a block so that it doesn't move the target block when connected.
 * The block to position is usually either the first block in a dragged stack or
 * an insertion marker.
 * @param {!Blockly.RenderedConnection} sourceConnection The connection on the
 *     moving block's stack.
 * @param {!Blockly.RenderedConnection} targetConnection The connection that
 *     should stay stationary as this block is positioned.
 * @package
 */
Blockly.BlockSvg.prototype.positionNearConnection = function(sourceConnection,
    targetConnection) {
  // We only need to position the new block if it's before the existing one,
  // otherwise its position is set by the previous block.
  if (sourceConnection.type == Blockly.connectionTypes.NEXT_STATEMENT ||
      sourceConnection.type == Blockly.connectionTypes.INPUT_VALUE) {
    var dx = targetConnection.x - sourceConnection.x;
    var dy = targetConnection.y - sourceConnection.y;

    this.moveBy(dx, dy);
  }
};

/**
 * Return the parent block or null if this block is at the top level.
 * @return {?Blockly.BlockSvg} The block (if any) that holds the current block.
 * @override
 */
Blockly.BlockSvg.prototype.getParent = function() {
  return /** @type {!Blockly.BlockSvg} */ (
    Blockly.BlockSvg.superClass_.getParent.call(this));
};

/**
 * Return the top-most block in this block's tree.
 * This will return itself if this block is at the top level.
 * @return {!Blockly.BlockSvg} The root block.
 * @override
 */
Blockly.BlockSvg.prototype.getRootBlock = function() {
  return /** @type {!Blockly.BlockSvg} */ (
    Blockly.BlockSvg.superClass_.getRootBlock.call(this));
};

/**
 * Lays out and reflows a block based on its contents and settings.
 * @param {boolean=} opt_bubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
Blockly.BlockSvg.prototype.render = function(opt_bubble) {
  if (this.renderIsInProgress_) {
    return;  // Don't allow recursive renders.
  }
  this.renderIsInProgress_ = true;
  try {
    this.rendered = true;
    Blockly.utils.dom.startTextWidthCache();

    if (this.isCollapsed()) {
      this.updateCollapsed_();
    }
    this.workspace.getRenderer().render(this);
    this.updateConnectionLocations_();

    if (opt_bubble !== false) {
      var parentBlock = this.getParent();
      if (parentBlock) {
        parentBlock.render(true);
      } else {
        // Top-most block. Fire an event to allow scrollbars to resize.
        this.workspace.resizeContents();
      }
    }

    Blockly.utils.dom.stopTextWidthCache();
    this.updateMarkers_();
  } finally {
    this.renderIsInProgress_ = false;
  }
};

/**
 * Redraw any attached marker or cursor svgs if needed.
 * @protected
 */
Blockly.BlockSvg.prototype.updateMarkers_ = function() {
  if (this.workspace.keyboardAccessibilityMode && this.pathObject.cursorSvg) {
    this.workspace.getCursor().draw();
  }
  if (this.workspace.keyboardAccessibilityMode && this.pathObject.markerSvg) {
    // TODO(#4592): Update all markers on the block.
    this.workspace.getMarker(Blockly.MarkerManager.LOCAL_MARKER).draw();
  }
};

/**
 * Update all of the connections on this block with the new locations calculated
 * during rendering.  Also move all of the connected blocks based on the new
 * connection locations.
 * @private
 */
Blockly.BlockSvg.prototype.updateConnectionLocations_ = function() {
  var blockTL = this.getRelativeToSurfaceXY();
  // Don't tighten previous or output connections because they are inferior
  // connections.
  if (this.previousConnection) {
    this.previousConnection.moveToOffset(blockTL);
  }
  if (this.outputConnection) {
    this.outputConnection.moveToOffset(blockTL);
  }

  for (var i = 0; i < this.inputList.length; i++) {
    var conn = this.inputList[i].connection;
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
Blockly.BlockSvg.prototype.setCursorSvg = function(cursorSvg) {
  this.pathObject.setCursorSvg(cursorSvg);
};

/**
 * Add the marker SVG to this block's SVG group.
 * @param {SVGElement} markerSvg The SVG root of the marker to be added to the
 *     block SVG group.
 * @package
 */
Blockly.BlockSvg.prototype.setMarkerSvg = function(markerSvg) {
  this.pathObject.setMarkerSvg(markerSvg);
};

/**
 * Returns a bounding box describing the dimensions of this block
 * and any blocks stacked below it.
 * @return {!{height: number, width: number}} Object with height and width
 *    properties in workspace units.
 * @package
 */
Blockly.BlockSvg.prototype.getHeightWidth = function() {
  var height = this.height;
  var width = this.width;
  // Recursively add size of subsequent blocks.
  var nextBlock = this.getNextBlock();
  if (nextBlock) {
    var nextHeightWidth = nextBlock.getHeightWidth();
    var workspace = /** @type {!Blockly.WorkspaceSvg} */ (this.workspace);
    var tabHeight = workspace.getRenderer().getConstants().NOTCH_HEIGHT;
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
Blockly.BlockSvg.prototype.fadeForReplacement = function(add) {
  this.pathObject.updateReplacementFade(add);
};

/**
 * Visual effect to show that if the dragging block is dropped it will connect
 * to this input.
 * @param {Blockly.Connection} conn The connection on the input to highlight.
 * @param {boolean} add True if highlighting should be added.
 * @package
 */
Blockly.BlockSvg.prototype.highlightShapeForInput = function(conn, add) {
  this.pathObject.updateShapeForInputHighlight(conn, add);
};
