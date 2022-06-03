/**
 * @fileoverview Objects representing a field in a row of a rendered
 * block.
 */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Objects representing a field in a row of a rendered
 * block.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
import { Field as BlocklyField } from 'google3/third_party/javascript/blockly/core/field';
/* eslint-disable-next-line no-unused-vars */
import { Input } from 'google3/third_party/javascript/blockly/core/input';

import { ConstantProvider } from '../common/constants';

import { Measurable } from './base';
import { Types } from './types';


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
