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
 * @fileoverview Thrasos renderer.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.thrasos.Renderer');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.Debug');
goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.thrasos.RenderInfo');

/**
 * The thrasos renderer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
Blockly.thrasos.Renderer = function() {
  this.constantProvider = Blockly.blockRendering.ConstantProvider;
  this.renderInfo = Blockly.thrasos.RenderInfo;
  this.drawer = Blockly.blockRendering.Drawer;
  this.debugger = Blockly.blockRendering.Debug;
  this.pathObject = Blockly.blockRendering.PathObject;
};
goog.inherits(Blockly.thrasos.Renderer, Blockly.blockRendering.Renderer);
