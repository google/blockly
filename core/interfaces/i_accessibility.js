/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview AST Node and keyboard navigation interfaces.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.IASTNodeLocation');
goog.provide('Blockly.IASTNodeLocationSvg');
goog.provide('Blockly.IASTNodeLocationWithBlock');
goog.provide('Blockly.IBlocklyActionable');

/**
 * An AST node location interface.
 * @interface
 */
Blockly.IASTNodeLocation = function() {};

/**
 * An AST node location SVG interface.
 * @interface
 * @extends {Blockly.IASTNodeLocation}
 */
Blockly.IASTNodeLocationSvg = function() {};

/**
 * Add the marker svg to this node's svg group.
 * @param {SVGElement} markerSvg The svg root of the marker to be added to the
 *     svg group.
 */
Blockly.IASTNodeLocationSvg.prototype.setMarkerSvg;

/**
 * Add the cursor svg to this node's svg group.
 * @param {SVGElement} cursorSvg The svg root of the cursor to be added to the
 *     svg group.
 */
Blockly.IASTNodeLocationSvg.prototype.setCursorSvg;

/**
 * An AST node location that has an associated block.
 * @interface
 * @extends {Blockly.IASTNodeLocation}
 */
Blockly.IASTNodeLocationWithBlock = function() {};

/**
 * Get the source block associated with this node.
 * @return {Blockly.Block} The source block.
 */
Blockly.IASTNodeLocationWithBlock.prototype.getSourceBlock;


/**
 * An interface for an object that handles Blockly actions when keyboard
 * navigation is enabled.
 * @interface
 */
Blockly.IBlocklyActionable = function() {};

/**
 * Handles the given action.
 * @param {!Blockly.Action} action The action to be handled.
 * @return {boolean} True if the action has been handled, false otherwise.
 */
Blockly.IBlocklyActionable.prototype.onBlocklyAction;
