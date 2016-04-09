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

goog.provide('goog.ui.ButtonTest');
goog.setTestOnly('goog.ui.ButtonTest');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Button');
goog.require('goog.ui.ButtonRenderer');
goog.require('goog.ui.ButtonSide');
goog.require('goog.ui.Component');
goog.require('goog.ui.NativeButtonRenderer');

var sandbox;
var button;
var clonedButtonDom;
var demoButtonElement;

function setUp() {
  sandbox = goog.dom.getElement('sandbox');
  button = new goog.ui.Button();
  demoButtonElement = goog.dom.getElement('demoButton');
  clonedButtonDom = demoButtonElement.cloneNode(true);
}

function tearDown() {
  button.dispose();
  demoButtonElement.parentNode.replaceChild(clonedButtonDom, demoButtonElement);
  goog.dom.removeChildren(sandbox);
}

function testConstructor() {
  assertNotNull('Button must not be null', button);
  assertEquals(
      'Renderer must default to expected value',
      goog.ui.NativeButtonRenderer.getInstance(), button.getRenderer());

  var fakeDomHelper = {};
  var testButton = new goog.ui.Button(
      'Hello', goog.ui.ButtonRenderer.getInstance(), fakeDomHelper);
  assertEquals(
      'Content must have expected value', 'Hello', testButton.getContent());
  assertEquals(
      'Renderer must have expected value', goog.ui.ButtonRenderer.getInstance(),
      testButton.getRenderer());
  assertEquals(
      'DOM helper must have expected value', fakeDomHelper,
      testButton.getDomHelper());
  testButton.dispose();
}

function testGetSetValue() {
  assertUndefined(
      'Button\'s value must default to undefined', button.getValue());
  button.setValue(17);
  assertEquals('Button must have expected value', 17, button.getValue());
  button.render(sandbox);
  assertEquals(
      'Button element must have expected value', '17',
      button.getElement().value);
  button.setValue('foo');
  assertEquals(
      'Button element must have updated value', 'foo',
      button.getElement().value);
  button.setValueInternal('bar');
  assertEquals('Button must have new internal value', 'bar', button.getValue());
  assertEquals(
      'Button element must be unchanged', 'foo', button.getElement().value);
}

function testGetSetTooltip() {
  assertUndefined(
      'Button\'s tooltip must default to undefined', button.getTooltip());
  button.setTooltip('Hello');
  assertEquals(
      'Button must have expected tooltip', 'Hello', button.getTooltip());
  button.render(sandbox);
  assertEquals(
      'Button element must have expected title', 'Hello',
      button.getElement().title);
  button.setTooltip('Goodbye');
  assertEquals(
      'Button element must have updated title', 'Goodbye',
      button.getElement().title);
  button.setTooltipInternal('World');
  assertEquals(
      'Button must have new internal tooltip', 'World', button.getTooltip());
  assertEquals(
      'Button element must be unchanged', 'Goodbye', button.getElement().title);
}

function testSetCollapsed() {
  assertNull(
      'Button must not have any collapsed styling by default',
      button.getExtraClassNames());
  button.setCollapsed(goog.ui.ButtonSide.START);
  assertSameElements(
      'Button must have the start side collapsed',
      ['goog-button-collapse-left'], button.getExtraClassNames());
  button.render(sandbox);
  assertSameElements(
      'Button element must have the start side collapsed',
      ['goog-button', 'goog-button-collapse-left'],
      goog.dom.classlist.get(button.getElement()));
  button.setCollapsed(goog.ui.ButtonSide.BOTH);
  assertSameElements(
      'Button must have both sides collapsed',
      ['goog-button-collapse-left', 'goog-button-collapse-right'],
      button.getExtraClassNames());
  assertSameElements(
      'Button element must have both sides collapsed',
      [
        'goog-button', 'goog-button-collapse-left', 'goog-button-collapse-right'
      ],
      goog.dom.classlist.get(button.getElement()));
}

function testDispose() {
  assertFalse('Button must not have been disposed of', button.isDisposed());
  button.render(sandbox);
  button.setValue('foo');
  button.setTooltip('bar');
  button.dispose();
  assertTrue('Button must have been disposed of', button.isDisposed());
  assertUndefined('Button\'s value must have been deleted', button.getValue());
  assertUndefined(
      'Button\'s tooltip must have been deleted', button.getTooltip());
}

function testBasicButtonBehavior() {
  var dispatchedActionCount = 0;
  var handleAction = function() { dispatchedActionCount++; };
  goog.events.listen(button, goog.ui.Component.EventType.ACTION, handleAction);

  button.decorate(demoButtonElement);
  goog.testing.events.fireClickSequence(demoButtonElement);
  assertEquals(
      'Button must have dispatched ACTION on click', 1, dispatchedActionCount);

  dispatchedActionCount = 0;
  var e = new goog.events.Event(goog.events.KeyHandler.EventType.KEY, button);
  e.keyCode = goog.events.KeyCodes.ENTER;
  button.handleKeyEvent(e);
  assertEquals(
      'Enabled button must have dispatched ACTION on Enter key', 1,
      dispatchedActionCount);

  dispatchedActionCount = 0;
  e = new goog.events.Event(goog.events.EventType.KEYUP, button);
  e.keyCode = goog.events.KeyCodes.SPACE;
  button.handleKeyEvent(e);
  assertEquals(
      'Enabled button must have dispatched ACTION on Space key', 1,
      dispatchedActionCount);

  goog.events.unlisten(
      button, goog.ui.Component.EventType.ACTION, handleAction);
}

function testDisabledButtonBehavior() {
  var dispatchedActionCount = 0;
  var handleAction = function() { dispatchedActionCount++; };
  goog.events.listen(button, goog.ui.Component.EventType.ACTION, handleAction);

  button.setEnabled(false);

  dispatchedActionCount = 0;
  button.handleKeyEvent({keyCode: goog.events.KeyCodes.ENTER});
  assertEquals(
      'Disabled button must not dispatch ACTION on Enter key', 0,
      dispatchedActionCount);

  dispatchedActionCount = 0;
  button.handleKeyEvent(
      {keyCode: goog.events.KeyCodes.SPACE, type: goog.events.EventType.KEYUP});
  assertEquals(
      'Disabled button must not have dispatched ACTION on Space', 0,
      dispatchedActionCount);

  goog.events.unlisten(
      button, goog.ui.Component.EventType.ACTION, handleAction);
}

function testSpaceFireActionOnKeyUp() {
  var dispatchedActionCount = 0;
  var handleAction = function() { dispatchedActionCount++; };
  goog.events.listen(button, goog.ui.Component.EventType.ACTION, handleAction);

  dispatchedActionCount = 0;
  e = new goog.events.Event(goog.events.KeyHandler.EventType.KEY, button);
  e.keyCode = goog.events.KeyCodes.SPACE;
  button.handleKeyEvent(e);
  assertEquals(
      'Button must not have dispatched ACTION on Space keypress', 0,
      dispatchedActionCount);
  assertEquals(
      'The default action (scrolling) must have been prevented ' +
          'for Space keypress',
      false, e.returnValue_);


  dispatchedActionCount = 0;
  e = new goog.events.Event(goog.events.EventType.KEYUP, button);
  e.keyCode = goog.events.KeyCodes.SPACE;
  button.handleKeyEvent(e);
  assertEquals(
      'Button must have dispatched ACTION on Space keyup', 1,
      dispatchedActionCount);

  goog.events.unlisten(
      button, goog.ui.Component.EventType.ACTION, handleAction);
}

function testEnterFireActionOnKeyPress() {
  var dispatchedActionCount = 0;
  var handleAction = function() { dispatchedActionCount++; };
  goog.events.listen(button, goog.ui.Component.EventType.ACTION, handleAction);

  dispatchedActionCount = 0;
  e = new goog.events.Event(goog.events.KeyHandler.EventType.KEY, button);
  e.keyCode = goog.events.KeyCodes.ENTER;
  button.handleKeyEvent(e);
  assertEquals(
      'Button must have dispatched ACTION on Enter keypress', 1,
      dispatchedActionCount);

  dispatchedActionCount = 0;
  e = new goog.events.Event(goog.events.EventType.KEYUP, button);
  e.keyCode = goog.events.KeyCodes.ENTER;
  button.handleKeyEvent(e);
  assertEquals(
      'Button must not have dispatched ACTION on Enter keyup', 0,
      dispatchedActionCount);

  goog.events.unlisten(
      button, goog.ui.Component.EventType.ACTION, handleAction);
}

function testSetAriaLabel() {
  assertNull(
      'Button must not have aria label by default', button.getAriaLabel());
  button.setAriaLabel('Button 1');
  button.render();
  assertEquals(
      'Button element must have expected aria-label', 'Button 1',
      button.getElement().getAttribute('aria-label'));
  button.setAriaLabel('Button 2');
  assertEquals(
      'Button element must have updated aria-label', 'Button 2',
      button.getElement().getAttribute('aria-label'));
}

function testSetAriaLabel_decorate() {
  assertNull(
      'Button must not have aria label by default', button.getAriaLabel());
  button.setAriaLabel('Button 1');
  button.decorate(demoButtonElement);
  var el = button.getElementStrict();
  assertEquals(
      'Button element must have expected aria-label', 'Button 1',
      el.getAttribute('aria-label'));
  assertEquals(
      'Button element must have expected aria-role', 'button',
      el.getAttribute('role'));
  button.setAriaLabel('Button 2');
  assertEquals(
      'Button element must have updated aria-label', 'Button 2',
      el.getAttribute('aria-label'));
  assertEquals(
      'Button element must have expected aria-role', 'button',
      el.getAttribute('role'));
}
