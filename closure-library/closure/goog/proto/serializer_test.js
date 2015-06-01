// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.protoTest');
goog.setTestOnly('goog.protoTest');

goog.require('goog.proto');
goog.require('goog.testing.jsunit');

var serialize = goog.proto.serialize;

function testArraySerialize() {

  assertEquals('Empty array', serialize([]), '[]');

  assertEquals('Normal array', serialize([0, 1, 2]), '[0,1,2]');
  assertEquals('Empty start', serialize([, 1, 2]), '[,1,2]');
  assertEquals('Empty start', serialize([,,, 3, 4]), '[,,,3,4]');
  assertEquals('Empty middle', serialize([0,, 2]), '[0,,2]');
  assertEquals('Empty middle', serialize([0,,, 3]), '[0,,,3]');
  assertEquals('Empty end', serialize([0, 1, 2]), '[0,1,2]');
  assertEquals('Empty end', serialize([0, 1, 2,,]), '[0,1,2]');
  assertEquals('Empty start and end', serialize([,, 2,, 4]), '[,,2,,4]');
  assertEquals('All elements empty', serialize([,,,]), '[]');

  assertEquals('Nested', serialize([, 1, [, 1, [, 1]]]), '[,1,[,1,[,1]]]');
}
