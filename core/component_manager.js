/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Manager for all items registered with the workspace.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.ComponentManager');

goog.requireType('Blockly.IAutoHideable');
goog.requireType('Blockly.IComponent');
goog.requireType('Blockly.IDeleteArea');
goog.requireType('Blockly.IDragTarget');
goog.requireType('Blockly.IPositionable');


/**
 * Manager for all items registered with the workspace.
 * @constructor
 */
Blockly.ComponentManager = function() {
  /**
   * A map of the components registered with the workspace, mapped to id.
   * @type {!Object<string, !Blockly.ComponentManager.ComponentDatum>}
   * @private
   */
  this.componentData_ = Object.create(null);

  /**
   * A map of capabilities to component IDs.
   * @type {!Object<string, !Array<string>>}
   * @private
   */
  this.capabilityToComponentIds_ = Object.create(null);
};

/**
 * An object storing component information.
 * @typedef {{
 *    component: !Blockly.IComponent,
 *    capabilities: (
 *     !Array<string|!Blockly.ComponentManager.Capability<!Blockly.IComponent>>
 *       ),
 *    weight: number
 *  }}
 */
Blockly.ComponentManager.ComponentDatum;

/**
 * Adds a component.
 * @param {!Blockly.ComponentManager.ComponentDatum} componentInfo The data for
 *   the component to register.
 * @param {boolean=} opt_allowOverrides True to prevent an error when overriding
 *     an already registered item.
 */
Blockly.ComponentManager.prototype.addComponent = function(
    componentInfo, opt_allowOverrides) {
  // Don't throw an error if opt_allowOverrides is true.
  var id = componentInfo.component.id;
  if (!opt_allowOverrides && this.componentData_[id]) {
    throw Error(
        'Plugin "' + id + '" with capabilities "' +
        this.componentData_[id].capabilities + '" already added.');
  }
  this.componentData_[id] = componentInfo;
  var stringCapabilities = [];
  for (var i = 0; i < componentInfo.capabilities.length; i++) {
    var capability = String(componentInfo.capabilities[i]).toLowerCase();
    stringCapabilities.push(capability);
    if (this.capabilityToComponentIds_[capability] === undefined) {
      this.capabilityToComponentIds_[capability] = [id];
    } else {
      this.capabilityToComponentIds_[capability].push(id);
    }
  }
  this.componentData_[id].capabilities = stringCapabilities;
};

/**
 * Removes a component.
 * @param {string} id The ID of the component to remove.
 */
Blockly.ComponentManager.prototype.removeComponent = function(id) {
  var componentInfo = this.componentData_[id];
  if (!componentInfo) {
    return;
  }
  for (var i = 0; i < componentInfo.capabilities.length; i++) {
    var capability = String(componentInfo.capabilities[i]).toLowerCase();
    this.capabilityToComponentIds_[capability].splice(
        this.capabilityToComponentIds_[capability].indexOf(id), 1);
  }
  delete this.componentData_[id];
};

/**
 * Adds a capability to a existing registered component.
 * @param {string} id The ID of the component to add the capability to.
 * @param {string|!Blockly.ComponentManager.Capability<T>} capability The
 *     capability to add.
 * @template T
 */
Blockly.ComponentManager.prototype.addCapability = function(id, capability) {
  if (!this.getComponent(id)) {
    throw Error('Cannot add capability, "' + capability + '". Plugin "' +
        id + '" has not been added to the ComponentManager');
  }
  if (this.hasCapability(id, capability)) {
    console.warn('Plugin "' + id + 'already has capability "' +
        capability + '"');
    return;
  }
  capability = String(capability).toLowerCase();
  this.componentData_[id].capabilities.push(capability);
  this.capabilityToComponentIds_[capability].push(id);
};

/**
 * Removes a capability from an existing registered component.
 * @param {string} id The ID of the component to remove the capability from.
 * @param {string|!Blockly.ComponentManager.Capability<T>} capability The
 *     capability to remove.
 * @template T
 */
Blockly.ComponentManager.prototype.removeCapability = function(id, capability) {
  if (!this.getComponent(id)) {
    throw Error('Cannot remove capability, "' + capability + '". Plugin "' +
        id + '" has not been added to the ComponentManager');
  }
  if (!this.hasCapability(id, capability)) {
    console.warn('Plugin "' + id + 'doesn\'t have capability "' +
        capability + '" to remove');
    return;
  }
  capability = String(capability).toLowerCase();
  this.componentData_[id].capabilities.splice(
      this.componentData_[id].capabilities.indexOf(capability), 1);
  this.capabilityToComponentIds_[capability].splice(
      this.capabilityToComponentIds_[capability].indexOf(id), 1);
};

/**
 * Returns whether the component with this id has the specified capability.
 * @param {string} id The ID of the component to check.
 * @param {string|!Blockly.ComponentManager.Capability<T>} capability The
 *     capability to check for.
 * @return {boolean} Whether the component has the capability.
 * @template T
 */
Blockly.ComponentManager.prototype.hasCapability = function(id, capability) {
  capability = String(capability).toLowerCase();
  return this.componentData_[id].capabilities.indexOf(capability) !== -1;
};

/**
 * Gets the component with the given ID.
 * @param {string} id The ID of the component to get.
 * @return {!Blockly.IComponent|undefined} The component with the given name
 *    or undefined if not found.
 */
Blockly.ComponentManager.prototype.getComponent = function(id) {
  return this.componentData_[id] && this.componentData_[id].component;
};

/**
 * Gets all the components with the specified capability.
 * @param {string|!Blockly.ComponentManager.Capability<T>
 *   } capability The capability of the component.
 * @param {boolean} sorted Whether to return list ordered by weights.
 * @return {!Array<T>} The components that match the specified capability.
 * @template T
 */
Blockly.ComponentManager.prototype.getComponents = function(capability, sorted) {
  capability = String(capability).toLowerCase();
  var componentIds = this.capabilityToComponentIds_[capability];
  if (!componentIds) {
    return [];
  }
  var components = [];
  if (sorted) {
    var componentDataList = [];
    var componentData = this.componentData_;
    componentIds.forEach(function(id) {
      componentDataList.push(componentData[id]);
    });
    componentDataList.sort(function(a, b) {
      return a.weight - b.weight;
    });
    componentDataList.forEach(function(ComponentDatum) {
      components.push(ComponentDatum.component);
    });
  } else {
    var componentData = this.componentData_;
    componentIds.forEach(function(id) {
      components.push(componentData[id].component);
    });
  }
  return components;
};

/**
 * A name with the capability of the element stored in the generic.
 * @param {string} name The name of the component capability.
 * @constructor
 * @template T
 */
Blockly.ComponentManager.Capability = function(name) {
  /**
   * @type {string}
   * @private
   */
  this.name_ = name;
};

/**
 * Returns the name of the capability.
 * @return {string} The name.
 * @override
 */
Blockly.ComponentManager.Capability.prototype.toString = function() {
  return this.name_;
};

/** @type {!Blockly.ComponentManager.Capability<!Blockly.IPositionable>} */
Blockly.ComponentManager.Capability.POSITIONABLE =
    new Blockly.ComponentManager.Capability('positionable');

/** @type {!Blockly.ComponentManager.Capability<!Blockly.IDragTarget>} */
Blockly.ComponentManager.Capability.DRAG_TARGET =
    new Blockly.ComponentManager.Capability('drag_target');

/** @type {!Blockly.ComponentManager.Capability<!Blockly.IDeleteArea>} */
Blockly.ComponentManager.Capability.DELETE_AREA =
    new Blockly.ComponentManager.Capability('delete_area');

/** @type {!Blockly.ComponentManager.Capability<!Blockly.IAutoHideable>} */
Blockly.ComponentManager.Capability.AUTOHIDEABLE =
    new Blockly.ComponentManager.Capability('autohideable');
