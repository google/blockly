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

goog.provide('Blockly.ThemeManager');

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
Blockly.ThemeManager = function(workspace, theme) {

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
   * @type {!Object<string, !Array<!Blockly.ThemeManager.Component>>}
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
Blockly.ThemeManager.Component;

/**
 * Get the workspace theme.
 * @return {!Blockly.Theme} The workspace theme.
 * @package
 */
Blockly.ThemeManager.prototype.getTheme = function() {
  return this.theme_;
};

/**
 * Set the workspace theme, and refresh the workspace and all components.
 * @param {!Blockly.Theme} theme The workspace theme.
 * @package
 */
Blockly.ThemeManager.prototype.setTheme = function(theme) {
  var prevTheme = this.theme_;
  this.theme_ = theme;

  // Set the theme name onto the injection div.
  var injectionDiv = this.workspace_.getInjectionDiv();
  if (injectionDiv) {
    if (prevTheme) {
      Blockly.utils.dom.removeClass(injectionDiv, prevTheme.getClassName());
    }
    Blockly.utils.dom.addClass(injectionDiv, this.theme_.getClassName());
  }

  // Refresh all subscribed workspaces.
  for (var i = 0, workspace; (workspace = this.subscribedWorkspaces_[i]); i++) {
    workspace.refreshTheme();
  }

  // Refresh all registered Blockly UI components.
  for (var i = 0, keys = Object.keys(this.componentDB_),
    key; (key = keys[i]); i++) {
    for (var j = 0, component; (component = this.componentDB_[key][j]); j++) {
      var element = component.element;
      var propertyName = component.propertyName;
      var style = this.theme_ && this.theme_.getComponentStyle(key);
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
Blockly.ThemeManager.prototype.subscribeWorkspace = function(workspace) {
  this.subscribedWorkspaces_.push(workspace);
};

/**
 * Unsubscribe a workspace to changes to the selected theme.
 * @param {!Blockly.Workspace} workspace The workspace to unsubscribe.
 * @package
 */
Blockly.ThemeManager.prototype.unsubscribeWorkspace = function(workspace) {
  var index = this.subscribedWorkspaces_.indexOf(workspace);
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
Blockly.ThemeManager.prototype.subscribe = function(element, componentName,
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
  var style = this.theme_ && this.theme_.getComponentStyle(componentName);
  element.style[propertyName] = style || '';
};

/**
 * Unsubscribe an element to changes to the selected theme.
 * @param {Element} element The element to unsubscribe.
 * @package
 */
Blockly.ThemeManager.prototype.unsubscribe = function(element) {
  if (!element) {
    return;
  }
  // Go through all component, and remove any references to this element.
  var componentNames = Object.keys(this.componentDB_);
  for (var c = 0, componentName; (componentName = componentNames[c]); c++) {
    var elements = this.componentDB_[componentName];
    for (var i = elements.length - 1; i >= 0; i--) {
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
Blockly.ThemeManager.prototype.dispose = function() {
  this.owner_ = null;
  this.theme_ = null;
  this.subscribedWorkspaces_ = null;
  this.componentDB_ = null;
};
