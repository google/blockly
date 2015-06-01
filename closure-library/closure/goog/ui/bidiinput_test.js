// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.BidiInputTest');
goog.setTestOnly('goog.ui.BidiInputTest');

goog.require('goog.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.BidiInput');

function setUp() {
  document.body.focus();
}

function tearDown() {
  document.getElementById('emptyText').value = '';
  document.getElementById('bidiText').value = 'hello, world!';
}

function testEmptyInput() {
  var bidiInput = new goog.ui.BidiInput();
  var emptyText = goog.dom.getElement('emptyText');
  bidiInput.decorate(emptyText);
  assertEquals('', bidiInput.getValue());
  bidiInput.setValue('hello!');
  assertEquals('hello!', bidiInput.getValue());
}

function testSetDirection() {
  var shalomInHebrew = '\u05e9\u05dc\u05d5\u05dd';
  var isAGoodLanguageInHebrew =
      '\u05d4\u05d9\u05d0 \u05e9\u05e4\u05d4 \u05d8\u05d5\u05d1\u05d4';
  var learnInHebrew = '\u05dc\u05de\u05d3';

  var bidiInput = new goog.ui.BidiInput();
  var bidiText = goog.dom.getElement('bidiText');
  bidiInput.decorate(bidiText);
  assertEquals('ltr', bidiInput.getDirection());

  bidiInput.setValue(shalomInHebrew);
  assertEquals('rtl', bidiInput.getDirection());

  bidiInput.setValue('hello!');
  assertEquals('ltr', bidiInput.getDirection());

  bidiInput.setValue(':) , ? ! ' + shalomInHebrew);
  assertEquals('rtl', bidiInput.getDirection());

  bidiInput.setValue(':) , ? ! hello!');
  assertEquals('ltr', bidiInput.getDirection());

  bidiInput.setValue('   ;)   ');
  assertEquals(null, bidiInput.getDirection());

  bidiInput.setValue(shalomInHebrew + ', how are you today?');
  assertEquals('ltr', bidiInput.getDirection());

  bidiInput.setValue('Hello is ' + shalomInHebrew + ' in Hebrew');
  assertEquals('ltr', bidiInput.getDirection());

  bidiInput.setValue('JavaScript ' + isAGoodLanguageInHebrew);
  assertEquals('rtl', bidiInput.getDirection());

  bidiInput.setValue(learnInHebrew + ' JavaScript');
  assertEquals('rtl', bidiInput.getDirection());

  bidiInput.setValue('');
  assertEquals(null, bidiInput.getDirection());
}

function testSetDirection_inContenteditableDiv() {
  var shalomInHebrew = '\u05e9\u05dc\u05d5\u05dd';
  var isAGoodLanguageInHebrew =
      '\u05d4\u05d9\u05d0 \u05e9\u05e4\u05d4 \u05d8\u05d5\u05d1\u05d4';
  var learnInHebrew = '\u05dc\u05de\u05d3';

  var bidiInput = new goog.ui.BidiInput();
  var bidiTextDiv = goog.dom.getElement('bidiTextDiv');
  bidiInput.decorate(bidiTextDiv);
  assertEquals('ltr', bidiInput.getDirection());

  bidiInput.setValue(shalomInHebrew);
  assertEquals('rtl', bidiInput.getDirection());

  bidiInput.setValue('hello!');
  assertEquals('ltr', bidiInput.getDirection());

  bidiInput.setValue(':) , ? ! ' + shalomInHebrew);
  assertEquals('rtl', bidiInput.getDirection());

  bidiInput.setValue(':) , ? ! hello!');
  assertEquals('ltr', bidiInput.getDirection());

  bidiInput.setValue('   ;)   ');
  assertEquals(null, bidiInput.getDirection());

  bidiInput.setValue(shalomInHebrew + ', how are you today?');
  assertEquals('ltr', bidiInput.getDirection());

  bidiInput.setValue('Hello is ' + shalomInHebrew + ' in Hebrew');
  assertEquals('ltr', bidiInput.getDirection());

  bidiInput.setValue('JavaScript ' + isAGoodLanguageInHebrew);
  assertEquals('rtl', bidiInput.getDirection());

  bidiInput.setValue(learnInHebrew + ' JavaScript');
  assertEquals('rtl', bidiInput.getDirection());

  bidiInput.setValue('');
  assertEquals(null, bidiInput.getDirection());
}
