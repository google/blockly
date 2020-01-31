/**
 * @license
 * Copyright 2018 Google LLC
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
 * @fileoverview High contrast theme.
 * Darker colours to contrast the white font.
 */
'use strict';

goog.provide('Blockly.Themes.HighContrast');

goog.require('Blockly.Theme');


// Temporary holding object.
Blockly.Themes.HighContrast = {};

Blockly.Themes.HighContrast.defaultBlockStyles = {
  "colour_blocks": {
    "colourPrimary": "#a52714",
    "colourSecondary": "#FB9B8C",
    "colourTertiary": "#FBE1DD"
  },
  "list_blocks": {
    "colourPrimary": "#4a148c",
    "colourSecondary": "#AD7BE9",
    "colourTertiary": "#CDB6E9"
  },
  "logic_blocks": {
    "colourPrimary": "#01579b",
    "colourSecondary": "#64C7FF",
    "colourTertiary": "#C5EAFF"
  },
  "loop_blocks": {
    "colourPrimary": "#33691e",
    "colourSecondary": "#9AFF78",
    "colourTertiary": "#E1FFD7"
  },
  "math_blocks": {
    "colourPrimary": "#1a237e",
    "colourSecondary": "#8A9EFF",
    "colourTertiary": "#DCE2FF"
  },
  "procedure_blocks": {
    "colourPrimary": "#006064",
    "colourSecondary": "#77E6EE",
    "colourTertiary": "#CFECEE"
  },
  "text_blocks": {
    "colourPrimary": "#004d40",
    "colourSecondary": "#5ae27c",
    "colourTertiary": "#D2FFDD"
  },
  "variable_blocks": {
    "colourPrimary": "#880e4f",
    "colourSecondary": "#FF73BE",
    "colourTertiary": "#FFD4EB"
  },
  "variable_dynamic_blocks": {
    "colourPrimary": "#880e4f",
    "colourSecondary": "#FF73BE",
    "colourTertiary": "#FFD4EB"
  },
  "hat_blocks": {
    "colourPrimary": "#880e4f",
    "colourSecondary": "#FF73BE",
    "colourTertiary": "#FFD4EB",
    "hat": "cap"
  }
};

Blockly.Themes.HighContrast.categoryStyles = {
  "colour_category": {
    "colour": "#a52714"
  },
  "list_category": {
    "colour": "#4a148c"
  },
  "logic_category": {
    "colour": "#01579b"
  },
  "loop_category": {
    "colour": "#33691e"
  },
  "math_category": {
    "colour": "#1a237e"
  },
  "procedure_category": {
    "colour": "#006064"
  },
  "text_category": {
    "colour": "#004d40"
  },
  "variable_category": {
    "colour": "#880e4f"
  },
  "variable_dynamic_category": {
    "colour": "#880e4f"
  }
};

// This style is still being fleshed out and may change.
Blockly.Themes.HighContrast =
    new Blockly.Theme('highcontrast',
        Blockly.Themes.HighContrast.defaultBlockStyles,
        Blockly.Themes.HighContrast.categoryStyles);

Blockly.Themes.HighContrast.setComponentStyle('workspaceBackgroundColour', '#000');
Blockly.Themes.HighContrast.setComponentStyle('toolboxBackgroundColour', '#000');
Blockly.Themes.HighContrast.setComponentStyle('toolboxForegroundColour', '#fff');
Blockly.Themes.HighContrast.setComponentStyle('flyoutBackgroundColour', '#000');
Blockly.Themes.HighContrast.setComponentStyle('flyoutForegroundColour', '#fff');
Blockly.Themes.HighContrast.setComponentStyle('flyoutOpacity', 1);
Blockly.Themes.HighContrast.setComponentStyle('scrollbarColour', '#6fc3df');
Blockly.Themes.HighContrast.setComponentStyle('scrollbarOpacity', 0.6);

/**
 * CSS for the dark theme.
 * This registers CSS that is specific to this theme. It does so by prepending a
 * ``.dark-theme`` selector before every CSS rule that we wish to override by
 * this theme.
 */
(function() {
  var selector = '.highcontrast-theme';
  Blockly.Css.register([
    /* eslint-disable indent */
    selector + '.injectionDiv {',
      'border: 1px solid #6fc3df;',
    '}',
    // Toolbox
    selector + ' .blocklyToolboxDiv {',
      'border-right: 1px solid #6fc3df;',
    '}',
    selector + ' .blocklyTreeRow.blocklyTreeSelected {',
      'background-color: #000 !important;',
      'outline: 1px dotted #f38518;',
      'outline-offset: -1px;',
    '}',
    selector + ' .blocklyTreeRow:not(.blocklyTreeSelected):hover {',
      'background-color: #000;',
      'outline: 1px dashed #f38518;',
      'outline-offset: -1px;',
    '}',
    // Flyout
    selector + ' .blocklyFlyoutButton {',
      'fill: #000;',
    '}',
    selector + ' .blocklyFlyoutBackground {',
      'stroke: #6fc3df;',
    '}',
    selector + ' .blocklyFlyoutButtonShadow {',
      'fill: transparent;',
    '}',
    selector + ' .blocklyFlyoutButtonBackground {',
      'stroke: #6fc3df;',
    '}',
    // Insertion Marker
    selector + ' .blocklyInsertionMarker>.blocklyPath,',
    selector + ' .blocklyInsertionMarker>.blocklyPathLight,',
    selector + ' .blocklyInsertionMarker>.blocklyPathDark {',
      'fill: #fff;',
      'fill-opacity: .5;',
    '}',
    
    // Zoom / Trash
    selector + ' .blocklyZoom>image, ',
    selector + ' .blocklyZoom>svg>image {',
      'opacity: 1;',
    '}',
    selector + ' .blocklyTrash  {',
      'opacity: 1 !important;',
    '}',
    // Dropdown and Widget div.
    selector + '.blocklyWidgetDiv .goog-menu,',
    selector + '.blocklyDropDownDiv {',
      'background-color: #000;',
    '}',
    selector + '.blocklyWidgetDiv > .blocklyContextMenu {',
      'border-color: #6fc3df;',
    '}',
    selector + '.blocklyDropDownDiv {',
      'border-color: #6fc3df;',
    '}',
    selector + '.blocklyWidgetDiv .goog-menuitem-content,',
    selector + '.blocklyDropDownDiv .goog-menuitem-content {',
      'color: #fff;',
    '}',
    selector + '.blocklyWidgetDiv .goog-menuitem-disabled',
    ' .goog-menuitem-content,',
    selector + '.blocklyDropDownDiv .goog-menuitem-disabled',
    ' .goog-menuitem-content {',
      'opacity: .4;',
    '}',
    /* eslint-enable indent */
  ]);
})();
