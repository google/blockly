/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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

 /**
 * @fileoverview Tests for Blockly.FieldDropdown
 * @author tim.dawborn@gmail.com (Tim Dawborn)
 */
'use strict';

function test_menuGenerator_getter_setter_constructor() {
  var OPTIONS_ARRAY = [
    ['one', '1'],
    ['zwei', '2'],
    ['三', '3'],
  ];
  var OPTIONS_FUNCTION = function() {
    var options = [];
    for (var i = 10, j = 0; i >= 0; i -= 3, ++j) {
      options.push(['Option ' + j, i.toString()]);
    }
    return options;
  };
  var field, menuGenerator;

  // Test array constructor.
  field = new Blockly.FieldDropdown(OPTIONS_ARRAY.slice());
  assertFalse(field.isOptionListDynamic());
  menuGenerator = field.getMenuGenerator();
  assertTrue(Array.isArray(menuGenerator));
  assertEquals('1', field.getValue());

  // Change to use a function instead.
  field.setMenuGenerator(OPTIONS_FUNCTION);
  assertTrue(field.isOptionListDynamic());
  menuGenerator = field.getMenuGenerator();
  assertFalse(Array.isArray(menuGenerator));
  assertEquals('10', field.getValue());

  // Test function constructor.
  field = new Blockly.FieldDropdown(OPTIONS_FUNCTION);
  assertTrue(field.isOptionListDynamic());
  menuGenerator = field.getMenuGenerator();
  assertFalse(Array.isArray(menuGenerator));
  assertEquals('10', field.getValue());

  // Change to use an array instead.
  field.setMenuGenerator(OPTIONS_ARRAY);
  assertFalse(field.isOptionListDynamic());
  menuGenerator = field.getMenuGenerator();
  assertTrue(Array.isArray(menuGenerator));
  assertEquals('1', field.getValue());
};
