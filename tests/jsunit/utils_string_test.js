/**
 * @license
 * Copyright 2019 Google LLC
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

function test_startsWith() {
  assertEquals('Does not start with', false, Blockly.utils.string.startsWith('123', '2'));
  assertEquals('Start with', true, Blockly.utils.string.startsWith('123', '12'));
  assertEquals('Start with empty string 1', true, Blockly.utils.string.startsWith('123', ''));
  assertEquals('Start with empty string 2', true, Blockly.utils.string.startsWith('', ''));
}

function test_commonWordPrefix() {
  var len = Blockly.utils.string.commonWordPrefix('one,two,three,four,five'.split(','));
  assertEquals('No prefix', 0, len);
  len = Blockly.utils.string.commonWordPrefix('Xone,Xtwo,Xthree,Xfour,Xfive'.split(','));
  assertEquals('No word prefix', 0, len);
  len = Blockly.utils.string.commonWordPrefix('abc de,abc de,abc de,abc de'.split(','));
  assertEquals('Full equality', 6, len);
  len = Blockly.utils.string.commonWordPrefix('abc deX,abc deY'.split(','));
  assertEquals('One word prefix', 4, len);
  len = Blockly.utils.string.commonWordPrefix('abc de,abc deY'.split(','));
  assertEquals('Overflow no', 4, len);
  len = Blockly.utils.string.commonWordPrefix('abc de,abc de Y'.split(','));
  assertEquals('Overflow yes', 6, len);
  len = Blockly.utils.string.commonWordPrefix(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.utils.string.commonWordPrefix([]);
  assertEquals('Empty list', 0, len);
  len = Blockly.utils.string.commonWordPrefix('turn&nbsp;left,turn&nbsp;right'.split(','));
  assertEquals('No prefix due to &amp;nbsp;', 0, len);
  len = Blockly.utils.string.commonWordPrefix('turn\u00A0left,turn\u00A0right'.split(','));
  assertEquals('No prefix due to \\u00A0', 0, len);
}

function test_commonWordSuffix() {
  var len = Blockly.utils.string.commonWordSuffix('one,two,three,four,five'.split(','));
  assertEquals('No prefix', 0, len);
  len = Blockly.utils.string.commonWordSuffix('oneX,twoX,threeX,fourX,fiveX'.split(','));
  assertEquals('No word prefix', 0, len);
  len = Blockly.utils.string.commonWordSuffix('abc de,abc de,abc de,abc de'.split(','));
  assertEquals('Full equality', 6, len);
  len = Blockly.utils.string.commonWordSuffix('Xabc de,Yabc de'.split(','));
  assertEquals('One word prefix', 3, len);
  len = Blockly.utils.string.commonWordSuffix('abc de,Yabc de'.split(','));
  assertEquals('Overflow no', 3, len);
  len = Blockly.utils.string.commonWordSuffix('abc de,Y abc de'.split(','));
  assertEquals('Overflow yes', 6, len);
  len = Blockly.utils.string.commonWordSuffix(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.utils.string.commonWordSuffix([]);
  assertEquals('Empty list', 0, len);
}

function test_shortestStringLength() {
  var len = Blockly.utils.string.shortestStringLength('one,two,three,four,five'.split(','));
  assertEquals('Length of "one"', 3, len);
  len = Blockly.utils.string.shortestStringLength('one,two,three,four,five,'.split(','));
  assertEquals('Length of ""', 0, len);
  len = Blockly.utils.string.shortestStringLength(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.utils.string.shortestStringLength([]);
  assertEquals('Empty list', 0, len);
}

