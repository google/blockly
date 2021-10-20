/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Registry for context menu option items.
 */
'use strict';

/**
 * Registry for context menu option items.
 * @class
 */
goog.module('Blockly.ContextMenuRegistry');

/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * Class for the registry of context menu items. This is intended to be a
 * singleton. You should not create a new instance, and only access this class
 * from ContextMenuRegistry.registry.
 * @constructor
 * @private
 * @alias Blockly.ContextMenuRegistry
 */
const ContextMenuRegistry = function() {
  // Singleton instance should be registered once.
  ContextMenuRegistry.registry = this;

  /**
   * Registry of all registered RegistryItems, keyed by ID.
   * @type {!Object<string, !ContextMenuRegistry.RegistryItem>}
   * @private
   */
  this.registry_ = Object.create(null);
};

/**
 * Where this menu item should be rendered. If the menu item should be rendered
 * in multiple scopes, e.g. on both a block and a workspace, it should be
 * registered for each scope.
 * @enum {string}
 */
ContextMenuRegistry.ScopeType = {
  BLOCK: 'block',
  WORKSPACE: 'workspace',
};

/**
 * The actual workspace/block where the menu is being rendered. This is passed
 * to callback and displayText functions that depend on this information.
 * @typedef {{
 *    block: (BlockSvg|undefined),
 *    workspace: (WorkspaceSvg|undefined)
 * }}
 */
ContextMenuRegistry.Scope;

/**
 * A menu item as entered in the registry.
 * @typedef {{
 *    callback: function(!ContextMenuRegistry.Scope),
 *    scopeType: !ContextMenuRegistry.ScopeType,
 *    displayText: ((function(!ContextMenuRegistry.Scope):string)|string),
 *    preconditionFn: function(!ContextMenuRegistry.Scope):string,
 *    weight: number,
 *    id: string
 * }}
 */
ContextMenuRegistry.RegistryItem;

/**
 * A menu item as presented to contextmenu.js.
 * @typedef {{
 *    text: string,
 *    enabled: boolean,
 *    callback: function(!ContextMenuRegistry.Scope),
 *    scope: !ContextMenuRegistry.Scope,
 *    weight: number
 * }}
 */
ContextMenuRegistry.ContextMenuOption;

/**
 * Singleton instance of this class. All interactions with this class should be
 * done on this object.
 * @type {?ContextMenuRegistry}
 */
ContextMenuRegistry.registry = null;

/**
 * Registers a RegistryItem.
 * @param {!ContextMenuRegistry.RegistryItem} item Context menu item to
 *     register.
 * @throws {Error} if an item with the given ID already exists.
 */
ContextMenuRegistry.prototype.register = function(item) {
  if (this.registry_[item.id]) {
    throw Error('Menu item with ID "' + item.id + '" is already registered.');
  }
  this.registry_[item.id] = item;
};

/**
 * Unregisters a RegistryItem with the given ID.
 * @param {string} id The ID of the RegistryItem to remove.
 * @throws {Error} if an item with the given ID does not exist.
 */
ContextMenuRegistry.prototype.unregister = function(id) {
  if (!this.registry_[id]) {
    throw new Error('Menu item with ID "' + id + '" not found.');
  }
  delete this.registry_[id];
};

/**
 * @param {string} id The ID of the RegistryItem to get.
 * @return {?ContextMenuRegistry.RegistryItem} RegistryItem or null if not found
 */
ContextMenuRegistry.prototype.getItem = function(id) {
  return this.registry_[id] || null;
};

/**
 * Gets the valid context menu options for the given scope type (e.g. block or
 * workspace) and scope. Blocks are only shown if the preconditionFn shows they
 * should not be hidden.
 * @param {!ContextMenuRegistry.ScopeType} scopeType Type of scope where menu
 *     should be shown (e.g. on a block or on a workspace)
 * @param {!ContextMenuRegistry.Scope} scope Current scope of context menu
 *     (i.e., the exact workspace or block being clicked on)
 * @return {!Array<!ContextMenuRegistry.ContextMenuOption>} the list of
 *     ContextMenuOptions
 */
ContextMenuRegistry.prototype.getContextMenuOptions = function(
    scopeType, scope) {
  const menuOptions = [];
  const registry = this.registry_;
  Object.keys(registry).forEach(function(id) {
    const item = registry[id];
    if (scopeType === item.scopeType) {
      const precondition = item.preconditionFn(scope);
      if (precondition !== 'hidden') {
        const displayText = typeof item.displayText === 'function' ?
            item.displayText(scope) :
            item.displayText;
        /** @type {!ContextMenuRegistry.ContextMenuOption} */
        const menuOption = {
          text: displayText,
          enabled: (precondition === 'enabled'),
          callback: item.callback,
          scope: scope,
          weight: item.weight,
        };
        menuOptions.push(menuOption);
      }
    }
  });
  menuOptions.sort(function(a, b) {
    return a.weight - b.weight;
  });
  return menuOptions;
};

// Creates and assigns the singleton instance.
new ContextMenuRegistry();

exports.ContextMenuRegistry = ContextMenuRegistry;
