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

goog.provide('goog.i18n.uCharNamesTest');
goog.setTestOnly('goog.i18n.uCharNamesTest');

goog.require('goog.i18n.uCharNames');
goog.require('goog.testing.jsunit');

function testToName() {
  var result = goog.i18n.uCharNames.toName(' ');
  assertEquals('Space', result);
}

function testToNameForNumberKey() {
  var result = goog.i18n.uCharNames.toName('\u2028');
  assertEquals('Line Separator', result);
}

function testToNameForVariationSelector() {
  var result = goog.i18n.uCharNames.toName('\ufe00');
  assertEquals('Variation Selector - 1', result);
}

function testToNameForVariationSelectorSupp() {
  var result = goog.i18n.uCharNames.toName('\uDB40\uDD00');
  assertEquals('Variation Selector - 17', result);
}

function testToNameForNull() {
  var result = goog.i18n.uCharNames.toName('a');
  assertNull(result);
}
