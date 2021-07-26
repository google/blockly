/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object in charge of storing and updating a workspace theme
 *     and UI components.
 * @author aschmiedt@google.com (Abby Schmiedt)
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.module('Blockly.ThemeManager');
goog.module.declareLegacyNamespace();

goog.require('Blockly.Theme');

goog.requireType('Blockly.Workspace');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Class for storing and updating a workspace's theme and UI components.
 * @param {!Blockly.WorkspaceSvg} workspace The main workspace.
 * @param {!Blockly.Theme} theme The workspace theme.
 * @constructor
 * @package
 */
const ThemeManager = function(workspace, theme) {

  /**
   * The main workspace.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * The Blockly theme to use.
   * @type {!Blockly.Theme}
   * @private
   */
  this.theme_ = theme;

  /**
   * A list of workspaces that are subscribed to this theme.
   * @type {!Array<Blockly.Workspace>}
   * @private
   */
  this.subscribedWorkspaces_ = [];

  /**
   * A map of subscribed UI components, keyed by component name.
   * @type {!Object<string, !Array<!ThemeManager.Component>>}
   * @private
   */
  this.componentDB_ = Object.create(null);
};

/**
 * A Blockly UI component type.
 * @typedef {{
  *            element:!Element,
  *            propertyName:string
  *          }}
  */
ThemeManager.Component;

/**
 * Get the workspace theme.
 * @return {!Blockly.Theme} The workspace theme.
 * @package
 */
ThemeManager.prototype.getTheme = function() {
  return this.theme_;
};

/**
 * Set the workspace theme, and refresh the workspace and all components.
 * @param {!Blockly.Theme} theme The workspace theme.
 * @package
 */
ThemeManager.prototype.setTheme = function(theme) {
  const prevTheme = this.theme_;
  this.theme_ = theme;

  // Set the theme name onto the injection div.
  const injectionDiv = this.workspace_.getInjectionDiv();
  if (injectionDiv) {
    if (prevTheme) {
      Blockly.utils.dom.removeClass(injectionDiv, prevTheme.getClassName());
    }
    Blockly.utils.dom.addClass(injectionDiv, this.theme_.getClassName());
  }

  // Refresh all subscribed workspaces.
  for (let i = 0, workspace; (workspace = this.subscribedWorkspaces_[i]); i++) {
    workspace.refreshTheme();
  }

  // Refresh all registered Blockly UI components.
  for (let i = 0, keys = Object.keys(this.componentDB_),
    key; (key = keys[i]); i++) {
    for (let j = 0, component; (component = this.componentDB_[key][j]); j++) {
      const element = component.element;
      const propertyName = component.propertyName;
      const style = this.theme_ && this.theme_.getComponentStyle(key);
      element.style[propertyName] = style || '';
    }
  }

  Blockly.hideChaff();
};

/**
 * Subscribe a workspace to changes to the selected theme.  If a new theme is
 * set, the workspace is called to refresh its blocks.
 * @param {!Blockly.Workspace} workspace The workspace to subscribe.
 * @package
 */
ThemeManager.prototype.subscribeWorkspace = function(workspace) {
  this.subscribedWorkspaces_.push(workspace);
};

/**
 * Unsubscribe a workspace to changes to the selected theme.
 * @param {!Blockly.Workspace} workspace The workspace to unsubscribe.
 * @package
 */
ThemeManager.prototype.unsubscribeWorkspace = function(workspace) {
  const index = this.subscribedWorkspaces_.indexOf(workspace);
  if (index < 0) {
    throw Error('Cannot unsubscribe a workspace that hasn\'t been subscribed.');
  }
  this.subscribedWorkspaces_.splice(index, 1);
};

/**
 * Subscribe an element to changes to the selected theme.  If a new theme is
 * selected, the element's style is refreshed with the new theme's style.
 * @param {!Element} element The element to subscribe.
 * @param {string} componentName The name used to identify the component. This
 *     must be the same name used to configure the style in the Theme object.
 * @param {string} propertyName The inline style property name to update.
 * @package
 */
ThemeManager.prototype.subscribe = function(element, componentName,
    propertyName) {
  if (!this.componentDB_[componentName]) {
    this.componentDB_[componentName] = [];
  }

  // Add the element to our component map.
  this.componentDB_[componentName].push({
    element: element,
    propertyName: propertyName
  });

  // Initialize the element with its corresponding theme style.
  const style = this.theme_ && this.theme_.getComponentStyle(componentName);
  element.style[propertyName] = style || '';
};

/**
 * Unsubscribe an element to changes to the selected theme.
 * @param {Element} element The element to unsubscribe.
 * @package
 */
ThemeManager.prototype.unsubscribe = function(element) {
  if (!element) {
    return;
  }
  // Go through all component, and remove any references to this element.
  const componentNames = Object.keys(this.componentDB_);
  for (let c = 0, componentName; (componentName = componentNames[c]); c++) {
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
};

/**
 * Dispose of this theme manager.
 * @package
 * @suppress {checkTypes}
 */
ThemeManager.prototype.dispose = function() {
  this.owner_ = null;
  this.theme_ = null;
  this.subscribedWorkspaces_ = null;
  this.componentDB_ = null;
};

exports = ThemeManager;
