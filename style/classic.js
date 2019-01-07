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
 * @fileoverview Classic style.
 * Contains multi colored border to create shadow effect.
 */

'use strict';

goog.provide('Blockly.Styles.Classic');

goog.require('Blockly.Style');

var defaultBlockStyles = {
  "colour":{
    "primaryColour": "20"
  },
  "lists": {
    "primaryColour": "260"
  },
  "logic": {
    "primaryColour": "210"
  },
  "loops": {
    "primaryColour": "120"
  },
  "math": {
    "primaryColour": "230"
  },
  "procedures": {
    "primaryColour": "290"
  },
  "text": {
    "primaryColour": "160"
  },
  "variables": {
    "primaryColour": "330"
  },
  "variables_dynamic":{
    "primaryColour": "310"
  }
};

Blockly.Styles.Classic = new Blockly.Style(defaultBlockStyles);
