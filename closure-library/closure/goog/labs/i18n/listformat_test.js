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

goog.provide('goog.labs.i18n.ListFormatTest');
goog.setTestOnly('goog.labs.i18n.ListFormatTest');

goog.require('goog.labs.i18n.GenderInfo');
goog.require('goog.labs.i18n.ListFormat');
goog.require('goog.labs.i18n.ListFormatSymbols');
goog.require('goog.labs.i18n.ListFormatSymbols_el');
goog.require('goog.labs.i18n.ListFormatSymbols_en');
goog.require('goog.labs.i18n.ListFormatSymbols_fr');
goog.require('goog.labs.i18n.ListFormatSymbols_ml');
goog.require('goog.labs.i18n.ListFormatSymbols_zu');
goog.require('goog.testing.jsunit');

function setUp() {
  // Always switch back to English on startup.
  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_en;
}

function testListFormatterArrayDirect() {
  var fmt = new goog.labs.i18n.ListFormat();
  assertEquals('One', fmt.format(['One']));
  assertEquals('One and Two', fmt.format(['One', 'Two']));
  assertEquals('One, Two, and Three', fmt.format(['One', 'Two', 'Three']));
  assertEquals(
      'One, Two, Three, Four, Five, and Six',
      fmt.format(['One', 'Two', 'Three', 'Four', 'Five', 'Six']));
}

function testListFormatterArrayIndirect() {
  var fmt = new goog.labs.i18n.ListFormat();

  var items = [];

  items.push('One');
  assertEquals('One', fmt.format(items));

  items.push('Two');
  assertEquals('One and Two', fmt.format(items));
  items.push('Three');
  assertEquals('One, Two, and Three', fmt.format(items));

  items.push('Four');
  items.push('Five');
  items.push('Six');
  assertEquals('One, Two, Three, Four, Five, and Six', fmt.format(items));
}

function testListFormatterFrench() {
  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_fr;

  var fmt = new goog.labs.i18n.ListFormat();
  assertEquals('One', fmt.format(['One']));
  assertEquals('One et Two', fmt.format(['One', 'Two']));
  assertEquals('One, Two et Three', fmt.format(['One', 'Two', 'Three']));
  assertEquals(
      'One, Two, Three, Four, Five et Six',
      fmt.format(['One', 'Two', 'Three', 'Four', 'Five', 'Six']));

  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_en;
}

// Malayalam and Zulu are the only two locales with pathers
// different than '{0} sometext {1}'
function testListFormatterSpecialLanguages() {
  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_ml;
  var fmt_ml = new goog.labs.i18n.ListFormat();
  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_zu;
  var fmt_zu = new goog.labs.i18n.ListFormat();
  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_en;

  // Only the end pattern is special with Malayalam
  // Escaped for safety, the string is 'One, Two, Three എന്നിവ'
  assertEquals(
      'One, Two, Three \u0D0E\u0D28\u0D4D\u0D28\u0D3F\u0D35',
      fmt_ml.format(['One', 'Two', 'Three']));

  // Only the two items pattern is special with Zulu
  assertEquals('I-One ne-Two', fmt_zu.format(['One', 'Two']));
}

function testVariousObjectTypes() {
  var fmt = new goog.labs.i18n.ListFormat();
  var booleanObject = new Boolean(1);
  var arrayObject = ['black', 'white'];
  // Not sure how "flaky" this is. Firefox and Chrome give the same results,
  // but I am not sure if the JavaScript standard specifies exactly what
  // Array toString does, for instance.
  assertEquals(
      'One, black,white, 42, true, and Five',
      fmt.format(['One', arrayObject, 42, booleanObject, 'Five']));
}

function testListGendersNeutral() {
  var Gender = goog.labs.i18n.GenderInfo.Gender;

  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_en;
  var listGen = new goog.labs.i18n.GenderInfo();

  assertEquals(Gender.MALE, listGen.getListGender([Gender.MALE]));
  assertEquals(Gender.FEMALE, listGen.getListGender([Gender.FEMALE]));
  assertEquals(Gender.OTHER, listGen.getListGender([Gender.OTHER]));

  assertEquals(Gender.OTHER, listGen.getListGender([Gender.MALE, Gender.MALE]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.FEMALE, Gender.FEMALE]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.OTHER, Gender.OTHER]));

  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.MALE, Gender.OTHER]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.OTHER, Gender.MALE]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.MALE, Gender.FEMALE]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.FEMALE, Gender.MALE]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.OTHER, Gender.FEMALE]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.FEMALE, Gender.OTHER]));

  assertEquals(
      Gender.OTHER,
      listGen.getListGender([Gender.MALE, Gender.FEMALE, Gender.OTHER]));
  assertEquals(
      Gender.OTHER,
      listGen.getListGender([Gender.MALE, Gender.OTHER, Gender.FEMALE]));
  assertEquals(
      Gender.OTHER,
      listGen.getListGender([Gender.FEMALE, Gender.MALE, Gender.OTHER]));
  assertEquals(
      Gender.OTHER,
      listGen.getListGender([Gender.FEMALE, Gender.OTHER, Gender.MALE]));
  assertEquals(
      Gender.OTHER,
      listGen.getListGender([Gender.OTHER, Gender.MALE, Gender.FEMALE]));
  assertEquals(
      Gender.OTHER,
      listGen.getListGender([Gender.OTHER, Gender.FEMALE, Gender.MALE]));
}

function testListGendersMaleTaints() {
  var Gender = goog.labs.i18n.GenderInfo.Gender;

  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_fr;
  var listGen = new goog.labs.i18n.GenderInfo();
  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_en;

  assertEquals(Gender.MALE, listGen.getListGender([Gender.MALE]));
  assertEquals(Gender.FEMALE, listGen.getListGender([Gender.FEMALE]));
  assertEquals(Gender.OTHER, listGen.getListGender([Gender.OTHER]));

  assertEquals(Gender.MALE, listGen.getListGender([Gender.MALE, Gender.MALE]));
  assertEquals(
      Gender.FEMALE, listGen.getListGender([Gender.FEMALE, Gender.FEMALE]));
  assertEquals(
      Gender.MALE, listGen.getListGender([Gender.OTHER, Gender.OTHER]));

  assertEquals(Gender.MALE, listGen.getListGender([Gender.MALE, Gender.OTHER]));
  assertEquals(Gender.MALE, listGen.getListGender([Gender.OTHER, Gender.MALE]));
  assertEquals(
      Gender.MALE, listGen.getListGender([Gender.MALE, Gender.FEMALE]));
  assertEquals(
      Gender.MALE, listGen.getListGender([Gender.FEMALE, Gender.MALE]));
  assertEquals(
      Gender.MALE, listGen.getListGender([Gender.OTHER, Gender.FEMALE]));
  assertEquals(
      Gender.MALE, listGen.getListGender([Gender.FEMALE, Gender.OTHER]));

  assertEquals(
      Gender.MALE,
      listGen.getListGender([Gender.MALE, Gender.FEMALE, Gender.OTHER]));
  assertEquals(
      Gender.MALE,
      listGen.getListGender([Gender.MALE, Gender.OTHER, Gender.FEMALE]));
  assertEquals(
      Gender.MALE,
      listGen.getListGender([Gender.FEMALE, Gender.MALE, Gender.OTHER]));
  assertEquals(
      Gender.MALE,
      listGen.getListGender([Gender.FEMALE, Gender.OTHER, Gender.MALE]));
  assertEquals(
      Gender.MALE,
      listGen.getListGender([Gender.OTHER, Gender.MALE, Gender.FEMALE]));
  assertEquals(
      Gender.MALE,
      listGen.getListGender([Gender.OTHER, Gender.FEMALE, Gender.MALE]));
}

function testListGendersMixedNeutral() {
  var Gender = goog.labs.i18n.GenderInfo.Gender;

  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_el;
  var listGen = new goog.labs.i18n.GenderInfo();
  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_en;

  assertEquals(Gender.MALE, listGen.getListGender([Gender.MALE]));
  assertEquals(Gender.FEMALE, listGen.getListGender([Gender.FEMALE]));
  assertEquals(Gender.OTHER, listGen.getListGender([Gender.OTHER]));

  assertEquals(Gender.MALE, listGen.getListGender([Gender.MALE, Gender.MALE]));
  assertEquals(
      Gender.FEMALE, listGen.getListGender([Gender.FEMALE, Gender.FEMALE]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.OTHER, Gender.OTHER]));

  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.MALE, Gender.OTHER]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.OTHER, Gender.MALE]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.MALE, Gender.FEMALE]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.FEMALE, Gender.MALE]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.OTHER, Gender.FEMALE]));
  assertEquals(
      Gender.OTHER, listGen.getListGender([Gender.FEMALE, Gender.OTHER]));

  assertEquals(
      Gender.OTHER,
      listGen.getListGender([Gender.MALE, Gender.FEMALE, Gender.OTHER]));
  assertEquals(
      Gender.OTHER,
      listGen.getListGender([Gender.MALE, Gender.OTHER, Gender.FEMALE]));
  assertEquals(
      Gender.OTHER,
      listGen.getListGender([Gender.FEMALE, Gender.MALE, Gender.OTHER]));
  assertEquals(
      Gender.OTHER,
      listGen.getListGender([Gender.FEMALE, Gender.OTHER, Gender.MALE]));
  assertEquals(
      Gender.OTHER,
      listGen.getListGender([Gender.OTHER, Gender.MALE, Gender.FEMALE]));
  assertEquals(
      Gender.OTHER,
      listGen.getListGender([Gender.OTHER, Gender.FEMALE, Gender.MALE]));
}

function testListGendersVariousCallTypes() {
  var Gender = goog.labs.i18n.GenderInfo.Gender;

  // Using French because with English the results are mostly Gender.OTHER
  // so we can detect fewer problems
  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_fr;
  var listGen = new goog.labs.i18n.GenderInfo();
  goog.labs.i18n.ListFormatSymbols = goog.labs.i18n.ListFormatSymbols_en;

  // Anynymous Arrays
  assertEquals(Gender.MALE, listGen.getListGender([Gender.MALE]));
  assertEquals(Gender.FEMALE, listGen.getListGender([Gender.FEMALE]));
  assertEquals(Gender.OTHER, listGen.getListGender([Gender.OTHER]));

  assertEquals(Gender.MALE, listGen.getListGender([Gender.MALE, Gender.MALE]));
  assertEquals(
      Gender.FEMALE, listGen.getListGender([Gender.FEMALE, Gender.FEMALE]));
  assertEquals(
      Gender.MALE, listGen.getListGender([Gender.OTHER, Gender.OTHER]));

  assertEquals(
      Gender.MALE, listGen.getListGender([Gender.MALE, Gender.FEMALE]));
  assertEquals(Gender.MALE, listGen.getListGender([Gender.MALE, Gender.OTHER]));
  assertEquals(
      Gender.MALE, listGen.getListGender([Gender.FEMALE, Gender.OTHER]));

  // Arrays
  var arrayM = [Gender.MALE];
  var arrayF = [Gender.FEMALE];
  var arrayO = [Gender.OTHER];

  var arrayMM = [Gender.MALE, Gender.MALE];
  var arrayFF = [Gender.FEMALE, Gender.FEMALE];
  var arrayOO = [Gender.OTHER, Gender.OTHER];

  var arrayMF = [Gender.MALE, Gender.FEMALE];
  var arrayMO = [Gender.MALE, Gender.OTHER];
  var arrayFO = [Gender.FEMALE, Gender.OTHER];

  assertEquals(Gender.MALE, listGen.getListGender(arrayM));
  assertEquals(Gender.FEMALE, listGen.getListGender(arrayF));
  assertEquals(Gender.OTHER, listGen.getListGender(arrayO));

  assertEquals(Gender.MALE, listGen.getListGender(arrayMM));
  assertEquals(Gender.FEMALE, listGen.getListGender(arrayFF));
  assertEquals(Gender.MALE, listGen.getListGender(arrayOO));

  assertEquals(Gender.MALE, listGen.getListGender(arrayMF));
  assertEquals(Gender.MALE, listGen.getListGender(arrayMO));
  assertEquals(Gender.MALE, listGen.getListGender(arrayFO));
}
