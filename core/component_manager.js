/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Manager for all items registered with the workspace.
 */

'use strict';

/**
 * Manager for all items registered with the workspace.
 * @class
 */
goog.module('Blockly.ComponentManager');

const arrayUtils = goog.require('Blockly.utils.array');
/* eslint-disable-next-line no-unused-vars */
const {IAutoHideable} = goog.requireType('Blockly.IAutoHideable');
/* eslint-disable-next-line no-unused-vars */
const {IComponent} = goog.requireType('Blockly.IComponent');
/* eslint-disable-next-line no-unused-vars */
const {IDeleteArea} = goog.requireType('Blockly.IDeleteArea');
/* eslint-disable-next-line no-unused-vars */
const {IDragTarget} = goog.requireType('Blockly.IDragTarget');
/* eslint-disable-next-line no-unused-vars */
const {IPositionable} = goog.requireType('Blockly.IPositionable');


/**
 * Manager for all items registered with the workspace.
 * @alias Blockly.ComponentManager
 */
class ComponentManager {
  /**
   * Creates a new ComponentManager instance.
   */
  constructor() {
    /**
     * A map of the components registered with the workspace, mapped to id.
     * @type {!Object<string, !ComponentManager.ComponentDatum>}
     * @private
     */
    this.componentData_ = Object.create(null);

    /**
     * A map of capabilities to component IDs.
     * @type {!Object<string, !Array<string>>}
     * @private
     */
    this.capabilityToComponentIds_ = Object.create(null);
  }

  /**
   * Adds a component.
   * @param {!ComponentManager.ComponentDatum} componentInfo The data for
   *   the component to register.
   * @param {boolean=} opt_allowOverrides True to prevent an error when
   *     overriding an already registered item.
   */
  addComponent(componentInfo, opt_allowOverrides) {
    // Don't throw an error if opt_allowOverrides is true.
    const id = componentInfo.component.id;
    if (!opt_allowOverrides && this.componentData_[id]) {
      throw Error(
          'Plugin "' + id + '" with capabilities "' +
          this.componentData_[id].capabilities + '" already added.');
    }
    this.componentData_[id] = componentInfo;
    const stringCapabilities = [];
    for (let i = 0; i < componentInfo.capabilities.length; i++) {
      const capability = String(componentInfo.capabilities[i]).toLowerCase();
      stringCapabilities.push(capability);
      if (this.capabilityToComponentIds_[capability] === undefined) {
        this.capabilityToComponentIds_[capability] = [id];
      } else {
        this.capabilityToComponentIds_[capability].push(id);
      }
    }
    this.componentData_[id].capabilities = stringCapabilities;
  }

  /**
   * Removes a component.
   * @param {string} id The ID of the component to remove.
   */
  removeComponent(id) {
    const componentInfo = this.componentData_[id];
    if (!componentInfo) {
      return;
    }
    for (let i = 0; i < componentInfo.capabilities.length; i++) {
      const capability = String(componentInfo.capabilities[i]).toLowerCase();
      arrayUtils.removeElem(this.capabilityToComponentIds_[capability], id);
    }
    delete this.componentData_[id];
  }

  /**
   * Adds a capability to a existing registered component.
   * @param {string} id The ID of the component to add the capability to.
   * @param {string|!ComponentManager.Capability<T>} capability The
   *     capability to add.
   * @template T
   */
  addCapability(id, capability) {
    if (!this.getComponent(id)) {
      throw Error(
          'Cannot add capability, "' + capability + '". Plugin "' + id +
          '" has not been added to the ComponentManager');
    }
    if (this.hasCapability(id, capability)) {
      console.warn(
          'Plugin "' + id + 'already has capability "' + capability + '"');
      return;
    }
    capability = String(capability).toLowerCase();
    this.componentData_[id].capabilities.push(capability);
    this.capabilityToComponentIds_[capability].push(id);
  }

  /**
   * Removes a capability from an existing registered component.
   * @param {string} id The ID of the component to remove the capability from.
   * @param {string|!ComponentManager.Capability<T>} capability The
   *     capability to remove.
   * @template T
   */
  removeCapability(id, capability) {
    if (!this.getComponent(id)) {
      throw Error(
          'Cannot remove capability, "' + capability + '". Plugin "' + id +
          '" has not been added to the ComponentManager');
    }
    if (!this.hasCapability(id, capability)) {
      console.warn(
          'Plugin "' + id + 'doesn\'t have capability "' + capability +
          '" to remove');
      return;
    }
    capability = String(capability).toLowerCase();
    arrayUtils.removeElem(this.componentData_[id].capabilities, capability);
    arrayUtils.removeElem(this.capabilityToComponentIds_[capability], id);
  }

  /**
   * Returns whether the component with this id has the specified capability.
   * @param {string} id The ID of the component to check.
   * @param {string|!ComponentManager.Capability<T>} capability The
   *     capability to check for.
   * @return {boolean} Whether the component has the capability.
   * @template T
   */
  hasCapability(id, capability) {
    capability = String(capability).toLowerCase();
    return this.componentData_[id].capabilities.indexOf(capability) !== -1;
  }

  /**
   * Gets the component with the given ID.
   * @param {string} id The ID of the component to get.
   * @return {!IComponent|undefined} The component with the given name
   *    or undefined if not found.
   */
  getComponent(id) {
    return this.componentData_[id] && this.componentData_[id].component;
  }

  /**
   * Gets all the components with the specified capability.
   * @param {string|!ComponentManager.Capability<T>
   *   } capability The capability of the component.
   * @param {boolean} sorted Whether to return list ordered by weights.
   * @return {!Array<T>} The components that match the specified capability.
   * @template T
   */
  getComponents(capability, sorted) {
    capability = String(capability).toLowerCase();
    const componentIds = this.capabilityToComponentIds_[capability];
    if (!componentIds) {
      return [];
    }
    const components = [];
    if (sorted) {
      const componentDataList = [];
      const componentData = this.componentData_;
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
      const componentData = this.componentData_;
      componentIds.forEach(function(id) {
        components.push(componentData[id].component);
      });
    }
    return components;
  }
}

/**
 * An object storing component information.
 * @typedef {{
 *    component: !IComponent,
 *    capabilities: (
 *     !Array<string|!ComponentManager.Capability<!IComponent>>
 *       ),
 *    weight: number
 *  }}
 */
ComponentManager.ComponentDatum;

/**
 * A name with the capability of the element stored in the generic.
 * @template T
 * @alias Blockly.ComponentManager.Capability
 */
ComponentManager.Capability = class {
  /**
   * @param {string} name The name of the component capability.
   */
  constructor(name) {
    /**
     * @type {string}
     * @private
     */
    this.name_ = name;
  }

  /**
   * Returns the name of the capability.
   * @return {string} The name.
   * @override
   */
  toString() {
    return this.name_;
  }
};

/** @type {!ComponentManager.Capability<!IPositionable>} */
ComponentManager.Capability.POSITIONABLE =
    new ComponentManager.Capability('positionable');

/** @type {!ComponentManager.Capability<!IDragTarget>} */
ComponentManager.Capability.DRAG_TARGET =
    new ComponentManager.Capability('drag_target');

/** @type {!ComponentManager.Capability<!IDeleteArea>} */
ComponentManager.Capability.DELETE_AREA =
    new ComponentManager.Capability('delete_area');

/** @type {!ComponentManager.Capability<!IAutoHideable>} */
ComponentManager.Capability.AUTOHIDEABLE =
    new ComponentManager.Capability('autohideable');

exports.ComponentManager = ComponentManager;
