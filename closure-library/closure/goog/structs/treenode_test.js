// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.structs.TreeNodeTest');
goog.setTestOnly('goog.structs.TreeNodeTest');

goog.require('goog.structs.TreeNode');
goog.require('goog.testing.jsunit');

function testConstructor() {
  var node = new goog.structs.TreeNode('key', 'value');
  assertEquals('key', 'key', node.getKey());
  assertEquals('value', 'value', node.getValue());
  assertNull('parent', node.getParent());
  assertArrayEquals('children', [], node.getChildren());
  assertTrue('leaf', node.isLeaf());
}

function testClone() {
  var node1 = new goog.structs.TreeNode(1, '1');
  var node2 = new goog.structs.TreeNode(2, '2');
  var node3 = new goog.structs.TreeNode(3, '3');
  node1.addChild(node2);
  node2.addChild(node3);

  var clone = node2.clone();
  assertEquals('key', 2, clone.getKey());
  assertEquals('value', '2', clone.getValue());
  assertNull('parent', clone.getParent());
  assertArrayEquals('children', [], clone.getChildren());
}

function testDeepClone() {
  var node1 = new goog.structs.TreeNode(1, '1');
  var node2 = new goog.structs.TreeNode(2, '2');
  var node3 = new goog.structs.TreeNode(3, '3');
  node1.addChild(node2);
  node2.addChild(node3);

  var clone = node2.deepClone();
  assertEquals('key', 2, clone.getKey());
  assertEquals('value', '2', clone.getValue());
  assertNull('parent', clone.getParent());
  assertEquals('number of children', 1, clone.getChildren().length);
  assertEquals('first child key', 3, clone.getChildAt(0).getKey());
  assertNotEquals('first child has been cloned', node3, clone.getChildAt(0));
}

function testGetParent() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  node1.addChild(node2);
  assertEquals('parent', node1, node2.getParent());
  assertNull('orphan', node1.getParent());
}

function testIsLeaf() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  node1.addChild(node2);
  assertFalse('not leaf', node1.isLeaf());
  assertTrue('leaf', node2.isLeaf());
}

function testIsLastChild() {
  var node1 = new goog.structs.TreeNode(1, '1');
  var node2 = new goog.structs.TreeNode(2, '2');
  var node3 = new goog.structs.TreeNode(3, '3');
  node1.addChild(node2);
  node1.addChild(node3);
  assertFalse('root', node1.isLastChild());
  assertFalse('first child out of the two', node2.isLastChild());
  assertTrue('second child out of the two', node3.isLastChild());
}

function testGetChildren() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  node1.addChild(node2);
  assertArrayEquals('1 child', [node2], node1.getChildren());
  assertArrayEquals('no children', [], node2.getChildren());
}

function testGetChildAt() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  node1.addChild(node2);
  assertNull('index too low', node1.getChildAt(-1));
  assertEquals('first child', node2, node1.getChildAt(0));
  assertNull('index too high', node1.getChildAt(1));
  assertNull('no children', node2.getChildAt(0));
}

function testGetChildCount() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  node1.addChild(node2);
  assertEquals('child count of root node', 1, node1.getChildCount());
  assertEquals('child count of leaf node', 0, node2.getChildCount());
}

function testGetDepth() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  node1.addChild(node2);
  node2.addChild(node3);
  assertEquals('no parent', 0, node1.getDepth());
  assertEquals('1 ancestor', 1, node2.getDepth());
  assertEquals('2 ancestors', 2, node3.getDepth());
}

function testGetAncestors() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  node1.addChild(node2);
  node2.addChild(node3);
  assertArrayEquals('no ancestors', [], node1.getAncestors());
  assertArrayEquals('2 ancestors', [node2, node1], node3.getAncestors());
}

function testGetRoot() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  node1.addChild(node2);
  assertEquals('no ancestors', node1, node1.getRoot());
  assertEquals('has ancestors', node1, node2.getRoot());
}

function testGetSubtreeKeys() {
  var root = new goog.structs.TreeNode('root', null);
  var child1 = new goog.structs.TreeNode('child1', null);
  var child2 = new goog.structs.TreeNode('child2', null);
  var grandchild = new goog.structs.TreeNode('grandchild', null);
  root.addChild(child1);
  root.addChild(child2);
  child1.addChild(grandchild);
  assertArrayEquals('node hierarchy', ['child1', ['grandchild'], 'child2'],
      root.getSubtreeKeys());
}

function testContains() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  var node4 = new goog.structs.TreeNode(4, null);
  node1.addChild(node2);
  node2.addChild(node3);
  node2.addChild(node4);

  assertTrue('parent', node1.contains(node2));
  assertTrue('grandparent', node1.contains(node3));
  assertFalse('child', node2.contains(node1));
  assertFalse('grandchild', node3.contains(node1));
  assertFalse('sibling', node3.contains(node4));
}

function testFindCommonAncestor() {
  var findCommonAncestor = goog.structs.TreeNode.findCommonAncestor;
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  var node4 = new goog.structs.TreeNode(4, null);
  var node5 = new goog.structs.TreeNode(5, null);
  node1.addChild(node2);
  node2.addChild(node3);
  node1.addChild(node4);

  assertNull('0 nodes', findCommonAncestor());
  assertEquals('1 node', node2, findCommonAncestor(node2));
  assertEquals('same nodes', node3, findCommonAncestor(node3, node3));
  assertEquals('node and child node', node2, findCommonAncestor(node2, node3));
  assertEquals('node and parent node', node1, findCommonAncestor(node2, node1));
  assertEquals('siblings', node1, findCommonAncestor(node2, node4));
  assertEquals('all nodes', node1,
      findCommonAncestor(node2, node3, node4, node1));
  assertNull('disconnected nodes', findCommonAncestor(node3, node5));
}

function testGetNodeByKey() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  var node4 = new goog.structs.TreeNode(4, null);
  var node5 = new goog.structs.TreeNode(2, null);
  var node6 = new goog.structs.TreeNode(3, null);
  node1.addChild(node2);
  node2.addChild(node3);
  node1.addChild(node4);
  node4.addChild(node5);
  node1.addChild(node6);

  assertEquals('root', node1, node1.getNodeByKey(1));
  assertEquals('child with unique key', node5, node4.getNodeByKey(2));
  assertEquals('child with duplicate keys', node2, node1.getNodeByKey(2));
  assertEquals('grandchild with duplicate keys', node3, node1.getNodeByKey(3));
  assertNull('disconnected', node2.getNodeByKey(4));
  assertNull('missing', node1.getNodeByKey(5));
}

function testForEachChild() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  node1.addChild(node2);
  node1.addChild(node3);

  var thisContext = {};
  var visitedNodes = [];
  var indices = [];
  node1.forEachChild(function(node, index, children) {
    assertEquals('value of this', thisContext, this);
    visitedNodes.push(node);
    indices.push(index);
    assertArrayEquals('children argument', [node2, node3], children);
  }, thisContext);
  assertArrayEquals('visited nodes', [node2, node3], visitedNodes);
  assertArrayEquals('index of visited nodes', [0, 1], indices);
}

function testForEachDescendant() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  var node4 = new goog.structs.TreeNode(4, null);
  node1.addChild(node2);
  node2.addChild(node3);
  node2.addChild(node4);

  var thisContext = {};
  var visitedNodes = [];
  node1.forEachDescendant(function(node) {
    assertEquals('value of this', thisContext, this);
    visitedNodes.push(node);
  }, thisContext);
  assertArrayEquals('visited nodes', [node2, node3, node4], visitedNodes);
}

function testTraverse() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  var node4 = new goog.structs.TreeNode(4, null);
  node1.addChild(node2);
  node2.addChild(node3);
  node2.addChild(node4);

  var thisContext = {};
  var visitedNodes = [];
  node1.traverse(function(node) {
    assertEquals('value of this', thisContext, this);
    visitedNodes.push(node);
  }, thisContext);
  assertArrayEquals('callback returns nothing => all nodes are visited',
      [node1, node2, node3, node4], visitedNodes);

  visitedNodes = [];
  node1.traverse(function(node) {
    visitedNodes.push(node);
    return node != node2;  // Cut off at node2.
  });
  assertArrayEquals('children of node2 are skipped',
      [node1, node2], visitedNodes);
}

function testAddChild() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  assertArrayEquals('0 children', [], node1.getChildren());
  node1.addChild(node2);
  assertArrayEquals('1 child', [node2], node1.getChildren());
  assertEquals('parent is set', node1, node2.getParent());
  node1.addChild(node3);
  assertArrayEquals('2 children', [node2, node3], node1.getChildren());
}

function testAddChildAt() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  var node4 = new goog.structs.TreeNode(4, null);
  var node5 = new goog.structs.TreeNode(5, null);
  node1.addChildAt(node2, 0);
  assertArrayEquals('add first child', [node2], node1.getChildren());
  assertEquals('parent is set', node1, node2.getParent());
  node1.addChildAt(node3, 0);
  assertArrayEquals('add to the front', [node3, node2],
      node1.getChildren());
  node1.addChildAt(node4, 1);
  assertArrayEquals('add to the middle', [node3, node4, node2],
      node1.getChildren());
  node1.addChildAt(node5, 3);
  assertArrayEquals('add to the end', [node3, node4, node2, node5],
      node1.getChildren());
}

function testReplaceChildAt() {
  var root = new goog.structs.TreeNode(0, null);
  var node1 = new goog.structs.TreeNode(1, null);
  root.addChild(node1);

  var node2 = new goog.structs.TreeNode(2, null);
  assertEquals('original node', node1, root.replaceChildAt(node2, 0));
  assertEquals('parent is set', root, node2.getParent());
  assertArrayEquals('children are updated', [node2], root.getChildren());
  assertNull('old child node is detached', node1.getParent());
}

function testReplaceChild() {
  var root = new goog.structs.TreeNode(0, null);
  var node1 = new goog.structs.TreeNode(1, null);
  root.addChild(node1);

  var node2 = new goog.structs.TreeNode(2, null);
  assertEquals('original node', node1, root.replaceChild(node2, node1));
  assertEquals('parent is set', root, node2.getParent());
  assertArrayEquals('children are updated', [node2], root.getChildren());
  assertNull('old child node is detached', node1.getParent());
}

function testRemoveChildAt() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  node1.addChild(node2);
  node1.addChild(node3);

  assertNull('index too low', node1.removeChildAt(-1));
  assertNull('index too high', node1.removeChildAt(2));
  assertArrayEquals('node1 is intact', [node2, node3], node1.getChildren());

  assertEquals('remove first child', node2, node1.removeChildAt(0));
  assertArrayEquals('remove from the front', [node3], node1.getChildren());
  assertNull('parent is unset', node2.getParent());

  assertEquals('remove last child', node3, node1.removeChildAt(0));
  assertArrayEquals('remove last child', [], node1.getChildren());
  assertTrue('node1 became leaf', node1.isLeaf());
}

function testRemoveChild() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  node1.addChild(node2);
  node1.addChild(node3);

  assertNull('remove null', node1.removeChild(null));
  assertNull('remove non-child', node1.removeChild(node1));
  assertArrayEquals('node1 is intact', [node2, node3], node1.getChildren());

  assertEquals('remove node3, return value', node3, node1.removeChild(node3));
  assertArrayEquals('node is removed', [node2], node1.getChildren());
}

function testRemoveChildren() {
  var node1 = new goog.structs.TreeNode(1, null);
  var node2 = new goog.structs.TreeNode(2, null);
  var node3 = new goog.structs.TreeNode(3, null);
  node1.addChild(node2);
  node1.addChild(node3);

  node2.removeChildren();
  assertArrayEquals('removing a leaf node\'s children has no effect', [],
      node2.getChildren());
  assertEquals('node still has parent', node1, node2.getParent());

  node1.removeChildren();
  assertArrayEquals('children have been removed', [], node1.getChildren());
  assertNull('children\'s parents have been unset', node2.getParent());
}
