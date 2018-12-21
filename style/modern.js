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
 * @fileoverview Modern style.
 * Same colors as classic, but single colored border.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.Styles.Modern');

goog.require('Blockly.Style');

var defaultBlockStyles = {
  "colour": {
    "primaryColour": "#a5745b",
    "secondaryColour": "#dbc7bd",
    "tertiaryColour": "#845d49"
  },
  "lists": {
    "primaryColour": "#745ba5",
    "secondaryColour": "#c7bddb",
    "tertiaryColour": "#5d4984"
  },
  "logic": {
    "primaryColour": "#5b80a5",
    "secondaryColour": "#bdccdb",
    "tertiaryColour": "#496684"
  },
  "loops": {
    "primaryColour": "#5ba55b",
    "secondaryColour": "#bddbbd",
    "tertiaryColour": "#498449"
  },
  "math": {
    "primaryColour": "#5b67a5",
    "secondaryColour": "#bdc2db",
    "tertiaryColour": "#495284"
  },
  "procedures": {
    "primaryColour": "#995ba5",
    "secondaryColour": "#d6bddb",
    "tertiaryColour": "#7a4984"
  },
  "text": {
    "primaryColour": "#5ba58c",
    "secondaryColour": "#bddbd1",
    "tertiaryColour": "#498470"
  },
  "variables": {
    "primaryColour": "#a55b99",
    "secondaryColour": "#dbbdd6",
    "tertiaryColour": "#84497a"
  },
  "variables_dynamic": {
    "primaryColour": "#a55b99",
    "secondaryColour": "#dbbdd6",
    "tertiaryColour": "#84497a"
  }
};

//This style is still being fleshed out and may change.
Blockly.Styles.Modern = new Blockly.Style(defaultBlockStyles);
