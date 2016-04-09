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

goog.provide('goog.dom.iframeTest');
goog.setTestOnly('goog.dom.iframeTest');

goog.require('goog.dom');
goog.require('goog.dom.iframe');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeStyle');
goog.require('goog.string.Const');
goog.require('goog.testing.jsunit');

var domHelper;
var sandbox;

function setUpPage() {
  domHelper = goog.dom.getDomHelper();
  sandbox = domHelper.getElement('sandbox');
}

function setUp() {
  goog.dom.removeChildren(sandbox);
}

function testCreateWithContent() {
  var iframe = goog.dom.iframe.createWithContent(
      sandbox, '<title>Foo Title</title>', '<div id="blah">Test</div>',
      'position: absolute', false /* opt_quirks */);

  var doc = goog.dom.getFrameContentDocument(iframe);
  assertNotNull(doc.getElementById('blah'));
  assertEquals('Foo Title', doc.title);
  assertEquals('absolute', iframe.style.position);
}

function testCreateWithContent_safeTypes() {
  var head = goog.html.SafeHtml.create('title', {}, 'Foo Title');
  var body = goog.html.SafeHtml.create('div', {id: 'blah'}, 'Test');
  var style = goog.html.SafeStyle.fromConstant(
      goog.string.Const.from('position: absolute;'));
  var iframe = goog.dom.iframe.createWithContent(
      sandbox, head, body, style, false /* opt_quirks */);

  var doc = goog.dom.getFrameContentDocument(iframe);
  assertNotNull(doc.getElementById('blah'));
  assertEquals('Foo Title', doc.title);
  assertEquals('absolute', iframe.style.position);
}

function testCreateBlankYieldsIframeWithNoBorderOrPadding() {
  var iframe = goog.dom.iframe.createBlank(domHelper);
  iframe.style.width = '350px';
  iframe.style.height = '250px';
  var blankElement = domHelper.getElement('blank');
  blankElement.appendChild(iframe);
  assertEquals(
      'Width should be as styled: no extra borders, padding, etc.', 350,
      blankElement.offsetWidth);
  assertEquals(
      'Height should be as styled: no extra borders, padding, etc.', 250,
      blankElement.offsetHeight);
}

function testCreateBlankWithStyles() {
  var iframe = goog.dom.iframe.createBlank(domHelper, 'position:absolute;');
  assertEquals('absolute', iframe.style.position);
  assertEquals('bottom', iframe.style.verticalAlign);
}

function testCreateBlankWithSafeStyles() {
  var iframe = goog.dom.iframe.createBlank(
      domHelper, goog.html.SafeStyle.fromConstant(
                     goog.string.Const.from('position:absolute;')));
  assertEquals('absolute', iframe.style.position);
  assertEquals('bottom', iframe.style.verticalAlign);
}
