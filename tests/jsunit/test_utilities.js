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
 * @fileoverview Test utilities.
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

goog.require('goog.testing');


/**
 * Check that two arrays have the same content.
 * @param {!Array.<string>} array1 The first array.
 * @param {!Array.<string>} array2 The second array.
 */
function isEqualArrays(array1, array2) {
  assertEquals(array1.length, array2.length);
  for (var i = 0; i < array1.length; i++) {
    assertEquals(array1[i], array2[i]);
  }
}

/**
 * Creates a controlled MethodMock. Sets the expected return values and
 *     the parameters if any exist. Sets the method to replay.
 * @param {!goog.testing.MockControl} mockControl Object that holds a set
 *    of mocks for this test.
 * @param {!Object} scope The scope of the method to be mocked out.
 * @param {!string} funcName The name of the function we're going to mock.
 * @param {Array<Object>} parameters The parameters to call the mock with.
 * @param {Array<!Object>} return_values The values to return when called.
 * @return {!goog.testing.MockInterface} The mocked method.
 */
function setUpMockMethod(mockControl, scope, funcName, parameters,
	return_values) {
  var mockMethod = mockControl.createMethodMock(scope, funcName);
  if (return_values) {
    for (var i = 0, return_value; return_value = return_values[i]; i++) {
      if (parameters && i < parameters.length) {
        mockMethod(parameters[i]).$returns(return_value);
      }
      else {
        mockMethod().$returns(return_value);
      }
    }
  }
  // If there are no return values but there are parameters, we are only
  // recording specific method calls.
  else if (parameters) {
    for (var i = 0; i < parameters.length; i++) {
      mockMethod(parameters[i]);
    }
  }
  mockMethod.$replay();
  return mockMethod;
}

/**
 * Check if a variable with the given values exists.
 * @param {Blockly.Workspace|Blockly.VariableMap} container The workspace  or
 *     variableMap the checked variable belongs to.
 * @param {!string} name The expected name of the variable.
 * @param {!string} type The expected type of the variable.
 * @param {!string} id The expected id of the variable.
 */
function checkVariableValues(container, name, type, id) {
  var variable = container.getVariableById(id);
  assertNotUndefined(variable);
  assertEquals(name, variable.name);
  assertEquals(type, variable.type);
  assertEquals(id, variable.getId());
}
