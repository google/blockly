/**
 * @license
 * Blockly Tests
 *
 * Copyright 2015 Google Inc.
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

function verify_DB_(msg, expected, db) {
   var equal = (expected.length == db.length);
   if (equal) {
     for (var x = 0; x < expected.length; x++) {
       if (expected[x] != db[x]) {
         equal = false;
         break;
       }
     }
   }
   if (equal) {
     assertTrue(msg, true);
   } else {
     assertEquals(msg, expected, db);
   }
}

function test_DB_addConnection() {
  var db = new Blockly.ConnectionDB();
  var o2 = {y_: 2, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock};
  db.addConnection(o2);
  verify_DB_('Adding connection #2', [o2], db);

  var o4 = {y_: 4, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock};
  db.addConnection(o4);
  verify_DB_('Adding connection #4', [o2, o4], db);

  var o1 = {y_: 1, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock};
  db.addConnection(o1);
  verify_DB_('Adding connection #1', [o1, o2, o4], db);

  var o3a = {y_: 3, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock};
  db.addConnection(o3a);
  verify_DB_('Adding connection #3a', [o1, o2, o3a, o4], db);

  var o3b = {y_: 3, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock};
  db.addConnection(o3b);
  verify_DB_('Adding connection #3b', [o1, o2, o3b, o3a, o4], db);
}

function test_DB_removeConnection() {
  var db = new Blockly.ConnectionDB();
  var o1 = {y_: 1, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock};
  var o2 = {y_: 2, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock};
  var o3a = {y_: 3, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock};
  var o3b = {y_: 3, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock};
  var o3c = {y_: 3, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock};
  var o4 = {y_: 4, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock};
  db.addConnection(o1);
  db.addConnection(o2);
  db.addConnection(o3c);
  db.addConnection(o3b);
  db.addConnection(o3a);
  db.addConnection(o4);
  verify_DB_('Adding connections 1-4', [o1, o2, o3a, o3b, o3c, o4], db);

  db.removeConnection_(o2);
  verify_DB_('Removing connection #2', [o1, o3a, o3b, o3c, o4], db);

  db.removeConnection_(o4);
  verify_DB_('Removing connection #4', [o1, o3a, o3b, o3c], db);

  db.removeConnection_(o1);
  verify_DB_('Removing connection #1', [o3a, o3b, o3c], db);

  db.removeConnection_(o3a);
  verify_DB_('Removing connection #3a', [o3b, o3c], db);

  db.removeConnection_(o3c);
  verify_DB_('Removing connection #3c', [o3b], db);

  db.removeConnection_(o3b);
  verify_DB_('Removing connection #3b', [], db);
}

function test_DB_getNeighbours() {
  var db = new Blockly.ConnectionDB();

  // Search an empty list.
  assertEquals(helper_getNeighbours(db,
      10 /* x */, 10 /* y */, 100 /* radius */).length, 0);

  // Set up some connections.
  for (var i = 0; i < 10; i++) {
    db.addConnection(helper_createConnection(0, i,
        Blockly.PREVIOUS_STATEMENT));
  }

  // Test block belongs at beginning.
  var result = helper_getNeighbours(db, 0, 0, 4);
  assertEquals(5, result.length);
  for (i = 0; i < result.length; i++) {
    assertNotEquals(result.indexOf(db[i]), -1); // contains
  }

  // Test block belongs at middle.
  result = helper_getNeighbours(db, 0, 4, 2);
  assertEquals(5, result.length);
  for (i = 0; i < result.length; i++) {
    assertNotEquals(result.indexOf(db[i + 2]), -1); // contains
  }

  // Test block belongs at end.
  result = helper_getNeighbours(db, 0, 9, 4);
  assertEquals(5, result.length);
  for (i = 0; i < result.length; i++) {
    assertNotEquals(result.indexOf(db[i + 5]), -1); // contains
  }

  // Test block has no neighbours due to being out of range in the x direction.
  result = helper_getNeighbours(db, 10, 9, 4);
  assertEquals(result.length, 0);

  // Test block has no neighbours due to being out of range in the y direction.
  result = helper_getNeighbours(db, 0, 19, 4);
  assertEquals(result.length, 0);

  // Test block has no neighbours due to being out of range diagonally.
  result = helper_getNeighbours(db, -2, -2, 2);
  assertEquals(result.length, 0);
}

function test_DB_findPositionForConnection() {
  var db = new Blockly.ConnectionDB();
  db.addConnection(helper_createConnection(0, 0, Blockly.PREVIOUS_STATEMENT));
  db.addConnection(helper_createConnection(0, 1, Blockly.PREVIOUS_STATEMENT));
  db.addConnection(helper_createConnection(0, 2, Blockly.PREVIOUS_STATEMENT));
  db.addConnection(helper_createConnection(0, 4, Blockly.PREVIOUS_STATEMENT));
  db.addConnection(helper_createConnection(0, 5, Blockly.PREVIOUS_STATEMENT));

  assertEquals(5, db.length);
  var conn = helper_createConnection(0, 3, Blockly.PREVIOUS_STATEMENT);
  assertEquals(3, db.findPositionForConnection_(conn));
}

function test_DB_findConnection() {
  var db = new Blockly.ConnectionDB();
  for (var i = 0; i < 10; i++) {
    db.addConnection(helper_createConnection(i, 0,
        Blockly.PREVIOUS_STATEMENT));
    db.addConnection(helper_createConnection(0, i,
        Blockly.PREVIOUS_STATEMENT));
  }

  var conn = helper_createConnection(3, 3, Blockly.PREVIOUS_STATEMENT);
  db.addConnection(conn);
  assertEquals(conn, db[db.findConnection(conn)]);

  conn = helper_createConnection(3, 3, Blockly.PREVIOUS_STATEMENT);
  assertEquals(-1, db.findConnection(conn));
}

function test_DB_ordering() {
  var db = new Blockly.ConnectionDB();
  for (var i = 0; i < 10; i++) {
    db.addConnection(helper_createConnection(0, 9 - i,
        Blockly.PREVIOUS_STATEMENT));
  }

  for (i = 0; i < 10; i++) {
      assertEquals(i, db[i].y_);
  }

  // quasi-random
  var xCoords = [-29, -47, -77, 2, 43, 34, -59, -52, -90, -36, -91, 38, 87, -20,
      60, 4, -57, 65, -37, -81, 57, 58, -96, 1, 67, -79, 34, 93, -90, -99, -62,
      4, 11, -36, -51, -72, 3, -50, -24, -45, -92, -38, 37, 24, -47, -73, 79,
      -20, 99, 43, -10, -87, 19, 35, -62, -36, 49, 86, -24, -47, -89, 33, -44,
      25, -73, -91, 85, 6, 0, 89, -94, 36, -35, 84, -9, 96, -21, 52, 10, -95, 7,
      -67, -70, 62, 9, -40, -95, -9, -94, 55, 57, -96, 55, 8, -48, -57, -87, 81,
      23, 65];
  var yCoords = [-81, 82, 5, 47, 30, 57, -12, 28, 38, 92, -25, -20, 23, -51, 73,
      -90, 8, 28, -51, -15, 81, -60, -6, -16, 77, -62, -42, -24, 35, 95, -46,
      -7, 61, -16, 14, 91, 57, -38, 27, -39, 92, 47, -98, 11, -33, -72, 64, 38,
      -64, -88, -35, -59, -76, -94, 45, -25, -100, -95, 63, -97, 45, 98, 99, 34,
      27, 52, -18, -45, 66, -32, -38, 70, -73, -23, 5, -2, -13, -9, 48, 74, -97,
      -11, 35, -79, -16, -77, 83, -57, -53, 35, -44, 100, -27, -15, 5, 39, 33,
      -19, -20, -95];
  for (i = 0; i < xCoords.length; i++) {
    db.addConnection(helper_createConnection(xCoords[i], yCoords[i],
        Blockly.PREVIOUS_STATEMENT));
  }

  for (i = 1; i < xCoords.length; i++) {
    assertTrue(db[i].y_ >= db[i - 1].y_);
  }
}

function test_SearchForClosest() {
  var db = new Blockly.ConnectionDB();
  var sharedWorkspace = {id: "Shared workspace"};

  // Search an empty list.
  assertEquals(null, helper_searchDB(db, 10 /* x */, 10 /* y */,
      100 /* radius */));

  db.addConnection(helper_createConnection(100, 0, Blockly.PREVIOUS_STATEMENT,
      sharedWorkspace));
  assertEquals(null, helper_searchDB(db, 0, 0, 5, sharedWorkspace));

  db = new Blockly.ConnectionDB();
  for (var i = 0; i < 10; i++) {
    var tempConn = helper_createConnection(0, i, Blockly.PREVIOUS_STATEMENT,
        sharedWorkspace);
    tempConn.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
    db.addConnection(tempConn);
  }

  // Should be at 0, 9.
  var last = db[db.length - 1];
  // Correct connection is last in db; many connections in radius.
  assertEquals(last, helper_searchDB(db, 0, 10, 15, sharedWorkspace));
  // Nothing nearby.
  assertEquals(null, helper_searchDB(db, 100, 100, 3, sharedWorkspace));
  // First in db, exact match.
  assertEquals(db[0], helper_searchDB(db, 0, 0, 0, sharedWorkspace));

  tempConn = helper_createConnection(6, 6, Blockly.PREVIOUS_STATEMENT,
      sharedWorkspace);
  tempConn.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
  db.addConnection(tempConn);
  tempConn = helper_createConnection(5, 5, Blockly.PREVIOUS_STATEMENT,
      sharedWorkspace);
  tempConn.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
  db.addConnection(tempConn);

  var result = helper_searchDB(db, 4, 6, 3, sharedWorkspace);
  assertEquals(5, result.x_);
  assertEquals(5, result.y_);
}


function helper_getNeighbours(db, x, y, radius) {
  return db.getNeighbours(helper_createConnection(x, y, Blockly.NEXT_STATEMENT),
      radius);
}

function helper_searchDB(db, x, y, radius, shared_workspace) {
  var tempConn = helper_createConnection(x, y,
      Blockly.NEXT_STATEMENT, shared_workspace);
  tempConn.sourceBlock_ = helper_makeSourceBlock(shared_workspace);
  var closest = db.searchForClosest(tempConn, radius, {x: 0, y: 0});
  return closest.connection;
}

function helper_makeSourceBlock(sharedWorkspace) {
  return {workspace: sharedWorkspace,
    parentBlock_: null,
    getParent: function() { return null; },
    movable_: true,
    isMovable: function() { return true; },
    isShadow: function() { return false; }
  };
}

function helper_createConnection(x, y, type, opt_shared_workspace) {
  var workspace = opt_shared_workspace ? opt_shared_workspace : {};
  var conn = new Blockly.Connection({workspace: workspace}, type);
  conn.x_ = x;
  conn.y_ = y;
  return conn;
}