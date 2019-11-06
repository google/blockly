/**
 * @license
 * Copyright 2013 Google LLC
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

/**
 * @name Blockly.WidgetDiv
 * @namespace
 */
goog.provide('Blockly.WidgetDiv');

goog.require('Blockly.utils.style');


/**
 * The HTML container.  Set once by Blockly.WidgetDiv.createDom.
 * @type {Element}
 */
Blockly.WidgetDiv.DIV = null;

/**
 * The object currently using this container.
 * @type {Object}
 * @private
 */
Blockly.WidgetDiv.owner_ = null;

/**
 * Optional cleanup function set by whichever object uses the widget.
 * @type {Function}
 * @private
 */
Blockly.WidgetDiv.dispose_ = null;

/**
 * Widget divs will appear within the bounds of this element if possible.
 * @type {Element}
 * @private
 */
Blockly.WidgetDiv.boundsElement_ = null;

/**
 * Create the widget div and inject it onto the page.
 * @param {!Element} container The containing element.
 */
Blockly.WidgetDiv.createDom = function(container) {
  if (Blockly.WidgetDiv.DIV) {
    return;  // Already created.
  }
  // Create an HTML container for popup overlays (e.g. editor widgets).
  Blockly.WidgetDiv.DIV = document.createElement('div');
  Blockly.WidgetDiv.DIV.className = 'blocklyWidgetDiv';
  container.appendChild(Blockly.WidgetDiv.DIV);
  Blockly.WidgetDiv.boundsElement_ = container;
};

/**
 * Initialize and display the widget div.  Close the old one if needed.
 * @param {!Object} newOwner The object that will be using this container.
 * @param {boolean} rtl Right-to-left (true) or left-to-right (false).
 * @param {Function} dispose Optional cleanup function to be run when the
 *     widget is closed.
 */
Blockly.WidgetDiv.show = function(newOwner, rtl, dispose) {
  Blockly.WidgetDiv.hide();
  Blockly.WidgetDiv.owner_ = newOwner;
  Blockly.WidgetDiv.dispose_ = dispose;
  // Temporarily move the widget to the top of the screen so that it does not
  // cause a scrollbar jump in Firefox when displayed.
  var xy = Blockly.utils.style.getViewportPageOffset();
  Blockly.WidgetDiv.DIV.style.top = xy.y + 'px';
  Blockly.WidgetDiv.DIV.style.direction = rtl ? 'rtl' : 'ltr';
  Blockly.WidgetDiv.DIV.style.display = 'block';
};

/**
 * Destroy the widget and hide the div.
 */
Blockly.WidgetDiv.hide = function() {
  if (Blockly.WidgetDiv.owner_) {
    Blockly.WidgetDiv.owner_ = null;
    Blockly.WidgetDiv.DIV.style.display = 'none';
    Blockly.WidgetDiv.DIV.style.left = '';
    Blockly.WidgetDiv.DIV.style.top = '';
    Blockly.WidgetDiv.dispose_ && Blockly.WidgetDiv.dispose_();
    Blockly.WidgetDiv.dispose_ = null;
    Blockly.WidgetDiv.DIV.innerHTML = '';
    if (Blockly.WidgetDiv.owner_) {
      Blockly.WidgetDiv.owner_.getSourceBlock().workspace.markFocused();
    }
  }
};

/**
 * Is the container visible?
 * @return {boolean} True if visible.
 */
Blockly.WidgetDiv.isVisible = function() {
  return !!Blockly.WidgetDiv.owner_;
};

/**
 * Destroy the widget and hide the div if it is being used by the specified
 * object.
 * @param {!Object} oldOwner The object that was using this container.
 */
Blockly.WidgetDiv.hideIfOwner = function(oldOwner) {
  if (Blockly.WidgetDiv.owner_ == oldOwner) {
    Blockly.WidgetDiv.hide();
  }
};

/**
 * Set the widget div's position and height.  This function does nothing clever:
 * it will not ensure that your widget div ends up in the visible window.
 * @param {number} x Horizontal location (window coordinates, not body).
 * @param {number} y Vertical location (window coordinates, not body).
 * @param {number} height The height of the widget div (pixels).
 * @private
 */
Blockly.WidgetDiv.positionInternal_ = function(x, y, height) {
  Blockly.WidgetDiv.DIV.style.left = x + 'px';
  Blockly.WidgetDiv.DIV.style.top = y + 'px';
  Blockly.WidgetDiv.DIV.style.height = height + 'px';
};

/**
 * Position the widget div based on an anchor rectangle.
 * The widget should be placed adjacent to but not overlapping the anchor
 * rectangle.  The preferred position is directly below and aligned to the left
 * (LTR) or right (RTL) side of the anchor.
 * @param {!Object} anchorBBox The bounding rectangle of the anchor, in window
 *     coordinates.
 * @param {!Blockly.utils.Size} widgetSize The size of the widget that is inside the
 *     widget div, in window coordinates.
 * @param {boolean} rtl Whether the workspace is in RTL mode.  This determines
 *     horizontal alignment.
 * @package
 */
Blockly.WidgetDiv.positionWithAnchor = function(anchorBBox, widgetSize, rtl) {

  var y = Blockly.WidgetDiv.calculateY_(anchorBBox, widgetSize);
  var x = Blockly.WidgetDiv.calculateX_(anchorBBox, widgetSize, rtl);

  if (y < 0) {
    Blockly.WidgetDiv.positionInternal_(x, 0, widgetSize.height + y);
  } else {
    Blockly.WidgetDiv.positionInternal_(x, y, widgetSize.height);
  }
};

/**
 * Calculate an x position (in window coordinates) such that the widget will not
 * be offscreen on the right or left.
 * @param {!Object} anchorBBox The bounding rectangle of the anchor, in window
 *     coordinates.
 * @param {Blockly.utils.Size} widgetSize The dimensions of the widget inside the
 *     widget div.
 * @param {boolean} rtl Whether the Blockly workspace is in RTL mode.
 * @return {number} A valid x-coordinate for the top left corner of the widget
 *     div, in window coordinates.
 * @private
 */
Blockly.WidgetDiv.calculateX_ = function(anchorBBox, widgetSize, rtl) {

  var containerBBox = Blockly.WidgetDiv.boundsElement_.getBoundingClientRect();

  if (rtl) {
    // Try to align the right side of the field and the right side of widget.
    var relativeRightAnchor = anchorBBox.right - containerBBox.left;

    // The left side of the widget positioned with the anchor.
    var widgetLeft = relativeRightAnchor - widgetSize.width;

    // If the left side of the widget is too far to the left go to the widget
    // size so it will stay on the screen.
    return Math.max(widgetLeft, widgetSize.width);
  } else {

    // The relative left position of the widget.
    var relativeLeftAnchor = anchorBBox.left - containerBBox.left;

    // The farthest point to the right without going off screen.
    var rightBoundary = containerBBox.width - widgetSize.width;

    return Math.min(relativeLeftAnchor, rightBoundary);
  }
};

/**
 * Calculate a y position (in window coordinates) such that the widget will not
 * be offscreen on the top or bottom.
 * @param {!Object} anchorBBox The bounding rectangle of the anchor, in window
 *     coordinates.
 * @param {Blockly.utils.Size} widgetSize The dimensions of the widget inside the
 *     widget div.
 * @return {number} A valid y-coordinate for the top left corner of the widget
 *     div, in window coordinates.
 * @private
 */
Blockly.WidgetDiv.calculateY_ = function(anchorBBox, widgetSize) {
  var containerBBox = Blockly.WidgetDiv.boundsElement_.getBoundingClientRect();

  // Flip the widget vertically if off the bottom.
  if (anchorBBox.bottom + widgetSize.height >= containerBBox.bottom) {
    // The bottom of the widget is at the top of the field.
    return anchorBBox.top - widgetSize.height;
    // The widget could go off the top of the window, but it would also go off
    // the bottom.  The window is just too small.
  } else {
    // The top of the widget is at the bottom of the field.
    return anchorBBox.bottom;
  }
};

/**
 * Get the scaled bounding box of a field relative to the widgets container.
 * @param {!Blockly.Field} field The field.
 * @return {!Blockly.utils.Rect} The scaled bounding box of the field.
 * @package
 */
Blockly.WidgetDiv.getScaledBboxOfField = function(field) {
  var bBox = field.getScaledBBox();
  var containerOffset = Blockly.utils.style.getPageOffset(
      /** @type {!Element} */ (Blockly.WidgetDiv.boundsElement_));

  return new Blockly.utils.Rect(
      bBox.top - containerOffset.y,
      bBox.bottom - containerOffset.y,
      bBox.left - containerOffset.x,
      bBox.right - containerOffset.x
  );
};
