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
goog.provide('Blockly.IKeyboardAccessible');

goog.requireType('Blockly.Block');
goog.requireType('Blockly.ShortcutRegistry');


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
 * Add the marker SVG to this node's SVG group.
 * @param {SVGElement} markerSvg The SVG root of the marker to be added to the
 *     SVG group.
 */
Blockly.IASTNodeLocationSvg.prototype.setMarkerSvg;

/**
 * Add the cursor SVG to this node's SVG group.
 * @param {SVGElement} cursorSvg The SVG root of the cursor to be added to the
 *     SVG group.
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
 * An interface for an object that handles keyboard shortcuts.
 * @interface
 */
Blockly.IKeyboardAccessible = function() {};

/**
 * Handles the given keyboard shortcut.
 * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} shortcut The shortcut to be handled.
 * @return {boolean} True if the shortcut has been handled, false otherwise.
 */
Blockly.IKeyboardAccessible.prototype.onShortcut;
