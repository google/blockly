/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Modern theme.
 * Same colors as classic, but single colored border.
 */
'use strict';

goog.provide('Blockly.Themes.Modern');

goog.require('Blockly.Theme');

var defaultBlockStyles = {
  "colour_blocks": {
    "primaryColour": "#a5745b",
    "secondaryColour": "#dbc7bd",
    "tertiaryColour": "#845d49"
  },
  "list_blocks": {
    "primaryColour": "#745ba5",
    "secondaryColour": "#c7bddb",
    "tertiaryColour": "#5d4984"
  },
  "logic_blocks": {
    "primaryColour": "#5b80a5",
    "secondaryColour": "#bdccdb",
    "tertiaryColour": "#496684"
  },
  "loop_blocks": {
    "primaryColour": "#5ba55b",
    "secondaryColour": "#bddbbd",
    "tertiaryColour": "#498449"
  },
  "math_blocks": {
    "primaryColour": "#5b67a5",
    "secondaryColour": "#bdc2db",
    "tertiaryColour": "#495284"
  },
  "procedure_blocks": {
    "primaryColour": "#995ba5",
    "secondaryColour": "#d6bddb",
    "tertiaryColour": "#7a4984"
  },
  "text_blocks": {
    "primaryColour": "#5ba58c",
    "secondaryColour": "#bddbd1",
    "tertiaryColour": "#498470"
  },
  "variable_blocks": {
    "primaryColour": "#a55b99",
    "secondaryColour": "#dbbdd6",
    "tertiaryColour": "#84497a"
  },
  "variable_dynamic_blocks": {
    "primaryColour": "#a55b99",
    "secondaryColour": "#dbbdd6",
    "tertiaryColour": "#84497a"
  }
};

//This style is still being fleshed out and may change.
Blockly.Themes.Modern = new Blockly.Theme(defaultBlockStyles);
