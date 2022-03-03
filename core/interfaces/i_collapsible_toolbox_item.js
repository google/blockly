/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a collapsible toolbox item.
 */

'use strict';

/**
 * The interface for a collapsible toolbox item.
 * @namespace Blockly.ICollapsibleToolboxItem
 */
goog.declareModuleId('Blockly.ICollapsibleToolboxItem');

/* eslint-disable-next-line no-unused-vars */
import {ISelectableToolboxItem} from './i_selectable_toolbox_item.js';
/* eslint-disable-next-line no-unused-vars */
const {IToolboxItem} = goog.requireType('Blockly.IToolboxItem');


/**
 * Interface for an item in the toolbox that can be collapsed.
 * @extends {ISelectableToolboxItem}
 * @interface
 * @alias Blockly.ICollapsibleToolboxItem
 */
const ICollapsibleToolboxItem = function() {};

/**
 * Gets any children toolbox items. (ex. Gets the subcategories)
 * @return {!Array<!IToolboxItem>} The child toolbox items.
 */
ICollapsibleToolboxItem.prototype.getChildToolboxItems;

/**
 * Whether the toolbox item is expanded to show its child subcategories.
 * @return {boolean} True if the toolbox item shows its children, false if it
 *     is collapsed.
 * @public
 */
ICollapsibleToolboxItem.prototype.isExpanded;

/**
 * Toggles whether or not the toolbox item is expanded.
 * @public
 */
ICollapsibleToolboxItem.prototype.toggleExpanded;

export {ICollapsibleToolboxItem};
