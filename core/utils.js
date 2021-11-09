/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 */
'use strict';

/**
 * Utility methods.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @namespace Blockly.utils
 */
goog.module('Blockly.utils');

const Msg = goog.require('Blockly.Msg');
const aria = goog.require('Blockly.utils.aria');
const browserEvents = goog.require('Blockly.browserEvents');
const colourUtils = goog.require('Blockly.utils.colour');
const deprecation = goog.require('Blockly.utils.deprecation');
const dom = goog.require('Blockly.utils.dom');
const global = goog.require('Blockly.utils.global');
const idGenerator = goog.require('Blockly.utils.idGenerator');
const internalConstants = goog.require('Blockly.internalConstants');
const math = goog.require('Blockly.utils.math');
const object = goog.require('Blockly.utils.object');
const stringUtils = goog.require('Blockly.utils.string');
const style = goog.require('Blockly.utils.style');
const svgPaths = goog.require('Blockly.utils.svgPaths');
const toolbox = goog.require('Blockly.utils.toolbox');
const userAgent = goog.require('Blockly.utils.userAgent');
const xmlUtils = goog.require('Blockly.utils.xml');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
const {KeyCodes} = goog.require('Blockly.utils.KeyCodes');
const {Metrics} = goog.require('Blockly.utils.Metrics');
const {Rect} = goog.require('Blockly.utils.Rect');
const {Size} = goog.require('Blockly.utils.Size');
const {Svg} = goog.require('Blockly.utils.Svg');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


exports.aria = aria;
exports.colour = colourUtils;
exports.Coordinate = Coordinate;
exports.deprecation = deprecation;
exports.dom = dom;
exports.global = global.globalThis;
exports.idGenerator = idGenerator;
exports.KeyCodes = KeyCodes;
exports.math = math;
exports.Metrics = Metrics;
exports.object = object;
exports.Rect = Rect;
exports.Size = Size;
exports.string = stringUtils;
exports.style = style;
exports.Svg = Svg;
exports.svgPaths = svgPaths;
exports.toolbox = toolbox;
exports.userAgent = userAgent;
exports.xml = xmlUtils;

/**
 * Halts the propagation of the event without doing anything else.
 * @param {!Event} e An event.
 * @deprecated
 * @alias Blockly.utils.noEvent
 */
const noEvent = function(e) {
  deprecation.warn('Blockly.utils.noEvent', 'September 2021', 'September 2022');
  // This event has been handled.  No need to bubble up to the document.
  e.preventDefault();
  e.stopPropagation();
};
exports.noEvent = noEvent;

/**
 * Returns true if this event is targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 * @deprecated Use Blockly.browserEvents.isTargetInput instead.
 * @alias Blockly.utils.isTargetInput
 */
const isTargetInput = function(e) {
  deprecation.warn(
      'Blockly.utils.isTargetInput', 'September 2021', 'September 2022',
      'Blockly.browserEvents.isTargetInput');
  return browserEvents.isTargetInput(e);
};
exports.isTargetInput = isTargetInput;

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.  Only for SVG elements and children (e.g. rect, g, path).
 * @param {!Element} element SVG element to find the coordinates of.
 * @return {!Coordinate} Object with .x and .y properties.
 * @alias Blockly.utils.getRelativeXY
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
  const r = transform && transform.match(getRelativeXY.XY_REGEX_);
  if (r) {
    xy.x += Number(r[1]);
    if (r[3]) {
      xy.y += Number(r[3]);
    }
  }

  // Then check for style = transform: translate(...) or translate3d(...)
  const style = element.getAttribute('style');
  if (style && style.indexOf('translate') > -1) {
    const styleComponents = style.match(getRelativeXY.XY_STYLE_REGEX_);
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
 * @alias Blockly.utils.getInjectionDivXY_
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
exports.getInjectionDivXY_ = getInjectionDivXY;

/**
 * Static regex to pull the x,y values out of an SVG translate() directive.
 * Note that Firefox and IE (9,10) return 'translate(12)' instead of
 * 'translate(12, 0)'.
 * Note that IE (9,10) returns 'translate(16 8)' instead of 'translate(16, 8)'.
 * Note that IE has been reported to return scientific notation (0.123456e-42).
 * @type {!RegExp}
 * @private
 */
getRelativeXY.XY_REGEX_ = /translate\(\s*([-+\d.e]+)([ ,]\s*([-+\d.e]+)\s*)?/;

/**
 * Static regex to pull the x,y values out of a translate() or translate3d()
 * style property.
 * Accounts for same exceptions as XY_REGEX_.
 * @type {!RegExp}
 * @private
 */
getRelativeXY.XY_STYLE_REGEX_ =
    /transform:\s*translate(?:3d)?\(\s*([-+\d.e]+)\s*px([ ,]\s*([-+\d.e]+)\s*px)?/;

/**
 * Returns true this event is a right-click.
 * @param {!Event} e Mouse event.
 * @return {boolean} True if right-click.
 * @deprecated Use Blockly.browserEvents.isRightButton instead.
 * @alias Blockly.utils.isRightButton
 */
const isRightButton = function(e) {
  deprecation.warn(
      'Blockly.utils.isRightButton', 'September 2021', 'September 2022',
      'Blockly.browserEvents.isRightButton');
  return browserEvents.isRightButton(e);
};
exports.isRightButton = isRightButton;

/**
 * Returns the converted coordinates of the given mouse event.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param {!Event} e Mouse event.
 * @param {!Element} svg SVG element.
 * @param {?SVGMatrix} matrix Inverted screen CTM to use.
 * @return {!SVGPoint} Object with .x and .y properties.
 * @deprecated Use Blockly.browserEvents.mouseToSvg instead;
 * @alias Blockly.utils.mouseToSvg
 */
const mouseToSvg = function(e, svg, matrix) {
  deprecation.warn(
      'Blockly.utils.mouseToSvg', 'September 2021', 'September 2022',
      'Blockly.browserEvents.mouseToSvg');
  return browserEvents.mouseToSvg(e, svg, matrix);
};
exports.mouseToSvg = mouseToSvg;

/**
 * Returns the scroll delta of a mouse event in pixel units.
 * @param {!Event} e Mouse event.
 * @return {{x: number, y: number}} Scroll delta object with .x and .y
 *    properties.
 * @deprecated Use Blockly.browserEvents.getScrollDeltaPixels instead.
 * @alias Blockly.utils.getScrollDeltaPixels
 */
const getScrollDeltaPixels = function(e) {
  deprecation.warn(
      'Blockly.utils.getScrollDeltaPixels', 'September 2021', 'September 2022',
      'Blockly.browserEvents.getScrollDeltaPixels');
  return browserEvents.getScrollDeltaPixels(e);
};
exports.getScrollDeltaPixels = getScrollDeltaPixels;

/**
 * Parse a string with any number of interpolation tokens (%1, %2, ...).
 * It will also replace string table references (e.g., %{bky_my_msg} and
 * %{BKY_MY_MSG} will both be replaced with the value in
 * Msg['MY_MSG']). Percentage sign characters '%' may be self-escaped
 * (e.g., '%%').
 * @param {string} message Text which might contain string table references and
 *     interpolation tokens.
 * @return {!Array<string|number>} Array of strings and numbers.
 * @alias Blockly.utils.tokenizeInterpolation
 */
const tokenizeInterpolation = function(message) {
  return tokenizeInterpolation_(message, true);
};
exports.tokenizeInterpolation = tokenizeInterpolation;

/**
 * Replaces string table references in a message, if the message is a string.
 * For example, "%{bky_my_msg}" and "%{BKY_MY_MSG}" will both be replaced with
 * the value in Msg['MY_MSG'].
 * @param {string|?} message Message, which may be a string that contains
 *     string table references.
 * @return {string} String with message references replaced.
 * @alias Blockly.utils.replaceMessageReferences
 */
const replaceMessageReferences = function(message) {
  if (typeof message !== 'string') {
    return message;
  }
  const interpolatedResult = tokenizeInterpolation_(message, false);
  // When parseInterpolationTokens === false, interpolatedResult should be at
  // most length 1.
  return interpolatedResult.length ? String(interpolatedResult[0]) : '';
};
exports.replaceMessageReferences = replaceMessageReferences;

/**
 * Validates that any %{MSG_KEY} references in the message refer to keys of
 * the Msg string table.
 * @param {string} message Text which might contain string table references.
 * @return {boolean} True if all message references have matching values.
 *     Otherwise, false.
 * @alias Blockly.utils.checkMessageReferences
 */
const checkMessageReferences = function(message) {
  let validSoFar = true;

  const msgTable = Msg;

  // TODO (#1169): Implement support for other string tables,
  // prefixes other than BKY_.
  const m = message.match(/%{BKY_[A-Z]\w*}/ig);
  for (let i = 0; i < m.length; i++) {
    const msgKey = m[i].toUpperCase();
    if (msgTable[msgKey.slice(6, -1)] === undefined) {
      console.warn('No message string for ' + m[i] + ' in ' + message);
      validSoFar = false;  // Continue to report other errors.
    }
  }

  return validSoFar;
};
exports.checkMessageReferences = checkMessageReferences;

/**
 * Internal implementation of the message reference and interpolation token
 * parsing used by tokenizeInterpolation() and replaceMessageReferences().
 * @param {string} message Text which might contain string table references and
 *     interpolation tokens.
 * @param {boolean} parseInterpolationTokens Option to parse numeric
 *     interpolation tokens (%1, %2, ...) when true.
 * @return {!Array<string|number>} Array of strings and numbers.
 */
const tokenizeInterpolation_ = function(message, parseInterpolationTokens) {
  const tokens = [];
  const chars = message.split('');
  chars.push('');  // End marker.
  // Parse the message with a finite state machine.
  // 0 - Base case.
  // 1 - % found.
  // 2 - Digit found.
  // 3 - Message ref found.
  let state = 0;
  const buffer = [];
  let number = null;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (state === 0) {
      if (c === '%') {
        const text = buffer.join('');
        if (text) {
          tokens.push(text);
        }
        buffer.length = 0;
        state = 1;  // Start escape.
      } else {
        buffer.push(c);  // Regular char.
      }
    } else if (state === 1) {
      if (c === '%') {
        buffer.push(c);  // Escaped %: %%
        state = 0;
      } else if (parseInterpolationTokens && '0' <= c && c <= '9') {
        state = 2;
        number = c;
        const text = buffer.join('');
        if (text) {
          tokens.push(text);
        }
        buffer.length = 0;
      } else if (c === '{') {
        state = 3;
      } else {
        buffer.push('%', c);  // Not recognized. Return as literal.
        state = 0;
      }
    } else if (state === 2) {
      if ('0' <= c && c <= '9') {
        number += c;  // Multi-digit number.
      } else {
        tokens.push(parseInt(number, 10));
        i--;  // Parse this char again.
        state = 0;
      }
    } else if (state === 3) {  // String table reference
      if (c === '') {
        // Premature end before closing '}'
        buffer.splice(0, 0, '%{');  // Re-insert leading delimiter
        i--;                        // Parse this char again.
        state = 0;                  // and parse as string literal.
      } else if (c !== '}') {
        buffer.push(c);
      } else {
        const rawKey = buffer.join('');
        if (/[A-Z]\w*/i.test(rawKey)) {  // Strict matching
          // Found a valid string key. Attempt case insensitive match.
          const keyUpper = rawKey.toUpperCase();

          // BKY_ is the prefix used to namespace the strings used in Blockly
          // core files and the predefined blocks in ../blocks/.
          // These strings are defined in ../msgs/ files.
          const bklyKey = stringUtils.startsWith(keyUpper, 'BKY_') ?
              keyUpper.substring(4) :
              null;
          if (bklyKey && bklyKey in Msg) {
            const rawValue = Msg[bklyKey];
            if (typeof rawValue === 'string') {
              // Attempt to dereference substrings, too, appending to the end.
              Array.prototype.push.apply(
                  tokens,
                  tokenizeInterpolation_(rawValue, parseInterpolationTokens));
            } else if (parseInterpolationTokens) {
              // When parsing interpolation tokens, numbers are special
              // placeholders (%1, %2, etc). Make sure all other values are
              // strings.
              tokens.push(String(rawValue));
            } else {
              tokens.push(rawValue);
            }
          } else {
            // No entry found in the string table. Pass reference as string.
            tokens.push('%{' + rawKey + '}');
          }
          buffer.length = 0;  // Clear the array
          state = 0;
        } else {
          tokens.push('%{' + rawKey + '}');
          buffer.length = 0;
          state = 0;  // and parse as string literal.
        }
      }
    }
  }
  let text = buffer.join('');
  if (text) {
    tokens.push(text);
  }

  // Merge adjacent text tokens into a single string.
  const mergedTokens = [];
  buffer.length = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'string') {
      buffer.push(tokens[i]);
    } else {
      text = buffer.join('');
      if (text) {
        mergedTokens.push(text);
      }
      buffer.length = 0;
      mergedTokens.push(tokens[i]);
    }
  }
  text = buffer.join('');
  if (text) {
    mergedTokens.push(text);
  }
  buffer.length = 0;

  return mergedTokens;
};

/**
 * Generate a unique ID.
 * @return {string} A globally unique ID string.
 * @deprecated Use Blockly.utils.idGenerator.genUid instead.
 * @alias Blockly.utils.genUid
 */
const genUid = function() {
  deprecation.warn(
      'Blockly.utils.genUid', 'September 2021', 'September 2022',
      'Blockly.utils.idGenerator.genUid');
  return idGenerator.genUid();
};
exports.genUid = genUid;

/**
 * Check if 3D transforms are supported by adding an element
 * and attempting to set the property.
 * @return {boolean} True if 3D transforms are supported.
 * @alias Blockly.utils.is3dSupported
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
 * Calls a function after the page has loaded, possibly immediately.
 * @param {function()} fn Function to run.
 * @throws Error Will throw if no global document can be found (e.g., Node.js).
 * @alias Blockly.utils.runAfterPageLoad
 */
const runAfterPageLoad = function(fn) {
  if (typeof document !== 'object') {
    throw Error('runAfterPageLoad() requires browser document.');
  }
  if (document.readyState === 'complete') {
    fn();  // Page has already loaded. Call immediately.
  } else {
    // Poll readyState.
    const readyStateCheckInterval = setInterval(function() {
      if (document.readyState === 'complete') {
        clearInterval(readyStateCheckInterval);
        fn();
      }
    }, 10);
  }
};
exports.runAfterPageLoad = runAfterPageLoad;

/**
 * Get the position of the current viewport in window coordinates.  This takes
 * scroll into account.
 * @return {!Rect} An object containing window width, height, and
 *     scroll position in window coordinates.
 * @alias Blockly.utils.getViewportBBox
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
 * Removes the first occurrence of a particular value from an array.
 * @param {!Array} arr Array from which to remove value.
 * @param {*} value Value to remove.
 * @return {boolean} True if an element was removed.
 * @alias Blockly.utils.arrayRemove
 * @package
 */
const arrayRemove = function(arr, value) {
  const i = arr.indexOf(value);
  if (i === -1) {
    return false;
  }
  arr.splice(i, 1);
  return true;
};
exports.arrayRemove = arrayRemove;

/**
 * Gets the document scroll distance as a coordinate object.
 * Copied from Closure's goog.dom.getDocumentScroll.
 * @return {!Coordinate} Object with values 'x' and 'y'.
 * @alias Blockly.utils.getDocumentScroll
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
 * Get a map of all the block's descendants mapping their type to the number of
 *    children with that type.
 * @param {!Block} block The block to map.
 * @param {boolean=} opt_stripFollowing Optionally ignore all following
 *    statements (blocks that are not inside a value or statement input
 *    of the block).
 * @return {!Object} Map of types to type counts for descendants of the bock.
 * @alias Blockly.utils.getBlockTypeCounts
 */
const getBlockTypeCounts = function(block, opt_stripFollowing) {
  const typeCountsMap = Object.create(null);
  const descendants = block.getDescendants(true);
  if (opt_stripFollowing) {
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
      const index = descendants.indexOf(nextBlock);
      descendants.splice(index, descendants.length - index);
    }
  }
  for (let i = 0, checkBlock; (checkBlock = descendants[i]); i++) {
    if (typeCountsMap[checkBlock.type]) {
      typeCountsMap[checkBlock.type]++;
    } else {
      typeCountsMap[checkBlock.type] = 1;
    }
  }
  return typeCountsMap;
};
exports.getBlockTypeCounts = getBlockTypeCounts;

/**
 * Converts screen coordinates to workspace coordinates.
 * @param {!WorkspaceSvg} ws The workspace to find the coordinates on.
 * @param {!Coordinate} screenCoordinates The screen coordinates to
 * be converted to workspace coordinates
 * @return {!Coordinate} The workspace coordinates.
 * @alias Blockly.utils.screenToWsCoordinates
 * @package
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
 * Parse a block colour from a number or string, as provided in a block
 * definition.
 * @param {number|string} colour HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 * @return {{hue: ?number, hex: string}} An object containing the colour as
 *     a #RRGGBB string, and the hue if the input was an HSV hue value.
 * @throws {Error} If the colour cannot be parsed.
 * @alias Blockly.utils.parseBlockColour
 */
const parseBlockColour = function(colour) {
  const dereferenced =
      (typeof colour === 'string') ? replaceMessageReferences(colour) : colour;

  const hue = Number(dereferenced);
  if (!isNaN(hue) && 0 <= hue && hue <= 360) {
    return {
      hue: hue,
      hex: colourUtils.hsvToHex(
          hue, internalConstants.HSV_SATURATION,
          internalConstants.HSV_VALUE * 255),
    };
  } else {
    const hex = colourUtils.parse(dereferenced);
    if (hex) {
      // Only store hue if colour is set as a hue.
      return {hue: null, hex: hex};
    } else {
      let errorMsg = 'Invalid colour: "' + dereferenced + '"';
      if (colour !== dereferenced) {
        errorMsg += ' (from "' + colour + '")';
      }
      throw Error(errorMsg);
    }
  }
};
exports.parseBlockColour = parseBlockColour;
