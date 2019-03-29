/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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

goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.userAgent');


/**
 * Remove an attribute from a element even if it's in IE 10.
 * Similar to Element.removeAttribute() but it works on SVG elements in IE 10.
 * Sets the attribute to null in IE 10, which treats removeAttribute as a no-op
 * if it's called on an SVG element.
 * @param {!Element} element DOM element to remove attribute from.
 * @param {string} attributeName Name of attribute to remove.
 */
Blockly.utils.removeAttribute = function(element, attributeName) {
  // goog.userAgent.isVersion is deprecated, but the replacement is
  // goog.userAgent.isVersionOrHigher.
  if (goog.userAgent.IE && goog.userAgent.isVersion('10.0')) {
    element.setAttribute(attributeName, null);
  } else {
    element.removeAttribute(attributeName);
  }
};

/**
 * Add a CSS class to a element.
 * Similar to Closure's goog.dom.classes.add, except it handles SVG elements.
 * @param {!Element} element DOM element to add class to.
 * @param {string} className Name of class to add.
 * @return {boolean} True if class was added, false if already present.
 */
Blockly.utils.addClass = function(element, className) {
  var classes = element.getAttribute('class') || '';
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') != -1) {
    return false;
  }
  if (classes) {
    classes += ' ';
  }
  element.setAttribute('class', classes + className);
  return true;
};

/**
 * Remove a CSS class from a element.
 * Similar to Closure's goog.dom.classes.remove, except it handles SVG elements.
 * @param {!Element} element DOM element to remove class from.
 * @param {string} className Name of class to remove.
 * @return {boolean} True if class was removed, false if never present.
 */
Blockly.utils.removeClass = function(element, className) {
  var classes = element.getAttribute('class');
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') == -1) {
    return false;
  }
  var classList = classes.split(/\s+/);
  for (var i = 0; i < classList.length; i++) {
    if (!classList[i] || classList[i] == className) {
      classList.splice(i, 1);
      i--;
    }
  }
  if (classList.length) {
    element.setAttribute('class', classList.join(' '));
  } else {
    Blockly.utils.removeAttribute(element, 'class');
  }
  return true;
};

/**
 * Checks if an element has the specified CSS class.
 * Similar to Closure's goog.dom.classes.has, except it handles SVG elements.
 * @param {!Element} element DOM element to check.
 * @param {string} className Name of class to check.
 * @return {boolean} True if class exists, false otherwise.
 * @package
 */
Blockly.utils.hasClass = function(element, className) {
  var classes = element.getAttribute('class');
  return (' ' + classes + ' ').indexOf(' ' + className + ' ') != -1;
};

/**
 * Removes a node from its parent. No-op if not attached to a parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
// Copied from Closure goog.dom.removeNode
Blockly.utils.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null;
};

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
         e.target.isContentEditable;
};

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.  Only for SVG elements and children (e.g. rect, g, path).
 * @param {!Element} element SVG element to find the coordinates of.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 */
Blockly.utils.getRelativeXY = function(element) {
  var xy = new goog.math.Coordinate(0, 0);
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
    xy.x += parseFloat(r[1]);
    if (r[3]) {
      xy.y += parseFloat(r[3]);
    }
  }

  // Then check for style = transform: translate(...) or translate3d(...)
  var style = element.getAttribute('style');
  if (style && style.indexOf('translate') > -1) {
    var styleComponents = style.match(Blockly.utils.getRelativeXY.XY_2D_REGEX_);
    // Try transform3d if 2d transform wasn't there.
    if (!styleComponents) {
      styleComponents = style.match(Blockly.utils.getRelativeXY.XY_3D_REGEX_);
    }
    if (styleComponents) {
      xy.x += parseFloat(styleComponents[1]);
      if (styleComponents[3]) {
        xy.y += parseFloat(styleComponents[3]);
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
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
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
    element = element.parentNode;
  }
  return new goog.math.Coordinate(x, y);
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
    /translate\(\s*([-+\d.e]+)([ ,]\s*([-+\d.e]+)\s*\))?/;

/**
 * Static regex to pull the x,y,z values out of a translate3d() style property.
 * Accounts for same exceptions as XY_REGEXP_.
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getRelativeXY.XY_3D_REGEX_ =
    /transform:\s*translate3d\(\s*([-+\d.e]+)px([ ,]\s*([-+\d.e]+)\s*)px([ ,]\s*([-+\d.e]+)\s*)px\)?/;

/**
 * Static regex to pull the x,y,z values out of a translate3d() style property.
 * Accounts for same exceptions as XY_REGEXP_.
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getRelativeXY.XY_2D_REGEX_ =
    /transform:\s*translate\(\s*([-+\d.e]+)px([ ,]\s*([-+\d.e]+)\s*)px\)?/;

/**
 * Helper method for creating SVG elements.
 * @param {string} name Element's tag name.
 * @param {!Object} attrs Dictionary of attribute names and values.
 * @param {Element} parent Optional parent on which to append the element.
 * @return {!SVGElement} Newly created SVG element.
 */
Blockly.utils.createSvgElement = function(name, attrs, parent) {
  var e = /** @type {!SVGElement} */
      (document.createElementNS(Blockly.SVG_NS, name));
  for (var key in attrs) {
    e.setAttribute(key, attrs[key]);
  }
  // IE defines a unique attribute "runtimeStyle", it is NOT applied to
  // elements created with createElementNS. However, Closure checks for IE
  // and assumes the presence of the attribute and crashes.
  if (document.body.runtimeStyle) {  // Indicates presence of IE-only attr.
    e.runtimeStyle = e.currentStyle = e.style;
  }
  if (parent) {
    parent.appendChild(e);
  }
  return e;
};

/**
 * Is this event a right-click?
 * @param {!Event} e Mouse event.
 * @return {boolean} True if right-click.
 */
Blockly.utils.isRightButton = function(e) {
  if (e.ctrlKey && goog.userAgent.MAC) {
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
 * @param {SVGMatrix} matrix Inverted screen CTM to use.
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
 * Given an array of strings, return the length of the shortest one.
 * @param {!Array.<string>} array Array of strings.
 * @return {number} Length of shortest string.
 */
Blockly.utils.shortestStringLength = function(array) {
  if (!array.length) {
    return 0;
  }
  return array.reduce(function(a, b) {
    return a.length < b.length ? a : b;
  }).length;
};

/**
 * Given an array of strings, return the length of the common prefix.
 * Words may not be split.  Any space after a word is included in the length.
 * @param {!Array.<string>} array Array of strings.
 * @param {number=} opt_shortest Length of shortest string.
 * @return {number} Length of common prefix.
 */
Blockly.utils.commonWordPrefix = function(array, opt_shortest) {
  if (!array.length) {
    return 0;
  } else if (array.length == 1) {
    return array[0].length;
  }
  var wordPrefix = 0;
  var max = opt_shortest || Blockly.utils.shortestStringLength(array);
  for (var len = 0; len < max; len++) {
    var letter = array[0][len];
    for (var i = 1; i < array.length; i++) {
      if (letter != array[i][len]) {
        return wordPrefix;
      }
    }
    if (letter == ' ') {
      wordPrefix = len + 1;
    }
  }
  for (var i = 1; i < array.length; i++) {
    var letter = array[i][len];
    if (letter && letter != ' ') {
      return wordPrefix;
    }
  }
  return max;
};

/**
 * Given an array of strings, return the length of the common suffix.
 * Words may not be split.  Any space after a word is included in the length.
 * @param {!Array.<string>} array Array of strings.
 * @param {number=} opt_shortest Length of shortest string.
 * @return {number} Length of common suffix.
 */
Blockly.utils.commonWordSuffix = function(array, opt_shortest) {
  if (!array.length) {
    return 0;
  } else if (array.length == 1) {
    return array[0].length;
  }
  var wordPrefix = 0;
  var max = opt_shortest || Blockly.utils.shortestStringLength(array);
  for (var len = 0; len < max; len++) {
    var letter = array[0].substr(-len - 1, 1);
    for (var i = 1; i < array.length; i++) {
      if (letter != array[i].substr(-len - 1, 1)) {
        return wordPrefix;
      }
    }
    if (letter == ' ') {
      wordPrefix = len + 1;
    }
  }
  for (var i = 1; i < array.length; i++) {
    var letter = array[i].charAt(array[i].length - len - 1);
    if (letter && letter != ' ') {
      return wordPrefix;
    }
  }
  return max;
};

/**
 * Parse a string with any number of interpolation tokens (%1, %2, ...).
 * It will also replace string table references (e.g., %{bky_my_msg} and
 * %{BKY_MY_MSG} will both be replaced with the value in
 * Blockly.Msg['MY_MSG']). Percentage sign characters '%' may be self-escaped
 * (e.g., '%%').
 * @param {string} message Text which might contain string table references and
 *     interpolation tokens.
 * @return {!Array.<string|number>} Array of strings and numbers.
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
  return interpolatedResult.length ? interpolatedResult[0] : '';
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
  var regex = /%{(BKY_[A-Z][A-Z0-9_]*)}/gi;
  var match = regex.exec(message);
  while (match) {
    var msgKey = match[1];
    msgKey = msgKey.toUpperCase();
    if (msgKey.substr(0, 4) != 'BKY_') {
      console.log('WARNING: Unsupported message table prefix in %{' +
          match[1] + '}.');
      validSoFar = false;  // Continue to report other errors.
    } else if (msgTable[msgKey.substr(4)] == undefined) {
      console.log('WARNING: No message string for %{' + match[1] + '}.');
      validSoFar = false;  // Continue to report other errors.
    }

    // Re-run on remainder of string.
    message = message.substring(match.index + msgKey.length + 1);
    match = regex.exec(message);
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
 * @return {!Array.<string|number>} Array of strings and numbers.
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
      } else  {
        var rawKey = buffer.join('');
        if (/[a-zA-Z][a-zA-Z0-9_]*/.test(rawKey)) {  // Strict matching
          // Found a valid string key. Attempt case insensitive match.
          var keyUpper = rawKey.toUpperCase();

          // BKY_ is the prefix used to namespace the strings used in Blockly
          // core files and the predefined blocks in ../blocks/.
          // These strings are defined in ../msgs/ files.
          var bklyKey = Blockly.utils.startsWith(keyUpper, 'BKY_') ?
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
 * Wrap text to the specified width.
 * @param {string} text Text to wrap.
 * @param {number} limit Width to wrap each line.
 * @return {string} Wrapped text.
 */
Blockly.utils.wrap = function(text, limit) {
  var lines = text.split('\n');
  for (var i = 0; i < lines.length; i++) {
    lines[i] = Blockly.utils.wrapLine_(lines[i], limit);
  }
  return lines.join('\n');
};

/**
 * Wrap single line of text to the specified width.
 * @param {string} text Text to wrap.
 * @param {number} limit Width to wrap each line.
 * @return {string} Wrapped text.
 * @private
 */
Blockly.utils.wrapLine_ = function(text, limit) {
  if (text.length <= limit) {
    // Short text, no need to wrap.
    return text;
  }
  // Split the text into words.
  var words = text.trim().split(/\s+/);
  // Set limit to be the length of the largest word.
  for (var i = 0; i < words.length; i++) {
    if (words[i].length > limit) {
      limit = words[i].length;
    }
  }

  var lastScore;
  var score = -Infinity;
  var lastText;
  var lineCount = 1;
  do {
    lastScore = score;
    lastText = text;
    // Create a list of booleans representing if a space (false) or
    // a break (true) appears after each word.
    var wordBreaks = [];
    // Seed the list with evenly spaced linebreaks.
    var steps = words.length / lineCount;
    var insertedBreaks = 1;
    for (var i = 0; i < words.length - 1; i++) {
      if (insertedBreaks < (i + 1.5) / steps) {
        insertedBreaks++;
        wordBreaks[i] = true;
      } else {
        wordBreaks[i] = false;
      }
    }
    wordBreaks = Blockly.utils.wrapMutate_(words, wordBreaks, limit);
    score = Blockly.utils.wrapScore_(words, wordBreaks, limit);
    text = Blockly.utils.wrapToText_(words, wordBreaks);
    lineCount++;
  } while (score > lastScore);
  return lastText;
};

/**
 * Compute a score for how good the wrapping is.
 * @param {!Array.<string>} words Array of each word.
 * @param {!Array.<boolean>} wordBreaks Array of line breaks.
 * @param {number} limit Width to wrap each line.
 * @return {number} Larger the better.
 * @private
 */
Blockly.utils.wrapScore_ = function(words, wordBreaks, limit) {
  // If this function becomes a performance liability, add caching.
  // Compute the length of each line.
  var lineLengths = [0];
  var linePunctuation = [];
  for (var i = 0; i < words.length; i++) {
    lineLengths[lineLengths.length - 1] += words[i].length;
    if (wordBreaks[i] === true) {
      lineLengths.push(0);
      linePunctuation.push(words[i].charAt(words[i].length - 1));
    } else if (wordBreaks[i] === false) {
      lineLengths[lineLengths.length - 1]++;
    }
  }
  var maxLength = Math.max.apply(Math, lineLengths);

  var score = 0;
  for (var i = 0; i < lineLengths.length; i++) {
    // Optimize for width.
    // -2 points per char over limit (scaled to the power of 1.5).
    score -= Math.pow(Math.abs(limit - lineLengths[i]), 1.5) * 2;
    // Optimize for even lines.
    // -1 point per char smaller than max (scaled to the power of 1.5).
    score -= Math.pow(maxLength - lineLengths[i], 1.5);
    // Optimize for structure.
    // Add score to line endings after punctuation.
    if ('.?!'.indexOf(linePunctuation[i]) != -1) {
      score += limit / 3;
    } else if (',;)]}'.indexOf(linePunctuation[i]) != -1) {
      score += limit / 4;
    }
  }
  // All else being equal, the last line should not be longer than the
  // previous line.  For example, this looks wrong:
  // aaa bbb
  // ccc ddd eee
  if (lineLengths.length > 1 && lineLengths[lineLengths.length - 1] <=
      lineLengths[lineLengths.length - 2]) {
    score += 0.5;
  }
  return score;
};

/**
 * Mutate the array of line break locations until an optimal solution is found.
 * No line breaks are added or deleted, they are simply moved around.
 * @param {!Array.<string>} words Array of each word.
 * @param {!Array.<boolean>} wordBreaks Array of line breaks.
 * @param {number} limit Width to wrap each line.
 * @return {!Array.<boolean>} New array of optimal line breaks.
 * @private
 */
Blockly.utils.wrapMutate_ = function(words, wordBreaks, limit) {
  var bestScore = Blockly.utils.wrapScore_(words, wordBreaks, limit);
  var bestBreaks;
  // Try shifting every line break forward or backward.
  for (var i = 0; i < wordBreaks.length - 1; i++) {
    if (wordBreaks[i] == wordBreaks[i + 1]) {
      continue;
    }
    var mutatedWordBreaks = [].concat(wordBreaks);
    mutatedWordBreaks[i] = !mutatedWordBreaks[i];
    mutatedWordBreaks[i + 1] = !mutatedWordBreaks[i + 1];
    var mutatedScore =
        Blockly.utils.wrapScore_(words, mutatedWordBreaks, limit);
    if (mutatedScore > bestScore) {
      bestScore = mutatedScore;
      bestBreaks = mutatedWordBreaks;
    }
  }
  if (bestBreaks) {
    // Found an improvement.  See if it may be improved further.
    return Blockly.utils.wrapMutate_(words, bestBreaks, limit);
  }
  // No improvements found.  Done.
  return wordBreaks;
};

/**
 * Reassemble the array of words into text, with the specified line breaks.
 * @param {!Array.<string>} words Array of each word.
 * @param {!Array.<boolean>} wordBreaks Array of line breaks.
 * @return {string} Plain text.
 * @private
 */
Blockly.utils.wrapToText_ = function(words, wordBreaks) {
  var text = [];
  for (var i = 0; i < words.length; i++) {
    text.push(words[i]);
    if (wordBreaks[i] !== undefined) {
      text.push(wordBreaks[i] ? '\n' : ' ');
    }
  }
  return text.join('');
};

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
  if (!goog.global.getComputedStyle) {
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
      var computedStyle = goog.global.getComputedStyle(el);
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
 * Insert a node after a reference node.
 * Contrast with node.insertBefore function.
 * @param {!Element} newNode New element to insert.
 * @param {!Element} refNode Existing element to precede new node.
 * @package
 */
Blockly.utils.insertAfter = function(newNode, refNode) {
  var siblingNode = refNode.nextSibling;
  var parentNode = refNode.parentNode;
  if (!parentNode) {
    throw Error('Reference node has no parent.');
  }
  if (siblingNode) {
    parentNode.insertBefore(newNode, siblingNode);
  } else {
    parentNode.appendChild(newNode);
  }
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
 * Sets the CSS transform property on an element. This function sets the
 * non-vendor-prefixed and vendor-prefixed versions for backwards compatibility
 * with older browsers. See https://caniuse.com/#feat=transforms2d
 * @param {!Element} node The node which the CSS transform should be applied.
 * @param {string} transform The value of the CSS `transform` property.
 */
Blockly.utils.setCssTransform = function(node, transform) {
  node.style['transform'] = transform;
  node.style['-webkit-transform'] = transform;
};

/**
 * Get the position of the current viewport in window coordinates.  This takes
 * scroll into account.
 * @return {!Object} An object containing window width, height, and scroll
 *     position in window coordinates.
 * @package
 */
Blockly.utils.getViewportBBox = function() {
  // Pixels.
  var windowSize = goog.dom.getViewportSize();
  // Pixels, in window coordinates.
  var scrollOffset = goog.style.getViewportPageOffset(document);
  return {
    right: windowSize.width + scrollOffset.x,
    bottom: windowSize.height + scrollOffset.y,
    top: scrollOffset.y,
    left: scrollOffset.x
  };
};

/**
 * Fast prefix-checker.
 * Copied from Closure's goog.string.startsWith.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of `str`.
 * @return {boolean} True if `str` begins with `prefix`.
 * @package
 */
Blockly.utils.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
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
 * Converts degrees to radians.
 * Copied from Closure's goog.math.toRadians.
 * @param {number} angleDegrees Angle in degrees.
 * @return {number} Angle in radians.
 * @package
 */
Blockly.utils.toRadians = function(angleDegrees) {
  return angleDegrees * Math.PI / 180;
};

/**
 * Converts radians to degrees.
 * Copied from Closure's goog.math.toDegrees.
 * @param {number} angleRadians Angle in radians.
 * @return {number} Angle in degrees.
 * @package
 */
Blockly.utils.toDegrees = function(angleRadians) {
  return angleRadians * 180 / Math.PI;
};

/**
 * Whether a node contains another node.
 * @param {!Node} parent The node that should contain the other node.
 * @param {!Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendant node.
 * @package
 */
Blockly.utils.containsNode = function(parent, descendant) {
  return !!(parent.compareDocumentPosition(descendant) &
            Node.DOCUMENT_POSITION_CONTAINED_BY);
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
  for (var i = 0, checkBlock; checkBlock = descendants[i]; i++) {
    if (typeCountsMap[checkBlock.type]) {
      typeCountsMap[checkBlock.type]++;
    } else {
      typeCountsMap[checkBlock.type] = 1;
    }
  }
  return typeCountsMap;
};

/**
 * Clamp the provided number between the lower bound and the upper bound.
 * @param {number} lowerBound The desired lower bound.
 * @param {number} number The number to clamp.
 * @param {number} upperBound The desired upper bound.
 * @return {number} The clamped number.
 * @package
 */
Blockly.utils.clampNumber = function(lowerBound, number, upperBound) {
  if (upperBound < lowerBound) {
    var temp = upperBound;
    upperBound = lowerBound;
    lowerBound = temp;
  }
  return Math.max(lowerBound, Math.min(number, upperBound));
};
