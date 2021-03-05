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

goog.provide('Blockly.PluginManager');


/**
 * Manager for all items registered with the workspace.
 * @constructor
 */
Blockly.PluginManager = function() {
  /**
   * A map of the plugins registered with the workspace, mapped to id.
   * @type {!Object<string, !Blockly.PluginManager.PluginData>}
   */
  this.pluginData_ = {};

  /**
   * A map of types to plugin ids.
   * @type {!Object<string, Array<string>>}
   */
  this.typeToPluginId_ = {};
};

/**
 * An object storing plugin information.
 * @typedef {{
 *    id: string,
 *    plugin: !Blockly.IPlugin,
 *    types: !Array<string|!Blockly.PluginManager.Type<Blockly.IPlugin>>,
 *    weight: number
 *  }}
 */
Blockly.PluginManager.PluginData;

/**
 * Adds a plugin.
 * @param {!Blockly.PluginManager.PluginData} pluginDataObject The plugin.
 * @template T
 */
Blockly.PluginManager.prototype.addPlugin = function(pluginDataObject) {
  this.pluginData_[pluginDataObject.id] = pluginDataObject;
  for (var i = 0, type; (type = pluginDataObject.types[i]); i++) {
    var typeKey = String(type).toLowerCase();
    if (this.typeToPluginId_[typeKey] === undefined) {
      this.typeToPluginId_[typeKey] = [pluginDataObject.id];
    } else {
      this.typeToPluginId_[typeKey].push(pluginDataObject.id);
    }
  }
};

/**
 * Gets the plugin with the given id and the given type.
 * @param {string} id The id of the plugin to get.
 * @return {!Blockly.IPlugin|undefined} The plugin with the given name
 *    or undefined if not found.
 */
Blockly.PluginManager.prototype.getPlugin = function(id) {
  return this.pluginData_[id] && this.pluginData_[id].plugin;
};

/**
 * Gets all the plugins of the specified type.
 * @param {!Blockly.PluginManager.Type<T>} type The type of the plugin.
 * @param {boolean} sorted Whether to return list ordered by weights.
 * @return {!Array<T>} The plugins that match the
 *    specified type.
 * @template T
 */
Blockly.PluginManager.prototype.getPlugins = function(type, sorted) {
  var plugins = [];
  var typeKey = String(type).toLowerCase();
  var pluginIds = this.typeToPluginId_[typeKey];
  for (var i = 0, id; pluginIds && (id = pluginIds[i]); i++) {
    plugins.push(this.pluginData_[id].plugin);
  }
  if (sorted) {
    plugins.sort(function(a, b) {
      return a.weight - b.weight;
    });
  }
  return plugins;
};

/**
 * A name with the type of the element stored in the generic.
 * @param {string} name The name of the plugin type.
 * @constructor
 * @template T
 */
Blockly.PluginManager.Type = function(name) {
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
Blockly.PluginManager.Type.prototype.toString = function() {
  return this.name_;
};

/** @type {!Blockly.PluginManager.Type<!Blockly.IPositionable>} */
Blockly.PluginManager.Type.POSITIONABLE =
    new Blockly.PluginManager.Type('positionable');

