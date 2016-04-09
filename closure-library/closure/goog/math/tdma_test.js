// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.math.tdmaTest');
goog.setTestOnly('goog.math.tdmaTest');

goog.require('goog.math.tdma');
goog.require('goog.testing.jsunit');

function testTdmaSolver() {
  var supDiag = [1, 1, 1, 1, 1];
  var mainDiag = [-1, -2, -2, -2, -2, -2];
  var subDiag = [1, 1, 1, 1, 1];
  var vecRight = [1, 2, 3, 4, 5, 6];
  var expected = [-56, -55, -52, -46, -36, -21];
  var result = [];
  goog.math.tdma.solve(subDiag, mainDiag, supDiag, vecRight, result);
  assertElementsEquals(expected, result);
}
