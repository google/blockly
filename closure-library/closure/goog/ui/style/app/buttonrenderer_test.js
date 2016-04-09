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

goog.provide('goog.ui.style.app.ButtonRendererTest');
goog.setTestOnly('goog.ui.style.app.ButtonRendererTest');

goog.require('goog.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.style');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.style.app.ButtonRenderer');
goog.require('goog.userAgent');
var renderer = goog.ui.style.app.ButtonRenderer.getInstance();
var button;

// Write iFrame tag to load reference FastUI markup. Then, our tests will
// compare the generated markup to the reference markup.
var refPath = '../../../../../webutil/css/fastui/app/button_spec.html';
goog.testing.ui.style.writeReferenceFrame(refPath);

function shouldRunTests() {
  // Disable tests when being run as a part of open-source repo as the button
  // specs are not included in closure-library.
  return !(/closure\/goog\/ui/.test(location.pathname));
}

function setUp() {
  button = new goog.ui.Button('Hello Generated', renderer);
  button.setTooltip('Click for Generated');
}

function tearDown() {
  if (button) {
    button.dispose();
  }
  goog.dom.removeChildren(goog.dom.getElement('sandbox'));
}

function testGeneratedButton() {
  button.render(goog.dom.getElement('sandbox'));
  goog.testing.ui.style.assertStructureMatchesReference(
      button.getElement(), 'normal-resting');
  assertEquals('Hello Generated', button.getContentElement().innerHTML);
  assertEquals(
      'Click for Generated', button.getElement().getAttribute('title'));
}

function testButtonStates() {
  button.render(goog.dom.getElement('sandbox'));
  goog.testing.ui.style.assertStructureMatchesReference(
      button.getElement(), 'normal-resting');
  button.setState(goog.ui.Component.State.HOVER, true);
  goog.testing.ui.style.assertStructureMatchesReference(
      button.getElement(), 'normal-hover');
  button.setState(goog.ui.Component.State.HOVER, false);
  button.setState(goog.ui.Component.State.FOCUSED, true);
  goog.testing.ui.style.assertStructureMatchesReference(
      button.getElement(), 'normal-focused');
  button.setState(goog.ui.Component.State.FOCUSED, false);
  button.setState(goog.ui.Component.State.ACTIVE, true);
  goog.testing.ui.style.assertStructureMatchesReference(
      button.getElement(), 'normal-active');
  button.setState(goog.ui.Component.State.ACTIVE, false);
  button.setState(goog.ui.Component.State.DISABLED, true);
  goog.testing.ui.style.assertStructureMatchesReference(
      button.getElement(), 'normal-disabled');
}

function testDecoratedButton() {
  button.decorate(goog.dom.getElement('button'));
  goog.testing.ui.style.assertStructureMatchesReference(
      button.getElement(), 'normal-resting');
  assertEquals('Hello Decorated', button.getContentElement().innerHTML);
  assertEquals(
      'Click for Decorated', button.getElement().getAttribute('title'));
}

function testDecoratedButtonBox() {
  button.decorate(goog.dom.getElement('button-box'));
  goog.testing.ui.style.assertStructureMatchesReference(
      button.getElement(), 'normal-resting');
  assertEquals('Hello Decorated Box', button.getContentElement().innerHTML);
  assertEquals(
      'Click for Decorated Box', button.getElement().getAttribute('title'));
}

/*
 * This test demonstrates what happens when you put whitespace in a
 * decorated button's content, and the decorated element 'hasBoxStructure'.
 * Note that this behavior is different than when the element does not
 * have box structure. Should this be fixed?
 */
function testDecoratedButtonBoxWithSpaceInContent() {
  button.decorate(goog.dom.getElement('button-box-with-space-in-content'));
  goog.testing.ui.style.assertStructureMatchesReference(
      button.getElement(), 'normal-resting');
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    assertEquals(
        'Hello Decorated Box with space ',
        button.getContentElement().innerHTML);
  } else {
    assertEquals(
        '\n    Hello Decorated Box with space\n  ',
        button.getContentElement().innerHTML);
  }
}

function testExistingContentIsUsed() {
  button.decorate(goog.dom.getElement('button-box-with-dom-content'));
  goog.testing.ui.style.assertStructureMatchesReference(
      button.getElement(), 'normal-resting');
  // Safari 3 adds style="-webkit-user-select" to the strong tag, so we
  // can't simply look at the HTML.
  var content = button.getContentElement();
  assertEquals(
      'Unexpected number of child nodes', 3, content.childNodes.length);
  assertEquals('Unexpected tag', 'STRONG', content.childNodes[0].tagName);
  assertEquals(
      'Unexpected text content', 'Hello', content.childNodes[0].innerHTML);
  assertEquals('Unexpected tag', 'EM', content.childNodes[2].tagName);
  assertEquals(
      'Unexpected text content', 'Box', content.childNodes[2].innerHTML);
}
