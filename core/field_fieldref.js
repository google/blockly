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
 * @fileoverview Field input field.
 * @author fdohrendorf@outlook.com (Florian Dohrendorf)
 */
'use strict';

goog.provide('Blockly.FieldFieldref');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Types');
goog.require('goog.string');


/**
 * Class for a field dropdown field.
 * @param {Function=} opt_changeHandler A function that is executed when a new
 *     option is selected. Its sole argument is the new option value.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldFieldref = function (opt_changeHandler) {
    Blockly.FieldFieldref.superClass_.constructor.call(this,
        Blockly.FieldFieldref.dropdownCreate, opt_changeHandler);
};
goog.inherits(Blockly.FieldFieldref, Blockly.FieldDropdown);

/**
 * Get the type
 * @returns {string} Current type
 */
Blockly.FieldFieldref.prototype.getType = function() {
    return this.type_;
}

/**
 * Set the type 
 * @param {string} type New type
 */
Blockly.FieldFieldref.prototype.setType = function (type) {
    // get currentField we want to use the same if the type has this field
    var currentField = this.getValue();

    // if we don't have a current one use the previous one
    // this is for convienience when disconnected by accident
    if (currentField === '')
        currentField = this.previousField_ || '';

    this.type_ = type;

    var fieldName = null;
    if (type) {
        
        var fields = Blockly.Types.getFields(this.type_.name);

        // try to find current Field in fields of type
        if (fields.length > 0) {
            if (currentField && currentField !== '') {
                var found = fields.filter(function(e) { return e.name === currentField });
                if (found.length > 0) {
                    fieldName = currentField;
                }
            }

            // if currentField wasn't found just take the first field
            if (!fieldName) {
                fieldName = fields[0].name;
            }
        }
    } else {
        // no type store current as previous
        this.previousField_ = currentField;
    }

    this.setValue(fieldName || '');
}

/**
 * Return a sorted list of field names for field dropdown menus.
 * @return {!Array.<string>} Array of field names.
 * @this {!Blockly.FieldType}
 */
Blockly.FieldFieldref.dropdownCreate = function () {

    if (!this.type_) return [['', undefined]];


    var fields = Blockly.Types.getFields(this.type_.name);

    var result = [];
    for (var i = 0; i < fields.length; i++) {
        result[i] = [fields[i].name, fields[i].name];
    }
    return result;
};