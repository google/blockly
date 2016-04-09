// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.dom.tagsTest');
goog.setTestOnly('goog.dom.tagsTest');

goog.require('goog.dom.tags');
goog.require('goog.testing.jsunit');


function testIsVoidTag() {
  assertTrue(goog.dom.tags.isVoidTag('br'));
  assertFalse(goog.dom.tags.isVoidTag('a'));
  assertFalse(goog.dom.tags.isVoidTag('constructor'));
}
