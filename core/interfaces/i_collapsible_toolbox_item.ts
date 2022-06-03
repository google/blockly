/** @fileoverview The interface for a collapsible toolbox item. */


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
 * The interface for a collapsible toolbox item.
 * @namespace Blockly.ICollapsibleToolboxItem
 */

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import './i_toolbox_item';

import { ISelectableToolboxItem } from './i_selectable_toolbox_item';


/**
 * Interface for an item in the toolbox that can be collapsed.
 * @alias Blockly.ICollapsibleToolboxItem
 */
export interface ICollapsibleToolboxItem extends ISelectableToolboxItem {
  /**
   * Gets any children toolbox items. (ex. Gets the subcategories)
   * @return The child toolbox items.
   */
  getChildToolboxItems: AnyDuringMigration;

  /**
   * Whether the toolbox item is expanded to show its child subcategories.
   * @return True if the toolbox item shows its children, false if it is
   *     collapsed.
   */
  isExpanded: AnyDuringMigration;

  /** Toggles whether or not the toolbox item is expanded. */
  toggleExpanded: () => void;
}
