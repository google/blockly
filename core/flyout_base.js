/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Flyout tray containing blocks which may be created.
 */
'use strict';

/**
 * Flyout tray containing blocks which may be created.
 * @class
 */
goog.module('Blockly.Flyout');

const Tooltip = goog.require('Blockly.Tooltip');
const Variables = goog.require('Blockly.Variables');
const Xml = goog.require('Blockly.Xml');
const blocks = goog.require('Blockly.serialization.blocks');
const browserEvents = goog.require('Blockly.browserEvents');
const common = goog.require('Blockly.common');
const dom = goog.require('Blockly.utils.dom');
const eventUtils = goog.require('Blockly.Events.utils');
const idGenerator = goog.require('Blockly.utils.idGenerator');
const toolbox = goog.require('Blockly.utils.toolbox');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {ComponentManager} = goog.require('Blockly.ComponentManager');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
const {DeleteArea} = goog.require('Blockly.DeleteArea');
/* eslint-disable-next-line no-unused-vars */
const {FlyoutButton} = goog.requireType('Blockly.FlyoutButton');
const {FlyoutMetricsManager} = goog.require('Blockly.FlyoutMetricsManager');
/* eslint-disable-next-line no-unused-vars */
const {IFlyout} = goog.require('Blockly.IFlyout');
/* eslint-disable-next-line no-unused-vars */
const {Options} = goog.requireType('Blockly.Options');
/* eslint-disable-next-line no-unused-vars */
const {Rect} = goog.require('Blockly.utils.Rect');
const {ScrollbarPair} = goog.require('Blockly.ScrollbarPair');
const {Svg} = goog.require('Blockly.utils.Svg');
const {WorkspaceSvg} = goog.require('Blockly.WorkspaceSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockCreate');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.VarCreate');
/** @suppress {extraRequire} */
goog.require('Blockly.Gesture');
/** @suppress {extraRequire} */
goog.require('Blockly.Touch');
/** @suppress {extraRequire} */
goog.require('Blockly.blockRendering');


/**
 * Class for a flyout.
 * @abstract
 * @implements {IFlyout}
 * @extends {DeleteArea}
 * @alias Blockly.Flyout
 */
class Flyout extends DeleteArea {
  /**
   * @param {!Options} workspaceOptions Dictionary of options for the
   *     workspace.
   */
  constructor(workspaceOptions) {
    super();
    workspaceOptions.setMetrics = this.setMetrics_.bind(this);

    /**
     * @type {!WorkspaceSvg}
     * @protected
     */
    this.workspace_ = new WorkspaceSvg(workspaceOptions);
    this.workspace_.setMetricsManager(
        new FlyoutMetricsManager(this.workspace_, this));

    this.workspace_.isFlyout = true;
    // Keep the workspace visibility consistent with the flyout's visibility.
    this.workspace_.setVisible(this.isVisible_);

    /**
     * The unique id for this component that is used to register with the
     * ComponentManager.
     * @type {string}
     */
    this.id = idGenerator.genUid();

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
     * Function that will be registered as a change listener on the workspace
     * to reflow when blocks in the flyout workspace change.
     * @type {?Function}
     * @private
     */
    this.reflowWrapper_ = null;

    /**
     * Function that disables blocks in the flyout based on max block counts
     * allowed in the target workspace. Registered as a change listener on the
     * target workspace.
     * @type {?Function}
     * @private
     */
    this.filterWrapper_ = null;

    /**
     * List of background mats that lurk behind each block to catch clicks
     * landing in the blocks' lakes and bays.
     * @type {!Array<!SVGElement>}
     * @private
     */
    this.mats_ = [];

    /**
     * List of visible buttons.
     * @type {!Array<!FlyoutButton>}
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
     * @type {!Array<!Block>}
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
     * @type {?WorkspaceSvg}
     * @package
     */
    this.targetWorkspace = null;

    /**
     * A list of blocks that can be reused.
     * @type {!Array<!BlockSvg>}
     * @private
     */
    this.recycledBlocks_ = [];

    /**
     * Does the flyout automatically close when a block is created?
     * @type {boolean}
     */
    this.autoClose = true;

    /**
     * Whether the flyout is visible.
     * @type {boolean}
     * @private
     */
    this.isVisible_ = false;

    /**
     * Whether the workspace containing this flyout is visible.
     * @type {boolean}
     * @private
     */
    this.containerVisible_ = true;

    /**
     * A map from blocks to the rects which are beneath them to act as input
     * targets.
     * @type {!WeakMap<!BlockSvg, !SVGElement>}
     * @private
     */
    this.rectMap_ = new WeakMap();

    /**
     * Corner radius of the flyout background.
     * @type {number}
     * @const
     */
    this.CORNER_RADIUS = 8;

    /**
     * Margin around the edges of the blocks in the flyout.
     * @type {number}
     * @const
     */
    this.MARGIN = this.CORNER_RADIUS;

    // TODO: Move GAP_X and GAP_Y to their appropriate files.

    /**
     * Gap between items in horizontal flyouts. Can be overridden with the "sep"
     * element.
     * @const {number}
     */
    this.GAP_X = this.MARGIN * 3;

    /**
     * Gap between items in vertical flyouts. Can be overridden with the "sep"
     * element.
     * @const {number}
     */
    this.GAP_Y = this.MARGIN * 3;

    /**
     * Top/bottom padding between scrollbar and edge of flyout background.
     * @type {number}
     * @const
     */
    this.SCROLLBAR_MARGIN = 2.5;

    /**
     * Width of flyout.
     * @type {number}
     * @protected
     */
    this.width_ = 0;

    /**
     * Height of flyout.
     * @type {number}
     * @protected
     */
    this.height_ = 0;

    // clang-format off
    /**
     * Range of a drag angle from a flyout considered "dragging toward
     * workspace". Drags that are within the bounds of this many degrees from
     * the orthogonal line to the flyout edge are considered to be "drags toward
     * the workspace".
     * Example:
     * Flyout                                                 Edge   Workspace
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
    // clang-format on
    this.dragAngleRange_ = 70;

    /**
     * The path around the background of the flyout, which will be filled with a
     * background colour.
     * @type {?SVGPathElement}
     * @protected
     */
    this.svgBackground_ = null;

    /**
     * The root SVG group for the button or label.
     * @type {?SVGGElement}
     * @protected
     */
    this.svgGroup_ = null;
  }

  /**
   * Creates the flyout's DOM.  Only needs to be called once.  The flyout can
   * either exist as its own SVG element or be a g element nested inside a
   * separate SVG element.
   * @param {string|
   * !Svg<!SVGSVGElement>|
   * !Svg<!SVGGElement>} tagName The type of tag to
   *     put the flyout in. This should be <svg> or <g>.
   * @return {!SVGElement} The flyout's SVG group.
   */
  createDom(tagName) {
    /*
    <svg | g>
      <path class="blocklyFlyoutBackground"/>
      <g class="blocklyFlyout"></g>
    </ svg | g>
    */
    // Setting style to display:none to start. The toolbox and flyout
    // hide/show code will set up proper visibility and size later.
    this.svgGroup_ = dom.createSvgElement(
        tagName, {'class': 'blocklyFlyout', 'style': 'display: none'}, null);
    this.svgBackground_ = dom.createSvgElement(
        Svg.PATH, {'class': 'blocklyFlyoutBackground'}, this.svgGroup_);
    this.svgGroup_.appendChild(this.workspace_.createDom());
    this.workspace_.getThemeManager().subscribe(
        this.svgBackground_, 'flyoutBackgroundColour', 'fill');
    this.workspace_.getThemeManager().subscribe(
        this.svgBackground_, 'flyoutOpacity', 'fill-opacity');
    return this.svgGroup_;
  }

  /**
   * Initializes the flyout.
   * @param {!WorkspaceSvg} targetWorkspace The workspace in which to
   *     create new blocks.
   */
  init(targetWorkspace) {
    this.targetWorkspace = targetWorkspace;
    this.workspace_.targetWorkspace = targetWorkspace;

    this.workspace_.scrollbar = new ScrollbarPair(
        this.workspace_, this.horizontalLayout, !this.horizontalLayout,
        'blocklyFlyoutScrollbar', this.SCROLLBAR_MARGIN);

    this.hide();

    Array.prototype.push.apply(
        this.eventWrappers_,
        browserEvents.conditionalBind(
            /** @type {!SVGGElement} */ (this.svgGroup_), 'wheel', this,
            this.wheel_));
    if (!this.autoClose) {
      this.filterWrapper_ = this.filterForCapacity_.bind(this);
      this.targetWorkspace.addChangeListener(this.filterWrapper_);
    }

    // Dragging the flyout up and down.
    Array.prototype.push.apply(
        this.eventWrappers_,
        browserEvents.conditionalBind(
            /** @type {!SVGPathElement} */ (this.svgBackground_), 'mousedown',
            this, this.onMouseDown_));

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
        ComponentManager.Capability.DELETE_AREA,
        ComponentManager.Capability.DRAG_TARGET,
      ],
    });
  }

  /**
   * Dispose of this flyout.
   * Unlink from all DOM elements to prevent memory leaks.
   * @suppress {checkTypes}
   */
  dispose() {
    this.hide();
    this.workspace_.getComponentManager().removeComponent(this.id);
    browserEvents.unbind(this.eventWrappers_);
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
      dom.removeNode(this.svgGroup_);
      this.svgGroup_ = null;
    }
    this.svgBackground_ = null;
    this.targetWorkspace = null;
  }

  /**
   * Get the width of the flyout.
   * @return {number} The width of the flyout.
   */
  getWidth() {
    return this.width_;
  }

  /**
   * Get the height of the flyout.
   * @return {number} The width of the flyout.
   */
  getHeight() {
    return this.height_;
  }

  /**
   * Get the scale (zoom level) of the flyout. By default,
   * this matches the target workspace scale, but this can be overridden.
   * @return {number} Flyout workspace scale.
   */
  getFlyoutScale() {
    return this.targetWorkspace.scale;
  }

  /**
   * Get the workspace inside the flyout.
   * @return {!WorkspaceSvg} The workspace inside the flyout.
   * @package
   */
  getWorkspace() {
    return this.workspace_;
  }

  /**
   * Is the flyout visible?
   * @return {boolean} True if visible.
   */
  isVisible() {
    return this.isVisible_;
  }

  /**
   * Set whether the flyout is visible. A value of true does not necessarily
   * mean that the flyout is shown. It could be hidden because its container is
   * hidden.
   * @param {boolean} visible True if visible.
   */
  setVisible(visible) {
    const visibilityChanged = (visible !== this.isVisible());

    this.isVisible_ = visible;
    if (visibilityChanged) {
      if (!this.autoClose) {
        // Auto-close flyouts are ignored as drag targets, so only non
        // auto-close flyouts need to have their drag target updated.
        this.workspace_.recordDragTargets();
      }
      this.updateDisplay_();
    }
  }

  /**
   * Set whether this flyout's container is visible.
   * @param {boolean} visible Whether the container is visible.
   */
  setContainerVisible(visible) {
    const visibilityChanged = (visible !== this.containerVisible_);
    this.containerVisible_ = visible;
    if (visibilityChanged) {
      this.updateDisplay_();
    }
  }

  /**
   * Update the display property of the flyout based whether it thinks it should
   * be visible and whether its containing workspace is visible.
   * @private
   */
  updateDisplay_() {
    let show = true;
    if (!this.containerVisible_) {
      show = false;
    } else {
      show = this.isVisible();
    }
    this.svgGroup_.style.display = show ? 'block' : 'none';
    // Update the scrollbar's visibility too since it should mimic the
    // flyout's visibility.
    this.workspace_.scrollbar.setContainerVisible(show);
  }

  /**
   * Update the view based on coordinates calculated in position().
   * @param {number} width The computed width of the flyout's SVG group
   * @param {number} height The computed height of the flyout's SVG group.
   * @param {number} x The computed x origin of the flyout's SVG group.
   * @param {number} y The computed y origin of the flyout's SVG group.
   * @protected
   */
  positionAt_(width, height, x, y) {
    this.svgGroup_.setAttribute('width', width);
    this.svgGroup_.setAttribute('height', height);
    this.workspace_.setCachedParentSvgSize(width, height);

    if (this.svgGroup_.tagName === 'svg') {
      const transform = 'translate(' + x + 'px,' + y + 'px)';
      dom.setCssTransform(this.svgGroup_, transform);
    } else {
      // IE and Edge don't support CSS transforms on SVG elements so
      // it's important to set the transform on the SVG element itself
      const transform = 'translate(' + x + ',' + y + ')';
      this.svgGroup_.setAttribute('transform', transform);
    }

    // Update the scrollbar (if one exists).
    const scrollbar = this.workspace_.scrollbar;
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
  }

  /**
   * Hide and empty the flyout.
   */
  hide() {
    if (!this.isVisible()) {
      return;
    }
    this.setVisible(false);
    // Delete all the event listeners.
    for (let i = 0, listen; (listen = this.listeners_[i]); i++) {
      browserEvents.unbind(listen);
    }
    this.listeners_.length = 0;
    if (this.reflowWrapper_) {
      this.workspace_.removeChangeListener(this.reflowWrapper_);
      this.reflowWrapper_ = null;
    }
    // Do NOT delete the blocks here.  Wait until Flyout.show.
    // https://neil.fraser.name/news/2014/08/09/
  }

  /**
   * Show and populate the flyout.
   * @param {!toolbox.FlyoutDefinition|string} flyoutDef Contents to display
   *     in the flyout. This is either an array of Nodes, a NodeList, a
   *     toolbox definition, or a string with the name of the dynamic category.
   */
  show(flyoutDef) {
    this.workspace_.setResizesEnabled(false);
    this.hide();
    this.clearOldBlocks_();

    // Handle dynamic categories, represented by a name instead of a list.
    if (typeof flyoutDef === 'string') {
      flyoutDef = this.getDynamicCategoryContents_(flyoutDef);
    }
    this.setVisible(true);

    // Parse the Array, Node or NodeList into a a list of flyout items.
    const parsedContent = toolbox.convertFlyoutDefToJsonArray(flyoutDef);
    const flyoutInfo =
        /** @type {{contents:!Array<!Object>, gaps:!Array<number>}} */ (
            this.createFlyoutInfo_(parsedContent));

    this.layout_(flyoutInfo.contents, flyoutInfo.gaps);

    // IE 11 is an incompetent browser that fails to fire mouseout events.
    // When the mouse is over the background, deselect all blocks.
    const deselectAll =
        /** @this {Flyout} */
        function() {
          const topBlocks = this.workspace_.getTopBlocks(false);
          for (let i = 0, block; (block = topBlocks[i]); i++) {
            block.removeSelect();
          }
        };

    this.listeners_.push(browserEvents.conditionalBind(
        /** @type {!SVGPathElement} */ (this.svgBackground_), 'mouseover', this,
        deselectAll));

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
    this.emptyRecycledBlocks_();
  }

  /**
   * Create the contents array and gaps array necessary to create the layout for
   * the flyout.
   * @param {!toolbox.FlyoutItemInfoArray} parsedContent The array
   *     of objects to show in the flyout.
   * @return {{contents:Array<Object>, gaps:Array<number>}} The list of contents
   *     and gaps needed to lay out the flyout.
   * @private
   */
  createFlyoutInfo_(parsedContent) {
    const contents = [];
    const gaps = [];
    this.permanentlyDisabled_.length = 0;
    const defaultGap = this.horizontalLayout ? this.GAP_X : this.GAP_Y;
    for (let i = 0, contentInfo; (contentInfo = parsedContent[i]); i++) {
      if (contentInfo['custom']) {
        const customInfo =
            /** @type {!toolbox.DynamicCategoryInfo} */ (contentInfo);
        const categoryName = customInfo['custom'];
        const flyoutDef = this.getDynamicCategoryContents_(categoryName);
        const parsedDynamicContent = /** @type {!toolbox.FlyoutItemInfoArray} */
            (toolbox.convertFlyoutDefToJsonArray(flyoutDef));
        // Replace the element at i with the dynamic content it represents.
        parsedContent.splice.apply(
            parsedContent, [i, 1].concat(parsedDynamicContent));
        contentInfo = parsedContent[i];
      }

      switch (contentInfo['kind'].toUpperCase()) {
        case 'BLOCK': {
          const blockInfo = /** @type {!toolbox.BlockInfo} */ (contentInfo);
          const block = this.createFlyoutBlock_(blockInfo);
          contents.push({type: 'block', block: block});
          this.addBlockGap_(blockInfo, gaps, defaultGap);
          break;
        }
        case 'SEP': {
          const sepInfo = /** @type {!toolbox.SeparatorInfo} */ (contentInfo);
          this.addSeparatorGap_(sepInfo, gaps, defaultGap);
          break;
        }
        case 'LABEL': {
          const labelInfo = /** @type {!toolbox.LabelInfo} */ (contentInfo);
          // A label is a button with different styling.
          const label = this.createButton_(labelInfo, /** isLabel */ true);
          contents.push({type: 'button', button: label});
          gaps.push(defaultGap);
          break;
        }
        case 'BUTTON': {
          const buttonInfo = /** @type {!toolbox.ButtonInfo} */ (contentInfo);
          const button = this.createButton_(buttonInfo, /** isLabel */ false);
          contents.push({type: 'button', button: button});
          gaps.push(defaultGap);
          break;
        }
      }
    }
    return {contents: contents, gaps: gaps};
  }

  /**
   * Gets the flyout definition for the dynamic category.
   * @param {string} categoryName The name of the dynamic category.
   * @return {!toolbox.FlyoutDefinition} The definition of the
   *     flyout in one of its many forms.
   * @private
   */
  getDynamicCategoryContents_(categoryName) {
    // Look up the correct category generation function and call that to get a
    // valid XML list.
    const fnToApply =
        this.workspace_.targetWorkspace.getToolboxCategoryCallback(
            categoryName);
    if (typeof fnToApply !== 'function') {
      throw TypeError(
          'Couldn\'t find a callback function when opening' +
          ' a toolbox category.');
    }
    return fnToApply(this.workspace_.targetWorkspace);
  }

  /**
   * Creates a flyout button or a flyout label.
   * @param {!toolbox.ButtonOrLabelInfo} btnInfo
   *    The object holding information about a button or a label.
   * @param {boolean} isLabel True if the button is a label, false otherwise.
   * @return {!FlyoutButton} The object used to display the button in the
   *    flyout.
   * @private
   */
  createButton_(btnInfo, isLabel) {
    const {FlyoutButton} = goog.module.get('Blockly.FlyoutButton');
    if (!FlyoutButton) {
      throw Error('Missing require for Blockly.FlyoutButton');
    }
    const curButton = new FlyoutButton(
        this.workspace_,
        /** @type {!WorkspaceSvg} */ (this.targetWorkspace), btnInfo, isLabel);
    return curButton;
  }

  /**
   * Create a block from the xml and permanently disable any blocks that were
   * defined as disabled.
   * @param {!toolbox.BlockInfo} blockInfo The info of the block.
   * @return {!BlockSvg} The block created from the blockInfo.
   * @private
   */
  createFlyoutBlock_(blockInfo) {
    let block;
    if (blockInfo['blockxml']) {
      const xml = typeof blockInfo['blockxml'] === 'string' ?
          Xml.textToDom(blockInfo['blockxml']) :
          blockInfo['blockxml'];
      block = this.getRecycledBlock_(xml.getAttribute('type'));
      if (!block) {
        block = Xml.domToBlock(xml, this.workspace_);
      }
    } else {
      block = this.getRecycledBlock_(blockInfo['type']);
      if (!block) {
        if (blockInfo['enabled'] === undefined) {
          blockInfo['enabled'] = blockInfo['disabled'] !== 'true' &&
              blockInfo['disabled'] !== true;
        }
        block = blocks.append(
            /** @type {blocks.State} */ (blockInfo), this.workspace_);
      }
    }

    if (!block.isEnabled()) {
      // Record blocks that were initially disabled.
      // Do not enable these blocks as a result of capacity filtering.
      this.permanentlyDisabled_.push(block);
    }
    return /** @type {!BlockSvg} */ (block);
  }

  /**
   * Returns a block from the array of recycled blocks with the given type, or
   * undefined if one cannot be found.
   * @param {string} blockType The type of the block to try to recycle.
   * @return {(!BlockSvg|undefined)} The recycled block, or undefined if
   *     one could not be recycled.
   * @private
   */
  getRecycledBlock_(blockType) {
    let index = -1;
    for (let i = 0; i < this.recycledBlocks_.length; i++) {
      if (this.recycledBlocks_[i].type === blockType) {
        index = i;
        break;
      }
    }
    return index === -1 ? undefined : this.recycledBlocks_.splice(index, 1)[0];
  }

  /**
   * Adds a gap in the flyout based on block info.
   * @param {!toolbox.BlockInfo} blockInfo Information about a block.
   * @param {!Array<number>} gaps The list of gaps between items in the flyout.
   * @param {number} defaultGap The default gap between one element and the
   *     next.
   * @private
   */
  addBlockGap_(blockInfo, gaps, defaultGap) {
    let gap;
    if (blockInfo['gap']) {
      gap = parseInt(blockInfo['gap'], 10);
    } else if (blockInfo['blockxml']) {
      const xml = typeof blockInfo['blockxml'] === 'string' ?
          Xml.textToDom(blockInfo['blockxml']) :
          blockInfo['blockxml'];
      gap = parseInt(xml.getAttribute('gap'), 10);
    }
    gaps.push(isNaN(gap) ? defaultGap : gap);
  }

  /**
   * Add the necessary gap in the flyout for a separator.
   * @param {!toolbox.SeparatorInfo} sepInfo The object holding
   *    information about a separator.
   * @param {!Array<number>} gaps The list gaps between items in the flyout.
   * @param {number} defaultGap The default gap between the button and next
   *     element.
   * @private
   */
  addSeparatorGap_(sepInfo, gaps, defaultGap) {
    // Change the gap between two toolbox elements.
    // <sep gap="36"></sep>
    // The default gap is 24, can be set larger or smaller.
    // This overwrites the gap attribute on the previous element.
    const newGap = parseInt(sepInfo['gap'], 10);
    // Ignore gaps before the first block.
    if (!isNaN(newGap) && gaps.length > 0) {
      gaps[gaps.length - 1] = newGap;
    } else {
      gaps.push(defaultGap);
    }
  }

  /**
   * Delete blocks, mats and buttons from a previous showing of the flyout.
   * @private
   */
  clearOldBlocks_() {
    // Delete any blocks from a previous showing.
    const oldBlocks = this.workspace_.getTopBlocks(false);
    for (let i = 0, block; (block = oldBlocks[i]); i++) {
      if (this.blockIsRecyclable_(block)) {
        this.recycleBlock_(block);
      } else {
        block.dispose(false, false);
      }
    }
    // Delete any mats from a previous showing.
    for (let j = 0; j < this.mats_.length; j++) {
      const rect = this.mats_[j];
      if (rect) {
        Tooltip.unbindMouseEvents(rect);
        dom.removeNode(rect);
      }
    }
    this.mats_.length = 0;
    // Delete any buttons from a previous showing.
    for (let i = 0, button; (button = this.buttons_[i]); i++) {
      button.dispose();
    }
    this.buttons_.length = 0;

    // Clear potential variables from the previous showing.
    this.workspace_.getPotentialVariableMap().clear();
  }

  /**
   * Empties all of the recycled blocks, properly disposing of them.
   * @private
   */
  emptyRecycledBlocks_() {
    for (let i = 0; i < this.recycledBlocks_.length; i++) {
      this.recycledBlocks_[i].dispose();
    }
    this.recycledBlocks_ = [];
  }

  /**
   * Returns whether the given block can be recycled or not.
   * @param {!BlockSvg} _block The block to check for recyclability.
   * @return {boolean} True if the block can be recycled. False otherwise.
   * @protected
   */
  blockIsRecyclable_(_block) {
    // By default, recycling is disabled.
    return false;
  }

  /**
   * Puts a previously created block into the recycle bin and moves it to the
   * top of the workspace. Used during large workspace swaps to limit the number
   * of new DOM elements we need to create.
   * @param {!BlockSvg} block The block to recycle.
   * @private
   */
  recycleBlock_(block) {
    const xy = block.getRelativeToSurfaceXY();
    block.moveBy(-xy.x, -xy.y);
    this.recycledBlocks_.push(block);
  }

  /**
   * Add listeners to a block that has been added to the flyout.
   * @param {!SVGElement} root The root node of the SVG group the block is in.
   * @param {!BlockSvg} block The block to add listeners for.
   * @param {!SVGElement} rect The invisible rectangle under the block that acts
   *     as a mat for that block.
   * @protected
   */
  addBlockListeners_(root, block, rect) {
    this.listeners_.push(browserEvents.conditionalBind(
        root, 'mousedown', null, this.blockMouseDown_(block)));
    this.listeners_.push(browserEvents.conditionalBind(
        rect, 'mousedown', null, this.blockMouseDown_(block)));
    this.listeners_.push(
        browserEvents.bind(root, 'mouseenter', block, block.addSelect));
    this.listeners_.push(
        browserEvents.bind(root, 'mouseleave', block, block.removeSelect));
    this.listeners_.push(
        browserEvents.bind(rect, 'mouseenter', block, block.addSelect));
    this.listeners_.push(
        browserEvents.bind(rect, 'mouseleave', block, block.removeSelect));
  }

  /**
   * Handle a mouse-down on an SVG block in a non-closing flyout.
   * @param {!BlockSvg} block The flyout block to copy.
   * @return {!Function} Function to call when block is clicked.
   * @private
   */
  blockMouseDown_(block) {
    const flyout = this;
    return function(e) {
      const gesture = flyout.targetWorkspace.getGesture(e);
      if (gesture) {
        gesture.setStartBlock(block);
        gesture.handleFlyoutStart(e, flyout);
      }
    };
  }

  /**
   * Mouse down on the flyout background.  Start a vertical scroll drag.
   * @param {!Event} e Mouse down event.
   * @private
   */
  onMouseDown_(e) {
    const gesture = this.targetWorkspace.getGesture(e);
    if (gesture) {
      gesture.handleFlyoutStart(e, this);
    }
  }

  /**
   * Does this flyout allow you to create a new instance of the given block?
   * Used for deciding if a block can be "dragged out of" the flyout.
   * @param {!BlockSvg} block The block to copy from the flyout.
   * @return {boolean} True if you can create a new instance of the block, false
   *    otherwise.
   * @package
   */
  isBlockCreatable_(block) {
    return block.isEnabled();
  }

  /**
   * Create a copy of this block on the workspace.
   * @param {!BlockSvg} originalBlock The block to copy from the flyout.
   * @return {!BlockSvg} The newly created block.
   * @throws {Error} if something went wrong with deserialization.
   * @package
   */
  createBlock(originalBlock) {
    let newBlock = null;
    eventUtils.disable();
    const variablesBeforeCreation = this.targetWorkspace.getAllVariables();
    this.targetWorkspace.setResizesEnabled(false);
    try {
      newBlock = this.placeNewBlock_(originalBlock);
    } finally {
      eventUtils.enable();
    }

    // Close the flyout.
    this.targetWorkspace.hideChaff();

    const newVariables = Variables.getAddedVariables(
        this.targetWorkspace, variablesBeforeCreation);

    if (eventUtils.isEnabled()) {
      eventUtils.setGroup(true);
      // Fire a VarCreate event for each (if any) new variable created.
      for (let i = 0; i < newVariables.length; i++) {
        const thisVariable = newVariables[i];
        eventUtils.fire(
            new (eventUtils.get(eventUtils.VAR_CREATE))(thisVariable));
      }

      // Block events come after var events, in case they refer to newly created
      // variables.
      eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CREATE))(newBlock));
    }
    if (this.autoClose) {
      this.hide();
    } else {
      this.filterForCapacity_();
    }
    return newBlock;
  }

  /**
   * Initialize the given button: move it to the correct location,
   * add listeners, etc.
   * @param {!FlyoutButton} button The button to initialize and place.
   * @param {number} x The x position of the cursor during this layout pass.
   * @param {number} y The y position of the cursor during this layout pass.
   * @protected
   */
  initFlyoutButton_(button, x, y) {
    const buttonSvg = button.createDom();
    button.moveTo(x, y);
    button.show();
    // Clicking on a flyout button or label is a lot like clicking on the
    // flyout background.
    this.listeners_.push(browserEvents.conditionalBind(
        buttonSvg, 'mousedown', this, this.onMouseDown_));

    this.buttons_.push(button);
  }

  /**
   * Create and place a rectangle corresponding to the given block.
   * @param {!BlockSvg} block The block to associate the rect to.
   * @param {number} x The x position of the cursor during this layout pass.
   * @param {number} y The y position of the cursor during this layout pass.
   * @param {!{height: number, width: number}} blockHW The height and width of
   *     the block.
   * @param {number} index The index into the mats list where this rect should
   *     be placed.
   * @return {!SVGElement} Newly created SVG element for the rectangle behind
   *     the block.
   * @protected
   */
  createRect_(block, x, y, blockHW, index) {
    // Create an invisible rectangle under the block to act as a button.  Just
    // using the block as a button is poor, since blocks have holes in them.
    const rect = dom.createSvgElement(
        Svg.RECT, {
          'fill-opacity': 0,
          'x': x,
          'y': y,
          'height': blockHW.height,
          'width': blockHW.width,
        },
        null);
    rect.tooltip = block;
    Tooltip.bindMouseEvents(rect);
    // Add the rectangles under the blocks, so that the blocks' tooltips work.
    this.workspace_.getCanvas().insertBefore(rect, block.getSvgRoot());

    this.rectMap_.set(block, rect);
    this.mats_[index] = rect;
    return rect;
  }

  /**
   * Move a rectangle to sit exactly behind a block, taking into account tabs,
   * hats, and any other protrusions we invent.
   * @param {!SVGElement} rect The rectangle to move directly behind the block.
   * @param {!BlockSvg} block The block the rectangle should be behind.
   * @protected
   */
  moveRectToBlock_(rect, block) {
    const blockHW = block.getHeightWidth();
    rect.setAttribute('width', blockHW.width);
    rect.setAttribute('height', blockHW.height);

    const blockXY = block.getRelativeToSurfaceXY();
    rect.setAttribute('y', blockXY.y);
    rect.setAttribute('x', this.RTL ? blockXY.x - blockHW.width : blockXY.x);
  }

  /**
   * Filter the blocks on the flyout to disable the ones that are above the
   * capacity limit.  For instance, if the user may only place two more blocks
   * on the workspace, an "a + b" block that has two shadow blocks would be
   * disabled.
   * @private
   */
  filterForCapacity_() {
    const blocks = this.workspace_.getTopBlocks(false);
    for (let i = 0, block; (block = blocks[i]); i++) {
      if (this.permanentlyDisabled_.indexOf(block) === -1) {
        const enable = this.targetWorkspace.isCapacityAvailable(
            common.getBlockTypeCounts(block));
        while (block) {
          block.setEnabled(enable);
          block = block.getNextBlock();
        }
      }
    }
  }

  /**
   * Reflow blocks and their mats.
   */
  reflow() {
    if (this.reflowWrapper_) {
      this.workspace_.removeChangeListener(this.reflowWrapper_);
    }
    this.reflowInternal_();
    if (this.reflowWrapper_) {
      this.workspace_.addChangeListener(this.reflowWrapper_);
    }
  }

  /**
   * @return {boolean} True if this flyout may be scrolled with a scrollbar or
   *     by dragging.
   * @package
   */
  isScrollable() {
    return this.workspace_.scrollbar ? this.workspace_.scrollbar.isVisible() :
                                       false;
  }

  /**
   * Copy a block from the flyout to the workspace and position it correctly.
   * @param {!BlockSvg} oldBlock The flyout block to copy.
   * @return {!BlockSvg} The new block in the main workspace.
   * @private
   */
  placeNewBlock_(oldBlock) {
    const targetWorkspace = this.targetWorkspace;
    const svgRootOld = oldBlock.getSvgRoot();
    if (!svgRootOld) {
      throw Error('oldBlock is not rendered.');
    }

    // Clone the block.
    const json = /** @type {!blocks.State} */ (blocks.save(oldBlock));
    // Normallly this resizes leading to weird jumps. Save it for terminateDrag.
    targetWorkspace.setResizesEnabled(false);
    const block =
        /** @type {!BlockSvg} */ (blocks.append(json, targetWorkspace));

    this.positionNewBlock_(oldBlock, block);

    return block;
  }

  /**
   * Positions a block on the target workspace.
   * @param {!BlockSvg} oldBlock The flyout block being copied.
   * @param {!BlockSvg} block The block to posiiton.
   * @private
   */
  positionNewBlock_(oldBlock, block) {
    const targetWorkspace = this.targetWorkspace;

    // The offset in pixels between the main workspace's origin and the upper
    // left corner of the injection div.
    const mainOffsetPixels = targetWorkspace.getOriginOffsetInPixels();

    // The offset in pixels between the flyout workspace's origin and the upper
    // left corner of the injection div.
    const flyoutOffsetPixels = this.workspace_.getOriginOffsetInPixels();

    // The position of the old block in flyout workspace coordinates.
    const oldBlockPos = oldBlock.getRelativeToSurfaceXY();
    // The position of the old block in pixels relative to the flyout
    // workspace's origin.
    oldBlockPos.scale(this.workspace_.scale);

    // The position of the old block in pixels relative to the upper left corner
    // of the injection div.
    const oldBlockOffsetPixels =
        Coordinate.sum(flyoutOffsetPixels, oldBlockPos);

    // The position of the old block in pixels relative to the origin of the
    // main workspace.
    const finalOffset =
        Coordinate.difference(oldBlockOffsetPixels, mainOffsetPixels);
    // The position of the old block in main workspace coordinates.
    finalOffset.scale(1 / targetWorkspace.scale);

    block.moveTo(new Coordinate(finalOffset.x, finalOffset.y));
  }
}

/**
 * Returns the bounding rectangle of the drag target area in pixel units
 * relative to viewport.
 * @return {Rect} The component's bounding box.
 */
Flyout.prototype.getClientRect;

/**
 * Position the flyout.
 * @return {void}
 */
Flyout.prototype.position;

/**
 * Determine if a drag delta is toward the workspace, based on the position
 * and orientation of the flyout. This is used in determineDragIntention_ to
 * determine if a new block should be created or if the flyout should scroll.
 * @param {!Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @return {boolean} True if the drag is toward the workspace.
 * @package
 */
Flyout.prototype.isDragTowardWorkspace;

/**
 * Sets the translation of the flyout to match the scrollbars.
 * @param {!{x:number,y:number}} xyRatio Contains a y property which is a float
 *     between 0 and 1 specifying the degree of scrolling and a
 *     similar x property.
 * @protected
 */
Flyout.prototype.setMetrics_;

/**
 * Lay out the blocks in the flyout.
 * @param {!Array<!Object>} contents The blocks and buttons to lay out.
 * @param {!Array<number>} gaps The visible gaps between blocks.
 * @protected
 */
Flyout.prototype.layout_;

/**
 * Scroll the flyout.
 * @param {!Event} e Mouse wheel scroll event.
 * @protected
 */
Flyout.prototype.wheel_;

/**
 * Compute height of flyout.  Position mat under each block.
 * For RTL: Lay out the blocks right-aligned.
 * @return {void}
 * @protected
 */
Flyout.prototype.reflowInternal_;

/**
 * Calculates the x coordinate for the flyout position.
 * @return {number} X coordinate.
 */
Flyout.prototype.getX;

/**
 * Calculates the y coordinate for the flyout position.
 * @return {number} Y coordinate.
 */
Flyout.prototype.getY;

exports.Flyout = Flyout;
