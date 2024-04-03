/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Registry for context menu option items.
 *
 * @class
 */
// Former goog.module ID: Blockly.ContextMenuRegistry

import type {BlockSvg} from './block_svg.js';
import type {WorkspaceSvg} from './workspace_svg.js';

/**
 * Class for the registry of context menu items. This is intended to be a
 * singleton. You should not create a new instance, and only access this class
 * from ContextMenuRegistry.registry.
 */
export class ContextMenuRegistry {
  static registry: ContextMenuRegistry;
  /** Registry of all registered RegistryItems, keyed by ID. */
  private registry_ = new Map<string, RegistryItem>();

  /** Resets the existing singleton instance of ContextMenuRegistry. */
  constructor() {
    this.reset();
  }

  /** Clear and recreate the registry. */
  reset() {
    this.registry_.clear();
  }

  /**
   * Registers a RegistryItem.
   *
   * @param item Context menu item to register.
   * @throws {Error} if an item with the given ID already exists.
   */
  register(item: RegistryItem) {
    if (this.registry_.has(item.id)) {
      throw Error('Menu item with ID "' + item.id + '" is already registered.');
    }
    this.registry_.set(item.id, item);
  }

  /**
   * Unregisters a RegistryItem with the given ID.
   *
   * @param id The ID of the RegistryItem to remove.
   * @throws {Error} if an item with the given ID does not exist.
   */
  unregister(id: string) {
    if (!this.registry_.has(id)) {
      throw new Error('Menu item with ID "' + id + '" not found.');
    }
    this.registry_.delete(id);
  }

  /**
   * @param id The ID of the RegistryItem to get.
   * @returns RegistryItem or null if not found
   */
  getItem(id: string): RegistryItem | null {
    return this.registry_.get(id) ?? null;
  }

  /**
   * Gets the valid context menu options for the given scope type (e.g. block or
   * workspace) and scope. Blocks are only shown if the preconditionFn shows
   * they should not be hidden.
   *
   * @param scopeType Type of scope where menu should be shown (e.g. on a block
   *     or on a workspace)
   * @param scope Current scope of context menu (i.e., the exact workspace or
   *     block being clicked on)
   * @returns the list of ContextMenuOptions
   */
  getContextMenuOptions(
    scopeType: ScopeType,
    scope: Scope,
  ): ContextMenuOption[] {
    const menuOptions: ContextMenuOption[] = [];
    for (const item of this.registry_.values()) {
      if (scopeType === item.scopeType) {
        const precondition = item.preconditionFn(scope);
        if (precondition !== 'hidden') {
          const displayText =
            typeof item.displayText === 'function'
              ? item.displayText(scope)
              : item.displayText;
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
    }
    menuOptions.sort(function (a, b) {
      return a.weight - b.weight;
    });
    return menuOptions;
  }
}

export namespace ContextMenuRegistry {
  /**
   * Where this menu item should be rendered. If the menu item should be
   * rendered in multiple scopes, e.g. on both a block and a workspace, it
   * should be registered for each scope.
   */
  export enum ScopeType {
    BLOCK = 'block',
    WORKSPACE = 'workspace',
  }

  /**
   * The actual workspace/block where the menu is being rendered. This is passed
   * to callback and displayText functions that depend on this information.
   */
  export interface Scope {
    block?: BlockSvg;
    workspace?: WorkspaceSvg;
  }

  /**
   * A menu item as entered in the registry.
   */
  export interface RegistryItem {
    callback: (p1: Scope) => void;
    scopeType: ScopeType;
    displayText: ((p1: Scope) => string | HTMLElement) | string | HTMLElement;
    preconditionFn: (p1: Scope) => string;
    weight: number;
    id: string;
  }

  /**
   * A menu item as presented to contextmenu.js.
   */
  export interface ContextMenuOption {
    text: string | HTMLElement;
    enabled: boolean;
    callback: (p1: Scope) => void;
    scope: Scope;
    weight: number;
  }

  /**
   * A subset of ContextMenuOption corresponding to what was publicly
   * documented.  ContextMenuOption should be preferred for new code.
   */
  export interface LegacyContextMenuOption {
    text: string;
    enabled: boolean;
    callback: (p1: Scope) => void;
  }

  /**
   * Singleton instance of this class. All interactions with this class should
   * be done on this object.
   */
  ContextMenuRegistry.registry = new ContextMenuRegistry();
}

export type ScopeType = ContextMenuRegistry.ScopeType;
export const ScopeType = ContextMenuRegistry.ScopeType;
export type Scope = ContextMenuRegistry.Scope;
export type RegistryItem = ContextMenuRegistry.RegistryItem;
export type ContextMenuOption = ContextMenuRegistry.ContextMenuOption;
export type LegacyContextMenuOption =
  ContextMenuRegistry.LegacyContextMenuOption;
