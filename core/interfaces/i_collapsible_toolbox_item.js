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

goog.module('Blockly.ICollapsibleToolboxItem');
goog.module.declareLegacyNamespace();

/* eslint-disable-next-line no-unused-vars */
const ISelectableToolboxItem = goog.requireType('Blockly.ISelectableToolboxItem');
/* eslint-disable-next-line no-unused-vars */
const IToolboxItem = goog.requireType('Blockly.IToolboxItem');


/**
 * Interface for an item in the toolbox that can be collapsed.
 * @extends {ISelectableToolboxItem}
 * @interface
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

exports = ICollapsibleToolboxItem;
