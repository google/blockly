/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

function test_genUid() {
  var uuids = {};
  for (var i = 0; i < 1000; i++) {
    var uuid = Blockly.utils.genUid();
    assertFalse('UUID different: ' + uuid, uuid in uuids);
    uuids[uuid] = true;
  }
}

function test_addClass() {
  var p = document.createElement('p');
  Blockly.utils.addClass(p, 'one');
  assertEquals('Adding "one"', 'one', p.className);
  Blockly.utils.addClass(p, 'one');
  assertEquals('Adding duplicate "one"', 'one', p.className);
  Blockly.utils.addClass(p, 'two');
  assertEquals('Adding "two"', 'one two', p.className);
  Blockly.utils.addClass(p, 'two');
  assertEquals('Adding duplicate "two"', 'one two', p.className);
  Blockly.utils.addClass(p, 'three');
  assertEquals('Adding "three"', 'one two three', p.className);
}

function test_hasClass() {
   var p = document.createElement('p');
   p.className = ' one three  two three  ';
   assertTrue('Has "one"', Blockly.utils.hasClass(p, 'one'));
   assertTrue('Has "two"', Blockly.utils.hasClass(p, 'two'));
   assertTrue('Has "three"', Blockly.utils.hasClass(p, 'three'));
   assertFalse('Has no "four"', Blockly.utils.hasClass(p, 'four'));
   assertFalse('Has no "t"', Blockly.utils.hasClass(p, 't'));
 }

function test_removeClass() {
  var p = document.createElement('p');
  p.className = ' one three  two three  ';
  Blockly.utils.removeClass(p, 'two');
  assertEquals('Removing "two"', 'one three three', p.className);
  Blockly.utils.removeClass(p, 'four');
  assertEquals('Removing "four"', 'one three three', p.className);
  Blockly.utils.removeClass(p, 'three');
  assertEquals('Removing "three"', 'one', p.className);
  Blockly.utils.removeClass(p, 'ne');
  assertEquals('Removing "ne"', 'one', p.className);
  Blockly.utils.removeClass(p, 'one');
  assertEquals('Removing "one"', '', p.className);
  Blockly.utils.removeClass(p, 'zero');
  assertEquals('Removing "zero"', '', p.className);
}

function test_shortestStringLength() {
  var len = Blockly.utils.shortestStringLength('one,two,three,four,five'.split(','));
  assertEquals('Length of "one"', 3, len);
  len = Blockly.utils.shortestStringLength('one,two,three,four,five,'.split(','));
  assertEquals('Length of ""', 0, len);
  len = Blockly.utils.shortestStringLength(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.utils.shortestStringLength([]);
  assertEquals('Empty list', 0, len);
}

function test_commonWordPrefix() {
  var len = Blockly.utils.commonWordPrefix('one,two,three,four,five'.split(','));
  assertEquals('No prefix', 0, len);
  len = Blockly.utils.commonWordPrefix('Xone,Xtwo,Xthree,Xfour,Xfive'.split(','));
  assertEquals('No word prefix', 0, len);
  len = Blockly.utils.commonWordPrefix('abc de,abc de,abc de,abc de'.split(','));
  assertEquals('Full equality', 6, len);
  len = Blockly.utils.commonWordPrefix('abc deX,abc deY'.split(','));
  assertEquals('One word prefix', 4, len);
  len = Blockly.utils.commonWordPrefix('abc de,abc deY'.split(','));
  assertEquals('Overflow no', 4, len);
  len = Blockly.utils.commonWordPrefix('abc de,abc de Y'.split(','));
  assertEquals('Overflow yes', 6, len);
  len = Blockly.utils.commonWordPrefix(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.utils.commonWordPrefix([]);
  assertEquals('Empty list', 0, len);
  len = Blockly.utils.commonWordPrefix('turn&nbsp;left,turn&nbsp;right'.split(','));
  assertEquals('No prefix due to &amp;nbsp;', 0, len);
  len = Blockly.utils.commonWordPrefix('turn\u00A0left,turn\u00A0right'.split(','));
  assertEquals('No prefix due to \\u00A0', 0, len);
}

function test_commonWordSuffix() {
  var len = Blockly.utils.commonWordSuffix('one,two,three,four,five'.split(','));
  assertEquals('No prefix', 0, len);
  len = Blockly.utils.commonWordSuffix('oneX,twoX,threeX,fourX,fiveX'.split(','));
  assertEquals('No word prefix', 0, len);
  len = Blockly.utils.commonWordSuffix('abc de,abc de,abc de,abc de'.split(','));
  assertEquals('Full equality', 6, len);
  len = Blockly.utils.commonWordSuffix('Xabc de,Yabc de'.split(','));
  assertEquals('One word prefix', 3, len);
  len = Blockly.utils.commonWordSuffix('abc de,Yabc de'.split(','));
  assertEquals('Overflow no', 3, len);
  len = Blockly.utils.commonWordSuffix('abc de,Y abc de'.split(','));
  assertEquals('Overflow yes', 6, len);
  len = Blockly.utils.commonWordSuffix(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.utils.commonWordSuffix([]);
  assertEquals('Empty list', 0, len);
}

function test_tokenizeInterpolation() {
  var tokens = Blockly.utils.tokenizeInterpolation('');
  assertArrayEquals('Null interpolation', [], tokens);

  tokens = Blockly.utils.tokenizeInterpolation('Hello');
  assertArrayEquals('No interpolation', ['Hello'], tokens);

  tokens = Blockly.utils.tokenizeInterpolation('Hello%World');
  assertArrayEquals('Unescaped %.', ['Hello%World'], tokens);

  tokens = Blockly.utils.tokenizeInterpolation('Hello%%World');
  assertArrayEquals('Escaped %.', ['Hello%World'], tokens);

  tokens = Blockly.utils.tokenizeInterpolation('Hello %1 World');
  assertArrayEquals('Interpolation.', ['Hello ', 1, ' World'], tokens);

  tokens = Blockly.utils.tokenizeInterpolation('%123Hello%456World%789');
  assertArrayEquals('Interpolations.', [123, 'Hello', 456, 'World', 789], tokens);

  tokens = Blockly.utils.tokenizeInterpolation('%%%x%%0%00%01%');
  assertArrayEquals('Torture interpolations.', ['%%x%0', 0, 1, '%'], tokens);

  Blockly.Msg = Blockly.Msg || {};

  Blockly.Msg.STRING_REF = 'test string';
  tokens = Blockly.utils.tokenizeInterpolation('%{bky_string_ref}');
  assertArrayEquals('String table reference, lowercase', ['test string'], tokens);
  tokens = Blockly.utils.tokenizeInterpolation('%{BKY_STRING_REF}');
  assertArrayEquals('String table reference, uppercase', ['test string'], tokens);

  Blockly.Msg.WITH_PARAM = 'before %1 after';
  tokens = Blockly.utils.tokenizeInterpolation('%{bky_with_param}');
  assertArrayEquals('String table reference, with parameter', ['before ', 1, ' after'], tokens);

  Blockly.Msg.RECURSE = 'before %{bky_string_ref} after';
  tokens = Blockly.utils.tokenizeInterpolation('%{bky_recurse}');
  assertArrayEquals('String table reference, with subreference', ['before test string after'], tokens);

  // Error cases...
  tokens = Blockly.utils.tokenizeInterpolation('%{bky_undefined}');
  assertArrayEquals('Undefined string table reference', ['%{bky_undefined}'], tokens);

  Blockly.Msg['1'] = 'Will not match';
  tokens = Blockly.utils.tokenizeInterpolation('before %{1} after');
  assertArrayEquals('Invalid initial digit in string table reference', ['before %{1} after'], tokens);

  Blockly.Msg['TWO WORDS'] = 'Will not match';
  tokens = Blockly.utils.tokenizeInterpolation('before %{two words} after');
  assertArrayEquals('Invalid character in string table reference: space', ['before %{two words} after'], tokens);

  Blockly.Msg['TWO-WORDS'] = 'Will not match';
  tokens = Blockly.utils.tokenizeInterpolation('before %{two-words} after');
  assertArrayEquals('Invalid character in string table reference: dash', ['before %{two-words} after'], tokens);

  Blockly.Msg['TWO.WORDS'] = 'Will not match';
  tokens = Blockly.utils.tokenizeInterpolation('before %{two.words} after');
  assertArrayEquals('Invalid character in string table reference: period', ['before %{two.words} after'], tokens);

  Blockly.Msg['AB&C'] = 'Will not match';
  tokens = Blockly.utils.tokenizeInterpolation('before %{ab&c} after');
  assertArrayEquals('Invalid character in string table reference: &', ['before %{ab&c} after'], tokens);

  Blockly.Msg['UNCLOSED'] = 'Will not match';
  tokens = Blockly.utils.tokenizeInterpolation('before %{unclosed');
  assertArrayEquals('String table reference, with parameter', ['before %{unclosed'], tokens);
}

function test_replaceMessageReferences() {
  Blockly.Msg = Blockly.Msg || {};
  Blockly.Msg.STRING_REF = 'test string';
  Blockly.Msg.SUBREF = 'subref';
  Blockly.Msg.STRING_REF_WITH_ARG = 'test %1 string';
  Blockly.Msg.STRING_REF_WITH_SUBREF = 'test %{bky_subref} string';

  var resultString = Blockly.utils.replaceMessageReferences('');
  assertEquals('Empty string produces empty string', '', resultString);

  resultString = Blockly.utils.replaceMessageReferences('%%');
  assertEquals('Escaped %', '%', resultString);
  resultString = Blockly.utils.replaceMessageReferences('%%{bky_string_ref}');
  assertEquals('Escaped %', '%{bky_string_ref}', resultString);

  resultString = Blockly.utils.replaceMessageReferences('%a');
  assertEquals('Unrecognized % escape code treated as literal', '%a', resultString);

  resultString = Blockly.utils.replaceMessageReferences('%1');
  assertEquals('Interpolation tokens ignored.', '%1', resultString);
  resultString = Blockly.utils.replaceMessageReferences('%1 %2');
  assertEquals('Interpolation tokens ignored.', '%1 %2', resultString);
  resultString = Blockly.utils.replaceMessageReferences('before %1 after');
  assertEquals('Interpolation tokens ignored.', 'before %1 after', resultString);

  // Blockly.Msg.STRING_REF cases:
  resultString = Blockly.utils.replaceMessageReferences('%{bky_string_ref}');
  assertEquals('Message ref dereferenced.', 'test string', resultString);
  resultString = Blockly.utils.replaceMessageReferences('before %{bky_string_ref} after');
  assertEquals('Message ref dereferenced.', 'before test string after', resultString);

  // Blockly.Msg.STRING_REF_WITH_ARG cases:
  resultString = Blockly.utils.replaceMessageReferences('%{bky_string_ref_with_arg}');
  assertEquals('Message ref dereferenced with argument preserved.', 'test %1 string', resultString);
  resultString = Blockly.utils.replaceMessageReferences('before %{bky_string_ref_with_arg} after');
  assertEquals('Message ref dereferenced with argument preserved.', 'before test %1 string after', resultString);

  // Blockly.Msg.STRING_REF_WITH_SUBREF cases:
  resultString = Blockly.utils.replaceMessageReferences('%{bky_string_ref_with_subref}');
  assertEquals('Message ref and subref dereferenced.', 'test subref string', resultString);
  resultString = Blockly.utils.replaceMessageReferences('before %{bky_string_ref_with_subref} after');
  assertEquals('Message ref and subref dereferenced.', 'before test subref string after', resultString);
}

function test_startsWith() {
  assertEquals('Does not start with', false, Blockly.utils.startsWith('123', '2'));
  assertEquals('Start with', true, Blockly.utils.startsWith('123', '12'));
  assertEquals('Start with empty string 1', true, Blockly.utils.startsWith('123', ''));
  assertEquals('Start with empty string 2', true, Blockly.utils.startsWith('', ''));
}

function test_arrayRemove() {
  var arr = [1, 2, 3, 2];
  assertEquals('Remove Not found', false, Blockly.utils.arrayRemove(arr, 0));
  assertEquals('Remove Not found result', '1,2,3,2', arr.join(','));
  assertEquals('Remove item', true, Blockly.utils.arrayRemove(arr, 2));
  assertEquals('Remove item result', '1,3,2', arr.join(','));
  assertEquals('Remove item again', true, Blockly.utils.arrayRemove(arr, 2));
  assertEquals('Remove item again result', '1,3', arr.join(','));
}

function test_toRadians() {
  var quarter = Math.PI / 2;
  assertEquals('-90', -quarter, Blockly.utils.toRadians(-90));
  assertEquals('0', 0, Blockly.utils.toRadians(0));
  assertEquals('90', quarter, Blockly.utils.toRadians(90));
  assertEquals('180', 2 * quarter, Blockly.utils.toRadians(180));
  assertEquals('270', 3 * quarter, Blockly.utils.toRadians(270));
  assertEquals('360', 4 * quarter, Blockly.utils.toRadians(360));
  assertEquals('450', 5 * quarter, Blockly.utils.toRadians(360 + 90));
}

function test_toDegrees() {
  var quarter = Math.PI / 2;
  assertEquals('-90', -90, Blockly.utils.toDegrees(-quarter));
  assertEquals('0', 0, Blockly.utils.toDegrees(0));
  assertEquals('90', 90, Blockly.utils.toDegrees(quarter));
  assertEquals('180', 180, Blockly.utils.toDegrees(2 * quarter));
  assertEquals('270', 270, Blockly.utils.toDegrees(3 * quarter));
  assertEquals('360', 360, Blockly.utils.toDegrees(4 * quarter));
  assertEquals('450', 360 + 90, Blockly.utils.toDegrees(5 * quarter));
}
