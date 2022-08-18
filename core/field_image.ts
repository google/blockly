/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Image field.  Used for pictures, icons, etc.
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.FieldImage');

import {FieldConfig, Field} from './field.js';
import * as fieldRegistry from './field_registry.js';
import * as dom from './utils/dom.js';
import * as parsing from './utils/parsing.js';
import type {Sentinel} from './utils/sentinel.js';
import {Size} from './utils/size.js';
import {Svg} from './utils/svg.js';


/**
 * Class for an image on a block.
 *
 * @alias Blockly.FieldImage
 */
export class FieldImage extends Field {
  /**
   * Vertical padding below the image, which is included in the reported height
   * of the field.
   */
  private static readonly Y_PADDING = 1;
  protected override size_: Size;
  private readonly imageHeight_: number;

  /** The function to be called when this field is clicked. */
  private clickHandler_: ((p1: FieldImage) => AnyDuringMigration)|null = null;

  /** The rendered field's image element. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'SVGImageElement'.
  private imageElement_: SVGImageElement = null as AnyDuringMigration;

  /**
   * Editable fields usually show some sort of UI indicating they are
   * editable. This field should not.
   */
  override readonly EDITABLE = false;

  /**
   * Used to tell if the field needs to be rendered the next time the block is
   * rendered. Image fields are statically sized, and only need to be
   * rendered at initialization.
   */
  protected override isDirty_ = false;

  /** Whether to flip this image in RTL. */
  private flipRtl_ = false;

  /** Alt text of this image. */
  private altText_ = '';
  override value_: AnyDuringMigration;

  /**
   * @param src The URL of the image.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   * subclasses that want to handle configuration and setting the field value
   * after their own constructors have run).
   * @param width Width of the image.
   * @param height Height of the image.
   * @param opt_alt Optional alt text for when block is collapsed.
   * @param opt_onClick Optional function to be called when the image is
   *     clicked. If opt_onClick is defined, opt_alt must also be defined.
   * @param opt_flipRtl Whether to flip the icon in RTL.
   * @param opt_config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/image#creation}
   * for a list of properties this parameter supports.
   */
  constructor(
      src: string|Sentinel, width: string|number, height: string|number,
      opt_alt?: string, opt_onClick?: (p1: FieldImage) => AnyDuringMigration,
      opt_flipRtl?: boolean, opt_config?: FieldImageConfig) {
    super(Field.SKIP_SETUP);

    const imageHeight = Number(parsing.replaceMessageReferences(height));
    const imageWidth = Number(parsing.replaceMessageReferences(width));
    if (isNaN(imageHeight) || isNaN(imageWidth)) {
      throw Error(
          'Height and width values of an image field must cast to' +
          ' numbers.');
    }
    if (imageHeight <= 0 || imageWidth <= 0) {
      throw Error(
          'Height and width values of an image field must be greater' +
          ' than 0.');
    }

    /** The size of the area rendered by the field. */
    this.size_ = new Size(imageWidth, imageHeight + FieldImage.Y_PADDING);

    /**
     * Store the image height, since it is different from the field height.
     */
    this.imageHeight_ = imageHeight;

    if (typeof opt_onClick === 'function') {
      this.clickHandler_ = opt_onClick;
    }

    if (src === Field.SKIP_SETUP) {
      return;
    }

    if (opt_config) {
      this.configure_(opt_config);
    } else {
      this.flipRtl_ = !!opt_flipRtl;
      this.altText_ = parsing.replaceMessageReferences(opt_alt) || '';
    }
    this.setValue(parsing.replaceMessageReferences(src));
  }

  /**
   * Configure the field based on the given map of options.
   *
   * @param config A map of options to configure the field based on.
   */
  protected override configure_(config: FieldImageConfig) {
    super.configure_(config);
    if (config.flipRtl) this.flipRtl_ = config.flipRtl;
    if (config.alt) {
      this.altText_ = parsing.replaceMessageReferences(config.alt);
    }
  }

  /**
   * Create the block UI for this image.
   *
   * @internal
   */
  override initView() {
    this.imageElement_ = dom.createSvgElement(
        Svg.IMAGE, {
          'height': this.imageHeight_ + 'px',
          'width': this.size_.width + 'px',
          'alt': this.altText_,
        },
        this.fieldGroup_);
    this.imageElement_.setAttributeNS(
        dom.XLINK_NS, 'xlink:href', this.value_ as string);

    if (this.clickHandler_) {
      this.imageElement_.style.cursor = 'pointer';
    }
  }

  override updateSize_() {}
  // NOP

  /**
   * Ensure that the input value (the source URL) is a string.
   *
   * @param opt_newValue The input value.
   * @returns A string, or null if invalid.
   */
  protected override doClassValidation_(opt_newValue?: AnyDuringMigration):
      string|null {
    if (typeof opt_newValue !== 'string') {
      return null;
    }
    return opt_newValue;
  }

  /**
   * Update the value of this image field, and update the displayed image.
   *
   * @param newValue The value to be saved. The default validator guarantees
   *     that this is a string.
   */
  protected override doValueUpdate_(newValue: AnyDuringMigration) {
    this.value_ = newValue;
    if (this.imageElement_) {
      this.imageElement_.setAttributeNS(
          dom.XLINK_NS, 'xlink:href', String(this.value_));
    }
  }

  /**
   * Get whether to flip this image in RTL
   *
   * @returns True if we should flip in RTL.
   */
  override getFlipRtl(): boolean {
    return this.flipRtl_;
  }

  /**
   * Set the alt text of this image.
   *
   * @param alt New alt text.
   */
  setAlt(alt: string|null) {
    if (alt === this.altText_) {
      return;
    }
    this.altText_ = alt || '';
    if (this.imageElement_) {
      this.imageElement_.setAttribute('alt', this.altText_);
    }
  }

  /**
   * If field click is called, and click handler defined,
   * call the handler.
   */
  protected override showEditor_() {
    if (this.clickHandler_) {
      this.clickHandler_(this);
    }
  }

  /**
   * Set the function that is called when this image  is clicked.
   *
   * @param func The function that is called when the image is clicked, or null
   *     to remove.
   */
  setOnClickHandler(func: ((p1: FieldImage) => AnyDuringMigration)|null) {
    this.clickHandler_ = func;
  }

  /**
   * Use the `getText_` developer hook to override the field's text
   * representation.
   * Return the image alt text instead.
   *
   * @returns The image alt text.
   */
  protected override getText_(): string|null {
    return this.altText_;
  }

  /**
   * Construct a FieldImage from a JSON arg object,
   * dereferencing any string table references.
   *
   * @param options A JSON object with options (src, width, height, alt, and
   *     flipRtl).
   * @returns The new field instance.
   * @nocollapse
   * @internal
   */
  static fromJson(options: FieldImageFromJsonConfig): FieldImage {
    if (!options.src || !options.width || !options.height) {
      throw new Error(
          'src, width, and height values for an image field are' +
          'required. The width and height must be non-zero.');
    }
    // `this` might be a subclass of FieldImage if that class doesn't override
    // the static fromJson method.
    return new this(
        options.src, options.width, options.height, undefined, undefined,
        undefined, options);
  }
}

fieldRegistry.register('field_image', FieldImage);

(FieldImage.prototype as AnyDuringMigration).DEFAULT_VALUE = '';

/**
 * Config options for the image field.
 */
export interface FieldImageConfig extends FieldConfig {
  flipRtl?: boolean;
  alt?: string;
}

/**
 * fromJson config options for the colour field.
 */
export interface FieldImageFromJsonConfig extends FieldImageConfig {
  src?: string;
  width?: number;
  height?: number;
}
