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

'use strict';

goog.provide('Blockly.FieldType');

goog.require('Blockly.FieldDropdown');
//goog.require('Blockly.Msg');
goog.require('Blockly.Types');
goog.require('goog.string');

/**
 * Function to replace the the 'Any' selection to undefined.
 * @param {string} type The selection from the dropdown
 * @returns {(string|undefined)} Returns either the type name as string or
 *     undefined for any type.
 */
function fixType(type) {
    if (type == 'Any')
        type = undefined;
    return type;
}

/**
 * Class for a type dropdown field.
 * @param {Function=} opt_changeHandler A function that is executed when a new
 *     option is selected. Its sole argument is the new option value.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldType = function (opt_changeHandler) {
    Blockly.FieldType.superClass_.constructor.call(this,
        Blockly.FieldType.dropdownCreate, function (type) {
            type = fixType(type);
            if (opt_changeHandler)
                return opt_changeHandler(type);
            return type;
        });
};
goog.inherits(Blockly.FieldType, Blockly.FieldDropdown);

/**
 * Get the type
 * @return {(string|undefined)} Current text.
 */
Blockly.FieldType.prototype.getValue = function () {
    var type = Blockly.FieldType.superClass_.getValue.call(this);
    return fixType(type);
};

/**
 * Set the type.
 * @param {(string|undefined)} variable New variable.
 */
Blockly.FieldType.prototype.setValue = function (type) {
    Blockly.FieldType.superClass_.setValue.call(this, type || 'Any');
};

/**
 * Return a sorted list of type names for type dropdown menus.
 * @return {!Array.<string>} Array of type names.
 * @this {!Blockly.FieldType}
 */
Blockly.FieldType.dropdownCreate = function () {

    var typeList = Blockly.Types.allTypes();

    var result = [];
    for (var i = 0; i < typeList.length; i++) {
        result[i] = [typeList[i].name, typeList[i].name];
    }
    return [['Any', 'Any']].concat(result);
};