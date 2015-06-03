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

function verify_DB_(msg, expected, db) {
   var equal = (expected.length == db.length);
   if (equal) {
     for (var x = 0; x < expected.length; x++) {
       if (expected[x] != db[x]) {
         equal = false;
         break;
       }
     }
   }
   if (equal) {
     assertTrue(msg, true);
   } else {
     assertEquals(msg, expected, db);
   }
}

function test_DB_addConnection() {
  var db = new Blockly.ConnectionDB();
  var o2 = {y_: 2, sourceBlock_: {}};
  db.addConnection_(o2);
  verify_DB_('Adding connection #2', [o2], db);

  var o4 = {y_: 4, sourceBlock_: {}};
  db.addConnection_(o4);
  verify_DB_('Adding connection #4', [o2, o4], db);

  var o1 = {y_: 1, sourceBlock_: {}};
  db.addConnection_(o1);
  verify_DB_('Adding connection #1', [o1, o2, o4], db);

  var o3a = {y_: 3, sourceBlock_: {}};
  db.addConnection_(o3a);
  verify_DB_('Adding connection #3a', [o1, o2, o3a, o4], db);

  var o3b = {y_: 3, sourceBlock_: {}};
  db.addConnection_(o3b);
  verify_DB_('Adding connection #3b', [o1, o2, o3b, o3a, o4], db);
}

function test_DB_removeConnection() {
  var db = new Blockly.ConnectionDB();
  var o1 = {y_: 1, sourceBlock_: {}};
  var o2 = {y_: 2, sourceBlock_: {}};
  var o3a = {y_: 3, sourceBlock_: {}};
  var o3b = {y_: 3, sourceBlock_: {}};
  var o3c = {y_: 3, sourceBlock_: {}};
  var o4 = {y_: 4, sourceBlock_: {}};
  db.addConnection_(o1);
  db.addConnection_(o2);
  db.addConnection_(o3c);
  db.addConnection_(o3b);
  db.addConnection_(o3a);
  db.addConnection_(o4);
  verify_DB_('Adding connections 1-4', [o1, o2, o3a, o3b, o3c, o4], db);

  db.removeConnection_(o2);
  verify_DB_('Removing connection #2', [o1, o3a, o3b, o3c, o4], db);

  db.removeConnection_(o4);
  verify_DB_('Removing connection #4', [o1, o3a, o3b, o3c], db);

  db.removeConnection_(o1);
  verify_DB_('Removing connection #1', [o3a, o3b, o3c], db);

  db.removeConnection_(o3a);
  verify_DB_('Removing connection #3a', [o3b, o3c], db);

  db.removeConnection_(o3c);
  verify_DB_('Removing connection #3c', [o3b], db);

  db.removeConnection_(o3b);
  verify_DB_('Removing connection #3b', [], db);
}

function test_addClass() {
  var p = document.createElement('p');
  Blockly.addClass_(p, 'one');
  assertEquals('Adding "one"', 'one', p.className);
  Blockly.addClass_(p, 'one');
  assertEquals('Adding duplicate "one"', 'one', p.className);
  Blockly.addClass_(p, 'two');
  assertEquals('Adding "two"', 'one two', p.className);
  Blockly.addClass_(p, 'two');
  assertEquals('Adding duplicate "two"', 'one two', p.className);
  Blockly.addClass_(p, 'three');
  assertEquals('Adding "three"', 'one two three', p.className);
}

function test_removeClass() {
  var p = document.createElement('p');
  p.className = ' one three  two three  ';
  Blockly.removeClass_(p, 'two');
  assertEquals('Removing "two"', 'one three three', p.className);
  Blockly.removeClass_(p, 'four');
  assertEquals('Removing "four"', 'one three three', p.className);
  Blockly.removeClass_(p, 'three');
  assertEquals('Removing "three"', 'one', p.className);
  Blockly.removeClass_(p, 'ne');
  assertEquals('Removing "ne"', 'one', p.className);
  Blockly.removeClass_(p, 'one');
  assertEquals('Removing "one"', '', p.className);
  Blockly.removeClass_(p, 'zero');
  assertEquals('Removing "zero"', '', p.className);
}

function test_hasClass() {
  var p = document.createElement('p');
  p.className = ' one three  two three  ';
  assertTrue('Has "one"', Blockly.hasClass_(p, 'one'));
  assertTrue('Has "two"', Blockly.hasClass_(p, 'two'));
  assertTrue('Has "three"', Blockly.hasClass_(p, 'three'));
  assertFalse('Has no "four"', Blockly.hasClass_(p, 'four'));
  assertFalse('Has no "t"', Blockly.hasClass_(p, 't'));
}

function test_shortestStringLength() {
  var len = Blockly.shortestStringLength('one,two,three,four,five'.split(','));
  assertEquals('Length of "one"', 3, len);
  len = Blockly.shortestStringLength('one,two,three,four,five,'.split(','));
  assertEquals('Length of ""', 0, len);
  len = Blockly.shortestStringLength(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.shortestStringLength([]);
  assertEquals('Empty list', 0, len);
}

function test_commonWordPrefix() {
  var len = Blockly.commonWordPrefix('one,two,three,four,five'.split(','));
  assertEquals('No prefix', 0, len);
  len = Blockly.commonWordPrefix('Xone,Xtwo,Xthree,Xfour,Xfive'.split(','));
  assertEquals('No word prefix', 0, len);
  len = Blockly.commonWordPrefix('abc de,abc de,abc de,abc de'.split(','));
  assertEquals('Full equality', 6, len);
  len = Blockly.commonWordPrefix('abc deX,abc deY'.split(','));
  assertEquals('One word prefix', 4, len);
  len = Blockly.commonWordPrefix('abc de,abc deY'.split(','));
  assertEquals('Overflow no', 4, len);
  len = Blockly.commonWordPrefix('abc de,abc de Y'.split(','));
  assertEquals('Overflow yes', 6, len);
  len = Blockly.commonWordPrefix(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.commonWordPrefix([]);
  assertEquals('Empty list', 0, len);
  len = Blockly.commonWordPrefix('turn&nbsp;left,turn&nbsp;right'.split(','));
  assertEquals('No prefix due to &amp;nbsp;', 0, len);
  len = Blockly.commonWordPrefix('turn\u00A0left,turn\u00A0right'.split(','));
  assertEquals('No prefix due to \\u00A0', 0, len);
}

function test_commonWordSuffix() {
  var len = Blockly.commonWordSuffix('one,two,three,four,five'.split(','));
  assertEquals('No prefix', 0, len);
  len = Blockly.commonWordSuffix('oneX,twoX,threeX,fourX,fiveX'.split(','));
  assertEquals('No word prefix', 0, len);
  len = Blockly.commonWordSuffix('abc de,abc de,abc de,abc de'.split(','));
  assertEquals('Full equality', 6, len);
  len = Blockly.commonWordSuffix('Xabc de,Yabc de'.split(','));
  assertEquals('One word prefix', 3, len);
  len = Blockly.commonWordSuffix('abc de,Yabc de'.split(','));
  assertEquals('Overflow no', 3, len);
  len = Blockly.commonWordSuffix('abc de,Y abc de'.split(','));
  assertEquals('Overflow yes', 6, len);
  len = Blockly.commonWordSuffix(['Hello World']);
  assertEquals('List of one', 11, len);
  len = Blockly.commonWordSuffix([]);
  assertEquals('Empty list', 0, len);
}
