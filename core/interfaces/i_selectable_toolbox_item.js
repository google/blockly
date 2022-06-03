/** @fileoverview The interface for a selectable toolbox item. */


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
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * The interface for a selectable toolbox item.
 * @namespace Blockly.ISelectableToolboxItem
 */

/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../utils/toolbox';

/* eslint-disable-next-line no-unused-vars */
import { IToolboxItem } from './i_toolbox_item';


/**
 * Interface for an item in the toolbox that can be selected.
 * @alias Blockly.ISelectableToolboxItem
 */
export interface ISelectableToolboxItem extends IToolboxItem {
  /**
   * Gets the name of the toolbox item. Used for emitting events.
   * @return The name of the toolbox item.
   */
  getName: AnyDuringMigration;

  /**
   * Gets the contents of the toolbox item. These are items that are meant to be
   * displayed in the flyout.
   * @return The definition of items to be displayed in the flyout.
   */
  getContents: AnyDuringMigration;

  /**
   * Sets the current toolbox item as selected.
   * @param _isSelected True if this category is selected, false otherwise.
   */
  setSelected: AnyDuringMigration;

  /**
   * Gets the HTML element that is clickable.
   * The parent toolbox element receives clicks. The parent toolbox will add an
   * ID to this element so it can pass the onClick event to the correct
   * toolboxItem.
   * @return The HTML element that receives clicks.
   */
  getClickTarget: AnyDuringMigration;

  /**
   * Handles when the toolbox item is clicked.
   * @param _e Click event to handle.
   */
  onClick: AnyDuringMigration;
}
