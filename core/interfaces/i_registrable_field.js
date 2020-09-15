/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a Blockly field that can be registered.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.IRegistrableField');

goog.requireType('Blockly.Field');

/**
 * A registrable field.
 * @typedef {{
 *     fromJson:Blockly.IRegistrableField.fromJson
 * }}
 */
Blockly.IRegistrableField;

/**
 * A registrable field.
 * @typedef {function(!Object): Blockly.Field}
 */
Blockly.IRegistrableField.fromJson;
