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

export type FieldTextInputValidator = FieldInputValidator<string>;

export class FieldTextInput extends FieldInput<string> {
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

// TODO DISCUSSION: Should this be `field_textinput`?
fieldRegistry.register('field_input', FieldTextInput);

(FieldTextInput.prototype as AnyDuringMigration).DEFAULT_VALUE = '';

/**
 * fromJson config options for the text input field.
 */
export interface FieldTextInputFromJsonConfig extends FieldInputConfig {
  text?: string;
}

export {FieldInputConfig as FieldTextInputConfig};
