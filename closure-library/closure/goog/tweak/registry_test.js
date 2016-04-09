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

goog.provide('goog.tweak.RegistryTest');
goog.setTestOnly('goog.tweak.RegistryTest');

goog.require('goog.asserts.AssertionError');
goog.require('goog.testing.jsunit');
goog.require('goog.tweak');
/** @suppress {extraRequire} needed for createRegistryEntries. */
goog.require('goog.tweak.testhelpers');

var registry;

function setUp() {
  createRegistryEntries('');
  registry = goog.tweak.getRegistry();
}

function tearDown() {
  goog.tweak.registry_ = null;
}

function testGetBaseEntry() {
  // Initial values
  assertEquals(
      'wrong bool1 object', boolEntry, registry.getBooleanSetting('Bool'));
  assertEquals(
      'wrong string object', strEntry, registry.getStringSetting('Str'));
  assertEquals(
      'wrong numeric object', numEntry, registry.getNumericSetting('Num'));
  assertEquals('wrong button object', buttonEntry, registry.getEntry('Button'));
  assertEquals(
      'wrong button object', boolGroup, registry.getEntry('BoolGroup'));
}

function testInitializeFromQueryParams() {
  var testCase = 0;
  function assertQuery(
      queryStr, boolValue, enumValue, strValue, subBoolValue, subBoolValue2) {
    createRegistryEntries(queryStr);
    assertEquals(
        'Wrong bool value for query: ' + queryStr, boolValue,
        boolEntry.getValue());
    assertEquals(
        'Wrong enum value for query: ' + queryStr, enumValue,
        strEnumEntry.getValue());
    assertEquals(
        'Wrong str value for query: ' + queryStr, strValue,
        strEntry.getValue());
    assertEquals(
        'Wrong BoolOne value for query: ' + queryStr, subBoolValue,
        boolOneEntry.getValue());
    assertEquals(
        'Wrong BoolTwo value for query: ' + queryStr, subBoolValue2,
        boolTwoEntry.getValue());
  }
  assertQuery('?dummy=1&bool=&enum=&s=', false, '', '', false, true);
  assertQuery('?bool=0&enum=A&s=a', false, 'A', 'a', false, true);
  assertQuery('?bool=1&enum=A', true, 'A', '', false, true);
  assertQuery('?bool=true&enum=B&s=as+df', true, 'B', 'as df', false, true);
  assertQuery('?enum=C', false, 'C', '', false, true);
  assertQuery('?enum=C&boolgroup=-booltwo', false, 'C', '', false, false);
  assertQuery('?enum=C&boolgroup=b1,-booltwo', false, 'C', '', true, false);
  assertQuery('?enum=C&boolgroup=b1', false, 'C', '', true, true);
  assertQuery('?s=a+b%20c%26', false, 'A', 'a b c&', false, true);
}

function testMakeUrlQuery() {
  assertEquals('All values are default.', '', registry.makeUrlQuery(''));
  assertEquals(
      'All values are default - with existing params.', '?super=pudu',
      registry.makeUrlQuery('?super=pudu'));

  boolEntry.setValue(true);
  numEnumEntry.setValue(2);
  strEntry.setValue('f o&o');
  assertEquals(
      'Wrong query string 1.', '?bool=1&enum2=2&s=f+o%26o',
      registry.makeUrlQuery('?bool=1'));
  assertEquals(
      'Wrong query string 1 - with existing params.',
      '?super=pudu&bool=1&enum2=2&s=f+o%26o',
      registry.makeUrlQuery('?bool=0&s=g&super=pudu'));

  boolOneEntry.setValue(true);
  assertEquals(
      'Wrong query string 2.', '?bool=1&boolgroup=B1&enum2=2&s=f+o%26o',
      registry.makeUrlQuery(''));

  boolTwoEntry.setValue(false);
  assertEquals(
      'Wrong query string 3.',
      '?bool=1&boolgroup=B1,-booltwo&enum2=2&s=f+o%26o',
      registry.makeUrlQuery(''));
}

function testOverrideDefaultValue_calledBefore() {
  registry.overrideDefaultValue('b', false);
  registry.overrideDefaultValue('b', true);
  goog.tweak.registerBoolean('b', 'b desc');
  var bEntry = registry.getEntry('b');
  assertTrue('Default value should be true.', bEntry.getDefaultValue());
  assertTrue('Value should be true.', bEntry.getValue());
}

function testOverrideDefaultValue_calledAfter() {
  var exception = assertThrows('Should assert.', function() {
    registry.overrideDefaultValue('Bool2', false);
  });
  assertTrue(
      'Wrong exception', exception instanceof goog.asserts.AssertionError);
}

function testCompilerOverrideDefaultValue() {
  createRegistryEntries('', {'b': true});
  registry = goog.tweak.getRegistry();
  goog.tweak.registerBoolean('b', 'b desc');
  var bEntry = registry.getEntry('b');
  assertTrue('Default value should be true.', bEntry.getDefaultValue());
  assertTrue('Value should be true.', bEntry.getValue());
}

function testCompilerAndJsOverrideDefaultValue() {
  createRegistryEntries('', {'b': false});
  registry = goog.tweak.getRegistry();
  registry.overrideDefaultValue('b', true);
  goog.tweak.registerBoolean('b', 'b desc', true);
  var bEntry = registry.getEntry('b');
  assertFalse('Default value should be false.', bEntry.getDefaultValue());
  assertFalse('Value should be false.', bEntry.getValue());
}
