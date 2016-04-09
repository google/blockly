// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.SplitBehaviorTest');
goog.setTestOnly('goog.ui.SplitBehaviorTest');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.SplitBehavior');
goog.require('goog.ui.decorate');

var splitbehavior;
var button;
var menuValues;
var menu;
var menuButton;
var splitDiv;

function setUp() {
  splitDiv = document.getElementById('split');
  button = new goog.ui.CustomButton('text');
  menu = new goog.ui.Menu();
  menuValues = ['a', 'b', 'c'];
  goog.array.forEach(
      menuValues, function(val) { menu.addItem(new goog.ui.MenuItem(val)); });
  menuButton = new goog.ui.MenuButton('text', menu);
  splitbehavior = new goog.ui.SplitBehavior(button, menuButton);
}

function tearDown() {
  button.dispose();
  menu.dispose();
  menuButton.dispose();
  splitbehavior.dispose();
  goog.dom.removeChildren(splitDiv);
  splitDiv.className = '';
}

function testRender() {
  assertEquals(
      'no elements in doc with goog-split-behavior class', 0,
      goog.dom
          .getElementsByTagNameAndClass(
              goog.dom.TagName.DIV, 'goog-split-behavior')
          .length);
  splitbehavior.render(splitDiv);
  assertEquals('two childs are rendered', 2, splitDiv.childNodes.length);
  assertEquals(
      'one element in doc with goog-split-behavior class', 1,
      goog.dom
          .getElementsByTagNameAndClass(
              goog.dom.TagName.DIV, 'goog-split-behavior')
          .length);
  assertEquals(
      'one goog-custom-button', 1,
      goog.dom
          .getElementsByTagNameAndClass(
              goog.dom.TagName.DIV, 'goog-custom-button', splitDiv)
          .length);
  assertEquals(
      'one goog-menu-button', 1,
      goog.dom
          .getElementsByTagNameAndClass(
              goog.dom.TagName.DIV, 'goog-menu-button', splitDiv)
          .length);
}

function testDecorate() {
  var decorateDiv = goog.dom.createDom(
      goog.dom.TagName.DIV, 'goog-split-behavior',
      goog.dom.createDom(goog.dom.TagName.DIV, 'goog-custom-button'),
      goog.dom.createDom(goog.dom.TagName.DIV, 'goog-menu-button'));
  goog.dom.appendChild(splitDiv, decorateDiv);
  var split = goog.ui.decorate(decorateDiv);
  assertNotNull(split);
  assertTrue(
      'instance of SplitBehavior', split.constructor == goog.ui.SplitBehavior);
  assertNotNull(split.first_);
  assertTrue(
      'instance of CustomButton',
      split.first_.constructor == goog.ui.CustomButton);
  assertNotNull(split.second_);
  assertTrue(
      'instance of MenuButton',
      split.second_.constructor == goog.ui.MenuButton);
}

function testBehaviorDefault() {
  splitbehavior.render(splitDiv);
  assertEquals('original caption is "text"', 'text', button.getCaption());
  var menuItem = menuButton.getMenu().getChildAt(0);
  var type = goog.ui.Component.EventType.ACTION;
  goog.events.dispatchEvent(menuButton, new goog.events.Event(type, menuItem));
  assertEquals('caption is updated to "a"', 'a', button.getCaption());
}

function testBehaviorCustomEvent() {
  splitbehavior.render(splitDiv);
  assertEquals('original caption is "text"', 'text', button.getCaption());
  var type = goog.ui.Component.EventType.ENTER;
  splitbehavior.setEventType(type);
  var menuItem = menuButton.getMenu().getChildAt(0);
  goog.events.dispatchEvent(menuButton, new goog.events.Event(type, menuItem));
  assertEquals('caption is updated to "a"', 'a', button.getCaption());
}

function testBehaviorCustomHandler() {
  splitbehavior.render(splitDiv);
  var called = false;
  splitbehavior.setHandler(function() { called = true; });
  goog.events.dispatchEvent(menuButton, goog.ui.Component.EventType.ACTION);
  assertTrue('custom handler is called', called);
}

function testSetActive() {
  splitbehavior.render(splitDiv, false);
  assertEquals('original caption is "text"', 'text', button.getCaption());
  var menuItem = menuButton.getMenu().getChildAt(0);
  var type = goog.ui.Component.EventType.ACTION;
  goog.events.dispatchEvent(menuButton, new goog.events.Event(type, menuItem));
  assertEquals('caption remains "text"', 'text', button.getCaption());

  splitbehavior.setActive(true);
  goog.events.dispatchEvent(menuButton, new goog.events.Event(type, menuItem));
  assertEquals('caption is updated to "a"', 'a', button.getCaption());
}

function testDispose() {
  goog.dispose(splitbehavior);
  assertTrue(splitbehavior.isDisposed());
  assertTrue(splitbehavior.first_.isDisposed());
  assertTrue(splitbehavior.second_.isDisposed());
}

function testDisposeNoControls() {
  splitbehavior.setDisposeControls(false);
  goog.dispose(splitbehavior);
  assertTrue(splitbehavior.isDisposed());
  assertFalse(splitbehavior.first_.isDisposed());
  assertFalse(splitbehavior.second_.isDisposed());
}

function testDisposeFirstAndNotSecondControl() {
  splitbehavior.setDisposeControls(true, false);
  goog.dispose(splitbehavior);
  assertTrue(splitbehavior.isDisposed());
  assertTrue(splitbehavior.first_.isDisposed());
  assertFalse(splitbehavior.second_.isDisposed());
}
