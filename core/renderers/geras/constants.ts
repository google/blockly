/**
 * @fileoverview An object that provides constants for rendering blocks in Geras
 * mode.
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
 * An object that provides constants for rendering blocks in Geras
 * mode.
 * @class
 */

import { ConstantProvider as BaseConstantProvider } from '../common/constants';


/**
 * An object that provides constants for rendering blocks in Geras mode.
 * @alias Blockly.geras.ConstantProvider
 */
export class ConstantProvider extends BaseConstantProvider {
  override FIELD_TEXT_BASELINE_CENTER = false;

  // The dark/shadow path in classic rendering is the same as the normal block
  // path, but translated down one and right one.
  DARK_PATH_OFFSET = 1;

  /**
   * The maximum width of a bottom row that follows a statement input and has
   * inputs inline.
   */
  MAX_BOTTOM_WIDTH = 30;
  override STATEMENT_BOTTOM_SPACER: AnyDuringMigration;

  constructor() {
    super();

    this.STATEMENT_BOTTOM_SPACER = -this.NOTCH_HEIGHT / 2;
  }

  override getCSS_(selector: string) {
    return super.getCSS_(selector)
      .concat(/* eslint-enable indent */
        [
          /* eslint-disable indent */
          // Insertion marker.
          selector + ' .blocklyInsertionMarker>.blocklyPathLight,',
          selector + ' .blocklyInsertionMarker>.blocklyPathDark {',
          'fill-opacity: ' + this.INSERTION_MARKER_OPACITY + ';',
          'stroke: none;',
          '}',
        ]);
  }
}
