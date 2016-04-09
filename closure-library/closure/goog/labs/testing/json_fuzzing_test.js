// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.labs.testing.JsonFuzzingTest');
goog.setTestOnly('goog.labs.testing.JsonFuzzingTest');

goog.require('goog.json');
goog.require('goog.labs.testing.JsonFuzzing');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');


function testValidJson() {
  var fuzzing = new goog.labs.testing.JsonFuzzing();  // seeded with now()

  for (var i = 0; i < 10; i++) {
    var data = fuzzing.newArray();
    assertTrue(goog.isArray(data));
    // JSON compatible
    assertNotThrows(function() { goog.json.serialize(data); });
  }
}
