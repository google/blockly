/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for DOM manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 */

/**
 * Utility methods for DOM manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @namespace Blockly.utils.dom
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.utils.dom');

import type {Svg} from './svg.js';
import * as userAgent from './useragent.js';


/**
 * Required name space for SVG elements.
 * @alias Blockly.utils.dom.SVG_NS
 */
export const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Required name space for HTML elements.
 * @alias Blockly.utils.dom.HTML_NS
 */
export const HTML_NS = 'http://www.w3.org/1999/xhtml';

/**
 * Required name space for XLINK elements.
 * @alias Blockly.utils.dom.XLINK_NS
 */
export const XLINK_NS = 'http://www.w3.org/1999/xlink';

/**
 * Node type constants.
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
 * @alias Blockly.utils.dom.NodeType
 */
export enum NodeType {
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
  COMMENT_NODE = 8,
  DOCUMENT_POSITION_CONTAINED_BY = 16
}

/** Temporary cache of text widths. */
let cacheWidths: AnyDuringMigration = null;

/** Number of current references to cache. */
let cacheReference = 0;

/** A HTML canvas context used for computing text width. */
// AnyDuringMigration because:  Type 'null' is not assignable to type
// 'CanvasRenderingContext2D'.
let canvasContext: CanvasRenderingContext2D = null as AnyDuringMigration;

/**
 * Helper method for creating SVG elements.
 * @param name Element's tag name.
 * @param attrs Dictionary of attribute names and values.
 * @param opt_parent Optional parent on which to append the element.
 * @return if name is a string or a more specific type if it a member of Svg.
 * @alias Blockly.utils.dom.createSvgElement
 */
export function createSvgElement<T extends SVGElement>(
    name: string|Svg<T>, attrs: AnyDuringMigration, opt_parent?: Element): T {
  const e = document.createElementNS(SVG_NS, String(name)) as T;
  for (const key in attrs) {
    e.setAttribute(key, attrs[key]);
  }
  // IE defines a unique attribute "runtimeStyle", it is NOT applied to
  // elements created with createElementNS. However, Closure checks for IE
  // and assumes the presence of the attribute and crashes.
  if ((document.body as any)
          .runtimeStyle) {  // Indicates presence of IE-only attr.
    (e as any).runtimeStyle = (e as any).currentStyle = e.style;
  }
  if (opt_parent) {
    opt_parent.appendChild(e);
  }
  return e;
}

/**
 * Add a CSS class to a element.
 * Similar to Closure's goog.dom.classes.add, except it handles SVG elements.
 * @param element DOM element to add class to.
 * @param className Name of class to add.
 * @return True if class was added, false if already present.
 * @alias Blockly.utils.dom.addClass
 */
export function addClass(element: Element, className: string): boolean {
  let classes = element.getAttribute('class') || '';
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') !== -1) {
    return false;
  }
  if (classes) {
    classes += ' ';
  }
  element.setAttribute('class', classes + className);
  return true;
}

/**
 * Removes multiple calsses from an element.
 * @param element DOM element to remove classes from.
 * @param classNames A string of one or multiple class names for an element.
 * @alias Blockly.utils.dom.removeClasses
 */
export function removeClasses(element: Element, classNames: string) {
  const classList = classNames.split(' ');
  for (let i = 0; i < classList.length; i++) {
    removeClass(element, classList[i]);
  }
}

/**
 * Remove a CSS class from a element.
 * Similar to Closure's goog.dom.classes.remove, except it handles SVG elements.
 * @param element DOM element to remove class from.
 * @param className Name of class to remove.
 * @return True if class was removed, false if never present.
 * @alias Blockly.utils.dom.removeClass
 */
export function removeClass(element: Element, className: string): boolean {
  const classes = element.getAttribute('class');
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') === -1) {
    return false;
  }
  const classList = classes!.split(/\s+/);
  for (let i = 0; i < classList.length; i++) {
    if (!classList[i] || classList[i] === className) {
      classList.splice(i, 1);
      i--;
    }
  }
  if (classList.length) {
    element.setAttribute('class', classList.join(' '));
  } else {
    element.removeAttribute('class');
  }
  return true;
}

/**
 * Checks if an element has the specified CSS class.
 * Similar to Closure's goog.dom.classes.has, except it handles SVG elements.
 * @param element DOM element to check.
 * @param className Name of class to check.
 * @return True if class exists, false otherwise.
 * @alias Blockly.utils.dom.hasClass
 */
export function hasClass(element: Element, className: string): boolean {
  const classes = element.getAttribute('class');
  return (' ' + classes + ' ').indexOf(' ' + className + ' ') !== -1;
}

/**
 * Removes a node from its parent. No-op if not attached to a parent.
 * @param node The node to remove.
 * @return The node removed if removed; else, null.
 * @alias Blockly.utils.dom.removeNode
 */
// Copied from Closure goog.dom.removeNode
export function removeNode(node: Node|null): Node|null {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null;
}

/**
 * Insert a node after a reference node.
 * Contrast with node.insertBefore function.
 * @param newNode New element to insert.
 * @param refNode Existing element to precede new node.
 * @alias Blockly.utils.dom.insertAfter
 */
export function insertAfter(newNode: Element, refNode: Element) {
  const siblingNode = refNode.nextSibling;
  const parentNode = refNode.parentNode;
  if (!parentNode) {
    throw Error('Reference node has no parent.');
  }
  if (siblingNode) {
    parentNode.insertBefore(newNode, siblingNode);
  } else {
    parentNode.appendChild(newNode);
  }
}

/**
 * Whether a node contains another node.
 * @param parent The node that should contain the other node.
 * @param descendant The node to test presence of.
 * @return Whether the parent node contains the descendant node.
 * @alias Blockly.utils.dom.containsNode
 */
export function containsNode(parent: Node, descendant: Node): boolean {
  return !!(
      parent.compareDocumentPosition(descendant) &
      NodeType.DOCUMENT_POSITION_CONTAINED_BY);
}

/**
 * Sets the CSS transform property on an element. This function sets the
 * non-vendor-prefixed and vendor-prefixed versions for backwards compatibility
 * with older browsers. See https://caniuse.com/#feat=transforms2d
 * @param element Element to which the CSS transform will be applied.
 * @param transform The value of the CSS `transform` property.
 * @alias Blockly.utils.dom.setCssTransform
 */
export function setCssTransform(element: Element, transform: string) {
  // AnyDuringMigration because:  Property 'style' does not exist on type
  // 'Element'.
  (element as AnyDuringMigration).style['transform'] = transform;
  // AnyDuringMigration because:  Property 'style' does not exist on type
  // 'Element'.
  (element as AnyDuringMigration).style['-webkit-transform'] = transform;
}

/**
 * Start caching text widths. Every call to this function MUST also call
 * stopTextWidthCache. Caches must not survive between execution threads.
 * @alias Blockly.utils.dom.startTextWidthCache
 */
export function startTextWidthCache() {
  cacheReference++;
  if (!cacheWidths) {
    cacheWidths = Object.create(null);
  }
}

/**
 * Stop caching field widths. Unless caching was already on when the
 * corresponding call to startTextWidthCache was made.
 * @alias Blockly.utils.dom.stopTextWidthCache
 */
export function stopTextWidthCache() {
  cacheReference--;
  if (!cacheReference) {
    cacheWidths = null;
  }
}

/**
 * Gets the width of a text element, caching it in the process.
 * @param textElement An SVG 'text' element.
 * @return Width of element.
 * @alias Blockly.utils.dom.getTextWidth
 */
export function getTextWidth(textElement: SVGTextElement): number {
  const key = textElement.textContent + '\n' + textElement.className.baseVal;
  let width;
  // Return the cached width if it exists.
  if (cacheWidths) {
    width = cacheWidths[key];
    if (width) {
      return width;
    }
  }

  // Attempt to compute fetch the width of the SVG text element.
  try {
    width = textElement.getComputedTextLength();
  } catch (e) {
    // In other cases where we fail to get the computed text. Instead, use an
    // approximation and do not cache the result. At some later point in time
    // when the block is inserted into the visible DOM, this method will be
    // called again and, at that point in time, will not throw an exception.
    return textElement.textContent!.length * 8;
  }

  // Cache the computed width and return.
  if (cacheWidths) {
    cacheWidths[key] = width;
  }
  return width;
}

/**
 * Gets the width of a text element using a faster method than `getTextWidth`.
 * This method requires that we know the text element's font family and size in
 * advance. Similar to `getTextWidth`, we cache the width we compute.
 * @param textElement An SVG 'text' element.
 * @param fontSize The font size to use.
 * @param fontWeight The font weight to use.
 * @param fontFamily The font family to use.
 * @return Width of element.
 * @alias Blockly.utils.dom.getFastTextWidth
 */
export function getFastTextWidth(
    textElement: Element, fontSize: number, fontWeight: string,
    fontFamily: string): number {
  return getFastTextWidthWithSizeString(
      textElement, fontSize + 'pt', fontWeight, fontFamily);
}

/**
 * Gets the width of a text element using a faster method than `getTextWidth`.
 * This method requires that we know the text element's font family and size in
 * advance. Similar to `getTextWidth`, we cache the width we compute.
 * This method is similar to ``getFastTextWidth`` but expects the font size
 * parameter to be a string.
 * @param textElement An SVG 'text' element.
 * @param fontSize The font size to use.
 * @param fontWeight The font weight to use.
 * @param fontFamily The font family to use.
 * @return Width of element.
 * @alias Blockly.utils.dom.getFastTextWidthWithSizeString
 */
export function getFastTextWidthWithSizeString(
    textElement: Element, fontSize: string, fontWeight: string,
    fontFamily: string): number {
  const text = textElement.textContent;
  // AnyDuringMigration because:  Property 'baseVal' does not exist on type
  // 'string'.
  const key =
      text + '\n' + (textElement.className as AnyDuringMigration).baseVal;
  let width;

  // Return the cached width if it exists.
  if (cacheWidths) {
    width = cacheWidths[key];
    if (width) {
      return width;
    }
  }

  if (!canvasContext) {
    // Inject the canvas element used for computing text widths.
    const computeCanvas = (document.createElement('canvas'));
    computeCanvas.className = 'blocklyComputeCanvas';
    document.body.appendChild(computeCanvas);

    // Initialize the HTML canvas context and set the font.
    // The context font must match blocklyText's fontsize and font-family
    // set in CSS.
    canvasContext = computeCanvas.getContext('2d') as CanvasRenderingContext2D;
  }
  // Set the desired font size and family.
  canvasContext.font = fontWeight + ' ' + fontSize + ' ' + fontFamily;

  // Measure the text width using the helper canvas context.
  // AnyDuringMigration because:  Argument of type 'string | null' is not
  // assignable to parameter of type 'string'.
  width = canvasContext.measureText(text as AnyDuringMigration).width;

  // Cache the computed width and return.
  if (cacheWidths) {
    cacheWidths[key] = width;
  }
  return width;
}

/**
 * Measure a font's metrics. The height and baseline values.
 * @param text Text to measure the font dimensions of.
 * @param fontSize The font size to use.
 * @param fontWeight The font weight to use.
 * @param fontFamily The font family to use.
 * @return Font measurements.
 * @alias Blockly.utils.dom.measureFontMetrics
 */
export function measureFontMetrics(
    text: string, fontSize: string, fontWeight: string,
    fontFamily: string): {height: number, baseline: number} {
  const span = (document.createElement('span'));
  span.style.font = fontWeight + ' ' + fontSize + ' ' + fontFamily;
  span.textContent = text;

  const block = (document.createElement('div'));
  block.style.width = '1px';
  // AnyDuringMigration because:  Type 'number' is not assignable to type
  // 'string'.
  block.style.height = 0 as AnyDuringMigration;

  const div = (document.createElement('div'));
  div.setAttribute('style', 'position: fixed; top: 0; left: 0; display: flex;');
  div.appendChild(span);
  div.appendChild(block);

  document.body.appendChild(div);
  const result = {
    height: 0,
    baseline: 0,
  };
  try {
    div.style.alignItems = 'baseline';
    result.baseline = block.offsetTop - span.offsetTop;
    div.style.alignItems = 'flex-end';
    result.height = block.offsetTop - span.offsetTop;
  } finally {
    document.body.removeChild(div);
  }
  return result;
}
