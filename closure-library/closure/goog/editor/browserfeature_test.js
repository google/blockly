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

goog.provide('goog.editor.BrowserFeatureTest');
goog.setTestOnly('goog.editor.BrowserFeatureTest');

goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.jsunit');

var expectedFailures;

function setUpPage() {
  expectedFailures = new goog.testing.ExpectedFailures();
}

function tearDown() {
  var root = goog.dom.getElement('root');
  goog.dom.removeChildren(root);
  expectedFailures.handleTearDown();
}

function testEmptyNodeNormalization() {
  var root = goog.dom.getElement('root');
  goog.dom.appendChild(root, goog.dom.createTextNode('text'));

  var textNode = root.firstChild;
  textNode.splitText(0);
  root.normalize();

  assertEquals(
      'NORMALIZE_CORRUPTS_EMPTY_TEXT_NODES incorrect for ' +
          navigator.userAgent,
      goog.editor.BrowserFeature.NORMALIZE_CORRUPTS_EMPTY_TEXT_NODES,
      textNode.parentNode == null);
}

function testLeavesPWhenRemovingLists() {
  if (!goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) {
    return;
  }
  var root = goog.dom.getElement('root');
  goog.dom.removeChildren(root);
  root.innerHTML = '<div>foo</div>';
  goog.dom.Range.createFromNodeContents(root.firstChild.firstChild).select();
  document.execCommand('insertorderedlist', false, true);
  document.execCommand('insertorderedlist', false, true);

  assertEquals(
      'LEAVES_P_WHEN_REMOVING_LISTS incorrect for ' + navigator.userAgent,
      goog.editor.BrowserFeature.LEAVES_P_WHEN_REMOVING_LISTS,
      !!root.getElementsByTagName(goog.dom.TagName.P).length);
}

function testActiveElement() {
  var root = goog.dom.getElement('root');
  var div = goog.dom.createElement(goog.dom.TagName.DIV);
  root.appendChild(div);
  div.tabIndex = 0;
  div.focus();

  expectedFailures.expectFailureFor(
      !goog.editor.BrowserFeature.HAS_ACTIVE_ELEMENT);
  try {
    assertEquals(
        'document.activeElement should be the created div', div,
        document.activeElement);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testNormalizeCorruption() {
  var root = goog.dom.getElement('testNormalizeCorruption');
  var textNode = root.firstChild;
  textNode.splitText(0);
  var secondTextNode = textNode.nextSibling;

  root.normalize();

  expectedFailures.expectFailureFor(
      goog.editor.BrowserFeature.NORMALIZE_CORRUPTS_EMPTY_TEXT_NODES);
  try {
    assertEquals(
        'text node should not be corrupted', textNode, root.firstChild);
  } catch (e) {
    expectedFailures.handleException(e);

    expectedFailures.expectFailureFor(
        goog.editor.BrowserFeature.NORMALIZE_CORRUPTS_ALL_TEXT_NODES);
    try {
      assertEquals(
          'first text node should be corrupted and replaced by sibling',
          secondTextNode, root.firstChild);
    } catch (e) {
      expectedFailures.handleException(e);
    }
  }
}
