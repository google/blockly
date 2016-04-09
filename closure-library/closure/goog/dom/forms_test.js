// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.dom.formsTest');
goog.setTestOnly('goog.dom.formsTest');

goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.testing.jsunit');

function testGetFormDataString() {
  var el = goog.dom.getElement('testform1');
  var result = goog.dom.forms.getFormDataString(el);
  assertEquals(
      'in1=foo&in2=bar&in2=baaz&in3=&pass=bar&textarea=foo%20bar%20baz&' +
          'select1=1&select2=a&select2=c&select3=&checkbox1=on&radio=X&radio2=Y',
      result);
}

function testGetFormDataMap() {
  var el = goog.dom.getElement('testform1');
  var result = goog.dom.forms.getFormDataMap(el);

  assertArrayEquals(['foo'], result.get('in1'));
  assertArrayEquals(['bar', 'baaz'], result.get('in2'));
  assertArrayEquals(['1'], result.get('select1'));
  assertArrayEquals(['a', 'c'], result.get('select2'));
  assertArrayEquals(['on'], result.get('checkbox1'));
  assertUndefined(result.get('select6'));
  assertUndefined(result.get('checkbox2'));
  assertArrayEquals(['X'], result.get('radio'));
  assertArrayEquals(['Y'], result.get('radio2'));
}

function testHasFileInput() {
  var el = goog.dom.getElement('testform1');
  assertFalse(goog.dom.forms.hasFileInput(el));
  el = goog.dom.getElement('testform2');
  assertTrue(goog.dom.forms.hasFileInput(el));
}


function testGetValueOnAtypicalValueElements() {
  var el = goog.dom.getElement('testdiv1');
  var result = goog.dom.forms.getValue(el);
  assertNull(result);
  var el = goog.dom.getElement('testfieldset1');
  var result = goog.dom.forms.getValue(el);
  assertNull(result);
  var el = goog.dom.getElement('testlegend1');
  var result = goog.dom.forms.getValue(el);
  assertNull(result);
}

function testHasValueInput() {
  var el = goog.dom.getElement('in1');
  var result = goog.dom.forms.hasValue(el);
  assertTrue(result);
}

function testGetValueByNameForNonExistentElement() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.getValueByName(form, 'non_existent');
  assertNull(result);
}

function testHasValueByNameInput() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.hasValueByName(form, 'in1');
  assertTrue(result);
}

function testHasValueInputEmpty() {
  var el = goog.dom.getElement('in3');
  var result = goog.dom.forms.hasValue(el);
  assertFalse(result);
}

function testHasValueByNameEmpty() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.hasValueByName(form, 'in3');
  assertFalse(result);
}

function testHasValueRadio() {
  var el = goog.dom.getElement('radio1');
  var result = goog.dom.forms.hasValue(el);
  assertTrue(result);
}

function testHasValueByNameRadio() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.hasValueByName(form, 'radio');
  assertTrue(result);
}

function testHasValueRadioNotChecked() {
  var el = goog.dom.getElement('radio2');
  var result = goog.dom.forms.hasValue(el);
  assertFalse(result);
}

function testHasValueByNameRadioNotChecked() {
  var form = goog.dom.getElement('testform3');
  var result = goog.dom.forms.hasValueByName(form, 'radio3');
  assertFalse(result);
}

function testHasValueSelectSingle() {
  var el = goog.dom.getElement('select1');
  var result = goog.dom.forms.hasValue(el);
  assertTrue(result);
}

function testHasValueByNameSelectSingle() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.hasValueByName(form, 'select1');
  assertTrue(result);
}

function testHasValueSelectMultiple() {
  var el = goog.dom.getElement('select2');
  var result = goog.dom.forms.hasValue(el);
  assertTrue(result);
}

function testHasValueByNameSelectMultiple() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.hasValueByName(form, 'select2');
  assertTrue(result);
}

function testHasValueSelectNotSelected() {
  // select without value
  var el = goog.dom.getElement('select3');
  var result = goog.dom.forms.hasValue(el);
  assertFalse(result);
}

function testHasValueByNameSelectNotSelected() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.hasValueByName(form, 'select3');
  assertFalse(result);
}

function testHasValueSelectMultipleNotSelected() {
  var el = goog.dom.getElement('select6');
  var result = goog.dom.forms.hasValue(el);
  assertFalse(result);
}

function testHasValueByNameSelectMultipleNotSelected() {
  var form = goog.dom.getElement('testform3');
  var result = goog.dom.forms.hasValueByName(form, 'select6');
  assertFalse(result);
}

// TODO(user): make this a meaningful selenium test
function testSetDisabledFalse() {}
function testSetDisabledTrue() {}

// TODO(user): make this a meaningful selenium test
function testFocusAndSelect() {
  var el = goog.dom.getElement('in1');
  goog.dom.forms.focusAndSelect(el);
}

function testGetValueInput() {
  var el = goog.dom.getElement('in1');
  var result = goog.dom.forms.getValue(el);
  assertEquals('foo', result);
}

function testSetValueInput() {
  var el = goog.dom.getElement('in3');
  goog.dom.forms.setValue(el, 'foo');
  assertEquals('foo', goog.dom.forms.getValue(el));

  goog.dom.forms.setValue(el, 3500);
  assertEquals('3500', goog.dom.forms.getValue(el));

  goog.dom.forms.setValue(el, 0);
  assertEquals('0', goog.dom.forms.getValue(el));

  goog.dom.forms.setValue(el, null);
  assertEquals('', goog.dom.forms.getValue(el));

  goog.dom.forms.setValue(el, undefined);
  assertEquals('', goog.dom.forms.getValue(el));

  goog.dom.forms.setValue(el, false);
  assertEquals('false', goog.dom.forms.getValue(el));

  goog.dom.forms.setValue(el, {});
  assertEquals({}.toString(), goog.dom.forms.getValue(el));

  goog.dom.forms.setValue(el, {toString: function() { return 'test'; }});
  assertEquals('test', goog.dom.forms.getValue(el));

  // unset
  goog.dom.forms.setValue(el);
  assertEquals('', goog.dom.forms.getValue(el));
}

function testGetValuePassword() {
  var el = goog.dom.getElement('pass');
  var result = goog.dom.forms.getValue(el);
  assertEquals('bar', result);
}

function testGetValueByNamePassword() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.getValueByName(form, 'pass');
  assertEquals('bar', result);
}

function testGetValueTextarea() {
  var el = goog.dom.getElement('textarea1');
  var result = goog.dom.forms.getValue(el);
  assertEquals('foo bar baz', result);
}

function testGetValueByNameTextarea() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.getValueByName(form, 'textarea1');
  assertEquals('foo bar baz', result);
}

function testSetValueTextarea() {
  var el = goog.dom.getElement('textarea2');
  goog.dom.forms.setValue(el, 'foo bar baz');
  var result = goog.dom.forms.getValue(el);
  assertEquals('foo bar baz', result);
}

function testGetValueSelectSingle() {
  var el = goog.dom.getElement('select1');
  var result = goog.dom.forms.getValue(el);
  assertEquals('1', result);
}

function testGetValueByNameSelectSingle() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.getValueByName(form, 'select1');
  assertEquals('1', result);
}

function testSetValueSelectSingle() {
  var el = goog.dom.getElement('select4');
  goog.dom.forms.setValue(el, '2');
  var result = goog.dom.forms.getValue(el);
  assertEquals('2', result);
  // unset
  goog.dom.forms.setValue(el);
  var result = goog.dom.forms.getValue(el);
  assertNull(result);
}

function testSetValueSelectSingleEmptyString() {
  var el = goog.dom.getElement('select7');
  // unset
  goog.dom.forms.setValue(el);
  var result = goog.dom.forms.getValue(el);
  assertNull(result);
  goog.dom.forms.setValue(el, '');
  result = goog.dom.forms.getValue(el);
  assertEquals('', result);
}

function testGetValueSelectMultiple() {
  var el = goog.dom.getElement('select2');
  var result = goog.dom.forms.getValue(el);
  assertArrayEquals(['a', 'c'], result);
}

function testGetValueSelectMultipleNotSelected() {
  var el = goog.dom.getElement('select6');
  var result = goog.dom.forms.getValue(el);
  assertNull(result);
}

function testGetValueByNameSelectMultiple() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.getValueByName(form, 'select2');
  assertArrayEquals(['a', 'c'], result);
}

function testSetValueSelectMultiple() {
  var el = goog.dom.getElement('select5');
  goog.dom.forms.setValue(el, ['a', 'c']);
  var result = goog.dom.forms.getValue(el);
  assertArrayEquals(['a', 'c'], result);

  goog.dom.forms.setValue(el, 'a');
  var result = goog.dom.forms.getValue(el);
  assertArrayEquals(['a'], result);

  // unset
  goog.dom.forms.setValue(el);
  var result = goog.dom.forms.getValue(el);
  assertNull(result);
}

function testGetValueCheckbox() {
  var el = goog.dom.getElement('checkbox1');
  var result = goog.dom.forms.getValue(el);
  assertEquals('on', result);
  var el = goog.dom.getElement('checkbox2');
  var result = goog.dom.forms.getValue(el);
  assertNull(result);
}

function testGetValueByNameCheckbox() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.getValueByName(form, 'checkbox1');
  assertEquals('on', result);
  result = goog.dom.forms.getValueByName(form, 'checkbox2');
  assertNull(result);
}

function testGetValueRadio() {
  var el = goog.dom.getElement('radio1');
  var result = goog.dom.forms.getValue(el);
  assertEquals('X', result);
  var el = goog.dom.getElement('radio2');
  var result = goog.dom.forms.getValue(el);
  assertNull(result);
}

function testGetValueByNameRadio() {
  var form = goog.dom.getElement('testform1');
  var result = goog.dom.forms.getValueByName(form, 'radio');
  assertEquals('X', result);

  result = goog.dom.forms.getValueByName(form, 'radio2');
  assertEquals('Y', result);
}

function testGetValueButton() {
  var el = goog.dom.getElement('button');
  var result = goog.dom.forms.getValue(el);
  assertEquals('button', result);
}

function testGetValueSubmit() {
  var el = goog.dom.getElement('submit');
  var result = goog.dom.forms.getValue(el);
  assertEquals('submit', result);
}

function testGetValueReset() {
  var el = goog.dom.getElement('reset');
  var result = goog.dom.forms.getValue(el);
  assertEquals('reset', result);
}

function testGetFormDataHelperAndNonInputElements() {
  var el = goog.dom.getElement('testform4');
  goog.dom.forms.getFormDataHelper_(el, {}, goog.nullFunction);
}
