/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Registry for context menu option items.
 * @author maribethb@google.com (Maribeth Bottorff)
 */
'use strict';

/**
 * @name Blockly.ContextMenuRegistry
 * @namespace
 */
goog.provide('Blockly.ContextMenuRegistry');

/**
 *
 * @enum {string}
 */
Blockly.ContextMenuRegistry.ScopeType = {
  BLOCK: 'block',
  WORKSPACE: 'workspace',
};

/**
 * Where this menu item should be rendered. If the menu item should be rendered in multiple
 * scopes, e.g. on both a block and a workspace, it should be registered for each scope.
 * @typedef {{
 *    block: (Blockly.BlockSvg|undefined),
 *    workspace: (Blockly.WorkspaceSvg|undefined),
 * }}
 */
Blockly.ContextMenuRegistry.Scope;

/**
 * @typedef {{
 *    callback: function(*),
 *    scopeType: !Blockly.ContextMenuRegistry.ScopeType,
 *    displayText: ((function(!Blockly.ContextMenuRegistry.Scope):string)|string),
 *    preconditionFn: function(!Blockly.ContextMenuRegistry.Scope):string,
 *    weight: number,
 *    id: string,
 * }}
*/
Blockly.ContextMenuRegistry.RegistryItem;

/**
 * @typedef {{
 *    text: string,
 *    enabled: boolean,
 *    callback: function(*),
 *    scope: !Blockly.ContextMenuRegistry.Scope,
 * }}
 */
Blockly.ContextMenuRegistry.ContextMenuOption;

/**
 * Registry of all registered RegistryItems, keyed by id.
 * @type {!Object<string, Blockly.ContextMenuRegistry.RegistryItem>}
 */
Blockly.ContextMenuRegistry.registry_ = {};

/**
 * Registers a RegistryItem.
 * @param {Blockly.ContextMenuRegistry.RegistryItem} item Context menu item to register.
 * @throws {Error} if an item with the given id already exists.
 */
Blockly.ContextMenuRegistry.register = function(item) {
  if (Blockly.ContextMenuRegistry.registry_[item.id]) {
    throw Error('Menu item with id "' + item.id + '" is already registered.');
  }
  Blockly.ContextMenuRegistry.registry_[item.id] = item;
};

/**
 * Unregisters a RegistryItem with the given id.
 * @param {string} id The id of the RegistryItem to remove.
 * @throws {Error} if an item with the given id does not exist.
 */
Blockly.ContextMenuRegistry.unregister = function(id) {
  if (Blockly.ContextMenuRegistry.registry_[id]) {
    delete Blockly.ContextMenuRegistry.registry_[id];
  } else {
    throw new Error('Menu item with id "' + id + '" not found.');
  }
};

/**
 * @param {string} id The id of the RegistryItem to get.
 * @returns {Blockly.ContextMenuRegistry.RegistryItem} RegistryItem
 * @throws {Error} if an item with the given id does not exist.
 */
Blockly.ContextMenuRegistry.getItem = function(id) {
  if (Blockly.ContextMenuRegistry.registry_[id]) {
    return Blockly.ContextMenuRegistry.registry_[id];
  } else {
    throw new Error('Menu item with id "' + id + '" not found.');
  }
};

/**
 * Gets the valid context menu options for the given scope type (e.g. block or workspace) and scope.
 * Blocks are only shown if the preconditionFn shows they should not be hidden.
 * @param {Blockly.ContextMenuRegistry.ScopeType} scopeType Type of scope where menu should be
 *     shown (e.g. on a block or on a workspace)
 * @param {Blockly.ContextMenuRegistry.Scope} scope Current scope of context menu
 *     (i.e., the exact workspace or block being clicked on)
 * @returns {!Array<!Blockly.ContextMenuRegistry.ContextMenuOption>} the list of ContextMenuOptions
 */
Blockly.ContextMenuRegistry.getContextMenuOptions = function(scopeType, scope) {
  var items = Object.keys(Blockly.ContextMenuRegistry.registry_);
  var menuOptions = [];
  items.forEach(function(key) {
    var item = Blockly.ContextMenuRegistry.registry_[key];
    if (scopeType === item.scopeType) {
      var precondition = item.preconditionFn(scope);
      if (precondition !== 'hidden') {
        var displayText = typeof item.displayText === 'function' ?
                            item.displayText(scope) : item.displayText;
        /** @type {Blockly.ContextMenuRegistry.ContextMenuOption} */
        var menuOption = {
          text: displayText,
          enabled: (precondition === 'enabled'),
          callback: item.callback,
          scope: scope,
        };
        menuOptions.push(menuOption);
      }
    }
  });
  return menuOptions;
};
