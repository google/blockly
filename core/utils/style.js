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
 * Similar to Closure's goog.style.getSize
 * @param {!Element} element Element to get size of.
 * @return {!Blockly.utils.Size} Object with width/height properties.
 */
Blockly.utils.style.getSize = function(element) {
  if (Blockly.utils.style.getStyle_(element, 'display') != 'none') {
    return Blockly.utils.style.getSizeWithDisplay_(element);
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
 * Gets the height and width of an element when the display is not none.
 * @param {!Element} element Element to get size of.
 * @return {!goog.math.Size} Object with width/height properties.
 * @private
 */
Blockly.utils.style.getSizeWithDisplay_ = function(element) {
  var offsetWidth = /** @type {!HTMLElement} */ (element).offsetWidth;
  var offsetHeight = /** @type {!HTMLElement} */ (element).offsetHeight;
  return new Blockly.utils.Size(offsetWidth, offsetHeight);
};

/**
 * Cross-browser pseudo get computed style. It returns the computed style where
 * available. If not available it tries the cascaded style value (IE
 * currentStyle) and in worst case the inline style value.  It shouldn't be
 * called directly, see http://wiki/Main/ComputedStyleVsCascadedStyle for
 * discussion.
 *
 * Copied from Closure's goog.style.getStyle_
 *
 * @param {!Element} element Element to get style of.
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
 * Copied from Closure's goog.style.getComputedStyle
 *
 * @param {!Element} element Element to get style of.
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
 * Copied from Closure's goog.style.getCascadedStyle
 *
 * @param {!Element} element Element to get style of.
 * @param {string} style Property to get (camel-case).
 * @return {string} Style value.
 */
Blockly.utils.style.getCascadedStyle = function(element, style) {
  return /** @type {string} */ (
      element.currentStyle ? element.currentStyle[style] : null);
};

/**
 * Returns a Coordinate object relative to the top-left of the HTML document.
 * Similar to Closure's goog.style.getPageOffset
 * @param {!Element} el Element to get the page offset for.
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
 * Similar to Closure's goog.style.getViewportPageOffset
 * @return {!Blockly.utils.Coordinate} The page offset of the viewport.
 */
Blockly.utils.style.getViewportPageOffset = function() {
  var body = document.body;
  var documentElement = document.documentElement;
  var scrollLeft = body.scrollLeft || documentElement.scrollLeft;
  var scrollTop = body.scrollTop || documentElement.scrollTop;
  return new Blockly.utils.Coordinate(scrollLeft, scrollTop);
};

/**
 * Shows or hides an element from the page. Hiding the element is done by
 * setting the display property to "none", removing the element from the
 * rendering hierarchy so it takes up no space. To show the element, the default
 * inherited display property is restored (defined either in stylesheets or by
 * the browser's default style rules).
 * Copied from Closure's goog.style.getViewportPageOffset
 *
 * @param {!Element} el Element to show or hide.
 * @param {*} isShown True to render the element in its default style,
 *     false to disable rendering the element.
 */
Blockly.utils.style.setElementShown = function(el, isShown) {
  el.style.display = isShown ? '' : 'none';
};

/**
 * Returns true if the element is using right to left (RTL) direction.
 * Copied from Closure's goog.style.isRightToLeft
 *
 * @param {!Element} el The element to test.
 * @return {boolean} True for right to left, false for left to right.
 */
Blockly.utils.style.isRightToLeft = function(el) {
  return 'rtl' == Blockly.utils.style.getStyle_(el, 'direction');
};

/**
 * Gets the computed border widths (on all sides) in pixels
 * Copied from Closure's goog.style.getBorderBox
 * @param {!Element} element  The element to get the border widths for.
 * @return {!Object} The computed border widths.
 */
Blockly.utils.style.getBorderBox = function(element) {
  var left = Blockly.utils.style.getComputedStyle(element, 'borderLeftWidth');
  var right = Blockly.utils.style.getComputedStyle(element, 'borderRightWidth');
  var top = Blockly.utils.style.getComputedStyle(element, 'borderTopWidth');
  var bottom = Blockly.utils.style.getComputedStyle(element, 'borderBottomWidth');

  return {
    top: parseFloat(top),
    right: parseFloat(right),
    bottom: parseFloat(bottom),
    left: parseFloat(left)
  };
};

/**
 * Changes the scroll position of `container` with the minimum amount so
 * that the content and the borders of the given `element` become visible.
 * If the element is bigger than the container, its top left corner will be
 * aligned as close to the container's top left corner as possible.
 * Copied from Closure's goog.style.scrollIntoContainerView
 *
 * @param {!Element} element The element to make visible.
 * @param {!Element} container The container to scroll. If not set, then the
 *     document scroll element will be used.
 * @param {boolean=} opt_center Whether to center the element in the container.
 *     Defaults to false.
 */
Blockly.utils.style.scrollIntoContainerView = function(
    element, container, opt_center) {
  var offset =
      Blockly.utils.style.getContainerOffsetToScrollInto(element,
          container, opt_center);
  container.scrollLeft = offset.x;
  container.scrollTop = offset.y;
};

/**
 * Calculate the scroll position of `container` with the minimum amount so
 * that the content and the borders of the given `element` become visible.
 * If the element is bigger than the container, its top left corner will be
 * aligned as close to the container's top left corner as possible.
 * Copied from Closure's goog.style.getContainerOffsetToScrollInto
 *
 * @param {!Element} element The element to make visible.
 * @param {!Element} container The container to scroll. If not set, then the
 *     document scroll element will be used.
 * @param {boolean=} opt_center Whether to center the element in the container.
 *     Defaults to false.
 * @return {!Blockly.utils.Coordinate} The new scroll position of the container,
 *     in form of goog.math.Coordinate(scrollLeft, scrollTop).
 */
Blockly.utils.style.getContainerOffsetToScrollInto = function(
    element, container, opt_center) {
  // Absolute position of the element's border's top left corner.
  var elementPos = Blockly.utils.style.getPageOffset(element);
  // Absolute position of the container's border's top left corner.
  var containerPos = Blockly.utils.style.getPageOffset(container);
  var containerBorder = Blockly.utils.style.getBorderBox(container);
  // Relative pos. of the element's border box to the container's content box.
  var relX = elementPos.x - containerPos.x - containerBorder.left;
  var relY = elementPos.y - containerPos.y - containerBorder.top;
  // How much the element can move in the container, i.e. the difference between
  // the element's bottom-right-most and top-left-most position where it's
  // fully visible.
  var elementSize = Blockly.utils.style.getSizeWithDisplay_(element);
  var spaceX = container.clientWidth - elementSize.width;
  var spaceY = container.clientHeight - elementSize.height;
  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;
  if (opt_center) {
    // All browsers round non-integer scroll positions down.
    scrollLeft += relX - spaceX / 2;
    scrollTop += relY - spaceY / 2;
  } else {
    // This formula was designed to give the correct scroll values in the
    // following cases:
    // - element is higher than container (spaceY < 0) => scroll down by relY
    // - element is not higher that container (spaceY >= 0):
    //   - it is above container (relY < 0) => scroll up by abs(relY)
    //   - it is below container (relY > spaceY) => scroll down by relY - spaceY
    //   - it is in the container => don't scroll
    scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0));
    scrollTop += Math.min(relY, Math.max(relY - spaceY, 0));
  }
  return new Blockly.utils.Coordinate(scrollLeft, scrollTop);
};
