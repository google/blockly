/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a Blockly field that can be registered.
 */

'use strict';

/**
 * The interface for a Blockly field that can be registered.
 * @namespace Blockly.IRegistrableField
 */
goog.module('Blockly.IRegistrableField');

/* eslint-disable-next-line no-unused-vars */
const {Field} = goog.requireType('Blockly.Field');


/**
 * A registrable field.
 * Note: We are not using an interface here as we are interested in defining the
 * static methods of a field rather than the instance methods.
 * @typedef {{
 *     fromJson:IRegistrableField.fromJson
 * }}
 * @alias Blockly.IRegistrableField
 */
const IRegistrableField = {};

/**
 * @typedef {function(!Object): Field}
 */
IRegistrableField.fromJson;

exports.IRegistrableField = IRegistrableField;
