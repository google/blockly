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


goog.provide('goog.i18n.currencyTest');
goog.setTestOnly('goog.i18n.currencyTest');

goog.require('goog.i18n.NumberFormat');
goog.require('goog.i18n.currency');
goog.require('goog.i18n.currency.CurrencyInfo');
goog.require('goog.object');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

var stubs = new goog.testing.PropertyReplacer();

function setUp() {
  stubs.replace(
      goog.i18n.currency, 'CurrencyInfo',
      goog.object.clone(goog.i18n.currency.CurrencyInfo));
}

function tearDown() {
  stubs.reset();
}

function testAddTier2Support() {
  assertFalse('LRD' in goog.i18n.currency.CurrencyInfo);
  assertThrows(function() {
    goog.i18n.currency.getLocalCurrencyPattern('LRD');
  });

  goog.i18n.currency.addTier2Support();
  assertTrue('LRD' in goog.i18n.currency.CurrencyInfo);
  assertEquals(
      "'$'#,##0.00", goog.i18n.currency.getLocalCurrencyPattern('LRD'));
}

function testCurrencyPattern() {
  assertEquals(
      "'$'#,##0.00", goog.i18n.currency.getLocalCurrencyPattern('USD'));
  assertEquals(
      "'US$'#,##0.00", goog.i18n.currency.getPortableCurrencyPattern('USD'));
  assertEquals(
      "USD '$'#,##0.00", goog.i18n.currency.getGlobalCurrencyPattern('USD'));

  assertEquals("'¥'#,##0", goog.i18n.currency.getLocalCurrencyPattern('JPY'));
  assertEquals(
      "'JP¥'#,##0", goog.i18n.currency.getPortableCurrencyPattern('JPY'));
  assertEquals(
      "JPY '¥'#,##0", goog.i18n.currency.getGlobalCurrencyPattern('JPY'));

  assertEquals(
      "'€'#,##0.00", goog.i18n.currency.getLocalCurrencyPattern('EUR'));
  assertEquals(
      "'€'#,##0.00", goog.i18n.currency.getPortableCurrencyPattern('EUR'));
  assertEquals(
      "EUR '€'#,##0.00", goog.i18n.currency.getGlobalCurrencyPattern('EUR'));

  assertEquals(
      "'¥'#,##0.00", goog.i18n.currency.getLocalCurrencyPattern('CNY'));
  assertEquals(
      "'RMB¥'#,##0.00", goog.i18n.currency.getPortableCurrencyPattern('CNY'));
  assertEquals(
      "CNY '¥'#,##0.00", goog.i18n.currency.getGlobalCurrencyPattern('CNY'));

  assertEquals(
      "'Rial'#,##0", goog.i18n.currency.getLocalCurrencyPattern('YER'));
  assertEquals(
      "'Rial'#,##0", goog.i18n.currency.getPortableCurrencyPattern('YER'));
  assertEquals(
      "YER 'Rial'#,##0", goog.i18n.currency.getGlobalCurrencyPattern('YER'));

  assertEquals(
      "'CHF'#,##0.00", goog.i18n.currency.getLocalCurrencyPattern('CHF'));
  assertEquals(
      "'CHF'#,##0.00", goog.i18n.currency.getPortableCurrencyPattern('CHF'));
  assertEquals(
      "'CHF'#,##0.00", goog.i18n.currency.getGlobalCurrencyPattern('CHF'));
}

function testCurrencyFormatCHF() {
  var formatter;
  var str;

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getLocalCurrencyPattern('CHF'));
  str = formatter.format(123456.7899);
  assertEquals('CHF123,456.79', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getPortableCurrencyPattern('CHF'));
  str = formatter.format(123456.7899);
  assertEquals('CHF123,456.79', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getGlobalCurrencyPattern('CHF'));
  str = formatter.format(123456.7899);
  assertEquals('CHF123,456.79', str);
}

function testCurrencyFormatYER() {
  var formatter;
  var str;

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getLocalCurrencyPattern('YER'));
  str = formatter.format(123456.7899);
  assertEquals('Rial123,457', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getPortableCurrencyPattern('YER'));
  str = formatter.format(123456.7899);
  assertEquals('Rial123,457', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getGlobalCurrencyPattern('YER'));
  str = formatter.format(123456.7899);
  assertEquals('YER Rial123,457', str);
}

function testCurrencyFormatCNY() {
  var formatter;
  var str;

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getLocalCurrencyPattern('CNY'));
  str = formatter.format(123456.7899);
  assertEquals('¥123,456.79', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getPortableCurrencyPattern('CNY'));
  str = formatter.format(123456.7899);
  assertEquals('RMB¥123,456.79', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getGlobalCurrencyPattern('CNY'));
  str = formatter.format(123456.7899);
  assertEquals('CNY ¥123,456.79', str);
}

function testCurrencyFormatCZK() {
  var formatter;
  var str;

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getLocalCurrencyPattern('CZK'));
  str = formatter.format(123456.7899);
  assertEquals('123,456.79 Kč', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getPortableCurrencyPattern('CZK'));
  str = formatter.format(123456.7899);
  assertEquals('123,456.79 Kč', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getGlobalCurrencyPattern('CZK'));
  str = formatter.format(123456.7899);
  assertEquals('CZK 123,456.79 Kč', str);
}

function testCurrencyFormatEUR() {
  var formatter;
  var str;

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getLocalCurrencyPattern('EUR'));
  str = formatter.format(123456.7899);
  assertEquals('€123,456.79', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getPortableCurrencyPattern('EUR'));
  str = formatter.format(123456.7899);
  assertEquals('€123,456.79', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getGlobalCurrencyPattern('EUR'));
  str = formatter.format(123456.7899);
  assertEquals('EUR €123,456.79', str);
}

function testCurrencyFormatJPY() {
  var formatter;
  var str;

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getLocalCurrencyPattern('JPY'));
  str = formatter.format(123456.7899);
  assertEquals('¥123,457', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getPortableCurrencyPattern('JPY'));
  str = formatter.format(123456.7899);
  assertEquals('JP¥123,457', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getGlobalCurrencyPattern('JPY'));
  str = formatter.format(123456.7899);
  assertEquals('JPY ¥123,457', str);
}

function testCurrencyFormatPLN() {
  var formatter;
  var str;

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getLocalCurrencyPattern('PLN'));
  str = formatter.format(123456.7899);
  assertEquals('123,456.79 zł', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getPortableCurrencyPattern('PLN'));
  str = formatter.format(123456.7899);
  assertEquals('123,456.79 zł', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getGlobalCurrencyPattern('PLN'));
  str = formatter.format(123456.7899);
  assertEquals('PLN 123,456.79 zł', str);
}

function testCurrencyFormatUSD() {
  var formatter;
  var str;

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getLocalCurrencyPattern('USD'));
  str = formatter.format(123456.7899);
  assertEquals('$123,456.79', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getPortableCurrencyPattern('USD'));
  str = formatter.format(123456.7899);
  assertEquals('US$123,456.79', str);

  formatter = new goog.i18n.NumberFormat(
      goog.i18n.currency.getGlobalCurrencyPattern('USD'));
  str = formatter.format(123456.7899);
  assertEquals('USD $123,456.79', str);
}


function testIsPrefixSignPosition() {
  assertTrue(goog.i18n.currency.isPrefixSignPosition('USD'));
  assertTrue(goog.i18n.currency.isPrefixSignPosition('EUR'));
}

function testGetCurrencySign() {
  assertEquals('USD $', goog.i18n.currency.getGlobalCurrencySign('USD'));
  assertEquals('$', goog.i18n.currency.getLocalCurrencySign('USD'));
  assertEquals('US$', goog.i18n.currency.getPortableCurrencySign('USD'));

  assertEquals('YER Rial', goog.i18n.currency.getGlobalCurrencySign('YER'));
  assertEquals('Rial', goog.i18n.currency.getLocalCurrencySign('YER'));
  assertEquals('Rial', goog.i18n.currency.getPortableCurrencySign('YER'));
}
