/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.fieldRegistry

import type {Field, FieldProto} from './field.js';
import * as registry from './registry.js';

interface RegistryOptions {
  type: string;
  [key: string]: unknown;
}

/**
 * Registers a field type.
 * fieldRegistry.fromJson uses this registry to
 * find the appropriate field type.
 *
 * @param type The field type name as used in the JSON definition.
 * @param fieldClass The field class containing a fromJson function that can
 *     construct an instance of the field.
 * @throws {Error} if the type name is empty, the field is already registered,
 *     or the fieldClass is not an object containing a fromJson function.
 */
export function register(type: string, fieldClass: FieldProto) {
  registry.register(registry.Type.FIELD, type, fieldClass);
}

/**
 * Unregisters the field registered with the given type.
 *
 * @param type The field type name as used in the JSON definition.
 */
export function unregister(type: string) {
  registry.unregister(registry.Type.FIELD, type);
}

/**
 * Construct a Field from a JSON arg object.
 * Finds the appropriate registered field by the type name as registered using
 * fieldRegistry.register.
 *
 * @param options A JSON object with a type and options specific to the field
 *     type.
 * @returns The new field instance or null if a field wasn't found with the
 *     given type name
 * @internal
 */
export function fromJson<T>(options: RegistryOptions): Field<T> | null {
  return TEST_ONLY.fromJsonInternal(options);
}

/**
 * Private version of fromJson for stubbing in tests.
 *
 * @param options
 */
function fromJsonInternal<T>(options: RegistryOptions): Field<T> | null {
  const fieldObject = registry.getObject(registry.Type.FIELD, options.type);
  if (!fieldObject) {
    console.warn(
      'Blockly could not create a field of type ' +
        options['type'] +
        '. The field is probably not being registered. This could be because' +
        ' the file is not loaded, the field does not register itself (Issue' +
        ' #1584), or the registration is not being reached.',
    );
    return null;
  } else if (typeof (fieldObject as any).fromJson !== 'function') {
    throw new TypeError('returned Field was not a IRegistrableField');
  } else {
    type fromJson = (options: {}) => Field<T>;
    return (fieldObject as unknown as {fromJson: fromJson}).fromJson(options);
  }
}

export const TEST_ONLY = {
  fromJsonInternal,
};
