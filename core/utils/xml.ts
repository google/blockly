/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * XML element manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.utils.xml');


/**
 * Namespace for Blockly's XML.
 */
export const NAME_SPACE = 'https://developers.google.com/blockly/xml';

/**
 * The Document object to use.  By default this is just document, but
 * the Node.js build of Blockly (see scripts/package/node/core.js)
 * calls setDocument to supply a Document implementation from the
 * jsdom package instead.
 */
let xmlDocument: Document = globalThis['document'];

/**
 * Get the document object to use for XML serialization.
 *
 * @returns The document object.
 */
export function getDocument(): Document {
  return xmlDocument;
}

/**
 * Get the document object to use for XML serialization.
 *
 * @param document The document object to use.
 */
export function setDocument(document: Document) {
  xmlDocument = document;
}

/**
 * Create DOM element for XML.
 *
 * @param tagName Name of DOM element.
 * @returns New DOM element.
 */
export function createElement(tagName: string): Element {
  return xmlDocument.createElementNS(NAME_SPACE, tagName);
}

/**
 * Create text element for XML.
 *
 * @param text Text content.
 * @returns New DOM text node.
 */
export function createTextNode(text: string): Text {
  return xmlDocument.createTextNode(text);
}

/**
 * Converts an XML string into a DOM tree.
 *
 * @param text XML string.
 * @returns The DOM document.
 * @throws if XML doesn't parse.
 */
export function textToDomDocument(text: string): Document {
  const oParser = new DOMParser();
  return oParser.parseFromString(text, 'text/xml');
}

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 *
 * @param dom A tree of XML nodes.
 * @returns Text representation.
 */
export function domToText(dom: Node): string {
  const oSerializer = new XMLSerializer();
  return oSerializer.serializeToString(dom);
}
