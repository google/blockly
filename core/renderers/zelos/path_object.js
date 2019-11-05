/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview An object that owns a block's rendering SVG elements.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.zelos.PathObject');

goog.require('Blockly.blockRendering.PathObject');
goog.require('Blockly.zelos.ConstantProvider');
goog.require('Blockly.utils.object');


/**
 * An object that handles creating and setting each of the SVG elements
 * used by the renderer.
 * @param {!SVGElement} root The root SVG element.
 * @param {!Blockly.zelos.ConstantProvider} constants The renderer's constants.
 * @constructor
 * @extends {Blockly.blockRendering.PathObject}
 * @package
 */
Blockly.zelos.PathObject = function(root, constants) {
  Blockly.zelos.PathObject.superClass_.constructor.call(this, root, constants);

  /**
   * The renderer's constant provider.
   * @type {!Blockly.zelos.ConstantProvider}
   */
  this.constants_ = constants;
};
Blockly.utils.object.inherits(Blockly.zelos.PathObject,
    Blockly.blockRendering.PathObject);
