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
 * @fileoverview A div that floats on top of Blockly.  This singleton contains
 *     temporary HTML UI widgets that the user is currently interacting with.
 *     E.g. text input areas, colour pickers, context menus.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.WidgetDiv');

goog.require('Blockly.Css');
goog.require('goog.dom');


/**
 * Class for a WidgetDiv.
 * Creates the WidgetDiv's DOM.
 * @param {!Blockly.Workspace} workspace The workspace in which to create new
 *     blocks.
 * @constructor
 */
Blockly.WidgetDiv = function(workspace) {
  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.workspace_ = workspace;
};


/**
 * The HTML container.  Set once by Blockly.WidgetDiv.createDom.
 * @type {Element}
 */
Blockly.WidgetDiv.prototype.DIV = null;

/**
 * The object currently using this container.
 * @type {Object}
 * @private
 */
Blockly.WidgetDiv.prototype.owner_ = null;

/**
 * Optional cleanup function set by whichever object uses the widget.
 * @type {Function}
 * @private
 */
Blockly.WidgetDiv.prototype.dispose_ = null;





/**
 * Create the widget div and inject it onto the page.
 */
Blockly.WidgetDiv.prototype.createDom = function() {
  if (this.DIV) {
    return;  // Already created.
  }
  // Create an HTML container for popup overlays (e.g. editor widgets).
  this.DIV = goog.dom.createDom('div', 'blocklyWidgetDiv');
  
  var svg = this.workspace_.options.svg;
  svg.parentNode.insertBefore(this.DIV, svg);
};

/**
 * Initialize and display the widget div.  Close the old one if needed.
 * @param {!Object} newOwner The object that will be using this container.
 * @param {boolean} rtl Right-to-left (true) or left-to-right (false).
 * @param {Function} dispose Optional cleanup function to be run when the widget
 *   is closed.
 */
Blockly.WidgetDiv.prototype.show = function(newOwner, rtl, dispose) {
  this.hide();
  this.owner_ = newOwner;
  this.dispose_ = dispose;
  this.DIV.style.direction = rtl ? 'rtl' : 'ltr';
  this.DIV.style.display = 'block';
};

/**
 * Destroy the widget and hide the div.
 */
Blockly.WidgetDiv.prototype.hide = function() {
  if (this.owner_) {
    this.DIV.style.display = 'none';
    this.DIV.style.left = '';
    this.DIV.style.top = '';
    this.dispose_ && this.dispose_();
    this.owner_ = null;
    this.dispose_ = null;
    goog.dom.removeChildren(this.DIV);
  }
};

/**
 * Is the container visible?
 * @return {boolean} True if visible.
 */
Blockly.WidgetDiv.prototype.isVisible = function() {
  return !!this.owner_;
};

/**
 * Destroy the widget and hide the div if it is being used by the specified
 *   object.
 * @param {!Object} oldOwner The object that was using this container.
 */
Blockly.WidgetDiv.prototype.hideIfOwner = function(oldOwner) {
  if (this.owner_ == oldOwner) {
    this.hide();
  }
};

/**
 * Position the widget at a given location.  Prevent the widget from going
 * offscreen top or left (right in RTL).
 * @param {number} anchorX Horizontal location (window coorditates, not body).
 * @param {number} anchorY Vertical location (window coorditates, not body).
 * @param {!goog.math.Size} windowSize Height/width of window.
 * @param {!goog.math.Coordinate} scrollOffset X/y of window scrollbars.
 * @param {boolean} rtl True if RTL, false if LTR.
 */
Blockly.WidgetDiv.prototype.position = function(anchorX, anchorY, windowSize,
                                      scrollOffset, rtl) {
  // Don't let the widget go above the top edge of the window.
  if (anchorY < scrollOffset.y) {
    anchorY = scrollOffset.y;
  }
  if (rtl) {
    // Don't let the menu go right of the right edge of the window.
    if (anchorX > windowSize.width + scrollOffset.x) {
      anchorX = windowSize.width + scrollOffset.x;
    }
  } else {
    // Don't let the widget go left of the left edge of the window.
    if (anchorX < scrollOffset.x) {
      anchorX = scrollOffset.x;
    }
  }
  this.DIV.style.left = anchorX + 'px';
  this.DIV.style.top = anchorY + 'px';
  this.DIV.style.height = windowSize.height - anchorY + 'px';
};
