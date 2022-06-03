/**
 * @fileoverview Object representing a row that holds one or more inputs on a
 * rendered block.
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
 * Object representing a row that holds one or more inputs on a
 * rendered block.
 * @class
 */
/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider } from '../common/constants';

import { ExternalValueInput } from './external_value_input';
import { InputConnection } from './input_connection';
import { Row } from './row';
import { StatementInput } from './statement_input';
import { Types } from './types';


/**
 * An object containing information about a row that holds one or more inputs.
 * @struct
 * @alias Blockly.blockRendering.InputRow
 */
export class InputRow extends Row {
  /** The total width of all blocks connected to this row. */
  connectedBlockWidths = 0;

  /** @param constants The rendering constants provider. */
  constructor(constants: ConstantProvider) {
    super(constants);
    this.type |= Types.INPUT_ROW;
  }

  /**
   * Inspect all subcomponents and populate all size properties on the row.
   */
  override measure() {
    this.width = this.minWidth;
    this.height = this.minHeight;
    let connectedBlockWidths = 0;
    for (let i = 0; i < this.elements.length; i++) {
      const elem = this.elements[i];
      this.width += elem.width;
      if (Types.isInput(elem) && elem instanceof InputConnection) {
        if (Types.isStatementInput(elem) && elem instanceof StatementInput) {
          connectedBlockWidths += elem.connectedBlockWidth;
        } else if (
          Types.isExternalInput(elem) && elem instanceof ExternalValueInput &&
          elem.connectedBlockWidth !== 0) {
          connectedBlockWidths +=
            elem.connectedBlockWidth - elem.connectionWidth;
        }
      }
      if (!Types.isSpacer(elem)) {
        this.height = Math.max(this.height, elem.height);
      }
    }
    this.connectedBlockWidths = connectedBlockWidths;
    this.widthWithConnectedBlocks = this.width + connectedBlockWidths;
  }

  override endsWithElemSpacer() {
    return !this.hasExternalInput && !this.hasStatement;
  }
}
