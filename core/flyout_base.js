/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview Flyout tray containing blocks which may be created.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Flyout');

goog.require('Blockly.Block');
goog.require('Blockly.Comment');
goog.require('Blockly.Events');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.Gesture');
goog.require('Blockly.Touch');
goog.require('Blockly.WorkspaceSvg');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.math.Rect');
goog.require('goog.userAgent');


/**
 * Class for a flyout.
 * @param {!Object} workspaceOptions Dictionary of options for the workspace.
 * @constructor
 */
Blockly.Flyout = function(workspaceOptions) {
  workspaceOptions.getMetrics = this.getMetrics_.bind(this);
  workspaceOptions.setMetrics = this.setMetrics_.bind(this);

  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.workspace_ = new Blockly.WorkspaceSvg(workspaceOptions);
  this.workspace_.isFlyout = true;

  /**
   * Is RTL vs LTR.
   * @type {boolean}
   */
  this.RTL = !!workspaceOptions.RTL;

  /**
   * Position of the toolbox and flyout relative to the workspace.
   * @type {number}
   * @private
   */
  this.toolboxPosition_ = workspaceOptions.toolboxPosition;

  /**
   * Opaque data that can be passed to Blockly.unbindEvent_.
   * @type {!Array.<!Array>}
   * @private
   */
  this.eventWrappers_ = [];

  /**
   * List of background buttons that lurk behind each block to catch clicks
   * landing in the blocks' lakes and bays.
   * @type {!Array.<!Element>}
   * @private
   */
  this.backgroundButtons_ = [];

  /**
   * List of visible buttons.
   * @type {!Array.<!Blockly.FlyoutButton>}
   * @private
   */
  this.buttons_ = [];

  /**
   * List of event listeners.
   * @type {!Array.<!Array>}
   * @private
   */
  this.listeners_ = [];

  /**
   * List of blocks that should always be disabled.
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
  this.permanentlyDisabled_ = [];
};

/**
 * Does the flyout automatically close when a block is created?
 * @type {boolean}
 */
Blockly.Flyout.prototype.autoClose = true;

/**
 * Whether the flyout is visible.
 * @type {boolean}
 * @private
 */
Blockly.Flyout.prototype.isVisible_ = false;

/**
 * Whether the workspace containing this flyout is visible.
 * @type {boolean}
 * @private
 */
Blockly.Flyout.prototype.containerVisible_ = true;

/**
 * Corner radius of the flyout background.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.CORNER_RADIUS = 8;

/**
 * Margin around the edges of the blocks in the flyout.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.MARGIN = Blockly.Flyout.prototype.CORNER_RADIUS;

/**
 * TODO: Move GAP_X and GAP_Y to their appropriate files.
 * Gap between items in horizontal flyouts. Can be overridden with the "sep"
 * element.
 * @const {number}
 */
Blockly.Flyout.prototype.GAP_X = Blockly.Flyout.prototype.MARGIN * 3;

/**
 * Gap between items in vertical flyouts. Can be overridden with the "sep"
 * element.
 * @const {number}
 */
Blockly.Flyout.prototype.GAP_Y = Blockly.Flyout.prototype.MARGIN * 3;

/**
 * Top/bottom padding between scrollbar and edge of flyout background.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.SCROLLBAR_PADDING = 2;

/**
 * Width of flyout.
 * @type {number}
 * @private
 */
Blockly.Flyout.prototype.width_ = 0;

/**
 * Height of flyout.
 * @type {number}
 * @private
 */
Blockly.Flyout.prototype.height_ = 0;

/**
 * Range of a drag angle from a flyout considered "dragging toward workspace".
 * Drags that are within the bounds of this many degrees from the orthogonal
 * line to the flyout edge are considered to be "drags toward the workspace".
 * Example:
 * Flyout                                                  Edge   Workspace
 * [block] /  <-within this angle, drags "toward workspace" |
 * [block] ---- orthogonal to flyout boundary ----          |
 * [block] \                                                |
 * The angle is given in degrees from the orthogonal.
 *
 * This is used to know when to create a new block and when to scroll the
 * flyout. Setting it to 360 means that all drags create a new block.
 * @type {number}
 * @private
*/
Blockly.Flyout.prototype.dragAngleRange_ = 70;

/**
 * Creates the flyout's DOM.  Only needs to be called once.  The flyout can
 * either exist as its own svg element or be a g element nested inside a
 * separate svg element.
 * @param {string} tagName The type of tag to put the flyout in. This
 *     should be <svg> or <g>.
 * @return {!Element} The flyout's SVG group.
 */
Blockly.Flyout.prototype.createDom = function(tagName) {
  /*
  <svg | g>
    <path class="blocklyFlyoutBackground"/>
    <g class="blocklyFlyout"></g>
  </ svg | g>
  */
  // Setting style to display:none to start. The toolbox and flyout
  // hide/show code will set up proper visibility and size later.
  this.svgGroup_ = Blockly.utils.createSvgElement(tagName,
      {'class': 'blocklyFlyout', 'style': 'display: none'}, null);
  this.svgBackground_ = Blockly.utils.createSvgElement('path',
      {'class': 'blocklyFlyoutBackground'}, this.svgGroup_);
  this.svgGroup_.appendChild(this.workspace_.createDom());
  return this.svgGroup_;
};

/**
 * Initializes the flyout.
 * @param {!Blockly.Workspace} targetWorkspace The workspace in which to create
 *     new blocks.
 */
Blockly.Flyout.prototype.init = function(targetWorkspace) {
  this.targetWorkspace_ = targetWorkspace;
  this.workspace_.targetWorkspace = targetWorkspace;
  // Add scrollbar.
  this.scrollbar_ = new Blockly.Scrollbar(this.workspace_,
      this.horizontalLayout_, false, 'blocklyFlyoutScrollbar');

  this.hide();

  Array.prototype.push.apply(this.eventWrappers_,
      Blockly.bindEventWithChecks_(this.svgGroup_, 'wheel', this, this.wheel_));
  if (!this.autoClose) {
    this.filterWrapper_ = this.filterForCapacity_.bind(this);
    this.targetWorkspace_.addChangeListener(this.filterWrapper_);
  }

  // Dragging the flyout up and down.
  Array.prototype.push.apply(this.eventWrappers_,
      Blockly.bindEventWithChecks_(this.svgBackground_, 'mousedown', this,
      this.onMouseDown_));

  // A flyout connected to a workspace doesn't have its own current gesture.
  this.workspace_.getGesture =
      this.targetWorkspace_.getGesture.bind(this.targetWorkspace_);
};

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Flyout.prototype.dispose = function() {
  this.hide();
  Blockly.unbindEvent_(this.eventWrappers_);
  if (this.filterWrapper_) {
    this.targetWorkspace_.removeChangeListener(this.filterWrapper_);
    this.filterWrapper_ = null;
  }
  if (this.scrollbar_) {
    this.scrollbar_.dispose();
    this.scrollbar_ = null;
  }
  if (this.workspace_) {
    this.workspace_.targetWorkspace = null;
    this.workspace_.dispose();
    this.workspace_ = null;
  }
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgBackground_ = null;
  this.targetWorkspace_ = null;
};

/**
 * Get the width of the flyout.
 * @return {number} The width of the flyout.
 */
Blockly.Flyout.prototype.getWidth = function() {
  return this.width_;
};

/**
 * Get the height of the flyout.
 * @return {number} The width of the flyout.
 */
Blockly.Flyout.prototype.getHeight = function() {
  return this.height_;
};

/**
 * Get the workspace inside the flyout.
 * @return {!Blockly.WorkspaceSvg} The workspace inside the flyout.
 * @package
 */
Blockly.Flyout.prototype.getWorkspace = function() {
  return this.workspace_;
};

/**
 * Is the flyout visible?
 * @return {boolean} True if visible.
 */
Blockly.Flyout.prototype.isVisible = function() {
  return this.isVisible_;
};

 /**
 * Set whether the flyout is visible. A value of true does not necessarily mean
 * that the flyout is shown. It could be hidden because its container is hidden.
 * @param {boolean} visible True if visible.
 */
Blockly.Flyout.prototype.setVisible = function(visible) {
  var visibilityChanged = (visible != this.isVisible());

  this.isVisible_ = visible;
  if (visibilityChanged) {
    this.updateDisplay_();
  }
};

/**
 * Set whether this flyout's container is visible.
 * @param {boolean} visible Whether the container is visible.
 */
Blockly.Flyout.prototype.setContainerVisible = function(visible) {
  var visibilityChanged = (visible != this.containerVisible_);
  this.containerVisible_ = visible;
  if (visibilityChanged) {
    this.updateDisplay_();
  }
};

/**
 * Update the display property of the flyout based whether it thinks it should
 * be visible and whether its containing workspace is visible.
 * @private
 */
Blockly.Flyout.prototype.updateDisplay_ = function() {
  var show = true;
  if (!this.containerVisible_) {
    show = false;
  } else {
    show = this.isVisible();
  }
  this.svgGroup_.style.display = show ? 'block' : 'none';
  // Update the scrollbar's visiblity too since it should mimic the
  // flyout's visibility.
  this.scrollbar_.setContainerVisible(show);
};

/**
 * Hide and empty the flyout.
 */
Blockly.Flyout.prototype.hide = function() {
  if (!this.isVisible()) {
    return;
  }
  this.setVisible(false);
  // Delete all the event listeners.
  for (var x = 0, listen; listen = this.listeners_[x]; x++) {
    Blockly.unbindEvent_(listen);
  }
  this.listeners_.length = 0;
  if (this.reflowWrapper_) {
    this.workspace_.removeChangeListener(this.reflowWrapper_);
    this.reflowWrapper_ = null;
  }
  // Do NOT delete the blocks here.  Wait until Flyout.show.
  // https://neil.fraser.name/news/2014/08/09/
};

/**
 * Show and populate the flyout.
 * @param {!Array|string} xmlList List of blocks to show.
 *     Variables and procedures have a custom set of blocks.
 */
Blockly.Flyout.prototype.show = function(xmlList) {
  this.workspace_.setResizesEnabled(false);
  this.hide();
  this.clearOldBlocks_();

  // Handle dynamic categories, represented by a name instead of a list of XML.
  // Look up the correct category generation function and call that to get a
  // valid XML list.
  if (typeof xmlList == 'string') {
    var fnToApply = this.workspace_.targetWorkspace.getToolboxCategoryCallback(
        xmlList);
    goog.asserts.assert(goog.isFunction(fnToApply),
        'Couldn\'t find a callback function when opening a toolbox category.');
    xmlList = fnToApply(this.workspace_.targetWorkspace);
    goog.asserts.assert(goog.isArray(xmlList),
        'The result of a toolbox category callback must be an array.');
  }

  this.setVisible(true);
  // Create the blocks to be shown in this flyout.
  var contents = [];
  var gaps = [];
  this.permanentlyDisabled_.length = 0;
  for (var i = 0, xml; xml = xmlList[i]; i++) {
    if (xml.tagName) {
      var tagName = xml.tagName.toUpperCase();
      var default_gap = this.horizontalLayout_ ? this.GAP_X : this.GAP_Y;
      if (tagName == 'BLOCK') {
        var curBlock = Blockly.Xml.domToBlock(xml, this.workspace_);
        if (curBlock.disabled) {
          // Record blocks that were initially disabled.
          // Do not enable these blocks as a result of capacity filtering.
          this.permanentlyDisabled_.push(curBlock);
        }
        contents.push({type: 'block', block: curBlock});
        var gap = parseInt(xml.getAttribute('gap'), 10);
        gaps.push(isNaN(gap) ? default_gap : gap);
      } else if (xml.tagName.toUpperCase() == 'SEP') {
        // Change the gap between two blocks.
        // <sep gap="36"></sep>
        // The default gap is 24, can be set larger or smaller.
        // This overwrites the gap attribute on the previous block.
        // Note that a deprecated method is to add a gap to a block.
        // <block type="math_arithmetic" gap="8"></block>
        var newGap = parseInt(xml.getAttribute('gap'), 10);
        // Ignore gaps before the first block.
        if (!isNaN(newGap) && gaps.length > 0) {
          gaps[gaps.length - 1] = newGap;
        } else {
          gaps.push(default_gap);
        }
      } else if (tagName == 'BUTTON' || tagName == 'LABEL') {
        // Labels behave the same as buttons, but are styled differently.
        var isLabel = tagName == 'LABEL';
        var curButton = new Blockly.FlyoutButton(this.workspace_,
            this.targetWorkspace_, xml, isLabel);
        contents.push({type: 'button', button: curButton});
        gaps.push(default_gap);
      }
    }
  }

  this.layout_(contents, gaps);

  // IE 11 is an incompetent browser that fails to fire mouseout events.
  // When the mouse is over the background, deselect all blocks.
  var deselectAll = function() {
    var topBlocks = this.workspace_.getTopBlocks(false);
    for (var i = 0, block; block = topBlocks[i]; i++) {
      block.removeSelect();
    }
  };

  this.listeners_.push(Blockly.bindEventWithChecks_(this.svgBackground_,
      'mouseover', this, deselectAll));

  if (this.horizontalLayout_) {
    this.height_ = 0;
  } else {
    this.width_ = 0;
  }
  this.workspace_.setResizesEnabled(true);
  this.reflow();

  this.filterForCapacity_();

  // Correctly position the flyout's scrollbar when it opens.
  this.position();

  this.reflowWrapper_ = this.reflow.bind(this);
  this.workspace_.addChangeListener(this.reflowWrapper_);
};

/**
 * Delete blocks and background buttons from a previous showing of the flyout.
 * @private
 */
Blockly.Flyout.prototype.clearOldBlocks_ = function() {
  // Delete any blocks from a previous showing.
  var oldBlocks = this.workspace_.getTopBlocks(false);
  for (var i = 0, block; block = oldBlocks[i]; i++) {
    if (block.workspace == this.workspace_) {
      block.dispose(false, false);
    }
  }
  // Delete any background buttons from a previous showing.
  for (var j = 0, rect; rect = this.backgroundButtons_[j]; j++) {
    goog.dom.removeNode(rect);
  }
  this.backgroundButtons_.length = 0;

  for (var i = 0, button; button = this.buttons_[i]; i++) {
    button.dispose();
  }
  this.buttons_.length = 0;
};

/**
 * Add listeners to a block that has been added to the flyout.
 * @param {!Element} root The root node of the SVG group the block is in.
 * @param {!Blockly.Block} block The block to add listeners for.
 * @param {!Element} rect The invisible rectangle under the block that acts as
 *     a button for that block.
 * @private
 */
Blockly.Flyout.prototype.addBlockListeners_ = function(root, block, rect) {
  this.listeners_.push(Blockly.bindEventWithChecks_(root, 'mousedown', null,
      this.blockMouseDown_(block)));
  this.listeners_.push(Blockly.bindEventWithChecks_(rect, 'mousedown', null,
      this.blockMouseDown_(block)));
  this.listeners_.push(Blockly.bindEvent_(root, 'mouseover', block,
      block.addSelect));
  this.listeners_.push(Blockly.bindEvent_(root, 'mouseout', block,
      block.removeSelect));
  this.listeners_.push(Blockly.bindEvent_(rect, 'mouseover', block,
      block.addSelect));
  this.listeners_.push(Blockly.bindEvent_(rect, 'mouseout', block,
      block.removeSelect));
};

/**
 * Handle a mouse-down on an SVG block in a non-closing flyout.
 * @param {!Blockly.Block} block The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.blockMouseDown_ = function(block) {
  var flyout = this;
  return function(e) {
    var gesture = flyout.targetWorkspace_.getGesture(e);
    if (gesture) {
      gesture.setStartBlock(block);
      gesture.handleFlyoutStart(e, flyout);
    }
  };
};

/**
 * Mouse down on the flyout background.  Start a vertical scroll drag.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Flyout.prototype.onMouseDown_ = function(e) {
  var gesture = this.targetWorkspace_.getGesture(e);
  if (gesture) {
    gesture.handleFlyoutStart(e, this);
  }
};

/**
 * Create a copy of this block on the workspace.
 * @param {!Blockly.BlockSvg} originalBlock The block to copy from the flyout.
 * @return {Blockly.BlockSvg} The newly created block, or null if something
 *     went wrong with deserialization.
 * @package
 */
Blockly.Flyout.prototype.createBlock = function(originalBlock) {
  var newBlock = null;
  Blockly.Events.disable();
  this.targetWorkspace_.setResizesEnabled(false);
  try {
    newBlock = this.placeNewBlock_(originalBlock);
    //Force a render on IE and Edge to get around the issue described in
    //Blockly.Field.getCachedWidth
    if (goog.userAgent.IE || goog.userAgent.EDGE) {
      var blocks = newBlock.getDescendants();
      for (var i = blocks.length - 1; i >= 0; i--) {
        blocks[i].render(false);
      }
    }
    // Close the flyout.
    Blockly.hideChaff();
  } finally {
    Blockly.Events.enable();
  }

  if (Blockly.Events.isEnabled()) {
    Blockly.Events.setGroup(true);
    Blockly.Events.fire(new Blockly.Events.Create(newBlock));
  }
  if (this.autoClose) {
    this.hide();
  } else {
    this.filterForCapacity_();
  }
  return newBlock;
};

/**
 * Filter the blocks on the flyout to disable the ones that are above the
 * capacity limit.  For instance, if the user may only place two more blocks on
 * the workspace, an "a + b" block that has two shadow blocks would be disabled.
 * @private
 */
Blockly.Flyout.prototype.filterForCapacity_ = function() {
  var remainingCapacity = this.targetWorkspace_.remainingCapacity();
  var blocks = this.workspace_.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (this.permanentlyDisabled_.indexOf(block) == -1) {
      var allBlocks = block.getDescendants();
      block.setDisabled(allBlocks.length > remainingCapacity);
    }
  }
};

/**
 * Reflow blocks and their buttons.
 */
Blockly.Flyout.prototype.reflow = function() {
  if (this.reflowWrapper_) {
    this.workspace_.removeChangeListener(this.reflowWrapper_);
  }
  var blocks = this.workspace_.getTopBlocks(false);
  this.reflowInternal_(blocks);
  if (this.reflowWrapper_) {
    this.workspace_.addChangeListener(this.reflowWrapper_);
  }
};

/**
 * @return {boolean} True if this flyout may be scrolled with a scrollbar or by
 *     dragging.
 * @package
 */
Blockly.Flyout.prototype.isScrollable = function() {
  return this.scrollbar_ ? this.scrollbar_.isVisible() : false;
};
