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

function test_addClass() {
  var p = document.createElement('p');
  Blockly.utils.dom.addClass(p, 'one');
  assertEquals('Adding "one"', 'one', p.className);
  Blockly.utils.dom.addClass(p, 'one');
  assertEquals('Adding duplicate "one"', 'one', p.className);
  Blockly.utils.dom.addClass(p, 'two');
  assertEquals('Adding "two"', 'one two', p.className);
  Blockly.utils.dom.addClass(p, 'two');
  assertEquals('Adding duplicate "two"', 'one two', p.className);
  Blockly.utils.dom.addClass(p, 'three');
  assertEquals('Adding "three"', 'one two three', p.className);
}

function test_hasClass() {
   var p = document.createElement('p');
   p.className = ' one three  two three  ';
   assertTrue('Has "one"', Blockly.utils.dom.hasClass(p, 'one'));
   assertTrue('Has "two"', Blockly.utils.dom.hasClass(p, 'two'));
   assertTrue('Has "three"', Blockly.utils.dom.hasClass(p, 'three'));
   assertFalse('Has no "four"', Blockly.utils.dom.hasClass(p, 'four'));
   assertFalse('Has no "t"', Blockly.utils.dom.hasClass(p, 't'));
 }

function test_removeClass() {
  var p = document.createElement('p');
  p.className = ' one three  two three  ';
  Blockly.utils.dom.removeClass(p, 'two');
  assertEquals('Removing "two"', 'one three three', p.className);
  Blockly.utils.dom.removeClass(p, 'four');
  assertEquals('Removing "four"', 'one three three', p.className);
  Blockly.utils.dom.removeClass(p, 'three');
  assertEquals('Removing "three"', 'one', p.className);
  Blockly.utils.dom.removeClass(p, 'ne');
  assertEquals('Removing "ne"', 'one', p.className);
  Blockly.utils.dom.removeClass(p, 'one');
  assertEquals('Removing "one"', '', p.className);
  Blockly.utils.dom.removeClass(p, 'zero');
  assertEquals('Removing "zero"', '', p.className);
}
