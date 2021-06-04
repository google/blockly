/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for objects.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

/**
 * @name Blockly.utils.object
 * @namespace
 */
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
 * Complete a deep merge of all members of a source object with a target object.
 * @param {!Object} target Target.
 * @param {!Object} source Source.
 * @return {!Object} The resulting object.
 */
Blockly.utils.object.deepMerge = function(target, source) {
  for (var x in source) {
    if (source[x] != null && typeof source[x] === 'object') {
      target[x] = Blockly.utils.object.deepMerge(
          target[x] || Object.create(null), source[x]);
    } else {
      target[x] = source[x];
    }
  }
  return target;
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
