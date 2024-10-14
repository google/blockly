
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper function for warning developers about deprecations.
 * This method is not specific to Blockly.
 */
'use strict';

/**
 * Helper function for warning developers about deprecations.
 * This method is not specific to Blockly.
 * @namespace Blockly.utils.deprecation
 */
goog.module('Blockly.utils.deprecation');


/**
 * Warn developers that a function or property is deprecated.
 * @param {string} name The name of the function or property.
 * @param {string} deprecationDate The date of deprecation.
 *     Prefer 'month yyyy' or 'quarter yyyy' format.
 * @param {string} deletionDate The date of deletion, in the same format as the
 *     deprecation date.
 * @param {string=} opt_use The name of a function or property to use instead,
 *     if any.
 * @alias Blockly.utils.deprecation.warn
 * @package
 */
const warn = function(name, deprecationDate, deletionDate, opt_use) {
  let msg = name + ' was deprecated on ' + deprecationDate +
      ' and will be deleted on ' + deletionDate + '.';
  if (opt_use) {
    msg += '\nUse ' + opt_use + ' instead.';
  }
  console.warn(msg);
};
exports.warn = warn;
