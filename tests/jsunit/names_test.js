/**
 * @license
 * Copyright 2012 Google LLC
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

function test_safeName() {
  var varDB = new Blockly.Names('window,door');
  assertEquals('SafeName empty.', 'unnamed', varDB.safeName_(''));
  assertEquals('SafeName ok.', 'foobar', varDB.safeName_('foobar'));
  assertEquals('SafeName number start.', 'my_9lives',
               varDB.safeName_('9lives'));
  assertEquals('SafeName number end.', 'lives9', varDB.safeName_('lives9'));
  assertEquals('SafeName special chars.', '____', varDB.safeName_('!@#$'));
  assertEquals('SafeName reserved.', 'door', varDB.safeName_('door'));
}

function test_getName() {
  var varDB = new Blockly.Names('window,door');
  assertEquals('Name add #1.', 'Foo_bar', varDB.getName('Foo.bar', 'var'));
  assertEquals('Name get #1.', 'Foo_bar', varDB.getName('Foo.bar', 'var'));
  assertEquals('Name add #2.', 'Foo_bar2', varDB.getName('Foo bar', 'var'));
  assertEquals('Name get #2.', 'Foo_bar2', varDB.getName('foo BAR', 'var'));
  assertEquals('Name add #3.', 'door2', varDB.getName('door', 'var'));
  assertEquals('Name add #4.', 'Foo_bar3', varDB.getName('Foo.bar', 'proc'));
  assertEquals('Name get #1b.', 'Foo_bar', varDB.getName('Foo.bar', 'var'));
  assertEquals('Name get #4.', 'Foo_bar3', varDB.getName('Foo.bar', 'proc'));
}

function test_getDistinctName() {
  var varDB = new Blockly.Names('window,door');
  assertEquals('Name distinct #1.', 'Foo_bar',
               varDB.getDistinctName('Foo.bar', 'var'));
  assertEquals('Name distinct #2.', 'Foo_bar2',
               varDB.getDistinctName('Foo.bar', 'var'));
  assertEquals('Name distinct #3.', 'Foo_bar3',
               varDB.getDistinctName('Foo.bar', 'proc'));
  varDB.reset();
  assertEquals('Name distinct #4.', 'Foo_bar',
               varDB.getDistinctName('Foo.bar', 'var'));
}

function test_nameEquals() {
  assertTrue('Name equals #1.', Blockly.Names.equals('Foo.bar', 'Foo.bar'));
  assertFalse('Name equals #2.', Blockly.Names.equals('Foo.bar', 'Foo_bar'));
  assertTrue('Name equals #3.', Blockly.Names.equals('Foo.bar', 'FOO.BAR'));
}
