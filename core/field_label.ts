/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Non-editable, non-serializable text field.  Used for titles,
 *    labels, etc.
 */

/**
 * Non-editable, non-serializable text field.  Used for titles,
 *    labels, etc.
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.FieldLabel');

import {Config as BaseFieldConfig, Field} from './field.js';
import * as fieldRegistry from './field_registry.js';
import * as dom from './utils/dom.js';
import * as parsing from './utils/parsing.js';
import type {Sentinel} from './utils/sentinel.js';


/**
 * Class for a non-editable, non-serializable text field.
 * @alias Blockly.FieldLabel
 */
export class FieldLabel extends Field {
  /** The html class name to use for this field. */
  private class_: string|null = null;

  /**
   * Editable fields usually show some sort of UI indicating they are
   * editable. This field should not.
   */
  override EDITABLE = false;

  /**
   * @param opt_value The initial value of the field. Should cast to a string.
   *     Defaults to an empty string if null or undefined. Also accepts
   *     Field.SKIP_SETUP if you wish to skip setup (only used by subclasses
   *     that want to handle configuration and setting the field value after
   *     their own constructors have run).
   * @param opt_class Optional CSS class for the field's text.
   * @param opt_config A map of options used to configure the field.
   *    See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/label#creation}
   * for a list of properties this parameter supports.
   */
  constructor(
      opt_value?: string|Sentinel, opt_class?: string,
      opt_config?: Config) {
    super(Field.SKIP_SETUP);

    if (opt_value === Field.SKIP_SETUP) {
      return;
    }
    if (opt_config) {
      this.configure_(opt_config);
    } else {
      this.class_ = opt_class || null;
    }
    this.setValue(opt_value);
  }

  override configure_(config: Config) {
    super.configure_(config);
    if (config.class) this.class_ = config.class;
  }

  /**
   * Create block UI for this label.
   * @internal
   */
  override initView() {
    this.createTextElement_();
    if (this.class_) {
      dom.addClass((this.textElement_), this.class_);
    }
  }

  /**
   * Ensure that the input value casts to a valid string.
   * @param opt_newValue The input value.
   * @return A valid string, or null if invalid.
   */
  protected override doClassValidation_(opt_newValue?: AnyDuringMigration):
      string|null {
    if (opt_newValue === null || opt_newValue === undefined) {
      return null;
    }
    return String(opt_newValue);
  }

  /**
   * Set the CSS class applied to the field's textElement_.
   * @param cssClass The new CSS class name, or null to remove.
   */
  setClass(cssClass: string|null) {
    if (this.textElement_) {
      // This check isn't necessary, but it's faster than letting removeClass
      // figure it out.
      if (this.class_) {
        dom.removeClass(this.textElement_, this.class_);
      }
      if (cssClass) {
        dom.addClass(this.textElement_, cssClass);
      }
    }
    this.class_ = cssClass;
  }

  /**
   * Construct a FieldLabel from a JSON arg object,
   * dereferencing any string table references.
   * @param options A JSON object with options (text, and class).
   * @return The new field instance.
   * @nocollapse
   * @internal
   */
  static fromJson(options: FromJsonConfig): FieldLabel {
    const text = parsing.replaceMessageReferences(options.text);
    // `this` might be a subclass of FieldLabel if that class doesn't override
    // the static fromJson method.
    return new this(text, undefined, options);
  }
}

fieldRegistry.register('field_label', FieldLabel);

(FieldLabel.prototype as AnyDuringMigration).DEFAULT_VALUE = '';

export interface Config extends BaseFieldConfig {
  class?: string;
}

export interface FromJsonConfig extends Config {
  text?: string;
}
