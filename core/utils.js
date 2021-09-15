/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.utils
 * @namespace
 */
goog.module('Blockly.utils');
goog.module.declareLegacyNamespace();

/* eslint-disable-next-line no-unused-vars */
const Block = goog.requireType('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const Coordinate = goog.requireType('Blockly.utils.Coordinate');
const Msg = goog.require('Blockly.Msg');
/* eslint-disable-next-line no-unused-vars */
const Rect = goog.requireType('Blockly.utils.Rect');
/* eslint-disable-next-line no-unused-vars */
const WorkspaceSvg = goog.requireType('Blockly.WorkspaceSvg');
const colourUtils = goog.require('Blockly.utils.colour');
const deprecation = goog.require('Blockly.utils.deprecation');
const idGenerator = goog.require('Blockly.utils.idGenerator');
const internalConstants = goog.require('Blockly.internalConstants');
const stringUtils = goog.require('Blockly.utils.string');
const svgMath = goog.require('Blockly.utils.svgMath');
const userAgent = goog.require('Blockly.utils.userAgent');


/**
 * Don't do anything for this event, just halt propagation.
 * @param {!Event} e An event.
 */
const noEvent = function(e) {
  // This event has been handled.  No need to bubble up to the document.
  e.preventDefault();
  e.stopPropagation();
};
exports.noEvent = noEvent;

/**
 * Is this event targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 */
const isTargetInput = function(e) {
  return e.target.type == 'textarea' || e.target.type == 'text' ||
      e.target.type == 'number' || e.target.type == 'email' ||
      e.target.type == 'password' || e.target.type == 'search' ||
      e.target.type == 'tel' || e.target.type == 'url' ||
      e.target.isContentEditable ||
      (e.target.dataset && e.target.dataset.isTextInput == 'true');
};
exports.isTargetInput = isTargetInput;

/**
 * Returns the coordinates of the top-left corner of the element relative to
 * its parent. Only for SVG elements and children (e.g. rect, g, path).
 * @param {!Element} element SVG element to find the coordinates of.
 * @return {!Coordinate} Coordinate of the top-left corer of the element.
 * @deprecated Use Blockly.utils.svgMath.getRelativeXY instead.
 */
const getRelativeXY = function(element) {
  deprecation.warn(
    'Blockly.utils.getRelativeXY', 'September 2021', 'September 2022',
    'Blockly.utils.svgMath.getRelativeXY'
  );
  return svgMath.getRelativeXY(element);
};
exports.getRelativeXY = getRelativeXY;

/**
 * Returns the coordinates of the top-left corner of the element relative to
 * the div Blockly was injected into.
 * @param {!Element} element SVG element to find the coordinates of. If this is
 *     not a child of the div Blockly was injected into, the behaviour is
 *     undefined.
 * @return {!Coordinate} Coordinate of the top-left corer of the element.
 * @deprecated
 */
const getInjectionDivXY = function(element) {
  deprecation.warn(
    'Blockly.utils.getInjectionDivXY_', 'September 2021', 'September 2022');
  return svgMath.getInjectionDivXY(element);
};
exports.getInjectionDivXY_ = getInjectionDivXY;

/**
 * Is this event a right-click?
 * @param {!Event} e Mouse event.
 * @return {boolean} True if right-click.
 */
const isRightButton = function(e) {
  if (e.ctrlKey && userAgent.MAC) {
    // Control-clicking on Mac OS X is treated as a right-click.
    // WebKit on Mac OS X fails to change button to 2 (but Gecko does).
    return true;
  }
  return e.button == 2;
};
exports.isRightButton = isRightButton;

/**
 * Return the converted coordinates of the given mouse event.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param {!Event} e Mouse event.
 * @param {!Element} svg SVG element.
 * @param {?SVGMatrix} matrix Inverted screen CTM to use.
 * @return {!SVGPoint} Object with .x and .y properties.
 */
const mouseToSvg = function(e, svg, matrix) {
  const svgPoint = svg.createSVGPoint();
  svgPoint.x = e.clientX;
  svgPoint.y = e.clientY;

  if (!matrix) {
    matrix = svg.getScreenCTM().inverse();
  }
  return svgPoint.matrixTransform(matrix);
};
exports.mouseToSvg = mouseToSvg;

/**
 * Get the scroll delta of a mouse event in pixel units.
 * @param {!Event} e Mouse event.
 * @return {{x: number, y: number}} Scroll delta object with .x and .y
 *    properties.
 */
const getScrollDeltaPixels = function(e) {
  switch (e.deltaMode) {
    case 0x00:  // Pixel mode.
    default:
      return {x: e.deltaX, y: e.deltaY};
    case 0x01:  // Line mode.
      return {
        x: e.deltaX * internalConstants.LINE_MODE_MULTIPLIER,
        y: e.deltaY * internalConstants.LINE_MODE_MULTIPLIER
      };
    case 0x02:  // Page mode.
      return {
        x: e.deltaX * internalConstants.PAGE_MODE_MULTIPLIER,
        y: e.deltaY * internalConstants.PAGE_MODE_MULTIPLIER
      };
  }
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
 */
const replaceMessageReferences = function(message) {
  if (typeof message != 'string') {
    return message;
  }
  const interpolatedResult = tokenizeInterpolation_(message, false);
  // When parseInterpolationTokens == false, interpolatedResult should be at
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
 */
const checkMessageReferences = function(message) {
  let validSoFar = true;

  const msgTable = Msg;

  // TODO (#1169): Implement support for other string tables,
  // prefixes other than BKY_.
  const m = message.match(/%{BKY_[A-Z]\w*}/ig);
  for (let i = 0; i < m.length; i++) {
    const msgKey = m[i].toUpperCase();
    if (msgTable[msgKey.slice(6, -1)] == undefined) {
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
    if (state == 0) {
      if (c == '%') {
        const text = buffer.join('');
        if (text) {
          tokens.push(text);
        }
        buffer.length = 0;
        state = 1;  // Start escape.
      } else {
        buffer.push(c);  // Regular char.
      }
    } else if (state == 1) {
      if (c == '%') {
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
      } else if (c == '{') {
        state = 3;
      } else {
        buffer.push('%', c);  // Not recognized. Return as literal.
        state = 0;
      }
    } else if (state == 2) {
      if ('0' <= c && c <= '9') {
        number += c;  // Multi-digit number.
      } else {
        tokens.push(parseInt(number, 10));
        i--;  // Parse this char again.
        state = 0;
      }
    } else if (state == 3) {  // String table reference
      if (c == '') {
        // Premature end before closing '}'
        buffer.splice(0, 0, '%{');  // Re-insert leading delimiter
        i--;                        // Parse this char again.
        state = 0;                  // and parse as string literal.
      } else if (c != '}') {
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
            if (typeof rawValue == 'string') {
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
  for (let i = 0; i < tokens.length; ++i) {
    if (typeof tokens[i] == 'string') {
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
 */
const genUid = function() {
  deprecation.warn(
      'Blockly.utils.genUid', 'September 2021', 'September 2022',
      'Blockly.utils.idGenerator.genUid');
  return idGenerator.genUid();
};
exports.genUid = genUid;

/**
 * Returns true if 3D transforms are supported.
 * @return {boolean} True if 3D transforms are supported.
 * @deprecated Use Blockly.utils.svgMath.is3dSupported instead.
 */
const is3dSupported = function() {
  deprecation.warn(
    'Blockly.utils.is3dSupported', 'September 2021', 'September 2022',
    'Blockly.utils.svgMath.is3dSupported');
  return svgMath.is3dSupported();
};
exports.is3dSupported = is3dSupported;

/**
 * Calls a function after the page has loaded, possibly immediately.
 * @param {function()} fn Function to run.
 * @throws Error Will throw if no global document can be found (e.g., Node.js).
 */
const runAfterPageLoad = function(fn) {
  if (typeof document != 'object') {
    throw Error('runAfterPageLoad() requires browser document.');
  }
  if (document.readyState == 'complete') {
    fn();  // Page has already loaded. Call immediately.
  } else {
    // Poll readyState.
    const readyStateCheckInterval = setInterval(function() {
      if (document.readyState == 'complete') {
        clearInterval(readyStateCheckInterval);
        fn();
      }
    }, 10);
  }
};
exports.runAfterPageLoad = runAfterPageLoad;

/**
 * Returns the position of the current viewport in window coordinates. This
 * takes scroll into account.
 * @return {!Rect} An object containing window width, height, and
 *     scroll position in window coordinates.
 * @deprecated
 */
const getViewportBBox = function() {
  deprecation.warn(
    'Blockly.utils.getViewportBBox', 'September 2021', 'September 2022');
  return svgMath.getViewportBBox();
};
exports.getViewportBBox = getViewportBBox;

/**
 * Removes the first occurrence of a particular value from an array.
 * @param {!Array} arr Array from which to remove
 *     value.
 * @param {*} obj Object to remove.
 * @return {boolean} True if an element was removed.
 */
const arrayRemove = function(arr, obj) {
  const i = arr.indexOf(obj);
  if (i == -1) {
    return false;
  }
  arr.splice(i, 1);
  return true;
};
/** @package */
exports.arrayRemove = arrayRemove;


/**
 * Returns the document scroll distance as a coordinate object.
 * Copied from Closure's goog.dom.getDocumentScroll.
 * @return {!Coordinate} The document scroll distance as a coordinate object.
 * @deprecated Use Blockly.utils.svgMath.getDocumentScroll instead.
 */
const getDocumentScroll = function() {
  deprecation.warn(
    'Blockly.utils.getDocumentScroll', 'September 2021', 'September 2022',
    'Blockly.utils.svgMath.getDocumentScroll');
  return svgMath.getDocumentScroll();
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
 * @deprecated
 */
const screenToWsCoordinates = function(ws, screenCoordinates) {
  deprecation.warn(
    'Blockly.utils.screenToWsCoordinates', 'September 2021', 'September 2022');
  return ws.screenToWorkspaceXY(screenCoordinates);
};
/** @package */
exports.screenToWsCoordinates = screenToWsCoordinates;

/**
 * Parse a block colour from a number or string, as provided in a block
 * definition.
 * @param {number|string} colour HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 * @return {{hue: ?number, hex: string}} An object containing the colour as
 *     a #RRGGBB string, and the hue if the input was an HSV hue value.
 * @throws {Error} If the colour cannot be parsed.
 */
const parseBlockColour = function(colour) {
  const dereferenced =
      (typeof colour == 'string') ? replaceMessageReferences(colour) : colour;

  const hue = Number(dereferenced);
  if (!isNaN(hue) && 0 <= hue && hue <= 360) {
    return {
      hue: hue,
      hex: colourUtils.hsvToHex(
          hue, internalConstants.HSV_SATURATION,
          internalConstants.HSV_VALUE * 255)
    };
  } else {
    const hex = colourUtils.parse(dereferenced);
    if (hex) {
      // Only store hue if colour is set as a hue.
      return {hue: null, hex: hex};
    } else {
      let errorMsg = 'Invalid colour: "' + dereferenced + '"';
      if (colour != dereferenced) {
        errorMsg += ' (from "' + colour + '")';
      }
      throw Error(errorMsg);
    }
  }
};
exports.parseBlockColour = parseBlockColour;
