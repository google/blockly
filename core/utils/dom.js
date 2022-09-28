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
'use strict';

/**
 * Utility methods for DOM manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @namespace Blockly.utils.dom
 */
goog.module('Blockly.utils.dom');

const userAgent = goog.require('Blockly.utils.userAgent');
/* eslint-disable-next-line no-unused-vars */
const {Svg} = goog.requireType('Blockly.utils.Svg');


/**
 * Required name space for SVG elements.
 * @const
 * @alias Blockly.utils.dom.SVG_NS
 */
const SVG_NS = 'http://www.w3.org/2000/svg';
exports.SVG_NS = SVG_NS;

/**
 * Required name space for HTML elements.
 * @const
 * @alias Blockly.utils.dom.HTML_NS
 */
const HTML_NS = 'http://www.w3.org/1999/xhtml';
exports.HTML_NS = HTML_NS;

/**
 * Required name space for XLINK elements.
 * @const
 * @alias Blockly.utils.dom.XLINK_NS
 */
const XLINK_NS = 'http://www.w3.org/1999/xlink';
exports.XLINK_NS = XLINK_NS;

/**
 * Node type constants.
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
 * @enum {number}
 * @alias Blockly.utils.dom.NodeType
 */
const NodeType = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  DOCUMENT_POSITION_CONTAINED_BY: 16,
};
exports.NodeType = NodeType;

/**
 * Temporary cache of text widths.
 * @type {Object}
 * @private
 */
let cacheWidths = null;

/**
 * Number of current references to cache.
 * @type {number}
 * @private
 */
let cacheReference = 0;

/**
 * A HTML canvas context used for computing text width.
 * @type {CanvasRenderingContext2D}
 * @private
 */
let canvasContext = null;

/**
 * Helper method for creating SVG elements.
 * @param {string|Svg<T>} name Element's tag name.
 * @param {!Object} attrs Dictionary of attribute names and values.
 * @param {Element=} opt_parent Optional parent on which to append the element.
 * @return {T} Newly created SVG element.  The return type is {!SVGElement} if
 *     name is a string or a more specific type if it a member of Svg.
 * @template T
 * @alias Blockly.utils.dom.createSvgElement
 */
const createSvgElement = function(name, attrs, opt_parent) {
  const e = /** @type {T} */
      (document.createElementNS(SVG_NS, String(name)));
  for (const key in attrs) {
    e.setAttribute(key, attrs[key]);
  }
  // IE defines a unique attribute "runtimeStyle", it is NOT applied to
  // elements created with createElementNS. However, Closure checks for IE
  // and assumes the presence of the attribute and crashes.
  if (document.body.runtimeStyle) {  // Indicates presence of IE-only attr.
    e.runtimeStyle = e.currentStyle = e.style;
  }
  if (opt_parent) {
    opt_parent.appendChild(e);
  }
  return e;
};
exports.createSvgElement = createSvgElement;

/**
 * Add a CSS class to a element.
 * Similar to Closure's goog.dom.classes.add, except it handles SVG elements.
 * @param {!Element} element DOM element to add class to.
 * @param {string} className Name of class to add.
 * @return {boolean} True if class was added, false if already present.
 * @alias Blockly.utils.dom.addClass
 */
const addClass = function(element, className) {
  let classes = element.getAttribute('class') || '';
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') !== -1) {
    return false;
  }
  if (classes) {
    classes += ' ';
  }
  element.setAttribute('class', classes + className);
  return true;
};
exports.addClass = addClass;

/**
 * Removes multiple calsses from an element.
 * @param {!Element} element DOM element to remove classes from.
 * @param {string} classNames A string of one or multiple class names for an
 *    element.
 * @alias Blockly.utils.dom.removeClasses
 */
const removeClasses = function(element, classNames) {
  const classList = classNames.split(' ');
  for (let i = 0; i < classList.length; i++) {
    removeClass(element, classList[i]);
  }
};
exports.removeClasses = removeClasses;

/**
 * Remove a CSS class from a element.
 * Similar to Closure's goog.dom.classes.remove, except it handles SVG elements.
 * @param {!Element} element DOM element to remove class from.
 * @param {string} className Name of class to remove.
 * @return {boolean} True if class was removed, false if never present.
 * @alias Blockly.utils.dom.removeClass
 */
const removeClass = function(element, className) {
  const classes = element.getAttribute('class');
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') === -1) {
    return false;
  }
  const classList = classes.split(/\s+/);
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
};
exports.removeClass = removeClass;

/**
 * Checks if an element has the specified CSS class.
 * Similar to Closure's goog.dom.classes.has, except it handles SVG elements.
 * @param {!Element} element DOM element to check.
 * @param {string} className Name of class to check.
 * @return {boolean} True if class exists, false otherwise.
 * @alias Blockly.utils.dom.hasClass
 */
const hasClass = function(element, className) {
  const classes = element.getAttribute('class');
  return (' ' + classes + ' ').indexOf(' ' + className + ' ') !== -1;
};
exports.hasClass = hasClass;

/**
 * Removes a node from its parent. No-op if not attached to a parent.
 * @param {?Node} node The node to remove.
 * @return {?Node} The node removed if removed; else, null.
 * @alias Blockly.utils.dom.removeNode
 */
// Copied from Closure goog.dom.removeNode
const removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null;
};
exports.removeNode = removeNode;

/**
 * Insert a node after a reference node.
 * Contrast with node.insertBefore function.
 * @param {!Element} newNode New element to insert.
 * @param {!Element} refNode Existing element to precede new node.
 * @alias Blockly.utils.dom.insertAfter
 */
const insertAfter = function(newNode, refNode) {
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
};
exports.insertAfter = insertAfter;

/**
 * Whether a node contains another node.
 * @param {!Node} parent The node that should contain the other node.
 * @param {!Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendant node.
 * @alias Blockly.utils.dom.containsNode
 */
const containsNode = function(parent, descendant) {
  return !!(
      parent.compareDocumentPosition(descendant) &
      NodeType.DOCUMENT_POSITION_CONTAINED_BY);
};
exports.containsNode = containsNode;

/**
 * Sets the CSS transform property on an element. This function sets the
 * non-vendor-prefixed and vendor-prefixed versions for backwards compatibility
 * with older browsers. See https://caniuse.com/#feat=transforms2d
 * @param {!Element} element Element to which the CSS transform will be applied.
 * @param {string} transform The value of the CSS `transform` property.
 * @alias Blockly.utils.dom.setCssTransform
 */
const setCssTransform = function(element, transform) {
  element.style['transform'] = transform;
  element.style['-webkit-transform'] = transform;
};
exports.setCssTransform = setCssTransform;

/**
 * Start caching text widths. Every call to this function MUST also call
 * stopTextWidthCache. Caches must not survive between execution threads.
 * @alias Blockly.utils.dom.startTextWidthCache
 */
const startTextWidthCache = function() {
  cacheReference++;
  if (!cacheWidths) {
    cacheWidths = Object.create(null);
  }
};
exports.startTextWidthCache = startTextWidthCache;

/**
 * Stop caching field widths. Unless caching was already on when the
 * corresponding call to startTextWidthCache was made.
 * @alias Blockly.utils.dom.stopTextWidthCache
 */
const stopTextWidthCache = function() {
  cacheReference--;
  if (!cacheReference) {
    cacheWidths = null;
  }
};
exports.stopTextWidthCache = stopTextWidthCache;

/**
 * Gets the width of a text element, caching it in the process.
 * @param {!Element} textElement An SVG 'text' element.
 * @return {number} Width of element.
 * @alias Blockly.utils.dom.getTextWidth
 */
const getTextWidth = function(textElement) {
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
    if (userAgent.IE || userAgent.EDGE) {
      width = textElement.getBBox().width;
    } else {
      width = textElement.getComputedTextLength();
    }
  } catch (e) {
    // In other cases where we fail to get the computed text. Instead, use an
    // approximation and do not cache the result. At some later point in time
    // when the block is inserted into the visible DOM, this method will be
    // called again and, at that point in time, will not throw an exception.
    return textElement.textContent.length * 8;
  }

  // Cache the computed width and return.
  if (cacheWidths) {
    cacheWidths[key] = width;
  }
  return width;
};
exports.getTextWidth = getTextWidth;

/**
 * Gets the width of a text element using a faster method than `getTextWidth`.
 * This method requires that we know the text element's font family and size in
 * advance. Similar to `getTextWidth`, we cache the width we compute.
 * @param {!Element} textElement An SVG 'text' element.
 * @param {number} fontSize The font size to use.
 * @param {string} fontWeight The font weight to use.
 * @param {string} fontFamily The font family to use.
 * @return {number} Width of element.
 * @alias Blockly.utils.dom.getFastTextWidth
 */
const getFastTextWidth = function(
    textElement, fontSize, fontWeight, fontFamily) {
  return getFastTextWidthWithSizeString(
      textElement, fontSize + 'pt', fontWeight, fontFamily);
};
exports.getFastTextWidth = getFastTextWidth;

/**
 * Gets the width of a text element using a faster method than `getTextWidth`.
 * This method requires that we know the text element's font family and size in
 * advance. Similar to `getTextWidth`, we cache the width we compute.
 * This method is similar to ``getFastTextWidth`` but expects the font size
 * parameter to be a string.
 * @param {!Element} textElement An SVG 'text' element.
 * @param {string} fontSize The font size to use.
 * @param {string} fontWeight The font weight to use.
 * @param {string} fontFamily The font family to use.
 * @return {number} Width of element.
 * @alias Blockly.utils.dom.getFastTextWidthWithSizeString
 */
const getFastTextWidthWithSizeString = function(
    textElement, fontSize, fontWeight, fontFamily) {
  const text = textElement.textContent;
  const key = text + '\n' + textElement.className.baseVal;
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
    const computeCanvas = document.createElement('canvas');
    computeCanvas.className = 'blocklyComputeCanvas';
    document.body.appendChild(computeCanvas);

    // Initialize the HTML canvas context and set the font.
    // The context font must match blocklyText's fontsize and font-family
    // set in CSS.
    canvasContext = computeCanvas.getContext('2d');
  }
  // Set the desired font size and family.
  canvasContext.font = fontWeight + ' ' + fontSize + ' ' + fontFamily;

  // Measure the text width using the helper canvas context.
  width = canvasContext.measureText(text).width;

  // Cache the computed width and return.
  if (cacheWidths) {
    cacheWidths[key] = width;
  }
  return width;
};
exports.getFastTextWidthWithSizeString = getFastTextWidthWithSizeString;

/**
 * Measure a font's metrics. The height and baseline values.
 * @param {string} text Text to measure the font dimensions of.
 * @param {string} fontSize The font size to use.
 * @param {string} fontWeight The font weight to use.
 * @param {string} fontFamily The font family to use.
 * @return {{height: number, baseline: number}} Font measurements.
 * @alias Blockly.utils.dom.measureFontMetrics
 */
const measureFontMetrics = function(text, fontSize, fontWeight, fontFamily) {
  const span = document.createElement('span');
  span.style.font = fontWeight + ' ' + fontSize + ' ' + fontFamily;
  span.textContent = text;

  const block = /** @type {!HTMLDivElement} */ (document.createElement('div'));
  block.style.width = '1px';
  block.style.height = 0;

  const div = /** @type {!HTMLDivElement} */ (document.createElement('div'));
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
};
exports.measureFontMetrics = measureFontMetrics;
