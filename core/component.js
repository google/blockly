/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The abstract class for a component.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.Component');

goog.require('Blockly.utils');
goog.require('Blockly.IComponent');

goog.requireType('Blockly.ComponentManager');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Abstract class for a component with custom behaviour when a block or bubble
 * is dragged over or dropped on top of it.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
 * @param {string=} opt_id The unique id for this component.
 * @param {number=} opt_weight The weight of this component.
 * @implements {Blockly.IComponent}
 * @constructor
 */
Blockly.Component = function(workspace, opt_id, opt_weight) {
  /**
   * The workspace this component sits in.
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = workspace;

  /**
   * The component manager this component is registered on.
   * @type {!Blockly.ComponentManager}
   * @private
   */
  this.componentManager_ = this.workspace_.getComponentManager();

  /**
   * The unique id for this component.
   * @type {string}
   */
  this.id = opt_id !== undefined ? opt_id : Blockly.utils.genUid();

  this.workspace_.getComponentManager().addComponent({
    component: this,
    weight: opt_weight !== undefined ? opt_weight : 1,
    capabilities: this.getInitialCapabilities(),
  });
};

/**
 * Returns list of initial capabilities to use for registering this component.
 * @return {!Array<string|!Blockly.ComponentManager.Capability<T>>} The initial
 * capabilities.
 * @template T
 */
Blockly.Component.prototype.getInitialCapabilities = function() {
  return [];
};

/**
 * Adds a capability to this component.
 * @param {string|!Blockly.ComponentManager.Capability<T>} capability The
 *     capability to add.
 * @template T
 */
Blockly.Component.prototype.addCapability = function(capability) {
  this.componentManager_.addCapability(this.id, capability);
};

/**
 * Removes a capability from this component.
 * @param {string|!Blockly.ComponentManager.Capability<T>} capability The
 *     capability to remove.
 * @template T
 */
Blockly.Component.prototype.removeCapability = function(capability) {
  this.componentManager_.removeCapability(this.id, capability);
};
