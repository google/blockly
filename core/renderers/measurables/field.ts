/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a field in a row of a rendered
 * block.
 */

/**
 * Objects representing a field in a row of a rendered
 * block.
 * @class
 */


/* eslint-disable-next-line no-unused-vars */
import type {Field as BlocklyField} from '../../field';
import type {Input} from '../../input';
import {ConstantProvider} from '../common/constants';

import {Measurable} from './base';
import {Types} from './types';


/**
 * An object containing information about the space a field takes up during
 * rendering
 * @struct
 * @alias Blockly.blockRendering.Field
 */
export class Field extends Measurable {
  isEditable: boolean;
  flipRtl: boolean;
  override height: number;
  override width: number;

  /**
   * @param constants The rendering constants provider.
   * @param field The field to measure and store information for.
   * @param parentInput The parent input for the field.
   * @internal
   */
  constructor(
      constants: ConstantProvider, public field: BlocklyField,
      public parentInput: Input) {
    super(constants);

    this.isEditable = field.EDITABLE;

    this.flipRtl = field.getFlipRtl();
    this.type |= Types.FIELD;

    const size = this.field.getSize();

    this.height = size.height;

    this.width = size.width;
  }
}
