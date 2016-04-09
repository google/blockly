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

goog.provide('goog.debug.DevCssTest');
goog.setTestOnly('goog.debug.DevCssTest');

goog.require('goog.debug.DevCss');
goog.require('goog.style');
goog.require('goog.testing.jsunit');

var el;

function setUpPage() {
  el = document.getElementById('devcss-test-2');
}

// Since background color sometimes comes back like rgb(xxx, xxx, xxx)
// or rgb(xxx,xxx,xxx) depending on browser.
function spaceless(foo) {
  return foo.replace(/\s/g, '');
}

function testGetIe6CombinedSelectorText() {
  var devcssInstance = new goog.debug.DevCss();
  devcssInstance.ie6CombinedMatches_ = [];
  var css = '.class2 { -goog-ie6-selector:".class1_class2"; prop: val; }';
  var newCss = devcssInstance.getIe6CombinedSelectorText_(css);
  assertEquals('.class1_class2', newCss);
  assertArrayEquals(
      ['class1', 'class2'], devcssInstance.ie6CombinedMatches_[0].classNames);
  assertEquals(
      'class1_class2', devcssInstance.ie6CombinedMatches_[0].combinedClassName);

  devcssInstance = new goog.debug.DevCss();
  devcssInstance.ie6CombinedMatches_ = [];
  css = '.class3 { prop: val; -goog-ie6-selector:".class1_class2_class3";' +
      'prop: val; }';
  newCss = devcssInstance.getIe6CombinedSelectorText_(css);
  assertEquals('.class1_class2_class3', newCss);
  assertArrayEquals(
      ['class1', 'class2', 'class3'],
      devcssInstance.ie6CombinedMatches_[0].classNames);
  assertEquals(
      'class1_class2_class3',
      devcssInstance.ie6CombinedMatches_[0].combinedClassName);

  devcssInstance = new goog.debug.DevCss();
  devcssInstance.ie6CombinedMatches_ = [];
  css = '.class3, .class5 {' +
      '-goog-ie6-selector:".class1_class2_class3, .class4_class5";' +
      'prop: val; }';
  newCss = devcssInstance.getIe6CombinedSelectorText_(css);
  assertEquals('.class1_class2_class3, .class4_class5', newCss);
  assertArrayEquals(
      ['class1', 'class2', 'class3'],
      devcssInstance.ie6CombinedMatches_[0].classNames);
  assertEquals(
      'class1_class2_class3',
      devcssInstance.ie6CombinedMatches_[0].combinedClassName);
  assertArrayEquals(
      ['class4', 'class5'], devcssInstance.ie6CombinedMatches_[1].classNames);
  assertEquals(
      'class4_class5', devcssInstance.ie6CombinedMatches_[1].combinedClassName);
}

function testAddIe6CombinedClassNames() {
  var el_combined1 = document.getElementById('devcss-test-combined1');
  var el_combined2 = document.getElementById('devcss-test-combined2');
  var el_notcombined1 = document.getElementById('devcss-test-notcombined1');
  var el_notcombined2 = document.getElementById('devcss-test-notcombined2');
  var el_notcombined3 = document.getElementById('devcss-test-notcombined3');

  var devcssInstance = new goog.debug.DevCss();
  devcssInstance.ie6CombinedMatches_ = [
    {classNames: ['ie6-2', 'ie6-1'], combinedClassName: 'ie6-1_ie6-2', els: []},
    {
      classNames: ['ie6-2', 'ie6-3', 'ie6-1'],
      combinedClassName: 'ie6-1_ie6-2_ie6-3',
      els: []
    }
  ];

  devcssInstance.addIe6CombinedClassNames_();
  assertEquals(-1, el_notcombined1.className.indexOf('ie6-1_ie6-2'));
  assertEquals(-1, el_notcombined2.className.indexOf('ie6-1_ie6-2'));
  assertEquals(-1, el_notcombined3.className.indexOf('ie6-1_ie6-2_ie6-3'));
  assertTrue(el_combined1.className.indexOf('ie6-1_ie6-2') != -1);
  assertTrue(el_combined2.className.indexOf('ie6-1_ie6-2_ie6-3') != -1);
}

function testActivateBrowserSpecificCssALL() {
  // equals GECKO
  var devcssInstance = new goog.debug.DevCss('GECKO');
  devcssInstance.activateBrowserSpecificCssRules(false);
  var backgroundColor = goog.style.getBackgroundColor(el);
  assertEquals('rgb(255,192,203)', spaceless(backgroundColor));

  // GECKO test case w/ two selectors joined by a commma.
  var elGeckoOne = document.getElementById('devcss-gecko-1');
  backgroundColor = goog.style.getBackgroundColor(elGeckoOne);
  assertEquals('rgb(255,192,203)', spaceless(backgroundColor));
  var elGeckoTwo = document.getElementById('devcss-gecko-2');
  backgroundColor = goog.style.getBackgroundColor(elGeckoTwo);
  assertEquals('rgb(255,192,203)', spaceless(backgroundColor));
}


function testActivateBrowserSpecificCssWithVersion() {
  // equals IE 6
  var devcssInstance = new goog.debug.DevCss('IE', '6');
  devcssInstance.activateBrowserSpecificCssRules(false);
  var elIe6 = document.getElementById('devcss-test-ie6');
  var backgroundColor = goog.style.getBackgroundColor(elIe6);
  assertEquals('rgb(255,192,203)', spaceless(backgroundColor));

  // IE8 test case w/ two selectors joined by a commma.
  var devCssInstanceTwo = new goog.debug.DevCss('IE', '8');
  devCssInstanceTwo.activateBrowserSpecificCssRules(false);
  var elIe8One = document.getElementById('devcss-ie8-1');
  backgroundColor = goog.style.getBackgroundColor(elIe8One);
  assertEquals('rgb(255,192,203)', spaceless(backgroundColor));
  var elIe8Two = document.getElementById('devcss-ie8-2');
  backgroundColor = goog.style.getBackgroundColor(elIe8Two);
  assertEquals('rgb(255,192,203)', spaceless(backgroundColor));
}

function testActivateBrowserSpecificCssGteInvalid() {
  // WEBKIT_GTE255
  var marginBox = goog.style.getMarginBox(el);
  assertEquals(1, marginBox.top);  // should still be 1

  var devcssInstance = new goog.debug.DevCss('WEBKIT', 254);
  devcssInstance.activateBrowserSpecificCssRules(false);
  var marginBox = goog.style.getMarginBox(el);
  assertEquals(1, marginBox.top);  // should still be 1
}

function testActivateBrowserSpecificCssGteValid() {
  var devcssInstance = new goog.debug.DevCss('WEBKIT', 255);
  devcssInstance.activateBrowserSpecificCssRules(false);
  var marginBox = goog.style.getMarginBox(el);
  assertEquals(20, marginBox.top);
}

function testActivateBrowserSpecificCssLteInvalid() {
  // IE_LTE6
  var marginBox = goog.style.getMarginBox(el);
  assertEquals(1, marginBox.left);  // should still be 1

  var devcssInstance = new goog.debug.DevCss('WEBKIT', 202);
  devcssInstance.activateBrowserSpecificCssRules(false);
  var marginBox = goog.style.getMarginBox(el);
  assertEquals(1, marginBox.left);  // should still be 1
}

function testActivateBrowserSpecificCssLteValid() {
  var devcssInstance = new goog.debug.DevCss('WEBKIT', 199);
  devcssInstance.activateBrowserSpecificCssRules(false);
  var marginBox = goog.style.getMarginBox(el);
  assertEquals(15, marginBox.left);
}

function testReplaceIe6Selectors() {
  var devcssInstance = new goog.debug.DevCss('IE', 6);
  devcssInstance.activateBrowserSpecificCssRules(false);

  // It should correctly be transparent, even in IE6.
  var compound2El = document.getElementById('devcss-test-compound2');
  var backgroundColor = spaceless(goog.style.getBackgroundColor(compound2El));

  assertTrue(
      'Unexpected background color: ' + backgroundColor,
      'transparent' == backgroundColor || 'rgba(0,0,0,0)' == backgroundColor);

  // And this one should have the combined selector working, even in
  // IE6.
  backgroundColor = goog.style.getBackgroundColor(
      document.getElementById('devcss-test-compound1-2'));
  assertEquals('rgb(255,192,203)', spaceless(backgroundColor));
}

/*
 * TODO(user): Re-enable if we ever come up with a way to make imports
 * work.
function testDisableDuplicateStyleSheetImports() {
  var el1 = document.getElementById('devcss-test-importfixer-1');
  var el2 = document.getElementById('devcss-test-importfixer-2');

  var backgroundColor = goog.style.getBackgroundColor(el1);
  assertEquals('rgb(255,255,0)', spaceless(backgroundColor));

  var backgroundColor = goog.style.getBackgroundColor(el2);
  assertEquals('rgb(255,0,0)', spaceless(backgroundColor));

  // This should disable the second coming of devcss_test_import_1.css.
  var devcssInstance = new goog.debug.DevCss();
  devcssInstance.disableDuplicateStyleSheetImports();

  var backgroundColor = goog.style.getBackgroundColor(el1);
  assertEquals('rgb(255,255,0)', spaceless(backgroundColor));

  var backgroundColor = goog.style.getBackgroundColor(el2);
  assertEquals('rgb(173,216,230)', spaceless(backgroundColor));
}
*/
