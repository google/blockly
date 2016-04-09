// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.MenuSeparatorRendererTest');
goog.setTestOnly('goog.ui.MenuSeparatorRendererTest');

goog.require('goog.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.MenuSeparator');
goog.require('goog.ui.MenuSeparatorRenderer');

var sandbox;
var originalSandbox;

function setUp() {
  sandbox = goog.dom.getElement('sandbox');
  originalSandbox = sandbox.cloneNode(true);
}

function tearDown() {
  sandbox.parentNode.replaceChild(originalSandbox, sandbox);
}

function testDecorate() {
  var separator = new goog.ui.MenuSeparator();
  var dummyId = 'foo';
  separator.setId(dummyId);
  assertEquals(dummyId, separator.getId());
  var renderer = new goog.ui.MenuSeparatorRenderer();
  renderer.decorate(separator, goog.dom.getElement('separator'));
  assertEquals('separator', separator.getId());
}
