// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.editor.plugins.UndoRedoStateTest');
goog.setTestOnly('goog.editor.plugins.UndoRedoStateTest');

goog.require('goog.editor.plugins.UndoRedoState');
goog.require('goog.testing.jsunit');

var asyncState;
var syncState;

function setUp() {
  asyncState = new goog.editor.plugins.UndoRedoState(true);
  syncState = new goog.editor.plugins.UndoRedoState(false);
}

function testIsAsynchronous() {
  assertTrue(
      'Must return true for asynchronous state', asyncState.isAsynchronous());
  assertFalse(
      'Must return false for synchronous state', syncState.isAsynchronous());
}
