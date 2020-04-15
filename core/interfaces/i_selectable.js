/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is selectable.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.ISelectable');

goog.requireType('Blockly.WorkspaceSvg');


/** @interface */
Blockly.ISelectable = function() {};

/**
 * @type {string}
 */
Blockly.ISelectable.prototype.id;

/**
 * Get whether this is deletable or not.
 * @return {boolean} True if deletable.
 */
Blockly.ISelectable.prototype.isDeletable;

/**
 * Get whether this is movable or not.
 * @return {boolean} True if movable.
 */
Blockly.ISelectable.prototype.isMovable;

/**
 * Select this.  Highlight it visually.
 * @return {void}
 */
Blockly.ISelectable.prototype.select;

/**
 * Unselect this.  Unhighlight it visually.
 * @return {void}
 */
Blockly.ISelectable.prototype.unselect;

/**
 * Encode for copying.
 * @return {!Blockly.ISelectable.CopyData} Copy metadata.
 */
Blockly.ISelectable.prototype.toCopyData;

/**
 * Copy Metadata.
 * @typedef {{
 *            xml:!Element,
 *            source:Blockly.WorkspaceSvg,
 *            typeCounts:Object
 *          }}
 */
Blockly.ISelectable.CopyData;
