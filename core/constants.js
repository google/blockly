/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly constants.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.module('Blockly.constants');
goog.module.declareLegacyNamespace();


/**
 * Enum for alignment of inputs.
 * @enum {number}
 */
const ALIGN = {
  LEFT: -1,
  CENTRE: 0,
  RIGHT: 1
};
exports.ALIGN = ALIGN;

/**
 * The language-neutral ID given to the collapsed input.
 * @const {string}
 */
const COLLAPSED_INPUT_NAME = '_TEMP_COLLAPSED_INPUT';
exports.COLLAPSED_INPUT_NAME = COLLAPSED_INPUT_NAME;

/**
 * The language-neutral ID given to the collapsed field.
 * @const {string}
 */
const COLLAPSED_FIELD_NAME = '_TEMP_COLLAPSED_FIELD';
exports.COLLAPSED_FIELD_NAME = COLLAPSED_FIELD_NAME;
