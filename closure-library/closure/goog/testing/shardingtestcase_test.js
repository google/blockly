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

goog.provide('goog.testing.ShardingTestCaseTest');
goog.setTestOnly('goog.testing.ShardingTestCaseTest');

goog.require('goog.testing.ShardingTestCase');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');

goog.testing.TestCase.initializeTestRunner(
    new goog.testing.ShardingTestCase(1, 2));

function testA() {
}

function testB() {
  fail('testB should not be in this shard');
}
