/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
 * @fileoverview Utilities for element styles.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

/**
 * @name Blockly.utils.style
 * @namespace
 */
goog.provide('Blockly.utils.style');

goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.Size');


/**
 * Gets the height and width of an element.
 * Similar to Closure's goog.style.getSize.
 * @param {Element} element Element to get size of.
 * @return {!Blockly.utils.Size} Object with width/height properties.
 */
Blockly.utils.style.getSize = function(element) {
  if (Blockly.utils.style.getStyle_(element, 'display') != 'none') {
    var offsetWidth = /** @type {!HTMLElement} */ (element).offsetWidth;
    var offsetHeight = /** @type {!HTMLElement} */ (element).offsetHeight;
    return new Blockly.utils.Size(offsetWidth, offsetHeight);
  }

  // Evaluate size with a temporary element.
  var style = element.style;
  var originalDisplay = style.display;
  var originalVisibility = style.visibility;
  var originalPosition = style.position;

  style.visibility = 'hidden';
  style.position = 'absolute';
  style.display = 'inline';

  var offsetWidth = /** @type {!HTMLElement} */ (element).offsetWidth;
  var offsetHeight = /** @type {!HTMLElement} */ (element).offsetHeight;

  style.display = originalDisplay;
  style.position = originalPosition;
  style.visibility = originalVisibility;

  return new Blockly.utils.Size(offsetWidth, offsetHeight);
};

/**
 * Cross-browser pseudo get computed style. It returns the computed style where
 * available. If not available it tries the cascaded style value (IE
 * currentStyle) and in worst case the inline style value.  It shouldn't be
 * called directly, see http://wiki/Main/ComputedStyleVsCascadedStyle for
 * discussion.
 *
 * Copied from Closure's goog.ui.style
 *
 * @param {Element} element Element to get style of.
 * @param {string} style Property to get (must be camelCase, not css-style.).
 * @return {string} Style value.
 * @private
 */
Blockly.utils.style.getStyle_ = function(element, style) {
  return Blockly.utils.style.getComputedStyle(element, style) ||
      Blockly.utils.style.getCascadedStyle(element, style) ||
      (element.style && element.style[style]);
};

/**
 * Retrieves a computed style value of a node. It returns empty string if the
 * value cannot be computed (which will be the case in Internet Explorer) or
 * "none" if the property requested is an SVG one and it has not been
 * explicitly set (firefox and webkit).
 *
 * Copied from Closure's goog.ui.style
 *
 * @param {Element} element Element to get style of.
 * @param {string} property Property to get (camel-case).
 * @return {string} Style value.
 */
Blockly.utils.style.getComputedStyle = function(element, property) {
  if (document.defaultView && document.defaultView.getComputedStyle) {
    var styles = document.defaultView.getComputedStyle(element, null);
    if (styles) {
      // element.style[..] is undefined for browser specific styles
      // as 'filter'.
      return styles[property] || styles.getPropertyValue(property) || '';
    }
  }

  return '';
};

/**
 * Gets the cascaded style value of a node, or null if the value cannot be
 * computed (only Internet Explorer can do this).
 *
 * Copied from Closure's goog.ui.style
 *
 * @param {Element} element Element to get style of.
 * @param {string} style Property to get (camel-case).
 * @return {string} Style value.
 */
Blockly.utils.style.getCascadedStyle = function(element, style) {
  return /** @type {string} */ (
      element.currentStyle ? element.currentStyle[style] : null);
};

/**
 * Returns a Coordinate object relative to the top-left of the HTML document.
 * Similar to Closure's goog.style.getPageOffset.
 * @param {Element} el Element to get the page offset for.
 * @return {!Blockly.utils.Coordinate} The page offset.
 */
Blockly.utils.style.getPageOffset = function(el) {
  var pos = new Blockly.utils.Coordinate(0, 0);
  var box = el.getBoundingClientRect();
  var documentElement = document.documentElement;
  // Must add the scroll coordinates in to get the absolute page offset
  // of element since getBoundingClientRect returns relative coordinates to
  // the viewport.
  var scrollCoord = new Blockly.utils.Coordinate(
      window.pageXOffset || documentElement.scrollLeft,
      window.pageYOffset || documentElement.scrollTop);
  pos.x = box.left + scrollCoord.x;
  pos.y = box.top + scrollCoord.y;

  return pos;
};

/**
 * Calculates the viewport coordinates relative to the document.
 * Similar to Closure's goog.style.getViewportPageOffset.
 * @return {!Blockly.utils.Coordinate} The page offset of the viewport.
 */
Blockly.utils.style.getViewportPageOffset = function() {
  var body = document.body;
  var documentElement = document.documentElement;
  var scrollLeft = body.scrollLeft || documentElement.scrollLeft;
  var scrollTop = body.scrollTop || documentElement.scrollTop;
  return new Blockly.utils.Coordinate(scrollLeft, scrollTop);
};
