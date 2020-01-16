// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Datastructure: Set.
 *
 * @author arv@google.com (Erik Arvidsson)
 *
 * This class implements a set data structure. Adding and removing is O(1). It
 * supports both object and primitive values. Be careful because you can add
 * both 1 and new Number(1), because these are not the same. You can even add
 * multiple new Number(1) because these are not equal.
 */


goog.provide('Blockly.Set');

goog.require('Blockly.Map');



/**
 * A set that can contain both primitives and objects.  Adding and removing
 * elements is O(1).  Primitives are treated as identical if they have the same
 * type and convert to the same string.  Objects are treated as identical only
 * if they are references to the same object.  WARNING: A Blockly.Set can
 * contain both 1 and (new Number(1)), because they are not the same.  WARNING:
 * Adding (new Number(1)) twice will yield two distinct elements, because they
 * are two different objects.  WARNING: Any object that is added to a
 * Blockly.Set will be modified!  Because getUid() is used to
 * identify objects, every object in the set will be mutated.
 * @param {Array<T>|Object<?,T>=} opt_values Initial values to start with.
 * @constructor
 * @final
 * @template T
 */
Blockly.Set = function(opt_values) {
  this.map_ = new Blockly.Map;
  if (opt_values) {
    this.addAll(opt_values);
  }
};


/**
 * Obtains a unique key for an element of the set.  Primitives will yield the
 * same key if they have the same type and convert to the same string.  Object
 * references will yield the same key only if they refer to the same object.
 * @param {*} val Object or primitive value to get a key for.
 * @return {string} A unique key for this value/object.
 * @private
 */
Blockly.Set.getKey_ = function(val) {
  var type = typeof val;
  if (type == 'object' && val || type == 'function') {
    //TODO: Better way to deal with objects
    return val;
    // return 'o' + goog.getUid(/** @type {Object} */ (val));
  } else {
    return type.substr(0, 1) + val;
  }
};

Blockly.Set.getUid = function (val) {

};


/**
 * @return {number} The number of elements in the set.
 * @override
 */
Blockly.Set.prototype.getCount = function() {
  return this.map_.getCount();
};


/**
 * Add a primitive or an object to the set.
 * @param {T} element The primitive or object to add.
 * @override
 */
Blockly.Set.prototype.add = function(element) {
  this.map_.set(Blockly.Set.getKey_(element), element);
};


/**
 * Adds all the values in the given collection to this set.
 * @param {Array<T>|Object<?,T>} col A collection
 *     containing the elements to add.
 */
Blockly.Set.prototype.addAll = function(col) {
  var values = Blockly.Set.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.add(values[i]);
  }
};


/**
 * Removes all values in the given collection from this set.
 * @param {Array<T>|Object<?,T>} col A collection
 *     containing the elements to remove.
 */
Blockly.Set.prototype.removeAll = function(col) {
  var values = Blockly.Set.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.remove(values[i]);
  }
};


/**
 * Removes the given element from this set.
 * @param {T} element The primitive or object to remove.
 * @return {boolean} Whether the element was found and removed.
 * @override
 */
Blockly.Set.prototype.remove = function(element) {
  return this.map_.remove(Blockly.Set.getKey_(element));
};


/**
 * Removes all elements from this set.
 */
Blockly.Set.prototype.clear = function() {
  this.map_.clear();
};


/**
 * Tests whether this set is empty.
 * @return {boolean} True if there are no elements in this set.
 */
Blockly.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty();
};


/**
 * Tests whether this set contains the given element.
 * @param {T} element The primitive or object to test for.
 * @return {boolean} True if this set contains the given element.
 * @override
 */
Blockly.Set.prototype.contains = function(element) {
  return this.map_.containsKey(Blockly.Set.getKey_(element));
};


// /**
//  * Tests whether this set contains all the values in a given collection.
//  * Repeated elements in the collection are ignored, e.g.  (new
//  * Blockly.Set([1, 2])).containsAll([1, 1]) is True.
//  * @param {goog.structs.Collection<T>|Object} col A collection-like object.
//  * @return {boolean} True if the set contains all elements.
//  */
// Blockly.Set.prototype.containsAll = function(col) {
//   return goog.structs.every(col, this.contains, this);
// };


/**
 * Finds all values that are present in both this set and the given collection.
 * @param {Array<S>|Object<?,S>} col A collection.
 * @return {!Blockly.Set<T|S>} A new set containing all the values
 *     (primitives or objects) present in both this set and the given
 *     collection.
 * @template S
 */
Blockly.Set.prototype.intersection = function(col) {
  var result = new Blockly.Set();

  var values = Blockly.Set.getValues(col);
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    if (this.contains(value)) {
      result.add(value);
    }
  }

  return result;
};


/**
 * Finds all values that are present in this set and not in the given
 * collection.
 * @param {Array<T>|Object<?,T>} col A collection.
 * @return {!Blockly.Set} A new set containing all the values
 *     (primitives or objects) present in this set but not in the given
 *     collection.
 */
Blockly.Set.prototype.difference = function(col) {
  var result = this.clone();
  result.removeAll(col);
  return result;
};


/**
 * Returns an array containing all the elements in this set.
 * @return {!Array<T>} An array containing all the elements in this set.
 */
Blockly.Set.prototype.getValues = function() {
  return this.map_.getValues();
};


/**
 * Creates a shallow clone of this set.
 * @return {!Blockly.Set<T>} A new set containing all the same elements as
 *     this set.
 */
Blockly.Set.prototype.clone = function() {
  return new Blockly.Set(this);
};


/**
 * Tests whether the given collection consists of the same elements as this set,
 * regardless of order, without repetition.  Primitives are treated as equal if
 * they have the same type and convert to the same string; objects are treated
 * as equal if they are references to the same object.  This operation is O(n).
 * @param {Object} col A collection.
 * @return {boolean} True if the given collection consists of the same elements
 *     as this set, regardless of order, without repetition.
 */
Blockly.Set.prototype.equals = function(col) {
  return this.getCount() == Blockly.Set.getCount(col) && this.isSubsetOf(col);
};


/**
 * Tests whether the given collection contains all the elements in this set.
 * Primitives are treated as equal if they have the same type and convert to the
 * same string; objects are treated as equal if they are references to the same
 * object.  This operation is O(n).
 * @param {Object} col A collection.
 * @return {boolean} True if this set is a subset of the given collection.
 */
Blockly.Set.prototype.isSubsetOf = function(col) {
  var colCount = Blockly.Set.getCount(col);
  if (this.getCount() > colCount) {
    return false;
  }
  // TODO(user) Find the minimal collection size where the conversion makes
  // the contains() method faster.
  if (!(col instanceof Blockly.Set) && colCount > 5) {
    // Convert to a Blockly.Set so that runs in
    // O(1) time instead of O(n) time.
    col = new Blockly.Set(col);
  }
  return Blockly.Set.every(this, function(value) {
    return Blockly.Set.contains(col, value);
  });
};


// /**
//  * Returns an iterator that iterates over the elements in this set.
//  * @param {boolean=} opt_keys This argument is ignored.
//  * @return {!goog.iter.Iterator} An iterator over the elements in this set.
//  */
// Blockly.Set.prototype.__iterator__ = function(opt_keys) {
//   return this.map_.__iterator__(false);
// };

/**
 * Returns the keys of the collection. Some collections have no notion of
 * keys/indexes and this function will return undefined in those cases.
 * @param {Object} col The collection-like object.
 * @return {!Array|undefined} The keys in the collection.
 */
Blockly.Set.getKeys = function(col) {
  if (typeof col.getKeys == 'function') {
    return col.getKeys();
  }
  // if we have getValues but no getKeys we know this is a key-less collection
  if (typeof col.getValues == 'function') {
    return undefined;
  }

  try {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(i);
    }
    return rv;
  }
  catch (e) {
    console.warn(e.message);
  }

  var res = [];
  var i = 0;
  for (var key in col) {
    res[i++] = key;
  }
  return res;
};

/**
 * Returns the values of the collection-like object.
 * @param {Object} col The collection-like object.
 * @return {!Array<?>} The values in the collection-like object.
 */
Blockly.Set.getValues = function(col) {
  if (typeof col.getValues == 'function') {
    return col.getValues();
  }
  if (typeof col == 'string') {
    return col.split('');
  }

  try {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(col[i]);
    }
    return rv;
  }
  catch (e) {
    console.warn(e.message);
  }

  var res = [];
  var i = 0;
  for (var key in col) {
    res[i++] = col[key];
  }
  return res;
};

/**
 * Returns the number of values in the collection-like object.
 * @param {Object} col The collection-like object.
 * @return {number} The number of values in the collection-like object.
 */
Blockly.Set.getCount = function(col) {
  if (typeof col.getCount == 'function') {
    return col.getCount();
  }

  if (col.length) {
    return col.length;
  }
  
  var rv = 0;
  for (var key in col) {
    rv++;
  }
  return rv;
};

Blockly.Set.every = function (col) {
  var keys = Blockly.Set.getKeys(col);
  var values = Blockly.Set.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return false;
    }
  }
  return true;
};


/**
 * Whether the object/map/hash contains the given value. This is O(n).
 *
 * @param {Object<K,V>} obj The object in which to look for val.
 * @param {V} val The value for which to check.
 * @return {boolean} true If the map contains the value.
 * @template K,V
 */
Blockly.Set.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
};