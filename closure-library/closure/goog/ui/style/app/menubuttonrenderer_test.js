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

goog.provide('goog.ui.style.app.MenuButtonRendererTest');
goog.setTestOnly('goog.ui.style.app.MenuButtonRendererTest');

goog.require('goog.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.style.app.MenuButtonRenderer');
var renderer = goog.ui.style.app.MenuButtonRenderer.getInstance();
var button;

// Write iFrame tag to load reference FastUI markup. Then, our tests will
// compare the generated markup to the reference markup.
var refPath = '../../../../../webutil/css/fastui/app/menubutton_spec.html';
goog.testing.ui.style.writeReferenceFrame(refPath);

function setUp() {
  button = new goog.ui.MenuButton('Hello Generated', null, renderer);
  button.setTooltip('Click for Generated');
}

function tearDown() {
  if (button) {
    button.dispose();
  }
  goog.dom.getElement('sandbox').innerHTML = '';
}

function testGeneratedButton() {
  button.render(goog.dom.getElement('sandbox'));
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-resting');
  assertEquals('Hello Generated',
      button.getContentElement().firstChild.nodeValue);
  assertEquals('Click for Generated',
      button.getElement().getAttribute('title'));
}

function testButtonStates() {
  button.render(goog.dom.getElement('sandbox'));
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-resting');
  button.setState(goog.ui.Component.State.HOVER, true);
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-hover');
  button.setState(goog.ui.Component.State.HOVER, false);
  button.setState(goog.ui.Component.State.FOCUSED, true);
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-focused');
  button.setState(goog.ui.Component.State.FOCUSED, false);
  button.setState(goog.ui.Component.State.ACTIVE, true);
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-active');
  button.setState(goog.ui.Component.State.ACTIVE, false);
  button.setState(goog.ui.Component.State.DISABLED, true);
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-disabled');
}

function testDecoratedButton() {
  button.decorate(goog.dom.getElement('button'));
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-resting');
  assertEquals('Hello Decorated',
      button.getContentElement().firstChild.nodeValue);
  assertEquals('Click for Decorated',
      button.getElement().getAttribute('title'));
}

function testDecoratedButtonBox() {
  button.decorate(goog.dom.getElement('button-box'));
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-resting');
  assertEquals('Hello Decorated Box',
      button.getContentElement().firstChild.nodeValue);
  assertEquals('Click for Decorated Box',
      button.getElement().getAttribute('title'));
}

function testExistingContentIsUsed() {
  button.decorate(goog.dom.getElement('button-with-dom-content'));
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-resting');
  // Safari 3 adds style="-webkit-user-select" to the strong tag, so we
  // can't simply look at the HTML.
  var content = button.getContentElement();
  assertEquals('Unexpected number of child nodes; expected existing number ' +
      'plus one for the dropdown element', 4, content.childNodes.length);
  assertEquals('Unexpected tag', 'STRONG',
      content.childNodes[0].tagName);
  assertEquals('Unexpected text content', 'Hello Strong',
      content.childNodes[0].innerHTML);
  assertEquals('Unexpected tag', 'EM',
      content.childNodes[2].tagName);
  assertEquals('Unexpected text content', 'Box',
      content.childNodes[2].innerHTML);
}

function testDecoratedButtonWithMenu() {
  button.decorate(goog.dom.getElement('button-with-menu'));
  assertEquals('Unexpected number of menu items', 2, button.getItemCount());
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-resting');
  assertFalse('Expected menu element to not be contained by button',
      goog.dom.contains(button.getElement(),
          button.getMenu().getElement()));
}

function testDropDownExistsAfterButtonRename() {
  button.decorate(goog.dom.getElement('button-2'));
  button.setContent('New title');
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-resting');
  assertEquals('Unexpected number of child nodes; expected text element ' +
      'and the dropdown element',
      2, button.getContentElement().childNodes.length);
  assertEquals('New title',
      button.getContentElement().firstChild.nodeValue);
  assertEquals('Click for Decorated',
      button.getElement().getAttribute('title'));
}
