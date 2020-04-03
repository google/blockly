/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
