/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Flyout tray containing blocks which may be created.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Flyout');

goog.require('Blockly.Block');
/** @suppress {extraRequire} */
goog.require('Blockly.blockRendering');
goog.require('Blockly.browserEvents');
goog.require('Blockly.ComponentManager');
goog.require('Blockly.DeleteArea');
goog.require('Blockly.Events');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockCreate');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.VarCreate');
goog.require('Blockly.FlyoutMetricsManager');
/** @suppress {extraRequire} */
goog.require('Blockly.Gesture');
goog.require('Blockly.IFlyout');
goog.require('Blockly.ScrollbarPair');
goog.require('Blockly.Tooltip');
/** @suppress {extraRequire} */
goog.require('Blockly.Touch');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Svg');
goog.require('Blockly.utils.toolbox');
goog.require('Blockly.utils.xml');
goog.require('Blockly.WorkspaceSvg');
goog.require('Blockly.Xml');

goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.FlyoutButton');
goog.requireType('Blockly.Options');
goog.requireType('Blockly.utils.Rect');


/**
 * Class for a flyout.
 * @param {!Blockly.Options} workspaceOptions Dictionary of options for the
 *     workspace.
 * @constructor
 * @abstract
 * @implements {Blockly.IFlyout}
 * @extends {Blockly.DeleteArea}
 */
Blockly.Flyout = function(workspaceOptions) {
  Blockly.Flyout.superClass_.constructor.call(this);
  workspaceOptions.setMetrics = this.setMetrics_.bind(this);

  /**
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = new Blockly.WorkspaceSvg(workspaceOptions);
  this.workspace_.setMetricsManager(
      new Blockly.FlyoutMetricsManager(this.workspace_, this));

  this.workspace_.isFlyout = true;
  // Keep the workspace visibility consistent with the flyout's visibility.
  this.workspace_.setVisible(this.isVisible_);

  /**
   * The unique id for this component that is used to register with the
   * ComponentManager.
   * @type {string}
   */
  this.id = Blockly.utils.genUid();

  /**
   * Is RTL vs LTR.
   * @type {boolean}
   */
  this.RTL = !!workspaceOptions.RTL;

  /**
   * Whether the flyout should be laid out horizontally or not.
   * @type {boolean}
   * @package
   */
  this.horizontalLayout = false;

  /**
   * Position of the toolbox and flyout relative to the workspace.
   * @type {number}
   * @protected
   */
  this.toolboxPosition_ = workspaceOptions.toolboxPosition;

  /**
   * Opaque data that can be passed to Blockly.unbindEvent_.
   * @type {!Array<!Array>}
   * @private
   */
  this.eventWrappers_ = [];

  /**
   * List of background mats that lurk behind each block to catch clicks
   * landing in the blocks' lakes and bays.
   * @type {!Array<!SVGElement>}
   * @private
   */
  this.mats_ = [];

  /**
   * List of visible buttons.
   * @type {!Array<!Blockly.FlyoutButton>}
   * @protected
   */
  this.buttons_ = [];

  /**
   * List of event listeners.
   * @type {!Array<!Array>}
   * @private
   */
  this.listeners_ = [];

  /**
   * List of blocks that should always be disabled.
   * @type {!Array<!Blockly.Block>}
   * @private
   */
  this.permanentlyDisabled_ = [];

  /**
   * Width of output tab.
   * @type {number}
   * @protected
   * @const
   */
  this.tabWidth_ = this.workspace_.getRenderer().getConstants().TAB_WIDTH;

  /**
   * The target workspace
   * @type {?Blockly.WorkspaceSvg}
   * @package
   */
  this.targetWorkspace = null;
};
Blockly.utils.object.inherits(Blockly.Flyout, Blockly.DeleteArea);

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

// TODO: Move GAP_X and GAP_Y to their appropriate files.

/**
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
Blockly.Flyout.prototype.SCROLLBAR_MARGIN = 2.5;

/**
 * Width of flyout.
 * @type {number}
 * @protected
 */
Blockly.Flyout.prototype.width_ = 0;

/**
 * Height of flyout.
 * @type {number}
 * @protected
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
 * @protected
*/
Blockly.Flyout.prototype.dragAngleRange_ = 70;

/**
 * Creates the flyout's DOM.  Only needs to be called once.  The flyout can
 * either exist as its own SVG element or be a g element nested inside a
 * separate SVG element.
 * @param {string|
 * !Blockly.utils.Svg<!SVGSVGElement>|
 * !Blockly.utils.Svg<!SVGGElement>} tagName The type of tag to
 *     put the flyout in. This should be <svg> or <g>.
 * @return {!SVGElement} The flyout's SVG group.
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
  this.svgGroup_ = Blockly.utils.dom.createSvgElement(tagName,
      {'class': 'blocklyFlyout', 'style': 'display: none'}, null);
  this.svgBackground_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.PATH,
      {'class': 'blocklyFlyoutBackground'}, this.svgGroup_);
  this.svgGroup_.appendChild(this.workspace_.createDom());
  this.workspace_.getThemeManager().subscribe(
      this.svgBackground_, 'flyoutBackgroundColour', 'fill');
  this.workspace_.getThemeManager().subscribe(
      this.svgBackground_, 'flyoutOpacity', 'fill-opacity');
  return this.svgGroup_;
};

/**
 * Initializes the flyout.
 * @param {!Blockly.WorkspaceSvg} targetWorkspace The workspace in which to
 *     create new blocks.
 */
Blockly.Flyout.prototype.init = function(targetWorkspace) {
  this.targetWorkspace = targetWorkspace;
  this.workspace_.targetWorkspace = targetWorkspace;

  this.workspace_.scrollbar = new Blockly.ScrollbarPair(
      this.workspace_, this.horizontalLayout, !this.horizontalLayout,
      'blocklyFlyoutScrollbar', this.SCROLLBAR_MARGIN);

  this.hide();

  Array.prototype.push.apply(
      this.eventWrappers_,
      Blockly.browserEvents.conditionalBind(
          this.svgGroup_, 'wheel', this, this.wheel_));
  if (!this.autoClose) {
    this.filterWrapper_ = this.filterForCapacity_.bind(this);
    this.targetWorkspace.addChangeListener(this.filterWrapper_);
  }

  // Dragging the flyout up and down.
  Array.prototype.push.apply(
      this.eventWrappers_,
      Blockly.browserEvents.conditionalBind(
          this.svgBackground_, 'mousedown', this, this.onMouseDown_));

  // A flyout connected to a workspace doesn't have its own current gesture.
  this.workspace_.getGesture =
      this.targetWorkspace.getGesture.bind(this.targetWorkspace);

  // Get variables from the main workspace rather than the target workspace.
  this.workspace_.setVariableMap(this.targetWorkspace.getVariableMap());

  this.workspace_.createPotentialVariableMap();

  targetWorkspace.getComponentManager().addComponent({
    component: this,
    weight: 1,
    capabilities: [
      Blockly.ComponentManager.Capability.DELETE_AREA,
      Blockly.ComponentManager.Capability.DRAG_TARGET
    ]
  });
};

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 * @suppress {checkTypes}
 */
Blockly.Flyout.prototype.dispose = function() {
  this.hide();
  this.workspace_.getComponentManager().removeComponent(this.id);
  Blockly.browserEvents.unbind(this.eventWrappers_);
  if (this.filterWrapper_) {
    this.targetWorkspace.removeChangeListener(this.filterWrapper_);
    this.filterWrapper_ = null;
  }
  if (this.workspace_) {
    this.workspace_.getThemeManager().unsubscribe(this.svgBackground_);
    this.workspace_.targetWorkspace = null;
    this.workspace_.dispose();
    this.workspace_ = null;
  }
  if (this.svgGroup_) {
    Blockly.utils.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgBackground_ = null;
  this.targetWorkspace = null;
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
 * Get the scale (zoom level) of the flyout. By default,
 * this matches the target workspace scale, but this can be overridden.
 * @return {number} Flyout workspace scale.
 */
Blockly.Flyout.prototype.getFlyoutScale = function() {
  return this.targetWorkspace.scale;
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
    if (!this.autoClose) {
      // Auto-close flyouts are ignored as drag targets, so only non auto-close
      // flyouts need to have their drag target updated.
      this.workspace_.recordDragTargets();
    }
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
  // Update the scrollbar's visibility too since it should mimic the
  // flyout's visibility.
  this.workspace_.scrollbar.setContainerVisible(show);
};

/**
 * Update the view based on coordinates calculated in position().
 * @param {number} width The computed width of the flyout's SVG group
 * @param {number} height The computed height of the flyout's SVG group.
 * @param {number} x The computed x origin of the flyout's SVG group.
 * @param {number} y The computed y origin of the flyout's SVG group.
 * @protected
 */
Blockly.Flyout.prototype.positionAt_ = function(width, height, x, y) {
  this.svgGroup_.setAttribute("width", width);
  this.svgGroup_.setAttribute("height", height);
  this.workspace_.setCachedParentSvgSize(width, height);

  if (this.svgGroup_.tagName == 'svg') {
    var transform = 'translate(' + x + 'px,' + y + 'px)';
    Blockly.utils.dom.setCssTransform(this.svgGroup_, transform);
  } else {
    // IE and Edge don't support CSS transforms on SVG elements so
    // it's important to set the transform on the SVG element itself
    var transform = 'translate(' + x + ',' + y + ')';
    this.svgGroup_.setAttribute("transform", transform);
  }

  // Update the scrollbar (if one exists).
  var scrollbar = this.workspace_.scrollbar;
  if (scrollbar) {
    // Set the scrollbars origin to be the top left of the flyout.
    scrollbar.setOrigin(x, y);
    scrollbar.resize();
    // If origin changed and metrics haven't changed enough to trigger
    // reposition in resize, we need to call setPosition. See issue #4692.
    if (scrollbar.hScroll) {
      scrollbar.hScroll.setPosition(
          scrollbar.hScroll.position.x, scrollbar.hScroll.position.y);
    }
    if (scrollbar.vScroll) {
      scrollbar.vScroll.setPosition(
          scrollbar.vScroll.position.x, scrollbar.vScroll.position.y);

    }
  }
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
  for (var i = 0, listen; (listen = this.listeners_[i]); i++) {
    Blockly.browserEvents.unbind(listen);
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
 * @param {!Blockly.utils.toolbox.FlyoutDefinition|string} flyoutDef Contents to display
 *     in the flyout. This is either an array of Nodes, a NodeList, a
 *     toolbox definition, or a string with the name of the dynamic category.
 */
Blockly.Flyout.prototype.show = function(flyoutDef) {
  this.workspace_.setResizesEnabled(false);
  this.hide();
  this.clearOldBlocks_();

  // Handle dynamic categories, represented by a name instead of a list.
  if (typeof flyoutDef == 'string') {
    flyoutDef = this.getDynamicCategoryContents_(flyoutDef);
  }
  this.setVisible(true);

  // Parse the Array, Node or NodeList into a a list of flyout items.
  var parsedContent = Blockly.utils.toolbox.convertFlyoutDefToJsonArray(flyoutDef);
  var flyoutInfo =
    /** @type {{contents:!Array<!Object>, gaps:!Array<number>}} */ (
      this.createFlyoutInfo_(parsedContent));

  this.layout_(flyoutInfo.contents, flyoutInfo.gaps);

  // IE 11 is an incompetent browser that fails to fire mouseout events.
  // When the mouse is over the background, deselect all blocks.
  var deselectAll = function() {
    var topBlocks = this.workspace_.getTopBlocks(false);
    for (var i = 0, block; (block = topBlocks[i]); i++) {
      block.removeSelect();
    }
  };

  this.listeners_.push(Blockly.browserEvents.conditionalBind(
      this.svgBackground_, 'mouseover', this, deselectAll));

  if (this.horizontalLayout) {
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
 * Create the contents array and gaps array necessary to create the layout for
 * the flyout.
 * @param {!Blockly.utils.toolbox.FlyoutItemInfoArray} parsedContent The array
 *     of objects to show in the flyout.
 * @return {{contents:Array<Object>, gaps:Array<number>}} The list of contents
 *     and gaps needed to lay out the flyout.
 * @private
 */
Blockly.Flyout.prototype.createFlyoutInfo_ = function(parsedContent) {
  var contents = [];
  var gaps = [];
  this.permanentlyDisabled_.length = 0;
  var defaultGap = this.horizontalLayout ? this.GAP_X : this.GAP_Y;
  for (var i = 0, contentInfo; (contentInfo = parsedContent[i]); i++) {

    if (contentInfo['custom']) {
      var customInfo = /** @type {!Blockly.utils.toolbox.DynamicCategoryInfo} */ (contentInfo);
      var categoryName = customInfo['custom'];
      var flyoutDef = this.getDynamicCategoryContents_(categoryName);
      var parsedDynamicContent = /** @type {!Blockly.utils.toolbox.FlyoutItemInfoArray} */
        (Blockly.utils.toolbox.convertFlyoutDefToJsonArray(flyoutDef));
      parsedContent.splice.apply(parsedContent, [i, 1].concat(parsedDynamicContent));
      contentInfo = parsedContent[i];
    }

    switch (contentInfo['kind'].toUpperCase()) {
      case 'BLOCK':
        var blockInfo = /** @type {!Blockly.utils.toolbox.BlockInfo} */ (contentInfo);
        var blockXml = this.getBlockXml_(blockInfo);
        var block = this.createBlock_(blockXml);
        // This is a deprecated method for adding gap to a block.
        // <block type="math_arithmetic" gap="8"></block>
        var gap = parseInt(blockInfo['gap'] || blockXml.getAttribute('gap'), 10);
        gaps.push(isNaN(gap) ? defaultGap : gap);
        contents.push({type: 'block', block: block});
        break;
      case 'SEP':
        var sepInfo = /** @type {!Blockly.utils.toolbox.SeparatorInfo} */ (contentInfo);
        this.addSeparatorGap_(sepInfo, gaps, defaultGap);
        break;
      case 'LABEL':
        var labelInfo = /** @type {!Blockly.utils.toolbox.LabelInfo} */ (contentInfo);
        // A label is a button with different styling.
        var label = this.createButton_(labelInfo, /** isLabel */ true);
        contents.push({type: 'button', button: label});
        gaps.push(defaultGap);
        break;
      case 'BUTTON':
        var buttonInfo = /** @type {!Blockly.utils.toolbox.ButtonInfo} */ (contentInfo);
        var button = this.createButton_(buttonInfo, /** isLabel */ false);
        contents.push({type: 'button', button: button});
        gaps.push(defaultGap);
        break;
    }
  }
  return {contents: contents, gaps: gaps};
};

/**
 * Gets the flyout definition for the dynamic category.
 * @param {string} categoryName The name of the dynamic category.
 * @return {!Array<!Element>} The array of flyout items.
 * @private
 */
Blockly.Flyout.prototype.getDynamicCategoryContents_ = function(categoryName) {
  // Look up the correct category generation function and call that to get a
  // valid XML list.
  var fnToApply = this.workspace_.targetWorkspace.getToolboxCategoryCallback(
      categoryName);
  if (typeof fnToApply != 'function') {
    throw TypeError('Couldn\'t find a callback function when opening' +
        ' a toolbox category.');
  }
  var flyoutDef = fnToApply(this.workspace_.targetWorkspace);
  if (!Array.isArray(flyoutDef)) {
    throw new TypeError('Result of toolbox category callback must be an array.');
  }
  return flyoutDef;
};

/**
 * Creates a flyout button or a flyout label.
 * @param {!Blockly.utils.toolbox.ButtonOrLabelInfo} btnInfo
 *    The object holding information about a button or a label.
 * @param {boolean} isLabel True if the button is a label, false otherwise.
 * @return {!Blockly.FlyoutButton} The object used to display the button in the
 *    flyout.
 * @private
 */
Blockly.Flyout.prototype.createButton_ = function(btnInfo, isLabel) {
  if (!Blockly.FlyoutButton) {
    throw Error('Missing require for Blockly.FlyoutButton');
  }
  var curButton = new Blockly.FlyoutButton(this.workspace_,
      /** @type {!Blockly.WorkspaceSvg} */ (this.targetWorkspace), btnInfo,
      isLabel);
  return curButton;
};

/**
 * Create a block from the xml and permanently disable any blocks that were
 * defined as disabled.
 * @param {!Element} blockXml The xml of the block.
 * @return {!Blockly.BlockSvg} The block created from the blockXml.
 * @protected
 */
Blockly.Flyout.prototype.createBlock_ = function(blockXml) {
  var curBlock = /** @type {!Blockly.BlockSvg} */ (
    Blockly.Xml.domToBlock(blockXml, this.workspace_));
  if (!curBlock.isEnabled()) {
    // Record blocks that were initially disabled.
    // Do not enable these blocks as a result of capacity filtering.
    this.permanentlyDisabled_.push(curBlock);
  }
  return curBlock;
};

/**
 * Get the xml from the block info object.
 * @param {!Blockly.utils.toolbox.BlockInfo}  blockInfo The object holding
 *    information about a block.
 * @return {!Element} The xml for the block.
 * @throws {Error} if the xml is not a valid block definition.
 * @private
 */
Blockly.Flyout.prototype.getBlockXml_ = function(blockInfo) {
  var blockElement = null;
  var blockXml = blockInfo['blockxml'];

  if (blockXml && typeof blockXml != 'string') {
    blockElement = blockXml;
  } else if (blockXml && typeof blockXml == 'string') {
    blockElement = Blockly.Xml.textToDom(blockXml);
    blockInfo['blockxml'] = blockElement;
  } else if (blockInfo['type']) {
    blockElement = Blockly.utils.xml.createElement('xml');
    blockElement.setAttribute('type', blockInfo['type']);
    blockElement.setAttribute('disabled', blockInfo['disabled']);
    blockInfo['blockxml'] = blockElement;
  }

  if (!blockElement) {
    throw Error('Error: Invalid block definition. Block definition must have blockxml or type.');
  }
  return blockElement;
};

/**
 * Add the necessary gap in the flyout for a separator.
 * @param {!Blockly.utils.toolbox.SeparatorInfo} sepInfo The object holding
 *    information about a separator.
 * @param {!Array<number>} gaps The list gaps between items in the flyout.
 * @param {number} defaultGap The default gap between the button and next element.
 * @private
 */
Blockly.Flyout.prototype.addSeparatorGap_ = function(sepInfo, gaps, defaultGap) {
  // Change the gap between two toolbox elements.
  // <sep gap="36"></sep>
  // The default gap is 24, can be set larger or smaller.
  // This overwrites the gap attribute on the previous element.
  var newGap = parseInt(sepInfo['gap'], 10);
  // Ignore gaps before the first block.
  if (!isNaN(newGap) && gaps.length > 0) {
    gaps[gaps.length - 1] = newGap;
  } else {
    gaps.push(defaultGap);
  }
};

/**
 * Delete blocks, mats and buttons from a previous showing of the flyout.
 * @protected
 */
Blockly.Flyout.prototype.clearOldBlocks_ = function() {
  // Delete any blocks from a previous showing.
  var oldBlocks = this.workspace_.getTopBlocks(false);
  for (var i = 0, block; (block = oldBlocks[i]); i++) {
    if (block.workspace == this.workspace_) {
      block.dispose(false, false);
    }
  }
  // Delete any mats from a previous showing.
  for (var j = 0; j < this.mats_.length; j++) {
    var rect = this.mats_[j];
    if (rect) {
      Blockly.Tooltip.unbindMouseEvents(rect);
      Blockly.utils.dom.removeNode(rect);
    }
  }
  this.mats_.length = 0;
  // Delete any buttons from a previous showing.
  for (var i = 0, button; (button = this.buttons_[i]); i++) {
    button.dispose();
  }
  this.buttons_.length = 0;

  // Clear potential variables from the previous showing.
  this.workspace_.getPotentialVariableMap().clear();
};

/**
 * Add listeners to a block that has been added to the flyout.
 * @param {!SVGElement} root The root node of the SVG group the block is in.
 * @param {!Blockly.BlockSvg} block The block to add listeners for.
 * @param {!SVGElement} rect The invisible rectangle under the block that acts
 *     as a mat for that block.
 * @protected
 */
Blockly.Flyout.prototype.addBlockListeners_ = function(root, block, rect) {
  this.listeners_.push(Blockly.browserEvents.conditionalBind(
      root, 'mousedown', null, this.blockMouseDown_(block)));
  this.listeners_.push(Blockly.browserEvents.conditionalBind(
      rect, 'mousedown', null, this.blockMouseDown_(block)));
  this.listeners_.push(
      Blockly.browserEvents.bind(root, 'mouseenter', block, block.addSelect));
  this.listeners_.push(Blockly.browserEvents.bind(
      root, 'mouseleave', block, block.removeSelect));
  this.listeners_.push(
      Blockly.browserEvents.bind(rect, 'mouseenter', block, block.addSelect));
  this.listeners_.push(Blockly.browserEvents.bind(
      rect, 'mouseleave', block, block.removeSelect));
};

/**
 * Handle a mouse-down on an SVG block in a non-closing flyout.
 * @param {!Blockly.BlockSvg} block The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.blockMouseDown_ = function(block) {
  var flyout = this;
  return function(e) {
    var gesture = flyout.targetWorkspace.getGesture(e);
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
  var gesture = this.targetWorkspace.getGesture(e);
  if (gesture) {
    gesture.handleFlyoutStart(e, this);
  }
};

/**
 * Does this flyout allow you to create a new instance of the given block?
 * Used for deciding if a block can be "dragged out of" the flyout.
 * @param {!Blockly.BlockSvg} block The block to copy from the flyout.
 * @return {boolean} True if you can create a new instance of the block, false
 *    otherwise.
 * @package
 */
Blockly.Flyout.prototype.isBlockCreatable_ = function(block) {
  return block.isEnabled();
};

/**
 * Create a copy of this block on the workspace.
 * @param {!Blockly.BlockSvg} originalBlock The block to copy from the flyout.
 * @return {!Blockly.BlockSvg} The newly created block.
 * @throws {Error} if something went wrong with deserialization.
 * @package
 */
Blockly.Flyout.prototype.createBlock = function(originalBlock) {
  var newBlock = null;
  Blockly.Events.disable();
  var variablesBeforeCreation = this.targetWorkspace.getAllVariables();
  this.targetWorkspace.setResizesEnabled(false);
  try {
    newBlock = this.placeNewBlock_(originalBlock);
  } finally {
    Blockly.Events.enable();
  }

  // Close the flyout.
  Blockly.hideChaff();

  var newVariables = Blockly.Variables.getAddedVariables(this.targetWorkspace,
      variablesBeforeCreation);

  if (Blockly.Events.isEnabled()) {
    Blockly.Events.setGroup(true);
    // Fire a VarCreate event for each (if any) new variable created.
    for (var i = 0; i < newVariables.length; i++) {
      var thisVariable = newVariables[i];
      Blockly.Events.fire(
          new (Blockly.Events.get(Blockly.Events.VAR_CREATE))(thisVariable));
    }

    // Block events come after var events, in case they refer to newly created
    // variables.
    Blockly.Events.fire(
        new (Blockly.Events.get(Blockly.Events.BLOCK_CREATE))(newBlock));
  }
  if (this.autoClose) {
    this.hide();
  } else {
    this.filterForCapacity_();
  }
  return newBlock;
};

/**
 * Initialize the given button: move it to the correct location,
 * add listeners, etc.
 * @param {!Blockly.FlyoutButton} button The button to initialize and place.
 * @param {number} x The x position of the cursor during this layout pass.
 * @param {number} y The y position of the cursor during this layout pass.
 * @protected
 */
Blockly.Flyout.prototype.initFlyoutButton_ = function(button, x, y) {
  var buttonSvg = button.createDom();
  button.moveTo(x, y);
  button.show();
  // Clicking on a flyout button or label is a lot like clicking on the
  // flyout background.
  this.listeners_.push(Blockly.browserEvents.conditionalBind(
      buttonSvg, 'mousedown', this, this.onMouseDown_));

  this.buttons_.push(button);
};

/**
 * Create and place a rectangle corresponding to the given block.
 * @param {!Blockly.BlockSvg} block The block to associate the rect to.
 * @param {number} x The x position of the cursor during this layout pass.
 * @param {number} y The y position of the cursor during this layout pass.
 * @param {!{height: number, width: number}} blockHW The height and width of the
 *     block.
 * @param {number} index The index into the mats list where this rect should be
 *     placed.
 * @return {!SVGElement} Newly created SVG element for the rectangle behind the
 *     block.
 * @protected
 */
Blockly.Flyout.prototype.createRect_ = function(block, x, y, blockHW, index) {
  // Create an invisible rectangle under the block to act as a button.  Just
  // using the block as a button is poor, since blocks have holes in them.
  var rect = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        'fill-opacity': 0,
        'x': x,
        'y': y,
        'height': blockHW.height,
        'width': blockHW.width
      }, null);
  rect.tooltip = block;
  Blockly.Tooltip.bindMouseEvents(rect);
  // Add the rectangles under the blocks, so that the blocks' tooltips work.
  this.workspace_.getCanvas().insertBefore(rect, block.getSvgRoot());

  block.flyoutRect_ = rect;
  this.mats_[index] = rect;
  return rect;
};

/**
 * Move a rectangle to sit exactly behind a block, taking into account tabs,
 * hats, and any other protrusions we invent.
 * @param {!SVGElement} rect The rectangle to move directly behind the block.
 * @param {!Blockly.BlockSvg} block The block the rectangle should be behind.
 * @protected
 */
Blockly.Flyout.prototype.moveRectToBlock_ = function(rect, block) {
  var blockHW = block.getHeightWidth();
  rect.setAttribute('width', blockHW.width);
  rect.setAttribute('height', blockHW.height);

  var blockXY = block.getRelativeToSurfaceXY();
  rect.setAttribute('y', blockXY.y);
  rect.setAttribute('x', this.RTL ? blockXY.x - blockHW.width : blockXY.x);
};

/**
 * Filter the blocks on the flyout to disable the ones that are above the
 * capacity limit.  For instance, if the user may only place two more blocks on
 * the workspace, an "a + b" block that has two shadow blocks would be disabled.
 * @private
 */
Blockly.Flyout.prototype.filterForCapacity_ = function() {
  var blocks = this.workspace_.getTopBlocks(false);
  for (var i = 0, block; (block = blocks[i]); i++) {
    if (this.permanentlyDisabled_.indexOf(block) == -1) {
      var enable = this.targetWorkspace
          .isCapacityAvailable(Blockly.utils.getBlockTypeCounts(block));
      while (block) {
        block.setEnabled(enable);
        block = block.getNextBlock();
      }
    }
  }
};

/**
 * Reflow blocks and their mats.
 */
Blockly.Flyout.prototype.reflow = function() {
  if (this.reflowWrapper_) {
    this.workspace_.removeChangeListener(this.reflowWrapper_);
  }
  this.reflowInternal_();
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
  return this.workspace_.scrollbar ?
      this.workspace_.scrollbar.isVisible() : false;
};

/**
 * Copy a block from the flyout to the workspace and position it correctly.
 * @param {!Blockly.BlockSvg} oldBlock The flyout block to copy.
 * @return {!Blockly.BlockSvg} The new block in the main workspace.
 * @private
 */
Blockly.Flyout.prototype.placeNewBlock_ = function(oldBlock) {
  var targetWorkspace = this.targetWorkspace;
  var svgRootOld = oldBlock.getSvgRoot();
  if (!svgRootOld) {
    throw Error('oldBlock is not rendered.');
  }

  // Create the new block by cloning the block in the flyout (via XML).
  // This cast assumes that the oldBlock can not be an insertion marker.
  var xml = /** @type {!Element} */ (Blockly.Xml.blockToDom(oldBlock, true));
  // The target workspace would normally resize during domToBlock, which will
  // lead to weird jumps.  Save it for terminateDrag.
  targetWorkspace.setResizesEnabled(false);

  // Using domToBlock instead of domToWorkspace means that the new block will be
  // placed at position (0, 0) in main workspace units.
  var block = /** @type {!Blockly.BlockSvg} */
      (Blockly.Xml.domToBlock(xml, targetWorkspace));
  var svgRootNew = block.getSvgRoot();
  if (!svgRootNew) {
    throw Error('block is not rendered.');
  }

  // The offset in pixels between the main workspace's origin and the upper left
  // corner of the injection div.
  var mainOffsetPixels = targetWorkspace.getOriginOffsetInPixels();

  // The offset in pixels between the flyout workspace's origin and the upper
  // left corner of the injection div.
  var flyoutOffsetPixels = this.workspace_.getOriginOffsetInPixels();

  // The position of the old block in flyout workspace coordinates.
  var oldBlockPos = oldBlock.getRelativeToSurfaceXY();
  // The position of the old block in pixels relative to the flyout
  // workspace's origin.
  oldBlockPos.scale(this.workspace_.scale);

  // The position of the old block in pixels relative to the upper left corner
  // of the injection div.
  var oldBlockOffsetPixels = Blockly.utils.Coordinate.sum(flyoutOffsetPixels,
      oldBlockPos);

  // The position of the old block in pixels relative to the origin of the
  // main workspace.
  var finalOffset = Blockly.utils.Coordinate.difference(oldBlockOffsetPixels,
      mainOffsetPixels);
  // The position of the old block in main workspace coordinates.
  finalOffset.scale(1 / targetWorkspace.scale);

  block.moveBy(finalOffset.x, finalOffset.y);
  return block;
};

/**
 * Returns the bounding rectangle of the drag target area in pixel units
 * relative to viewport.
 * @return {Blockly.utils.Rect} The component's bounding box.
 */
Blockly.Flyout.prototype.getClientRect;

/**
 * Position the flyout.
 * @return {void}
 */
Blockly.Flyout.prototype.position;

/**
 * Determine if a drag delta is toward the workspace, based on the position
 * and orientation of the flyout. This is used in determineDragIntention_ to
 * determine if a new block should be created or if the flyout should scroll.
 * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @return {boolean} True if the drag is toward the workspace.
 * @package
 */
Blockly.Flyout.prototype.isDragTowardWorkspace;

/**
 * Sets the translation of the flyout to match the scrollbars.
 * @param {!{x:number,y:number}} xyRatio Contains a y property which is a float
 *     between 0 and 1 specifying the degree of scrolling and a
 *     similar x property.
 * @protected
 */
Blockly.Flyout.prototype.setMetrics_;

/**
 * Lay out the blocks in the flyout.
 * @param {!Array<!Object>} contents The blocks and buttons to lay out.
 * @param {!Array<number>} gaps The visible gaps between blocks.
 * @protected
 */
Blockly.Flyout.prototype.layout_;

/**
 * Scroll the flyout.
 * @param {!Event} e Mouse wheel scroll event.
 * @protected
 */
Blockly.Flyout.prototype.wheel_;

/**
 * Compute height of flyout.  Position mat under each block.
 * For RTL: Lay out the blocks right-aligned.
 * @return {void}
 * @protected
 */
Blockly.Flyout.prototype.reflowInternal_;

/**
 * Calculates the x coordinate for the flyout position.
 * @return {number} X coordinate.
 */
Blockly.Flyout.prototype.getX;

/**
 * Calculates the y coordinate for the flyout position.
 * @return {number} Y coordinate.
 */
Blockly.Flyout.prototype.getY;
