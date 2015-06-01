// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.dom.TagNameTest');
goog.setTestOnly('goog.dom.TagNameTest');

goog.require('goog.dom.TagName');
goog.require('goog.object');
goog.require('goog.testing.jsunit');

function testCorrectNumberOfTagNames() {
  assertEquals(126, goog.object.getCount(goog.dom.TagName));
}

function testPropertyNamesEqualValues() {
  for (var propertyName in goog.dom.TagName) {
    assertEquals(propertyName, goog.dom.TagName[propertyName]);
  }
}
