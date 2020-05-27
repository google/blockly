/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
 * @return {!Text} New DOM text node.
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
 * @param {!Node} dom A tree of XML nodes.
 * @return {string} Text representation.
 * @public
 */
Blockly.utils.xml.domToText = function(dom) {
  var oSerializer = new XMLSerializer();
  return oSerializer.serializeToString(dom);
};
