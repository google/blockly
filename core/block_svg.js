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
goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');


/**
 * Class for a block's SVG representation.
 * @extends {Blockly.Block}
 * @constructor
 */
Blockly.BlockSvg = function() {
  // Create core elements for the block.
  this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
  this.svgPathDark_ = Blockly.createSvgElement('path',
      {'class': 'blocklyPathDark', 'transform': 'translate(1,1)'},
      this.svgGroup_);
  this.svgPath_ = Blockly.createSvgElement('path', {'class': 'blocklyPath'},
      this.svgGroup_);
  this.svgPathLight_ = Blockly.createSvgElement('path',
      {'class': 'blocklyPathLight'}, this.svgGroup_);
  this.svgPath_.tooltip = this;
  Blockly.Tooltip.bindMouseEvents(this.svgPath_);
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
  if (this.mutator) {
    this.mutator.createIcon();
  }
  this.updateColour();
  this.updateMovable();
  if (!this.workspace.options.readOnly && !this.eventsInit_) {
    Blockly.bindEvent_(this.getSvgRoot(), 'mousedown', this,
                       this.onMouseDown_);
    var thisBlock = this;
    Blockly.bindEvent_(this.getSvgRoot(), 'touchstart', null,
                       function(e) {Blockly.longStart_(e, thisBlock);});
  }
  // Bind an onchange function, if it exists.
  if (goog.isFunction(this.onchange) && !this.eventsInit_) {
    this.onchangeWrapper_ = Blockly.bindEvent_(this.workspace.getCanvas(),
        'blocklyWorkspaceChange', this, this.onchange);
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
  if (Blockly.selected) {
    // Unselect any previously selected block.
    Blockly.selected.unselect();
  }
  Blockly.selected = this;
  this.addSelect();
  Blockly.fireUiEvent(this.workspace.getCanvas(), 'blocklySelectChange');
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.BlockSvg.prototype.unselect = function() {
  Blockly.selected = null;
  this.removeSelect();
  Blockly.fireUiEvent(this.workspace.getCanvas(), 'blocklySelectChange');
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
 * @private
 */
Blockly.BlockSvg.terminateDrag_ = function() {
  if (Blockly.BlockSvg.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.BlockSvg.onMouseUpWrapper_);
    Blockly.BlockSvg.onMouseUpWrapper_ = null;
  }
  if (Blockly.BlockSvg.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.BlockSvg.onMouseMoveWrapper_);
    Blockly.BlockSvg.onMouseMoveWrapper_ = null;
  }
  var selected = Blockly.selected;
  if (Blockly.dragMode_ == 2) {
    // Terminate a drag operation.
    if (selected) {
      // Update the connection locations.
      var xy = selected.getRelativeToSurfaceXY();
      var dxy = goog.math.Coordinate.difference(xy, selected.dragStartXY_);
      selected.moveConnections_(dxy.x, dxy.y);
      delete selected.draggedBubbles_;
      selected.setDragging_(false);
      selected.render();
      if (selected.workspace &&
          selected.workspace.options.gridOptions &&
          selected.workspace.options.gridOptions['snap']) {
        goog.Timer.callOnce(
            selected.snapToGrid_, Blockly.BUMP_DELAY / 2, selected);
      }
      goog.Timer.callOnce(
          selected.bumpNeighbours_, Blockly.BUMP_DELAY, selected);
      // Fire an event to allow scrollbars to resize.
      Blockly.fireUiEvent(window, 'resize');
      selected.workspace.fireChangeEvent();
    }
  }
  Blockly.dragMode_ = 0;
  Blockly.Css.setCursor(Blockly.Css.Cursor.OPEN);
};

/**
 * Set parent of this block to be a new block or null.
 * @param {Blockly.BlockSvg} newParent New parent block.
 */
Blockly.BlockSvg.prototype.setParent = function(newParent) {
  var svgRoot = this.getSvgRoot();
  if (this.parentBlock_ && svgRoot) {
    // Move this block up the DOM.  Keep track of x/y translations.
    var xy = this.getRelativeToSurfaceXY();
    this.workspace.getCanvas().appendChild(svgRoot);
    svgRoot.setAttribute('transform', 'translate(' + xy.x + ',' + xy.y + ')');
  }

  Blockly.BlockSvg.superClass_.setParent.call(this, newParent);

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
  var element = this.getSvgRoot();
  if (element) {
    do {
      // Loop through this block and every parent.
      var xy = Blockly.getRelativeXY_(element);
      x += xy.x;
      y += xy.y;
      element = element.parentNode;
    } while (element && element != this.workspace.getCanvas());
  }
  return new goog.math.Coordinate(x, y);
};

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset.
 * @param {number} dy Vertical offset.
 */
Blockly.BlockSvg.prototype.moveBy = function(dx, dy) {
  var xy = this.getRelativeToSurfaceXY();
  this.getSvgRoot().setAttribute('transform',
      'translate(' + (xy.x + dx) + ',' + (xy.y + dy) + ')');
  this.moveConnections_(dx, dy);
  Blockly.Realtime.blockChanged(this);
};

/**
 * Snap this block to the nearest grid point.
 * @private
 */
Blockly.BlockSvg.prototype.snapToGrid_ = function() {
  if (!this.workspace) {
    return;  // Deleted block.
  }
  if (Blockly.dragMode_ != 0) {
    return;  // Don't bump blocks during a drag.
  }
  if (this.getParent()) {
    return;  // Only snap top-level blocks.
  }
  if (this.isInFlyout) {
    return;  // Don't move blocks around in a flyout.
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
 * @return {!Object} Object with height and width properties.
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
  this.workspace.fireChangeEvent();
};

/**
 * Handle a mouse-down on an SVG block.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.BlockSvg.prototype.onMouseDown_ = function(e) {
  if (this.isInFlyout) {
    return;
  }
  // Update Blockly's knowledge of its own location.
  Blockly.svgResize(this.workspace);
  Blockly.terminateDrag_();
  this.select();
  Blockly.hideChaff();
  if (Blockly.isRightButton(e)) {
    // Right-click.
    this.showContextMenu_(e);
  } else if (!this.isMovable()) {
    // Allow unmovable blocks to be selected and context menued, but not
    // dragged.  Let this event bubble up to document, so the workspace may be
    // dragged instead.
    return;
  } else {
    // Left-click (or middle click)
    Blockly.removeAllRanges();
    Blockly.Css.setCursor(Blockly.Css.Cursor.CLOSED);

    this.dragStartXY_ = this.getRelativeToSurfaceXY();
    this.workspace.startDrag(e, this.dragStartXY_.x, this.dragStartXY_.y);

    Blockly.dragMode_ = 1;
    Blockly.BlockSvg.onMouseUpWrapper_ = Blockly.bindEvent_(document,
        'mouseup', this, this.onMouseUp_);
    Blockly.BlockSvg.onMouseMoveWrapper_ = Blockly.bindEvent_(document,
        'mousemove', this, this.onMouseMove_);
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
};

/**
 * Handle a mouse-up anywhere in the SVG pane.  Is only registered when a
 * block is clicked.  We can't use mouseUp on the block since a fast-moving
 * cursor can briefly escape the block before it catches up.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.BlockSvg.prototype.onMouseUp_ = function(e) {
  var this_ = this;
  Blockly.doCommand(function() {
    Blockly.terminateDrag_();
    if (Blockly.selected && Blockly.highlightedConnection_) {
      // Connect two blocks together.
      Blockly.localConnection_.connect(Blockly.highlightedConnection_);
      if (this_.rendered) {
        // Trigger a connection animation.
        // Determine which connection is inferior (lower in the source stack).
        var inferiorConnection;
        if (Blockly.localConnection_.isSuperior()) {
          inferiorConnection = Blockly.highlightedConnection_;
        } else {
          inferiorConnection = Blockly.localConnection_;
        }
        inferiorConnection.sourceBlock_.connectionUiEffect();
      }
      if (this_.workspace.trashcan) {
        // Don't throw an object in the trash can if it just got connected.
        this_.workspace.trashcan.close();
      }
    } else if (Blockly.selected.isDeletable() &&
        this_.workspace.isDeleteArea(e)) {
      var trashcan = this_.workspace.trashcan;
      if (trashcan) {
        goog.Timer.callOnce(trashcan.close, 100, trashcan);
      }
      Blockly.selected.dispose(false, true);
      // Dropping a block on the trash can will usually cause the workspace to
      // resize to contain the newly positioned block.  Force a second resize
      // now that the block has been deleted.
      Blockly.fireUiEvent(window, 'resize');
    }
    if (Blockly.highlightedConnection_) {
      Blockly.highlightedConnection_.unhighlight();
      Blockly.highlightedConnection_ = null;
    }
    Blockly.Css.setCursor(Blockly.Css.Cursor.OPEN);
  });
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
  var options = [];

  if (this.isDeletable() && this.isMovable() && !block.isInFlyout) {
    // Option to duplicate this block.
    var duplicateOption = {
      text: Blockly.Msg.DUPLICATE_BLOCK,
      enabled: true,
      callback: function() {
        block.duplicate_();
      }
    };
    if (this.getDescendants().length > this.workspace.remainingCapacity()) {
      duplicateOption.enabled = false;
    }
    options.push(duplicateOption);

    if (this.isEditable() && !this.collapsed_ &&
        this.workspace.options.comments) {
      // Option to add/remove a comment.
      var commentOption = {enabled: true};
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
      options.push(commentOption);
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
          options.push(inlineOption);
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
        options.push(expandOption);
      } else {
        var collapseOption = {enabled: true};
        collapseOption.text = Blockly.Msg.COLLAPSE_BLOCK;
        collapseOption.callback = function() {
          block.setCollapsed(true);
        };
        options.push(collapseOption);
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
      options.push(disableOption);
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
        block.dispose(true, true);
      }
    };
    options.push(deleteOption);
  }

  // Option to get help.
  var url = goog.isFunction(this.helpUrl) ? this.helpUrl() : this.helpUrl;
  var helpOption = {enabled: !!url};
  helpOption.text = Blockly.Msg.HELP;
  helpOption.callback = function() {
    block.showHelp_();
  };
  options.push(helpOption);

  // Allow the block to add or modify options.
  if (this.customContextMenu && !block.isInFlyout) {
    this.customContextMenu(options);
  }

  Blockly.ContextMenu.show(e, options, this.RTL);
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
    this.addDragging();
  } else {
    this.removeDragging();
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
  var this_ = this;
  var workspace_ = this.workspace;
  Blockly.doCommand(function() {
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
    Blockly.removeAllRanges();

    var oldXY = this_.getRelativeToSurfaceXY();
    var newXY = workspace_.moveDrag(e);

    if (Blockly.dragMode_ == 1) {
      // Still dragging within the sticky DRAG_RADIUS.
      var dr = goog.math.Coordinate.distance(oldXY, newXY) * workspace_.scale;
      if (dr > Blockly.DRAG_RADIUS) {
        // Switch to unrestricted dragging.
        Blockly.dragMode_ = 2;
        Blockly.longStop_();
        // Push this block to the very top of the stack.
        this_.setParent(null);
        this_.setDragging_(true);
        workspace_.recordDeleteAreas();
      }
    }
    if (Blockly.dragMode_ == 2) {
      // Unrestricted dragging.
      var dx = oldXY.x - this_.dragStartXY_.x;
      var dy = oldXY.y - this_.dragStartXY_.y;
      this_.getSvgRoot().setAttribute('transform',
          'translate(' + newXY.x + ',' + newXY.y + ')');
      // Drag all the nested bubbles.
      for (var i = 0; i < this_.draggedBubbles_.length; i++) {
        var commentData = this_.draggedBubbles_[i];
        commentData.bubble.setIconLocation(commentData.x + dx,
            commentData.y + dy);
      }

      // Check to see if any of this block's connections are within range of
      // another block's connection.
      var myConnections = this_.getConnections_(false);
      var closestConnection = null;
      var localConnection = null;
      var radiusConnection = Blockly.SNAP_RADIUS;
      for (var i = 0; i < myConnections.length; i++) {
        var myConnection = myConnections[i];
        var neighbour = myConnection.closest(radiusConnection, dx, dy);
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
      // Add connection highlighting if needed.
      if (closestConnection &&
          closestConnection != Blockly.highlightedConnection_) {
        closestConnection.highlight();
        Blockly.highlightedConnection_ = closestConnection;
        Blockly.localConnection_ = localConnection;
      }
      // Provide visual indication of whether the block will be deleted if
      // dropped here.
      if (this_.isDeletable()) {
        workspace_.isDeleteArea(e);
      }
    }
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
  });
};

/**
 * Add or remove the UI indicating if this block is movable or not.
 */
Blockly.BlockSvg.prototype.updateMovable = function() {
  if (this.isMovable()) {
    Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
                      'blocklyDraggable');
  } else {
    Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
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
 * Return the root node of the SVG or null if none exists.
 * @return {Element} The root SVG node (probably a group).
 */
Blockly.BlockSvg.prototype.getSvgRoot = function() {
  return this.svgGroup_;
};

// UI constants for rendering blocks.
/**
 * Horizontal space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_X = 10;
/**
 * Vertical space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_Y = 10;
/**
 * Vertical padding around inline elements.
 * @const
 */
Blockly.BlockSvg.INLINE_PADDING_Y = 5;
/**
 * Minimum height of a block.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_Y = 25;
/**
 * Height of horizontal puzzle tab.
 * @const
 */
Blockly.BlockSvg.TAB_HEIGHT = 20;
/**
 * Width of horizontal puzzle tab.
 * @const
 */
Blockly.BlockSvg.TAB_WIDTH = 8;
/**
 * Width of vertical tab (inc left margin).
 * @const
 */
Blockly.BlockSvg.NOTCH_WIDTH = 30;
/**
 * Rounded corner radius.
 * @const
 */
Blockly.BlockSvg.CORNER_RADIUS = 8;
/**
 * Minimum height of field rows.
 * @const
 */
Blockly.BlockSvg.FIELD_HEIGHT = 18;
/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the inside of a curve.
 * @const
 */
Blockly.BlockSvg.DISTANCE_45_INSIDE = (1 - Math.SQRT1_2) *
      (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + 0.5;
/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the outside of a curve.
 * @const
 */
Blockly.BlockSvg.DISTANCE_45_OUTSIDE = (1 - Math.SQRT1_2) *
      (Blockly.BlockSvg.CORNER_RADIUS + 0.5) - 0.5;
/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';
/**
 * SVG path for drawing next/previous notch from left to right with
 * highlighting.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT = 'l 6,4 3,0 6,-4';
/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';
/**
 * SVG path for drawing jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH = 'l 8,0 0,4 8,4 -16,8 8,4';
/**
 * Height of SVG path for jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH_HEIGHT = 20;
/**
 * Width of SVG path for jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH_WIDTH = 15;
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom.
 * @const
 */
Blockly.BlockSvg.TAB_PATH_DOWN = 'v 5 c 0,10 -' + Blockly.BlockSvg.TAB_WIDTH +
    ',-8 -' + Blockly.BlockSvg.TAB_WIDTH + ',7.5 s ' +
    Blockly.BlockSvg.TAB_WIDTH + ',-2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',7.5';
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom with
 * highlighting from the upper-right.
 * @const
 */
Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL = 'v 6.5 m -' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.97) + ',3 q -' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.05) + ',10 ' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.3) + ',9.5 m ' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.67) + ',-1.9 v 1.4';

/**
 * SVG start point for drawing the top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START =
    'm 0,' + Blockly.BlockSvg.CORNER_RADIUS;
/**
 * SVG start point for drawing the top-left corner's highlight in RTL.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL =
    'm ' + Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
    Blockly.BlockSvg.DISTANCE_45_INSIDE;
/**
 * SVG start point for drawing the top-left corner's highlight in LTR.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR =
    'm 0.5,' + (Blockly.BlockSvg.CORNER_RADIUS - 0.5);
/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER =
    'A ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',0';
/**
 * SVG path for drawing the highlight on the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT =
    'A ' + (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',0.5';
/**
 * SVG path for drawing the top-left corner of a statement input.
 * Includes the top notch, a horizontal space, and the rounded inside corner.
 * @const
 */
Blockly.BlockSvg.INNER_TOP_LEFT_CORNER =
    Blockly.BlockSvg.NOTCH_PATH_RIGHT + ' h -' +
    (Blockly.BlockSvg.NOTCH_WIDTH - 15 - Blockly.BlockSvg.CORNER_RADIUS) +
    ' h -0.5 a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 -' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;
/**
 * SVG path for drawing the bottom-left corner of a statement input.
 * Includes the rounded inside corner.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER =
    'a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;
/**
 * SVG path for drawing highlight on the top-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.BlockSvg.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 ' +
    (-Blockly.BlockSvg.DISTANCE_45_OUTSIDE - 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS -
    Blockly.BlockSvg.DISTANCE_45_OUTSIDE);
/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ' 0 0,0 ' +
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5);
/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in LTR.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ' 0 0,0 ' +
    (Blockly.BlockSvg.CORNER_RADIUS -
    Blockly.BlockSvg.DISTANCE_45_OUTSIDE) + ',' +
    (Blockly.BlockSvg.DISTANCE_45_OUTSIDE + 0.5);

/**
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 * @param {boolean} animate If true, show a disposal animation and sound.
 * @param {boolean=} opt_dontRemoveFromWorkspace If true, don't remove this
 *     block from the workspace's list of top blocks.
 */
Blockly.BlockSvg.prototype.dispose = function(healStack, animate,
                                              opt_dontRemoveFromWorkspace) {
  // Terminate onchange event calls.
  if (this.onchangeWrapper_) {
    Blockly.unbindEvent_(this.onchangeWrapper_);
    this.onchangeWrapper_ = null;
  }
  // If this block is being dragged, unlink the mouse events.
  if (Blockly.selected == this) {
    Blockly.terminateDrag_();
  }
  // If this block has a context menu open, close it.
  if (Blockly.ContextMenu.currentBlock == this) {
    Blockly.ContextMenu.hide();
  }
  // Bring block to the top of the workspace.
  this.unplug(healStack, false);

  if (animate && this.rendered) {
    this.disposeUiEffect();
  }
  // Stop rerendering.
  this.rendered = false;

  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].dispose();
  }

  Blockly.BlockSvg.superClass_.dispose.call(this, healStack);

  goog.dom.removeNode(this.svgGroup_);
  // Sever JavaScript to DOM connections.
  this.svgGroup_ = null;
  this.svgPath_ = null;
  this.svgPathLight_ = null;
  this.svgPathDark_ = null;
};

/**
 * Play some UI effects (sound, animation) when disposing of a block.
 */
Blockly.BlockSvg.prototype.disposeUiEffect = function() {
  this.workspace.playAudio('delete');

  var xy = Blockly.getSvgXY_(/** @type {!Element} */ (this.svgGroup_),
                             this.workspace);
  // Deeply clone the current block.
  var clone = this.svgGroup_.cloneNode(true);
  clone.translateX_ = xy.x;
  clone.translateY_ = xy.y;
  clone.setAttribute('transform',
      'translate(' + clone.translateX_ + ',' + clone.translateY_ + ')');
  this.workspace.options.svg.appendChild(clone);
  clone.bBox_ = clone.getBBox();
  // Start the animation.
  Blockly.BlockSvg.disposeUiStep_(clone, this.RTL, new Date(),
      this.workspace.scale);
};

/**
 * Animate a cloned block and eventually dispose of it.
 * This is a class method, not an instace method since the original block has
 * been destroyed and is no longer accessible.
 * @param {!Element} clone SVG element to animate and dispose of.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
Blockly.BlockSvg.disposeUiStep_ = function(clone, rtl, start, workspaceScale) {
  var ms = (new Date()) - start;
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

  // Determine the absolute coordinates of the inferior block.
  var xy = Blockly.getSvgXY_(/** @type {!Element} */ (this.svgGroup_),
                             this.workspace);
  // Offset the coordinates based on the two connection types, fix scale.
  if (this.outputConnection) {
    xy.x += (this.RTL ? 3 : -3) * this.workspace.scale;
    xy.y += 13 * this.workspace.scale;
  } else if (this.previousConnection) {
    xy.x += (this.RTL ? -23 : 23) * this.workspace.scale;
    xy.y += 3 * this.workspace.scale;
  }
  var ripple = Blockly.createSvgElement('circle',
      {'cx': xy.x, 'cy': xy.y, 'r': 0, 'fill': 'none',
       'stroke': '#888', 'stroke-width': 10},
      this.workspace.options.svg);
  // Start the animation.
  Blockly.BlockSvg.connectionUiStep_(ripple, new Date(), this.workspace.scale);
};

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
Blockly.BlockSvg.connectionUiStep_ = function(ripple, start, workspaceScale) {
  var ms = (new Date()) - start;
  var percent = ms / 150;
  if (percent > 1) {
    goog.dom.removeNode(ripple);
  } else {
    ripple.setAttribute('r', percent * 25 * workspaceScale);
    ripple.style.opacity = 1 - percent;
    var closure = function() {
      Blockly.BlockSvg.connectionUiStep_(ripple, start, workspaceScale);
    };
    setTimeout(closure, 10);
  }
};

/**
 * Change the colour of a block.
 */
Blockly.BlockSvg.prototype.updateColour = function() {
  if (this.disabled) {
    // Disabled blocks don't have colour.
    return;
  }
  var hexColour = Blockly.makeColour(this.getColour());
  var rgb = goog.color.hexToRgb(hexColour);
  var rgbLight = goog.color.lighten(rgb, 0.3);
  var rgbDark = goog.color.darken(rgb, 0.2);
  this.svgPathLight_.setAttribute('stroke', goog.color.rgbArrayToHex(rgbLight));
  this.svgPathDark_.setAttribute('fill', goog.color.rgbArrayToHex(rgbDark));
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
  var hasClass = Blockly.hasClass_(/** @type {!Element} */ (this.svgGroup_),
                                   'blocklyDisabled');
  if (this.disabled || this.getInheritedDisabled()) {
    if (!hasClass) {
      Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
                        'blocklyDisabled');
      this.svgPath_.setAttribute('fill', 'url(#blocklyDisabledPattern)');
    }
  } else {
    if (hasClass) {
      Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
                           'blocklyDisabled');
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
    // Kill all previous pending processes, this edit supercedes them all.
    for (var n in this.setWarningText.pid_) {
      clearTimeout(this.setWarningText.pid_[n]);
      delete this.setWarningText.pid_[n];
    }
  } else if (this.setWarningText.pid_[id]) {
    // Only queue up the latest change.  Kill any earlier pending process.
    clearTimeout(this.setWarningText.pid_[id]);
    delete this.setWarningText.pid_[id];
  }
  if (Blockly.dragMode_ == 2) {
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
      changedState = oldText == newText;
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
    if (this.rendered) {
      mutator.createIcon();
    }
  }
};

/**
 * Set whether the block is disabled or not.
 * @param {boolean} disabled True if disabled.
 */
Blockly.BlockSvg.prototype.setDisabled = function(disabled) {
  if (this.disabled == disabled) {
    return;
  }
  Blockly.BlockSvg.superClass_.setDisabled.call(this, disabled);
  if (this.rendered) {
    this.updateDisabled();
  }
  this.workspace.fireChangeEvent();
};

/**
 * Select this block.  Highlight it visually.
 */
Blockly.BlockSvg.prototype.addSelect = function() {
  Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
                    'blocklySelected');
  // Move the selected block to the top of the stack.
  this.svgGroup_.parentNode.appendChild(this.svgGroup_);
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.BlockSvg.prototype.removeSelect = function() {
  Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
                       'blocklySelected');
};

/**
 * Adds the dragging class to this block.
 * Also disables the highlights/shadows to improve performance.
 */
Blockly.BlockSvg.prototype.addDragging = function() {
  Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
                    'blocklyDragging');
};

/**
 * Removes the dragging class from this block.
 */
Blockly.BlockSvg.prototype.removeDragging = function() {
  Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
                       'blocklyDragging');
};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {boolean=} opt_bubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
Blockly.BlockSvg.prototype.render = function(opt_bubble) {
  this.rendered = true;

  var cursorX = Blockly.BlockSvg.SEP_SPACE_X;
  if (this.RTL) {
    cursorX = -cursorX;
  }
  // Move the icons into position.
  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    cursorX = icons[i].renderIcon(cursorX);
  }
  cursorX += this.RTL ?
      Blockly.BlockSvg.SEP_SPACE_X : -Blockly.BlockSvg.SEP_SPACE_X;
  // If there are no icons, cursorX will be 0, otherwise it will be the
  // width that the first label needs to move over by.

  var inputRows = this.renderCompute_(cursorX);
  this.renderDraw_(cursorX, inputRows);

  if (opt_bubble !== false) {
    // Render all blocks above this one (propagate a reflow).
    var parentBlock = this.getParent();
    if (parentBlock) {
      parentBlock.render(true);
    } else {
      // Top-most block.  Fire an event to allow scrollbars to resize.
      Blockly.fireUiEvent(window, 'resize');
    }
  }
  Blockly.Realtime.blockChanged(this);
};

/**
 * Render a list of fields starting at the specified location.
 * @param {!Array.<!Blockly.Field>} fieldList List of fields.
 * @param {number} cursorX X-coordinate to start the fields.
 * @param {number} cursorY Y-coordinate to start the fields.
 * @return {number} X-coordinate of the end of the field row (plus a gap).
 * @private
 */
Blockly.BlockSvg.prototype.renderFields_ =
    function(fieldList, cursorX, cursorY) {
  if (this.RTL) {
    cursorX = -cursorX;
  }
  for (var t = 0, field; field = fieldList[t]; t++) {
    var root = field.getSvgRoot();
    if (!root) {
      continue;
    }
    if (this.RTL) {
      cursorX -= field.renderSep + field.renderWidth;
      root.setAttribute('transform',
          'translate(' + cursorX + ',' + cursorY + ')');
      if (field.renderWidth) {
        cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
      }
    } else {
      root.setAttribute('transform',
          'translate(' + (cursorX + field.renderSep) + ',' + cursorY + ')');
      if (field.renderWidth) {
        cursorX += field.renderSep + field.renderWidth +
            Blockly.BlockSvg.SEP_SPACE_X;
      }
    }
  }
  return this.RTL ? -cursorX : cursorX;
};

/**
 * Computes the height and widths for each row and field.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {!Array.<!Array.<!Object>>} 2D array of objects, each containing
 *     position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderCompute_ = function(iconWidth) {
  var inputList = this.inputList;
  var inputRows = [];
  inputRows.rightEdge = iconWidth + Blockly.BlockSvg.SEP_SPACE_X * 2;
  if (this.previousConnection || this.nextConnection) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge,
        Blockly.BlockSvg.NOTCH_WIDTH + Blockly.BlockSvg.SEP_SPACE_X);
  }
  var fieldValueWidth = 0;  // Width of longest external value field.
  var fieldStatementWidth = 0;  // Width of longest statement field.
  var hasValue = false;
  var hasStatement = false;
  var hasDummy = false;
  var lastType = undefined;
  var isInline = this.getInputsInline() && !this.isCollapsed();
  for (var i = 0, input; input = inputList[i]; i++) {
    if (!input.isVisible()) {
      continue;
    }
    var row;
    if (!isInline || !lastType ||
        lastType == Blockly.NEXT_STATEMENT ||
        input.type == Blockly.NEXT_STATEMENT) {
      // Create new row.
      lastType = input.type;
      row = [];
      if (isInline && input.type != Blockly.NEXT_STATEMENT) {
        row.type = Blockly.BlockSvg.INLINE;
      } else {
        row.type = input.type;
      }
      row.height = 0;
      inputRows.push(row);
    } else {
      row = inputRows[inputRows.length - 1];
    }
    row.push(input);

    // Compute minimum input size.
    input.renderHeight = Blockly.BlockSvg.MIN_BLOCK_Y;
    // The width is currently only needed for inline value inputs.
    if (isInline && input.type == Blockly.INPUT_VALUE) {
      input.renderWidth = Blockly.BlockSvg.TAB_WIDTH +
          Blockly.BlockSvg.SEP_SPACE_X * 1.25;
    } else {
      input.renderWidth = 0;
    }
    // Expand input size if there is a connection.
    if (input.connection && input.connection.targetConnection) {
      var linkedBlock = input.connection.targetBlock();
      var bBox = linkedBlock.getHeightWidth();
      input.renderHeight = Math.max(input.renderHeight, bBox.height);
      input.renderWidth = Math.max(input.renderWidth, bBox.width);
    }
    // Blocks have a one pixel shadow that should sometimes overhang.
    if (!isInline && i == inputList.length - 1) {
      // Last value input should overhang.
      input.renderHeight--;
    } else if (!isInline && input.type == Blockly.INPUT_VALUE &&
        inputList[i + 1] && inputList[i + 1].type == Blockly.NEXT_STATEMENT) {
      // Value input above statement input should overhang.
      input.renderHeight--;
    }

    row.height = Math.max(row.height, input.renderHeight);
    input.fieldWidth = 0;
    if (inputRows.length == 1) {
      // The first row gets shifted to accommodate any icons.
      input.fieldWidth += this.RTL ? -iconWidth : iconWidth;
    }
    var previousFieldEditable = false;
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (j != 0) {
        input.fieldWidth += Blockly.BlockSvg.SEP_SPACE_X;
      }
      // Get the dimensions of the field.
      var fieldSize = field.getSize();
      field.renderWidth = fieldSize.width;
      field.renderSep = (previousFieldEditable && field.EDITABLE) ?
          Blockly.BlockSvg.SEP_SPACE_X : 0;
      input.fieldWidth += field.renderWidth + field.renderSep;
      row.height = Math.max(row.height, fieldSize.height);
      previousFieldEditable = field.EDITABLE;
    }

    if (row.type != Blockly.BlockSvg.INLINE) {
      if (row.type == Blockly.NEXT_STATEMENT) {
        hasStatement = true;
        fieldStatementWidth = Math.max(fieldStatementWidth, input.fieldWidth);
      } else {
        if (row.type == Blockly.INPUT_VALUE) {
          hasValue = true;
        } else if (row.type == Blockly.DUMMY_INPUT) {
          hasDummy = true;
        }
        fieldValueWidth = Math.max(fieldValueWidth, input.fieldWidth);
      }
    }
  }

  // Make inline rows a bit thicker in order to enclose the values.
  for (var y = 0, row; row = inputRows[y]; y++) {
    row.thicker = false;
    if (row.type == Blockly.BlockSvg.INLINE) {
      for (var z = 0, input; input = row[z]; z++) {
        if (input.type == Blockly.INPUT_VALUE) {
          row.height += 2 * Blockly.BlockSvg.INLINE_PADDING_Y;
          row.thicker = true;
          break;
        }
      }
    }
  }

  // Compute the statement edge.
  // This is the width of a block where statements are nested.
  inputRows.statementEdge = 2 * Blockly.BlockSvg.SEP_SPACE_X +
      fieldStatementWidth;
  // Compute the preferred right edge.  Inline blocks may extend beyond.
  // This is the width of the block where external inputs connect.
  if (hasStatement) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge,
        inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH);
  }
  if (hasValue) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, fieldValueWidth +
        Blockly.BlockSvg.SEP_SPACE_X * 2 + Blockly.BlockSvg.TAB_WIDTH);
  } else if (hasDummy) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, fieldValueWidth +
        Blockly.BlockSvg.SEP_SPACE_X * 2);
  }

  inputRows.hasValue = hasValue;
  inputRows.hasStatement = hasStatement;
  inputRows.hasDummy = hasDummy;
  return inputRows;
};


/**
 * Draw the path of the block.
 * Move the fields to the correct locations.
 * @param {number} iconWidth Offset of first row due to icons.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderDraw_ = function(iconWidth, inputRows) {
  // Should the top and bottom left corners be rounded or square?
  if (this.outputConnection) {
    this.squareTopLeftCorner_ = true;
    this.squareBottomLeftCorner_ = true;
  } else {
    this.squareTopLeftCorner_ = false;
    this.squareBottomLeftCorner_ = false;
    // If this block is in the middle of a stack, square the corners.
    if (this.previousConnection) {
      var prevBlock = this.previousConnection.targetBlock();
      if (prevBlock && prevBlock.getNextBlock() == this) {
        this.squareTopLeftCorner_ = true;
       }
    }
    var nextBlock = this.getNextBlock();
    if (nextBlock) {
      this.squareBottomLeftCorner_ = true;
    }
  }

  // Fetch the block's coordinates on the surface for use in anchoring
  // the connections.
  var connectionsXY = this.getRelativeToSurfaceXY();

  // Assemble the block's path.
  var steps = [];
  var inlineSteps = [];
  // The highlighting applies to edges facing the upper-left corner.
  // Since highlighting is a two-pixel wide border, it would normally overhang
  // the edge of the block by a pixel. So undersize all measurements by a pixel.
  var highlightSteps = [];
  var highlightInlineSteps = [];

  this.renderDrawTop_(steps, highlightSteps, connectionsXY,
      inputRows.rightEdge);
  var cursorY = this.renderDrawRight_(steps, highlightSteps, inlineSteps,
      highlightInlineSteps, connectionsXY, inputRows, iconWidth);
  this.renderDrawBottom_(steps, highlightSteps, connectionsXY, cursorY);
  this.renderDrawLeft_(steps, highlightSteps, connectionsXY, cursorY);

  var pathString = steps.join(' ') + '\n' + inlineSteps.join(' ');
  this.svgPath_.setAttribute('d', pathString);
  this.svgPathDark_.setAttribute('d', pathString);
  pathString = highlightSteps.join(' ') + '\n' + highlightInlineSteps.join(' ');
  this.svgPathLight_.setAttribute('d', pathString);
  if (this.RTL) {
    // Mirror the block's path.
    this.svgPath_.setAttribute('transform', 'scale(-1 1)');
    this.svgPathLight_.setAttribute('transform', 'scale(-1 1)');
    this.svgPathDark_.setAttribute('transform', 'translate(1,1) scale(-1 1)');
  }
};

/**
 * Render the top edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} rightEdge Minimum width of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawTop_ =
    function(steps, highlightSteps, connectionsXY, rightEdge) {
  // Position the cursor at the top-left starting point.
  if (this.squareTopLeftCorner_) {
    steps.push('m 0,0');
    highlightSteps.push('m 0.5,0.5');
  } else {
    steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_START);
    highlightSteps.push(this.RTL ?
        Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL :
        Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR);
    // Top-left rounded corner.
    steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER);
    highlightSteps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT);
  }

  // Top edge.
  if (this.previousConnection) {
    steps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
    highlightSteps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
    steps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT);
    highlightSteps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT);
    // Create previous block connection.
    var connectionX = connectionsXY.x + (this.RTL ?
        -Blockly.BlockSvg.NOTCH_WIDTH : Blockly.BlockSvg.NOTCH_WIDTH);
    var connectionY = connectionsXY.y;
    this.previousConnection.moveTo(connectionX, connectionY);
    // This connection will be tightened when the parent renders.
  }
  steps.push('H', rightEdge);
  highlightSteps.push('H', rightEdge - 0.5);
  this.width = rightEdge;
};

/**
 * Render the right edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Array.<string>} inlineSteps Inline block outlines.
 * @param {!Array.<string>} highlightInlineSteps Inline block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {number} Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawRight_ = function(steps, highlightSteps,
    inlineSteps, highlightInlineSteps, connectionsXY, inputRows, iconWidth) {
  var cursorX;
  var cursorY = 0;
  var connectionX, connectionY;
  for (var y = 0, row; row = inputRows[y]; y++) {
    cursorX = Blockly.BlockSvg.SEP_SPACE_X;
    if (y == 0) {
      cursorX += this.RTL ? -iconWidth : iconWidth;
    }
    highlightSteps.push('M', (inputRows.rightEdge - 0.5) + ',' +
        (cursorY + 0.5));
    if (this.isCollapsed()) {
      // Jagged right edge.
      var input = row[0];
      var fieldX = cursorX;
      var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
      this.renderFields_(input.fieldRow, fieldX, fieldY);
      steps.push(Blockly.BlockSvg.JAGGED_TEETH);
      highlightSteps.push('h 8');
      var remainder = row.height - Blockly.BlockSvg.JAGGED_TEETH_HEIGHT;
      steps.push('v', remainder);
      if (this.RTL) {
        highlightSteps.push('v 3.9 l 7.2,3.4 m -14.5,8.9 l 7.3,3.5');
        highlightSteps.push('v', remainder - 0.7);
      }
      this.width += Blockly.BlockSvg.JAGGED_TEETH_WIDTH;
    } else if (row.type == Blockly.BlockSvg.INLINE) {
      // Inline inputs.
      for (var x = 0, input; input = row[x]; x++) {
        var fieldX = cursorX;
        var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
        if (row.thicker) {
          // Lower the field slightly.
          fieldY += Blockly.BlockSvg.INLINE_PADDING_Y;
        }
        // TODO: Align inline field rows (left/right/centre).
        cursorX = this.renderFields_(input.fieldRow, fieldX, fieldY);
        if (input.type != Blockly.DUMMY_INPUT) {
          cursorX += input.renderWidth + Blockly.BlockSvg.SEP_SPACE_X;
        }
        if (input.type == Blockly.INPUT_VALUE) {
          inlineSteps.push('M', (cursorX - Blockly.BlockSvg.SEP_SPACE_X) +
                           ',' + (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y));
          inlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH - 2 -
                           input.renderWidth);
          inlineSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
          inlineSteps.push('v', input.renderHeight + 1 -
                                Blockly.BlockSvg.TAB_HEIGHT);
          inlineSteps.push('h', input.renderWidth + 2 -
                           Blockly.BlockSvg.TAB_WIDTH);
          inlineSteps.push('z');
          if (this.RTL) {
            // Highlight right edge, around back of tab, and bottom.
            highlightInlineSteps.push('M',
                (cursorX - Blockly.BlockSvg.SEP_SPACE_X - 2.5 +
                 Blockly.BlockSvg.TAB_WIDTH - input.renderWidth) + ',' +
                (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y + 0.5));
            highlightInlineSteps.push(
                Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL);
            highlightInlineSteps.push('v',
                input.renderHeight - Blockly.BlockSvg.TAB_HEIGHT + 2.5);
            highlightInlineSteps.push('h',
                input.renderWidth - Blockly.BlockSvg.TAB_WIDTH + 2);
          } else {
            // Highlight right edge, bottom.
            highlightInlineSteps.push('M',
                (cursorX - Blockly.BlockSvg.SEP_SPACE_X + 0.5) + ',' +
                (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y + 0.5));
            highlightInlineSteps.push('v', input.renderHeight + 1);
            highlightInlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH - 2 -
                                           input.renderWidth);
            // Short highlight glint at bottom of tab.
            highlightInlineSteps.push('M',
                (cursorX - input.renderWidth - Blockly.BlockSvg.SEP_SPACE_X +
                 0.9) + ',' + (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y +
                 Blockly.BlockSvg.TAB_HEIGHT - 0.7));
            highlightInlineSteps.push('l',
                (Blockly.BlockSvg.TAB_WIDTH * 0.46) + ',-2.1');
          }
          // Create inline input connection.
          if (this.RTL) {
            connectionX = connectionsXY.x - cursorX -
                Blockly.BlockSvg.TAB_WIDTH + Blockly.BlockSvg.SEP_SPACE_X +
                input.renderWidth + 1;
          } else {
            connectionX = connectionsXY.x + cursorX +
                Blockly.BlockSvg.TAB_WIDTH - Blockly.BlockSvg.SEP_SPACE_X -
                input.renderWidth - 1;
          }
          connectionY = connectionsXY.y + cursorY +
              Blockly.BlockSvg.INLINE_PADDING_Y + 1;
          input.connection.moveTo(connectionX, connectionY);
          if (input.connection.targetConnection) {
            input.connection.tighten_();
          }
        }
      }

      cursorX = Math.max(cursorX, inputRows.rightEdge);
      this.width = Math.max(this.width, cursorX);
      steps.push('H', cursorX);
      highlightSteps.push('H', cursorX - 0.5);
      steps.push('v', row.height);
      if (this.RTL) {
        highlightSteps.push('v', row.height - 1);
      }
    } else if (row.type == Blockly.INPUT_VALUE) {
      // External input.
      var input = row[0];
      var fieldX = cursorX;
      var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
      if (input.align != Blockly.ALIGN_LEFT) {
        var fieldRightX = inputRows.rightEdge - input.fieldWidth -
            Blockly.BlockSvg.TAB_WIDTH - 2 * Blockly.BlockSvg.SEP_SPACE_X;
        if (input.align == Blockly.ALIGN_RIGHT) {
          fieldX += fieldRightX;
        } else if (input.align == Blockly.ALIGN_CENTRE) {
          fieldX += (fieldRightX + fieldX) / 2;
        }
      }
      this.renderFields_(input.fieldRow, fieldX, fieldY);
      steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
      var v = row.height - Blockly.BlockSvg.TAB_HEIGHT;
      steps.push('v', v);
      if (this.RTL) {
        // Highlight around back of tab.
        highlightSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL);
        highlightSteps.push('v', v + 0.5);
      } else {
        // Short highlight glint at bottom of tab.
        highlightSteps.push('M', (inputRows.rightEdge - 5) + ',' +
            (cursorY + Blockly.BlockSvg.TAB_HEIGHT - 0.7));
        highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * 0.46) +
            ',-2.1');
      }
      // Create external input connection.
      connectionX = connectionsXY.x +
          (this.RTL ? -inputRows.rightEdge - 1 : inputRows.rightEdge + 1);
      connectionY = connectionsXY.y + cursorY;
      input.connection.moveTo(connectionX, connectionY);
      if (input.connection.targetConnection) {
        input.connection.tighten_();
        this.width = Math.max(this.width, inputRows.rightEdge +
            input.connection.targetBlock().getHeightWidth().width -
            Blockly.BlockSvg.TAB_WIDTH + 1);
      }
    } else if (row.type == Blockly.DUMMY_INPUT) {
      // External naked field.
      var input = row[0];
      var fieldX = cursorX;
      var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
      if (input.align != Blockly.ALIGN_LEFT) {
        var fieldRightX = inputRows.rightEdge - input.fieldWidth -
            2 * Blockly.BlockSvg.SEP_SPACE_X;
        if (inputRows.hasValue) {
          fieldRightX -= Blockly.BlockSvg.TAB_WIDTH;
        }
        if (input.align == Blockly.ALIGN_RIGHT) {
          fieldX += fieldRightX;
        } else if (input.align == Blockly.ALIGN_CENTRE) {
          fieldX += (fieldRightX + fieldX) / 2;
        }
      }
      this.renderFields_(input.fieldRow, fieldX, fieldY);
      steps.push('v', row.height);
      if (this.RTL) {
        highlightSteps.push('v', row.height - 1);
      }
    } else if (row.type == Blockly.NEXT_STATEMENT) {
      // Nested statement.
      var input = row[0];
      if (y == 0) {
        // If the first input is a statement stack, add a small row on top.
        steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
        if (this.RTL) {
          highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
        }
        cursorY += Blockly.BlockSvg.SEP_SPACE_Y;
      }
      var fieldX = cursorX;
      var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
      if (input.align != Blockly.ALIGN_LEFT) {
        var fieldRightX = inputRows.statementEdge - input.fieldWidth -
            2 * Blockly.BlockSvg.SEP_SPACE_X;
        if (input.align == Blockly.ALIGN_RIGHT) {
          fieldX += fieldRightX;
        } else if (input.align == Blockly.ALIGN_CENTRE) {
          fieldX += (fieldRightX + fieldX) / 2;
        }
      }
      this.renderFields_(input.fieldRow, fieldX, fieldY);
      cursorX = inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH;
      steps.push('H', cursorX);
      steps.push(Blockly.BlockSvg.INNER_TOP_LEFT_CORNER);
      steps.push('v', row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
      steps.push(Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER);
      steps.push('H', inputRows.rightEdge);
      if (this.RTL) {
        highlightSteps.push('M',
            (cursorX - Blockly.BlockSvg.NOTCH_WIDTH +
             Blockly.BlockSvg.DISTANCE_45_OUTSIDE) +
            ',' + (cursorY + Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
        highlightSteps.push(
            Blockly.BlockSvg.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL);
        highlightSteps.push('v',
            row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
        highlightSteps.push(
            Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL);
        highlightSteps.push('H', inputRows.rightEdge - 0.5);
      } else {
        highlightSteps.push('M',
            (cursorX - Blockly.BlockSvg.NOTCH_WIDTH +
             Blockly.BlockSvg.DISTANCE_45_OUTSIDE) + ',' +
            (cursorY + row.height - Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
        highlightSteps.push(
            Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR);
        highlightSteps.push('H', inputRows.rightEdge - 0.5);
      }
      // Create statement connection.
      connectionX = connectionsXY.x + (this.RTL ? -cursorX : cursorX + 1);
      connectionY = connectionsXY.y + cursorY + 1;
      input.connection.moveTo(connectionX, connectionY);
      if (input.connection.targetConnection) {
        input.connection.tighten_();
        this.width = Math.max(this.width, inputRows.statementEdge +
            input.connection.targetBlock().getHeightWidth().width);
      }
      if (y == inputRows.length - 1 ||
          inputRows[y + 1].type == Blockly.NEXT_STATEMENT) {
        // If the final input is a statement stack, add a small row underneath.
        // Consecutive statement stacks are also separated by a small divider.
        steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
        if (this.RTL) {
          highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
        }
        cursorY += Blockly.BlockSvg.SEP_SPACE_Y;
      }
    }
    cursorY += row.height;
  }
  if (!inputRows.length) {
    cursorY = Blockly.BlockSvg.MIN_BLOCK_Y;
    steps.push('V', cursorY);
    if (this.RTL) {
      highlightSteps.push('V', cursorY - 1);
    }
  }
  return cursorY;
};

/**
 * Render the bottom edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawBottom_ =
    function(steps, highlightSteps, connectionsXY, cursorY) {
  this.height = cursorY + 1;  // Add one for the shadow.
  if (this.nextConnection) {
    steps.push('H', (Blockly.BlockSvg.NOTCH_WIDTH + (this.RTL ? 0.5 : - 0.5)) +
        ' ' + Blockly.BlockSvg.NOTCH_PATH_RIGHT);
    // Create next block connection.
    var connectionX;
    if (this.RTL) {
      connectionX = connectionsXY.x - Blockly.BlockSvg.NOTCH_WIDTH;
    } else {
      connectionX = connectionsXY.x + Blockly.BlockSvg.NOTCH_WIDTH;
    }
    var connectionY = connectionsXY.y + cursorY + 1;
    this.nextConnection.moveTo(connectionX, connectionY);
    if (this.nextConnection.targetConnection) {
      this.nextConnection.tighten_();
    }
    this.height += 4;  // Height of tab.
  }

  // Should the bottom-left corner be rounded or square?
  if (this.squareBottomLeftCorner_) {
    steps.push('H 0');
    if (!this.RTL) {
      highlightSteps.push('M', '0.5,' + (cursorY - 0.5));
    }
  } else {
    steps.push('H', Blockly.BlockSvg.CORNER_RADIUS);
    steps.push('a', Blockly.BlockSvg.CORNER_RADIUS + ',' +
               Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 -' +
               Blockly.BlockSvg.CORNER_RADIUS + ',-' +
               Blockly.BlockSvg.CORNER_RADIUS);
    if (!this.RTL) {
      highlightSteps.push('M', Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
          (cursorY - Blockly.BlockSvg.DISTANCE_45_INSIDE));
      highlightSteps.push('A', (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ',' +
          (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ' 0 0,1 ' +
          '0.5,' + (cursorY - Blockly.BlockSvg.CORNER_RADIUS));
    }
  }
};

/**
 * Render the left edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawLeft_ =
    function(steps, highlightSteps, connectionsXY, cursorY) {
  if (this.outputConnection) {
    // Create output connection.
    this.outputConnection.moveTo(connectionsXY.x, connectionsXY.y);
    // This connection will be tightened when the parent renders.
    steps.push('V', Blockly.BlockSvg.TAB_HEIGHT);
    steps.push('c 0,-10 -' + Blockly.BlockSvg.TAB_WIDTH + ',8 -' +
        Blockly.BlockSvg.TAB_WIDTH + ',-7.5 s ' + Blockly.BlockSvg.TAB_WIDTH +
        ',2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',-7.5');
    if (this.RTL) {
      highlightSteps.push('M', (Blockly.BlockSvg.TAB_WIDTH * -0.25) + ',8.4');
      highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * -0.45) + ',-2.1');
    } else {
      highlightSteps.push('V', Blockly.BlockSvg.TAB_HEIGHT - 1.5);
      highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * -0.92) +
                          ',-0.5 q ' + (Blockly.BlockSvg.TAB_WIDTH * -0.19) +
                          ',-5.5 0,-11');
      highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * 0.92) +
                          ',1 V 0.5 H 1');
    }
    this.width += Blockly.BlockSvg.TAB_WIDTH;
  } else if (!this.RTL) {
    if (this.squareTopLeftCorner_) {
      // Statement block in a stack.
      highlightSteps.push('V', 0.5);
    } else {
      highlightSteps.push('V', Blockly.BlockSvg.CORNER_RADIUS);
    }
  }
  steps.push('z');
};
