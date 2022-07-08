/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a collapsible toolbox item.
 */

/**
 * The interface for a collapsible toolbox item.
 * @namespace Blockly.ICollapsibleToolboxItem
 */


/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */


import {ISelectableToolboxItem} from './i_selectable_toolbox_item';


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
