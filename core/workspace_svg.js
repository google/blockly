/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2014 Google Inc.
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
 * @fileoverview Object representing a workspace rendered as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.WorkspaceSvg');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.ScrollbarPair');
goog.require('Blockly.Trashcan');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');
goog.require('goog.math');
goog.require('goog.math.Coordinate');


/**
 * Class for a workspace.  This is an onscreen area with optional trashcan,
 * scrollbars, bubbles, and dragging.
 * @param {Function} getMetrics A function that returns size/scrolling metrics.
 * @param {Function} setMetrics A function that sets size/scrolling metrics.
 * @extends {Blockly.Workspace}
 * @constructor
 */
Blockly.WorkspaceSvg = function(getMetrics, setMetrics) {
  Blockly.WorkspaceSvg.superClass_.constructor.call(this);
  this.getMetrics = getMetrics;
  this.setMetrics = setMetrics;

  Blockly.ConnectionDB.init(this);
};
goog.inherits(Blockly.WorkspaceSvg, Blockly.Workspace);

/**
 * Svg workspaces are user-visible (as opposed to a headless workspace).
 * @type {boolean} True if visible.  False if headless.
 */
Blockly.WorkspaceSvg.prototype.rendered = true;

/**
 * Is this workspace the surface for a flyout?
 * @type {boolean}
 */
Blockly.WorkspaceSvg.prototype.isFlyout = false;

/**
 * Can this workspace be dragged around (true) or is it fixed (false)?
 * @type {boolean}
 */
Blockly.WorkspaceSvg.prototype.dragMode = false;

/**
 * Current horizontal scrolling offset.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.scrollX = 0;

/**
 * Current vertical scrolling offset.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.scrollY = 0;

/**
 * The workspace's trashcan (if any).
 * @type {Blockly.Trashcan}
 */
Blockly.WorkspaceSvg.prototype.trashcan = null;

/**
 * PID of upcoming firing of a change event.  Used to fire only one event
 * after multiple changes.
 * @type {?number}
 * @private
 */
Blockly.WorkspaceSvg.prototype.fireChangeEventPid_ = null;

/**
 * This workspace's scrollbars, if they exist.
 * @type {Blockly.ScrollbarPair}
 */
Blockly.WorkspaceSvg.prototype.scrollbar = null;

/**
 * Create the trash can elements.
 * @return {!Element} The workspace's SVG group.
 */
Blockly.WorkspaceSvg.prototype.createDom = function() {
  /*
  <g>
    [Trashcan may go here]
    <g></g>  // Block canvas
    <g></g>  // Bubble canvas
    [Scrollbars may go here]
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
  this.svgBlockCanvas_ = Blockly.createSvgElement('g', {}, this.svgGroup_);
  this.svgBubbleCanvas_ = Blockly.createSvgElement('g', {}, this.svgGroup_);
  this.fireChangeEvent();
  return this.svgGroup_;
};

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.WorkspaceSvg.prototype.dispose = function() {
  // Stop rerendering.
  this.rendered = false;
  Blockly.WorkspaceSvg.superClass_.dispose.call(this);
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgBlockCanvas_ = null;
  this.svgBubbleCanvas_ = null;
  if (this.flyout_) {
    this.flyout_.dispose();
    this.flyout_ = null;
  }
  if (this.trashcan) {
    this.trashcan.dispose();
    this.trashcan = null;
  }
};

/**
 * Add a trashcan.
 */
Blockly.WorkspaceSvg.prototype.addTrashcan = function() {
  if (Blockly.hasTrashcan && !Blockly.readOnly) {
    this.trashcan = new Blockly.Trashcan(this);
    var svgTrashcan = this.trashcan.createDom();
    this.svgGroup_.insertBefore(svgTrashcan, this.svgBlockCanvas_);
    this.trashcan.init();
  }
};

/**
 * Get the SVG element that forms the drawing surface.
 * @return {!Element} SVG element.
 */
Blockly.WorkspaceSvg.prototype.getCanvas = function() {
  return this.svgBlockCanvas_;
};

/**
 * Get the SVG element that forms the bubble surface.
 * @return {!SVGGElement} SVG element.
 */
Blockly.WorkspaceSvg.prototype.getBubbleCanvas = function() {
  return this.svgBubbleCanvas_;
};

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.WorkspaceSvg.prototype.addTopBlock = function(block) {
  Blockly.WorkspaceSvg.superClass_.addTopBlock.call(this, block);
  if (Blockly.Realtime.isEnabled() && this == Blockly.mainWorkspace) {
    Blockly.Realtime.addTopBlock(block);
  }
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.WorkspaceSvg.prototype.removeTopBlock = function(block) {
  Blockly.WorkspaceSvg.superClass_.removeTopBlock.call(this, block);
  if (Blockly.Realtime.isEnabled() && this == Blockly.mainWorkspace) {
    Blockly.Realtime.removeTopBlock(block);
  }
};

/**
 * Dispose of all blocks in workspace.
 */
Blockly.WorkspaceSvg.prototype.clear = function() {
  Blockly.hideChaff();
  Blockly.WorkspaceSvg.superClass_.clear.call(this);
};

/**
 * Returns the horizontal offset of the workspace.
 * Intended for LTR/RTL compatibility in XML.
 * @return {number} Width.
 */
Blockly.WorkspaceSvg.prototype.getWidth = function() {
  return this.getMetrics().viewWidth;
};

/**
 * Render all blocks in workspace.
 */
Blockly.WorkspaceSvg.prototype.render = function() {
  var renderList = this.getAllBlocks();
  for (var x = 0, block; block = renderList[x]; x++) {
    if (!block.getChildren().length) {
      block.render();
    }
  }
};

/**
 * Turn the visual trace functionality on or off.
 * @param {boolean} armed True if the trace should be on.
 */
Blockly.WorkspaceSvg.prototype.traceOn = function(armed) {
  this.traceOn_ = armed;
  if (this.traceWrapper_) {
    Blockly.unbindEvent_(this.traceWrapper_);
    this.traceWrapper_ = null;
  }
  if (armed) {
    this.traceWrapper_ = Blockly.bindEvent_(this.svgBlockCanvas_,
        'blocklySelectChange', this, function() {this.traceOn_ = false});
  }
};

/**
 * Highlight a block in the workspace.
 * @param {?string} id ID of block to find.
 */
Blockly.WorkspaceSvg.prototype.highlightBlock = function(id) {
  if (this.traceOn_ && Blockly.dragMode_ != 0) {
    // The blocklySelectChange event normally prevents this, but sometimes
    // there is a race condition on fast-executing apps.
    this.traceOn(false);
  }
  if (!this.traceOn_) {
    return;
  }
  var block = null;
  if (id) {
    block = this.getBlockById(id);
    if (!block) {
      return;
    }
  }
  // Temporary turn off the listener for selection changes, so that we don't
  // trip the monitor for detecting user activity.
  this.traceOn(false);
  // Select the current block.
  if (block) {
    block.select();
  } else if (Blockly.selected) {
    Blockly.selected.unselect();
  }
  // Restore the monitor for user activity after the selection event has fired.
  var thisWorkspace = this;
  setTimeout(function() {thisWorkspace.traceOn(true);}, 1);
};

/**
 * Fire a change event for this workspace.  Changes include new block, dropdown
 * edits, mutations, connections, etc.  Groups of simultaneous changes (e.g.
 * a tree of blocks being deleted) are merged into one event.
 * Applications may hook workspace changes by listening for
 * 'blocklyWorkspaceChange' on Blockly.mainWorkspace.getCanvas().
 */
Blockly.WorkspaceSvg.prototype.fireChangeEvent = function() {
  if (!this.rendered) {
    return;
  }
  if (this.fireChangeEventPid_) {
    clearTimeout(this.fireChangeEventPid_);
  }
  var canvas = this.svgBlockCanvas_;
  if (canvas) {
    this.fireChangeEventPid_ = setTimeout(function() {
        Blockly.fireUiEvent(canvas, 'blocklyWorkspaceChange');
      }, 0);
  }
};

/**
 * Paste the provided block onto the workspace.
 * @param {!Element} xmlBlock XML block element.
 */
Blockly.WorkspaceSvg.prototype.paste = function(xmlBlock) {
  if (xmlBlock.getElementsByTagName('block').length >=
      this.remainingCapacity()) {
    return;
  }
  var block = Blockly.Xml.domToBlock(this, xmlBlock);
  // Move the duplicate to original position.
  var blockX = parseInt(xmlBlock.getAttribute('x'), 10);
  var blockY = parseInt(xmlBlock.getAttribute('y'), 10);
  if (!isNaN(blockX) && !isNaN(blockY)) {
    if (Blockly.RTL) {
      blockX = -blockX;
    }
    // Offset block until not clobbering another block.
    do {
      var collide = false;
      var allBlocks = this.getAllBlocks();
      for (var x = 0, otherBlock; otherBlock = allBlocks[x]; x++) {
        var otherXY = otherBlock.getRelativeToSurfaceXY();
        if (Math.abs(blockX - otherXY.x) <= 1 &&
            Math.abs(blockY - otherXY.y) <= 1) {
          if (Blockly.RTL) {
            blockX -= Blockly.SNAP_RADIUS;
          } else {
            blockX += Blockly.SNAP_RADIUS;
          }
          blockY += Blockly.SNAP_RADIUS * 2;
          collide = true;
        }
      }
    } while (collide);
    block.moveBy(blockX, blockY);
  }
  block.select();
};

/**
 * Make a list of all the delete areas for this workspace.
 */
Blockly.WorkspaceSvg.prototype.recordDeleteAreas = function() {
  if (this.trashcan) {
    this.deleteAreaTrash_ = this.trashcan.getRect();
  } else {
    this.deleteAreaTrash_ = null;
  }
  if (this.flyout_) {
    this.deleteAreaToolbox_ = this.flyout_.getRect();
  } else if (this.toolbox_) {
    this.deleteAreaToolbox_ = this.toolbox_.getRect();
  } else {
    this.deleteAreaToolbox_ = null;
  }
};

/**
 * Is the mouse event over a delete area (toolbar or non-closing flyout)?
 * Opens or closes the trashcan and sets the cursor as a side effect.
 * @param {!Event} e Mouse move event.
 * @return {boolean} True if event is in a delete area.
 */
Blockly.WorkspaceSvg.prototype.isDeleteArea = function(e) {
  var isDelete = false;
  var mouseXY = Blockly.mouseToSvg(e);
  var xy = new goog.math.Coordinate(mouseXY.x, mouseXY.y);
  if (this.deleteAreaTrash_) {
    if (this.deleteAreaTrash_.contains(xy)) {
      this.trashcan.setOpen_(true);
      Blockly.Css.setCursor(Blockly.Css.Cursor.DELETE);
      return true;
    }
    this.trashcan.setOpen_(false);
  }
  if (this.deleteAreaToolbox_) {
    if (this.deleteAreaToolbox_.contains(xy)) {
      Blockly.Css.setCursor(Blockly.Css.Cursor.DELETE);
      return true;
    }
  }
  Blockly.Css.setCursor(Blockly.Css.Cursor.CLOSED);
  return false;
};

// Export symbols that would otherwise be renamed by Closure compiler.
Blockly.WorkspaceSvg.prototype['clear'] = Blockly.WorkspaceSvg.prototype.clear;
