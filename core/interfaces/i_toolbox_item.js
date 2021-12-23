/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a toolbox item.
 */

'use strict';

/**
 * The interface for a toolbox item.
 * @namespace Blockly.IToolboxItem
 */
goog.module('Blockly.IToolboxItem');


/**
 * Interface for an item in the toolbox.
 * @interface
 * @alias Blockly.IToolboxItem
 */
const IToolboxItem = function() {};

/**
 * Initializes the toolbox item.
 * This includes creating the DOM and updating the state of any items based
 * on the info object.
 * @return {void}
 * @public
 */
IToolboxItem.prototype.init;

/**
 * Gets the div for the toolbox item.
 * @return {?Element} The div for the toolbox item.
 * @public
 */
IToolboxItem.prototype.getDiv;

/**
 * Gets a unique identifier for this toolbox item.
 * @return {string} The ID for the toolbox item.
 * @public
 */
IToolboxItem.prototype.getId;

/**
 * Gets the parent if the toolbox item is nested.
 * @return {?IToolboxItem} The parent toolbox item, or null if
 *     this toolbox item is not nested.
 * @public
 */
IToolboxItem.prototype.getParent;

/**
 * Gets the nested level of the category.
 * @return {number} The nested level of the category.
 * @package
 */
IToolboxItem.prototype.getLevel;

/**
 * Whether the toolbox item is selectable.
 * @return {boolean} True if the toolbox item can be selected.
 * @public
 */
IToolboxItem.prototype.isSelectable;

/**
 * Whether the toolbox item is collapsible.
 * @return {boolean} True if the toolbox item is collapsible.
 * @public
 */
IToolboxItem.prototype.isCollapsible;

/**
 * Dispose of this toolbox item. No-op by default.
 * @public
 */
IToolboxItem.prototype.dispose;

exports.IToolboxItem = IToolboxItem;
