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

goog.require('Blockly.IPlugin');


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
   * @type {!Object<string, string>}
   */
  this.typeToPluginId_ = {};
};

/**
 * @typedef {{
 *            id: string,
 *            plugin: !Blockly.IPlugin,
 *            types: !Array<!function(new:?, ...?)>,
 *            weight: number
 *          }}
 */
Blockly.PluginManager.PluginData;

/**
 * Adds a plugin.
 * @param {!Blockly.PluginManager.PluginData} pluginDataObject The plugin.
 */
Blockly.PluginManager.prototype.addPlugin = function(pluginDataObject) {
  this.pluginData_[pluginDataObject.id] = pluginDataObject;
  for (var i = 0, type; (type = pluginDataObject.types[i]); i++) {
    var typeKey = type.name;  // The map key needs to be a string
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
  return this.pluginData_[id];
};

/**
 * Gets all the plugins of the specified type.
 * @param {function(new:T, ...?)} type The type of the plugin.
 * @param {boolean} sorted Whether to return list ordered by weights.
 * @return {Array<T>} The plugins that match the specified type.
 * @template T
 */
Blockly.PluginManager.prototype.getPlugins = function(type, sorted) {
  var plugins = [];
  var pluginIds = this.typeToPluginId_[type.name];
  for (var i = 0, id; (id = pluginIds[i]); i++) {
    plugins.push(this.pluginData_[id].plugin);
  }
  if (sorted) {
    plugins.sort(function(a, b) {
      return a.weight - b.weight;
    });
  }
  return plugins;
};
