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
 * Class for the registry of context menu items. This is intended to be a
 * singleton. You should not create a new instance, and only access this class
 * from `Blockly.ContextMenuRegistry.getRegistry()`.
 * @constructor
 */
Blockly.ContextMenuRegistry = function() {

  /**
   * Registry of all registered RegistryItems, keyed by id.
   * @type {!Object<string, Blockly.ContextMenuRegistry.RegistryItem>}
   * @private
   */
  this.registry_ = {};
};

/**
 * Singleton instance of this class.
 * @type {?Blockly.ContextMenuRegistry}
 */
Blockly.ContextMenuRegistry.instance_ = null;

/**
 * Gets the context menu registry instance.
 * @return {!Blockly.ContextMenuRegistry} The context menu registry.
 */
Blockly.ContextMenuRegistry.getRegistry = function() {
  if (Blockly.ContextMenuRegistry.instance_) {
    return Blockly.ContextMenuRegistry.instance_;
  }
  return (Blockly.ContextMenuRegistry.instance_) =
             new Blockly.ContextMenuRegistry();
};

/**
 * Where this menu item should be rendered. If the menu item should be rendered in multiple
 * scopes, e.g. on both a block and a workspace, it should be registered for each scope.
 * @enum {string}
 */
Blockly.ContextMenuRegistry.ScopeType = {
  BLOCK: 'block',
  WORKSPACE: 'workspace',
};

/**
 * The actual workspace/block where the menu is being rendered. This is passed to callback and
 * displayText functions that depend on this information.
 * @typedef {{
 *    block: (Blockly.BlockSvg|undefined),
 *    workspace: (Blockly.WorkspaceSvg|undefined)
 * }}
 */
Blockly.ContextMenuRegistry.Scope;

/**
 * A menu item as entered in the registry.
 * @typedef {{
 *    callback: function(!Blockly.ContextMenuRegistry.Scope),
 *    scopeType: !Blockly.ContextMenuRegistry.ScopeType,
 *    displayText: ((function(!Blockly.ContextMenuRegistry.Scope):string)|string),
 *    preconditionFn: function(!Blockly.ContextMenuRegistry.Scope):string,
 *    weight: number,
 *    id: string
 * }}
*/
Blockly.ContextMenuRegistry.RegistryItem;

/**
 * A menu item as presented to contextmenu.js.
 * @typedef {{
 *    text: string,
 *    enabled: boolean,
 *    callback: function(!Blockly.ContextMenuRegistry.Scope),
 *    scope: !Blockly.ContextMenuRegistry.Scope,
 *    weight: number
 * }}
 */
Blockly.ContextMenuRegistry.ContextMenuOption;

/**
 * Registers a RegistryItem.
 * @param {!Blockly.ContextMenuRegistry.RegistryItem} item Context menu item to register.
 * @throws {Error} if an item with the given id already exists.
 */
Blockly.ContextMenuRegistry.prototype.register = function(item) {
  if (this.registry_[item.id]) {
    throw Error('Menu item with id "' + item.id + '" is already registered.');
  }
  this.registry_[item.id] = item;
};

/**
 * Unregisters a RegistryItem with the given id.
 * @param {string} id The id of the RegistryItem to remove.
 * @throws {Error} if an item with the given id does not exist.
 */
Blockly.ContextMenuRegistry.prototype.unregister = function(id) {
  if (this.registry_[id]) {
    delete this.registry_[id];
  } else {
    throw new Error('Menu item with id "' + id + '" not found.');
  }
};

/**
 * @param {string} id The id of the RegistryItem to get.
 * @returns {?Blockly.ContextMenuRegistry.RegistryItem} RegistryItem or null if not found
 */
Blockly.ContextMenuRegistry.prototype.getItem = function(id) {
  if (this.registry_[id]) {
    return this.registry_[id];
  }
  return null;
};

/**
 * Gets the valid context menu options for the given scope type (e.g. block or workspace) and scope.
 * Blocks are only shown if the preconditionFn shows they should not be hidden.
 * @param {!Blockly.ContextMenuRegistry.ScopeType} scopeType Type of scope where menu should be
 *     shown (e.g. on a block or on a workspace)
 * @param {!Blockly.ContextMenuRegistry.Scope} scope Current scope of context menu
 *     (i.e., the exact workspace or block being clicked on)
 * @returns {!Array.<!Blockly.ContextMenuRegistry.ContextMenuOption>} the list of ContextMenuOptions
 */
Blockly.ContextMenuRegistry.prototype.getContextMenuOptions = function(scopeType, scope) {
  var menuOptions = [];
  var registry = this.registry_;
  Object.keys(registry).forEach(function(id) {
    var item = registry[id];
    if (scopeType == item.scopeType) {
      var precondition = item.preconditionFn(scope);
      if (precondition != 'hidden') {
        var displayText = typeof item.displayText == 'function' ?
                            item.displayText(scope) : item.displayText;
        /** @type {!Blockly.ContextMenuRegistry.ContextMenuOption} */
        var menuOption = {
          text: displayText,
          enabled: (precondition == 'enabled'),
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
