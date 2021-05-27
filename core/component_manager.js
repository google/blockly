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
   * A map of types to component ids.
   * @type {!Object<string, Array<string>>}
   * @private
   */
  this.typeToComponentIds_ = {};
};

/**
 * An object storing component information.
 * @typedef {{
 *    id: string,
 *    component: !Blockly.IComponent,
 *    types: !Array<string|!Blockly.ComponentManager.Type<Blockly.IComponent>>,
 *    weight: number
 *  }}
 */
Blockly.ComponentManager.ComponentDatum;

/**
 * Adds a component.
 * @param {!Blockly.ComponentManager.ComponentDatum} componentInfo The data for
 *   the component to register.
 * @template T
 */
Blockly.ComponentManager.prototype.addComponent = function(componentInfo) {
  this.componentData_[componentInfo.id] = componentInfo;
  for (var i = 0, type; (type = componentInfo.types[i]); i++) {
    var typeKey = String(type).toLowerCase();
    if (this.typeToComponentIds_[typeKey] === undefined) {
      this.typeToComponentIds_[typeKey] = [componentInfo.id];
    } else {
      this.typeToComponentIds_[typeKey].push(componentInfo.id);
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
 * @param {!Blockly.ComponentManager.Type<T>} type The type of the component.
 * @param {boolean} sorted Whether to return list ordered by weights.
 * @return {!Array<T>} The components that match the
 *    specified type.
 * @template T
 */
Blockly.ComponentManager.prototype.getComponents = function(type, sorted) {
  var typeKey = String(type).toLowerCase();
  var componentIds = this.typeToComponentIds_[typeKey];
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
 * A name with the type of the element stored in the generic.
 * @param {string} name The name of the component type.
 * @constructor
 * @template T
 */
Blockly.ComponentManager.Type = function(name) {
  /**
   * @type {string}
   * @private
   */
  this.name_ = name;
};

/**
 * Returns the name of the type.
 * @return {string} The name.
 * @override
 */
Blockly.ComponentManager.Type.prototype.toString = function() {
  return this.name_;
};

/** @type {!Blockly.ComponentManager.Type<!Blockly.IPositionable>} */
Blockly.ComponentManager.Type.POSITIONABLE =
    new Blockly.ComponentManager.Type('positionable');
