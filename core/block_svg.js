/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.BlockSvg');

goog.require('Blockly.Block');
goog.require('Blockly.ContextMenu');
goog.require('Blockly.Touch');
goog.require('Blockly.RenderedConnection');
goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.userAgent');


/**
 * Class for a block's SVG representation.
 * Not normally called directly, workspace.newBlock() is preferred.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @extends {Blockly.Block}
 * @constructor
 */
Blockly.BlockSvg = function(workspace, prototypeName, opt_id) {
  // Create core elements for the block.
  /**
   * @type {SVGElement}
   * @private
   */
  this.svgGroup_ = Blockly.utils.createSvgElement('g', {}, null);

  /**
   * @type {SVGElement}
   * @private
   */
  this.svgPathDark_ = Blockly.utils.createSvgElement('path',
      {'class': 'blocklyPathDark', 'transform': 'translate(1,1)'},
      this.svgGroup_);

  /**
   * @type {SVGElement}
   * @private
   */
  this.svgPath_ = Blockly.utils.createSvgElement('path', {'class': 'blocklyPath'},
      this.svgGroup_);

  /**
   * @type {SVGElement}
   * @private
   */
  this.svgPathLight_ = Blockly.utils.createSvgElement('path',
      {'class': 'blocklyPathLight'}, this.svgGroup_);
  this.svgPath_.tooltip = this;

  /** @type {boolean} */
  this.rendered = false;

  /**
   * Whether to move the block to the drag surface when it is dragged.
   * True if it should move, false if it should be translated directly.
   * @type {boolean}
   * @private
   */
  this.useDragSurface_ = Blockly.utils.is3dSupported() && workspace.blockDragSurface_;

  Blockly.Tooltip.bindMouseEvents(this.svgPath_);
  Blockly.BlockSvg.superClass_.constructor.call(this,
      workspace, prototypeName, opt_id);
};
goog.inherits(Blockly.BlockSvg, Blockly.Block);

/**
 * Height of this block, not including any statement blocks above or below.
 */
Blockly.BlockSvg.prototype.height = 0;
/**
 * Width of this block, including any connected value blocks.
 */
Blockly.BlockSvg.prototype.width = 0;

/**
 * Original location of block being dragged.
 * @type {goog.math.Coordinate}
 * @private
 */
Blockly.BlockSvg.prototype.dragStartXY_ = null;

/**
 * Constant for identifying rows that are to be rendered inline.
 * Don't collide with Blockly.INPUT_VALUE and friends.
 * @const
 */
Blockly.BlockSvg.INLINE = -1;

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 */
Blockly.BlockSvg.prototype.initSvg = function() {
  goog.asserts.assert(this.workspace.rendered, 'Workspace is headless.');
  for (var i = 0, input; input = this.inputList[i]; i++) {
    input.init();
  }
  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].createIcon();
  }
  this.updateColour();
  this.updateMovable();
  if (!this.workspace.options.readOnly && !this.eventsInit_) {
    Blockly.bindEventWithChecks_(this.getSvgRoot(), 'mousedown', this,
                       this.onMouseDown_);
    var thisBlock = this;
    Blockly.bindEvent_(this.getSvgRoot(), 'touchstart', null,
                       function(e) {Blockly.longStart_(e, thisBlock);});
  }
  this.eventsInit_ = true;

  if (!this.getSvgRoot().parentNode) {
    this.workspace.getCanvas().appendChild(this.getSvgRoot());
  }
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
  var event = new Blockly.Events.Ui(null, 'selected', oldId, this.id);
  event.workspaceId = this.workspace.id;
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
  var event = new Blockly.Events.Ui(null, 'selected', this.id, null);
  event.workspaceId = this.workspace.id;
  Blockly.Events.fire(event);
  Blockly.selected = null;
  this.removeSelect();
};

/**
 * Block's mutator icon (if any).
 * @type {Blockly.Mutator}
 */
Blockly.BlockSvg.prototype.mutator = null;

/**
 * Block's comment icon (if any).
 * @type {Blockly.Comment}
 */
Blockly.BlockSvg.prototype.comment = null;

/**
 * Block's warning icon (if any).
 * @type {Blockly.Warning}
 */
Blockly.BlockSvg.prototype.warning = null;

/**
 * Returns a list of mutator, comment, and warning icons.
 * @return {!Array} List of icons.
 */
Blockly.BlockSvg.prototype.getIcons = function() {
  var icons = [];
  if (this.mutator) {
    icons.push(this.mutator);
  }
  if (this.comment) {
    icons.push(this.comment);
  }
  if (this.warning) {
    icons.push(this.warning);
  }
  return icons;
};

/**
 * Wrapper function called when a mouseUp occurs during a drag operation.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.BlockSvg.onMouseUpWrapper_ = null;

/**
 * Wrapper function called when a mouseMove occurs during a drag operation.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.BlockSvg.onMouseMoveWrapper_ = null;

/**
 * Stop binding to the global mouseup and mousemove events.
 * @package
 */
Blockly.BlockSvg.terminateDrag = function() {
  Blockly.BlockSvg.disconnectUiStop_();
  if (Blockly.BlockSvg.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.BlockSvg.onMouseUpWrapper_);
    Blockly.BlockSvg.onMouseUpWrapper_ = null;
  }
  if (Blockly.BlockSvg.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.BlockSvg.onMouseMoveWrapper_);
    Blockly.BlockSvg.onMouseMoveWrapper_ = null;
  }
  var selected = Blockly.selected;
  if (Blockly.dragMode_ == Blockly.DRAG_FREE) {
    // Terminate a drag operation.
    if (selected) {
      // Update the connection locations.
      var xy = selected.getRelativeToSurfaceXY();
      var dxy = goog.math.Coordinate.difference(xy, selected.dragStartXY_);
      var event = new Blockly.Events.Move(selected);
      event.oldCoordinate = selected.dragStartXY_;
      event.recordNew();
      Blockly.Events.fire(event);

      selected.moveConnections_(dxy.x, dxy.y);
      delete selected.draggedBubbles_;
      selected.setDragging_(false);
      selected.moveOffDragSurface_();
      selected.render();
      selected.workspace.setResizesEnabled(true);
      // Ensure that any snap and bump are part of this move's event group.
      var group = Blockly.Events.getGroup();
      setTimeout(function() {
        Blockly.Events.setGroup(group);
        selected.snapToGrid();
        Blockly.Events.setGroup(false);
      }, Blockly.BUMP_DELAY / 2);
      setTimeout(function() {
        Blockly.Events.setGroup(group);
        selected.bumpNeighbours_();
        Blockly.Events.setGroup(false);
      }, Blockly.BUMP_DELAY);
    }
  }
  Blockly.dragMode_ = Blockly.DRAG_NONE;
  Blockly.Css.setCursor(Blockly.Css.Cursor.OPEN);
};

/**
 * Set parent of this block to be a new block or null.
 * @param {Blockly.BlockSvg} newParent New parent block.
 */
Blockly.BlockSvg.prototype.setParent = function(newParent) {
  if (newParent == this.parentBlock_) {
    return;
  }
  var svgRoot = this.getSvgRoot();
  if (this.parentBlock_ && svgRoot) {
    // Move this block up the DOM.  Keep track of x/y translations.
    var xy = this.getRelativeToSurfaceXY();
    this.workspace.getCanvas().appendChild(svgRoot);
    svgRoot.setAttribute('transform', 'translate(' + xy.x + ',' + xy.y + ')');
  }

  Blockly.Field.startCache();
  Blockly.BlockSvg.superClass_.setParent.call(this, newParent);
  Blockly.Field.stopCache();

  if (newParent) {
    var oldXY = this.getRelativeToSurfaceXY();
    newParent.getSvgRoot().appendChild(svgRoot);
    var newXY = this.getRelativeToSurfaceXY();
    // Move the connections to match the child's new position.
    this.moveConnections_(newXY.x - oldXY.x, newXY.y - oldXY.y);
  }
};

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's origin (0,0).
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 */
Blockly.BlockSvg.prototype.getRelativeToSurfaceXY = function() {
  var x = 0;
  var y = 0;

  var dragSurfaceGroup = this.useDragSurface_ ?
      this.workspace.blockDragSurface_.getGroup() : null;

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
          this.workspace.blockDragSurface_.getCurrentBlock() == element) {
        var surfaceTranslation = this.workspace.blockDragSurface_.getSurfaceTranslation();
        x += surfaceTranslation.x;
        y += surfaceTranslation.y;
      }
      element = element.parentNode;
    } while (element && element != this.workspace.getCanvas() &&
        element != dragSurfaceGroup);
  }
  return new goog.math.Coordinate(x, y);
};

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset.
 * @param {number} dy Vertical offset.
 */
Blockly.BlockSvg.prototype.moveBy = function(dx, dy) {
  goog.asserts.assert(!this.parentBlock_, 'Block has parent.');
  var event = new Blockly.Events.Move(this);
  var xy = this.getRelativeToSurfaceXY();
  this.translate(xy.x + dx, xy.y + dy);
  this.moveConnections_(dx, dy);
  event.recordNew();
  this.workspace.resizeContents();
  Blockly.Events.fire(event);
};

/**
 * Transforms a block by setting the translation on the transform attribute
 * of the block's SVG.
 * @param {number} x The x coordinate of the translation.
 * @param {number} y The y coordinate of the translation.
 */
Blockly.BlockSvg.prototype.translate = function(x, y) {
  this.getSvgRoot().setAttribute('transform',
      'translate(' + x + ',' + y + ')');
};

/**
 * Move this block to its workspace's drag surface, accounting for positioning.
 * Generally should be called at the same time as setDragging_(true).
 * Does nothing if useDragSurface_ is false.
 * @private
 */
Blockly.BlockSvg.prototype.moveToDragSurface_ = function() {
  if (!this.useDragSurface_) {
    return;
  }
  // The translation for drag surface blocks,
  // is equal to the current relative-to-surface position,
  // to keep the position in sync as it move on/off the surface.
  var xy = this.getRelativeToSurfaceXY();
  this.clearTransformAttributes_();
  this.workspace.blockDragSurface_.translateSurface(xy.x, xy.y);
  // Execute the move on the top-level SVG component
  this.workspace.blockDragSurface_.setBlocksAndShow(this.getSvgRoot());
};

/**
 * Move this block back to the workspace block canvas.
 * Generally should be called at the same time as setDragging_(false).
 * Does nothing if useDragSurface_ is false.
 * @private
 */
Blockly.BlockSvg.prototype.moveOffDragSurface_ = function() {
  if (!this.useDragSurface_) {
    return;
  }
  // Translate to current position, turning off 3d.
  var xy = this.getRelativeToSurfaceXY();
  this.clearTransformAttributes_();
  this.translate(xy.x, xy.y);
  this.workspace.blockDragSurface_.clearAndHide(this.workspace.getCanvas());
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
  if (Blockly.dragMode_ != Blockly.DRAG_NONE) {
    return;  // Don't bump blocks during a drag.
  }
  if (this.getParent()) {
    return;  // Only snap top-level blocks.
  }
  if (this.isInFlyout) {
    return;  // Don't move blocks around in a flyout.
  }
  if (!this.workspace.options.gridOptions ||
      !this.workspace.options.gridOptions['snap']) {
    return;  // Config says no snapping.
  }
  var spacing = this.workspace.options.gridOptions['spacing'];
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
 * Returns a bounding box describing the dimensions of this block
 * and any blocks stacked below it.
 * @return {!{height: number, width: number}} Object with height and width
 *    properties.
 */
Blockly.BlockSvg.prototype.getHeightWidth = function() {
  var height = this.height;
  var width = this.width;
  // Recursively add size of subsequent blocks.
  var nextBlock = this.getNextBlock();
  if (nextBlock) {
    var nextHeightWidth = nextBlock.getHeightWidth();
    height += nextHeightWidth.height - 4;  // Height of tab.
    width = Math.max(width, nextHeightWidth.width);
  } else if (!this.nextConnection && !this.outputConnection) {
    // Add a bit of margin under blocks with no bottom tab.
    height += 2;
  }
  return {height: height, width: width};
};

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * block and any blocks stacked below it.
 * @return {!{topLeft: goog.math.Coordinate, bottomRight: goog.math.Coordinate}}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
Blockly.BlockSvg.prototype.getBoundingRectangle = function() {
  var blockXY = this.getRelativeToSurfaceXY(this);
  var tab = this.outputConnection ? Blockly.BlockSvg.TAB_WIDTH : 0;
  var blockBounds = this.getHeightWidth();
  var topLeft;
  var bottomRight;
  if (this.RTL) {
    // Width has the tab built into it already so subtract it here.
    topLeft = new goog.math.Coordinate(blockXY.x - (blockBounds.width - tab),
        blockXY.y);
    // Add the width of the tab/puzzle piece knob to the x coordinate
    // since X is the corner of the rectangle, not the whole puzzle piece.
    bottomRight = new goog.math.Coordinate(blockXY.x + tab,
        blockXY.y + blockBounds.height);
  } else {
    // Subtract the width of the tab/puzzle piece knob to the x coordinate
    // since X is the corner of the rectangle, not the whole puzzle piece.
    topLeft = new goog.math.Coordinate(blockXY.x - tab, blockXY.y);
    // Width has the tab built into it already so subtract it here.
    bottomRight = new goog.math.Coordinate(blockXY.x + blockBounds.width - tab,
        blockXY.y + blockBounds.height);
  }
  return {topLeft: topLeft, bottomRight: bottomRight};
};

/**
 * Set whether the block is collapsed or not.
 * @param {boolean} collapsed True if collapsed.
 */
Blockly.BlockSvg.prototype.setCollapsed = function(collapsed) {
  if (this.collapsed_ == collapsed) {
    return;
  }
  var renderList = [];
  // Show/hide the inputs.
  for (var i = 0, input; input = this.inputList[i]; i++) {
    renderList.push.apply(renderList, input.setVisible(!collapsed));
  }

  var COLLAPSED_INPUT_NAME = '_TEMP_COLLAPSED_INPUT';
  if (collapsed) {
    var icons = this.getIcons();
    for (var i = 0; i < icons.length; i++) {
      icons[i].setVisible(false);
    }
    var text = this.toString(Blockly.COLLAPSE_CHARS);
    this.appendDummyInput(COLLAPSED_INPUT_NAME).appendField(text).init();
  } else {
    this.removeInput(COLLAPSED_INPUT_NAME);
    // Clear any warnings inherited from enclosed blocks.
    this.setWarningText(null);
  }
  Blockly.BlockSvg.superClass_.setCollapsed.call(this, collapsed);

  if (!renderList.length) {
    // No child blocks, just render this block.
    renderList[0] = this;
  }
  if (this.rendered) {
    for (var i = 0, block; block = renderList[i]; i++) {
      block.render();
    }
    // Don't bump neighbours.
    // Although bumping neighbours would make sense, users often collapse
    // all their functions and store them next to each other.  Expanding and
    // bumping causes all their definitions to go out of alignment.
  }
};

/**
 * Open the next (or previous) FieldTextInput.
 * @param {Blockly.Field|Blockly.Block} start Current location.
 * @param {boolean} forward If true go forward, otherwise backward.
 */
Blockly.BlockSvg.prototype.tab = function(start, forward) {
  // This function need not be efficient since it runs once on a keypress.
  // Create an ordered list of all text fields and connected inputs.
  var list = [];
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof Blockly.FieldTextInput) {
        // TODO: Also support dropdown fields.
        list.push(field);
      }
    }
    if (input.connection) {
      var block = input.connection.targetBlock();
      if (block) {
        list.push(block);
      }
    }
  }
  var i = list.indexOf(start);
  if (i == -1) {
    // No start location, start at the beginning or end.
    i = forward ? -1 : list.length;
  }
  var target = list[forward ? i + 1 : i - 1];
  if (!target) {
    // Ran off of list.
    var parent = this.getParent();
    if (parent) {
      parent.tab(this, forward);
    }
  } else if (target instanceof Blockly.Field) {
    target.showEditor_();
  } else {
    target.tab(null, forward);
  }
};

/**
 * Handle a mouse-down on an SVG block.
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
Blockly.BlockSvg.prototype.onMouseDown_ = function(e) {
  if (this.workspace.options.readOnly) {
    return;
  }
  if (this.isInFlyout) {
    // longStart's simulation of right-clicks for longpresses on touch devices
    // calls the onMouseDown_ function defined on the prototype of the object
    // the was longpressed (in this case, a Blockly.BlockSvg).  In this case
    // that behaviour is wrong, because Blockly.Flyout.prototype.blockMouseDown
    // should be called for a mousedown on a block in the flyout, which blocks
    // execution of the block's onMouseDown_ function.
    if (e.type == 'touchstart' && Blockly.utils.isRightButton(e)) {
      Blockly.Flyout.blockRightClick_(e, this);
      e.stopPropagation();
      e.preventDefault();
    }
    return;
  }
  if (this.isInMutator) {
    // Mutator's coordinate system could be out of date because the bubble was
    // dragged, the block was moved, the parent workspace zoomed, etc.
    this.workspace.resize();
  }

  this.workspace.updateScreenCalculationsIfScrolled();
  this.workspace.markFocused();
  Blockly.terminateDrag_();
  this.select();
  Blockly.hideChaff();
  if (Blockly.utils.isRightButton(e)) {
    // Right-click.
    this.showContextMenu_(e);
    // Click, not drag, so stop waiting for other touches from this identifier.
    Blockly.Touch.clearTouchIdentifier();
  } else if (!this.isMovable()) {
    // Allow immovable blocks to be selected and context menued, but not
    // dragged.  Let this event bubble up to document, so the workspace may be
    // dragged instead.
    return;
  } else {
    if (!Blockly.Events.getGroup()) {
      Blockly.Events.setGroup(true);
    }
    // Left-click (or middle click)
    Blockly.Css.setCursor(Blockly.Css.Cursor.CLOSED);

    this.dragStartXY_ = this.getRelativeToSurfaceXY();
    this.workspace.startDrag(e, this.dragStartXY_);

    Blockly.dragMode_ = Blockly.DRAG_STICKY;
    Blockly.BlockSvg.onMouseUpWrapper_ = Blockly.bindEventWithChecks_(document,
        'mouseup', this, this.onMouseUp_);
    Blockly.BlockSvg.onMouseMoveWrapper_ = Blockly.bindEventWithChecks_(
        document, 'mousemove', this, this.onMouseMove_);
    // Build a list of bubbles that need to be moved and where they started.
    this.draggedBubbles_ = [];
    var descendants = this.getDescendants();
    for (var i = 0, descendant; descendant = descendants[i]; i++) {
      var icons = descendant.getIcons();
      for (var j = 0; j < icons.length; j++) {
        var data = icons[j].getIconLocation();
        data.bubble = icons[j];
        this.draggedBubbles_.push(data);
      }
    }
  }
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
  e.preventDefault();
};

/**
 * Handle a mouse-up anywhere in the SVG pane.  Is only registered when a
 * block is clicked.  We can't use mouseUp on the block since a fast-moving
 * cursor can briefly escape the block before it catches up.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.BlockSvg.prototype.onMouseUp_ = function(e) {
  Blockly.Touch.clearTouchIdentifier();
  if (Blockly.dragMode_ != Blockly.DRAG_FREE &&
      !Blockly.WidgetDiv.isVisible()) {
    Blockly.Events.fire(
        new Blockly.Events.Ui(this, 'click', undefined, undefined));
  }
  Blockly.terminateDrag_();

  var deleteArea = this.workspace.isDeleteArea(e);

  // Connect to a nearby block, but not if it's over the toolbox.
  if (Blockly.selected && Blockly.highlightedConnection_ &&
      deleteArea != Blockly.DELETE_AREA_TOOLBOX) {
    // Connect two blocks together.
    Blockly.localConnection_.connect(Blockly.highlightedConnection_);
    if (this.rendered) {
      // Trigger a connection animation.
      // Determine which connection is inferior (lower in the source stack).
      var inferiorConnection = Blockly.localConnection_.isSuperior() ?
          Blockly.highlightedConnection_ : Blockly.localConnection_;
      inferiorConnection.getSourceBlock().connectionUiEffect();
    }
    if (this.workspace.trashcan) {
      // Don't throw an object in the trash can if it just got connected.
      this.workspace.trashcan.close();
    }
  } else if (deleteArea && !this.getParent() && Blockly.selected.isDeletable()) {
    // We didn't connect the block, and it was over the trash can or the
    // toolbox.  Delete it.
    var trashcan = this.workspace.trashcan;
    if (trashcan) {
      goog.Timer.callOnce(trashcan.close, 100, trashcan);
    }
    Blockly.selected.dispose(false, true);
  }
  if (Blockly.highlightedConnection_) {
    Blockly.highlightedConnection_.unhighlight();
    Blockly.highlightedConnection_ = null;
  }
  Blockly.Css.setCursor(Blockly.Css.Cursor.OPEN);
  if (!Blockly.WidgetDiv.isVisible()) {
    Blockly.Events.setGroup(false);
  }
};

/**
 * Load the block's help page in a new window.
 * @private
 */
Blockly.BlockSvg.prototype.showHelp_ = function() {
  var url = goog.isFunction(this.helpUrl) ? this.helpUrl() : this.helpUrl;
  if (url) {
    window.open(url);
  }
};

/**
 * Show the context menu for this block.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.BlockSvg.prototype.showContextMenu_ = function(e) {
  if (this.workspace.options.readOnly || !this.contextMenu) {
    return;
  }
  // Save the current block in a variable for use in closures.
  var block = this;
  var menuOptions = [];

  if (this.isDeletable() && this.isMovable() && !block.isInFlyout) {
    // Option to duplicate this block.
    var duplicateOption = {
      text: Blockly.Msg.DUPLICATE_BLOCK,
      enabled: true,
      callback: function() {
        Blockly.duplicate_(block);
      }
    };
    if (this.getDescendants().length > this.workspace.remainingCapacity()) {
      duplicateOption.enabled = false;
    }
    menuOptions.push(duplicateOption);

    if (this.isEditable() && !this.collapsed_ &&
        this.workspace.options.comments) {
      // Option to add/remove a comment.
      var commentOption = {enabled: !goog.userAgent.IE};
      if (this.comment) {
        commentOption.text = Blockly.Msg.REMOVE_COMMENT;
        commentOption.callback = function() {
          block.setCommentText(null);
        };
      } else {
        commentOption.text = Blockly.Msg.ADD_COMMENT;
        commentOption.callback = function() {
          block.setCommentText('');
        };
      }
      menuOptions.push(commentOption);
    }

    // Option to make block inline.
    if (!this.collapsed_) {
      for (var i = 1; i < this.inputList.length; i++) {
        if (this.inputList[i - 1].type != Blockly.NEXT_STATEMENT &&
            this.inputList[i].type != Blockly.NEXT_STATEMENT) {
          // Only display this option if there are two value or dummy inputs
          // next to each other.
          var inlineOption = {enabled: true};
          var isInline = this.getInputsInline();
          inlineOption.text = isInline ?
              Blockly.Msg.EXTERNAL_INPUTS : Blockly.Msg.INLINE_INPUTS;
          inlineOption.callback = function() {
            block.setInputsInline(!isInline);
          };
          menuOptions.push(inlineOption);
          break;
        }
      }
    }

    if (this.workspace.options.collapse) {
      // Option to collapse/expand block.
      if (this.collapsed_) {
        var expandOption = {enabled: true};
        expandOption.text = Blockly.Msg.EXPAND_BLOCK;
        expandOption.callback = function() {
          block.setCollapsed(false);
        };
        menuOptions.push(expandOption);
      } else {
        var collapseOption = {enabled: true};
        collapseOption.text = Blockly.Msg.COLLAPSE_BLOCK;
        collapseOption.callback = function() {
          block.setCollapsed(true);
        };
        menuOptions.push(collapseOption);
      }
    }

    if (this.workspace.options.disable) {
      // Option to disable/enable block.
      var disableOption = {
        text: this.disabled ?
            Blockly.Msg.ENABLE_BLOCK : Blockly.Msg.DISABLE_BLOCK,
        enabled: !this.getInheritedDisabled(),
        callback: function() {
          block.setDisabled(!block.disabled);
        }
      };
      menuOptions.push(disableOption);
    }

    // Option to delete this block.
    // Count the number of blocks that are nested in this block.
    var descendantCount = this.getDescendants().length;
    var nextBlock = this.getNextBlock();
    if (nextBlock) {
      // Blocks in the current stack would survive this block's deletion.
      descendantCount -= nextBlock.getDescendants().length;
    }
    var deleteOption = {
      text: descendantCount == 1 ? Blockly.Msg.DELETE_BLOCK :
          Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(descendantCount)),
      enabled: true,
      callback: function() {
        Blockly.Events.setGroup(true);
        block.dispose(true, true);
        Blockly.Events.setGroup(false);
      }
    };
    menuOptions.push(deleteOption);
  }

  // Option to get help.
  var url = goog.isFunction(this.helpUrl) ? this.helpUrl() : this.helpUrl;
  var helpOption = {enabled: !!url};
  helpOption.text = Blockly.Msg.HELP;
  helpOption.callback = function() {
    block.showHelp_();
  };
  menuOptions.push(helpOption);

  // Allow the block to add or modify menuOptions.
  if (this.customContextMenu && !block.isInFlyout) {
    this.customContextMenu(menuOptions);
  }

  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
  Blockly.ContextMenu.currentBlock = this;
};

/**
 * Move the connections for this block and all blocks attached under it.
 * Also update any attached bubbles.
 * @param {number} dx Horizontal offset from current location.
 * @param {number} dy Vertical offset from current location.
 * @private
 */
Blockly.BlockSvg.prototype.moveConnections_ = function(dx, dy) {
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
    this.childBlocks_[i].moveConnections_(dx, dy);
  }
};

/**
 * Recursively adds or removes the dragging class to this node and its children.
 * @param {boolean} adding True if adding, false if removing.
 * @private
 */
Blockly.BlockSvg.prototype.setDragging_ = function(adding) {
  if (adding) {
    var group = this.getSvgRoot();
    group.translate_ = '';
    group.skew_ = '';
    Blockly.draggingConnections_ =
        Blockly.draggingConnections_.concat(this.getConnections_(true));
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
                      'blocklyDragging');
  } else {
    Blockly.draggingConnections_ = [];
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
                         'blocklyDragging');
  }
  // Recurse through all blocks attached under this one.
  for (var i = 0; i < this.childBlocks_.length; i++) {
    this.childBlocks_[i].setDragging_(adding);
  }
};

/**
 * Drag this block to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.BlockSvg.prototype.onMouseMove_ = function(e) {
  if (e.type == 'mousemove' && e.clientX <= 1 && e.clientY == 0 &&
      e.button == 0) {
    /* HACK:
     Safari Mobile 6.0 and Chrome for Android 18.0 fire rogue mousemove
     events on certain touch actions. Ignore events with these signatures.
     This may result in a one-pixel blind spot in other browsers,
     but this shouldn't be noticeable. */
    e.stopPropagation();
    return;
  }

  var oldXY = this.getRelativeToSurfaceXY();
  var newXY = this.workspace.moveDrag(e);

  if (Blockly.dragMode_ == Blockly.DRAG_STICKY) {
    // Still dragging within the sticky DRAG_RADIUS.
    var dr = goog.math.Coordinate.distance(oldXY, newXY) * this.workspace.scale;
    if (dr > Blockly.DRAG_RADIUS) {
      // Switch to unrestricted dragging.
      Blockly.dragMode_ = Blockly.DRAG_FREE;
      Blockly.longStop_();
      this.workspace.setResizesEnabled(false);

      var disconnectEffect = !!this.parentBlock_;
      // If in a stack, either split the stack, or pull out single block.
      var healStack = !Blockly.DRAG_STACK;
      if (e.altKey || e.ctrlKey || e.metaKey) {
        healStack = !healStack;
      }
      // Push this block to the very top of the stack.
      this.unplug(healStack);
      if (disconnectEffect) {
        var group = this.getSvgRoot();
        group.translate_ = 'translate(' + newXY.x + ',' + newXY.y + ')';
        this.disconnectUiEffect();
      }
      this.setDragging_(true);
      this.moveToDragSurface_();
    }
  }
  if (Blockly.dragMode_ == Blockly.DRAG_FREE) {
    // Unrestricted dragging.
    var dxy = goog.math.Coordinate.difference(oldXY, this.dragStartXY_);
    var group = this.getSvgRoot();
    if (this.useDragSurface_) {
      this.workspace.blockDragSurface_.translateSurface(newXY.x, newXY.y);
    } else {
      group.translate_ = 'translate(' + newXY.x + ',' + newXY.y + ')';
      group.setAttribute('transform', group.translate_ + group.skew_);
    }
    // Drag all the nested bubbles.
    for (var i = 0; i < this.draggedBubbles_.length; i++) {
      var commentData = this.draggedBubbles_[i];
      commentData.bubble.setIconLocation(
          goog.math.Coordinate.sum(commentData, dxy));
    }

    // Check to see if any of this block's connections are within range of
    // another block's connection.
    var myConnections = this.getConnections_(false);
    // Also check the last connection on this stack
    var lastOnStack = this.lastConnectionInStack_();
    if (lastOnStack && lastOnStack != this.nextConnection) {
      myConnections.push(lastOnStack);
    }
    var closestConnection = null;
    var localConnection = null;
    var radiusConnection = Blockly.SNAP_RADIUS;
    for (var i = 0; i < myConnections.length; i++) {
      var myConnection = myConnections[i];
      var neighbour = myConnection.closest(radiusConnection, dxy);
      if (neighbour.connection) {
        closestConnection = neighbour.connection;
        localConnection = myConnection;
        radiusConnection = neighbour.radius;
      }
    }

    // Remove connection highlighting if needed.
    if (Blockly.highlightedConnection_ &&
        Blockly.highlightedConnection_ != closestConnection) {
      Blockly.highlightedConnection_.unhighlight();
      Blockly.highlightedConnection_ = null;
      Blockly.localConnection_ = null;
    }

    var wouldDeleteBlock = this.updateCursor_(e, closestConnection);

    // Add connection highlighting if needed.
    if (!wouldDeleteBlock && closestConnection &&
        closestConnection != Blockly.highlightedConnection_) {
      closestConnection.highlight();
      Blockly.highlightedConnection_ = closestConnection;
      Blockly.localConnection_ = localConnection;
    }
  }
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
  e.preventDefault();
};

/**
 * Provide visual indication of whether the block will be deleted if
 * dropped here.
 * Prefer connecting over dropping into the trash can, but prefer dragging to
 * the toolbox over connecting to other blocks.
 * @param {!Event} e Mouse move event.
 * @param {Blockly.Connection} closestConnection The connection this block would
 *     potentially connect to if dropped here, or null.
 * @return {boolean} True if the block would be deleted if dropped here,
 *     otherwise false.
 * @private
 */
Blockly.BlockSvg.prototype.updateCursor_ = function(e, closestConnection) {
  var deleteArea = this.workspace.isDeleteArea(e);
  var wouldConnect = Blockly.selected && closestConnection &&
      deleteArea != Blockly.DELETE_AREA_TOOLBOX;
  var wouldDelete = deleteArea && !this.getParent() &&
      Blockly.selected.isDeletable();
  var showDeleteCursor = wouldDelete && !wouldConnect;

  if (showDeleteCursor) {
    Blockly.Css.setCursor(Blockly.Css.Cursor.DELETE);
    if (deleteArea == Blockly.DELETE_AREA_TRASH && this.workspace.trashcan) {
      this.workspace.trashcan.setOpen_(true);
    }
    return true;
  } else {
    Blockly.Css.setCursor(Blockly.Css.Cursor.CLOSED);
    if (this.workspace.trashcan) {
      this.workspace.trashcan.setOpen_(false);
    }
    return false;
  }
};

/**
 * Add or remove the UI indicating if this block is movable or not.
 */
Blockly.BlockSvg.prototype.updateMovable = function() {
  if (this.isMovable()) {
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
                      'blocklyDraggable');
  } else {
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
                         'blocklyDraggable');
  }
};

/**
 * Set whether this block is movable or not.
 * @param {boolean} movable True if movable.
 */
Blockly.BlockSvg.prototype.setMovable = function(movable) {
  Blockly.BlockSvg.superClass_.setMovable.call(this, movable);
  this.updateMovable();
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
  this.updateColour();
};

/**
 * Return the root node of the SVG or null if none exists.
 * @return {Element} The root SVG node (probably a group).
 */
Blockly.BlockSvg.prototype.getSvgRoot = function() {
  return this.svgGroup_;
};

/**
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 * @param {boolean} animate If true, show a disposal animation and sound.
 */
Blockly.BlockSvg.prototype.dispose = function(healStack, animate) {
  if (!this.workspace) {
    // The block has already been deleted.
    return;
  }
  Blockly.Tooltip.hide();
  Blockly.Field.startCache();
  // Save the block's workspace temporarily so we can resize the
  // contents once the block is disposed.
  var blockWorkspace = this.workspace;
  // If this block is being dragged, unlink the mouse events.
  if (Blockly.selected == this) {
    this.unselect();
    Blockly.terminateDrag_();
  }
  // If this block has a context menu open, close it.
  if (Blockly.ContextMenu.currentBlock == this) {
    Blockly.ContextMenu.hide();
  }

  if (animate && this.rendered) {
    this.unplug(healStack);
    this.disposeUiEffect();
  }
  // Stop rerendering.
  this.rendered = false;

  Blockly.Events.disable();
  try {
    var icons = this.getIcons();
    for (var i = 0; i < icons.length; i++) {
      icons[i].dispose();
    }
  } finally {
    Blockly.Events.enable();
  }
  Blockly.BlockSvg.superClass_.dispose.call(this, healStack);

  goog.dom.removeNode(this.svgGroup_);
  blockWorkspace.resizeContents();
  // Sever JavaScript to DOM connections.
  this.svgGroup_ = null;
  this.svgPath_ = null;
  this.svgPathLight_ = null;
  this.svgPathDark_ = null;
  Blockly.Field.stopCache();
};

/**
 * Play some UI effects (sound, animation) when disposing of a block.
 */
Blockly.BlockSvg.prototype.disposeUiEffect = function() {
  this.workspace.playAudio('delete');

  var xy = this.workspace.getSvgXY(/** @type {!Element} */ (this.svgGroup_));
  // Deeply clone the current block.
  var clone = this.svgGroup_.cloneNode(true);
  clone.translateX_ = xy.x;
  clone.translateY_ = xy.y;
  clone.setAttribute('transform',
      'translate(' + clone.translateX_ + ',' + clone.translateY_ + ')');
  this.workspace.getParentSvg().appendChild(clone);
  clone.bBox_ = clone.getBBox();
  // Start the animation.
  Blockly.BlockSvg.disposeUiStep_(clone, this.RTL, new Date,
      this.workspace.scale);
};

/**
 * Animate a cloned block and eventually dispose of it.
 * This is a class method, not an instance method since the original block has
 * been destroyed and is no longer accessible.
 * @param {!Element} clone SVG element to animate and dispose of.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
Blockly.BlockSvg.disposeUiStep_ = function(clone, rtl, start, workspaceScale) {
  var ms = new Date - start;
  var percent = ms / 150;
  if (percent > 1) {
    goog.dom.removeNode(clone);
  } else {
    var x = clone.translateX_ +
        (rtl ? -1 : 1) * clone.bBox_.width * workspaceScale / 2 * percent;
    var y = clone.translateY_ + clone.bBox_.height * workspaceScale * percent;
    var scale = (1 - percent) * workspaceScale;
    clone.setAttribute('transform', 'translate(' + x + ',' + y + ')' +
        ' scale(' + scale + ')');
    var closure = function() {
      Blockly.BlockSvg.disposeUiStep_(clone, rtl, start, workspaceScale);
    };
    setTimeout(closure, 10);
  }
};

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 */
Blockly.BlockSvg.prototype.connectionUiEffect = function() {
  this.workspace.playAudio('click');
  if (this.workspace.scale < 1) {
    return;  // Too small to care about visual effects.
  }
  // Determine the absolute coordinates of the inferior block.
  var xy = this.workspace.getSvgXY(/** @type {!Element} */ (this.svgGroup_));
  // Offset the coordinates based on the two connection types, fix scale.
  if (this.outputConnection) {
    xy.x += (this.RTL ? 3 : -3) * this.workspace.scale;
    xy.y += 13 * this.workspace.scale;
  } else if (this.previousConnection) {
    xy.x += (this.RTL ? -23 : 23) * this.workspace.scale;
    xy.y += 3 * this.workspace.scale;
  }
  var ripple = Blockly.utils.createSvgElement('circle',
      {'cx': xy.x, 'cy': xy.y, 'r': 0, 'fill': 'none',
       'stroke': '#888', 'stroke-width': 10},
      this.workspace.getParentSvg());
  // Start the animation.
  Blockly.BlockSvg.connectionUiStep_(ripple, new Date, this.workspace.scale);
};

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
Blockly.BlockSvg.connectionUiStep_ = function(ripple, start, workspaceScale) {
  var ms = new Date - start;
  var percent = ms / 150;
  if (percent > 1) {
    goog.dom.removeNode(ripple);
  } else {
    ripple.setAttribute('r', percent * 25 * workspaceScale);
    ripple.style.opacity = 1 - percent;
    var closure = function() {
      Blockly.BlockSvg.connectionUiStep_(ripple, start, workspaceScale);
    };
    Blockly.BlockSvg.disconnectUiStop_.pid_ = setTimeout(closure, 10);
  }
};

/**
 * Play some UI effects (sound, animation) when disconnecting a block.
 */
Blockly.BlockSvg.prototype.disconnectUiEffect = function() {
  this.workspace.playAudio('disconnect');
  if (this.workspace.scale < 1) {
    return;  // Too small to care about visual effects.
  }
  // Horizontal distance for bottom of block to wiggle.
  var DISPLACEMENT = 10;
  // Scale magnitude of skew to height of block.
  var height = this.getHeightWidth().height;
  var magnitude = Math.atan(DISPLACEMENT / height) / Math.PI * 180;
  if (!this.RTL) {
    magnitude *= -1;
  }
  // Start the animation.
  Blockly.BlockSvg.disconnectUiStep_(this.svgGroup_, magnitude, new Date);
};

/**
 * Animate a brief wiggle of a disconnected block.
 * @param {!Element} group SVG element to animate.
 * @param {number} magnitude Maximum degrees skew (reversed for RTL).
 * @param {!Date} start Date of animation's start.
 * @private
 */
Blockly.BlockSvg.disconnectUiStep_ = function(group, magnitude, start) {
  var DURATION = 200;  // Milliseconds.
  var WIGGLES = 3;  // Half oscillations.

  var ms = new Date - start;
  var percent = ms / DURATION;

  if (percent > 1) {
    group.skew_ = '';
  } else {
    var skew = Math.round(Math.sin(percent * Math.PI * WIGGLES) *
        (1 - percent) * magnitude);
    group.skew_ = 'skewX(' + skew + ')';
    var closure = function() {
      Blockly.BlockSvg.disconnectUiStep_(group, magnitude, start);
    };
    Blockly.BlockSvg.disconnectUiStop_.group = group;
    Blockly.BlockSvg.disconnectUiStop_.pid = setTimeout(closure, 10);
  }
  group.setAttribute('transform', group.translate_ + group.skew_);
};

/**
 * Stop the disconnect UI animation immediately.
 * @private
 */
Blockly.BlockSvg.disconnectUiStop_ = function() {
  if (Blockly.BlockSvg.disconnectUiStop_.group) {
    clearTimeout(Blockly.BlockSvg.disconnectUiStop_.pid);
    var group = Blockly.BlockSvg.disconnectUiStop_.group;
    group.skew_ = '';
    group.setAttribute('transform', group.translate_);
    Blockly.BlockSvg.disconnectUiStop_.group = null;
  }
};

/**
 * PID of disconnect UI animation.  There can only be one at a time.
 * @type {number}
 */
Blockly.BlockSvg.disconnectUiStop_.pid = 0;

/**
 * SVG group of wobbling block.  There can only be one at a time.
 * @type {Element}
 */
Blockly.BlockSvg.disconnectUiStop_.group = null;

/**
 * Change the colour of a block.
 */
Blockly.BlockSvg.prototype.updateColour = function() {
  if (this.disabled) {
    // Disabled blocks don't have colour.
    return;
  }
  var hexColour = this.getColour();
  var rgb = goog.color.hexToRgb(hexColour);
  if (this.isShadow()) {
    rgb = goog.color.lighten(rgb, 0.6);
    hexColour = goog.color.rgbArrayToHex(rgb);
    this.svgPathLight_.style.display = 'none';
    this.svgPathDark_.setAttribute('fill', hexColour);
  } else {
    this.svgPathLight_.style.display = '';
    var hexLight = goog.color.rgbArrayToHex(goog.color.lighten(rgb, 0.3));
    var hexDark = goog.color.rgbArrayToHex(goog.color.darken(rgb, 0.2));
    this.svgPathLight_.setAttribute('stroke', hexLight);
    this.svgPathDark_.setAttribute('fill', hexDark);
  }
  this.svgPath_.setAttribute('fill', hexColour);

  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].updateColour();
  }

  // Bump every dropdown to change its colour.
  for (var x = 0, input; input = this.inputList[x]; x++) {
    for (var y = 0, field; field = input.fieldRow[y]; y++) {
      field.setText(null);
    }
  }
};

/**
 * Enable or disable a block.
 */
Blockly.BlockSvg.prototype.updateDisabled = function() {
  if (this.disabled || this.getInheritedDisabled()) {
    if (Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
                      'blocklyDisabled')) {
      this.svgPath_.setAttribute('fill',
          'url(#' + this.workspace.options.disabledPatternId + ')');
    }
  } else {
    if (Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
                         'blocklyDisabled')) {
      this.updateColour();
    }
  }
  var children = this.getChildren();
  for (var i = 0, child; child = children[i]; i++) {
    child.updateDisabled();
  }
};

/**
 * Returns the comment on this block (or '' if none).
 * @return {string} Block's comment.
 */
Blockly.BlockSvg.prototype.getCommentText = function() {
  if (this.comment) {
    var comment = this.comment.getText();
    // Trim off trailing whitespace.
    return comment.replace(/\s+$/, '').replace(/ +\n/g, '\n');
  }
  return '';
};

/**
 * Set this block's comment text.
 * @param {?string} text The text, or null to delete.
 */
Blockly.BlockSvg.prototype.setCommentText = function(text) {
  var changedState = false;
  if (goog.isString(text)) {
    if (!this.comment) {
      this.comment = new Blockly.Comment(this);
      changedState = true;
    }
    this.comment.setText(/** @type {string} */ (text));
  } else {
    if (this.comment) {
      this.comment.dispose();
      changedState = true;
    }
  }
  if (changedState && this.rendered) {
    this.render();
    // Adding or removing a comment icon will cause the block to change shape.
    this.bumpNeighbours_();
  }
};

/**
 * Set this block's warning text.
 * @param {?string} text The text, or null to delete.
 * @param {string=} opt_id An optional ID for the warning text to be able to
 *     maintain multiple warnings.
 */
Blockly.BlockSvg.prototype.setWarningText = function(text, opt_id) {
  if (!this.setWarningText.pid_) {
    // Create a database of warning PIDs.
    // Only runs once per block (and only those with warnings).
    this.setWarningText.pid_ = Object.create(null);
  }
  var id = opt_id || '';
  if (!id) {
    // Kill all previous pending processes, this edit supersedes them all.
    for (var n in this.setWarningText.pid_) {
      clearTimeout(this.setWarningText.pid_[n]);
      delete this.setWarningText.pid_[n];
    }
  } else if (this.setWarningText.pid_[id]) {
    // Only queue up the latest change.  Kill any earlier pending process.
    clearTimeout(this.setWarningText.pid_[id]);
    delete this.setWarningText.pid_[id];
  }
  if (Blockly.dragMode_ == Blockly.DRAG_FREE) {
    // Don't change the warning text during a drag.
    // Wait until the drag finishes.
    var thisBlock = this;
    this.setWarningText.pid_[id] = setTimeout(function() {
      if (thisBlock.workspace) {  // Check block wasn't deleted.
        delete thisBlock.setWarningText.pid_[id];
        thisBlock.setWarningText(text, id);
      }
    }, 100);
    return;
  }
  if (this.isInFlyout) {
    text = null;
  }

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
    collapsedParent.setWarningText(text, 'collapsed ' + this.id + ' ' + id);
  }

  var changedState = false;
  if (goog.isString(text)) {
    if (!this.warning) {
      this.warning = new Blockly.Warning(this);
      changedState = true;
    }
    this.warning.setText(/** @type {string} */ (text), id);
  } else {
    // Dispose all warnings if no id is given.
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
    this.bumpNeighbours_();
  }
};

/**
 * Give this block a mutator dialog.
 * @param {Blockly.Mutator} mutator A mutator dialog instance or null to remove.
 */
Blockly.BlockSvg.prototype.setMutator = function(mutator) {
  if (this.mutator && this.mutator !== mutator) {
    this.mutator.dispose();
  }
  if (mutator) {
    mutator.block_ = this;
    this.mutator = mutator;
    mutator.createIcon();
  }
};

/**
 * Set whether the block is disabled or not.
 * @param {boolean} disabled True if disabled.
 */
Blockly.BlockSvg.prototype.setDisabled = function(disabled) {
  if (this.disabled != disabled) {
    Blockly.BlockSvg.superClass_.setDisabled.call(this, disabled);
    if (this.rendered) {
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
  if (highlighted) {
    this.svgPath_.setAttribute('filter',
        'url(#' + this.workspace.options.embossFilterId + ')');
    this.svgPathLight_.style.display = 'none';
  } else {
    this.svgPath_.removeAttribute('filter');
    delete this.svgPathLight_.style.display;
  }
};

/**
 * Select this block.  Highlight it visually.
 */
Blockly.BlockSvg.prototype.addSelect = function() {
  Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
                    'blocklySelected');
  // Move the selected block to the top of the stack.
  var block = this;
  do {
    var root = block.getSvgRoot();
    root.parentNode.appendChild(root);
    block = block.getParent();
  } while (block);
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.BlockSvg.prototype.removeSelect = function() {
  Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
                       'blocklySelected');
};

// Overrides of functions on Blockly.Block that take into account whether the
// block has been rendered.

/**
 * Change the colour of a block.
 * @param {number|string} colour HSV hue value, or #RRGGBB string.
 */
Blockly.BlockSvg.prototype.setColour = function(colour) {
  Blockly.BlockSvg.superClass_.setColour.call(this, colour);

  if (this.rendered) {
    this.updateColour();
  }
};

/**
 * Set whether this block can chain onto the bottom of another block.
 * @param {boolean} newBoolean True if there can be a previous statement.
 * @param {string|Array.<string>|null|undefined} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 */
Blockly.BlockSvg.prototype.setPreviousStatement =
    function(newBoolean, opt_check) {
  /* eslint-disable indent */
  Blockly.BlockSvg.superClass_.setPreviousStatement.call(this, newBoolean,
      opt_check);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};  /* eslint-enable indent */

/**
 * Set whether another block can chain onto the bottom of this block.
 * @param {boolean} newBoolean True if there can be a next statement.
 * @param {string|Array.<string>|null|undefined} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 */
Blockly.BlockSvg.prototype.setNextStatement = function(newBoolean, opt_check) {
  Blockly.BlockSvg.superClass_.setNextStatement.call(this, newBoolean,
      opt_check);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};

/**
 * Set whether this block returns a value.
 * @param {boolean} newBoolean True if there is an output.
 * @param {string|Array.<string>|null|undefined} opt_check Returned type or list
 *     of returned types.  Null or undefined if any type could be returned
 *     (e.g. variable get).
 */
Blockly.BlockSvg.prototype.setOutput = function(newBoolean, opt_check) {
  Blockly.BlockSvg.superClass_.setOutput.call(this, newBoolean, opt_check);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
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
    this.bumpNeighbours_();
  }
};

/**
 * Remove an input from this block.
 * @param {string} name The name of the input.
 * @param {boolean=} opt_quiet True to prevent error if input is not present.
 * @throws {goog.asserts.AssertionError} if the input is not present and
 *     opt_quiet is not true.
 */
Blockly.BlockSvg.prototype.removeInput = function(name, opt_quiet) {
  Blockly.BlockSvg.superClass_.removeInput.call(this, name, opt_quiet);

  if (this.rendered) {
    this.render();
    // Removing an input will cause the block to change shape.
    this.bumpNeighbours_();
  }
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
    this.bumpNeighbours_();
  }
};

/**
 * Add a value input, statement input or local variable to this block.
 * @param {number} type Either Blockly.INPUT_VALUE or Blockly.NEXT_STATEMENT or
 *     Blockly.DUMMY_INPUT.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 * @private
 */
Blockly.BlockSvg.prototype.appendInput_ = function(type, name) {
  var input = Blockly.BlockSvg.superClass_.appendInput_.call(this, type, name);

  if (this.rendered) {
    this.render();
    // Adding an input will cause the block to change shape.
    this.bumpNeighbours_();
  }
  return input;
};

/**
 * Returns connections originating from this block.
 * @param {boolean} all If true, return all connections even hidden ones.
 *     Otherwise, for a non-rendered block return an empty list, and for a
 *     collapsed block don't return inputs connections.
 * @return {!Array.<!Blockly.Connection>} Array of connections.
 * @private
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
      for (var i = 0, input; input = this.inputList[i]; i++) {
        if (input.connection) {
          myConnections.push(input.connection);
        }
      }
    }
  }
  return myConnections;
};

/**
 * Create a connection of the specified type.
 * @param {number} type The type of the connection to create.
 * @return {!Blockly.RenderedConnection} A new connection of the specified type.
 * @private
 */
Blockly.BlockSvg.prototype.makeConnection_ = function(type) {
  return new Blockly.RenderedConnection(this, type);
};
