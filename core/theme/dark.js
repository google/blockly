/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Dark theme.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.Themes.Dark');

goog.require('Blockly.Theme');

Blockly.Themes.Dark = Blockly.Theme.defineTheme('dark', {
  'base': Blockly.Themes.Classic
});

Blockly.Themes.Dark.setComponentStyle('workspaceBackgroundColour', '#1e1e1e');
Blockly.Themes.Dark.setComponentStyle('toolboxBackgroundColour', '#333');
Blockly.Themes.Dark.setComponentStyle('toolboxForegroundColour', '#fff');
Blockly.Themes.Dark.setComponentStyle('flyoutBackgroundColour', '#252526');
Blockly.Themes.Dark.setComponentStyle('flyoutForegroundColour', '#ccc');
Blockly.Themes.Dark.setComponentStyle('flyoutOpacity', 1);
Blockly.Themes.Dark.setComponentStyle('scrollbarColour', '#797979');
Blockly.Themes.Dark.setComponentStyle('scrollbarOpacity', 0.4);
