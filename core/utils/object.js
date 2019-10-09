/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Utility methods for objects.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.utils.object');


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * @param {!Function} childCtor Child class.
 * @param {!Function} parentCtor Parent class.
 * @suppress {strictMissingProperties} superClass_ is not defined on Function.
 */
Blockly.utils.object.inherits = function(childCtor, parentCtor) {
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = Object.create(parentCtor.prototype);
  childCtor.prototype.constructor = childCtor;
};

/**
 * Copies all the members of a source object to a target object.
 * @param {!Object} target Target.
 * @param {!Object} source Source.
 */
Blockly.utils.object.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }
};

/**
 * Returns an array of a given object's own enumerable property values.
 * @param {!Object} obj Object containing values.
 * @return {!Array} Array of values.
 */
Blockly.utils.object.values = function(obj) {
  if (Object.values) {
    return Object.values(obj);
  }
  // Fallback for IE.
  return Object.keys(obj).map(function(e) {
    return obj[e];
  });
};
