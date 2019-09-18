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
 * @fileoverview Default Blockly entry point. Use this to pick and choose which
 * fields and renderers to include in your Blockly bundle.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.requires');

// Blockly Core.
goog.require('Blockly');
goog.require('Blockly.Trashcan');
// Blockly Fields.
goog.require('Blockly.FieldAngle');
goog.require('Blockly.FieldCheckbox');
goog.require('Blockly.FieldColour');
// Date picker commented out since it increases footprint by 60%.
// Add it only if you need it.
// goog.require('Blockly.FieldDate');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabelSerializable');
goog.require('Blockly.FieldImage');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.FieldMultilineInput');
goog.require('Blockly.FieldNumber');
goog.require('Blockly.FieldVariable');
// Blockly Renderers.
goog.require('Blockly.geras.Renderer');
goog.require('Blockly.thrasos.Renderer');
goog.require('Blockly.zelos.Renderer');
