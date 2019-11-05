/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Blockly menu item similar to Closure's goog.ui.MenuItem
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.Slider');

goog.require('Blockly.Component');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');


/**
 * Class representing an item in a menu.
 *
 * @param {number=} opt_value Initial slider value.
 * @constructor
 * @extends {Blockly.Component}
 */
Blockly.Slider = function(value, min, max, step) {
  Blockly.Component.call(this);

  /**
   * The value held by the slider.
   * @type {number}
   * @private
   */
  this.value_ = value;

  /**
   * The minimum value set by the slider.
   * @type {number}
   * @private
   */
  this.min_ = min;

  /**
   * The maximum value set by the slider.
   * @type {number}
   * @private
   */
  this.max_ = max;

  /**
   * Slider step (The smallest difference of values obtained using the slider).
   * @type {number}
   * @private
   */
  this.step_ = step;
};
Blockly.utils.object.inherits(Blockly.Slider, Blockly.Component);


/**
 * Creates the slider's DOM.
 * @override
 */
Blockly.Slider.prototype.createDom = function() {
  var element = document.createElement('div');
  element.id = this.getId();
  this.setElementInternal(element);

  element.className = 'blockly-slider blockly-slider-horizontal';

  var thumb = document.createElement('thumb');
  element.appendChild(thumb);

//   // Initialize ARIA role and state.
//   Blockly.utils.aria.setRole(element, this.roleName_ || (this.checkable_ ?
//       Blockly.utils.aria.Role.MENUITEMCHECKBOX :
//       Blockly.utils.aria.Role.MENUITEM));
//   Blockly.utils.aria.setState(element,
//       Blockly.utils.aria.State.SELECTED, (this.checkable_ && this.checked_) || false);
};

/**
 * Adds the event listeners to the menu.
 * @private
 */
Blockly.Slider.prototype.attachEvents_ = function() {
  var el = /** @type {!EventTarget} */ (this.getElement());

  this.mouseOverHandler_ = Blockly.bindEventWithChecks_(el,
      'mouseover', this, this.handleMouseOver_, true);
};

/**
 * Removes the event listeners from the menu.
 * @private
 */
Blockly.Slider.prototype.detachEvents_ = function() {
  Blockly.unbindEvent_(this.mouseOverHandler_);
};

/**
 * Sets the value associated with the menu item.
 * @param {*} value Value to be associated with the menu item.
 * @package
 */
Blockly.Slider.prototype.handleMouseOver_ = function(e) {
  
};

/**
 * Gets the value associated with the menu item.
 * @return {*} value Value associated with the menu item.
 * @package
 */
Blockly.Slider.prototype.getValue = function() {
  return this.value_;
};
