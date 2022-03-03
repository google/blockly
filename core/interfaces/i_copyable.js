/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is copyable.
 */

'use strict';

/**
 * The interface for an object that is copyable.
 * @namespace Blockly.ICopyable
 */
goog.declareModuleId('Blockly.ICopyable');

/* eslint-disable-next-line no-unused-vars */
import {ISelectable} from './i_selectable.js';
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * @extends {ISelectable}
 * @interface
 * @alias Blockly.ICopyable
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

export {ICopyable};
