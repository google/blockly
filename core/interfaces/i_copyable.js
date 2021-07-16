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

goog.module('Blockly.ICopyable');
goog.module.declareLegacyNamespace();

const ISelectable = goog.requireType('Blockly.ISelectable');
const WorkspaceSvg = goog.requireType('Blockly.WorkspaceSvg');


/**
 * @extends {ISelectable}
 * @interface
 */
const ICopyable = function() {};

/**
 * Encode for copying.
 * @return {?ICopyable.CopyData} Copy metadata.
 */
ICopyable.prototype.toCopyData;

/**
 * Copy Metadata.
 * @typedef {{
 *            xml:!Element,
 *            source:WorkspaceSvg,
 *            typeCounts:?Object
 *          }}
 */
ICopyable.CopyData;

exports = ICopyable;
