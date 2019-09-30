/**
 * @license
 * Copyright 2011 Google LLC
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

function test_arrayRemove() {
  var arr = [1, 2, 3, 2];
  assertEquals('Remove Not found', false, Blockly.utils.arrayRemove(arr, 0));
  assertEquals('Remove Not found result', '1,2,3,2', arr.join(','));
  assertEquals('Remove item', true, Blockly.utils.arrayRemove(arr, 2));
  assertEquals('Remove item result', '1,3,2', arr.join(','));
  assertEquals('Remove item again', true, Blockly.utils.arrayRemove(arr, 2));
  assertEquals('Remove item again result', '1,3', arr.join(','));
}

function test_XY_REGEX() {
  var regex = Blockly.utils.getRelativeXY.XY_REGEX_;
  var m;
  m = 'INVALID'.match(regex);
  assertNull(m);

  m = 'translate(10)'.match(regex);
  assertEquals('translate(10), x', '10', m[1]);
  assertUndefined('translate(10), y', m[3]);

  m = 'translate(11, 12)'.match(regex);
  assertEquals('translate(11, 12), x', '11', m[1]);
  assertEquals('translate(11, 12), y', '12', m[3]);

  m = 'translate(13,14)'.match(regex);
  assertEquals('translate(13,14), x', '13', m[1]);
  assertEquals('translate(13,14), y', '14', m[3]);

  m = 'translate(15 16)'.match(regex);
  assertEquals('translate(15 16), x', '15', m[1]);
  assertEquals('translate(15 16), y', '16', m[3]);

  m = 'translate(1.23456e+42 0.123456e-42)'.match(regex);
  assertEquals('translate(1.23456e+42 0.123456e-42), x', '1.23456e+42', m[1]);
  assertEquals('translate(1.23456e+42 0.123456e-42), y', '0.123456e-42', m[3]);
}

function XY_STYLE_REGEX_() {
  var regex = Blockly.utils.getRelativeXY.XY_STYLE_REGEX_;
  var m;
  m = 'INVALID'.match(regex);
  assertNull(m);

  m = 'transform:translate(9px)'.match(regex);
  assertEquals('transform:translate(9px), x', '9', m[1]);
  assertUndefined('transform:translate(9px), y', m[3]);

  m = 'transform:translate3d(10px)'.match(regex);
  assertEquals('transform:translate3d(10px), x', '10', m[1]);
  assertUndefined('transform:translate(10px), y', m[3]);

  m = 'transform: translate(11px, 12px)'.match(regex);
  assertEquals('transform: translate(11px, 12px), x', '11', m[1]);
  assertEquals('transform: translate(11px, 12px), y', '12', m[3]);

  m = 'transform: translate(13px,14px)'.match(regex);
  assertEquals('transform: translate(13px,14px), x', '13', m[1]);
  assertEquals('transform: translate(13px,14px), y', '14', m[3]);

  m = 'transform: translate(15px 16px)'.match(regex);
  assertEquals('transform: translate(15px 16px), x', '15', m[1]);
  assertEquals('transform: translate(15px 16px), y', '16', m[3]);

  m = 'transform: translate(1.23456e+42px 0.123456e-42px)'.match(regex);
  assertEquals('transform: translate(1.23456e+42px 0.123456e-42px), x', '1.23456e+42', m[1]);
  assertEquals('transform: translate(1.23456e+42px 0.123456e-42px), y', '0.123456e-42', m[3]);

  m = 'transform:translate3d(20px, 21px, 22px)'.match(regex);
  assertEquals('transform:translate3d(20px, 21px, 22px), x', '21', m[1]);
  assertEquals('transform:translate3d(20px, 21px, 22px), y', '22', m[3]);

  m = 'transform:translate3d(23px,24px,25px)'.match(regex);
  assertEquals('transform:translate3d(23px,24px,25px), x', '23', m[1]);
  assertEquals('transform:translate3d(23px,24px,25px), y', '24', m[3]);

  m = 'transform:translate3d(26px 27px 28px)'.match(regex);
  assertEquals('transform:translate3d(26px 27px 28px), x', '26', m[1]);
  assertEquals('transform:translate3d(26px 27px 28px), y', '27', m[3]);

  m = 'transform:translate3d(1.23456e+42px 0.123456e-42px 42px)'.match(regex);
  assertEquals('transform:translate3d(1.23456e+42px 0.123456e-42px 42px), x', '1.23456e+42', m[1]);
  assertEquals('transform:translate3d(1.23456e+42px 0.123456e-42px 42px), y', '0.123456e-42', m[3]);
}
