/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for SVG math.
 */
'use strict';

/**
 * Utility methods realted to figuring out positions of SVG elements.
 * @namespace Blockly.utils.svgMath
 */
goog.module('Blockly.utils.svgMath');

const deprecation = goog.require('Blockly.utils.deprecation');
const global = goog.require('Blockly.utils.global');
const style = goog.require('Blockly.utils.style');
const userAgent = goog.require('Blockly.utils.userAgent');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
const {Rect} = goog.require('Blockly.utils.Rect');
const {Size} = goog.require('Blockly.utils.Size');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * Static regex to pull the x,y values out of an SVG translate() directive.
 * Note that Firefox and IE (9,10) return 'translate(12)' instead of
 * 'translate(12, 0)'.
 * Note that IE (9,10) returns 'translate(16 8)' instead of 'translate(16, 8)'.
 * Note that IE has been reported to return scientific notation (0.123456e-42).
 * @type {!RegExp}
 */
const XY_REGEX = /translate\(\s*([-+\d.e]+)([ ,]\s*([-+\d.e]+)\s*)?/;

/**
 * Static regex to pull the x,y values out of a translate() or translate3d()
 * style property.
 * Accounts for same exceptions as XY_REGEX.
 * @type {!RegExp}
 */
const XY_STYLE_REGEX =
    /transform:\s*translate(?:3d)?\(\s*([-+\d.e]+)\s*px([ ,]\s*([-+\d.e]+)\s*px)?/;


/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.  Only for SVG elements and children (e.g. rect, g, path).
 * @param {!Element} element SVG element to find the coordinates of.
 * @return {!Coordinate} Object with .x and .y properties.
 * @alias Blockly.utils.svgMath.getRelativeXY
 */
const getRelativeXY = function(element) {
  const xy = new Coordinate(0, 0);
  // First, check for x and y attributes.
  const x = element.getAttribute('x');
  if (x) {
    xy.x = parseInt(x, 10);
  }
  const y = element.getAttribute('y');
  if (y) {
    xy.y = parseInt(y, 10);
  }
  // Second, check for transform="translate(...)" attribute.
  const transform = element.getAttribute('transform');
  const r = transform && transform.match(XY_REGEX);
  if (r) {
    xy.x += Number(r[1]);
    if (r[3]) {
      xy.y += Number(r[3]);
    }
  }

  // Then check for style = transform: translate(...) or translate3d(...)
  const style = element.getAttribute('style');
  if (style && style.indexOf('translate') > -1) {
    const styleComponents = style.match(XY_STYLE_REGEX);
    if (styleComponents) {
      xy.x += Number(styleComponents[1]);
      if (styleComponents[3]) {
        xy.y += Number(styleComponents[3]);
      }
    }
  }
  return xy;
};
exports.getRelativeXY = getRelativeXY;

/**
 * Return the coordinates of the top-left corner of this element relative to
 * the div Blockly was injected into.
 * @param {!Element} element SVG element to find the coordinates of. If this is
 *     not a child of the div Blockly was injected into, the behaviour is
 *     undefined.
 * @return {!Coordinate} Object with .x and .y properties.
 * @alias Blockly.utils.svgMath.getInjectionDivXY
 */
const getInjectionDivXY = function(element) {
  let x = 0;
  let y = 0;
  while (element) {
    const xy = getRelativeXY(element);
    x = x + xy.x;
    y = y + xy.y;
    const classes = element.getAttribute('class') || '';
    if ((' ' + classes + ' ').indexOf(' injectionDiv ') !== -1) {
      break;
    }
    element = /** @type {!Element} */ (element.parentNode);
  }
  return new Coordinate(x, y);
};
exports.getInjectionDivXY = getInjectionDivXY;

/**
 * Check if 3D transforms are supported by adding an element
 * and attempting to set the property.
 * @return {boolean} True if 3D transforms are supported.
 * @alias Blockly.utils.svgMath.is3dSupported
 */
const is3dSupported = function() {
  if (is3dSupported.cached_ !== undefined) {
    return is3dSupported.cached_;
  }
  // CC-BY-SA Lorenzo Polidori
  // stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
  if (!global.globalThis['getComputedStyle']) {
    return false;
  }

  const el = document.createElement('p');
  let has3d = 'none';
  const transforms = {
    'webkitTransform': '-webkit-transform',
    'OTransform': '-o-transform',
    'msTransform': '-ms-transform',
    'MozTransform': '-moz-transform',
    'transform': 'transform',
  };

  // Add it to the body to get the computed style.
  document.body.insertBefore(el, null);

  for (const t in transforms) {
    if (el.style[t] !== undefined) {
      el.style[t] = 'translate3d(1px,1px,1px)';
      const computedStyle = global.globalThis['getComputedStyle'](el);
      if (!computedStyle) {
        // getComputedStyle in Firefox returns null when Blockly is loaded
        // inside an iframe with display: none.  Returning false and not
        // caching is3dSupported means we try again later.  This is most likely
        // when users are interacting with blocks which should mean Blockly is
        // visible again.
        // See https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        document.body.removeChild(el);
        return false;
      }
      has3d = computedStyle.getPropertyValue(transforms[t]);
    }
  }
  document.body.removeChild(el);
  is3dSupported.cached_ = has3d !== 'none';
  return is3dSupported.cached_;
};
exports.is3dSupported = is3dSupported;

/**
 * Get the position of the current viewport in window coordinates.  This takes
 * scroll into account.
 * @return {!Rect} An object containing window width, height, and
 *     scroll position in window coordinates.
 * @alias Blockly.utils.svgMath.getViewportBBox
 * @package
 */
const getViewportBBox = function() {
  // Pixels, in window coordinates.
  const scrollOffset = style.getViewportPageOffset();
  return new Rect(
      scrollOffset.y, document.documentElement.clientHeight + scrollOffset.y,
      scrollOffset.x, document.documentElement.clientWidth + scrollOffset.x);
};
exports.getViewportBBox = getViewportBBox;

/**
 * Gets the document scroll distance as a coordinate object.
 * Copied from Closure's goog.dom.getDocumentScroll.
 * @return {!Coordinate} Object with values 'x' and 'y'.
 * @alias Blockly.utils.svgMath.getDocumentScroll
 */
const getDocumentScroll = function() {
  const el = document.documentElement;
  const win = window;
  if (userAgent.IE && win.pageYOffset !== el.scrollTop) {
    // The keyboard on IE10 touch devices shifts the page using the pageYOffset
    // without modifying scrollTop. For this case, we want the body scroll
    // offsets.
    return new Coordinate(el.scrollLeft, el.scrollTop);
  }
  return new Coordinate(
      win.pageXOffset || el.scrollLeft, win.pageYOffset || el.scrollTop);
};
exports.getDocumentScroll = getDocumentScroll;

/**
 * Converts screen coordinates to workspace coordinates.
 * @param {!WorkspaceSvg} ws The workspace to find the coordinates on.
 * @param {!Coordinate} screenCoordinates The screen coordinates to
 * be converted to workspace coordinates
 * @return {!Coordinate} The workspace coordinates.
 * @alias Blockly.utils.svgMath.screenToWsCoordinates
 */
const screenToWsCoordinates = function(ws, screenCoordinates) {
  const screenX = screenCoordinates.x;
  const screenY = screenCoordinates.y;

  const injectionDiv = ws.getInjectionDiv();
  // Bounding rect coordinates are in client coordinates, meaning that they
  // are in pixels relative to the upper left corner of the visible browser
  // window.  These coordinates change when you scroll the browser window.
  const boundingRect = injectionDiv.getBoundingClientRect();

  // The client coordinates offset by the injection div's upper left corner.
  const clientOffsetPixels =
      new Coordinate(screenX - boundingRect.left, screenY - boundingRect.top);

  // The offset in pixels between the main workspace's origin and the upper
  // left corner of the injection div.
  const mainOffsetPixels = ws.getOriginOffsetInPixels();

  // The position of the new comment in pixels relative to the origin of the
  // main workspace.
  const finalOffsetPixels =
      Coordinate.difference(clientOffsetPixels, mainOffsetPixels);

  // The position in main workspace coordinates.
  const finalOffsetMainWs = finalOffsetPixels.scale(1 / ws.scale);
  return finalOffsetMainWs;
};
exports.screenToWsCoordinates = screenToWsCoordinates;

/**
 * Returns the dimensions of the specified SVG image.
 * @param {!SVGElement} svg SVG image.
 * @return {!Size} Contains width and height properties.
 * @deprecated Use workspace.getCachedParentSvgSize. (2021 March 5)
 * @alias Blockly.utils.svgMath.svgSize
 */
const svgSize = function(svg) {
  // When removing this function, remove svg.cachedWidth_ and svg.cachedHeight_
  // from setCachedParentSvgSize.
  // The deprecated name is `Blockly.svgSize` because this function used to be
  // declared in Blockly.js.
  deprecation.warn(
      'Blockly.svgSize', 'March 2021', 'March 2022',
      'workspace.getCachedParentSvgSize');
  svg = /** @type {?} */ (svg);
  return new Size(svg.cachedWidth_, svg.cachedHeight_);
};
exports.svgSize = svgSize;


exports.TEST_ONLY = {
  XY_REGEX,
  XY_STYLE_REGEX,
};
