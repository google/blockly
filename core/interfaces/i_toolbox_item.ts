/** @fileoverview The interface for a toolbox item. */


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
 * The interface for a toolbox item.
 * @namespace Blockly.IToolboxItem
 */


/**
 * Interface for an item in the toolbox.
 * @alias Blockly.IToolboxItem
 */
export interface IToolboxItem {
  /**
   * Initializes the toolbox item.
   * This includes creating the DOM and updating the state of any items based
   * on the info object.
   */
  init(): void;

  /**
   * Gets the div for the toolbox item.
   * @return The div for the toolbox item.
   */
  getDiv(): Element | null;

  /**
   * Gets a unique identifier for this toolbox item.
   * @return The ID for the toolbox item.
   */
  getId(): string;

  /**
   * Gets the parent if the toolbox item is nested.
   * @return The parent toolbox item, or null if this toolbox item is not
   *     nested.
   */
  getParent(): IToolboxItem | null;

  /**
   * Gets the nested level of the category.
   * @return The nested level of the category.
   */
  getLevel(): number;

  /**
   * Whether the toolbox item is selectable.
   * @return True if the toolbox item can be selected.
   */
  isSelectable(): boolean;

  /**
   * Whether the toolbox item is collapsible.
   * @return True if the toolbox item is collapsible.
   */
  isCollapsible(): boolean;

  /** Dispose of this toolbox item. No-op by default. */
  dispose(): void;

  /**
   * Gets the HTML element that is clickable.
   * @return The HTML element that receives clicks.
   */
  getClickTarget(): Element | null;

  /**
   * Sets whether the category is visible or not.
   * For a category to be visible its parent category must also be expanded.
   * @param isVisible True if category should be visible.
   */
  setVisible_(isVisible: boolean): void;
}