/**
 * @license
 * Copyright 2017 Google LLC
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
'use strict';

goog.provide('Blockly.TestBlocks');

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
  {
    "type": "test_style_hex1",
    "message0": "Block color: Bright purple %1 %2 %3 %4",
    "args0": [
      {
        "type": "field_input",
        "name": "TEXT",
        "text": "#992aff"
      },
      {
        "type": "field_dropdown",
        "name": "DROPDOWN",
        "options": [
          [ "option", "ONE" ],
          [ "option", "TWO" ]
        ]
      },
      {
        "type": "field_checkbox",
        "name": "NAME",
        "checked": true
      },
      {
        "type": "input_value",
        "name": "NAME"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#992aff"
  }
]);  // END JSON EXTRACT (Do not delete this comment.)
