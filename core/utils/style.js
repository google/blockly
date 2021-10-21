/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities for element styles.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 */
'use strict';

/**
 * Utilities for element styles.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @namespace Blockly.utils.style
 */
goog.module('Blockly.utils.style');

const {Coordinate} = goog.require('Blockly.utils.Coordinate');
const {Size} = goog.require('Blockly.utils.Size');


/**
 * Gets the height and width of an element.
 * Similar to Closure's goog.style.getSize
 * @param {!Element} element Element to get size of.
 * @return {!Size} Object with width/height properties.
 * @alias Blockly.utils.style.getSize
 */
const getSize = function(element) {
  if (getStyle(element, 'display') !== 'none') {
    return getSizeWithDisplay(element);
  }

  // Evaluate size with a temporary element.
  const style = element.style;
  const originalDisplay = style.display;
  const originalVisibility = style.visibility;
  const originalPosition = style.position;

  style.visibility = 'hidden';
  style.position = 'absolute';
  style.display = 'inline';

  const offsetWidth = /** @type {!HTMLElement} */ (element).offsetWidth;
  const offsetHeight = /** @type {!HTMLElement} */ (element).offsetHeight;

  style.display = originalDisplay;
  style.position = originalPosition;
  style.visibility = originalVisibility;

  return new Size(offsetWidth, offsetHeight);
};
exports.getSize = getSize;

/**
 * Gets the height and width of an element when the display is not none.
 * @param {!Element} element Element to get size of.
 * @return {!Size} Object with width/height properties.
 */
const getSizeWithDisplay = function(element) {
  const offsetWidth = /** @type {!HTMLElement} */ (element).offsetWidth;
  const offsetHeight = /** @type {!HTMLElement} */ (element).offsetHeight;
  return new Size(offsetWidth, offsetHeight);
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
 * @param {string} style Property to get (must be camelCase, not CSS-style).
 * @return {string} Style value.
 */
const getStyle = function(element, style) {
  return getComputedStyle(element, style) || getCascadedStyle(element, style) ||
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
 * @alias Blockly.utils.style.getComputedStyle
 */
const getComputedStyle = function(element, property) {
  if (document.defaultView && document.defaultView.getComputedStyle) {
    const styles = document.defaultView.getComputedStyle(element, null);
    if (styles) {
      // element.style[..] is undefined for browser specific styles
      // as 'filter'.
      return styles[property] || styles.getPropertyValue(property) || '';
    }
  }

  return '';
};
exports.getComputedStyle = getComputedStyle;

/**
 * Gets the cascaded style value of a node, or null if the value cannot be
 * computed (only Internet Explorer can do this).
 *
 * Copied from Closure's goog.style.getCascadedStyle
 *
 * @param {!Element} element Element to get style of.
 * @param {string} style Property to get (camel-case).
 * @return {string} Style value.
 * @alias Blockly.utils.style.getCascadedStyle
 */
const getCascadedStyle = function(element, style) {
  return /** @type {string} */ (
      element.currentStyle ? element.currentStyle[style] : null);
};
exports.getCascadedStyle = getCascadedStyle;

/**
 * Returns a Coordinate object relative to the top-left of the HTML document.
 * Similar to Closure's goog.style.getPageOffset
 * @param {!Element} el Element to get the page offset for.
 * @return {!Coordinate} The page offset.
 * @alias Blockly.utils.style.getPageOffset
 */
const getPageOffset = function(el) {
  const pos = new Coordinate(0, 0);
  const box = el.getBoundingClientRect();
  const documentElement = document.documentElement;
  // Must add the scroll coordinates in to get the absolute page offset
  // of element since getBoundingClientRect returns relative coordinates to
  // the viewport.
  const scrollCoord = new Coordinate(
      window.pageXOffset || documentElement.scrollLeft,
      window.pageYOffset || documentElement.scrollTop);
  pos.x = box.left + scrollCoord.x;
  pos.y = box.top + scrollCoord.y;

  return pos;
};
exports.getPageOffset = getPageOffset;

/**
 * Calculates the viewport coordinates relative to the document.
 * Similar to Closure's goog.style.getViewportPageOffset
 * @return {!Coordinate} The page offset of the viewport.
 * @alias Blockly.utils.style.getViewportPageOffset
 */
const getViewportPageOffset = function() {
  const body = document.body;
  const documentElement = document.documentElement;
  const scrollLeft = body.scrollLeft || documentElement.scrollLeft;
  const scrollTop = body.scrollTop || documentElement.scrollTop;
  return new Coordinate(scrollLeft, scrollTop);
};
exports.getViewportPageOffset = getViewportPageOffset;

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
 * @alias Blockly.utils.style.setElementShown
 */
const setElementShown = function(el, isShown) {
  el.style.display = isShown ? '' : 'none';
};
exports.setElementShown = setElementShown;

/**
 * Returns true if the element is using right to left (RTL) direction.
 * Copied from Closure's goog.style.isRightToLeft
 *
 * @param {!Element} el The element to test.
 * @return {boolean} True for right to left, false for left to right.
 * @alias Blockly.utils.style.isRightToLeft
 */
const isRightToLeft = function(el) {
  return 'rtl' === getStyle(el, 'direction');
};
exports.isRightToLeft = isRightToLeft;

/**
 * Gets the computed border widths (on all sides) in pixels
 * Copied from Closure's goog.style.getBorderBox
 * @param {!Element} element  The element to get the border widths for.
 * @return {!Object} The computed border widths.
 * @alias Blockly.utils.style.getBorderBox
 */
const getBorderBox = function(element) {
  const left = getComputedStyle(element, 'borderLeftWidth');
  const right = getComputedStyle(element, 'borderRightWidth');
  const top = getComputedStyle(element, 'borderTopWidth');
  const bottom = getComputedStyle(element, 'borderBottomWidth');

  return {
    top: parseFloat(top),
    right: parseFloat(right),
    bottom: parseFloat(bottom),
    left: parseFloat(left),
  };
};
exports.getBorderBox = getBorderBox;

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
 * @alias Blockly.utils.style.scrollIntoContainerView
 */
const scrollIntoContainerView = function(element, container, opt_center) {
  const offset = getContainerOffsetToScrollInto(element, container, opt_center);
  container.scrollLeft = offset.x;
  container.scrollTop = offset.y;
};
exports.scrollIntoContainerView = scrollIntoContainerView;

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
 * @return {!Coordinate} The new scroll position of the container,
 *     in form of goog.math.Coordinate(scrollLeft, scrollTop).
 * @alias Blockly.utils.style.getContainerOffsetToScrollInto
 */
const getContainerOffsetToScrollInto = function(
    element, container, opt_center) {
  // Absolute position of the element's border's top left corner.
  const elementPos = getPageOffset(element);
  // Absolute position of the container's border's top left corner.
  const containerPos = getPageOffset(container);
  const containerBorder = getBorderBox(container);
  // Relative pos. of the element's border box to the container's content box.
  const relX = elementPos.x - containerPos.x - containerBorder.left;
  const relY = elementPos.y - containerPos.y - containerBorder.top;
  // How much the element can move in the container, i.e. the difference between
  // the element's bottom-right-most and top-left-most position where it's
  // fully visible.
  const elementSize = getSizeWithDisplay(element);
  const spaceX = container.clientWidth - elementSize.width;
  const spaceY = container.clientHeight - elementSize.height;
  let scrollLeft = container.scrollLeft;
  let scrollTop = container.scrollTop;
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
  return new Coordinate(scrollLeft, scrollTop);
};
exports.getContainerOffsetToScrollInto = getContainerOffsetToScrollInto;
