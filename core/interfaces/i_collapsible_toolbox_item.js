/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a collapsible toolbox item.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.ICollapsibleToolboxItem');

goog.require('Blockly.IToolboxItem');
goog.requireType('Blockly.utils.toolbox');


/**
 * Interface for an item in the toolbox that can be collapsed.
 * @extends {Blockly.ISelectableToolboxItem}
 * @interface
 */
Blockly.ICollapsibleToolboxItem = function() {};

/**
 * Gets any children toolbox items. (ex. Gets the subcategories)
 * @return {!Array<!Blockly.IToolboxItem>} The child toolbox items.
 */
Blockly.ICollapsibleToolboxItem.prototype.getChildToolboxItems;

/**
 * Whether the toolbox item is expanded to show its child subcategories.
 * @return {boolean} True if the toolbox item shows its children, false if it
 *     is collapsed.
 * @public
 */
Blockly.ICollapsibleToolboxItem.prototype.isExpanded;

/**
 * Toggles whether or not the toolbox item is expanded.
 * @public
 */
Blockly.ICollapsibleToolboxItem.prototype.toggleExpanded;
