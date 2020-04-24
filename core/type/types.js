/**
 * @license
 * Copyright 2016 Google LLC
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
 * @fileoverview Blockly Types declarations and helper functions to identify
 * types.
 * @author @carlosperate (Carlos Pereira Atencio) modified by Vittascience.com
 */
'use strict';

goog.provide('Blockly.Types');

goog.require('Blockly.Type');

/** Single character. */
Blockly.Types.CHARACTER = new Blockly.Type({
    typeId: 'Character',
    typeMsgName: 'ARD_TYPE_CHAR',
    compatibleTypes: []
});

/** Text string. */
Blockly.Types.TEXT = new Blockly.Type({
    typeId: 'String',
    typeMsgName: 'ARD_TYPE_TEXT',
    compatibleTypes: [Blockly.Types.CHARACTER]
});

/** Boolean. */
Blockly.Types.BOOLEAN = new Blockly.Type({
    typeId: 'Boolean',
    typeMsgName: 'ARD_TYPE_BOOL',
    compatibleTypes: []
});

/** Short integer number. */
Blockly.Types.SHORT_NUMBER = new Blockly.Type({
    typeId: 'Short Number',
    typeMsgName: 'ARD_TYPE_SHORT',
    compatibleTypes: [] // Circular dependencies, add after all declarations
});

/** Integer number. */
Blockly.Types.NUMBER = new Blockly.Type({
    typeId: 'Number',
    typeMsgName: 'ARD_TYPE_NUMBER',
    compatibleTypes: [] // Circular dependencies, add after all declarations
});

/** Large integer number. */
Blockly.Types.LARGE_NUMBER = new Blockly.Type({
    typeId: 'Large Number',
    typeMsgName: 'ARD_TYPE_LONG',
    compatibleTypes: [] // Circular dependencies, add after all declarations
});

/** Decimal/floating point number. */
Blockly.Types.DECIMAL = new Blockly.Type({
    typeId: 'Decimal',
    typeMsgName: 'ARD_TYPE_DECIMAL',
    compatibleTypes: [] // Circular dependencies, add after all declarations
});

/** Array/List of items. */
Blockly.Types.ARRAY = new Blockly.Type({
    typeId: 'Array',
    typeMsgName: 'ARD_TYPE_ARRAY',
    compatibleTypes: []
});

/** Null indicate there is no type. */
Blockly.Types.NULL = new Blockly.Type({
    typeId: 'Null',
    typeMsgName: 'ARD_TYPE_NULL',
    compatibleTypes: []
});

/** Type not defined, or not yet defined. */
Blockly.Types.UNDEF = new Blockly.Type({
    typeId: 'Undefined',
    typeMsgName: 'ARD_TYPE_UNDEF',
    compatibleTypes: []
});

/** Set when no child block (meant to define the variable type) is connected. */
Blockly.Types.CHILD_BLOCK_MISSING = new Blockly.Type({
    typeId: 'ChildBlockMissing',
    typeMsgName: 'ARD_TYPE_CHILDBLOCKMISSING',
    compatibleTypes: []
});

/**
 * Some Types have circular dependencies on their compatibilities, so add them
 * after declaration.
 */
Blockly.Types.NUMBER.addCompatibleTypes([
    Blockly.Types.BOOLEAN,
    Blockly.Types.SHORT_NUMBER,
    Blockly.Types.LARGE_NUMBER,
]);

Blockly.Types.SHORT_NUMBER.addCompatibleTypes([
    Blockly.Types.BOOLEAN,
    Blockly.Types.NUMBER,
    Blockly.Types.LARGE_NUMBER,
    Blockly.Types.DECIMAL
]);

Blockly.Types.LARGE_NUMBER.addCompatibleTypes([
    Blockly.Types.BOOLEAN,
    Blockly.Types.SHORT_NUMBER,
    Blockly.Types.NUMBER,
    Blockly.Types.DECIMAL
]);

Blockly.Types.DECIMAL.addCompatibleTypes([
    Blockly.Types.BOOLEAN,
    Blockly.Types.SHORT_NUMBER,
    Blockly.Types.NUMBER,
    Blockly.Types.LARGE_NUMBER
]);

/**
 * Adds another type to the Blockly.Types collection.
 * @param {string} typeId_ Identifiable name of the type.
 * @param {string} typeMsgName_ Name of the member variable from Blockly.Msg
 *     object to identify the translateble string.for the Type name.
 * @param {Array<Blockly.Type>} compatibleTypes_ List of types this Type is
 *     compatible with.
 */
Blockly.Types.addType = function(typeId_, typeMsgName_, compatibleTypes_) {
    // The Id is used as the key from the value pair in the BlocklyTypes object
    var key = typeId_.toUpperCase().replace(/ /g, '_');
    if (Blockly.Types[key] !== undefined) {
        throw 'The Blockly type ' + key + ' already exists.';
    }
    Blockly.Types[key] = new Blockly.Type({
        typeId: typeId_,
        typeName: typeMsgName_,
        compatibleTypes: compatibleTypes_
    });
};

/**
 * Converts the static types dictionary in to a an array with 2-item arrays.
 * This array only contains the valid types, excluding any error or temp types.
 * @return {!Array<Array<string>>} Blockly types in the format described above.
 */
Blockly.Types.getValidTypeArray = function() {
    var typesArray = [];
    for (var typeKey in Blockly.Types) {
        if ((typeKey !== 'UNDEF') && (typeKey !== 'CHILD_BLOCK_MISSING') &&
            (typeKey !== 'NULL') && (typeKey !== 'ARRAY') &&
            (typeof Blockly.Types[typeKey] !== 'function') &&
            !(Blockly.Types[typeKey] instanceof RegExp)) {
            typesArray.push([Blockly.Types[typeKey].typeName, typeKey]);
        }
    }
    return typesArray;
};

/**
* Return type defined in BLocklys.Types with the typeId
* @param {String} typeId
* @return {Blockly.Type} type
*/
Blockly.Types.getTypeWithId = function(id) {
  for (let type in Blockly.Types) {
    if (id == Blockly.Types[type].typeId) return Blockly.Types[type]
  }
  throw "type with id '" + id + "' is not defined in Blockly.Types \n\t at Blockly.Types.getTypeWithId()" 
};
  
/**
* Procedure to get child type of a block
* @param {Blockly.Block} block
* @return {Blockly.Type}
*/
Blockly.Types.getChildBlockType = function(child) {
  if (child.getBlockType) {
    return child.getBlockType();
  } else if (child.getVarType) {
      return child.getVarType();
  } else if (child.outputConnection && child.outputConnection.check_) {
      var typeCheck = child.outputConnection.check_[0];
    return Blockly.Types.getTypeWithId(typeCheck);
  } else {
      return Blockly.Types.CHILD_BLOCK_MISSING;
  }
};

/**
 * Regular expressions to identify an integer.
 * @private
 */
Blockly.Types.regExpInt_ = new RegExp(/^-?\d+$/);

/**
 * Regular expressions to identify a decimal.
 * @private
 */
Blockly.Types.regExpFloat_ = new RegExp(/^-?[0-9]*[.][0-9]+$/);

/**
 * Uses regular expressions to identify if the input number is an integer or a
 * floating point.
 * @param {string} numberString String of the number to identify.
 * @return {!Blockly.Type} Blockly type.
 */
Blockly.Types.identifyNumber = function(numberString) {
    if (Blockly.Types.regExpInt_.test(numberString)) {
        var intValue = parseInt(numberString);
        if (isNaN(intValue)) {
            return Blockly.Types.NULL;
        }
        if (intValue > 32767 || intValue < -32768) {
            return Blockly.Types.LARGE_NUMBER;
        }
        return Blockly.Types.NUMBER;
    } else if (Blockly.Types.regExpFloat_.test(numberString)) {
        return Blockly.Types.DECIMAL;
    }
    return Blockly.Types.NULL;
};