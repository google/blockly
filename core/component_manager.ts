/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Manager for all items registered with the workspace.
 */

/**
 * Manager for all items registered with the workspace.
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.ComponentManager');

import type {IAutoHideable} from './interfaces/i_autohideable.js';
import type {IComponent} from './interfaces/i_component.js';
import type {IDeleteArea} from './interfaces/i_delete_area.js';
import type {IDragTarget} from './interfaces/i_drag_target.js';
import type {IPositionable} from './interfaces/i_positionable.js';
import * as arrayUtils from './utils/array.js';


class Capability<T> {
  static POSITIONABLE = new Capability<IPositionable>('positionable');
  static DRAG_TARGET = new Capability<IDragTarget>('drag_target');
  static DELETE_AREA = new Capability<IDeleteArea>('delete_area');
  static AUTOHIDEABLE = new Capability<IAutoHideable>('autohideable');
  private readonly name_: string;
  /** @param name The name of the component capability. */
  constructor(name: string) {
    this.name_ = name;
  }

  /**
   * Returns the name of the capability.
   * @return The name.
   */
  toString(): string {
    return this.name_;
  }
}

/**
 * Manager for all items registered with the workspace.
 * @alias Blockly.ComponentManager
 */
export class ComponentManager {
  static Capability = Capability;

  // static Capability: AnyDuringMigration;
  private readonly componentData_: {[key: string]: ComponentDatum};
  private readonly capabilityToComponentIds_: {[key: string]: string[]};

  /** Creates a new ComponentManager instance. */
  constructor() {
    /**
     * A map of the components registered with the workspace, mapped to id.
     */
    this.componentData_ = Object.create(null);

    /** A map of capabilities to component IDs. */
    this.capabilityToComponentIds_ = Object.create(null);
  }

  /**
   * Adds a component.
   * @param componentInfo The data for the component to register.
   * @param opt_allowOverrides True to prevent an error when overriding an
   *     already registered item.
   */
  addComponent(componentInfo: ComponentDatum, opt_allowOverrides?: boolean) {
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
   * @param id The ID of the component to remove.
   */
  removeComponent(id: string) {
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
   * @param id The ID of the component to add the capability to.
   * @param capability The capability to add.
   */
  addCapability<T>(id: string, capability: string|Capability<T>) {
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
   * @param id The ID of the component to remove the capability from.
   * @param capability The capability to remove.
   */
  removeCapability<T>(id: string, capability: string|Capability<T>) {
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
   * @param id The ID of the component to check.
   * @param capability The capability to check for.
   * @return Whether the component has the capability.
   */
  hasCapability<T>(id: string, capability: string|Capability<T>): boolean {
    capability = String(capability).toLowerCase();
    return this.componentData_[id].capabilities.indexOf(capability) !== -1;
  }

  /**
   * Gets the component with the given ID.
   * @param id The ID of the component to get.
   * @return The component with the given name or undefined if not found.
   */
  getComponent(id: string): IComponent|undefined {
    return this.componentData_[id] && this.componentData_[id].component;
  }

  /**
   * Gets all the components with the specified capability.
   * @param capability The capability of the component.
   * @param sorted Whether to return list ordered by weights.
   * @return The components that match the specified capability.
   */
  getComponents<T>(capability: string|Capability<T>, sorted: boolean): T[] {
    capability = String(capability).toLowerCase();
    const componentIds = this.capabilityToComponentIds_[capability];
    if (!componentIds) {
      return [];
    }
    const components: AnyDuringMigration[] = [];
    if (sorted) {
      const componentDataList: AnyDuringMigration[] = [];
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

export namespace ComponentManager {
  /** An object storing component information. */
  export interface ComponentDatum {
    component: IComponent;
    capabilities: Array<string|Capability<IComponent>>;
    weight: number;
  }
}

export type ComponentDatum = ComponentManager.ComponentDatum;
