/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Text input field.
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.FieldTextInput');

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_block_change.js';

import {FieldInput, FieldInputConfig, FieldInputValidator} from './field_input.js';
import * as fieldRegistry from './field_registry.js';
import * as parsing from './utils/parsing.js';
import type {Sentinel} from './utils/sentinel.js';

export type FieldTextInputValidator = FieldInputValidator<string>;

export class FieldTextInput extends FieldInput<string> {
  /**
   * @param opt_value The initial value of the field. Should cast to a string.
   *     Defaults to an empty string if null or undefined. Also accepts
   *     Field.SKIP_SETUP if you wish to skip setup (only used by subclasses
   *     that want to handle configuration and setting the field value after
   *     their own constructors have run).
   * @param opt_validator A function that is called to validate changes to the
   *     field's value. Takes in a string & returns a validated string, or null
   *     to abort the change.
   * @param opt_config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/text-input#creation}
   * for a list of properties this parameter supports.
   */
  constructor(
      opt_value?: string|Sentinel, opt_validator?: FieldTextInputValidator|null,
      opt_config?: FieldInputConfig) {
    super(opt_value, opt_validator, opt_config);
  }

  /**
   * Construct a FieldTextInput from a JSON arg object,
   * dereferencing any string table references.
   *
   * @param options A JSON object with options (text, and spellcheck).
   * @returns The new field instance.
   * @nocollapse
   * @internal
   */
  static fromJson(options: FieldTextInputFromJsonConfig): FieldTextInput {
    const text = parsing.replaceMessageReferences(options.text);
    // `this` might be a subclass of FieldTextInput if that class doesn't
    // override the static fromJson method.
    return new this(text, undefined, options);
  }
}

fieldRegistry.register('field_input', FieldTextInput);

FieldTextInput.prototype.DEFAULT_VALUE = '';

/**
 * fromJson config options for the text input field.
 */
export interface FieldTextInputFromJsonConfig extends FieldInputConfig {
  text?: string;
}

export {FieldInputConfig as FieldTextInputConfig};
