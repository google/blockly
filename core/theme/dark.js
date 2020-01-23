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
 * @fileoverview Dark theme.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.Themes.Dark');

goog.require('Blockly.Css');
goog.require('Blockly.Theme');


// Temporary holding object.
Blockly.Themes.Dark = {};

Blockly.Themes.Dark.defaultBlockStyles = {
  "colour_blocks": {
    "colourPrimary": "#a5745b",
    "colourSecondary": "#dbc7bd",
    "colourTertiary": "#845d49"
  },
  "list_blocks": {
    "colourPrimary": "#745ba5",
    "colourSecondary": "#c7bddb",
    "colourTertiary": "#5d4984"
  },
  "logic_blocks": {
    "colourPrimary": "#5b80a5",
    "colourSecondary": "#bdccdb",
    "colourTertiary": "#496684"
  },
  "loop_blocks": {
    "colourPrimary": "#5ba55b",
    "colourSecondary": "#bddbbd",
    "colourTertiary": "#498449"
  },
  "math_blocks": {
    "colourPrimary": "#5b67a5",
    "colourSecondary": "#bdc2db",
    "colourTertiary": "#495284"
  },
  "procedure_blocks": {
    "colourPrimary": "#995ba5",
    "colourSecondary": "#d6bddb",
    "colourTertiary": "#7a4984"
  },
  "text_blocks": {
    "colourPrimary": "#5ba58c",
    "colourSecondary": "#bddbd1",
    "colourTertiary": "#498470"
  },
  "variable_blocks": {
    "colourPrimary": "#a55b99",
    "colourSecondary": "#dbbdd6",
    "colourTertiary": "#84497a"
  },
  "variable_dynamic_blocks": {
    "colourPrimary": "#a55b99",
    "colourSecondary": "#dbbdd6",
    "colourTertiary": "#84497a"
  },
  "hat_blocks": {
    "colourPrimary": "#a55b99",
    "colourSecondary": "#dbbdd6",
    "colourTertiary": "#84497a",
    "hat": "cap"
  }
};

Blockly.Themes.Dark.categoryStyles = {
  "colour_category": {
    "colour": "#a5745b"
  },
  "list_category": {
    "colour": "#745ba5"
  },
  "logic_category": {
    "colour": "#5b80a5"
  },
  "loop_category": {
    "colour": "#5ba55b"
  },
  "math_category": {
    "colour": "#5b67a5"
  },
  "procedure_category": {
    "colour": "#995ba5"
  },
  "text_category": {
    "colour": "#5ba58c"
  },
  "variable_category": {
    "colour": "#a55b99"
  },
  "variable_dynamic_category": {
    "colour": "#a55b99"
  }
};

// This style is still being fleshed out and may change.
Blockly.Themes.Dark =
    new Blockly.Theme('dark', Blockly.Themes.Dark.defaultBlockStyles,
        Blockly.Themes.Dark.categoryStyles);

Blockly.Themes.Dark.setComponentStyle('workspaceBackgroundColour', '#1e1e1e');
Blockly.Themes.Dark.setComponentStyle('toolboxBackgroundColour', '#333');
Blockly.Themes.Dark.setComponentStyle('toolboxForegroundColour', '#fff');
Blockly.Themes.Dark.setComponentStyle('flyoutBackgroundColour', '#252526');
Blockly.Themes.Dark.setComponentStyle('flyoutForegroundColour', '#ccc');
Blockly.Themes.Dark.setComponentStyle('flyoutOpacity', 1);
Blockly.Themes.Dark.setComponentStyle('scrollbarColour', '#797979');
Blockly.Themes.Dark.setComponentStyle('scrollbarOpacity', 0.4);

/**
 * CSS for the dark theme.
 * This registers CSS that is specific to this theme. It does so by prepending a
 * ``.dark-theme`` selector before every CSS rule that we wish to override by
 * this theme.
 */
(function() {
  var selector = '.dark-theme';
  Blockly.Css.register([
    /* eslint-disable indent */
    // Toolbox hover
    selector + ' .blocklyTreeRow:not(.blocklyTreeSelected):hover {',
      'background-color: #2a2d2e;',
    '}',
    // Dropdown and Widget div.
    selector + '.blocklyWidgetDiv .goog-menu, ',
    selector + '.blocklyDropDownDiv {',
      'background-color: #3c3c3c;',
    '}',
    selector + '.blocklyDropDownDiv {',
      'border-color: #565656;',
    '}',
    selector + '.blocklyWidgetDiv .goog-menuitem-content, ',
    selector + '.blocklyDropDownDiv .goog-menuitem-content {',
      'color: #f0f0f0;',
    '}',
    selector + '.blocklyWidgetDiv .goog-menuitem-disabled',
    ' .goog-menuitem-content,',
    selector + '.blocklyDropDownDiv .goog-menuitem-disabled',
    ' .goog-menuitem-content {',
      'color: #8a8a8a !important;',
    '}',
    /* eslint-enable indent */
  ]);
})();
