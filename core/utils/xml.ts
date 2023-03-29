/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.utils.xml');

import * as deprecation from './deprecation.js';


/**
 * Injected dependencies.  By default these are just (and have the
 * same types as) the corresponding DOM Window properties, but the
 * Node.js wrapper for Blockly (see scripts/package/node/core.js)
 * calls injectDependencies to supply implementations from the jsdom
 * package instead.
 */
let {document, DOMParser, XMLSerializer} = globalThis;

/**
 * Inject implementations of document, DOMParser and/or XMLSerializer
 * to use instead of the default ones.
 *
 * Used by the Node.js wrapper for Blockly (see
 * scripts/package/node/core.js) to supply implementations from the
 * jsdom package instead.
 *
 * While they may be set individually, it is normally the case that
 * all three will be sourced from the same JSDOM instance.  They MUST
 * at least come from the same copy of the jsdom package.  (Typically
 * this is hard to avoid satsifying this requirement, but it can be
 * inadvertently violated by using webpack to build multiple bundles
 * containing Blockly and jsdom, and then loading more than one into
 * the same JavaScript runtime.  See
 * https://github.com/google/blockly-samples/pull/1452#issuecomment-1364442135
 * for an example of how this happened.)
 *
 * @param dependencies Options object containing dependencies to set.
 */
export function injectDependencies(dependencies: {
  document?: Document,
  DOMParser?: typeof DOMParser,
  XMLSerializer?: typeof XMLSerializer,
}) {
  ({
    // Default to existing value if option not supplied.
    document = document,
    DOMParser = DOMParser,
    XMLSerializer = XMLSerializer,
  } = dependencies);
}

/**
 * Namespace for Blockly's XML.
 */
export const NAME_SPACE = 'https://developers.google.com/blockly/xml';

/**
 * Get the document object to use for XML serialization.
 *
 * @returns The document object.
 * @deprecated No longer provided by Blockly.
 */
export function getDocument(): Document {
  deprecation.warn('Blockly.utils.xml.getDocument', 'version 9', 'version 10');
  return document;
}

/**
 * Get the document object to use for XML serialization.
 *
 * @param xmlDocument The document object to use.
 * @deprecated No longer provided by Blockly.
 */
export function setDocument(xmlDocument: Document) {
  deprecation.warn('Blockly.utils.xml.setDocument', 'version 9', 'version 10');
  document = xmlDocument;
}

/**
 * Create DOM element for XML.
 *
 * @param tagName Name of DOM element.
 * @returns New DOM element.
 */
export function createElement(tagName: string): Element {
  return document.createElementNS(NAME_SPACE, tagName);
}

/**
 * Create text element for XML.
 *
 * @param text Text content.
 * @returns New DOM text node.
 */
export function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

/**
 * Converts an XML string into a DOM structure.
 *
 * @param text An XML string.
 * @returns A DOM object representing the singular child of the document
 *     element.
 * @throws if the text doesn't parse.
 */
export function textToDom(text: string): Element {
  const doc = textToDomDocument(text);
  if (!doc || !doc.documentElement ||
      doc.getElementsByTagName('parsererror').length) {
    throw Error('textToDom was unable to parse: ' + text);
  }
  return doc.documentElement;
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
