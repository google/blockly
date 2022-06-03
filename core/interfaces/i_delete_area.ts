/**
 * @fileoverview The interface for a component that can delete a block or bubble
 * that is dropped on top of it.
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
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * The interface for a component that can delete a block or bubble
 * that is dropped on top of it.
 * @namespace Blockly.IDeleteArea
 */

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import './i_draggable';

import { IDragTarget } from './i_drag_target';


/**
 * Interface for a component that can delete a block or bubble that is dropped
 * on top of it.
 * @alias Blockly.IDeleteArea
 */
export interface IDeleteArea extends IDragTarget {
  /**
   * Returns whether the provided block or bubble would be deleted if dropped on
   * this area.
   * This method should check if the element is deletable and is always called
   * before onDragEnter/onDragOver/onDragExit.
   * @param element The block or bubble currently being dragged.
   * @param couldConnect Whether the element could could connect to another.
   * @return Whether the element provided would be deleted if dropped on this
   *     area.
   */
  wouldDelete: AnyDuringMigration;
}
