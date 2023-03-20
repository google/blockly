/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.utils.object');

import * as deprecation from './deprecation.js';


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * @param childCtor Child class.
 * @param parentCtor Parent class.
 * @suppress {strictMissingProperties} superClass_ is not defined on Function.
 * @deprecated No longer provided by Blockly.
 */
export function inherits(childCtor: Function, parentCtor: Function) {
  deprecation.warn('Blockly.utils.object.inherits', 'version 9', 'version 10');
  // Set a .superClass_ property so that methods can call parent methods
  // without hard-coding the parent class name.
  // Could be replaced by ES6's super().
  // AnyDuringMigration because:  Property 'superClass_' does not exist on type
  // 'Function'.
  (childCtor as AnyDuringMigration).superClass_ = parentCtor.prototype;

  // Link the child class to the parent class so that static methods inherit.
  Object.setPrototypeOf(childCtor, parentCtor);

  // Replace the child constructor's prototype object with an instance
  // of the parent class.
  childCtor.prototype = Object.create(parentCtor.prototype);
  childCtor.prototype.constructor = childCtor;
}
// Alternatively, one could use this instead:
// Object.setPrototypeOf(childCtor.prototype, parentCtor.prototype);

/**
 * Copies all the members of a source object to a target object.
 *
 * @param target Target.
 * @param source Source.
 * @deprecated Use the built-in **Object.assign** instead.
 */
export function mixin(target: AnyDuringMigration, source: AnyDuringMigration) {
  deprecation.warn(
      'Blockly.utils.object.mixin', 'May 2022', 'May 2023', 'Object.assign');
  for (const x in source) {
    target[x] = source[x];
  }
}

/**
 * Complete a deep merge of all members of a source object with a target object.
 *
 * @param target Target.
 * @param source Source.
 * @returns The resulting object.
 */
export function deepMerge(
    target: AnyDuringMigration,
    source: AnyDuringMigration): AnyDuringMigration {
  for (const x in source) {
    if (source[x] !== null && typeof source[x] === 'object') {
      target[x] = deepMerge(target[x] || Object.create(null), source[x]);
    } else {
      target[x] = source[x];
    }
  }
  return target;
}

/**
 * Returns an array of a given object's own enumerable property values.
 *
 * @param obj Object containing values.
 * @returns Array of values.
 * @deprecated Use the built-in **Object.values** instead.
 */
export function values(obj: AnyDuringMigration): AnyDuringMigration[] {
  deprecation.warn(
      'Blockly.utils.object.values', 'version 9', 'version 10',
      'Object.values');
  return Object.values(obj);
}
