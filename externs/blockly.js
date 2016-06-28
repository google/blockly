/**
 * @fileoverview Blockly externs.
 *
 * @license Copyright 2016 Google Inc. All Rights Reserved.
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
 *
 * @author mbordihn@google.com (Markus Bordihn)
 */



/** @constructor */
var Blockly = function() {};

/**
 * Inject a Blockly editor into the specified container element (usually a div).
 * @param {!Element|string} container Containing element, or its ID,
 *     or a CSS selector.
 * @param {Object=} opt_options Optional dictionary of options.
 * @return {!Blockly.Workspace} Newly created main workspace.
 */
Blockly.inject = function(container, opt_options) {};

/**
 * Returns the main workspace.  Returns the last used main workspace (based on
 * focus).
 * @return {!Blockly.Workspace} The main workspace.
 */
Blockly.getMainWorkspace = function() {};

/**
 * Size the SVG image to completely fill its container. Call this when the view
 * actually changes sizes (e.g. on a window resize/device orientation change).
 * See Blockly.resizeSvgContents to resize the workspace when the contents
 * change (e.g. when a block is added or removed).
 * Record the height/width of the SVG image.
 * @param {!Blockly.WorkspaceSvg} workspace Any workspace in the SVG.
 */
Blockly.svgResize = function(workspace) {};

/**
 * Modify the block tree on the existing toolbox.
 * @param {Node|string} tree DOM tree of blocks, or text representation of same.
 */
Blockly.updateToolbox = function(tree) {};

/**
 * When something in Blockly's workspace changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Array.<!Array>} Opaque data that can be passed to
 *     removeChangeListener.
 * @deprecated April 2015
 */
Blockly.addChangeListener = function(func) {};

/**
 * Generate code for all blocks in the workspace to the specified language.
 * @param {Blockly.Workspace} workspace Workspace to generate code from.
 * @return {string} Generated code.
 */
Blockly.JavaScript.prototype.workspaceToCode = function(workspace) {};

/**
 * Generate code for the specified block (and attached blocks).
 * @param {Blockly.Block} block The block to generate code for.
 * @return {string|!Array} For statement blocks, the generated code.
 *     For value blocks, an array containing the generated code and an
 *     operator order value.  Returns '' if block is null.
 */
Blockly.JavaScript.prototype.blockToCode = function(block) {};

/**
 * Generate code representing the statement.  Indent the code.
 * @param {!Blockly.Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @return {string} Generated code or '' if no blocks are connected.
 */
Blockly.JavaScript.prototype.statementToCode = function(block, name) {};


/**
 * Encode a block tree as XML.
 * @param {!Blockly.Workspace} workspace The workspace containing blocks.
 * @return {!Element} XML document.
 */
Blockly.Xml.workspaceToDom = function(workspace) {};

/**
 * Converts plain text into a DOM structure.
 * Throws an error if XML doesn't parse.
 * @param {string} text Text representation.
 * @return {!Element} A tree of XML elements.
 */
Blockly.Xml.textToDom = function(text) {};

/**
 * Decode an XML DOM and create blocks on the workspace.
 * @param {!Element} xml XML DOM.
 * @param {!Blockly.Workspace} workspace The workspace.
 */
Blockly.Xml.domToWorkspace = function(xml, workspace) {};

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Element} xmlBlock XML block element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.Block} The root block created.
 */
Blockly.Xml.domToBlock = function(xmlBlock, workspace) {};

/**
 * Converts a DOM structure into properly indented text.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Text representation.
 */
Blockly.Xml.domToPrettyText = function(dom) {};


/** @type {Object} */
Blockly.Blocks = {};


/** @type {Object} */
Blockly.JavaScript = {};

/** @type {string} */
Blockly.JavaScript.ORDER_ATOMIC = '';

/**
 * Generate code representing the specified value input.
 * @param {!Blockly.Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @param {number} order The maximum binding strength (minimum order value)
 *     of any operators adjacent to "block".
 * @return {string} Generated code or '' if no blocks are connected or the
 *     specified input does not exist.
 */
Blockly.JavaScript.prototype.valueToCode = function(block, name, order) {};


/** @type {Object} */
Blockly.Xml = {};


/** @constructor */
Blockly.Workspace = {};

/**
 * Set the workspace's zoom factor.
 * @param {number} newScale Zoom factor.
 */
Blockly.Workspace.prototype.setScale = function(newScale) {};

/**
 * Center the workspace.
 */
Blockly.Workspace.prototype.scrollCenter = function() {};

/**
 * Modify the block tree on the existing toolbox.
 * @param {Node|string} tree DOM tree of blocks, or text representation of same.
 */
Blockly.Workspace.prototype.updateToolbox = function(tree) {};

/**
 * When something in this workspace changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Function} Function that can be passed to
 *     removeChangeListener.
 */
Blockly.Workspace.prototype.addChangeListener = function(func) {};
