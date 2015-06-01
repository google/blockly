// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.structs.AvlTreeTest');
goog.setTestOnly('goog.structs.AvlTreeTest');

goog.require('goog.array');
goog.require('goog.structs.AvlTree');
goog.require('goog.testing.jsunit');


/**
 * This test verifies that we can insert strings into the AvlTree and have
 * them be stored and sorted correctly by the default comparator.
 */
function testInsertsWithDefaultComparator() {
  var tree = new goog.structs.AvlTree();
  var values = ['bill', 'blake', 'elliot', 'jacob', 'john', 'myles', 'ted'];

  // Insert strings into tree out of order
  tree.add(values[4]);
  tree.add(values[3]);
  tree.add(values[0]);
  tree.add(values[6]);
  tree.add(values[5]);
  tree.add(values[1]);
  tree.add(values[2]);

  // Verify strings are stored in sorted order
  var i = 0;
  tree.inOrderTraverse(function(value) {
    assertEquals(values[i], value);
    i += 1;
  });
  assertEquals(i, values.length);

  // Verify that no nodes are visited if the start value is larger than all
  // values
  tree.inOrderTraverse(function(value) {
    fail();
  }, 'zed');

  // Verify strings are stored in sorted order
  i = values.length;
  tree.reverseOrderTraverse(function(value) {
    i--;
    assertEquals(values[i], value);
  });
  assertEquals(i, 0);

  // Verify that no nodes are visited if the start value is smaller than all
  // values
  tree.reverseOrderTraverse(function(value) {
    fail();
  }, 'aardvark');
}


/**
 * This test verifies that we can insert strings into and remove strings from
 * the AvlTree and have the only the non-removed values be stored and sorted
 * correctly by the default comparator.
 */
function testRemovesWithDefaultComparator() {
  var tree = new goog.structs.AvlTree();
  var values = ['bill', 'blake', 'elliot', 'jacob', 'john', 'myles', 'ted'];

  // Insert strings into tree out of order
  tree.add('frodo');
  tree.add(values[4]);
  tree.add(values[3]);
  tree.add(values[0]);
  tree.add(values[6]);
  tree.add('samwise');
  tree.add(values[5]);
  tree.add(values[1]);
  tree.add(values[2]);
  tree.add('pippin');

  // Remove strings from tree
  assertEquals(tree.remove('samwise'), 'samwise');
  assertEquals(tree.remove('pippin'), 'pippin');
  assertEquals(tree.remove('frodo'), 'frodo');
  assertEquals(tree.remove('merry'), null);


  // Verify strings are stored in sorted order
  var i = 0;
  tree.inOrderTraverse(function(value) {
    assertEquals(values[i], value);
    i += 1;
  });
  assertEquals(i, values.length);
}


/**
 * This test verifies that we can insert values into and remove values from
 * the AvlTree and have them be stored and sorted correctly by a custom
 * comparator.
 */
function testInsertsAndRemovesWithCustomComparator() {
  var tree = new goog.structs.AvlTree(function(a, b) {
    return a - b;
  });

  var NUM_TO_INSERT = 37;
  var valuesToRemove = [1, 0, 6, 7, 36];

  // Insert ints into tree out of order
  var values = [];
  for (var i = 0; i < NUM_TO_INSERT; i += 1) {
    tree.add(i);
    values.push(i);
  }

  for (var i = 0; i < valuesToRemove.length; i += 1) {
    assertEquals(tree.remove(valuesToRemove[i]), valuesToRemove[i]);
    goog.array.remove(values, valuesToRemove[i]);
  }
  assertEquals(tree.remove(-1), null);
  assertEquals(tree.remove(37), null);

  // Verify strings are stored in sorted order
  var i = 0;
  tree.inOrderTraverse(function(value) {
    assertEquals(values[i], value);
    i += 1;
  });
  assertEquals(i, values.length);
}


/**
 * This test verifies that we can insert values into and remove values from
 * the AvlTree and have it maintain the AVL-Tree upperbound on its height.
 */
function testAvlTreeHeight() {
  var tree = new goog.structs.AvlTree(function(a, b) {
    return a - b;
  });

  var NUM_TO_INSERT = 2000;
  var NUM_TO_REMOVE = 500;

  // Insert ints into tree out of order
  for (var i = 0; i < NUM_TO_INSERT; i += 1) {
    tree.add(i);
  }

  // Remove valuse
  for (var i = 0; i < NUM_TO_REMOVE; i += 1) {
    tree.remove(i);
  }

  assertTrue(tree.getHeight() <= 1.4405 *
      (Math.log(NUM_TO_INSERT - NUM_TO_REMOVE + 2) / Math.log(2)) - 1.3277);
}


/**
 * This test verifies that we can insert values into and remove values from
 * the AvlTree and have its contains method correctly determine the values it
 * is contains.
 */
function testAvlTreeContains() {
  var tree = new goog.structs.AvlTree();
  var values = ['bill', 'blake', 'elliot', 'jacob', 'john', 'myles', 'ted'];

  // Insert strings into tree out of order
  tree.add('frodo');
  tree.add(values[4]);
  tree.add(values[3]);
  tree.add(values[0]);
  tree.add(values[6]);
  tree.add('samwise');
  tree.add(values[5]);
  tree.add(values[1]);
  tree.add(values[2]);
  tree.add('pippin');

  // Remove strings from tree
  assertEquals(tree.remove('samwise'), 'samwise');
  assertEquals(tree.remove('pippin'), 'pippin');
  assertEquals(tree.remove('frodo'), 'frodo');

  for (var i = 0; i < values.length; i += 1) {
    assertTrue(tree.contains(values[i]));
  }
  assertFalse(tree.contains('samwise'));
  assertFalse(tree.contains('pippin'));
  assertFalse(tree.contains('frodo'));
}


/**
 * This test verifies that we can insert values into and remove values from
 * the AvlTree and have its indexOf method correctly determine the in-order
 * index of the values it contains.
 */
function testAvlTreeIndexOf() {
  var tree = new goog.structs.AvlTree();
  var values = ['bill', 'blake', 'elliot', 'jacob', 'john', 'myles', 'ted'];

  // Insert strings into tree out of order
  tree.add('frodo');
  tree.add(values[4]);
  tree.add(values[3]);
  tree.add(values[0]);
  tree.add(values[6]);
  tree.add('samwise');
  tree.add(values[5]);
  tree.add(values[1]);
  tree.add(values[2]);
  tree.add('pippin');

  // Remove strings from tree
  assertEquals('samwise', tree.remove('samwise'));
  assertEquals('pippin', tree.remove('pippin'));
  assertEquals('frodo', tree.remove('frodo'));

  for (var i = 0; i < values.length; i += 1) {
    assertEquals(i, tree.indexOf(values[i]));
  }
  assertEquals(-1, tree.indexOf('samwise'));
  assertEquals(-1, tree.indexOf('pippin'));
  assertEquals(-1, tree.indexOf('frodo'));
}


/**
 * This test verifies that we can insert values into and remove values from
 * the AvlTree and have its minValue and maxValue routines return the correct
 * min and max values contained by the tree.
 */
function testMinAndMaxValues() {
  var tree = new goog.structs.AvlTree(function(a, b) {
    return a - b;
  });

  var NUM_TO_INSERT = 2000;
  var NUM_TO_REMOVE = 500;

  // Insert ints into tree out of order
  for (var i = 0; i < NUM_TO_INSERT; i += 1) {
    tree.add(i);
  }

  // Remove valuse
  for (var i = 0; i < NUM_TO_REMOVE; i += 1) {
    tree.remove(i);
  }

  assertEquals(tree.getMinimum(), NUM_TO_REMOVE);
  assertEquals(tree.getMaximum(), NUM_TO_INSERT - 1);
}


/**
 * This test verifies that we can insert values into and remove values from
 * the AvlTree and traverse the tree in reverse order using the
 * reverseOrderTraverse routine.
 */
function testReverseOrderTraverse() {
  var tree = new goog.structs.AvlTree(function(a, b) {
    return a - b;
  });

  var NUM_TO_INSERT = 2000;
  var NUM_TO_REMOVE = 500;

  // Insert ints into tree out of order
  for (var i = 0; i < NUM_TO_INSERT; i += 1) {
    tree.add(i);
  }

  // Remove valuse
  for (var i = 0; i < NUM_TO_REMOVE; i += 1) {
    tree.remove(i);
  }

  var i = NUM_TO_INSERT - 1;
  tree.reverseOrderTraverse(function(value) {
    assertEquals(value, i);
    i -= 1;
  });
  assertEquals(i, NUM_TO_REMOVE - 1);
}


/**
 * Verifies correct behavior of getCount(). See http://b/4347755
 */
function testGetCountBehavior() {
  var tree = new goog.structs.AvlTree();
  tree.add(1);
  tree.remove(1);
  assertEquals(0, tree.getCount());

  var values = ['bill', 'blake', 'elliot', 'jacob', 'john', 'myles', 'ted'];

  // Insert strings into tree out of order
  tree.add('frodo');
  tree.add(values[4]);
  tree.add(values[3]);
  tree.add(values[0]);
  tree.add(values[6]);
  tree.add('samwise');
  tree.add(values[5]);
  tree.add(values[1]);
  tree.add(values[2]);
  tree.add('pippin');
  assertEquals(10, tree.getCount());
  assertEquals(
      tree.root_.left.count + tree.root_.right.count + 1, tree.getCount());

  // Remove strings from tree
  assertEquals('samwise', tree.remove('samwise'));
  assertEquals('pippin', tree.remove('pippin'));
  assertEquals('frodo', tree.remove('frodo'));
  assertEquals(null, tree.remove('merry'));
  assertEquals(7, tree.getCount());

  assertEquals(
      tree.root_.left.count + tree.root_.right.count + 1, tree.getCount());
}


/**
 * This test verifies that getKthOrder gets the correct value.
 */
function testGetKthOrder() {
  var tree = new goog.structs.AvlTree(function(a, b) {
    return a - b;
  });

  var NUM_TO_INSERT = 2000;
  var NUM_TO_REMOVE = 500;

  // Insert ints into tree out of order
  for (var i = 0; i < NUM_TO_INSERT; i += 1) {
    tree.add(i);
  }

  // Remove values.
  for (var i = 0; i < NUM_TO_REMOVE; i += 1) {
    tree.remove(i);
  }
  for (var k = 0; k < tree.getCount(); ++k) {
    assertEquals(NUM_TO_REMOVE + k, tree.getKthValue(k));
  }
}
