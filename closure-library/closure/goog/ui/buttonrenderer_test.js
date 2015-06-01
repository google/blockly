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

goog.provide('goog.ui.ButtonRendererTest');
goog.setTestOnly('goog.ui.ButtonRendererTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.rendererasserts');
goog.require('goog.ui.Button');
goog.require('goog.ui.ButtonRenderer');
goog.require('goog.ui.ButtonSide');
goog.require('goog.ui.Component');

var button, buttonRenderer, testRenderer;
var sandbox;
var expectedFailures;

function setUpPage() {
  sandbox = goog.dom.getElement('sandbox');
  expectedFailures = new goog.testing.ExpectedFailures();
}



/**
 * A subclass of ButtonRenderer that overrides
 * {@code getStructuralCssClass} for testing purposes.
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
function TestRenderer() {
  goog.ui.ButtonRenderer.call(this);
}
goog.inherits(TestRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(TestRenderer);


/** @override */
TestRenderer.prototype.getStructuralCssClass = function() {
  return 'goog-base';
};

function setUp() {
  buttonRenderer = goog.ui.ButtonRenderer.getInstance();
  button = new goog.ui.Button('Hello', buttonRenderer);
  testRenderer = TestRenderer.getInstance();
}

function tearDown() {
  button.dispose();
  goog.dom.removeChildren(sandbox);
  expectedFailures.handleTearDown();
}

function testConstructor() {
  assertNotNull('ButtonRenderer singleton instance must not be null',
      buttonRenderer);
}

function testGetAriaRole() {
  assertEquals('ButtonRenderer\'s ARIA role must have expected value',
      goog.a11y.aria.Role.BUTTON, buttonRenderer.getAriaRole());
}

function testCreateDom() {
  var element = buttonRenderer.createDom(button);
  assertNotNull('Element must not be null', element);
  assertEquals('Element must be a DIV', goog.dom.TagName.DIV, element.tagName);
  assertHTMLEquals('Element must have expected structure',
      '<div class="goog-button">Hello</div>',
      goog.dom.getOuterHtml(element));

  button.setTooltip('Hello, world!');
  button.setValue('foo');
  element = buttonRenderer.createDom(button);
  assertNotNull('Element must not be null', element);
  assertEquals('Element must be a DIV', 'DIV', element.tagName);
  assertSameElements('Element must have expected class name',
      ['goog-button'], goog.dom.classlist.get(element));
  assertEquals('Element must have expected title', 'Hello, world!',
      element.title);
  assertUndefined('Element must have no value', element.value);
  assertEquals('Element must have expected contents', 'Hello',
      element.innerHTML);

  button.setSupportedState(goog.ui.Component.State.CHECKED, true);
  var element = buttonRenderer.createDom(button);
  assertEquals('button\'s aria-pressed attribute must be false', 'false',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.PRESSED));
}

function testSetTooltip() {
  button.createDom();
  button.setTooltip('tooltip');
  assertEquals('tooltip', button.getElement().title);
  button.setTooltip('');
  assertEquals('', button.getElement().title);
  // IE7 doesn't support hasAttribute.
  if (button.getElement().hasAttribute) {
    assertFalse(button.getElement().hasAttribute('title'));
  }
}

function testCreateDomAriaState() {
  button.setSupportedState(goog.ui.Component.State.CHECKED, true);
  button.setChecked(true);
  var element = buttonRenderer.createDom(button);

  assertEquals('button\'s aria-pressed attribute must be true', 'true',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.PRESSED));
}

function testUseAriaPressedForSelected() {
  button.setSupportedState(goog.ui.Component.State.SELECTED, true);
  button.setSelected(true);
  button.setRenderer(buttonRenderer);
  button.render();
  var element = button.getElement();

  assertEquals('button\'s aria-pressed attribute must be true', 'true',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.PRESSED));
  assertEquals('button\'s aria-selected attribute must be empty', '',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.SELECTED));
}

function testAriaDisabled() {
  button.setEnabled(false);
  button.setRenderer(buttonRenderer);
  button.render();
  var element = button.getElement();

  assertEquals('button\'s aria-disabled attribute must be true', 'true',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.DISABLED));
}

function testDecorate() {
  sandbox.innerHTML =
      '<div id="foo">Foo</div>\n' +
      '<div id="bar" title="Hello, world!">Bar</div>\n' +
      '<div id="toggle">Toggle</div>';

  var foo = new goog.ui.Button(null, buttonRenderer);
  foo.decorate(goog.dom.getElement('foo'));
  assertEquals('foo\'s tooltip must be the empty string', '',
      foo.getTooltip());
  foo.dispose();

  var bar = new goog.ui.Button(null, buttonRenderer);
  bar.decorate(goog.dom.getElement('bar'));
  assertEquals('bar\'s tooltip must be initialized', 'Hello, world!',
      bar.getTooltip());
  bar.dispose();

  var toggle = new goog.ui.Button(null, buttonRenderer);
  toggle.setSupportedState(goog.ui.Component.State.CHECKED, true);
  var element = goog.dom.getElement('toggle');
  assertNotNull(element);
  toggle.decorate(element);
  assertEquals('toggle\'s aria-pressed attribute must be false', 'false',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.PRESSED));
  toggle.dispose();
}

function testCollapse() {
  buttonRenderer.setCollapsed(button, goog.ui.ButtonSide.START);
  assertSameElements('Button should have class to collapse start',
      ['goog-button-collapse-left'], button.getExtraClassNames());
  buttonRenderer.setCollapsed(button, goog.ui.ButtonSide.END);
  assertSameElements('Button should have class to collapse end',
      ['goog-button-collapse-right'], button.getExtraClassNames());
  buttonRenderer.setCollapsed(button, goog.ui.ButtonSide.BOTH);
  assertSameElements('Button should have classes to collapse both',
      ['goog-button-collapse-left', 'goog-button-collapse-right'],
      button.getExtraClassNames());
}

function testCollapseRtl() {
  button.setRightToLeft(true);
  buttonRenderer.setCollapsed(button, goog.ui.ButtonSide.START);
  assertSameElements('Button should have class to collapse start',
      ['goog-button-collapse-right'], button.getExtraClassNames());
  buttonRenderer.setCollapsed(button, goog.ui.ButtonSide.END);
  assertSameElements('Button should have class to collapse end',
      ['goog-button-collapse-left'], button.getExtraClassNames());
  buttonRenderer.setCollapsed(button, goog.ui.ButtonSide.BOTH);
  assertSameElements('Button should have classes to collapse both',
      ['goog-button-collapse-left', 'goog-button-collapse-right'],
      button.getExtraClassNames());
}

function testCollapseWithStructuralClass() {
  testRenderer.setCollapsed(button, goog.ui.ButtonSide.BOTH);
  assertSameElements('Should use structural class for collapse classes',
      ['goog-base-collapse-left', 'goog-base-collapse-right'],
      button.getExtraClassNames());
}

function testUpdateAriaState() {
  var element = buttonRenderer.createDom(button);
  buttonRenderer.updateAriaState(element, goog.ui.Component.State.CHECKED,
      true);
  assertEquals('Button must have pressed ARIA state', 'true',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.PRESSED));

  // Test for updating a state other than CHECKED
  buttonRenderer.updateAriaState(element, goog.ui.Component.State.DISABLED,
      true);
  assertEquals('Button must have disabled ARIA state', 'true',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.DISABLED));

  buttonRenderer.updateAriaState(element, goog.ui.Component.State.CHECKED,
      false);
  assertEquals('Control must no longer have pressed ARIA state',
      'false',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.PRESSED));
  buttonRenderer.updateAriaState(element, goog.ui.Component.State.SELECTED,
      true);
  assertEquals('Button must have pressed ARIA state', 'true',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.PRESSED));
}

function testDoesntCallGetCssClassInConstructor() {
  goog.testing.ui.rendererasserts.
      assertNoGetCssClassCallsInConstructor(goog.ui.ButtonRenderer);
}
