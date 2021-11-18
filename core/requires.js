/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Default Blockly entry point. Use this to pick and choose which
 * fields and renderers to include in your Blockly bundle.
 * @suppress {extraRequire}
 */
'use strict';

goog.provide('Blockly.requires');

// Blockly Core (absolutely mandatory).
goog.require('Blockly');
// If block comments aren't required, then Blockly.inject's "comments"
// configuration must be false, and no blocks may be loaded from XML which
// define comments.
goog.require('Blockly.Comment');
// This registers default contextmenu options.
goog.require('Blockly.ContextMenuItems');
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
// Flyout buttons are needed by the variable category,
// and by any custom toolbox that has a button or a label.
goog.require('Blockly.FlyoutButton');
// If there is code generation into any language, then the generator is needed.
// Should not be required when using advanced compilation since
// individual generator files should already have this require.
goog.require('Blockly.Generator');
// One of these two will almost certainly be needed (usually VerticalFlyout).
goog.require('Blockly.HorizontalFlyout');
// Block dependencies.
// None of these should be required when using advanced compilation since
// individual block files should include the requirements they depend on.
goog.require('Blockly.Mutator');
// This registers default keyboard shortcuts.
goog.require('Blockly.ShortcutItems');
// The debug renderer, which shows simplified versions of the blocks for
// developer use.
// goog.require('Blockly.blockRendering.Debug');

// Blockly Themes.
// Classic is the default theme.
goog.require('Blockly.Themes.Classic');
// If the toolbox does not have categories and only has a simple flyout, then
// 'Blockly.Toolbox' is not needed.
goog.require('Blockly.Toolbox');
// If a trashcan on the workspace isn't required, then Blockly.inject's
// "trashcan" configuration must be false.
goog.require('Blockly.Trashcan');
// Only needed if one is using the 'VARIABLE_DYNAMIC' typed variables category.
goog.require('Blockly.VariablesDynamic');
goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.Warning');
// Only need to require these two if you're using workspace comments.
// goog.require('Blockly.WorkspaceCommentSvg');
// If zoom controls aren't required, then Blockly.inject's
// "zoom"/"controls" configuration must be false.
goog.require('Blockly.ZoomControls');
// Blockly Renderers.
// At least one renderer is mandatory.  Geras is the default one.
// Others may be chosen using Blockly.inject's "renderer" configuration.
goog.require('Blockly.geras.Renderer');
goog.require('Blockly.serialization.blocks');
goog.require('Blockly.serialization.registry');
goog.require('Blockly.serialization.variables');
goog.require('Blockly.serialization.workspaces');
goog.require('Blockly.thrasos.Renderer');
goog.require('Blockly.zelos.Renderer');
