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
  var offsetWidth = /** @type {!HTMLElement} */ (element).offsetWidth;
  var offsetHeight = /** @type {!HTMLElement} */ (element).offsetHeight;
  return new Blockly.utils.Size(offsetWidth, offsetHeight);
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
