/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
