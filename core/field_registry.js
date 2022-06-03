/**
 * @fileoverview Fields can be created based on a JSON definition. This file
 *    contains methods for registering those JSON definitions, and building the
 *    fields based on JSON.
 */


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
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Fields can be created based on a JSON definition. This file
 *    contains methods for registering those JSON definitions, and building the
 *    fields based on JSON.
 * @namespace Blockly.fieldRegistry
 */

/* eslint-disable-next-line no-unused-vars */
import { Field } from './field';
/* eslint-disable-next-line no-unused-vars */
import { IRegistrableField } from './interfaces/i_registrable_field';
import * as registry from './registry';


/**
 * Registers a field type.
 * fieldRegistry.fromJson uses this registry to
 * find the appropriate field type.
 * @param type The field type name as used in the JSON definition.
 * @param fieldClass The field class containing a fromJson function that can
 *     construct an instance of the field.
 * @throws {Error} if the type name is empty, the field is already registered,
 *     or the fieldClass is not an object containing a fromJson function.
 * @alias Blockly.fieldRegistry.register
 */
export function register(type: string, fieldClass: IRegistrableField) {
  registry.register(registry.Type.FIELD, type, fieldClass);
}

/**
 * Unregisters the field registered with the given type.
 * @param type The field type name as used in the JSON definition.
 * @alias Blockly.fieldRegistry.unregister
 */
export function unregister(type: string) {
  registry.unregister(registry.Type.FIELD, type);
}

/**
 * Construct a Field from a JSON arg object.
 * Finds the appropriate registered field by the type name as registered using
 * fieldRegistry.register.
 * @param options A JSON object with a type and options specific to the field
 *     type.
 * @return The new field instance or null if a field wasn't found with the given
 *     type name
 * @alias Blockly.fieldRegistry.fromJson
 */
export function fromJson(options: AnyDuringMigration): Field | null {
  const fieldObject =
    registry.getObject(registry.Type.FIELD, options['type']) as
    IRegistrableField |
    null;
  if (!fieldObject) {
    console.warn(
      'Blockly could not create a field of type ' + options['type'] +
      '. The field is probably not being registered. This could be because' +
      ' the file is not loaded, the field does not register itself (Issue' +
      ' #1584), or the registration is not being reached.');
    return null;
  }
  return fieldObject.fromJson(options);
}
