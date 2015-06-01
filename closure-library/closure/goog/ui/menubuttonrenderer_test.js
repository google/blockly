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

goog.provide('goog.ui.MenuButtonRendererTest');
goog.setTestOnly('goog.ui.MenuButtonRendererTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.rendererasserts');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuButtonRenderer');
goog.require('goog.userAgent');

var decoratedButton;
var renderedButton;
var savedRootTree;

function setUp() {
  savedRootTree = goog.dom.getElement('root').cloneNode(true);
  decoratedButton = null;
  renderedButton = null;
}

function tearDown() {
  if (decoratedButton) {
    decoratedButton.dispose();
  }

  if (renderedButton) {
    renderedButton.dispose();
  }

  var root = goog.dom.getElement('root');
  root.parentNode.replaceChild(savedRootTree, root);
}

function testRendererWithTextContent() {
  renderedButton = new goog.ui.MenuButton('Foo');
  renderOnParent(renderedButton);
  checkButtonCaption(renderedButton);
  checkAriaState(renderedButton);

  decoratedButton = new goog.ui.MenuButton();
  decorateDemoButton(decoratedButton);
  checkButtonCaption(decoratedButton);
  checkAriaState(decoratedButton);

  assertButtonsEqual();
}

function testRendererWithNodeContent() {
  renderedButton = new goog.ui.MenuButton(
      goog.dom.createDom(goog.dom.TagName.DIV, null, 'Foo'));
  renderOnParent(renderedButton);

  var contentEl = renderedButton.getContentElement();
  if (goog.userAgent.IE || goog.userAgent.OPERA) {
    assertHTMLEquals('<div unselectable="on">Foo</div>', contentEl.innerHTML);
  } else {
    assertHTMLEquals('<div>Foo</div>', contentEl.innerHTML);
  }
  assertTrue(hasInlineBlock(contentEl));
}

function testSetContent() {
  renderedButton = new goog.ui.MenuButton();
  renderOnParent(renderedButton);

  var contentEl = renderedButton.getContentElement();
  assertHTMLEquals('', contentEl.innerHTML);

  renderedButton.setContent('Foo');
  contentEl = renderedButton.getContentElement();
  assertHTMLEquals('Foo', contentEl.innerHTML);
  assertTrue(hasInlineBlock(contentEl));

  renderedButton.setContent(goog.dom.createDom(goog.dom.TagName.DIV, null,
                                               'Bar'));
  contentEl = renderedButton.getContentElement();
  assertHTMLEquals('<div>Bar</div>', contentEl.innerHTML);

  renderedButton.setContent('Foo');
  contentEl = renderedButton.getContentElement();
  assertHTMLEquals('Foo', contentEl.innerHTML);
}

function assertButtonsEqual() {
  assertHTMLEquals(
      'Rendered button and decorated button produced different HTML!',
      renderedButton.getElement().innerHTML,
      decoratedButton.getElement().innerHTML);
}


/**
 * Render the given button as a child of 'parent'.
 * @param {goog.ui.Button} button A button with content 'Foo'.
 */
function renderOnParent(button) {
  button.render(goog.dom.getElement('parent'));
}


/**
 * Decaorate the button with id 'button'.
 * @param {goog.ui.Button} button A button with no content.
 */
function decorateDemoButton(button) {
  button.decorate(goog.dom.getElement('decoratedButton'));
}


/**
 * Verify that the button's caption is never the direct
 * child of an inline-block element.
 * @param {goog.ui.Button} button A button.
 */
function checkButtonCaption(button) {
  var contentElement = button.getContentElement();
  assertEquals('Foo', contentElement.innerHTML);
  assertTrue(hasInlineBlock(contentElement));
  assert(hasInlineBlock(contentElement.parentNode));

  button.setContent('Bar');
  contentElement = button.getContentElement();
  assertEquals('Bar', contentElement.innerHTML);
  assertTrue(hasInlineBlock(contentElement));
  assert(hasInlineBlock(contentElement.parentNode));
}


/**
 * Verify that the menu button has the correct ARIA attributes
 * @param {goog.ui.Button} button A button.
 */
function checkAriaState(button) {
  assertEquals(
      'menu buttons should have default aria-expanded == false', 'false',
      goog.a11y.aria.getState(
          button.getElement(), goog.a11y.aria.State.EXPANDED));
  button.setOpen(true);
  assertEquals('menu buttons should not aria-expanded == true after ' +
      'opening', 'true',
      goog.a11y.aria.getState(
          button.getElement(), goog.a11y.aria.State.EXPANDED));
}

function hasInlineBlock(el) {
  return goog.dom.classlist.contains(el, 'goog-inline-block');
}

function testDoesntCallGetCssClassInConstructor() {
  goog.testing.ui.rendererasserts.
      assertNoGetCssClassCallsInConstructor(goog.ui.MenuButtonRenderer);
}
