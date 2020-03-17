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
  'base': Blockly.Themes.Classic,
  'componentStyles': {
    'workspaceBackgroundColour': '#1e1e1e',
    'toolboxBackgroundColour': '#333',
    'toolboxForegroundColour': '#fff',
    'flyoutBackgroundColour': '#252526',
    'flyoutForegroundColour': '#ccc',
    'flyoutOpacity': 1,
    'scrollbarColour': '#797979',
    'insertionMarkerColour': '#fff',
    'insertionMarkerOpacity': 0.3,
    'scrollbarOpacity': 0.4,
    'cursorColour': '#d0d0d0'
  }
});
