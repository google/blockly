/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview XML element manipulation.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.Xml.utils
 * @namespace
 */
goog.provide('Blockly.Xml.utils');


/**
 * Create DOM element for XML.
 * @param {tagName} name Name of DOM element.
 * @return {!Element} New DOM element.
 */
Blockly.Xml.utils.createElement = function(tagName) {
  // TODO: Namespace this element.
  // TODO: Support node.js.
  return document.createElement(tagName);
};

/**
 * Create text element for XML.
 * @param {text} text Text content.
 * @return {!Node} New DOM node.
 */
Blockly.Xml.utils.createTextNode = function(text) {
  // TODO: Support node.js.
  return document.createTextNode(text);
};

