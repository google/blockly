/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object in charge of storing and updating a workspace theme
 *     and UI components.
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.ThemeManager');

import type {Theme} from './theme.js';
import * as arrayUtils from './utils/array.js';
import * as dom from './utils/dom.js';
import type {Workspace} from './workspace.js';
import type {WorkspaceSvg} from './workspace_svg.js';


/**
 * Class for storing and updating a workspace's theme and UI components.
 *
 * @alias Blockly.ThemeManager
 */
export class ThemeManager {
  /** A list of workspaces that are subscribed to this theme. */
  private subscribedWorkspaces_: Workspace[] = [];
  private componentDB = new Map<string, Component[]>();
  owner_: AnyDuringMigration;

  /**
   * @param workspace The main workspace.
   * @param theme The workspace theme.
   * @internal
   */
  constructor(private readonly workspace: WorkspaceSvg, private theme: Theme) {}

  /**
   * Get the workspace theme.
   *
   * @returns The workspace theme.
   * @internal
   */
  getTheme(): Theme {
    return this.theme;
  }

  /**
   * Set the workspace theme, and refresh the workspace and all components.
   *
   * @param theme The workspace theme.
   * @internal
   */
  setTheme(theme: Theme) {
    const prevTheme = this.theme;
    this.theme = theme;
    // Set the theme name onto the injection div.
    const injectionDiv = this.workspace.getInjectionDiv();
    if (injectionDiv) {
      if (prevTheme) {
        const oldClassName = prevTheme.getClassName();
        if (oldClassName) {
          dom.removeClass(injectionDiv, oldClassName);
        }
      }
      const newClassName = this.theme.getClassName();
      if (newClassName) {
        dom.addClass(injectionDiv, newClassName);
      }
    }

    // Refresh all subscribed workspaces.
    for (let i = 0, workspace; workspace = this.subscribedWorkspaces_[i]; i++) {
      (workspace as WorkspaceSvg).refreshTheme();
    }

    // Refresh all registered Blockly UI components.
    for (const [key, componentList] of this.componentDB) {
      for (const component of componentList) {
        const element = component.element;
        const propertyName = component.propertyName;
        const style = this.theme && this.theme.getComponentStyle(key);
        // AnyDuringMigration because:  Property 'style' does not exist on type
        // 'Element'.
        (element as AnyDuringMigration).style[propertyName] = style || '';
      }
    }

    for (const workspace of this.subscribedWorkspaces_) {
      (workspace as WorkspaceSvg).hideChaff();
    }
  }

  /**
   * Subscribe a workspace to changes to the selected theme.  If a new theme is
   * set, the workspace is called to refresh its blocks.
   *
   * @param workspace The workspace to subscribe.
   * @internal
   */
  subscribeWorkspace(workspace: Workspace) {
    this.subscribedWorkspaces_.push(workspace);
  }

  /**
   * Unsubscribe a workspace to changes to the selected theme.
   *
   * @param workspace The workspace to unsubscribe.
   * @internal
   */
  unsubscribeWorkspace(workspace: Workspace) {
    if (!arrayUtils.removeElem(this.subscribedWorkspaces_, workspace)) {
      throw Error(
          'Cannot unsubscribe a workspace that hasn\'t been subscribed.');
    }
  }

  /**
   * Subscribe an element to changes to the selected theme.  If a new theme is
   * selected, the element's style is refreshed with the new theme's style.
   *
   * @param element The element to subscribe.
   * @param componentName The name used to identify the component. This must be
   *     the same name used to configure the style in the Theme object.
   * @param propertyName The inline style property name to update.
   * @internal
   */
  subscribe(element: Element, componentName: string, propertyName: string) {
    if (!this.componentDB.has(componentName)) {
      this.componentDB.set(componentName, []);
    }

    // Add the element to our component map.
    this.componentDB.get(componentName)!.push({element, propertyName});

    // Initialize the element with its corresponding theme style.
    const style = this.theme && this.theme.getComponentStyle(componentName);
    // AnyDuringMigration because:  Property 'style' does not exist on type
    // 'Element'.
    (element as AnyDuringMigration).style[propertyName] = style || '';
  }

  /**
   * Unsubscribe an element to changes to the selected theme.
   *
   * @param element The element to unsubscribe.
   * @internal
   */
  unsubscribe(element: Element) {
    if (!element) {
      return;
    }
    // Go through all component, and remove any references to this element.
    for (const [componentName, elements] of this.componentDB) {
      for (let i = elements.length - 1; i >= 0; i--) {
        if (elements[i].element === element) {
          elements.splice(i, 1);
        }
      }
      // Clean up the component map entry if the list is empty.
      if (!elements.length) {
        this.componentDB.delete(componentName);
      }
    }
  }

  /**
   * Dispose of this theme manager.
   *
   * @suppress {checkTypes}
   * @internal
   */
  dispose() {
    this.owner_ = null;
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'Theme'.
    this.theme = null as AnyDuringMigration;
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'Workspace[]'.
    this.subscribedWorkspaces_ = null as AnyDuringMigration;
    this.componentDB.clear();
  }
}

export namespace ThemeManager {
  /** The type for a Blockly UI Component. */
  export interface Component {
    element: Element;
    propertyName: string;
  }
}

export type Component = ThemeManager.Component;
