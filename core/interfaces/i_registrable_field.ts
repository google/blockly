/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a Blockly field that can be registered.
 */


/**
 * The interface for a Blockly field that can be registered.
 * @namespace Blockly.IRegistrableField
 */
goog.declareModuleId('Blockly.IRegistrableField');

/* eslint-disable-next-line no-unused-vars */
import {Field} from '../field.js';

type fromJson = (p1: object) => Field;

/**
 * A registrable field.
 * Note: We are not using an interface here as we are interested in defining the
 * static methods of a field rather than the instance methods.
 * @alias Blockly.IRegistrableField
 */
export interface IRegistrableField {
  fromJson: fromJson;
}
