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

goog.provide('goog.ui.CookieEditorTest');
goog.setTestOnly('goog.ui.CookieEditorTest');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.net.cookies');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.CookieEditor');

var COOKIE_KEY = 'my_fabulous_cookie';
var COOKIE_VALUES;

goog.net.cookies.get = function(key) {
  return COOKIE_VALUES[key];
};

goog.net.cookies.set = function(key, value) {
  return COOKIE_VALUES[key] = value;
};

goog.net.cookies.remove = function(key, value) {
  delete COOKIE_VALUES[key];
};

function setUp() {
  goog.dom.removeChildren(goog.dom.getElement('test_container'));
  COOKIE_VALUES = {};
}

function newCookieEditor(opt_cookieValue) {
  // Set cookie.
  if (opt_cookieValue) {
    goog.net.cookies.set(COOKIE_KEY, opt_cookieValue);
  }

  // Render editor.
  var editor = new goog.ui.CookieEditor();
  editor.selectCookie(COOKIE_KEY);
  editor.render(goog.dom.getElement('test_container'));
  assertEquals('wrong text area value', opt_cookieValue || '',
      editor.textAreaElem_.value || '');

  return editor;
}

function testRender() {
  // Render editor.
  var editor = newCookieEditor();

  // All expected elements created?
  var elem = editor.getElement();
  assertNotNullNorUndefined('missing element', elem);
  assertNotNullNorUndefined('missing clear button', editor.clearButtonElem_);
  assertNotNullNorUndefined('missing update button',
      editor.updateButtonElem_);
  assertNotNullNorUndefined('missing text area', editor.textAreaElem_);
}

function testEditCookie() {
  // Render editor.
  var editor = newCookieEditor();

  // Invalid value.
  var newValue = 'my bad value;';
  editor.textAreaElem_.value = newValue;
  goog.testing.events.fireBrowserEvent(new goog.events.Event(
      goog.events.EventType.CLICK, editor.updateButtonElem_));
  assertTrue('unexpected cookie value', !goog.net.cookies.get(COOKIE_KEY));

  // Valid value.
  newValue = 'my fabulous value';
  editor.textAreaElem_.value = newValue;
  goog.testing.events.fireBrowserEvent(new goog.events.Event(
      goog.events.EventType.CLICK, editor.updateButtonElem_));
  assertEquals('wrong cookie value', newValue,
      goog.net.cookies.get(COOKIE_KEY));
}

function testClearCookie() {
  // Render editor.
  var value = 'I will be cleared';
  var editor = newCookieEditor(value);

  // Clear value.
  goog.testing.events.fireBrowserEvent(new goog.events.Event(
      goog.events.EventType.CLICK, editor.clearButtonElem_));
  assertTrue('unexpected cookie value', !goog.net.cookies.get(COOKIE_KEY));
}
