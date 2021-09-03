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

/* eslint-disable-next-line no-unused-vars */
const ISelectable = goog.requireType('Blockly.ISelectable');
/* eslint-disable-next-line no-unused-vars */
const WorkspaceSvg = goog.requireType('Blockly.WorkspaceSvg');


/**
 * @extends {ISelectable}
 * @interface
 */
const ICopyable = function() {};

/**
 * Encode for copying.
 * @return {?ICopyable.CopyData} Copy metadata.
 * @package
 */
ICopyable.prototype.toCopyData;

/**
 * Copy Metadata.
 * @typedef {{
 *            saveInfo:(!Object|!Element),
 *            source:WorkspaceSvg,
 *            typeCounts:?Object
 *          }}
 */
ICopyable.CopyData;

exports = ICopyable;
