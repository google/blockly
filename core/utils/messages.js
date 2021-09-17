/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for replacing message references in strings.
 */

goog.module('Blockly.utils.messages');
goog.module.declareLegacyNamespace();

const Msg = goog.require('Blockly.Msg');
const stringUtils = goog.require('Blockly.utils.string');


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
  return tokenizeInterpolationInternal(message, true);
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
const replaceReferences = function(message) {
  if (typeof message != 'string') {
    return message;
  }
  const interpolatedResult = tokenizeInterpolationInternal(message, false);
  // When parseInterpolationTokens == false, interpolatedResult should be at
  // most length 1.
  return interpolatedResult.length ? String(interpolatedResult[0]) : '';
};
exports.replaceReferences = replaceReferences;

/**
 * Validates that any %{MSG_KEY} references in the message refer to keys of
 * the Msg string table.
 * @param {string} message Text which might contain string table references.
 * @return {boolean} True if all message references have matching values.
 *     Otherwise, false.
 */
const checkReferences = function(message) {
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
exports.checkReferences = checkReferences;

/**
 * Internal implementation of the message reference and interpolation token
 * parsing used by tokenizeInterpolation() and replaceMessageReferences().
 * @param {string} message Text which might contain string table references and
 *     interpolation tokens.
 * @param {boolean} parseInterpolationTokens Option to parse numeric
 *     interpolation tokens (%1, %2, ...) when true.
 * @return {!Array<string|number>} Array of strings and numbers.
 */
const tokenizeInterpolationInternal = function(message, parseInterpolationTokens) {
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
                  tokenizeInterpolationInternal(rawValue, parseInterpolationTokens));
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
