/**
 * @license
 * Copyright 2012 Google LLC
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
goog.require('Blockly.blockAnimations');
goog.require('Blockly.blockRendering.IPathObject');
goog.require('Blockly.ContextMenu');
goog.require('Blockly.Events');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.Events.BlockMove');
goog.require('Blockly.Msg');
goog.require('Blockly.RenderedConnection');
goog.require('Blockly.Tooltip');
goog.require('Blockly.Touch');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.Warning');


/**
 * Class for a block's SVG representation.
 * Not normally called directly, workspace.newBlock() is preferred.
 * @param {!Blockly.WorkspaceSvg} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @extends {Blockly.Block}
 * @constructor
 */
Blockly.BlockSvg = function(workspace, prototypeName, opt_id) {
  // Create core elements for the block.
  /**
   * @type {SVGElement}
   * @private
   */
  this.svgGroup_ = Blockly.utils.dom.createSvgElement('g', {}, null);
  this.svgGroup_.translate_ = '';

  /**
   * The renderer's path object.
   * @type {Blockly.blockRendering.IPathObject}
   * @package
   */
  this.pathObject =
      workspace.getRenderer().makePathObject(this.svgGroup_);

  // The next three paths are set only for backwards compatibility reasons.
  /**
   * The dark path of the block.
   * @type {SVGElement}
   * @private
   */
  this.svgPathDark_ = this.pathObject.svgPathDark || null;

  /**
   * The primary path of the block.
   * @type {SVGElement}
   * @private
   */
  this.svgPath_ = this.pathObject.svgPath || null;

  /**
   * The light path of the block.
   * @type {SVGElement}
   * @private
   */
  this.svgPathLight_ = this.pathObject.svgPathLight || null;

  this.svgPath_.tooltip = this;

  /** @type {boolean} */
  this.rendered = false;

  /**
   * Whether to move the block to the drag surface when it is dragged.
   * True if it should move, false if it should be translated directly.
   * @type {boolean}
   * @private
   */
  this.useDragSurface_ =
      Blockly.utils.is3dSupported() && !!workspace.blockDragSurface_;

  Blockly.Tooltip.bindMouseEvents(this.svgPath_);
  Blockly.BlockSvg.superClass_.constructor.call(this,
      workspace, prototypeName, opt_id);

  // Expose this block's ID on its top-level SVG group.
  if (this.svgGroup_.dataset) {
    this.svgGroup_.dataset['id'] = this.id;
  }

  /**
   * Holds the cursors svg element when the cursor is attached to the block.
   * This is null if there is no cursor on the block.
   * @type {SVGElement}
   * @private
   */
  this.cursorSvg_ = null;

  /**
   * Holds the markers svg element when the marker is attached to the block.
   * This is null if there is no marker on the block.
   * @type {SVGElement}
   * @private
   */
  this.markerSvg_ = null;
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
 * Original location of block being dragged.
 * @type {Blockly.utils.Coordinate}
 * @private
 */
Blockly.BlockSvg.prototype.dragStartXY_ = null;

/**
 * Map from IDs for warnings text to PIDs of functions to apply them.
 * Used to be able to maintain multiple warnings.
 * @type {Object.<string, number>}
 * @private
 */
Blockly.BlockSvg.prototype.warningTextDb_ = null;

/**
 * Constant for identifying rows that are to be rendered inline.
 * Don't collide with Blockly.INPUT_VALUE and friends.
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

// Leftover UI constants from block_render_svg.js.
/**
 * Vertical space between elements.
 * @const
 * @package
 */
// TODO (#3142): Remove.
Blockly.BlockSvg.SEP_SPACE_Y = 10;

/**
 * Minimum height of a block.
 * @const
 * @package
 */
// TODO (#3142): Remove.
Blockly.BlockSvg.MIN_BLOCK_Y = 25;

/**
 * Width of horizontal puzzle tab.
 * @const
 * @package
 */
// TODO (#3142): Remove.
Blockly.BlockSvg.TAB_WIDTH = 8;

/**
 * Do blocks with no previous or output connections have a 'hat' on top?
 * @const
 * @package
 */
// TODO (#3142): Remove.
Blockly.BlockSvg.START_HAT = false;

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
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 */
Blockly.BlockSvg.prototype.initSvg = function() {
  if (!this.workspace.rendered) {
    throw TypeError('Workspace is headless.');
  }
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
    Blockly.bindEventWithChecks_(
        this.getSvgRoot(), 'mousedown', this, this.onMouseDown_);
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
 * @deprecated August 2019. Use getCommentIcon instead.
 */
Blockly.BlockSvg.prototype.comment = null;

/**
 * Block's comment icon (if any).
 * @type {Blockly.Comment}
 * @private
 */
Blockly.BlockSvg.prototype.commentIcon_ = null;

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
 * @param {Blockly.BlockSvg} newParent New parent block.
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
    this.moveConnections_(newXY.x - oldXY.x, newXY.y - oldXY.y);
  }
  // If we are losing a parent, we want to move our DOM element to the
  // root of the workspace.
  else if (oldParent) {
    this.workspace.getCanvas().appendChild(svgRoot);
    this.translate(oldXY.x, oldXY.y);
  }
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
        var surfaceTranslation =
            this.workspace.blockDragSurface_.getSurfaceTranslation();
        x += surfaceTranslation.x;
        y += surfaceTranslation.y;
      }
      element = element.parentNode;
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
    var event = new Blockly.Events.BlockMove(this);
  }
  var xy = this.getRelativeToSurfaceXY();
  this.translate(xy.x + dx, xy.y + dy);
  this.moveConnections_(dx, dy);
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
 * @private
 */
Blockly.BlockSvg.prototype.moveToDragSurface_ = function() {
  if (!this.useDragSurface_) {
    return;
  }
  // The translation for drag surface blocks,
  // is equal to the current relative-to-surface position,
  // to keep the position in sync as it move on/off the surface.
  // This is in workspace coordinates.
  var xy = this.getRelativeToSurfaceXY();
  this.clearTransformAttributes_();
  this.workspace.blockDragSurface_.translateSurface(xy.x, xy.y);
  // Execute the move on the top-level SVG component
  this.workspace.blockDragSurface_.setBlocksAndShow(this.getSvgRoot());
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
 * @private
 */
Blockly.BlockSvg.prototype.moveOffDragSurface_ = function(newXY) {
  if (!this.useDragSurface_) {
    return;
  }
  // Translate to current position, turning off 3d.
  this.translate(newXY.x, newXY.y);
  this.workspace.blockDragSurface_.clearAndHide(this.workspace.getCanvas());
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
    this.workspace.blockDragSurface_.translateSurface(newLoc.x, newLoc.y);
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
  var blockXY = this.getRelativeToSurfaceXY(this);
  var tab = this.outputConnection ? Blockly.BlockSvg.TAB_WIDTH : 0;
  var blockBounds = this.getHeightWidth();
  var top = blockXY.y;
  var bottom = blockXY.y + blockBounds.height;
  var left, right;
  if (this.RTL) {
    // Width has the tab built into it already so subtract it here.
    left = blockXY.x - (blockBounds.width - tab);
    // Add the width of the tab/puzzle piece knob to the x coordinate
    // since X is the corner of the rectangle, not the whole puzzle piece.
    right = blockXY.x + tab;
  } else {
    // Subtract the width of the tab/puzzle piece knob to the x coordinate
    // since X is the corner of the rectangle, not the whole puzzle piece.
    left = blockXY.x - tab;
    // Width has the tab built into it already so subtract it here.
    right = blockXY.x + blockBounds.width - tab;
  }
  return new Blockly.utils.Rect(top, bottom, left, right);
};

/**
 * Notify every input on this block to mark its fields as dirty.
 * A dirty field is a field that needs to be re-rendererd.
 */
Blockly.BlockSvg.prototype.markDirty = function() {
  for (var i = 0, input; input = this.inputList[i]; i++) {
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

    // Add any warnings on enclosed blocks to this block.
    var descendants = this.getDescendants(true);
    var nextBlock = this.getNextBlock();
    if (nextBlock) {
      var index = descendants.indexOf(nextBlock);
      descendants.splice(index, descendants.length - index);
    }
    for (var i = 1, block; block = descendants[i]; i++) {
      if (block.warning) {
        this.setWarningText(Blockly.Msg['COLLAPSED_WARNINGS_WARNING'],
            Blockly.BlockSvg.COLLAPSED_WARNING_ID);
        break;
      }
    }
  } else {
    this.removeInput(COLLAPSED_INPUT_NAME);
    // Clear any warnings inherited from enclosed blocks.
    if (this.warning) {
      this.warning.setText('', Blockly.BlockSvg.COLLAPSED_WARNING_ID);
      if (!Object.keys(this.warning.text_).length) {
        this.setWarningText(null);
      }
    }
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
  var list = this.createTabList_();
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
 * Create an ordered list of all text fields and connected inputs.
 * @return {!Array.<!Blockly.FieldTextInput|!Blockly.Input>} The ordered list.
 * @private
 */
Blockly.BlockSvg.prototype.createTabList_ = function() {
  // This function need not be efficient since it runs once on a keypress.
  var list = [];
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field.isTabNavigable() && field.isVisible()) {
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
  return list;
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
 * @private
 */
Blockly.BlockSvg.prototype.showHelp_ = function() {
  var url = (typeof this.helpUrl == 'function') ? this.helpUrl() : this.helpUrl;
  if (url) {
    window.open(url);
  }
};

/**
 * Generate the context menu for this block.
 * @protected
 * @return {Array.<!Object>} Context menu options
 */
Blockly.BlockSvg.prototype.generateContextMenu = function() {
  if (this.workspace.options.readOnly || !this.contextMenu) {
    return null;
  }
  // Save the current block in a variable for use in closures.
  var block = this;
  var menuOptions = [];

  if (!this.isInFlyout) {
    if (this.isDeletable() && this.isMovable()) {
      menuOptions.push(Blockly.ContextMenu.blockDuplicateOption(block));
    }

    if (this.workspace.options.comments && !this.collapsed_ &&
        this.isEditable()) {
      menuOptions.push(Blockly.ContextMenu.blockCommentOption(block));
    }

    if (this.isMovable()) {
      if (!this.collapsed_) {
        // Option to make block inline.
        for (var i = 1; i < this.inputList.length; i++) {
          if (this.inputList[i - 1].type != Blockly.NEXT_STATEMENT &&
              this.inputList[i].type != Blockly.NEXT_STATEMENT) {
            // Only display this option if there are two value or dummy inputs
            // next to each other.
            var inlineOption = {enabled: true};
            var isInline = this.getInputsInline();
            inlineOption.text = isInline ?
                Blockly.Msg['EXTERNAL_INPUTS'] : Blockly.Msg['INLINE_INPUTS'];
            inlineOption.callback = function() {
              block.setInputsInline(!isInline);
            };
            menuOptions.push(inlineOption);
            break;
          }
        }
        // Option to collapse block
        if (this.workspace.options.collapse) {
          var collapseOption = {enabled: true};
          collapseOption.text = Blockly.Msg['COLLAPSE_BLOCK'];
          collapseOption.callback = function() {
            block.setCollapsed(true);
          };
          menuOptions.push(collapseOption);
        }
      } else {
        // Option to expand block.
        if (this.workspace.options.collapse) {
          var expandOption = {enabled: true};
          expandOption.text = Blockly.Msg['EXPAND_BLOCK'];
          expandOption.callback = function() {
            block.setCollapsed(false);
          };
          menuOptions.push(expandOption);
        }
      }
    }

    if (this.workspace.options.disable && this.isEditable()) {
      // Option to disable/enable block.
      var disableOption = {
        text: this.isEnabled() ?
            Blockly.Msg['DISABLE_BLOCK'] : Blockly.Msg['ENABLE_BLOCK'],
        enabled: !this.getInheritedDisabled(),
        callback: function() {
          var group = Blockly.Events.getGroup();
          if (!group) {
            Blockly.Events.setGroup(true);
          }
          block.setEnabled(!block.isEnabled());
          if (!group) {
            Blockly.Events.setGroup(false);
          }
        }
      };
      menuOptions.push(disableOption);
    }

    if (this.isDeletable()) {
      menuOptions.push(Blockly.ContextMenu.blockDeleteOption(block));
    }
  }

  menuOptions.push(Blockly.ContextMenu.blockHelpOption(block));

  // Allow the block to add or modify menuOptions.
  if (this.customContextMenu) {
    this.customContextMenu(menuOptions);
  }

  return menuOptions;
};

/**
 * Show the context menu for this block.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.BlockSvg.prototype.showContextMenu_ = function(e) {
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
 * @package
 */
Blockly.BlockSvg.prototype.setDragging = function(adding) {
  if (adding) {
    var group = this.getSvgRoot();
    group.translate_ = '';
    group.skew_ = '';
    Blockly.draggingConnections_ =
        Blockly.draggingConnections_.concat(this.getConnections_(true));
    Blockly.utils.dom.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDragging');
  } else {
    Blockly.draggingConnections_ = [];
    Blockly.utils.dom.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDragging');
  }
  // Recurse through all blocks attached under this one.
  for (var i = 0; i < this.childBlocks_.length; i++) {
    this.childBlocks_[i].setDragging(adding);
  }
};

/**
 * Add or remove the UI indicating if this block is movable or not.
 */
Blockly.BlockSvg.prototype.updateMovable = function() {
  if (this.isMovable()) {
    Blockly.utils.dom.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggable');
  } else {
    Blockly.utils.dom.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggable');
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
    this.setColour(Blockly.INSERTION_MARKER_COLOUR);
    Blockly.utils.dom.addClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyInsertionMarker');
  }
};

/**
 * Return the root node of the SVG or null if none exists.
 * @return {SVGElement} The root SVG node (probably a group).
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
 */
Blockly.BlockSvg.prototype.dispose = function(healStack, animate) {
  if (!this.workspace) {
    // The block has already been deleted.
    return;
  }
  Blockly.Tooltip.hide();
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

  if (Blockly.keyboardAccessibilityMode) {
    Blockly.navigation.moveCursorOnBlockDelete(this);
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
  Blockly.BlockSvg.superClass_.dispose.call(this, healStack);

  Blockly.utils.dom.removeNode(this.svgGroup_);
  blockWorkspace.resizeContents();
  // Sever JavaScript to DOM connections.
  this.svgGroup_ = null;
  this.svgPath_ = null;
  this.svgPathLight_ = null;
  this.svgPathDark_ = null;
  Blockly.utils.dom.stopTextWidthCache();
};

/**
 * Change the colour of a block.
 */
Blockly.BlockSvg.prototype.updateColour = function() {
  if (!this.isEnabled()) {
    // Disabled blocks don't have colour.
    return;
  }

  if (this.isShadow()) {
    this.setShadowColour_();
  } else {
    this.setBorderColour_();
    this.svgPath_.setAttribute('fill', this.getColour());
  }

  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].updateColour();
  }

  for (var x = 0, input; input = this.inputList[x]; x++) {
    for (var y = 0, field; field = input.fieldRow[y]; y++) {
      field.updateColour();
    }
  }
};

/**
 * Sets the colour of the border.
 * Removes the light and dark paths if a border colour is defined.
 */
Blockly.BlockSvg.prototype.setBorderColour_ = function() {
  var borderColours = this.getColourBorder();
  if (borderColours.colourBorder) {
    this.svgPathLight_.style.display = 'none';
    this.svgPathDark_.style.display = 'none';

    this.svgPath_.setAttribute('stroke', borderColours.colourBorder);
  } else {
    this.svgPathLight_.style.display = '';
    this.svgPathDark_.style.display = '';
    this.svgPath_.setAttribute('stroke', 'none');

    this.svgPathLight_.setAttribute('stroke', borderColours.colourLight);
    this.svgPathDark_.setAttribute('fill', borderColours.colourDark);
  }
};

/**
 * Sets the colour of shadow blocks.
 * @return {?string} The background colour of the block.
 */
Blockly.BlockSvg.prototype.setShadowColour_ = function() {
  var shadowColour = this.getColourShadow();

  this.svgPathLight_.style.display = 'none';
  this.svgPathDark_.setAttribute('fill', shadowColour);
  this.svgPath_.setAttribute('stroke', 'none');
  this.svgPath_.setAttribute('fill', shadowColour);
  return shadowColour;
};

/**
 * Enable or disable a block.
 */
Blockly.BlockSvg.prototype.updateDisabled = function() {
  if (!this.isEnabled() || this.getInheritedDisabled()) {
    var added = Blockly.utils.dom.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDisabled');
    if (added) {
      this.svgPath_.setAttribute('fill',
          'url(#' + this.workspace.options.disabledPatternId + ')');
    }
  } else {
    var removed = Blockly.utils.dom.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDisabled');
    if (removed) {
      this.updateColour();
    }
  }
  var children = this.getChildren(false);
  for (var i = 0, child; child = children[i]; i++) {
    child.updateDisabled();
  }
};

/**
 * Get the comment icon attached to this block, or null if the block has no
 * comment.
 * @return {Blockly.Comment} The comment icon attached to this block, or null.
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
    this.comment = this.commentIcon_; // For backwards compatibility.
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

  var changedState = false;
  if (typeof text == 'string') {
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
 * @deprecated May 2019
 */
Blockly.BlockSvg.prototype.setDisabled = function(disabled) {
  console.warn('Deprecated call to Blockly.BlockSvg.prototype.setDisabled, ' +
  'use Blockly.BlockSvg.prototype.setEnabled instead.');
  this.setEnabled(!disabled);
};

/**
 * Set whether the block is enabled or not.
 * @param {boolean} enabled True if enabled.
 */
Blockly.BlockSvg.prototype.setEnabled = function(enabled) {
  if (this.isEnabled() != enabled) {
    Blockly.BlockSvg.superClass_.setEnabled.call(this, enabled);
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
    this.svgPath_.setAttribute('filter', 'none');
    this.svgPathLight_.style.display = 'inline';
  }
};

/**
 * Select this block.  Highlight it visually.
 */
Blockly.BlockSvg.prototype.addSelect = function() {
  Blockly.utils.dom.addClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklySelected');
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.BlockSvg.prototype.removeSelect = function() {
  Blockly.utils.dom.removeClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklySelected');
};

/**
 * Update the cursor over this block by adding or removing a class.
 * @param {boolean} enable True if the delete cursor should be shown, false
 *     otherwise.
 * @package
 */
Blockly.BlockSvg.prototype.setDeleteStyle = function(enable) {
  if (enable) {
    Blockly.utils.dom.addClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyDraggingDelete');
  } else {
    Blockly.utils.dom.removeClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyDraggingDelete');
  }
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
    root.parentNode.appendChild(root);
    block = block.getParent();
  } while (block);
};

/**
 * Set whether this block can chain onto the bottom of another block.
 * @param {boolean} newBoolean True if there can be a previous statement.
 * @param {(string|Array.<string>|null)=} opt_check Statement type or
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
 * @param {(string|Array.<string>|null)=} opt_check Statement type or
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
 * @param {(string|Array.<string>|null)=} opt_check Returned type or list
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
 * @throws {Error} if the input is not present and
 *     opt_quiet is not true.
 */
Blockly.BlockSvg.prototype.removeInput = function(name, opt_quiet) {
  Blockly.BlockSvg.superClass_.removeInput.call(this, name, opt_quiet);

  if (this.rendered) {
    this.render();
    // Removing an input will cause the block to change shape.
    this.bumpNeighbours();
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
    this.bumpNeighbours();
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
    this.bumpNeighbours();
  }
  return input;
};

/**
 * Set whether the connections are hidden (not tracked in a database) or not.
 * Recursively walk down all child blocks (except collapsed blocks).
 * @param {boolean} hidden True if connections are hidden.
 * @package
 */
Blockly.BlockSvg.prototype.setConnectionsHidden = function(hidden) {
  if (!hidden && this.isCollapsed()) {
    if (this.outputConnection) {
      this.outputConnection.setHidden(hidden);
    }
    if (this.previousConnection) {
      this.previousConnection.setHidden(hidden);
    }
    if (this.nextConnection) {
      this.nextConnection.setHidden(hidden);
      var child = this.nextConnection.targetBlock();
      if (child) {
        child.setConnectionsHidden(hidden);
      }
    }
  } else {
    var myConnections = this.getConnections_(true);
    for (var i = 0, connection; connection = myConnections[i]; i++) {
      connection.setHidden(hidden);
      if (connection.isSuperior()) {
        var child = connection.targetBlock();
        if (child) {
          child.setConnectionsHidden(hidden);
        }
      }
    }
  }
};

/**
 * Returns connections originating from this block.
 * @param {boolean} all If true, return all connections even hidden ones.
 *     Otherwise, for a non-rendered block return an empty list, and for a
 *     collapsed block don't return inputs connections.
 * @return {!Array.<!Blockly.Connection>} Array of connections.
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
  for (var i = 0, connection; connection = myConnections[i]; i++) {

    // Spider down from this block bumping all sub-blocks.
    if (connection.isConnected() && connection.isSuperior()) {
      connection.targetBlock().bumpNeighbours();
    }

    var neighbours = connection.neighbours_(Blockly.SNAP_RADIUS);
    for (var j = 0, otherConnection; otherConnection = neighbours[j]; j++) {

      // If both connections are connected, that's probably fine.  But if
      // either one of them is unconnected, then there could be confusion.
      if (!connection.isConnected() || !otherConnection.isConnected()) {
        // Only bump blocks if they are from different tree structures.
        if (otherConnection.getSourceBlock().getRootBlock() != rootBlock) {

          // Always bump the inferior block.
          if (connection.isSuperior()) {
            otherConnection.bumpAwayFrom_(connection);
          } else {
            connection.bumpAwayFrom_(otherConnection);
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
 * @param {!Blockly.Connection} sourceConnection The connection on the moving
 *     block's stack.
 * @param {!Blockly.Connection} targetConnection The connection that should stay
 *     stationary as this block is positioned.
 */
Blockly.BlockSvg.prototype.positionNearConnection = function(sourceConnection,
    targetConnection) {
  // We only need to position the new block if it's before the existing one,
  // otherwise its position is set by the previous block.
  if (sourceConnection.type == Blockly.NEXT_STATEMENT ||
      sourceConnection.type == Blockly.INPUT_VALUE) {
    var dx = targetConnection.x_ - sourceConnection.x_;
    var dy = targetConnection.y_ - sourceConnection.y_;

    this.moveBy(dx, dy);
  }
};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {boolean=} opt_bubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
Blockly.BlockSvg.prototype.render = function(opt_bubble) {
  Blockly.utils.dom.startTextWidthCache();
  this.rendered = true;
  (/** @type {!Blockly.WorkspaceSvg} */ (this.workspace)).getRenderer().render(this);
  // No matter how we rendered, connection locations should now be correct.
  this.updateConnectionLocations_();
  if (opt_bubble !== false) {
    // Render all blocks above this one (propagate a reflow).
    var parentBlock = this.getParent();
    if (parentBlock) {
      parentBlock.render(true);
    } else {
      // Top-most block.  Fire an event to allow scrollbars to resize.
      this.workspace.resizeContents();
    }
  }
  Blockly.utils.dom.stopTextWidthCache();
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
        conn.tighten_();
      }
    }
  }

  if (this.nextConnection) {
    this.nextConnection.moveToOffset(blockTL);
    if (this.nextConnection.isConnected()) {
      this.nextConnection.tighten_();
    }
  }
};

/**
 * Add the cursor svg to this block's svg group.
 * @param {SVGElement} cursorSvg The svg root of the cursor to be added to the
 *     block svg group.
 * @package
 */
Blockly.BlockSvg.prototype.setCursorSvg = function(cursorSvg) {
  if (!cursorSvg) {
    this.cursorSvg_ = null;
    return;
  }

  this.svgGroup_.appendChild(cursorSvg);
  this.cursorSvg_ = cursorSvg;
};

/**
 * Add the marker svg to this block's svg group.
 * @param {SVGElement} markerSvg The svg root of the marker to be added to the
 *     block svg group.
 * @package
 */
Blockly.BlockSvg.prototype.setMarkerSvg = function(markerSvg) {
  if (!markerSvg) {
    this.markerSvg_ = null;
    return;
  }

  if (this.cursorSvg_) {
    this.svgGroup_.insertBefore(markerSvg, this.cursorSvg_);
  } else {
    this.svgGroup_.appendChild(markerSvg);
  }
  this.markerSvg_ = markerSvg;
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
    height += nextHeightWidth.height - 4;  // Height of tab.
    width = Math.max(width, nextHeightWidth.width);
  }
  return {height: height, width: width};
};

/**
 * Position a new block correctly, so that it doesn't move the existing block
 * when connected to it.
 * @param {!Blockly.Block} newBlock The block to position - either the first
 *     block in a dragged stack or an insertion marker.
 * @param {!Blockly.Connection} newConnection The connection on the new block's
 *     stack - either a connection on newBlock, or the last NEXT_STATEMENT
 *     connection on the stack if the stack's being dropped before another
 *     block.
 * @param {!Blockly.Connection} existingConnection The connection on the
 *     existing block, which newBlock should line up with.
 * @package
 */
Blockly.BlockSvg.prototype.positionNewBlock = function(newBlock, newConnection,
    existingConnection) {
  // We only need to position the new block if it's before the existing one,
  // otherwise its position is set by the previous block.
  if (newConnection.type == Blockly.NEXT_STATEMENT ||
      newConnection.type == Blockly.INPUT_VALUE) {
    var dx = existingConnection.x_ - newConnection.x_;
    var dy = existingConnection.y_ - newConnection.y_;

    newBlock.moveBy(dx, dy);
  }
};

/**
 * Visual effect to show that if the dragging block is dropped, this block will
 * be replaced.  If a shadow block, it will disappear.  Otherwise it will bump.
 * @param {boolean} add True if highlighting should be added.
 * @package
 */
Blockly.BlockSvg.prototype.highlightForReplacement = function(add) {
  if (add) {
    Blockly.utils.dom.addClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyReplaceable');
  } else {
    Blockly.utils.dom.removeClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyReplaceable');
  }
};
