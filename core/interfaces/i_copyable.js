/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is copyable.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.ICopyable');

goog.requireType('Blockly.ISelectable');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * @extends {Blockly.ISelectable}
 * @interface
 */
Blockly.ICopyable = function() {};

/**
 * Encode for copying.
 * @return {?Blockly.ICopyable.CopyData} Copy metadata.
 */
Blockly.ICopyable.prototype.toCopyData;

/**
 * Copy Metadata.
 * @typedef {{
 *            xml:!Element,
 *            source:Blockly.WorkspaceSvg,
 *            typeCounts:?Object
 *          }}
 */
Blockly.ICopyable.CopyData;
