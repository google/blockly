/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Components for the module model.
 * @author dev@varwin.com (Varwin Developers)
 */
'use strict';

/**
 * Class for a module model.
 * @class
 */
goog.module('Blockly.ModuleModel');

const idGenerator = goog.require('Blockly.utils.idGenerator');


/**
 * Class for a module model.
 * Holds information for the module including name and ID
 * @param {!Blockly.Workspace} workspace The module's workspace.
 * @param {string} name The name of the module.
 * @param {string} opt_id The unique ID of the module. This will default to
 *     a UUID.
 * @constructor
 */
const ModuleModel = function(workspace, name, opt_id) {
  /**
   * The workspace the module is in.
   * @type {!Blockly.Workspace}
   */
  this.workspace = workspace;

  /**
   * The name of the module, typically defined by the user. It may be
   * changed by the user.
   * @type {string}
   */
  this.name = name;

  /**
   * The translation key for get verbose name of the module. Typically defined for default modules.
   * @type {string}
   */
  this._translationKey = Blockly.Msg[name] ? name : null;

  /**
   * A unique id for the module. This should be defined at creation and
   * not change, even if the name changes. In most cases this should be a
   * UUID.
   * @type {string}
   * @private
   */
  this.id_ = opt_id || idGenerator.genUid();
};

/**
 * Workspace horizontal scrolling offset in pixel units.
 * @type {number}
 */
ModuleModel.prototype.scrollX = 0;

/**
 * Workspace vertical scrolling offset in pixel units.
 * @type {number}
 */
ModuleModel.prototype.scrollY = 0;

/**
 * Workspace scale.
 * @type {number}
 */
ModuleModel.prototype.scale = 1;

/**
 * @return {string} The ID for the module.
 */
ModuleModel.prototype.getId = function() {
  return this.id_;
};

/**
 * @return {string} Translated or raw module name.
 */
ModuleModel.prototype.getName = function() {
  const translatedName = Blockly.Msg[this._translationKey];

  return translatedName || this.name;
};

exports.ModuleModel = ModuleModel;

