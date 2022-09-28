/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a zoom icons.
 */
'use strict';

/**
 * Object representing a zoom icons.
 * @class
 */
goog.module('Blockly.ZoomControls');

const Css = goog.require('Blockly.Css');
const Touch = goog.require('Blockly.Touch');
const browserEvents = goog.require('Blockly.browserEvents');
const dom = goog.require('Blockly.utils.dom');
const eventUtils = goog.require('Blockly.Events.utils');
const {SPRITE} = goog.require('Blockly.sprite');
const uiPosition = goog.require('Blockly.uiPosition');
const {ComponentManager} = goog.require('Blockly.ComponentManager');
/* eslint-disable-next-line no-unused-vars */
const {IPositionable} = goog.require('Blockly.IPositionable');
/* eslint-disable-next-line no-unused-vars */
const {MetricsManager} = goog.requireType('Blockly.MetricsManager');
const {Rect} = goog.require('Blockly.utils.Rect');
const {Size} = goog.require('Blockly.utils.Size');
const {Svg} = goog.require('Blockly.utils.Svg');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.Click');


/**
 * Class for a zoom controls.
 * @implements {IPositionable}
 * @alias Blockly.ZoomControls
 */
class ZoomControls {
  /**
   * @param {!WorkspaceSvg} workspace The workspace to sit in.
   */
  constructor(workspace) {
    /**
     * @type {!WorkspaceSvg}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * The unique id for this component that is used to register with the
     * ComponentManager.
     * @type {string}
     */
    this.id = 'zoomControls';

    /**
     * A handle to use to unbind the mouse down event handler for zoom reset
     *    button. Opaque data returned from browserEvents.conditionalBind.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onZoomResetWrapper_ = null;

    /**
     * A handle to use to unbind the mouse down event handler for zoom in
     * button. Opaque data returned from browserEvents.conditionalBind.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onZoomInWrapper_ = null;

    /**
     * A handle to use to unbind the mouse down event handler for zoom out
     * button. Opaque data returned from browserEvents.conditionalBind.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onZoomOutWrapper_ = null;

    /**
     * The zoom in svg <g> element.
     * @type {SVGGElement}
     * @private
     */
    this.zoomInGroup_ = null;

    /**
     * The zoom out svg <g> element.
     * @type {SVGGElement}
     * @private
     */
    this.zoomOutGroup_ = null;

    /**
     * The zoom reset svg <g> element.
     * @type {SVGGElement}
     * @private
     */
    this.zoomResetGroup_ = null;

    /**
     * Width of the zoom controls.
     * @type {number}
     * @const
     * @private
     */
    this.WIDTH_ = 32;

    /**
     * Height of each zoom control.
     * @type {number}
     * @const
     * @private
     */
    this.HEIGHT_ = 32;

    /**
     * Small spacing used between the zoom in and out control, in pixels.
     * @type {number}
     * @const
     * @private
     */
    this.SMALL_SPACING_ = 2;

    /**
     * Large spacing used between the zoom in and reset control, in pixels.
     * @type {number}
     * @const
     * @private
     */
    this.LARGE_SPACING_ = 11;

    /**
     * Distance between zoom controls and bottom or top edge of workspace.
     * @type {number}
     * @const
     * @private
     */
    this.MARGIN_VERTICAL_ = 20;

    /**
     * Distance between zoom controls and right or left edge of workspace.
     * @type {number}
     * @private
     */
    this.MARGIN_HORIZONTAL_ = 20;

    /**
     * The SVG group containing the zoom controls.
     * @type {SVGElement}
     * @private
     */
    this.svgGroup_ = null;

    /**
     * Left coordinate of the zoom controls.
     * @type {number}
     * @private
     */
    this.left_ = 0;

    /**
     * Top coordinate of the zoom controls.
     * @type {number}
     * @private
     */
    this.top_ = 0;

    /**
     * Whether this has been initialized.
     * @type {boolean}
     * @private
     */
    this.initialized_ = false;
  }
  /**
   * Create the zoom controls.
   * @return {!SVGElement} The zoom controls SVG group.
   */
  createDom() {
    this.svgGroup_ = dom.createSvgElement(Svg.G, {}, null);

    // Each filter/pattern needs a unique ID for the case of multiple Blockly
    // instances on a page.  Browser behaviour becomes undefined otherwise.
    // https://neil.fraser.name/news/2015/11/01/
    const rnd = String(Math.random()).substring(2);
    this.createZoomOutSvg_(rnd);
    this.createZoomInSvg_(rnd);
    if (this.workspace_.isMovable()) {
      // If we zoom to the center and the workspace isn't movable we could
      // loose blocks at the edges of the workspace.
      this.createZoomResetSvg_(rnd);
    }
    return this.svgGroup_;
  }
  /**
   * Initializes the zoom controls.
   */
  init() {
    this.workspace_.getComponentManager().addComponent({
      component: this,
      weight: 2,
      capabilities: [ComponentManager.Capability.POSITIONABLE],
    });
    this.initialized_ = true;
  }
  /**
   * Disposes of this zoom controls.
   * Unlink from all DOM elements to prevent memory leaks.
   */
  dispose() {
    this.workspace_.getComponentManager().removeComponent('zoomControls');
    if (this.svgGroup_) {
      dom.removeNode(this.svgGroup_);
    }
    if (this.onZoomResetWrapper_) {
      browserEvents.unbind(this.onZoomResetWrapper_);
    }
    if (this.onZoomInWrapper_) {
      browserEvents.unbind(this.onZoomInWrapper_);
    }
    if (this.onZoomOutWrapper_) {
      browserEvents.unbind(this.onZoomOutWrapper_);
    }
  }
  /**
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   * @return {?Rect} The UI elements's bounding box. Null if
   *   bounding box should be ignored by other UI elements.
   */
  getBoundingRectangle() {
    let height = this.SMALL_SPACING_ + 2 * this.HEIGHT_;
    if (this.zoomResetGroup_) {
      height += this.LARGE_SPACING_ + this.HEIGHT_;
    }
    const bottom = this.top_ + height;
    const right = this.left_ + this.WIDTH_;
    return new Rect(this.top_, bottom, this.left_, right);
  }
  /**
   * Positions the zoom controls.
   * It is positioned in the opposite corner to the corner the
   * categories/toolbox starts at.
   * @param {!MetricsManager.UiMetrics} metrics The workspace metrics.
   * @param {!Array<!Rect>} savedPositions List of rectangles that
   *     are already on the workspace.
   */
  position(metrics, savedPositions) {
    // Not yet initialized.
    if (!this.initialized_) {
      return;
    }

    const cornerPosition =
        uiPosition.getCornerOppositeToolbox(this.workspace_, metrics);
    let height = this.SMALL_SPACING_ + 2 * this.HEIGHT_;
    if (this.zoomResetGroup_) {
      height += this.LARGE_SPACING_ + this.HEIGHT_;
    }
    const startRect = uiPosition.getStartPositionRect(
        cornerPosition, new Size(this.WIDTH_, height), this.MARGIN_HORIZONTAL_,
        this.MARGIN_VERTICAL_, metrics, this.workspace_);

    const verticalPosition = cornerPosition.vertical;
    const bumpDirection = verticalPosition === uiPosition.verticalPosition.TOP ?
        uiPosition.bumpDirection.DOWN :
        uiPosition.bumpDirection.UP;
    const positionRect = uiPosition.bumpPositionRect(
        startRect, this.MARGIN_VERTICAL_, bumpDirection, savedPositions);

    if (verticalPosition === uiPosition.verticalPosition.TOP) {
      const zoomInTranslateY = this.SMALL_SPACING_ + this.HEIGHT_;
      this.zoomInGroup_.setAttribute(
          'transform', 'translate(0, ' + zoomInTranslateY + ')');
      if (this.zoomResetGroup_) {
        const zoomResetTranslateY =
            zoomInTranslateY + this.LARGE_SPACING_ + this.HEIGHT_;
        this.zoomResetGroup_.setAttribute(
            'transform', 'translate(0, ' + zoomResetTranslateY + ')');
      }
    } else {
      const zoomInTranslateY =
          this.zoomResetGroup_ ? this.LARGE_SPACING_ + this.HEIGHT_ : 0;
      this.zoomInGroup_.setAttribute(
          'transform', 'translate(0, ' + zoomInTranslateY + ')');
      const zoomOutTranslateY =
          zoomInTranslateY + this.SMALL_SPACING_ + this.HEIGHT_;
      this.zoomOutGroup_.setAttribute(
          'transform', 'translate(0, ' + zoomOutTranslateY + ')');
    }

    this.top_ = positionRect.top;
    this.left_ = positionRect.left;
    this.svgGroup_.setAttribute(
        'transform', 'translate(' + this.left_ + ',' + this.top_ + ')');
  }
  /**
   * Create the zoom in icon and its event handler.
   * @param {string} rnd The random string to use as a suffix in the clip path's
   *     ID.  These IDs must be unique in case there are multiple Blockly
   *     instances on the same page.
   * @private
   */
  createZoomOutSvg_(rnd) {
    /* This markup will be generated and added to the .svgGroup_:
    <g class="blocklyZoom">
      <clipPath id="blocklyZoomoutClipPath837493">
        <rect width="32" height="32></rect>
      </clipPath>
      <image width="96" height="124" x="-64" y="-92"
    xlink:href="media/sprites.png"
          clip-path="url(#blocklyZoomoutClipPath837493)"></image>
    </g>
    */
    this.zoomOutGroup_ =
        dom.createSvgElement(Svg.G, {'class': 'blocklyZoom'}, this.svgGroup_);
    const clip = dom.createSvgElement(
        Svg.CLIPPATH, {'id': 'blocklyZoomoutClipPath' + rnd},
        this.zoomOutGroup_);
    dom.createSvgElement(
        Svg.RECT, {
          'width': 32,
          'height': 32,
        },
        clip);
    const zoomoutSvg = dom.createSvgElement(
        Svg.IMAGE, {
          'width': SPRITE.width,
          'height': SPRITE.height,
          'x': -64,
          'y': -92,
          'clip-path': 'url(#blocklyZoomoutClipPath' + rnd + ')',
        },
        this.zoomOutGroup_);
    zoomoutSvg.setAttributeNS(
        dom.XLINK_NS, 'xlink:href',
        this.workspace_.options.pathToMedia + SPRITE.url);

    // Attach listener.
    this.onZoomOutWrapper_ = browserEvents.conditionalBind(
        this.zoomOutGroup_, 'mousedown', null, this.zoom_.bind(this, -1));
  }
  /**
   * Create the zoom out icon and its event handler.
   * @param {string} rnd The random string to use as a suffix in the clip path's
   *     ID.  These IDs must be unique in case there are multiple Blockly
   *     instances on the same page.
   * @private
   */
  createZoomInSvg_(rnd) {
    /* This markup will be generated and added to the .svgGroup_:
    <g class="blocklyZoom">
      <clipPath id="blocklyZoominClipPath837493">
        <rect width="32" height="32"></rect>
      </clipPath>
      <image width="96" height="124" x="-32" y="-92"
    xlink:href="media/sprites.png"
          clip-path="url(#blocklyZoominClipPath837493)"></image>
    </g>
    */
    this.zoomInGroup_ =
        dom.createSvgElement(Svg.G, {'class': 'blocklyZoom'}, this.svgGroup_);
    const clip = dom.createSvgElement(
        Svg.CLIPPATH, {'id': 'blocklyZoominClipPath' + rnd}, this.zoomInGroup_);
    dom.createSvgElement(
        Svg.RECT, {
          'width': 32,
          'height': 32,
        },
        clip);
    const zoominSvg = dom.createSvgElement(
        Svg.IMAGE, {
          'width': SPRITE.width,
          'height': SPRITE.height,
          'x': -32,
          'y': -92,
          'clip-path': 'url(#blocklyZoominClipPath' + rnd + ')',
        },
        this.zoomInGroup_);
    zoominSvg.setAttributeNS(
        dom.XLINK_NS, 'xlink:href',
        this.workspace_.options.pathToMedia + SPRITE.url);

    // Attach listener.
    this.onZoomInWrapper_ = browserEvents.conditionalBind(
        this.zoomInGroup_, 'mousedown', null, this.zoom_.bind(this, 1));
  }
  /**
   * Handles a mouse down event on the zoom in or zoom out buttons on the
   *    workspace.
   * @param {number} amount Amount of zooming. Negative amount values zoom out,
   *    and positive amount values zoom in.
   * @param {!Event} e A mouse down event.
   * @private
   */
  zoom_(amount, e) {
    this.workspace_.markFocused();
    this.workspace_.zoomCenter(amount);
    this.fireZoomEvent_();
    Touch.clearTouchIdentifier();  // Don't block future drags.
    e.stopPropagation();           // Don't start a workspace scroll.
    e.preventDefault();            // Stop double-clicking from selecting text.
  }
  /**
   * Create the zoom reset icon and its event handler.
   * @param {string} rnd The random string to use as a suffix in the clip path's
   *     ID.  These IDs must be unique in case there are multiple Blockly
   *     instances on the same page.
   * @private
   */
  createZoomResetSvg_(rnd) {
    /* This markup will be generated and added to the .svgGroup_:
    <g class="blocklyZoom">
      <clipPath id="blocklyZoomresetClipPath837493">
        <rect width="32" height="32"></rect>
      </clipPath>
      <image width="96" height="124" x="-32" y="-92"
    xlink:href="media/sprites.png"
          clip-path="url(#blocklyZoomresetClipPath837493)"></image>
    </g>
    */
    this.zoomResetGroup_ =
        dom.createSvgElement(Svg.G, {'class': 'blocklyZoom'}, this.svgGroup_);
    const clip = dom.createSvgElement(
        Svg.CLIPPATH, {'id': 'blocklyZoomresetClipPath' + rnd},
        this.zoomResetGroup_);
    dom.createSvgElement(Svg.RECT, {'width': 32, 'height': 32}, clip);
    const zoomresetSvg = dom.createSvgElement(
        Svg.IMAGE, {
          'width': SPRITE.width,
          'height': SPRITE.height,
          'y': -92,
          'clip-path': 'url(#blocklyZoomresetClipPath' + rnd + ')',
        },
        this.zoomResetGroup_);
    zoomresetSvg.setAttributeNS(
        dom.XLINK_NS, 'xlink:href',
        this.workspace_.options.pathToMedia + SPRITE.url);

    // Attach event listeners.
    this.onZoomResetWrapper_ = browserEvents.conditionalBind(
        this.zoomResetGroup_, 'mousedown', null, this.resetZoom_.bind(this));
  }
  /**
   * Handles a mouse down event on the reset zoom button on the workspace.
   * @param {!Event} e A mouse down event.
   * @private
   */
  resetZoom_(e) {
    this.workspace_.markFocused();

    // zoom is passed amount and computes the new scale using the formula:
    // targetScale = currentScale * Math.pow(speed, amount)
    const targetScale = this.workspace_.options.zoomOptions.startScale;
    const currentScale = this.workspace_.scale;
    const speed = this.workspace_.options.zoomOptions.scaleSpeed;
    // To compute amount:
    // amount = log(speed, (targetScale / currentScale))
    // Math.log computes natural logarithm (ln), to change the base, use
    // formula: log(base, value) = ln(value) / ln(base)
    const amount = Math.log(targetScale / currentScale) / Math.log(speed);
    this.workspace_.beginCanvasTransition();
    this.workspace_.zoomCenter(amount);
    this.workspace_.scrollCenter();

    setTimeout(this.workspace_.endCanvasTransition.bind(this.workspace_), 500);
    this.fireZoomEvent_();
    Touch.clearTouchIdentifier();  // Don't block future drags.
    e.stopPropagation();           // Don't start a workspace scroll.
    e.preventDefault();            // Stop double-clicking from selecting text.
  }
  /**
   * Fires a zoom control UI event.
   * @private
   */
  fireZoomEvent_() {
    const uiEvent = new (eventUtils.get(eventUtils.CLICK))(
        null, this.workspace_.id, 'zoom_controls');
    eventUtils.fire(uiEvent);
  }
}

/**
 * CSS for zoom controls.  See css.js for use.
 */
Css.register(`
.blocklyZoom>image, .blocklyZoom>svg>image {
  opacity: .4;
}

.blocklyZoom>image:hover, .blocklyZoom>svg>image:hover {
  opacity: .6;
}

.blocklyZoom>image:active, .blocklyZoom>svg>image:active {
  opacity: .8;
}
`);

exports.ZoomControls = ZoomControls;
