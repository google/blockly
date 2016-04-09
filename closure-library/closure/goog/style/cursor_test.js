// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.style.cursorTest');
goog.setTestOnly('goog.style.cursorTest');

goog.require('goog.style.cursor');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var baseCursorUrl = '/images/2/';
var origWindowsUserAgentValue;
var origGeckoUserAgentValue;
var origWebkitUserAgentValue;


function setUp() {
  origWindowsUserAgentValue = goog.userAgent.WINDOWS;
  origGeckoUserAgentValue = goog.userAgent.GECKO;
  origWebkitUserAgentValue = goog.userAgent.WEBKIT;
}


function tearDown() {
  goog.userAgent.WINDOWS = origWindowsUserAgentValue;
  goog.userAgent.GECKO = origGeckoUserAgentValue;
  goog.userAgent.WEBKIT = origWebkitUserAgentValue;
}


function testGetCursorStylesWebkit() {
  goog.userAgent.GECKO = false;
  goog.userAgent.WEBKIT = true;

  assertEquals(
      'Webkit should get a cursor style with moved hot-spot.',
      'url("/images/2/openhand.cur") 7 5, default',
      goog.style.cursor.getDraggableCursorStyle(baseCursorUrl));
  assertEquals(
      'Webkit should get a cursor style with moved hot-spot.',
      'url("/images/2/openhand.cur") 7 5, default',
      goog.style.cursor.getDraggableCursorStyle(baseCursorUrl, true));

  assertEquals(
      'Webkit should get a cursor style with moved hot-spot.',
      'url("/images/2/closedhand.cur") 7 5, move',
      goog.style.cursor.getDraggingCursorStyle(baseCursorUrl));
  assertEquals(
      'Webkit should get a cursor style with moved hot-spot.',
      'url("/images/2/closedhand.cur") 7 5, move',
      goog.style.cursor.getDraggingCursorStyle(baseCursorUrl, true));
}


function testGetCursorStylesFireFoxNonWin() {
  goog.userAgent.GECKO = true;
  goog.userAgent.WEBKIT = false;
  goog.userAgent.WINDOWS = false;

  assertEquals(
      'FireFox on non Windows should get a custom cursor style.', '-moz-grab',
      goog.style.cursor.getDraggableCursorStyle(baseCursorUrl));
  assertEquals(
      'FireFox on non Windows should get a custom cursor style and ' +
          'no !important modifier.',
      '-moz-grab',
      goog.style.cursor.getDraggableCursorStyle(baseCursorUrl, true));

  assertEquals(
      'FireFox on non Windows should get a custom cursor style.',
      '-moz-grabbing', goog.style.cursor.getDraggingCursorStyle(baseCursorUrl));
  assertEquals(
      'FireFox on non Windows should get a custom cursor style and ' +
          'no !important modifier.',
      '-moz-grabbing',
      goog.style.cursor.getDraggingCursorStyle(baseCursorUrl, true));
}


function testGetCursorStylesFireFoxWin() {
  goog.userAgent.GECKO = true;
  goog.userAgent.WEBKIT = false;
  goog.userAgent.WINDOWS = true;

  assertEquals(
      'FireFox should get a cursor style with URL.',
      'url("/images/2/openhand.cur"), default',
      goog.style.cursor.getDraggableCursorStyle(baseCursorUrl));
  assertEquals(
      'FireFox should get a cursor style with URL and no !important' +
          ' modifier.',
      'url("/images/2/openhand.cur"), default',
      goog.style.cursor.getDraggableCursorStyle(baseCursorUrl, true));

  assertEquals(
      'FireFox should get a cursor style with URL.',
      'url("/images/2/closedhand.cur"), move',
      goog.style.cursor.getDraggingCursorStyle(baseCursorUrl));
  assertEquals(
      'FireFox should get a cursor style with URL and no !important' +
          ' modifier.',
      'url("/images/2/closedhand.cur"), move',
      goog.style.cursor.getDraggingCursorStyle(baseCursorUrl, true));
}


function testGetCursorStylesOther() {
  goog.userAgent.GECKO = false;
  goog.userAgent.WEBKIT = false;

  assertEquals(
      'Other browsers (IE) should get a cursor style with URL.',
      'url("/images/2/openhand.cur"), default',
      goog.style.cursor.getDraggableCursorStyle(baseCursorUrl));
  assertEquals(
      'Other browsers (IE) should get a cursor style with URL.',
      'url("/images/2/openhand.cur"), default',
      goog.style.cursor.getDraggableCursorStyle(baseCursorUrl, true));

  assertEquals(
      'Other browsers (IE) should get a cursor style with URL.',
      'url("/images/2/closedhand.cur"), move',
      goog.style.cursor.getDraggingCursorStyle(baseCursorUrl));
  assertEquals(
      'Other browsers (IE) should get a cursor style with URL.',
      'url("/images/2/closedhand.cur"), move',
      goog.style.cursor.getDraggingCursorStyle(baseCursorUrl, true));
}
