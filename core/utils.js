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
goog.provide('Blockly.utils');

/** @suppress {extraRequire} */
goog.require('Blockly.constants');
goog.require('Blockly.Msg');
goog.require('Blockly.utils.colour');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.global');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.string');
goog.require('Blockly.utils.style');
goog.require('Blockly.utils.userAgent');

goog.requireType('Blockly.Block');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Don't do anything for this event, just halt propagation.
 * @param {!Event} e An event.
 */
Blockly.utils.noEvent = function(e) {
  // This event has been handled.  No need to bubble up to the document.
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Is this event targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 */
Blockly.utils.isTargetInput = function(e) {
  return e.target.type == 'textarea' || e.target.type == 'text' ||
         e.target.type == 'number' || e.target.type == 'email' ||
         e.target.type == 'password' || e.target.type == 'search' ||
         e.target.type == 'tel' || e.target.type == 'url' ||
         e.target.isContentEditable ||
         (e.target.dataset && e.target.dataset.isTextInput == 'true');
};

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.  Only for SVG elements and children (e.g. rect, g, path).
 * @param {!Element} element SVG element to find the coordinates of.
 * @return {!Blockly.utils.Coordinate} Object with .x and .y properties.
 */
Blockly.utils.getRelativeXY = function(element) {
  var xy = new Blockly.utils.Coordinate(0, 0);
  // First, check for x and y attributes.
  var x = element.getAttribute('x');
  if (x) {
    xy.x = parseInt(x, 10);
  }
  var y = element.getAttribute('y');
  if (y) {
    xy.y = parseInt(y, 10);
  }
  // Second, check for transform="translate(...)" attribute.
  var transform = element.getAttribute('transform');
  var r = transform && transform.match(Blockly.utils.getRelativeXY.XY_REGEX_);
  if (r) {
    xy.x += Number(r[1]);
    if (r[3]) {
      xy.y += Number(r[3]);
    }
  }

  // Then check for style = transform: translate(...) or translate3d(...)
  var style = element.getAttribute('style');
  if (style && style.indexOf('translate') > -1) {
    var styleComponents =
        style.match(Blockly.utils.getRelativeXY.XY_STYLE_REGEX_);
    if (styleComponents) {
      xy.x += Number(styleComponents[1]);
      if (styleComponents[3]) {
        xy.y += Number(styleComponents[3]);
      }
    }
  }
  return xy;
};

/**
 * Return the coordinates of the top-left corner of this element relative to
 * the div Blockly was injected into.
 * @param {!Element} element SVG element to find the coordinates of. If this is
 *     not a child of the div Blockly was injected into, the behaviour is
 *     undefined.
 * @return {!Blockly.utils.Coordinate} Object with .x and .y properties.
 */
Blockly.utils.getInjectionDivXY_ = function(element) {
  var x = 0;
  var y = 0;
  while (element) {
    var xy = Blockly.utils.getRelativeXY(element);
    x = x + xy.x;
    y = y + xy.y;
    var classes = element.getAttribute('class') || '';
    if ((' ' + classes + ' ').indexOf(' injectionDiv ') != -1) {
      break;
    }
    element = /** @type {!Element} */ (element.parentNode);
  }
  return new Blockly.utils.Coordinate(x, y);
};

/**
 * Static regex to pull the x,y values out of an SVG translate() directive.
 * Note that Firefox and IE (9,10) return 'translate(12)' instead of
 * 'translate(12, 0)'.
 * Note that IE (9,10) returns 'translate(16 8)' instead of 'translate(16, 8)'.
 * Note that IE has been reported to return scientific notation (0.123456e-42).
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getRelativeXY.XY_REGEX_ =
    /translate\(\s*([-+\d.e]+)([ ,]\s*([-+\d.e]+)\s*)?/;

/**
 * Static regex to pull the x,y values out of a translate() or translate3d()
 * style property.
 * Accounts for same exceptions as XY_REGEX_.
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getRelativeXY.XY_STYLE_REGEX_ =
    /transform:\s*translate(?:3d)?\(\s*([-+\d.e]+)\s*px([ ,]\s*([-+\d.e]+)\s*px)?/;

/**
 * Is this event a right-click?
 * @param {!Event} e Mouse event.
 * @return {boolean} True if right-click.
 */
Blockly.utils.isRightButton = function(e) {
  if (e.ctrlKey && Blockly.utils.userAgent.MAC) {
    // Control-clicking on Mac OS X is treated as a right-click.
    // WebKit on Mac OS X fails to change button to 2 (but Gecko does).
    return true;
  }
  return e.button == 2;
};

/**
 * Return the converted coordinates of the given mouse event.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param {!Event} e Mouse event.
 * @param {!Element} svg SVG element.
 * @param {?SVGMatrix} matrix Inverted screen CTM to use.
 * @return {!SVGPoint} Object with .x and .y properties.
 */
Blockly.utils.mouseToSvg = function(e, svg, matrix) {
  var svgPoint = svg.createSVGPoint();
  svgPoint.x = e.clientX;
  svgPoint.y = e.clientY;

  if (!matrix) {
    matrix = svg.getScreenCTM().inverse();
  }
  return svgPoint.matrixTransform(matrix);
};

/**
 * Get the scroll delta of a mouse event in pixel units.
 * @param {!Event} e Mouse event.
 * @return {{x: number, y: number}} Scroll delta object with .x and .y
 *    properties.
 */
Blockly.utils.getScrollDeltaPixels = function(e) {
  switch (e.deltaMode) {
    case 0x00:  // Pixel mode.
    default:
      return {
        x: e.deltaX,
        y: e.deltaY
      };
    case 0x01:  // Line mode.
      return {
        x: e.deltaX * Blockly.LINE_MODE_MULTIPLIER,
        y: e.deltaY * Blockly.LINE_MODE_MULTIPLIER
      };
    case 0x02:  // Page mode.
      return {
        x: e.deltaX * Blockly.PAGE_MODE_MULTIPLIER,
        y: e.deltaY * Blockly.PAGE_MODE_MULTIPLIER
      };
  }
};

/**
 * Parse a string with any number of interpolation tokens (%1, %2, ...).
 * It will also replace string table references (e.g., %{bky_my_msg} and
 * %{BKY_MY_MSG} will both be replaced with the value in
 * Blockly.Msg['MY_MSG']). Percentage sign characters '%' may be self-escaped
 * (e.g., '%%').
 * @param {string} message Text which might contain string table references and
 *     interpolation tokens.
 * @return {!Array<string|number>} Array of strings and numbers.
 */
Blockly.utils.tokenizeInterpolation = function(message) {
  return Blockly.utils.tokenizeInterpolation_(message, true);
};

/**
 * Replaces string table references in a message, if the message is a string.
 * For example, "%{bky_my_msg}" and "%{BKY_MY_MSG}" will both be replaced with
 * the value in Blockly.Msg['MY_MSG'].
 * @param {string|?} message Message, which may be a string that contains
 *     string table references.
 * @return {string} String with message references replaced.
 */
Blockly.utils.replaceMessageReferences = function(message) {
  if (typeof message != 'string') {
    return message;
  }
  var interpolatedResult = Blockly.utils.tokenizeInterpolation_(message, false);
  // When parseInterpolationTokens == false, interpolatedResult should be at
  // most length 1.
  return interpolatedResult.length ? String(interpolatedResult[0]) : '';
};

/**
 * Validates that any %{MSG_KEY} references in the message refer to keys of
 * the Blockly.Msg string table.
 * @param {string} message Text which might contain string table references.
 * @return {boolean} True if all message references have matching values.
 *     Otherwise, false.
 */
Blockly.utils.checkMessageReferences = function(message) {
  var validSoFar = true;

  var msgTable = Blockly.Msg;

  // TODO (#1169): Implement support for other string tables,
  // prefixes other than BKY_.
  var m = message.match(/%{BKY_[A-Z]\w*}/ig);
  for (var i = 0; i < m.length; i++) {
    var msgKey = m[i].toUpperCase();
    if (msgTable[msgKey.slice(6, -1)] == undefined) {
      console.warn('No message string for ' + m[i] + ' in ' + message);
      validSoFar = false;  // Continue to report other errors.
    }
  }

  return validSoFar;
};

/**
 * Internal implementation of the message reference and interpolation token
 * parsing used by tokenizeInterpolation() and replaceMessageReferences().
 * @param {string} message Text which might contain string table references and
 *     interpolation tokens.
 * @param {boolean} parseInterpolationTokens Option to parse numeric
 *     interpolation tokens (%1, %2, ...) when true.
 * @return {!Array<string|number>} Array of strings and numbers.
 * @private
 */
Blockly.utils.tokenizeInterpolation_ = function(message,
    parseInterpolationTokens) {
  var tokens = [];
  var chars = message.split('');
  chars.push('');  // End marker.
  // Parse the message with a finite state machine.
  // 0 - Base case.
  // 1 - % found.
  // 2 - Digit found.
  // 3 - Message ref found.
  var state = 0;
  var buffer = [];
  var number = null;
  for (var i = 0; i < chars.length; i++) {
    var c = chars[i];
    if (state == 0) {
      if (c == '%') {
        var text = buffer.join('');
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
        var text = buffer.join('');
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
        i--;  // Parse this char again.
        state = 0;  // and parse as string literal.
      } else if (c != '}') {
        buffer.push(c);
      } else {
        var rawKey = buffer.join('');
        if (/[A-Z]\w*/i.test(rawKey)) {  // Strict matching
          // Found a valid string key. Attempt case insensitive match.
          var keyUpper = rawKey.toUpperCase();

          // BKY_ is the prefix used to namespace the strings used in Blockly
          // core files and the predefined blocks in ../blocks/.
          // These strings are defined in ../msgs/ files.
          var bklyKey = Blockly.utils.string.startsWith(keyUpper, 'BKY_') ?
              keyUpper.substring(4) : null;
          if (bklyKey && bklyKey in Blockly.Msg) {
            var rawValue = Blockly.Msg[bklyKey];
            if (typeof rawValue == 'string') {
              // Attempt to dereference substrings, too, appending to the end.
              Array.prototype.push.apply(tokens,
                  Blockly.utils.tokenizeInterpolation_(
                      rawValue, parseInterpolationTokens));
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
  var text = buffer.join('');
  if (text) {
    tokens.push(text);
  }

  // Merge adjacent text tokens into a single string.
  var mergedTokens = [];
  buffer.length = 0;
  for (var i = 0; i < tokens.length; ++i) {
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
 * Generate a unique ID.  This should be globally unique.
 * 87 characters ^ 20 length > 128 bits (better than a UUID).
 * @return {string} A globally unique ID string.
 */
Blockly.utils.genUid = function() {
  var length = 20;
  var soupLength = Blockly.utils.genUid.soup_.length;
  var id = [];
  for (var i = 0; i < length; i++) {
    id[i] = Blockly.utils.genUid.soup_.charAt(Math.random() * soupLength);
  }
  return id.join('');
};

/**
 * Legal characters for the unique ID.  Should be all on a US keyboard.
 * No characters that conflict with XML or JSON.  Requests to remove additional
 * 'problematic' characters from this soup will be denied.  That's your failure
 * to properly escape in your own environment.  Issues #251, #625, #682, #1304.
 * @private
 */
Blockly.utils.genUid.soup_ = '!#$%()*+,-./:;=?@[]^_`{|}~' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Check if 3D transforms are supported by adding an element
 * and attempting to set the property.
 * @return {boolean} True if 3D transforms are supported.
 */
Blockly.utils.is3dSupported = function() {
  if (Blockly.utils.is3dSupported.cached_ !== undefined) {
    return Blockly.utils.is3dSupported.cached_;
  }
  // CC-BY-SA Lorenzo Polidori
  // stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
  if (!Blockly.utils.global['getComputedStyle']) {
    return false;
  }

  var el = document.createElement('p');
  var has3d = 'none';
  var transforms = {
    'webkitTransform': '-webkit-transform',
    'OTransform': '-o-transform',
    'msTransform': '-ms-transform',
    'MozTransform': '-moz-transform',
    'transform': 'transform'
  };

  // Add it to the body to get the computed style.
  document.body.insertBefore(el, null);

  for (var t in transforms) {
    if (el.style[t] !== undefined) {
      el.style[t] = 'translate3d(1px,1px,1px)';
      var computedStyle = Blockly.utils.global['getComputedStyle'](el);
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
  Blockly.utils.is3dSupported.cached_ = has3d !== 'none';
  return Blockly.utils.is3dSupported.cached_;
};

/**
 * Calls a function after the page has loaded, possibly immediately.
 * @param {function()} fn Function to run.
 * @throws Error Will throw if no global document can be found (e.g., Node.js).
 */
Blockly.utils.runAfterPageLoad = function(fn) {
  if (typeof document != 'object') {
    throw Error('Blockly.utils.runAfterPageLoad() requires browser document.');
  }
  if (document.readyState == 'complete') {
    fn();  // Page has already loaded. Call immediately.
  } else {
    // Poll readyState.
    var readyStateCheckInterval = setInterval(function() {
      if (document.readyState == 'complete') {
        clearInterval(readyStateCheckInterval);
        fn();
      }
    }, 10);
  }
};

/**
 * Get the position of the current viewport in window coordinates.  This takes
 * scroll into account.
 * @return {!Blockly.utils.Rect} An object containing window width, height, and
 *     scroll position in window coordinates.
 * @package
 */
Blockly.utils.getViewportBBox = function() {
  // Pixels, in window coordinates.
  var scrollOffset = Blockly.utils.style.getViewportPageOffset();
  return new Blockly.utils.Rect(
      scrollOffset.y,
      document.documentElement.clientHeight + scrollOffset.y,
      scrollOffset.x,
      document.documentElement.clientWidth + scrollOffset.x
  );
};

/**
 * Removes the first occurrence of a particular value from an array.
 * @param {!Array} arr Array from which to remove
 *     value.
 * @param {*} obj Object to remove.
 * @return {boolean} True if an element was removed.
 * @package
 */
Blockly.utils.arrayRemove = function(arr, obj) {
  var i = arr.indexOf(obj);
  if (i == -1) {
    return false;
  }
  arr.splice(i, 1);
  return true;
};

/**
 * Gets the document scroll distance as a coordinate object.
 * Copied from Closure's goog.dom.getDocumentScroll.
 * @return {!Blockly.utils.Coordinate} Object with values 'x' and 'y'.
 */
Blockly.utils.getDocumentScroll = function() {
  var el = document.documentElement;
  var win = window;
  if (Blockly.utils.userAgent.IE && win.pageYOffset != el.scrollTop) {
    // The keyboard on IE10 touch devices shifts the page using the pageYOffset
    // without modifying scrollTop. For this case, we want the body scroll
    // offsets.
    return new Blockly.utils.Coordinate(el.scrollLeft, el.scrollTop);
  }
  return new Blockly.utils.Coordinate(
      win.pageXOffset || el.scrollLeft, win.pageYOffset || el.scrollTop);
};

/**
 * Get a map of all the block's descendants mapping their type to the number of
 *    children with that type.
 * @param {!Blockly.Block} block The block to map.
 * @param {boolean=} opt_stripFollowing Optionally ignore all following
 *    statements (blocks that are not inside a value or statement input
 *    of the block).
 * @return {!Object} Map of types to type counts for descendants of the bock.
 */
Blockly.utils.getBlockTypeCounts = function(block, opt_stripFollowing) {
  var typeCountsMap = Object.create(null);
  var descendants = block.getDescendants(true);
  if (opt_stripFollowing) {
    var nextBlock = block.getNextBlock();
    if (nextBlock) {
      var index = descendants.indexOf(nextBlock);
      descendants.splice(index, descendants.length - index);
    }
  }
  for (var i = 0, checkBlock; (checkBlock = descendants[i]); i++) {
    if (typeCountsMap[checkBlock.type]) {
      typeCountsMap[checkBlock.type]++;
    } else {
      typeCountsMap[checkBlock.type] = 1;
    }
  }
  return typeCountsMap;
};

/**
 * Converts screen coordinates to workspace coordinates.
 * @param {!Blockly.WorkspaceSvg} ws The workspace to find the coordinates on.
 * @param {!Blockly.utils.Coordinate} screenCoordinates The screen coordinates to
 * be converted to workspace coordinates
 * @return {!Blockly.utils.Coordinate} The workspace coordinates.
 * @package
 */
Blockly.utils.screenToWsCoordinates = function(ws, screenCoordinates) {
  var screenX = screenCoordinates.x;
  var screenY = screenCoordinates.y;

  var injectionDiv = ws.getInjectionDiv();
  // Bounding rect coordinates are in client coordinates, meaning that they
  // are in pixels relative to the upper left corner of the visible browser
  // window.  These coordinates change when you scroll the browser window.
  var boundingRect = injectionDiv.getBoundingClientRect();

  // The client coordinates offset by the injection div's upper left corner.
  var clientOffsetPixels = new Blockly.utils.Coordinate(
      screenX - boundingRect.left, screenY - boundingRect.top);

  // The offset in pixels between the main workspace's origin and the upper
  // left corner of the injection div.
  var mainOffsetPixels = ws.getOriginOffsetInPixels();

  // The position of the new comment in pixels relative to the origin of the
  // main workspace.
  var finalOffsetPixels = Blockly.utils.Coordinate.difference(
      clientOffsetPixels, mainOffsetPixels);

  // The position in main workspace coordinates.
  var finalOffsetMainWs = finalOffsetPixels.scale(1 / ws.scale);
  return finalOffsetMainWs;
};

/**
 * Parse a block colour from a number or string, as provided in a block
 * definition.
 * @param {number|string} colour HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 * @return {{hue: ?number, hex: string}} An object containing the colour as
 *     a #RRGGBB string, and the hue if the input was an HSV hue value.
 * @throws {Error} If the colour cannot be parsed.
 */
Blockly.utils.parseBlockColour = function(colour) {
  var dereferenced = (typeof colour == 'string') ?
      Blockly.utils.replaceMessageReferences(colour) : colour;

  var hue = Number(dereferenced);
  if (!isNaN(hue) && 0 <= hue && hue <= 360) {
    return {
      hue: hue,
      hex: Blockly.utils.colour.hsvToHex(hue, Blockly.HSV_SATURATION,
          Blockly.HSV_VALUE * 255)
    };
  } else {
    var hex = Blockly.utils.colour.parse(dereferenced);
    if (hex) {
      // Only store hue if colour is set as a hue.
      return {
        hue: null,
        hex: hex
      };
    } else {
      var errorMsg = 'Invalid colour: "' + dereferenced + '"';
      if (colour != dereferenced) {
        errorMsg += ' (from "' + colour + '")';
      }
      throw Error(errorMsg);
    }
  }
};
