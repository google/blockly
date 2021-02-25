/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Default Blockly entry point. Use this to pick and choose which
 * fields and renderers to include in your Blockly bundle.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.requires');

// Blockly Core (absolutely mandatory).
goog.require('Blockly');
goog.require('Blockly.blockRendering.Debug');
goog.require('Blockly.Comment');
goog.require('Blockly.FieldAngle');
goog.require('Blockly.FieldCheckbox');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldImage');
goog.require('Blockly.FieldLabelSerializable');
goog.require('Blockly.FieldMultilineInput');
goog.require('Blockly.FieldNumber');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.FieldVariable');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.Generator');
goog.require('Blockly.geras.Renderer');
goog.require('Blockly.HorizontalFlyout');
goog.require('Blockly.Mutator');
goog.require('Blockly.Themes.Classic');
goog.require('Blockly.Themes.Dark');
goog.require('Blockly.Themes.Deuteranopia');
goog.require('Blockly.Themes.HighContrast');
goog.require('Blockly.Themes.Modern');
goog.require('Blockly.Themes.Tritanopia');
goog.require('Blockly.thrasos.Renderer');
goog.require('Blockly.Toolbox');
goog.require('Blockly.Trashcan');
goog.require('Blockly.VariablesDynamic');
goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.Warning');
goog.require('Blockly.WorkspaceCommentSvg');
goog.require('Blockly.WorkspaceCommentSvg.render');
goog.require('Blockly.zelos.Renderer');
goog.require('Blockly.ZoomControls');


