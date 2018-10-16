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
 * @param {string} tagName Name of DOM element.
 * @return {!Element} New DOM element.
 * @package
 */
Blockly.Xml.utils.createElement = function(tagName) {
  // TODO (#1978): Namespace this element.
  // TODO (#2082): Support node.js.
  return document.createElement(tagName);
};

/**
 * Create text element for XML.
 * @param {text} text Text content.
 * @return {!Node} New DOM node.
 * @package
 */
Blockly.Xml.utils.createTextNode = function(text) {
  // TODO (#2082): Support node.js.
  return document.createTextNode(text);
};

/**
 * Converts an XML string into a DOM tree. This method will be overridden in
 * the Node.js build of Blockly. See gulpfile.js, blockly_javascript_en task.
 * @param {string} text XML string.
 * @return {!Element} The DOM document.
 * @throws if XML doesn't parse.
 * @package
 */
Blockly.Xml.utils.textToDomDocument = function(text) {
  var oParser = new DOMParser();
  return oParser.parseFromString(text, 'text/xml');
};

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Text representation.
 * @package
 */
Blockly.Xml.utils.domToText = function(dom) {
  // TODO (#2082): Support node.js.
  var oSerializer = new XMLSerializer();
  return oSerializer.serializeToString(dom);
};
