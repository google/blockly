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

goog.provide('goog.testing.editor.TestHelperTest');
goog.setTestOnly('goog.testing.editor.TestHelperTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.editor.node');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.editor.TestHelper');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var root;
var helper;

function setUp() {
  // TODO(b/25875505): Fix unreported assertions (go/failonunreportedasserts).
  goog.testing.TestCase.getActiveTestCase().failOnUnreportedAsserts = false;

  root = goog.dom.getElement('root');
  goog.dom.removeChildren(root);
  helper = new goog.testing.editor.TestHelper(root);
}

function tearDown() {
  helper.dispose();
}

function testSetRoot() {
  helper.setRoot(goog.dom.getElement('root2'));
  helper.assertHtmlMatches('Root 2');
}

function testSetupEditableElement() {
  helper.setUpEditableElement();
  assertTrue(goog.editor.node.isEditableContainer(root));
}

function testTearDownEditableElement() {
  helper.setUpEditableElement();
  assertTrue(goog.editor.node.isEditableContainer(root));

  helper.tearDownEditableElement();
  assertFalse(goog.editor.node.isEditableContainer(root));
}

function testFindNode() {
  // Test the easiest case.
  root.innerHTML = 'a<br>b';
  assertEquals(helper.findTextNode('a'), root.firstChild);
  assertEquals(helper.findTextNode('b'), root.lastChild);
  assertNull(helper.findTextNode('c'));
}

function testFindNodeDuplicate() {
  // Test duplicate.
  root.innerHTML = 'c<br>c';
  assertEquals(
      'Should return first duplicate', helper.findTextNode('c'),
      root.firstChild);
}

function findNodeWithHierarchy() {
  // Test a more complicated hierarchy.
  root.innerHTML = '<div>a<p>b<span>c</span>d</p>e</div>';
  assertEquals(
      goog.dom.TagName.DIV, helper.findTextNode('a').parentNode.tagName);
  assertEquals(goog.dom.TagName.P, helper.findTextNode('b').parentNode.tagName);
  assertEquals(
      goog.dom.TagName.SPAN, helper.findTextNode('c').parentNode.tagName);
  assertEquals(goog.dom.TagName.P, helper.findTextNode('d').parentNode.tagName);
  assertEquals(
      goog.dom.TagName.DIV, helper.findTextNode('e').parentNode.tagName);
}

function setUpAssertHtmlMatches() {
  var tag1, tag2;
  if (goog.userAgent.EDGE_OR_IE) {
    tag1 = goog.dom.TagName.DIV;
  } else if (goog.userAgent.WEBKIT) {
    tag1 = goog.dom.TagName.P;
    tag2 = goog.dom.TagName.BR;
  } else if (goog.userAgent.GECKO) {
    tag1 = goog.dom.TagName.SPAN;
    tag2 = goog.dom.TagName.BR;
  }

  var parent = goog.dom.createDom(goog.dom.TagName.DIV);
  root.appendChild(parent);
  parent.style.fontSize = '2em';
  parent.style.display = 'none';
  if (goog.userAgent.EDGE_OR_IE || goog.userAgent.GECKO) {
    parent.appendChild(goog.dom.createTextNode('NonWebKitText'));
  }

  if (tag1) {
    var e1 = goog.dom.createDom(tag1);
    parent.appendChild(e1);
    parent = e1;
  }
  if (tag2) {
    parent.appendChild(goog.dom.createDom(tag2));
  }
  parent.appendChild(goog.dom.createTextNode('Text'));
  if (goog.userAgent.WEBKIT) {
    root.firstChild.appendChild(goog.dom.createTextNode('WebKitText'));
  }
}

function testAssertHtmlMatches() {
  setUpAssertHtmlMatches();

  helper.assertHtmlMatches(
      '<div style="display: none; font-size: 2em">' +
      '[[IE EDGE GECKO]]NonWebKitText<div class="IE EDGE"><p class="WEBKIT">' +
      '<span class="GECKO"><br class="GECKO WEBKIT">Text</span></p></div>' +
      '</div>[[WEBKIT]]WebKitText');
}

function testAssertHtmlMismatchText() {
  setUpAssertHtmlMatches();

  var e = assertThrows('Should fail due to mismatched text', function() {
    helper.assertHtmlMatches(
        '<div style="display: none; font-size: 2em">' +
        '[[IE GECKO]]NonWebKitText<div class="IE"><p class="WEBKIT">' +
        '<span class="GECKO"><br class="GECKO WEBKIT">Bad</span></p></div>' +
        '</div>[[WEBKIT]]Extra');
  });
  assertContains('Text should match', e.message);
}

function testAssertHtmlMismatchTag() {
  setUpAssertHtmlMatches();

  var e = assertThrows('Should fail due to mismatched tag', function() {
    helper.assertHtmlMatches(
        '<span style="display: none; font-size: 2em">[[IE EDGE GECKO]]' +
        'NonWebKitText<div class="IE EDGE"><p class="WEBKIT">' +
        '<span class="GECKO"><br class="GECKO WEBKIT">Text</span></p></div>' +
        '</span>[[WEBKIT]]Extra');
  });
  assertContains('Tag names should match', e.message);
}

function testAssertHtmlMismatchStyle() {
  setUpAssertHtmlMatches();

  var e = assertThrows('Should fail due to mismatched style', function() {
    helper.assertHtmlMatches(
        '<div style="display: none; font-size: 3em">[[IE EDGE GECKO]]' +
        'NonWebKitText<div class="IE EDGE"><p class="WEBKIT">' +
        '<span class="GECKO"><br class="GECKO WEBKIT">Text</span></p></div>' +
        '</div>[[WEBKIT]]Extra');
  });
  assertContains('Should have same styles', e.message);
}

function testAssertHtmlMismatchOptionalText() {
  setUpAssertHtmlMatches();

  var e = assertThrows('Should fail due to mismatched style', function() {
    helper.assertHtmlMatches(
        '<div style="display: none; font-size: 2em">' +
        '[[IE EDGE GECKO]]Bad<div class="IE EDGE"><p class="WEBKIT">' +
        '<span class="GECKO"><br class="GECKO WEBKIT">Text</span></p></div>' +
        '</div>[[WEBKIT]]Bad');
  });
  assertContains('Text should match', e.message);
}
