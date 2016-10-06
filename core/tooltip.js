/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview Library to create tooltips for Blockly.
 * First, call Blockly.Tooltip.init() after onload.
 * Second, set the 'tooltip' property on any SVG element that needs a tooltip.
 * If the tooltip is a string, then that message will be displayed.
 * If the tooltip is an SVG element, then that object's tooltip will be used.
 * Third, call Blockly.Tooltip.bindMouseEvents(e) passing the SVG element.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Tooltip');

goog.require('goog.dom');
goog.require('goog.dom.TagName');


/**
 * Is a tooltip currently showing?
 */
Blockly.Tooltip.visible = false;

/**
 * Maximum width (in characters) of a tooltip.
 */
Blockly.Tooltip.LIMIT = 50;

/**
 * PID of suspended thread to clear tooltip on mouse out.
 * @private
 */
Blockly.Tooltip.mouseOutPid_ = 0;

/**
 * PID of suspended thread to show the tooltip.
 * @private
 */
Blockly.Tooltip.showPid_ = 0;

/**
 * Last observed X location of the mouse pointer (freezes when tooltip appears).
 * @private
 */
Blockly.Tooltip.lastX_ = 0;

/**
 * Last observed Y location of the mouse pointer (freezes when tooltip appears).
 * @private
 */
Blockly.Tooltip.lastY_ = 0;

/**
 * Current element being pointed at.
 * @private
 */
Blockly.Tooltip.element_ = null;

/**
 * Once a tooltip has opened for an element, that element is 'poisoned' and
 * cannot respawn a tooltip until the pointer moves over a different element.
 * @private
 */
Blockly.Tooltip.poisonedElement_ = null;

/**
 * Horizontal offset between mouse cursor and tooltip.
 */
Blockly.Tooltip.OFFSET_X = 0;

/**
 * Vertical offset between mouse cursor and tooltip.
 */
Blockly.Tooltip.OFFSET_Y = 10;

/**
 * Radius mouse can move before killing tooltip.
 */
Blockly.Tooltip.RADIUS_OK = 10;

/**
 * Delay before tooltip appears.
 */
Blockly.Tooltip.HOVER_MS = 750;

/**
 * Horizontal padding between tooltip and screen edge.
 */
Blockly.Tooltip.MARGINS = 5;

/**
 * The HTML container.  Set once by Blockly.Tooltip.createDom.
 * @type {Element}
 */
Blockly.Tooltip.DIV = null;

/**
 * Create the tooltip div and inject it onto the page.
 */
Blockly.Tooltip.createDom = function() {
  if (Blockly.Tooltip.DIV) {
    return;  // Already created.
  }
  // Create an HTML container for popup overlays (e.g. editor widgets).
  Blockly.Tooltip.DIV =
      goog.dom.createDom(goog.dom.TagName.DIV, 'blocklyTooltipDiv');
  document.body.appendChild(Blockly.Tooltip.DIV);
};

/**
 * Binds the required mouse events onto an SVG element.
 * @param {!Element} element SVG element onto which tooltip is to be bound.
 */
Blockly.Tooltip.bindMouseEvents = function(element) {
  Blockly.bindEvent_(element, 'mouseover', null,
      Blockly.Tooltip.onMouseOver_);
  Blockly.bindEvent_(element, 'mouseout', null,
      Blockly.Tooltip.onMouseOut_);

  // Don't use bindEvent_ for mousemove since that would create a
  // corresponding touch handler, even though this only makes sense in the
  // context of a mouseover/mouseout.
  element.addEventListener('mousemove', Blockly.Tooltip.onMouseMove_, false);
};

/**
 * Hide the tooltip if the mouse is over a different object.
 * Initialize the tooltip to potentially appear for this object.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Tooltip.onMouseOver_ = function(e) {
  // If the tooltip is an object, treat it as a pointer to the next object in
  // the chain to look at.  Terminate when a string or function is found.
  var element = e.target;
  while (!goog.isString(element.tooltip) && !goog.isFunction(element.tooltip)) {
    element = element.tooltip;
  }
  if (Blockly.Tooltip.element_ != element) {
    Blockly.Tooltip.hide();
    Blockly.Tooltip.poisonedElement_ = null;
    Blockly.Tooltip.element_ = element;
  }
  // Forget about any immediately preceeding mouseOut event.
  clearTimeout(Blockly.Tooltip.mouseOutPid_);
};

/**
 * Hide the tooltip if the mouse leaves the object and enters the workspace.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Tooltip.onMouseOut_ = function(e) {
  // Moving from one element to another (overlapping or with no gap) generates
  // a mouseOut followed instantly by a mouseOver.  Fork off the mouseOut
  // event and kill it if a mouseOver is received immediately.
  // This way the task only fully executes if mousing into the void.
  Blockly.Tooltip.mouseOutPid_ = setTimeout(function() {
    Blockly.Tooltip.element_ = null;
    Blockly.Tooltip.poisonedElement_ = null;
    Blockly.Tooltip.hide();
  }, 1);
  clearTimeout(Blockly.Tooltip.showPid_);
};

/**
 * When hovering over an element, schedule a tooltip to be shown.  If a tooltip
 * is already visible, hide it if the mouse strays out of a certain radius.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Tooltip.onMouseMove_ = function(e) {
  if (!Blockly.Tooltip.element_ || !Blockly.Tooltip.element_.tooltip) {
    // No tooltip here to show.
    return;
  } else if (Blockly.dragMode_ != Blockly.DRAG_NONE) {
    // Don't display a tooltip during a drag.
    return;
  } else if (Blockly.WidgetDiv.isVisible()) {
    // Don't display a tooltip if a widget is open (tooltip would be under it).
    return;
  }
  if (Blockly.Tooltip.visible) {
    // Compute the distance between the mouse position when the tooltip was
    // shown and the current mouse position.  Pythagorean theorem.
    var dx = Blockly.Tooltip.lastX_ - e.pageX;
    var dy = Blockly.Tooltip.lastY_ - e.pageY;
    if (Math.sqrt(dx * dx + dy * dy) > Blockly.Tooltip.RADIUS_OK) {
      Blockly.Tooltip.hide();
    }
  } else if (Blockly.Tooltip.poisonedElement_ != Blockly.Tooltip.element_) {
    // The mouse moved, clear any previously scheduled tooltip.
    clearTimeout(Blockly.Tooltip.showPid_);
    // Maybe this time the mouse will stay put.  Schedule showing of tooltip.
    Blockly.Tooltip.lastX_ = e.pageX;
    Blockly.Tooltip.lastY_ = e.pageY;
    Blockly.Tooltip.showPid_ =
        setTimeout(Blockly.Tooltip.show_, Blockly.Tooltip.HOVER_MS);
  }
};

/**
 * Hide the tooltip.
 */
Blockly.Tooltip.hide = function() {
  if (Blockly.Tooltip.visible) {
    Blockly.Tooltip.visible = false;
    if (Blockly.Tooltip.DIV) {
      Blockly.Tooltip.DIV.style.display = 'none';
    }
  }
  clearTimeout(Blockly.Tooltip.showPid_);
};

/**
 * Create the tooltip and show it.
 * @private
 */
Blockly.Tooltip.show_ = function() {
  Blockly.Tooltip.poisonedElement_ = Blockly.Tooltip.element_;
  if (!Blockly.Tooltip.DIV) {
    return;
  }
  // Erase all existing text.
  goog.dom.removeChildren(/** @type {!Element} */ (Blockly.Tooltip.DIV));
  // Get the new text.
  var tip = Blockly.Tooltip.element_.tooltip;
  while (goog.isFunction(tip)) {
    tip = tip();
  }
  tip = Blockly.utils.wrap(tip, Blockly.Tooltip.LIMIT);
  // Create new text, line by line.
  var lines = tip.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(lines[i]));
    Blockly.Tooltip.DIV.appendChild(div);
  }
  var rtl = Blockly.Tooltip.element_.RTL;
  var windowSize = goog.dom.getViewportSize();
  // Display the tooltip.
  Blockly.Tooltip.DIV.style.direction = rtl ? 'rtl' : 'ltr';
  Blockly.Tooltip.DIV.style.display = 'block';
  Blockly.Tooltip.visible = true;
  // Move the tooltip to just below the cursor.
  var anchorX = Blockly.Tooltip.lastX_;
  if (rtl) {
    anchorX -= Blockly.Tooltip.OFFSET_X + Blockly.Tooltip.DIV.offsetWidth;
  } else {
    anchorX += Blockly.Tooltip.OFFSET_X;
  }
  var anchorY = Blockly.Tooltip.lastY_ + Blockly.Tooltip.OFFSET_Y;

  if (anchorY + Blockly.Tooltip.DIV.offsetHeight >
      windowSize.height + window.scrollY) {
    // Falling off the bottom of the screen; shift the tooltip up.
    anchorY -= Blockly.Tooltip.DIV.offsetHeight + 2 * Blockly.Tooltip.OFFSET_Y;
  }
  if (rtl) {
    // Prevent falling off left edge in RTL mode.
    anchorX = Math.max(Blockly.Tooltip.MARGINS - window.scrollX, anchorX);
  } else {
    if (anchorX + Blockly.Tooltip.DIV.offsetWidth >
        windowSize.width + window.scrollX - 2 * Blockly.Tooltip.MARGINS) {
      // Falling off the right edge of the screen;
      // clamp the tooltip on the edge.
      anchorX = windowSize.width - Blockly.Tooltip.DIV.offsetWidth -
          2 * Blockly.Tooltip.MARGINS;
    }
  }
  Blockly.Tooltip.DIV.style.top = anchorY + 'px';
  Blockly.Tooltip.DIV.style.left = anchorX + 'px';
};
