/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Registry for context menu option items.
 */


/**
 * Registry for context menu option items.
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.ContextMenuRegistry');

/* eslint-disable-next-line no-unused-vars */
import {BlockSvg} from './block_svg.js';
/* eslint-disable-next-line no-unused-vars */
import {WorkspaceSvg} from './workspace_svg.js';


enum ScopeType {
  BLOCK = 'block',
  WORKSPACE = 'workspace',
}

/**
 * Class for the registry of context menu items. This is intended to be a
 * singleton. You should not create a new instance, and only access this class
 * from ContextMenuRegistry.registry.
 * @alias Blockly.ContextMenuRegistry
 */
export class ContextMenuRegistry {
  /**
   * Where this menu item should be rendered. If the menu item should be
   * rendered in multiple scopes, e.g. on both a block and a workspace, it
   * should be registered for each scope.
   */
  static ScopeType = ScopeType;
  static registry: ContextMenuRegistry;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  private registry_!: {[key: string]: RegistryItem};

  /** Resets the existing singleton instance of ContextMenuRegistry. */
  constructor() {
    this.reset();
  }

  /** Clear and recreate the registry. */
  reset() {
    /** Registry of all registered RegistryItems, keyed by ID. */
    this.registry_ = Object.create(null);
  }

  /**
   * Registers a RegistryItem.
   * @param item Context menu item to register.
   * @throws {Error} if an item with the given ID already exists.
   */
  register(item: RegistryItem) {
    if (this.registry_[item.id]) {
      throw Error('Menu item with ID "' + item.id + '" is already registered.');
    }
    this.registry_[item.id] = item;
  }

  /**
   * Unregisters a RegistryItem with the given ID.
   * @param id The ID of the RegistryItem to remove.
   * @throws {Error} if an item with the given ID does not exist.
   */
  unregister(id: string) {
    if (!this.registry_[id]) {
      throw new Error('Menu item with ID "' + id + '" not found.');
    }
    delete this.registry_[id];
  }

  /**
   * @param id The ID of the RegistryItem to get.
   * @return RegistryItem or null if not found
   */
  getItem(id: string): RegistryItem|null {
    return this.registry_[id] || null;
  }

  /**
   * Gets the valid context menu options for the given scope type (e.g. block or
   * workspace) and scope. Blocks are only shown if the preconditionFn shows
   * they should not be hidden.
   * @param scopeType Type of scope where menu should be shown (e.g. on a block
   *     or on a workspace)
   * @param scope Current scope of context menu (i.e., the exact workspace or
   *     block being clicked on)
   * @return the list of ContextMenuOptions
   */
  getContextMenuOptions(scopeType: ScopeType, scope: Scope):
      ContextMenuOption[] {
    const menuOptions: AnyDuringMigration[] = [];
    const registry = this.registry_;
    Object.keys(registry).forEach(function(id) {
      const item = registry[id];
      if (scopeType === item.scopeType) {
        const precondition = item.preconditionFn(scope);
        if (precondition !== 'hidden') {
          const displayText = typeof item.displayText === 'function' ?
              item.displayText(scope) :
              item.displayText;
          const menuOption: ContextMenuOption = {
            text: displayText,
            enabled: precondition === 'enabled',
            callback: item.callback,
            scope,
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
  }
}
export interface Scope {
  block: BlockSvg|undefined;
  workspace: WorkspaceSvg|undefined;
}
export interface RegistryItem {
  callback: (p1: Scope) => AnyDuringMigration;
  scopeType: ScopeType;
  displayText: ((p1: Scope) => string)|string;
  preconditionFn: (p1: Scope) => string;
  weight: number;
  id: string;
}
export interface ContextMenuOption {
  text: string;
  enabled: boolean;
  callback: (p1: Scope) => AnyDuringMigration;
  scope: Scope;
  weight: number;
}
export interface LegacyContextMenuOption {
  text: string;
  enabled: boolean;
  callback: (p1: Scope) => AnyDuringMigration;
}

/**
 * Singleton instance of this class. All interactions with this class should be
 * done on this object.
 */
ContextMenuRegistry.registry = new ContextMenuRegistry();
