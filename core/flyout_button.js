/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Class for a button in the flyout.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FlyoutButton');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');


/**
 * Class for a button in the flyout.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to place this
 *     button.
 * @param {!Blockly.WorkspaceSvg} targetWorkspace The flyout's target workspace.
 * @param {string} text The text to display on the button.
 * @param {string} callbackKey The key to use when looking up the callback for a
 *     click on this button.
 * @param {boolean} isLabel Whether this button should be styled as a label.
 * @constructor
 */
Blockly.FlyoutButton = function(workspace, targetWorkspace, text, callbackKey,
    isLabel) {
  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.targetWorkspace_ = targetWorkspace;

  /**
   * @type {string}
   * @private
   */
  this.text_ = text;

  /**
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.position_ = new goog.math.Coordinate(0, 0);

  /**
   * Function to call when this button is clicked.
   * @type {function(!Blockly.FlyoutButton)}
   * @private
   */
  this.callback_ = Blockly.flyoutButtonCallbacks_[callbackKey];

  /**
   * Whether this button should be styled as a label.
   * @type {boolean}
   * @private
   */
  this.isLabel_ = isLabel;
};

/**
 * The margin around the text in the button.
 */
Blockly.FlyoutButton.MARGIN = 5;

/**
 * The width of the button's rect.
 * @type {number}
 */
Blockly.FlyoutButton.prototype.width = 0;

/**
 * The height of the button's rect.
 * @type {number}
 */
Blockly.FlyoutButton.prototype.height = 0;

/**
 * Create the button elements.
 * @return {!Element} The button's SVG group.
 */
Blockly.FlyoutButton.prototype.createDom = function() {
  this.svgGroup_ = Blockly.createSvgElement('g',
      {'class': this.isLabel_ ? 'blocklyFlyoutLabel' : 'blocklyFlyoutButton'},
      this.workspace_.getCanvas());

  if (!this.isLabel_) {
    // Shadow rectangle (light source does not mirror in RTL).
    var shadow = Blockly.createSvgElement('rect',
        {'class': 'blocklyFlyoutButtonShadow',
         'rx': 4, 'ry': 4, 'x': 1, 'y': 1},
         this.svgGroup_);
  }
  // Background rectangle.
  var rect = Blockly.createSvgElement('rect',
      {'class': this.isLabel_ ?
        'blocklyFlyoutLabelBackground' : 'blocklyFlyoutButtonBackground',
        'rx': 4, 'ry': 4},
      this.svgGroup_);

  var svgText = Blockly.createSvgElement('text',
      {'class': this.isLabel_ ? 'blocklyFlyoutLabelText' : 'blocklyText',
        'x': 0, 'y': 0,
        'text-anchor': 'middle'}, this.svgGroup_);
  svgText.textContent = this.text_;

  this.width = svgText.getComputedTextLength() +
      2 * Blockly.FlyoutButton.MARGIN;
  this.height = 20;  // Can't compute it :(

  if (!this.isLabel_) {
    shadow.setAttribute('width', this.width);
    shadow.setAttribute('height', this.height);
  }
  rect.setAttribute('width', this.width);
  rect.setAttribute('height', this.height);

  svgText.setAttribute('x', this.width / 2);
  svgText.setAttribute('y', this.height - Blockly.FlyoutButton.MARGIN);

  this.updateTransform_();
  return this.svgGroup_;
};

/**
 * Correctly position the flyout button and make it visible.
 */
Blockly.FlyoutButton.prototype.show = function() {
  this.updateTransform_();
  this.svgGroup_.setAttribute('display', 'block');
};

/**
 * Update svg attributes to match internal state.
 * @private
 */
Blockly.FlyoutButton.prototype.updateTransform_ = function() {
  this.svgGroup_.setAttribute('transform',
      'translate(' + this.position_.x + ',' + this.position_.y + ')');
};

/**
 * Move the button to the given x, y coordinates.
 * @param {number} x The new x coordinate.
 * @param {number} y The new y coordinate.
 */
Blockly.FlyoutButton.prototype.moveTo = function(x, y) {
  this.position_.x = x;
  this.position_.y = y;
  this.updateTransform_();
};

/**
 * Get the button's target workspace.
 * @return {!Blockly.WorkspaceSvg} The target workspace of the flyout where this
 *     button resides.
 */
Blockly.FlyoutButton.prototype.getTargetWorkspace = function() {
  return this.targetWorkspace_;
};

/**
 * Dispose of this button.
 */
Blockly.FlyoutButton.prototype.dispose = function() {
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.workspace_ = null;
  this.targetWorkspace_ = null;
};

/**
 * Do something when the button is clicked.
 * @param {!Event} e Mouse up event.
 */
Blockly.FlyoutButton.prototype.onMouseUp = function(e) {
  // Don't scroll the page.
  e.preventDefault();
  // Don't propagate mousewheel event (zooming).
  e.stopPropagation();
  // Stop binding to mouseup and mousemove events--flyout mouseup would normally
  // do this, but we're skipping that.
  Blockly.Flyout.terminateDrag_();

  // Call the callback registered to this button.
  if (this.callback_) {
    this.callback_(this);
  }
};
