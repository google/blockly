/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly constants.
 */
'use strict';

/**
 * Blockly constants.
 * @namespace Blockly.constants
 */
goog.module('Blockly.constants');


/**
 * Enum for alignment of inputs.
 * @enum {number}
 * @alias Blockly.constants.ALIGN
 */
const ALIGN = {
  LEFT: -1,
  CENTRE: 0,
  RIGHT: 1,
};
exports.ALIGN = ALIGN;

/**
 * The language-neutral ID given to the collapsed input.
 * @const {string}
 * @alias Blockly.constants.COLLAPSED_INPUT_NAME
 */
const COLLAPSED_INPUT_NAME = '_TEMP_COLLAPSED_INPUT';
exports.COLLAPSED_INPUT_NAME = COLLAPSED_INPUT_NAME;

/**
 * The language-neutral ID given to the collapsed field.
 * @const {string}
 * @alias Blockly.constants.COLLAPSED_FIELD_NAME
 */
const COLLAPSED_FIELD_NAME = '_TEMP_COLLAPSED_FIELD';
exports.COLLAPSED_FIELD_NAME = COLLAPSED_FIELD_NAME;
