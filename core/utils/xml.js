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
goog.module('Blockly.utils.xml');
goog.module.declareLegacyNamespace();

const {globalThis} = goog.require('Blockly.utils.global');


/**
 * Namespace for Blockly's XML.
 */
const NAME_SPACE = 'https://developers.google.com/blockly/xml';
exports.NAME_SPACE = NAME_SPACE;

/**
 * The Document object to use.  By default this is just document, but
 * the Node.js build of Blockly (see scripts/package/node/core.js)
 * calls setDocument to supply a Document implementation from the
 * jsdom package instead.
 * @type {!Document}
 */
let xmlDocument = globalThis.document;

/**
 * Get the document object to use for XML serialization.
 * @return {!Document} The document object.
 */
const getDocument = function() {
  return xmlDocument;
};
exports.getDocument = getDocument;

/**
 * Get the document object to use for XML serialization.
 * @param {!Document} document The document object to use.
 */
const setDocument = function(document) {
  xmlDocument = document;
};
exports.setDocument = setDocument;

/**
 * Create DOM element for XML.
 * @param {string} tagName Name of DOM element.
 * @return {!Element} New DOM element.
 */
const createElement = function(tagName) {
  return xmlDocument.createElementNS(NAME_SPACE, tagName);
};
exports.createElement = createElement;

/**
 * Create text element for XML.
 * @param {string} text Text content.
 * @return {!Text} New DOM text node.
 */
const createTextNode = function(text) {
  return xmlDocument.createTextNode(text);
};
exports.createTextNode = createTextNode;

/**
 * Converts an XML string into a DOM tree.
 * @param {string} text XML string.
 * @return {Document} The DOM document.
 * @throws if XML doesn't parse.
 */
const textToDomDocument = function(text) {
  const oParser = new DOMParser();
  return oParser.parseFromString(text, 'text/xml');
};
exports.textToDomDocument = textToDomDocument;

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * @param {!Node} dom A tree of XML nodes.
 * @return {string} Text representation.
 */
const domToText = function(dom) {
  const oSerializer = new XMLSerializer();
  return oSerializer.serializeToString(dom);
};
exports.domToText = domToText;
