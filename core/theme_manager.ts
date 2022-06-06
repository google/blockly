/**
 * @fileoverview Object in charge of storing and updating a workspace theme
 *     and UI components.
 */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Object in charge of storing and updating a workspace theme
 *     and UI components.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { Theme } from './theme';
import * as arrayUtils from './utils/array';
import * as dom from './utils/dom';
/* eslint-disable-next-line no-unused-vars */
import { Workspace } from './workspace';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceSvg } from './workspace_svg';


/**
 * Class for storing and updating a workspace's theme and UI components.
 * @alias Blockly.ThemeManager
 */
export class ThemeManager {
  /** A list of workspaces that are subscribed to this theme. */
  private subscribedWorkspaces_: Workspace[] = [];
  private componentDB_: { [key: string]: Component[] };
  owner_: AnyDuringMigration;

  /**
   * @param workspace The main workspace.
   * @param theme The workspace theme.
   */
  constructor(private readonly workspace: WorkspaceSvg, private theme: Theme) {
    /** A map of subscribed UI components, keyed by component name. */
    this.componentDB_ = Object.create(null);
  }

  /**
   * Get the workspace theme.
   * @return The workspace theme.
   */
  getTheme(): Theme {
    return this.theme;
  }

  /**
   * Set the workspace theme, and refresh the workspace and all components.
   * @param theme The workspace theme.
   */
  setTheme(theme: Theme) {
    const prevTheme = this.theme;
    this.theme = theme;
    // Set the theme name onto the injection div.
    const injectionDiv = this.workspace.getInjectionDiv();
    if (injectionDiv) {
      if (prevTheme) {
        dom.removeClass(injectionDiv, prevTheme.getClassName());
      }
      dom.addClass(injectionDiv, this.theme.getClassName());
    }

    // Refresh all subscribed workspaces.
    for (let i = 0, workspace; workspace = this.subscribedWorkspaces_[i]; i++) {
      (workspace as WorkspaceSvg).refreshTheme();
    }

    // Refresh all registered Blockly UI components.
    for (let i = 0, keys = Object.keys(this.componentDB_), key; key = keys[i];
      i++) {
      for (let j = 0, component; component = this.componentDB_[key][j]; j++) {
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
   * @param workspace The workspace to subscribe.
   */
  subscribeWorkspace(workspace: Workspace) {
    this.subscribedWorkspaces_.push(workspace);
  }

  /**
   * Unsubscribe a workspace to changes to the selected theme.
   * @param workspace The workspace to unsubscribe.
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
   * @param element The element to subscribe.
   * @param componentName The name used to identify the component. This must be
   *     the same name used to configure the style in the Theme object.
   * @param propertyName The inline style property name to update.
   */
  subscribe(element: Element, componentName: string, propertyName: string) {
    if (!this.componentDB_[componentName]) {
      this.componentDB_[componentName] = [];
    }

    // Add the element to our component map.
    this.componentDB_[componentName].push({ element, propertyName });

    // Initialize the element with its corresponding theme style.
    const style = this.theme && this.theme.getComponentStyle(componentName);
    // AnyDuringMigration because:  Property 'style' does not exist on type
    // 'Element'.
    (element as AnyDuringMigration).style[propertyName] = style || '';
  }

  /**
   * Unsubscribe an element to changes to the selected theme.
   * @param element The element to unsubscribe.
   */
  unsubscribe(element: Element) {
    if (!element) {
      return;
    }
    // Go through all component, and remove any references to this element.
    const componentNames = Object.keys(this.componentDB_);
    for (let c = 0, componentName; componentName = componentNames[c]; c++) {
      const elements = this.componentDB_[componentName];
      for (let i = elements.length - 1; i >= 0; i--) {
        if (elements[i].element === element) {
          elements.splice(i, 1);
        }
      }
      // Clean up the component map entry if the list is empty.
      if (!this.componentDB_[componentName].length) {
        delete this.componentDB_[componentName];
      }
    }
  }

  /**
   * Dispose of this theme manager.
   * @suppress {checkTypes}
   */
  dispose() {
    this.owner_ = null;
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'Theme'.
    this.theme = null as AnyDuringMigration;
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'Workspace[]'.
    this.subscribedWorkspaces_ = null as AnyDuringMigration;
    // AnyDuringMigration because:  Type 'null' is not assignable to type '{
    // [key: string]: Component[]; }'.
    this.componentDB_ = null as AnyDuringMigration;
  }
}
export interface Component {
  element: Element;
  propertyName: string;
}
