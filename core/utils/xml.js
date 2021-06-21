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
 * Matches control characters tha need to be replaced with NCRs (numerical
 * character references) before serializing to XML.
 */
// eslint-disable-next-line no-control-regex
Blockly.utils.xml.INVALID_CONTROL_CHARS = /[\u0000-\u0009\u000B\u000C\u000E-\u001F]/;

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
 * serialized to XML.
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
  return Blockly.utils.xml.sanitizeText(oSerializer.serializeToString(dom));
};

/**
 * Sanitizes a text string so that it can be serialized to XML. Specifically,
 * this replaces control characters with their NCR (numerical character
 * reference).
 * @param {string} text The text to sanitize.
 * @return {string} The sanitized text.
 */
Blockly.utils.xml.sanitizeText = function(text) {
  if (!text.match(Blockly.utils.xml.INVALID_CONTROL_CHARS)) {
    return text;
  }
  var match;
  var newText = '';
  while ((match = text.match(Blockly.utils.xml.INVALID_CONTROL_CHARS))) {
    newText += text.substring(0, match.index);
    newText += '&#x';
    newText += text.charCodeAt(match.index).toString(16);
    newText += ';';
    text = text.substr(match.index + 1);
  }
  newText += text;
  return newText;
};
