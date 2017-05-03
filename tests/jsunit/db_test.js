/**
 * @license
 * Blockly Tests
 *
 * Copyright 2016 Google Inc.
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
'use strict';

function test_DB_getNeighbours() {
  var db = new Blockly.ConnectionDB();

  // Search an empty list.
  assertEquals(helper_getNeighbours(db, 10 /* x */, 10 /* y */, 100 /* radius */).length, 0);

  // Set up some connections.
  for (var i = 0; i < 10; i++) {
      db.addConnection_(helper_createConnection(0, i, Blockly.PREVIOUS_STATEMENT));
  }

  // Test block belongs at beginning
  var result = helper_getNeighbours(db, 0, 0, 4);
  assertEquals(5, result.length);
  for (i = 0; i < result.length; i++) {
      assertNotEquals(result.indexOf(db[i]), -1); // contains
  }

  // Test block belongs at middle
  result = helper_getNeighbours(db, 0, 4, 2);
  assertEquals(5, result.length);
  for (i = 0; i < result.length; i++) {
      assertNotEquals(result.indexOf(db[i + 2]), -1); // contains
  }

  // Test block belongs at end
  result = helper_getNeighbours(db, 0, 9, 4);
  assertEquals(5, result.length);
  for (i = 0; i < result.length; i++) {
      assertNotEquals(result.indexOf(db[i + 5]), -1); // contains
  }

  // Test block has no neighbours due to being out of range in the x direction
  result = helper_getNeighbours(db, 10, 9, 4);
  assertEquals(result.length, 0);

  // Test block has no neighbours due to being out of range in the y direction
  result = helper_getNeighbours(db, 0, 19, 4);
  assertEquals(result.length, 0);

  // Test block has no neighbours due to being out of range diagonally
  result = helper_getNeighbours(db, -2, -2, 2);
  assertEquals(result.length, 0);
}

function helper_getNeighbours(db, x, y, radius) {
  return db.getNeighbours(helper_createConnection(x, y, Blockly.NEXT_STATEMENT), radius);
}

function helper_createConnection(x, y, type) {
  var conn = new Blockly.Connection({workspace: {}}, type);
  conn.x_ = x;
  conn.y_ = y;
  return conn;
}