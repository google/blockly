/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for doing svg calculations.
 */
'use strict';

goog.module('Blockly.utils.svgMath');
goog.module.declareLegacyNamespace();

const Coordinate = goog.require('Blockly.utils.Coordinate');
const Rect = goog.require('Blockly.utils.Rect');
const {globalThis} = goog.require('Blockly.utils.global');
const style = goog.require('Blockly.utils.style');
const utilsXml = goog.require('Blockly.utils.xml');
const userAgent = goog.require('Blockly.utils.userAgent');


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
 * Returns the coordinates of the top-left corner of the element relative to
 * its parent. Only for SVG elements and children (e.g. rect, g, path).
 * @param {!Element} element SVG element to find the coordinates of.
 * @return {!Coordinate} Coordinate of the top-left corer of the element.
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
 * Returns the coordinates of the top-left corner of the element relative to
 * the div Blockly was injected into.
 * @param {!Element} element SVG element to find the coordinates of. If this is
 *     not a child of the div Blockly was injected into, the behaviour is
 *     undefined.
 * @return {!Coordinate} Coordinate of the top-left corer of the element.
 */
const getInjectionDivXY = function(element) {
  let x = 0;
  let y = 0;
  while (element) {
    const xy = getRelativeXY(element);
    x = x + xy.x;
    y = y + xy.y;
    const classes = element.getAttribute('class') || '';
    if ((' ' + classes + ' ').indexOf(' injectionDiv ') != -1) {
      break;
    }
    element = /** @type {!Element} */ (element.parentNode);
  }
  return new Coordinate(x, y);
};
/** @package */
exports.getInjectionDivXY = getInjectionDivXY;

/**
 * Returns the position of the current viewport in window coordinates. This
 * takes scroll into account.
 * @return {!Rect} An object containing window width, height, and
 *     scroll position in window coordinates.
 */
const getViewportBBox = function() {
  // Pixels, in window coordinates.
  const scrollOffset = style.getViewportPageOffset();
  return new Rect(
      scrollOffset.y,
      utilsXml.getDocument().documentElement.clientHeight + scrollOffset.y,
      scrollOffset.x,
      utilsXml.getDocument().documentElement.clientWidth + scrollOffset.x);
};
/** @package */
exports.getViewportBBox = getViewportBBox;

/**
 * Returns the document scroll distance as a coordinate object.
 * Copied from Closure's goog.dom.getDocumentScroll.
 * @return {!Coordinate} The document scroll distance as a coordinate object.
 */
const getDocumentScroll = function() {
  const el = utilsXml.getDocument().documentElement;
  const win = window;
  if (userAgent.IE && win.pageYOffset != el.scrollTop) {
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
 * Caches whether is3dSupported is true or not.
 * @type {?boolean}
 */
let is3dSupportedCache = null;

/**
 * Returns true if 3D transforms are supported.
 * @return {boolean} True if 3D transforms are supported.
 */
const is3dSupported = function() {
  if (is3dSupportedCache !== null) {
    return is3dSupportedCache;
  }
  // CC-BY-SA Lorenzo Polidori
  // stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
  if (!globalThis['getComputedStyle']) {
    return false;
  }

  const el = utilsXml.getDocument().createElement('p');
  let has3d = 'none';
  const transforms = {
    'webkitTransform': '-webkit-transform',
    'OTransform': '-o-transform',
    'msTransform': '-ms-transform',
    'MozTransform': '-moz-transform',
    'transform': 'transform'
  };

  // Add it to the body to get the computed style.
  utilsXml.getDocument().body.insertBefore(el, null);

  for (let t in transforms) {
    if (el.style[t] !== undefined) {
      el.style[t] = 'translate3d(1px,1px,1px)';
      const computedStyle = globalThis['getComputedStyle'](el);
      if (!computedStyle) {
        // getComputedStyle in Firefox returns null when Blockly is loaded
        // inside an iframe with display: none.  Returning false and not
        // caching is3dSupported means we try again later.  This is most likely
        // when users are interacting with blocks which should mean Blockly is
        // visible again.
        // See https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        utilsXml.getDocument().body.removeChild(el);
        return false;
      }
      has3d = computedStyle.getPropertyValue(transforms[t]);
    }
  }
  utilsXml.getDocument().body.removeChild(el);
  is3dSupportedCache = has3d !== 'none';
  return is3dSupportedCache;
};
exports.is3dSupported = is3dSupported;
