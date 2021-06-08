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
  this.componentData_ = {};

  /**
   * A map of capabilities to component ids.
   * @type {!Object<string, Array<string>>}
   * @private
   */
  this.capabilityToComponentIds_ = {};
};

/**
 * An object storing component information.
 * @typedef {{
 *    id: string,
 *    component: !Blockly.IComponent,
 *    capabilities: (
 *     !Array<string|!Blockly.ComponentManager.Capability<Blockly.IComponent>>),
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
 * @template T
 */
Blockly.ComponentManager.prototype.addComponent = function(
    componentInfo, opt_allowOverrides) {
  // Don't throw an error if opt_allowOverrides is true.
  if (!opt_allowOverrides && this.componentData_[componentInfo.id]) {
    throw Error(
        'Plugin "' + componentInfo.id + '" with capabilities "' +
        this.componentData_[componentInfo.id].capabilities +
        '" already added.');
  }
  this.componentData_[componentInfo.id] = componentInfo;
  for (var i = 0, type; (type = componentInfo.capabilities[i]); i++) {
    var typeKey = String(type).toLowerCase();
    if (this.capabilityToComponentIds_[typeKey] === undefined) {
      this.capabilityToComponentIds_[typeKey] = [componentInfo.id];
    } else {
      this.capabilityToComponentIds_[typeKey].push(componentInfo.id);
    }
  }
};

/**
 * Gets the component with the given ID and the given type.
 * @param {string} id The ID of the component to get.
 * @return {!Blockly.IComponent|undefined} The component with the given name
 *    or undefined if not found.
 */
Blockly.ComponentManager.prototype.getComponent = function(id) {
  return this.componentData_[id] && this.componentData_[id].component;
};

/**
 * Gets all the components of the specified type.
 * @param {!Blockly.ComponentManager.Capability<T>} capability The capability of the
 *     component.
 * @param {boolean} sorted Whether to return list ordered by weights.
 * @return {!Array<T>} The components that match the specified capability.
 * @template T
 */
Blockly.ComponentManager.prototype.getComponents = function(capability, sorted) {
  var typeKey = String(capability).toLowerCase();
  var componentIds = this.capabilityToComponentIds_[typeKey];
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
