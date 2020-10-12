/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a zoom icons.
 * @author carloslfu@gmail.com (Carlos Galarza)
 */
'use strict';

goog.provide('Blockly.ZoomControls');

goog.require('Blockly.constants');
goog.require('Blockly.Css');
goog.require('Blockly.Scrollbar');
goog.require('Blockly.Touch');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Svg');


/**
 * Class for a zoom controls.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
 * @constructor
 */
Blockly.ZoomControls = function(workspace) {
  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * A handle to use to unbind the mouse down event handler for zoom reset
   *    button. Opaque data returned from Blockly.bindEventWithChecks_.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onZoomResetWrapper_ = null;

  /**
   * A handle to use to unbind the mouse down event handler for zoom in button.
   * Opaque data returned from Blockly.bindEventWithChecks_.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onZoomInWrapper_ = null;

  /**
   * A handle to use to unbind the mouse down event handler for zoom out button.
   * Opaque data returned from Blockly.bindEventWithChecks_.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onZoomOutWrapper_ = null;

  /**
   * The vertical distance between the workspace bottom edge and the control.
   * The value is initialized during `init`.
   * @type {?number}
   * @private
   */
  this.verticalSpacing_ = null;

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
};

/**
 * Width of the zoom controls.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.WIDTH_ = 32;

/**
 * Height of the zoom controls.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.HEIGHT_ = 110;

/**
 * Distance between zoom controls and bottom edge of workspace.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.MARGIN_BOTTOM_ = 20;

/**
 * Distance between zoom controls and right edge of workspace.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.MARGIN_SIDE_ = 20;

/**
 * The SVG group containing the zoom controls.
 * @type {SVGElement}
 * @private
 */
Blockly.ZoomControls.prototype.svgGroup_ = null;

/**
 * Left coordinate of the zoom controls.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.left_ = 0;

/**
 * Top coordinate of the zoom controls.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.top_ = 0;


/**
 * Create the zoom controls.
 * @return {!SVGElement} The zoom controls SVG group.
 */
Blockly.ZoomControls.prototype.createDom = function() {
  this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G, {}, null);

  // Each filter/pattern needs a unique ID for the case of multiple Blockly
  // instances on a page.  Browser behaviour becomes undefined otherwise.
  // https://neil.fraser.name/news/2015/11/01/
  var rnd = String(Math.random()).substring(2);
  this.createZoomOutSvg_(rnd);
  this.createZoomInSvg_(rnd);
  if (this.workspace_.isMovable()) {
    // If we zoom to the center and the workspace isn't movable we could
    // loose blocks at the edges of the workspace.
    this.createZoomResetSvg_(rnd);
  }
  return this.svgGroup_;
};

/**
 * Initialize the zoom controls.
 * @param {number} verticalSpacing Vertical distances from workspace edge to the
 *    same edge of the controls.
 * @return {number} Vertical distance from workspace edge to the opposite
 *    edge of the controls.
 */
Blockly.ZoomControls.prototype.init = function(verticalSpacing) {
  this.verticalSpacing_ = this.MARGIN_BOTTOM_ + verticalSpacing;
  return this.verticalSpacing_ + this.HEIGHT_;
};

/**
 * Dispose of this zoom controls.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.ZoomControls.prototype.dispose = function() {
  if (this.svgGroup_) {
    Blockly.utils.dom.removeNode(this.svgGroup_);
  }
  if (this.onZoomResetWrapper_) {
    Blockly.unbindEvent_(this.onZoomResetWrapper_);
  }
  if (this.onZoomInWrapper_) {
    Blockly.unbindEvent_(this.onZoomInWrapper_);
  }
  if (this.onZoomOutWrapper_) {
    Blockly.unbindEvent_(this.onZoomOutWrapper_);
  }
};

/**
 * Position the zoom controls.
 * It is positioned in the opposite corner to the corner the
 * categories/toolbox starts at.
 */
Blockly.ZoomControls.prototype.position = function() {
  // Not yet initialized.
  if (!this.verticalSpacing_) {
    return;
  }
  var metrics = this.workspace_.getMetrics();
  if (!metrics) {
    // There are no metrics available (workspace is probably not visible).
    return;
  }
  if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
      (this.workspace_.horizontalLayout && !this.workspace_.RTL)) {
    // Toolbox starts in the left corner.
    this.left_ = metrics.viewWidth + metrics.absoluteLeft -
        this.WIDTH_ - this.MARGIN_SIDE_ - Blockly.Scrollbar.scrollbarThickness;
  } else {
    // Toolbox starts in the right corner.
    this.left_ = this.MARGIN_SIDE_ + Blockly.Scrollbar.scrollbarThickness;
  }

  if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
    this.top_ = this.verticalSpacing_;
    this.zoomInGroup_.setAttribute('transform', 'translate(0, 34)');
    if (this.zoomResetGroup_) {
      this.zoomResetGroup_.setAttribute('transform', 'translate(0, 77)');
    }
  } else {
    this.top_ = metrics.viewHeight + metrics.absoluteTop -
        this.HEIGHT_ - this.verticalSpacing_;
    this.zoomInGroup_.setAttribute('transform', 'translate(0, 43)');
    this.zoomOutGroup_.setAttribute('transform', 'translate(0, 77)');
  }

  this.svgGroup_.setAttribute('transform',
      'translate(' + this.left_ + ',' + this.top_ + ')');
};

/**
 * Create the zoom in icon and its event handler.
 * @param {string} rnd The random string to use as a suffix in the clip path's
 *     ID.  These IDs must be unique in case there are multiple Blockly
 *     instances on the same page.
 * @private
 */
Blockly.ZoomControls.prototype.createZoomOutSvg_ = function(rnd) {
  /* This markup will be generated and added to the .svgGroup_:
  <g class="blocklyZoom">
    <clipPath id="blocklyZoomoutClipPath837493">
      <rect width="32" height="32></rect>
    </clipPath>
    <image width="96" height="124" x="-64" y="-92" xlink:href="media/sprites.png"
        clip-path="url(#blocklyZoomoutClipPath837493)"></image>
  </g>
  */
  this.zoomOutGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {'class': 'blocklyZoom'}, this.svgGroup_);
  var clip = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CLIPPATH,
      {
        'id': 'blocklyZoomoutClipPath' + rnd
      },
      this.zoomOutGroup_);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        'width': 32,
        'height': 32,
      },
      clip);
  var zoomoutSvg = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        'width': Blockly.SPRITE.width,
        'height': Blockly.SPRITE.height,
        'x': -64,
        'y': -92,
        'clip-path': 'url(#blocklyZoomoutClipPath' + rnd + ')'
      },
      this.zoomOutGroup_);
  zoomoutSvg.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      this.workspace_.options.pathToMedia + Blockly.SPRITE.url);

  // Attach listener.
  this.onZoomOutWrapper_ = Blockly.bindEventWithChecks_(
      this.zoomOutGroup_, 'mousedown', null, this.zoom_.bind(this, -1));
};

/**
 * Create the zoom out icon and its event handler.
 * @param {string} rnd The random string to use as a suffix in the clip path's
 *     ID.  These IDs must be unique in case there are multiple Blockly
 *     instances on the same page.
 * @private
 */
Blockly.ZoomControls.prototype.createZoomInSvg_ = function(rnd) {
  /* This markup will be generated and added to the .svgGroup_:
  <g class="blocklyZoom">
    <clipPath id="blocklyZoominClipPath837493">
      <rect width="32" height="32"></rect>
    </clipPath>
    <image width="96" height="124" x="-32" y="-92" xlink:href="media/sprites.png"
        clip-path="url(#blocklyZoominClipPath837493)"></image>
  </g>
  */
  this.zoomInGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {'class': 'blocklyZoom'}, this.svgGroup_);
  var clip = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CLIPPATH,
      {
        'id': 'blocklyZoominClipPath' + rnd
      },
      this.zoomInGroup_);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        'width': 32,
        'height': 32,
      },
      clip);
  var zoominSvg = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        'width': Blockly.SPRITE.width,
        'height': Blockly.SPRITE.height,
        'x': -32,
        'y': -92,
        'clip-path': 'url(#blocklyZoominClipPath' + rnd + ')'
      },
      this.zoomInGroup_);
  zoominSvg.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      this.workspace_.options.pathToMedia + Blockly.SPRITE.url);

  // Attach listener.
  this.onZoomInWrapper_ = Blockly.bindEventWithChecks_(
      this.zoomInGroup_, 'mousedown', null, this.zoom_.bind(this, 1));
};

/**
 * Handles a mouse down event on the zoom in or zoom out buttons on the
 *    workspace.
 * @param {number} amount Amount of zooming. Negative amount values zoom out,
 *    and positive amount values zoom in.
 * @param {!Event} e A mouse down event.
 * @private
 */
Blockly.ZoomControls.prototype.zoom_ = function(amount, e) {
  this.workspace_.markFocused();
  var oldZoom = this.workspace_.scale;
  this.workspace_.zoomCenter(amount);
  this.fireZoomEvent_(oldZoom);
  Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
  e.stopPropagation();  // Don't start a workspace scroll.
  e.preventDefault();  // Stop double-clicking from selecting text.
};

/**
 * Create the zoom reset icon and its event handler.
 * @param {string} rnd The random string to use as a suffix in the clip path's
 *     ID.  These IDs must be unique in case there are multiple Blockly
 *     instances on the same page.
 * @private
 */
Blockly.ZoomControls.prototype.createZoomResetSvg_ = function(rnd) {
  /* This markup will be generated and added to the .svgGroup_:
  <g class="blocklyZoom">
    <clipPath id="blocklyZoomresetClipPath837493">
      <rect width="32" height="32"></rect>
    </clipPath>
    <image width="96" height="124" x="-32" y="-92" xlink:href="media/sprites.png"
        clip-path="url(#blocklyZoomresetClipPath837493)"></image>
  </g>
  */
  this.zoomResetGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {'class': 'blocklyZoom'}, this.svgGroup_);
  var clip = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CLIPPATH,
      {
        'id': 'blocklyZoomresetClipPath' + rnd
      },
      this.zoomResetGroup_);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        'width': 32,
        'height': 32
      },
      clip);
  var zoomresetSvg = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        'width': Blockly.SPRITE.width,
        'height': Blockly.SPRITE.height,
        'y': -92,
        'clip-path': 'url(#blocklyZoomresetClipPath' + rnd + ')'
      },
      this.zoomResetGroup_);
  zoomresetSvg.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      this.workspace_.options.pathToMedia + Blockly.SPRITE.url);

  // Attach event listeners.
  this.onZoomResetWrapper_ = Blockly.bindEventWithChecks_(
      this.zoomResetGroup_, 'mousedown', null, this.resetZoom_.bind(this));
};

/**
 * Handles a mouse down event on the reset zoom button on the workspace.
 * @param {!Event} e A mouse down event.
 * @private
 */
Blockly.ZoomControls.prototype.resetZoom_ = function(e) {
  this.workspace_.markFocused();
  var oldZoom = this.workspace_.scale;
  this.workspace_.setScale(this.workspace_.options.zoomOptions.startScale);
  this.workspace_.beginCanvasTransition();
  this.workspace_.scrollCenter();
  setTimeout(this.workspace_.endCanvasTransition.bind(this.workspace_), 500);
  this.fireZoomEvent_(oldZoom);
  Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
  e.stopPropagation();  // Don't start a workspace scroll.
  e.preventDefault();  // Stop double-clicking from selecting text.
};

/**
 * Fires a zoom control ui event.
 * @param {number} oldZoom The workspace scale before zoom happened.
 * @private
 */
Blockly.ZoomControls.prototype.fireZoomEvent_ = function(oldZoom) {
  var uiEvent = new Blockly.Events.Ui(null, 'zoom', oldZoom, this.workspace_.scale);
  uiEvent.workspaceId = this.workspace_.id;
  Blockly.Events.fire(uiEvent);
};

/**
 * CSS for zoom controls.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyZoom>image, .blocklyZoom>svg>image {',
    'opacity: .4;',
  '}',

  '.blocklyZoom>image:hover, .blocklyZoom>svg>image:hover {',
    'opacity: .6;',
  '}',

  '.blocklyZoom>image:active, .blocklyZoom>svg>image:active {',
    'opacity: .8;',
  '}'
  /* eslint-enable indent */
]);
