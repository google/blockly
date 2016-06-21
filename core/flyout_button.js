/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Object representing an icon on a block.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FlyoutButton');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');


/**
 * Class for a button in the flyout.
 * @param {Blockly.Workspace} workspace The workspace in which to place this
 * button.
 * @constructor
 */
Blockly.FlyoutButton = function(workspace, text) {
  this.workspace_ = workspace;
  this.text_ = text;
};

/**
 * Create the button elements.
 * @return {!Element} The button's SVG group.
 */
Blockly.FlyoutButton.prototype.createDom = function() {
  this.svgGroup_ = Blockly.createSvgElement('g',
      {'class': 'blocklyFlyoutButton'}, this.workspace_.svgGroup_);

  this.height = 16;
  this.width = 40;

  // Rect with rounded corners.
  Blockly.createSvgElement('rect',
      {'class': 'blocklyIconShape',
       'rx': '4', 'ry': '4',
       'height': this.height, 'width': this.width},
       this.svgGroup_);

  Blockly.createSvgElement('text',
      {'class': 'blocklyButtonText', 'x': '0', 'y': '0'}, this.svgGroup_);

  return this.svgGroup_;
};

Blockly.FlyoutButton.prototype.show = function() {
  this.svgGroup_.setAttribute('display', 'block');
};

Blockly.FlyoutButton.prototype.moveTo = function(x, y) {
  this.svgGroup_.setAttribute('transform', 'translate(' + x + ',' +
      y + ')');
};

Blockly.FlyoutButton.prototype.dispose = function() {
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.workspace_ = null;
};

/**
 * Do something
 */
Blockly.FlyoutButton.prototype.click = function() {
  console.log('Go away');
};
