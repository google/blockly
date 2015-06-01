// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.i18n.pluralRulesTest');
goog.setTestOnly('goog.i18n.pluralRulesTest');

goog.require('goog.i18n.pluralRules');
goog.require('goog.testing.jsunit');


/** @suppress {missingRequire} */
var Keyword = goog.i18n.pluralRules.Keyword;

function testSimpleSelectEn() {
  var funcSelect = goog.i18n.pluralRules.enSelect_;

  assertEquals(Keyword.OTHER, funcSelect(0)); // 0 dollars
  assertEquals(Keyword.ONE, funcSelect(1)); // 1 dollar
  assertEquals(Keyword.OTHER, funcSelect(2)); // 2 dollars

  assertEquals(Keyword.OTHER, funcSelect(0, 2)); // 0.00 dollars
  assertEquals(Keyword.OTHER, funcSelect(1, 2)); // 1.00 dollars
  assertEquals(Keyword.OTHER, funcSelect(2, 2)); // 2.00 dollars
}

function testSimpleSelectRo() {
  var funcSelect = goog.i18n.pluralRules.roSelect_;

  assertEquals(Keyword.FEW, funcSelect(0)); // 0 dolari
  assertEquals(Keyword.ONE, funcSelect(1)); // 1 dolar
  assertEquals(Keyword.FEW, funcSelect(2)); // 2 dolari
  assertEquals(Keyword.FEW, funcSelect(12)); // 12 dolari
  assertEquals(Keyword.OTHER, funcSelect(23)); // 23 de dolari
  assertEquals(Keyword.FEW, funcSelect(1212)); // 1212 dolari
  assertEquals(Keyword.OTHER, funcSelect(1223)); // 1223 de dolari

  assertEquals(Keyword.FEW, funcSelect(0, 2)); // 0.00 dolari
  assertEquals(Keyword.FEW, funcSelect(1, 2)); // 1.00 dolari
  assertEquals(Keyword.FEW, funcSelect(2, 2)); // 2.00 dolari
  assertEquals(Keyword.FEW, funcSelect(12, 2)); // 12.00 dolari
  assertEquals(Keyword.FEW, funcSelect(23, 2)); // 23.00  dolari
  assertEquals(Keyword.FEW, funcSelect(1212, 2)); // 1212.00  dolari
  assertEquals(Keyword.FEW, funcSelect(1223, 2)); // 1223.00 dolari
}

function testSimpleSelectSr() {
  var funcSelect = goog.i18n.pluralRules.srSelect_; // Serbian

  assertEquals(Keyword.ONE, funcSelect(1));
  assertEquals(Keyword.ONE, funcSelect(31));
  assertEquals(Keyword.ONE, funcSelect(0.1));
  assertEquals(Keyword.ONE, funcSelect(1.1));
  assertEquals(Keyword.ONE, funcSelect(2.1));

  assertEquals(Keyword.FEW, funcSelect(3));
  assertEquals(Keyword.FEW, funcSelect(33));
  assertEquals(Keyword.FEW, funcSelect(0.2));
  assertEquals(Keyword.FEW, funcSelect(0.3));
  assertEquals(Keyword.FEW, funcSelect(0.4));
  assertEquals(Keyword.FEW, funcSelect(2.2));

  assertEquals(Keyword.OTHER, funcSelect(2.11));
  assertEquals(Keyword.OTHER, funcSelect(2.12));
  assertEquals(Keyword.OTHER, funcSelect(2.13));
  assertEquals(Keyword.OTHER, funcSelect(2.14));
  assertEquals(Keyword.OTHER, funcSelect(2.15));

  assertEquals(Keyword.OTHER, funcSelect(0));
  assertEquals(Keyword.OTHER, funcSelect(5));
  assertEquals(Keyword.OTHER, funcSelect(10));
  assertEquals(Keyword.OTHER, funcSelect(35));
  assertEquals(Keyword.OTHER, funcSelect(37));
  assertEquals(Keyword.OTHER, funcSelect(40));
  assertEquals(Keyword.OTHER, funcSelect(0.0, 1));
  assertEquals(Keyword.OTHER, funcSelect(0.5));
  assertEquals(Keyword.OTHER, funcSelect(0.6));

  assertEquals(Keyword.FEW, funcSelect(2));
  assertEquals(Keyword.ONE, funcSelect(2.1));
  assertEquals(Keyword.FEW, funcSelect(2.2));
  assertEquals(Keyword.FEW, funcSelect(2.3));
  assertEquals(Keyword.FEW, funcSelect(2.4));
  assertEquals(Keyword.OTHER, funcSelect(2.5));

  assertEquals(Keyword.OTHER, funcSelect(20));
  assertEquals(Keyword.ONE, funcSelect(21));
  assertEquals(Keyword.FEW, funcSelect(22));
  assertEquals(Keyword.FEW, funcSelect(23));
  assertEquals(Keyword.FEW, funcSelect(24));
  assertEquals(Keyword.OTHER, funcSelect(25));
}
