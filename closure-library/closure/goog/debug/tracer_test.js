// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.debug.TraceTest');
goog.setTestOnly('goog.debug.TraceTest');

goog.require('goog.debug.Trace');
goog.require('goog.testing.jsunit');

function testTracer() {
  goog.debug.Trace.initCurrentTrace();
  var t = goog.debug.Trace.startTracer('foo');
  var sum = 0;
  for (var i = 0; i < 100000; i++) {
    sum += i;
  }
  goog.debug.Trace.stopTracer(t);
  var trace = goog.debug.Trace.getFormattedTrace();
  var lines = trace.split('\n');
  assertEquals(8, lines.length);
  assertNotNull(lines[0].match(/^\s*\d+\.\d+\s+Start\s+foo$/));
  assertNotNull(lines[1].match(/^\s*\d+\s+\d+\.\d+\s+Done\s+\d+ ms\s+foo$/));
}

function testPerf() {
  goog.debug.Trace.initCurrentTrace();
  var count = 1000;
  var start = goog.now();
  for (var i = 0; i < count; i++) {
    var t = goog.debug.Trace.startTracer('foo');
    var t2 = goog.debug.Trace.startTracer('foo.bar');
    var t3 = goog.debug.Trace.startTracer('foo.bar.baz');
    goog.debug.Trace.stopTracer(t3);
    var t4 = goog.debug.Trace.startTracer('foo.bar.bim');
    goog.debug.Trace.stopTracer(t4);
    goog.debug.Trace.stopTracer(t2);
    goog.debug.Trace.stopTracer(t);
  }
  count *= 4;
  var end = goog.now();
}
