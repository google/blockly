/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview Zelos renderer.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.zelos.Renderer');

goog.require('Blockly.blockRendering.Debug');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.zelos.ConstantProvider');
goog.require('Blockly.zelos.Drawer');
goog.require('Blockly.zelos.RenderInfo');

/**
 * The zelos renderer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
Blockly.zelos.Renderer = function() {
  this.constantProvider = Blockly.zelos.ConstantProvider;
  this.renderInfo = Blockly.zelos.RenderInfo;
  this.drawer = Blockly.zelos.Drawer;
  this.debugger = Blockly.blockRendering.Debug;
  this.pathObject = Blockly.blockRendering.PathObject;
};
goog.inherits(Blockly.zelos.Renderer, Blockly.blockRendering.Renderer);

