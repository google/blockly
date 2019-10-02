/**
 * @license
 * Copyright 2018 Google LLC
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
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.utils.xml
 * @namespace
 */
goog.provide('Blockly.utils.xml');

/**
 * Namespace for Blockly's XML.
 */
Blockly.utils.xml.NAME_SPACE = 'https://developers.google.com/blockly/xml';

/**
 * Get the document object.  This method is overridden in the Node.js build of
 * Blockly. See gulpfile.js, package-blockly-node task.
 * @return {!Document} The document object.
 * @public
 */
Blockly.utils.xml.document = function() {
  return document;
};

/**
 * Create DOM element for XML.
 * @param {string} tagName Name of DOM element.
 * @return {!Element} New DOM element.
 * @public
 */
Blockly.utils.xml.createElement = function(tagName) {
  return Blockly.utils.xml.document().createElementNS(
      Blockly.utils.xml.NAME_SPACE, tagName);
};

/**
 * Create text element for XML.
 * @param {string} text Text content.
 * @return {!Node} New DOM node.
 * @public
 */
Blockly.utils.xml.createTextNode = function(text) {
  return Blockly.utils.xml.document().createTextNode(text);
};

/**
 * Converts an XML string into a DOM tree.
 * @param {string} text XML string.
 * @return {Document} The DOM document.
 * @throws if XML doesn't parse.
 * @public
 */
Blockly.utils.xml.textToDomDocument = function(text) {
  var oParser = new DOMParser();
  return oParser.parseFromString(text, 'text/xml');
};

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Text representation.
 * @public
 */
Blockly.utils.xml.domToText = function(dom) {
  var oSerializer = new XMLSerializer();
  return oSerializer.serializeToString(dom);
};
