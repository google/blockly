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
 * Note: We are not using an interface here as we are interested in defining the
 * static methods of a field rather than the instance methods.
 * @typedef {{
 *     fromJson:Blockly.IRegistrableField.fromJson
 * }}
 */
Blockly.IRegistrableField;

/**
 * @typedef {function(!Object): Blockly.Field}
 */
Blockly.IRegistrableField.fromJson;
