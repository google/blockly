/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Checkbox field.  Checked or not checked.
 */

/**
 * Checkbox field.  Checked or not checked.
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.FieldCheckbox');

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_block_change.js';

import {Config as BaseFieldConfig, Field} from './field.js';
import * as fieldRegistry from './field_registry.js';
import * as dom from './utils/dom.js';
import type {Sentinel} from './utils/sentinel.js';


/**
 * Class for a checkbox field.
 * @alias Blockly.FieldCheckbox
 */
export class FieldCheckbox extends Field {
  /** Default character for the checkmark. */
  static readonly CHECK_CHAR = '\u2713';
  private checkChar_: string;

  /**
   * Serializable fields are saved by the serializer, non-serializable fields
   * are not. Editable fields should also be serializable.
   */
  override SERIALIZABLE = true;

  /**
   * Mouse cursor style when over the hotspot that initiates editability.
   */
  override CURSOR = 'default';
  override value_: AnyDuringMigration;

  /**
   * @param opt_value The initial value of the field. Should either be 'TRUE',
   *     'FALSE' or a boolean. Defaults to 'FALSE'. Also accepts
   *     Field.SKIP_SETUP if you wish to skip setup (only used by subclasses
   *     that want to handle configuration and setting the field value after
   *     their own constructors have run).
   * @param opt_validator  A function that is called to validate changes to the
   *     field's value. Takes in a value ('TRUE' or 'FALSE') & returns a
   *     validated value ('TRUE' or 'FALSE'), or null to abort the change.
   * @param opt_config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/checkbox#creation}
   * for a list of properties this parameter supports.
   */
  constructor(
      opt_value?: string|boolean|Sentinel, opt_validator?: Function,
      opt_config?: Config) {
    super(Field.SKIP_SETUP);

    /**
     * Character for the check mark. Used to apply a different check mark
     * character to individual fields.
     */
    this.checkChar_ = FieldCheckbox.CHECK_CHAR;

    if (opt_value === Field.SKIP_SETUP) {
      return;
    }
    if (opt_config) {
      this.configure_(opt_config);
    }
    this.setValue(opt_value);
    if (opt_validator) {
      this.setValidator(opt_validator);
    }
  }

  /**
   * Configure the field based on the given map of options.
   * @param config A map of options to configure the field based on.
   */
  protected override configure_(config: Config) {
    super.configure_(config);
    if (config.checkCharacter) this.checkChar_ = config.checkCharacter;
  }

  /**
   * Saves this field's value.
   * @return The boolean value held by this field.
   * @internal
   */
  override saveState(): AnyDuringMigration {
    const legacyState = this.saveLegacyState(FieldCheckbox);
    if (legacyState !== null) {
      return legacyState;
    }
    return this.getValueBoolean();
  }

  /**
   * Create the block UI for this checkbox.
   * @internal
   */
  override initView() {
    super.initView();

    dom.addClass((this.textElement_), 'blocklyCheckbox');
    this.textElement_.style.display = this.value_ ? 'block' : 'none';
  }

  override render_() {
    if (this.textContent_) {
      this.textContent_.nodeValue = this.getDisplayText_();
    }
    this.updateSize_(this.getConstants()!.FIELD_CHECKBOX_X_OFFSET);
  }

  override getDisplayText_() {
    return this.checkChar_;
  }

  /**
   * Set the character used for the check mark.
   * @param character The character to use for the check mark, or null to use
   *     the default.
   */
  setCheckCharacter(character: string|null) {
    this.checkChar_ = character || FieldCheckbox.CHECK_CHAR;
    this.forceRerender();
  }

  /** Toggle the state of the checkbox on click. */
  protected override showEditor_() {
    this.setValue(!this.value_);
  }

  /**
   * Ensure that the input value is valid ('TRUE' or 'FALSE').
   * @param opt_newValue The input value.
   * @return A valid value ('TRUE' or 'FALSE), or null if invalid.
   */
  protected override doClassValidation_(opt_newValue?: AnyDuringMigration):
      string|null {
    if (opt_newValue === true || opt_newValue === 'TRUE') {
      return 'TRUE';
    }
    if (opt_newValue === false || opt_newValue === 'FALSE') {
      return 'FALSE';
    }
    return null;
  }

  /**
   * Update the value of the field, and update the checkElement.
   * @param newValue The value to be saved. The default validator guarantees
   *     that this is a either 'TRUE' or 'FALSE'.
   */
  protected override doValueUpdate_(newValue: AnyDuringMigration) {
    this.value_ = this.convertValueToBool_(newValue);
    // Update visual.
    if (this.textElement_) {
      this.textElement_.style.display = this.value_ ? 'block' : 'none';
    }
  }

  /**
   * Get the value of this field, either 'TRUE' or 'FALSE'.
   * @return The value of this field.
   */
  override getValue(): string {
    return this.value_ ? 'TRUE' : 'FALSE';
  }

  /**
   * Get the boolean value of this field.
   * @return The boolean value of this field.
   */
  getValueBoolean(): boolean {
    return this.value_ as boolean;
  }

  /**
   * Get the text of this field. Used when the block is collapsed.
   * @return Text representing the value of this field ('true' or 'false').
   */
  override getText(): string {
    return String(this.convertValueToBool_(this.value_));
  }

  /**
   * Convert a value into a pure boolean.
   *
   * Converts 'TRUE' to true and 'FALSE' to false correctly, everything else
   * is cast to a boolean.
   * @param value The value to convert.
   * @return The converted value.
   */
  private convertValueToBool_(value: AnyDuringMigration): boolean {
    if (typeof value === 'string') {
      return value === 'TRUE';
    } else {
      return !!value;
    }
  }

  /**
   * Construct a FieldCheckbox from a JSON arg object.
   * @param options A JSON object with options (checked).
   * @return The new field instance.
   * @nocollapse
   * @internal
   */
  static fromJson(options: FromJsonConfig): FieldCheckbox {
    // `this` might be a subclass of FieldCheckbox if that class doesn't
    // 'override' the static fromJson method.
    return new this(options.checked, undefined, options);
  }
}

fieldRegistry.register('field_checkbox', FieldCheckbox);

(FieldCheckbox.prototype as AnyDuringMigration).DEFAULT_VALUE = false;

export interface Config extends BaseFieldConfig {
  checkCharacter?: string;
}

export interface FromJsonConfig extends Config {
  checked?: boolean;
}