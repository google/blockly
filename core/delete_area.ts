/**
 * @fileoverview The abstract class for a component that can delete a block or
 * bubble that is dropped on top of it.
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
 * The abstract class for a component that can delete a block or
 * bubble that is dropped on top of it.
 * @class
 */

import { BlockSvg } from './block_svg';
import { DragTarget } from './drag_target';
/* eslint-disable-next-line no-unused-vars */
import { IDeleteArea } from './interfaces/i_delete_area';
/* eslint-disable-next-line no-unused-vars */
import { IDraggable } from './interfaces/i_draggable';


/**
 * Abstract class for a component that can delete a block or bubble that is
 * dropped on top of it.
 * @alias Blockly.DeleteArea
 */
export class DeleteArea extends DragTarget implements IDeleteArea {
  /**
   * Whether the last block or bubble dragged over this delete area would be
   * deleted if dropped on this component.
   * This property is not updated after the block or bubble is deleted.
   */
  protected wouldDelete_ = false;

  /**
   * The unique id for this component that is used to register with the
   * ComponentManager.
   */
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  override id!: string;

  /**
   * Constructor for DeleteArea. Should not be called directly, only by a
   * subclass.
   */
  constructor() {
    super();
  }

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
  wouldDelete(element: IDraggable, couldConnect: boolean): boolean {
    if (element instanceof BlockSvg) {
      const block = (element);
      const couldDeleteBlock = !block.getParent() && block.isDeletable();
      this.updateWouldDelete_(couldDeleteBlock && !couldConnect);
    } else {
      this.updateWouldDelete_(element.isDeletable());
    }
    return this.wouldDelete_;
  }

  /**
   * Updates the internal wouldDelete_ state.
   * @param wouldDelete The new value for the wouldDelete state.
   */
  protected updateWouldDelete_(wouldDelete: boolean) {
    this.wouldDelete_ = wouldDelete;
  }
}
