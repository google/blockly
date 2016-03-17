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
 * @fileoverview Utility functions for handling types.
 * @author fdohrendorf@outlook.com (Florian Dohrendorf)
 */
'use strict';

goog.provide('Blockly.Types');

goog.require('goog.string');

/**
 * Field whose value can be replaced to add custom types
 */
Blockly.Types.types = [];

/**
 * Find all user-created type definitions in a workspace.
 * TODO @param {!Blockly.Workspace} root Root workspace.
 * @return {!Array.<string>} List of types
 */
Blockly.Types.allTypes = function (/*root*/) {

    var builtInTypes = [
        {
            name: "Boolean"
        }, {
            name: "Number"
        }, {
            name: "String"
        }
    ];

    return builtInTypes.concat(Blockly.Types.types);
};

/**
 * Get the type definition by type name
 * @param {!string} typeName The type name
 * @returns {?{
 *     name:string, 
 *     parent:(string|undefined),
 *     fields:!Array.<{
 *         name: string,
 *         type: (string|undefined)
 *     }
 * }} The definition of the given type name or null if the type does not 
 *     exist.
 */
Blockly.Types.getType = function (typeName) {
    var typeList = Blockly.Types.allTypes();
    var types = typeList.filter(function (e) { return e.name === typeName; });
    if (types.length < 1) return null;
    return types[0];
};

/**
 * Get the fields by type name.
 * @param {!string} typeName The type name
 * @returns {!Array.<string>} Fields of the given type and base types, or an
 *     empty array if not found.
 */
Blockly.Types.getFields = function (typeName) {
    var type = Blockly.Types.getType(typeName);
    if (!type) return [];
    if (type.base)
        return Blockly.Types.getFields(type.base).concat(type.fields);
    return type.fields;
};

/**
 * Gets the names of the supplied type and all base types. Including 'Object'
 *     incase of an complex type.
 * @param {!string} typeName The type name
 * @returns {!Array.<string>} The given type and its base types or an empty
 *     array if not found.
 */
Blockly.Types.getSelfAndBase = function (typeName) {
    if (Blockly.Types.isPrimitive(typeName))
        // if we slightly change the check in the next line we could remove
        // this, but only if we say that every type that isn't found is by
        // default primitive, this could be the better backwards compatiblity
        // anyway.
        return [typeName]; 
    var type = Blockly.Types.getType(typeName);
    if (!type) return [];
    if (type.base)
        return Blockly.Types.getSelfAndBase(type.base).concat([typeName]);
    return ["Object", typeName];
}

/**
 * Returns true or false depending whether the supplied type is primitive or
 *     not.
 * @param {!string} type The type name
 * @returns {boolean} True when the given type is primitive, otherwise false.
 */
Blockly.Types.isPrimitive = function (type) {
    return ["boolean", "string", "number"].indexOf(type.toLowerCase()) !== -1;
};

/**
 * Returns true or false indicating whether the supplied type is assignable to
 *     the supplied base type.
 * @param {!string} base The base type name
 * @param {!string} type The type name
 * @returns {boolean} True when the given type is assignable to base, otherwise false.
 */
Blockly.Types.isAssignableFrom = function (base, type) {
    var types = Blockly.Types.getSelfAndBase(type);
    return types.indexOf(base) !== -1;
};

/**
 * Returns true or false whether the supplied type is a valid type. Valid
 *     means either primitive (boolen,number or string) or explicitly defined
 *     as complex type.
 * @param {!string} typeName The type name
 * @returns {boolean} True when the given type does exist otherwise false.
 */
Blockly.Types.isValidType = function (typeName) {
    return isPrimitive(type) || getType(typeName); // TODO or complex
};
