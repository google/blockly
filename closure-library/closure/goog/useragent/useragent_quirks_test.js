// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.userAgentQuirksTest');
goog.setTestOnly('goog.userAgentQuirksTest');

goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

function testGetDocumentModeInQuirksMode() {
  // This test file is forcing quirks mode.
  var expected = goog.userAgent.IE ? 5 : undefined;
  assertEquals(expected, goog.userAgent.DOCUMENT_MODE);
}
