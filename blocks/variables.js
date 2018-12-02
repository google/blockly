/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Variable blocks for Blockly.

 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.variables');  // Deprecated.
goog.provide('Blockly.Constants.Variables');

goog.require('Blockly.Blocks');
goog.require('Blockly');

/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['VARIABLES_HUE']. (2018 April 5)
 */
Blockly.Constants.Variables.HUE = 330;

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
    {
        "type": "variables_get_number",
        "message0": "Get number stored in the variable named %1",
        "args0": [
            {
                "type": "field_variable",
                "name": "VAR",
                "variable": null,
                "variableTypes": ["Number"],
                "defaultType": "Number"
            }
        ],
        "output": "Number",
        "colour": "330",
        "tooltip": "",
        "helpUrl": ""
    },
    {
        "type": "variables_set_number",
        "message0": "This variable named %1 will store this number %2",
        "args0": [
            {
                "type": "field_variable",
                "name": "VAR",
                "variable": null,
                "variableTypes": ["Number"],
                "defaultType": "Number"
            },
            {
                "type": "input_value",
                "name": "VALUE",
                "check": "Number"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "330",
        "tooltip": "",
        "helpUrl": ""

    },
    {
        "type": "variables_get_string",
        "message0": "Get text stored in the variable named %1",
        "args0": [
            {
                "type": "field_variable",
                "name": "VAR",
                "variable": null,
                "variableTypes": ["String"],
                "defaultType": "String"
            }
        ],
        "output": "String",
        "colour": "240",
        "tooltip": "",
        "helpUrl": ""

    },
    {
        "type": "variables_set_string",
        "message0": "This variable named %1 will store this text %2",
        "args0": [
            {
                "type": "field_variable",
                "name": "VAR",
                "variable": null,
                "variableTypes": ["String"],
                "defaultType": "String"
            },
            {
                "type": "input_value",
                "name": "VALUE",
                "check": "String"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "240",
        "tooltip": "",
        "helpUrl": ""
    },
    {
        "type": "variables_get_boolean",
        "message0": "Get boolean stored in the variable named %1",
        "args0": [
            {
                "type": "field_variable",
                "name": "VAR",
                "variable": null,
                "variableTypes": ["Boolean"],
                "defaultType": "Boolean"
            }
        ],
        "output": "Boolean",
        "colour": "210",
        "tooltip": "",
        "helpUrl": ""

    },
    {
        "type": "variables_set_boolean",
        "message0": "This variable named %1 will store this boolean %2",
        "args0": [
            {
                "type": "field_variable",
                "name": "VAR",
                "variable": null,
                "variableTypes": ["Boolean"],
                "defaultType": "Boolean"
            },
            {
                "type": "input_value",
                "name": "VALUE",
                "check": "Boolean"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "210",
        "tooltip": "",
        "helpUrl": ""
    }
]);  // END JSON EXTRACT (Do not delete this comment.)
