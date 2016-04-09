// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.tree.TreeControlTest');
goog.setTestOnly('goog.ui.tree.TreeControlTest');

goog.require('goog.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.tree.TreeControl');
function makeATree() {
  var tree = new goog.ui.tree.TreeControl('root');
  var testData = [
    'A',
    [['AA', [['AAA', []], ['AAB', []]]], ['AB', [['ABA', []], ['ABB', []]]]]
  ];

  createTreeFromTestData(tree, testData, 3);
  tree.render(goog.dom.getElement('treeContainer'));
  return tree;
}

function createTreeFromTestData(node, data, maxLevels) {
  node.setHtml(data[0]);
  if (maxLevels < 0) {
    return;
  }

  var children = data[1];
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    var childNode = node.getTree().createNode('');
    node.add(childNode);
    createTreeFromTestData(childNode, child, maxLevels - 1);
  }
}


/**
 * Test moving a node to a greater depth.
 */
function testIndent() {
  var tree = makeATree();
  tree.expandAll();

  var node = tree.getChildren()[0].getChildren()[0];
  assertEquals('AAA', node.getHtml());
  assertNotNull(node.getElement());
  assertEquals('19px', node.getRowElement().style.paddingLeft);

  assertEquals(2, node.getDepth());

  var newParent = node.getNextSibling();
  assertEquals('AAB', newParent.getHtml());
  assertEquals(2, newParent.getDepth());

  newParent.add(node);

  assertEquals(newParent, node.getParent());
  assertEquals(node, newParent.getChildren()[0]);
  assertEquals(3, node.getDepth());
  assertEquals('38px', node.getRowElement().style.paddingLeft);
}


/**
 * Test moving a node to a lesser depth.
 */
function testOutdent() {
  var tree = makeATree();
  tree.expandAll();

  var node = tree.getChildren()[0].getChildren()[0];
  assertEquals('AAA', node.getHtml());
  assertNotNull(node.getElement());
  assertEquals('19px', node.getRowElement().style.paddingLeft);

  assertEquals(2, node.getDepth());

  var newParent = tree;
  assertEquals('A', newParent.getHtml());
  assertEquals(0, newParent.getDepth());

  newParent.add(node);

  assertEquals(newParent, node.getParent());
  assertEquals(node, newParent.getChildren()[2]);
  assertEquals(1, node.getDepth());
  assertEquals('0px', node.getRowElement().style.paddingLeft);
}
