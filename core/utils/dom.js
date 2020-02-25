/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for DOM manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.utils.dom
 * @namespace
 */
goog.provide('Blockly.utils.dom');

goog.require('Blockly.utils.userAgent');


/**
 * Required name space for SVG elements.
 * @const
 */
Blockly.utils.dom.SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Required name space for HTML elements.
 * @const
 */
Blockly.utils.dom.HTML_NS = 'http://www.w3.org/1999/xhtml';

/**
 * Required name space for XLINK elements.
 * @const
 */
Blockly.utils.dom.XLINK_NS = 'http://www.w3.org/1999/xlink';

/**
 * Node type constants.
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
 * @enum {number}
 */
Blockly.utils.dom.Node = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  DOCUMENT_POSITION_CONTAINED_BY: 16
};

/**
 * Temporary cache of text widths.
 * @type {Object}
 * @private
 */
Blockly.utils.dom.cacheWidths_ = null;

/**
 * Number of current references to cache.
 * @type {number}
 * @private
 */
Blockly.utils.dom.cacheReference_ = 0;

/**
 * A HTML canvas context used for computing text width.
 * @type {CanvasRenderingContext2D}
 * @private
 */
Blockly.utils.dom.canvasContext_ = null;

/**
 * Helper method for creating SVG elements.
 * @param {string} name Element's tag name.
 * @param {!Object} attrs Dictionary of attribute names and values.
 * @param {Element} parent Optional parent on which to append the element.
 * @return {!SVGElement} Newly created SVG element.
 */
Blockly.utils.dom.createSvgElement = function(name, attrs, parent) {
  var e = /** @type {!SVGElement} */
      (document.createElementNS(Blockly.utils.dom.SVG_NS, name));
  for (var key in attrs) {
    e.setAttribute(key, attrs[key]);
  }
  // IE defines a unique attribute "runtimeStyle", it is NOT applied to
  // elements created with createElementNS. However, Closure checks for IE
  // and assumes the presence of the attribute and crashes.
  if (document.body.runtimeStyle) {  // Indicates presence of IE-only attr.
    e.runtimeStyle = e.currentStyle = e.style;
  }
  if (parent) {
    parent.appendChild(e);
  }
  return e;
};

/**
 * Add a CSS class to a element.
 * Similar to Closure's goog.dom.classes.add, except it handles SVG elements.
 * @param {!Element} element DOM element to add class to.
 * @param {string} className Name of class to add.
 * @return {boolean} True if class was added, false if already present.
 */
Blockly.utils.dom.addClass = function(element, className) {
  var classes = element.getAttribute('class') || '';
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') != -1) {
    return false;
  }
  if (classes) {
    classes += ' ';
  }
  element.setAttribute('class', classes + className);
  return true;
};

/**
 * Remove a CSS class from a element.
 * Similar to Closure's goog.dom.classes.remove, except it handles SVG elements.
 * @param {!Element} element DOM element to remove class from.
 * @param {string} className Name of class to remove.
 * @return {boolean} True if class was removed, false if never present.
 */
Blockly.utils.dom.removeClass = function(element, className) {
  var classes = element.getAttribute('class');
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') == -1) {
    return false;
  }
  var classList = classes.split(/\s+/);
  for (var i = 0; i < classList.length; i++) {
    if (!classList[i] || classList[i] == className) {
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

/**
 * Checks if an element has the specified CSS class.
 * Similar to Closure's goog.dom.classes.has, except it handles SVG elements.
 * @param {!Element} element DOM element to check.
 * @param {string} className Name of class to check.
 * @return {boolean} True if class exists, false otherwise.
 */
Blockly.utils.dom.hasClass = function(element, className) {
  var classes = element.getAttribute('class');
  return (' ' + classes + ' ').indexOf(' ' + className + ' ') != -1;
};

/**
 * Removes a node from its parent. No-op if not attached to a parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
// Copied from Closure goog.dom.removeNode
Blockly.utils.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null;
};

/**
 * Insert a node after a reference node.
 * Contrast with node.insertBefore function.
 * @param {!Element} newNode New element to insert.
 * @param {!Element} refNode Existing element to precede new node.
 */
Blockly.utils.dom.insertAfter = function(newNode, refNode) {
  var siblingNode = refNode.nextSibling;
  var parentNode = refNode.parentNode;
  if (!parentNode) {
    throw Error('Reference node has no parent.');
  }
  if (siblingNode) {
    parentNode.insertBefore(newNode, siblingNode);
  } else {
    parentNode.appendChild(newNode);
  }
};

/**
 * Whether a node contains another node.
 * @param {!Node} parent The node that should contain the other node.
 * @param {!Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendant node.
 */
Blockly.utils.dom.containsNode = function(parent, descendant) {
  return !!(parent.compareDocumentPosition(descendant) &
            Blockly.utils.dom.Node.DOCUMENT_POSITION_CONTAINED_BY);
};

/**
 * Sets the CSS transform property on an element. This function sets the
 * non-vendor-prefixed and vendor-prefixed versions for backwards compatibility
 * with older browsers. See https://caniuse.com/#feat=transforms2d
 * @param {!Element} element Element to which the CSS transform will be applied.
 * @param {string} transform The value of the CSS `transform` property.
 */
Blockly.utils.dom.setCssTransform = function(element, transform) {
  element.style['transform'] = transform;
  element.style['-webkit-transform'] = transform;
};

/**
 * Start caching text widths. Every call to this function MUST also call
 * stopTextWidthCache. Caches must not survive between execution threads.
 */
Blockly.utils.dom.startTextWidthCache = function() {
  Blockly.utils.dom.cacheReference_++;
  if (!Blockly.utils.dom.cacheWidths_) {
    Blockly.utils.dom.cacheWidths_ = {};
  }
};

/**
 * Stop caching field widths. Unless caching was already on when the
 * corresponding call to startTextWidthCache was made.
 */
Blockly.utils.dom.stopTextWidthCache = function() {
  Blockly.utils.dom.cacheReference_--;
  if (!Blockly.utils.dom.cacheReference_) {
    Blockly.utils.dom.cacheWidths_ = null;
  }
};

/**
 * Gets the width of a text element, caching it in the process.
 * @param {!Element} textElement An SVG 'text' element.
 * @return {number} Width of element.
 */
Blockly.utils.dom.getTextWidth = function(textElement) {
  var key = textElement.textContent + '\n' + textElement.className.baseVal;
  var width;

  // Return the cached width if it exists.
  if (Blockly.utils.dom.cacheWidths_) {
    width = Blockly.utils.dom.cacheWidths_[key];
    if (width) {
      return width;
    }
  }

  // Attempt to compute fetch the width of the SVG text element.
  try {
    if (Blockly.utils.userAgent.IE || Blockly.utils.userAgent.EDGE) {
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
  if (Blockly.utils.dom.cacheWidths_) {
    Blockly.utils.dom.cacheWidths_[key] = width;
  }
  return width;
};

/**
 * Gets the width of a text element using a faster method than `getTextWidth`.
 * This method requires that we know the text element's font family and size in
 * advance. Similar to `getTextWidth`, we cache the width we compute.
 * @param {!Element} textElement An SVG 'text' element.
 * @param {number} fontSize The font size to use.
 * @param {string} fontWeight The font weight to use.
 * @param {string} fontFamily The font family to use.
 * @return {number} Width of element.
 */
Blockly.utils.dom.getFastTextWidth = function(textElement,
    fontSize, fontWeight, fontFamily) {
  return Blockly.utils.dom.getFastTextWidthWithSizeString(textElement,
      fontSize + 'pt', fontWeight, fontFamily);
};

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
 */
Blockly.utils.dom.getFastTextWidthWithSizeString = function(textElement,
    fontSize, fontWeight, fontFamily) {
  var text = textElement.textContent;
  var key = text + '\n' + textElement.className.baseVal;
  var width;

  // Return the cached width if it exists.
  if (Blockly.utils.dom.cacheWidths_) {
    width = Blockly.utils.dom.cacheWidths_[key];
    if (width) {
      return width;
    }
  }

  if (!Blockly.utils.dom.canvasContext_) {
    // Inject the canvas element used for computing text widths.
    var computeCanvas = document.createElement('canvas');
    computeCanvas.className = 'blocklyComputeCanvas';
    document.body.appendChild(computeCanvas);

    // Initialize the HTML canvas context and set the font.
    // The context font must match blocklyText's fontsize and font-family
    // set in CSS.
    Blockly.utils.dom.canvasContext_ = computeCanvas.getContext('2d');
  }
  // Set the desired font size and family.
  Blockly.utils.dom.canvasContext_.font =
      fontWeight + ' ' + fontSize + ' ' + fontFamily;

  // Measure the text width using the helper canvas context.
  width = Blockly.utils.dom.canvasContext_.measureText(text).width;

  // Cache the computed width and return.
  if (Blockly.utils.dom.cacheWidths_) {
    Blockly.utils.dom.cacheWidths_[key] = width;
  }
  return width;
};

/**
 * Measure a font's metrics. The height and baseline values.
 * @param {string} text Text to measure the font dimensions of.
 * @param {string} fontSize The font size to use.
 * @param {string} fontWeight The font weight to use.
 * @param {string} fontFamily The font family to use.
 * @return {{height: number, baseline: number}} Font measurements.
 */
Blockly.utils.dom.measureFontMetrics = function(text, fontSize, fontWeight,
    fontFamily) {

  var span = document.createElement('span');
  span.style.font = fontWeight + ' ' + fontSize + ' ' + fontFamily;
  span.textContent = text;

  var block = document.createElement('div');
  block.style.width = '1px';
  block.style.height = '0px';

  var div = document.createElement('div');
  div.setAttribute('style', 'position: fixed; top: 0; left: 0; display: flex;');
  div.appendChild(span);
  div.appendChild(block);

  document.body.appendChild(div);
  try {
    var result = {};
    div.style.alignItems = 'baseline';
    result.baseline = block.offsetTop - span.offsetTop;
    div.style.alignItems = 'flex-end';
    result.height = block.offsetTop - span.offsetTop;
  } finally {
    document.body.removeChild(div);
  }
  return result;
};
