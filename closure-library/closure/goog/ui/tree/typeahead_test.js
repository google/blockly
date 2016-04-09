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

goog.provide('goog.ui.tree.TypeAheadTest');
goog.setTestOnly('goog.ui.tree.TypeAheadTest');

goog.require('goog.dom');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.tree.TreeControl');
goog.require('goog.ui.tree.TypeAhead');
function makeATree() {
  var tree = new goog.ui.tree.TreeControl('root');
  var testData = [
    'level1',
    [
      ['level2', [['eve', []], ['eve2', []]], []],
      ['level22', [['eve', []], ['eve3', []]], []]
    ],
    []
  ];

  createTreeFromTestData(tree, testData, 3);

  tree.createDom();
  goog.dom.getElement('treeContainer').appendChild(tree.getElement());
  tree.enterDocument();

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
 * Test jumpToLabel_ functionality.
 */
function testJumpToLabel() {
  var tree = makeATree();
  var typeAhead = tree.typeAhead_;

  // Test the case when only one matching entry exists.
  var handled = typeAhead.jumpToLabel_('level1');
  var selectedItem = tree.getSelectedItem();
  assertTrue(handled && selectedItem.getHtml() == 'level1');

  // Test the case when more than one matching entry exists.
  handled = typeAhead.jumpToLabel_('eve');
  selectedItem = tree.getSelectedItem();
  assertTrue(handled && selectedItem.getHtml() == 'eve');

  // Test the case when the matching entry is at a deeper level.
  handled = typeAhead.jumpToLabel_('eve3');
  selectedItem = tree.getSelectedItem();
  assertTrue(handled && selectedItem.getHtml() == 'eve3');
}


/**
 * Test jumpTo_ functionality.
 */
function testJumpTo() {
  var tree = makeATree();
  var typeAhead = tree.typeAhead_;

  // Jump to the first matching 'eve', followed by Ctrl+DOWN to jump to
  // second matching 'eve'
  var handled = typeAhead.jumpToLabel_('eve') &&
      typeAhead.jumpTo_(goog.ui.tree.TypeAhead.Offset.DOWN);
  var selectedItem = tree.getSelectedItem();
  assertTrue(handled && selectedItem.getHtml() == 'eve');

  // Simulate a DOWN key on the tree, now the selection should be on 'eve3'
  var e = new Object();
  e.keyCode = goog.events.KeyCodes.DOWN;
  e.preventDefault = function() {};
  handled = tree.handleKeyEvent(e);
  selectedItem = tree.getSelectedItem();
  assertTrue(handled && selectedItem.getHtml() == 'eve3');
}


/**
 * Test handleTypeAheadChar functionality.
 */
function testHandleTypeAheadChar() {
  var tree = makeATree();
  var typeAhead = tree.typeAhead_;
  var e = new Object();

  // Period character('.'): keyCode = 190, charCode = 46
  // String.fromCharCode(190) = '3/4'  <-- incorrect
  // String.fromCharCode(46) = '.'  <-- correct
  e.keyCode = goog.events.KeyCodes.PERIOD;
  e.charCode = 46;
  e.preventDefault = function() {};
  typeAhead.handleTypeAheadChar(e);
  assertEquals('.', typeAhead.buffer_);

  // charCode not supplied.
  // This is expected to work only for alpha-num characters.
  e.keyCode = goog.events.KeyCodes.A;
  e.charCode = undefined;
  typeAhead.buffer_ = '';
  typeAhead.handleTypeAheadChar(e);
  assertEquals('a', typeAhead.buffer_);
}
