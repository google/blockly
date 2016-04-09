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

goog.provide('goog.editor.styleTest');
goog.setTestOnly('goog.editor.styleTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.style');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.style');
goog.require('goog.testing.LooseMock');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');

var parentNode = null;
var childNode1 = null;
var childNode2 = null;
var childNode3 = null;
var gChildWsNode1 = null;
var gChildTextNode1 = null;
var gChildNbspNode1 = null;
var gChildMixedNode1 = null;
var gChildWsNode2a = null;
var gChildWsNode2b = null;
var gChildTextNode3a = null;
var gChildWsNode3 = null;
var gChildTextNode3b = null;

var $dom = goog.dom.createDom;
var $text = goog.dom.createTextNode;

function setUpGetNodeFunctions() {
  parentNode = $dom(
      goog.dom.TagName.P, {id: 'parentNode'},
      childNode1 = $dom(
          goog.dom.TagName.DIV, null, gChildWsNode1 = $text(' \t\r\n'),
          gChildTextNode1 = $text('Child node'),
          gChildNbspNode1 = $text('\u00a0'),
          gChildMixedNode1 = $text('Text\n plus\u00a0')),
      childNode2 = $dom(
          goog.dom.TagName.DIV, null, gChildWsNode2a = $text(''),
          gChildWsNode2b = $text(' ')),
      childNode3 = $dom(
          goog.dom.TagName.DIV, null,
          gChildTextNode3a = $text('I am a grand child'),
          gChildWsNode3 = $text('   \t  \r   \n'),
          gChildTextNode3b = $text('I am also a grand child')));

  document.body.appendChild(parentNode);
}

function tearDownGetNodeFunctions() {
  document.body.removeChild(parentNode);

  parentNode = null;
  childNode1 = null;
  childNode2 = null;
  childNode3 = null;
  gChildWsNode1 = null;
  gChildTextNode1 = null;
  gChildNbspNode1 = null;
  gChildMixedNode1 = null;
  gChildWsNode2a = null;
  gChildWsNode2b = null;
  gChildTextNode3a = null;
  gChildWsNode3 = null;
  gChildTextNode3b = null;
}


/**
 * Test isBlockLevel with a node that is block style and a node that is not
 */
function testIsDisplayBlock() {
  assertTrue(
      'Body is block style', goog.editor.style.isDisplayBlock(document.body));
  var tableNode = $dom(goog.dom.TagName.TABLE);
  assertFalse(
      'Table is not block style', goog.editor.style.isDisplayBlock(tableNode));
}


/**
 * Test that isContainer returns true when the node is of non-inline HTML and
 * false when it is not
 */
function testIsContainer() {
  var tableNode = $dom(goog.dom.TagName.TABLE);
  var liNode = $dom(goog.dom.TagName.LI);
  var textNode = $text('I am text');
  document.body.appendChild(textNode);

  assertTrue('Table is a container', goog.editor.style.isContainer(tableNode));
  assertTrue(
      'Body is a container', goog.editor.style.isContainer(document.body));
  assertTrue('List item is a container', goog.editor.style.isContainer(liNode));
  assertFalse(
      'Text node is not a container', goog.editor.style.isContainer(textNode));
}


/**
 * Test that getContainer properly returns the node itself if it is a
 * container, an ancestor node if it is a container, and null otherwise
 */
function testGetContainer() {
  setUpGetNodeFunctions();
  assertEquals(
      'Should return self', childNode1,
      goog.editor.style.getContainer(childNode1));
  assertEquals(
      'Should return parent', childNode1,
      goog.editor.style.getContainer(gChildWsNode1));
  assertNull(
      'Document has no ancestors', goog.editor.style.getContainer(document));
  tearDownGetNodeFunctions();
}


function testMakeUnselectable() {
  var div = goog.dom.createElement(goog.dom.TagName.DIV);
  div.innerHTML = '<div>No input</div>' +
      '<p><input type="checkbox">Checkbox</p>' +
      '<span><input type="text"></span>';
  document.body.appendChild(div);

  var eventHandler = new goog.testing.LooseMock(goog.events.EventHandler);
  if (goog.editor.BrowserFeature.HAS_UNSELECTABLE_STYLE) {
    eventHandler.listen(
        div, goog.events.EventType.MOUSEDOWN,
        goog.testing.mockmatchers.isFunction, true);
  }
  eventHandler.$replay();


  var childDiv = div.firstChild;
  var p = div.childNodes[1];
  var span = div.lastChild;
  var checkbox = p.firstChild;
  var text = span.firstChild;

  goog.editor.style.makeUnselectable(div, eventHandler);

  assertEquals(
      'For browsers with non-overridable selectability, the root should be ' +
          'selectable.  Otherwise it should be unselectable.',
      !goog.editor.BrowserFeature.HAS_UNSELECTABLE_STYLE,
      goog.style.isUnselectable(div));
  assertTrue(goog.style.isUnselectable(childDiv));
  assertTrue(goog.style.isUnselectable(p));
  assertTrue(goog.style.isUnselectable(checkbox));

  assertEquals(
      'For browsers with non-overridable selectability, the span will be ' +
          'selectable.  Otherwise it will be unselectable. ',
      !goog.editor.BrowserFeature.HAS_UNSELECTABLE_STYLE,
      goog.style.isUnselectable(span));
  assertFalse(goog.style.isUnselectable(text));

  eventHandler.$verify();
}
