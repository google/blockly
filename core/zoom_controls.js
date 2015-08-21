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
Blockly.ZoomControls.prototype.MARGIN_BOTTOM_ = 100;

/**
 * Distance between zoom controls and right edge of workspace.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.MARGIN_SIDE_ = 35;

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
  var workspace = this.workspace_;
  /* Here's the markup that will be generated:
  <g class="blocklyZoom">
    <clippath id="blocklyZoomoutClipPath837493">
      <rect width="32" height="32" y="77"></rect>
    </clippath>
    <image width="96" height="124" x="-64" y="-15" xlink:href="media/sprites.png">
        clip-path="url(#blocklyZoomoutClipPath837493)"></image>
    <clippath id="blocklyZoominClipPath837493">
      <rect width="32" height="32" y="43"></rect>
    </clippath>
    <image width="96" height="124" x="-32" y="-49" xlink:href="media/sprites.png">
        clip-path="url(#blocklyZoominClipPath837493)"></image>
    <clippath id="blocklyZoomresetClipPath837493">
      <rect width="32" height="32"></rect>
    </clippath>
    <image width="96" height="124" y="-92" xlink:href="media/sprites.png">
        clip-path="url(#blocklyZoomresetClipPath837493)"></image>
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g',
      {'class': 'blocklyZoom'}, null);
  var rnd = String(Math.random()).substring(2);

  var clip = Blockly.createSvgElement('clipPath',
      {'id': 'blocklyZoomoutClipPath' + rnd},
      this.svgGroup_);
  Blockly.createSvgElement('rect',
      {'width': 32, 'height': 32, 'y': 77},
      clip);
  var zoomoutSvg = Blockly.createSvgElement('image',
      {'width': Blockly.SPRITE.width,
       'height': Blockly.SPRITE.height, 'x': -64,
       'y': -15,
       'clip-path': 'url(#blocklyZoomoutClipPath' + rnd + ')'},
      this.svgGroup_);
  zoomoutSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      workspace.options.pathToMedia + Blockly.SPRITE.url);

  var clip = Blockly.createSvgElement('clipPath',
      {'id': 'blocklyZoominClipPath' + rnd},
      this.svgGroup_);
  Blockly.createSvgElement('rect',
      {'width': 32, 'height': 32, 'y': 43},
      clip);
  var zoominSvg = Blockly.createSvgElement('image',
      {'width': Blockly.SPRITE.width,
       'height': Blockly.SPRITE.height,
       'x': -32,
       'y': -49,
       'clip-path': 'url(#blocklyZoominClipPath' + rnd + ')'},
      this.svgGroup_);
  zoominSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      workspace.options.pathToMedia + Blockly.SPRITE.url);

  var clip = Blockly.createSvgElement('clipPath',
      {'id': 'blocklyZoomresetClipPath' + rnd},
      this.svgGroup_);
  Blockly.createSvgElement('rect',
      {'width': 32, 'height': 32},
      clip);
  var zoomresetSvg = Blockly.createSvgElement('image',
      {'width': Blockly.SPRITE.width,
       'height': Blockly.SPRITE.height, 'y': -92,
       'clip-path': 'url(#blocklyZoomresetClipPath' + rnd + ')'},
      this.svgGroup_);
  zoomresetSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      workspace.options.pathToMedia + Blockly.SPRITE.url);

  // Attach event listeners.
  Blockly.bindEvent_(zoomresetSvg, 'mousedown', workspace, workspace.zoomReset);
  Blockly.bindEvent_(zoominSvg, 'mousedown', null, function() {
    workspace.zoomCenter(1);
  });
  Blockly.bindEvent_(zoomoutSvg, 'mousedown', null, function() {
    workspace.zoomCenter(-1);
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
