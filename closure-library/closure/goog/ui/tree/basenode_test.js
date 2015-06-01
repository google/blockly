// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.tree.BaseNodeTest');
goog.setTestOnly('goog.ui.tree.BaseNodeTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.html.legacyconversions');
goog.require('goog.html.testing');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');
goog.require('goog.ui.tree.BaseNode');
goog.require('goog.ui.tree.TreeControl');
goog.require('goog.ui.tree.TreeNode');
var stubs = new goog.testing.PropertyReplacer();

function setUp() {
  // Reset global flags to their defaults.
  stubs.set(goog.html.legacyconversions, 'ALLOW_LEGACY_CONVERSIONS', true);
}

function testAdd() {
  var node1 = new goog.ui.tree.TreeNode('node1');
  var node2 = new goog.ui.tree.TreeNode('node2');
  var node3 = new goog.ui.tree.TreeNode('node3');
  var node4 = new goog.ui.tree.TreeNode('node4');

  assertEquals('node2 added', node2, node1.add(node2));
  assertEquals('node3 added', node3, node1.add(node3));
  assertEquals('node4 added', node4, node1.add(node4, node3));

  assertEquals('node1 has 3 children', 3, node1.getChildCount());
  assertEquals('first child', node2, node1.getChildAt(0));
  assertEquals('second child', node4, node1.getChildAt(1));
  assertEquals('third child', node3, node1.getChildAt(2));
  assertNull('node1 has no parent', node1.getParent());
  assertEquals('the parent of node2 is node1', node1, node2.getParent());

  assertEquals('node4 moved under node2', node4, node2.add(node4));
  assertEquals('node1 has 2 children', 2, node1.getChildCount());
  assertEquals('node2 has 1 child', 1, node2.getChildCount());
  assertEquals('the child of node2 is node4', node4, node2.getChildAt(0));
  assertEquals('the parent of node4 is node2', node2, node4.getParent());
}

function testExpandIconAfterAddChild() {
  var tree = new goog.ui.tree.TreeControl('root');
  var node1 = new goog.ui.tree.TreeNode('node1');
  var node2 = new goog.ui.tree.TreeNode('node2');
  tree.render(goog.dom.createDom(goog.dom.TagName.DIV));
  tree.addChild(node1);

  node1.addChild(node2);
  assertTrue('expand icon of node1 changed to L+', goog.dom.classlist.contains(
      node1.getExpandIconElement(), 'goog-tree-expand-icon-lplus'));

  node1.removeChild(node2);
  assertFalse('expand icon of node1 changed back to L',
      goog.dom.classlist.contains(
          node1.getExpandIconElement(), 'goog-tree-expand-icon-lplus'));
}

function testExpandEvents() {
  var n = new goog.ui.tree.BaseNode('');
  n.getTree = function() {};
  var expanded = false;
  n.setExpanded(expanded);
  assertEquals(expanded, n.getExpanded());
  var callCount = 0;
  n.addEventListener(goog.ui.tree.BaseNode.EventType.BEFORE_EXPAND,
      function(e) {
        assertEquals(expanded, n.getExpanded());
        callCount++;
      });
  n.addEventListener(goog.ui.tree.BaseNode.EventType.EXPAND,
      function(e) {
        assertEquals(!expanded, n.getExpanded());
        callCount++;
      });
  n.setExpanded(!expanded);
  assertEquals(2, callCount);
}

function testExpandEvents2() {
  var n = new goog.ui.tree.BaseNode('');
  n.getTree = function() {};
  var expanded = true;
  n.setExpanded(expanded);
  assertEquals(expanded, n.getExpanded());
  var callCount = 0;
  n.addEventListener(goog.ui.tree.BaseNode.EventType.BEFORE_COLLAPSE,
      function(e) {
        assertEquals(expanded, n.getExpanded());
        callCount++;
      });
  n.addEventListener(goog.ui.tree.BaseNode.EventType.COLLAPSE,
      function(e) {
        assertEquals(!expanded, n.getExpanded());
        callCount++;
      });
  n.setExpanded(!expanded);
  assertEquals(2, callCount);
}

function testExpandEventsPreventDefault() {
  var n = new goog.ui.tree.BaseNode('');
  n.getTree = function() {};
  var expanded = true;
  n.setExpanded(expanded);
  assertEquals(expanded, n.getExpanded());
  var callCount = 0;
  n.addEventListener(goog.ui.tree.BaseNode.EventType.BEFORE_COLLAPSE,
      function(e) {
        assertEquals(expanded, n.getExpanded());
        e.preventDefault();
        callCount++;
      });
  n.addEventListener(goog.ui.tree.BaseNode.EventType.COLLAPSE,
      function(e) {
        fail('Should not fire COLLAPSE');
      });
  n.setExpanded(!expanded);
  assertEquals(1, callCount);
}

function testExpandEventsPreventDefault2() {
  var n = new goog.ui.tree.BaseNode('');
  n.getTree = function() {};
  var expanded = false;
  n.setExpanded(expanded);
  assertEquals(expanded, n.getExpanded());
  var callCount = 0;
  n.addEventListener(goog.ui.tree.BaseNode.EventType.BEFORE_EXPAND,
      function(e) {
        assertEquals(expanded, n.getExpanded());
        e.preventDefault();
        callCount++;
      });
  n.addEventListener(goog.ui.tree.BaseNode.EventType.EXPAND,
      function(e) {
        fail('Should not fire EXPAND');
      });
  n.setExpanded(!expanded);
  assertEquals(1, callCount);
}

function testGetNextShownNode() {
  var tree = new goog.ui.tree.TreeControl('tree');
  assertNull('next node for unpopulated tree', tree.getNextShownNode());

  var node1 = new goog.ui.tree.TreeNode('node1');
  var node2 = new goog.ui.tree.TreeNode('node2');
  var node3 = new goog.ui.tree.TreeNode('node3');
  node1.add(node2);
  node1.add(node3);

  assertNull('next node for unexpanded node1', node1.getNextShownNode());
  node1.expand();
  assertEquals('next node for expanded node1', node2, node1.getNextShownNode());
  assertEquals('next node for node2', node3, node2.getNextShownNode());
  assertNull('next node for node3', node3.getNextShownNode());

  tree.add(node1);
  assertEquals('next node for populated tree', node1, tree.getNextShownNode());
  assertNull('next node for node3 inside the tree', node3.getNextShownNode());

  var component = new goog.ui.Component();
  component.addChild(tree);
  assertNull('next node for node3 inside the tree if the tree has parent',
      node3.getNextShownNode());
}

function testGetPreviousShownNode() {
  var tree = new goog.ui.tree.TreeControl('tree');
  assertNull('next node for unpopulated tree', tree.getPreviousShownNode());

  var node1 = new goog.ui.tree.TreeNode('node1');
  var node2 = new goog.ui.tree.TreeNode('node2');
  var node3 = new goog.ui.tree.TreeNode('node3');
  tree.add(node1);
  node1.add(node2);
  tree.add(node3);

  assertEquals('prev node for node3 when node1 is unexpanded',
               node1, node3.getPreviousShownNode());
  node1.expand();
  assertEquals('prev node for node3 when node1 is expanded',
               node2, node3.getPreviousShownNode());
  assertEquals('prev node for node2 when node1 is expanded',
               node1, node2.getPreviousShownNode());
  assertEquals('prev node for node1 when root is shown', tree,
               node1.getPreviousShownNode());
  tree.setShowRootNode(false);
  assertNull('next node for node1 when root is not shown',
             node1.getPreviousShownNode());

  var component = new goog.ui.Component();
  component.addChild(tree);
  assertNull('prev node for root if the tree has parent',
             tree.getPreviousShownNode());
}

function testInvisibleNodesInUnrenderedTree() {
  var tree = new goog.ui.tree.TreeControl('tree');
  var a = new goog.ui.tree.TreeNode('a');
  var b = new goog.ui.tree.TreeNode('b');
  tree.add(a);
  a.add(b);
  tree.render();

  var textContent =
      tree.getElement().textContent || tree.getElement().innerText;
  assertContains('Node should be rendered.', 'tree', textContent);
  assertContains('Node should be rendered.', 'a', textContent);
  assertNotContains('Unexpanded node child should not be rendered.',
      'b', textContent);

  a.expand();
  var textContent =
      tree.getElement().textContent || tree.getElement().innerText;
  assertContains('Node should be rendered.', 'tree', textContent);
  assertContains('Node should be rendered.', 'a', textContent);
  assertContains('Expanded node child should be rendered.', 'b', textContent);
  tree.dispose();
}

function testInvisibleNodesInRenderedTree() {
  var tree = new goog.ui.tree.TreeControl('tree');
  tree.render();
  var a = new goog.ui.tree.TreeNode('a');
  var b = new goog.ui.tree.TreeNode('b');
  tree.add(a);
  a.add(b);

  var textContent =
      tree.getElement().textContent || tree.getElement().innerText;
  assertContains('Node should be rendered.', 'tree', textContent);
  assertContains('Node should be rendered.', 'a', textContent);
  assertNotContains('Unexpanded node child should not be rendered.',
      'b', textContent);

  a.expand();
  var textContent =
      tree.getElement().textContent || tree.getElement().innerText;
  assertContains('Node should be rendered.', 'tree', textContent);
  assertContains('Node should be rendered.', 'a', textContent);
  assertContains('Expanded node child should be rendered.', 'b', textContent);
  tree.dispose();
}

function testConstructor() {
  var tree = new goog.ui.tree.TreeControl('tree');
  assertEquals('tree', tree.getHtml());

  tree = new goog.ui.tree.TreeControl(
      goog.html.testing.newSafeHtmlForTest('tree'));
  assertEquals('tree', tree.getHtml());
}

function testSetHtml() {
  var tree = new goog.ui.tree.TreeControl('');
  tree.setHtml('<b>tree</b>');
  assertEquals('<b>tree</b>', tree.getHtml());

  tree = new goog.ui.tree.TreeControl('');
  tree.setSafeHtml(goog.html.testing.newSafeHtmlForTest('<b>tree</b>'));
  assertEquals('<b>tree</b>', tree.getHtml());
}

function testSetHtml_guardedByGlobalFlag() {
  stubs.set(goog.html.legacyconversions, 'ALLOW_LEGACY_CONVERSIONS', false);
  assertEquals(
      'Error: Legacy conversion from string to goog.html types is disabled',
      assertThrows(function() {
        new goog.ui.tree.TreeControl('<img src="blag" onerror="evil();">');
      }).message);
}
