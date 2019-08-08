/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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

// TODO: Files in this directory seem to not be specific to Blockly, yet
//  this one is. Should it be moved to the core?
/**
 * @fileoverview Utility methods for handling fields.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';

/**
 * @name Blockly.utils
 * @namespace
 */
goog.provide('Blockly.utils.fields');


/**
 * The set of all registered fields, keyed by field type as used in the JSON
 * definition of a block.
 * @type {!Object<string, !{fromJson: Function}>}
 * @private
 */
Blockly.utils.fields.typeMap_ = {};

/**
 * Registers a field type. May also override an existing field type.
 * Blockly.utils.fields.fromJson uses this registry to
 * find the appropriate field type.
 * @param {string} type The field type name as used in the JSON definition.
 * @param {!{fromJson: Function}} fieldClass The field class containing a
 *     fromJson function that can construct an instance of the field.
 * @throws {Error} if the type name is empty, or the fieldClass is not an
 *     object containing a fromJson function.
 */
Blockly.utils.fields.register = function(type, fieldClass) {
  if ((typeof type != 'string') || (type.trim() == '')) {
    throw Error('Invalid field type "' + type + '"');
  }
  if (!fieldClass || (typeof fieldClass.fromJson != 'function')) {
    throw Error('Field "' + fieldClass + '" must have a fromJson function');
  }
  Blockly.utils.fields.typeMap_[type] = fieldClass;
};

/**
 * Construct a Field from a JSON arg object.
 * Finds the appropriate registered field by the type name as registered using
 * Blockly.utils.fields.register.
 * @param {!Object} options A JSON object with a type and options specific
 *     to the field type.
 * @return {Blockly.Field} The new field instance or null if a field wasn't
 *     found with the given type name
 * @package
 */
Blockly.utils.fields.fromJson = function(options) {
  var fieldClass = Blockly.utils.fields.typeMap_[options['type']];
  if (!fieldClass) {
    console.warn('Blockly could not create a field of type ' + options['type'] +
      '. The field is probably not being registered. This may be because the' +
      ' file is not loaded, the field does not register itself (See:' +
      ' github.com/google/blockly/issues/1584), or the registration is not' +
      ' being reached.');
    return null;
  }

  var field = fieldClass.fromJson(options);
  if (options['tooltip'] !== undefined) {
    var rawValue = options['tooltip'];
    var localizedText = Blockly.utils.replaceMessageReferences(rawValue);
    field.setTooltip(localizedText);
  }
  return field;
};
