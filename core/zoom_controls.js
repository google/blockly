/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2015 Google Inc.
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
 * @fileoverview Object representing a zoom icons.
 * @author carloslfu@gmail.com (Carlos Galarza)
 */
'use strict';

goog.provide('Blockly.ZoomControls');

goog.require('goog.dom');


/**
 * Class for a zoom controls.
 * @param {!Blockly.Workspace} workspace The workspace to sit in.
 * @constructor
 */
Blockly.ZoomControls = function(workspace) {
  this.workspace_ = workspace;
};

/**
 * URL of the sprite image.
 * @type {string}
 * @private
 */
Blockly.ZoomControls.prototype.SPRITE_URL_ = 'media/sprites.png';

/**
 * Width of both the zoom controls.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.WIDTH_ = 47;

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
Blockly.ZoomControls.prototype.MARGIN_BOTTOM_ = 100;

/**
 * Distance between zoom controls and right edge of workspace.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.MARGIN_SIDE_ = 23;

/**
 * The SVG group containing the zoom controls.
 * @type {Element}
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
 * @return {!Element} The zoom controls SVG group.
 */
Blockly.ZoomControls.prototype.createDom = function() {
  /* Here's the markup that will be generated:
  <g>
    <clippath id="blocklyZoomresetClipPath837493">
      <rect width="32" height="32"></rect>
    </clippath>
    <image width="96" height="124" opacity="0.4" y="-92" xlink:href="media/sprites.png">
        clip-path="url(#blocklyZoomresetClipPath837493)"></image>
    <clippath id="blocklyZoominClipPath837493">
      <rect width="32" height="32" y="43"></rect>
    </clippath>
    <image width="96" height="124" opacity="0.4" x="-32" y="-49" xlink:href="media/sprites.png">
        clip-path="url(#blocklyZoominClipPath837493)"></image>
    <clippath id="blocklyZoomoutClipPath837493">
      <rect width="32" height="32" y="77"></rect>
    </clippath>
    <image width="96" height="124" opacity="0.4" x="-64" y="-15" xlink:href="media/sprites.png">
        clip-path="url(#blocklyZoomoutClipPath837493)"></image>
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
  var rnd = String(Math.random()).substring(2);
  var clip = Blockly.createSvgElement('clipPath',
      {'id': 'blocklyZoomresetClipPath' + rnd},
      this.svgGroup_);
  Blockly.createSvgElement('rect',
      {'width': 32, 'height': 32},
      clip);
  var zoomresetSvg = Blockly.createSvgElement('image',
      {'width': Blockly.SPRITE.width, 'height': Blockly.SPRITE.height, 'y': -92,
       'opacity': 0.4, 'clip-path': 'url(#blocklyZoomresetClipPath' + rnd + ')'},
      this.svgGroup_);
  zoomresetSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      this.workspace_.options.pathToMedia + Blockly.SPRITE.url);

  var clip = Blockly.createSvgElement('clipPath',
      {'id': 'blocklyZoominClipPath' + rnd},
      this.svgGroup_);
  Blockly.createSvgElement('rect',
      {'width': 32, 'height': 32, 'y': 43},
      clip);
  var zoominSvg = Blockly.createSvgElement('image',
      {'width': Blockly.SPRITE.width, 'height': Blockly.SPRITE.height, 'x': -32,
        'y': -49, 'opacity': 0.4, 'clip-path': 'url(#blocklyZoominClipPath' + rnd + ')'},
      this.svgGroup_);
  zoominSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      this.workspace_.options.pathToMedia + Blockly.SPRITE.url);

  var clip = Blockly.createSvgElement('clipPath',
      {'id': 'blocklyZoomoutClipPath' + rnd},
      this.svgGroup_);
  Blockly.createSvgElement('rect',
      {'width': 32, 'height': 32, 'y': 77},
      clip);
  var zoomoutSvg = Blockly.createSvgElement('image',
      {'width': Blockly.SPRITE.width, 'height': Blockly.SPRITE.height, 'x': -64,
        'y': -15, 'opacity': 0.4, 'clip-path': 'url(#blocklyZoomoutClipPath' + rnd + ')'},
      this.svgGroup_);
  zoomoutSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      this.workspace_.options.pathToMedia + Blockly.SPRITE.url);

  // Attach event listeners.

  // Zoom-reset control events.

  Blockly.bindEvent_(zoomresetSvg, 'mousedown', this, function(event) {
    this.workspace_.zoomReset();
    zoomresetSvg.style.opacity = 0.8;
    event.preventDefault();
    event.stopPropagation();
  });

  Blockly.bindEvent_(zoomresetSvg, 'mouseup', this, function() {
    zoomresetSvg.style.opacity = 0.4;
  });

  Blockly.bindEvent_(zoomresetSvg, 'mouseover', this, function() {
    zoomresetSvg.style.opacity = 0.6;
  });

  Blockly.bindEvent_(zoomresetSvg, 'mouseout', this, function() {
    zoomresetSvg.style.opacity = 0.4;
  });

  // Zoom-in control events.

  Blockly.bindEvent_(zoominSvg, 'mousedown', this, function() {
    this.workspace_.zoomCenter(1);
    zoominSvg.style.opacity = 0.8;
  });

  Blockly.bindEvent_(zoominSvg, 'mouseup', this, function() {
    zoominSvg.style.opacity = 0.4;
  });

  Blockly.bindEvent_(zoominSvg, 'mouseover', this, function() {
    zoominSvg.style.opacity = 0.6;
  });

  Blockly.bindEvent_(zoominSvg, 'mouseout', this, function() {
    zoominSvg.style.opacity = 0.4;
  });

  // Zoom-out control events.

  Blockly.bindEvent_(zoomoutSvg, 'mousedown', this, function() {
    this.workspace_.zoomCenter(-1);
    zoomoutSvg.style.opacity = 0.8;
  });

  Blockly.bindEvent_(zoomoutSvg, 'mouseup', this, function() {
    zoomoutSvg.style.opacity = 0.4;
  });

  Blockly.bindEvent_(zoomoutSvg, 'mouseover', this, function() {
    zoomoutSvg.style.opacity = 0.6;
  });

  Blockly.bindEvent_(zoomoutSvg, 'mouseout', this, function() {
    zoomoutSvg.style.opacity = 0.4;
  });

  return this.svgGroup_;
};

/**
 * Initialize the zoom controls.
 */
Blockly.ZoomControls.prototype.init = function() {
  // Initialize some stuff... (animations?)
};

/**
 * Dispose of this zoom controls.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.ZoomControls.prototype.dispose = function() {
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.workspace_ = null;
};

/**
 * Move the zoom controls to the bottom-right corner.
 */
Blockly.ZoomControls.prototype.position = function() {
  var metrics = this.workspace_.getMetrics();
  if (!metrics) {
    // There are no metrics available (workspace is probably not visible).
    return;
  }
  if (this.workspace_.RTL) {
    this.left_ = this.MARGIN_SIDE_;
  } else {
    this.left_ = metrics.viewWidth + metrics.absoluteLeft -
        this.WIDTH_ - this.MARGIN_SIDE_;
  }
  this.top_ = metrics.viewHeight + metrics.absoluteTop -
      this.HEIGHT_ - this.MARGIN_BOTTOM_;
  this.svgGroup_.setAttribute('transform',
      'translate(' + this.left_ + ',' + this.top_ + ')');
};
