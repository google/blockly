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
   * @type {!Object<string, !Blockly.PluginManager.PluginDatum>}
   * @private
   */
  this.pluginData_ = {};

  /**
   * A map of types to plugin ids.
   * @type {!Object<string, Array<string>>}
   * @private
   */
  this.typeToPluginIds_ = {};
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
Blockly.PluginManager.PluginDatum;

/**
 * Adds a plugin.
 * @param {!Blockly.PluginManager.PluginDatum} pluginDataObject The plugin.
 * @template T
 */
Blockly.PluginManager.prototype.addPlugin = function(pluginDataObject) {
  this.pluginData_[pluginDataObject.id] = pluginDataObject;
  for (var i = 0, type; (type = pluginDataObject.types[i]); i++) {
    var typeKey = String(type).toLowerCase();
    if (this.typeToPluginIds_[typeKey] === undefined) {
      this.typeToPluginIds_[typeKey] = [pluginDataObject.id];
    } else {
      this.typeToPluginIds_[typeKey].push(pluginDataObject.id);
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
  var typeKey = String(type).toLowerCase();
  var pluginIds = this.typeToPluginIds_[typeKey];
  if (!pluginIds) {
    return [];
  }
  var plugins = [];
  if (sorted) {
    var pluginDataList = [];
    var pluginData = this.pluginData_;
    pluginIds.forEach(function(id) {
      pluginDataList.push(pluginData[id]);
    });
    pluginDataList.sort(function(a, b) {
      return a.weight - b.weight;
    });
    pluginDataList.forEach(function(pluginDatum) {
      plugins.push(pluginDatum.plugin);
    });
  } else {
    var pluginData = this.pluginData_;
    pluginIds.forEach(function(id) {
      plugins.push(pluginData[id].plugin);
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

