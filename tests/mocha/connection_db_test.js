/**
 * @license
 * Copyright 2019 Google LLC
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

suite('Connection Database', function() {
  setup(function() {
    this.database = new Blockly.ConnectionDB();

    this.assertOrder = function() {
      var length = this.database.connections_.length;
      for (var i = 1; i < length; i++) {
        chai.assert.isAtMost(this.database.connections_[i - 1].y_,
            this.database.connections_[i].y_);
      }
    };
    this.createConnection = function(x, y, type, opt_database) {
      var workspace = {
        connectionDBList: []
      };
      workspace.connectionDBList[type] = opt_database || this.database;
      var connection = new Blockly.RenderedConnection(
          {workspace: workspace}, type);
      connection.x_ = x;
      connection.y_ = y;
      return connection;
    };
    this.createSimpleTestConnections = function() {
      for (var i = 0; i < 10; i++) {
        var connection = this.createConnection(0, i, Blockly.PREVIOUS_STATEMENT);
        this.database.addConnection(connection, i);
      }
    };
  });
  // TODO: Re-enable once flyout checking is handled by the connection
  //  (better yet - let it be handled by the flyout, but that's out of the
  //  scope of this).
  test.skip('Add Connection', function() {
    var y2 = {y_: 2};
    var y4 = {y_: 4};
    var y1 = {y_: 1};
    var y3a = {y_: 3};
    var y3b = {y_: 3};

    this.database.addConnection(y2, 2);
    chai.assert.sameOrderedMembers(
        this.database.connections_, [y2]);

    this.database.addConnection(y4, 4);
    chai.assert.sameOrderedMembers(
        this.database.connections_, [y2, y4]);

    this.database.addConnection(y1, 1);
    chai.assert.sameOrderedMembers(
        this.database.connections_, [y1, y2, y4]);

    this.database.addConnection(y3a, 3);
    chai.assert.sameOrderedMembers(
        this.database.connections_, [y1, y2, y3a, y4]);

    this.database.addConnection(y3b, 3);
    chai.assert.sameOrderedMembers(
        this.database.connections_, [y1, y2, y3b, y3a, y4]);

  });
  test.skip('Remove Connection', function() {
    var y2 = {y_: 2};
    var y4 = {y_: 4};
    var y1 = {y_: 1};
    var y3a = {y_: 3};
    var y3b = {y_: 3};
    var y3c = {y_: 3};

    this.database.addConnection(y2, 2);
    this.database.addConnection(y4, 4);
    this.database.addConnection(y1, 1);
    this.database.addConnection(y3c, 3);
    this.database.addConnection(y3b, 3);
    this.database.addConnection(y3a, 3);

    chai.assert.sameOrderedMembers(
        this.database.connections_, [y1, y2, y3a, y3b, y3c, y4]);

    this.database.removeConnection(y2, 2);
    chai.assert.sameOrderedMembers(
        this.database.connections_, [y1, y3a, y3b, y3c, y4]);

    this.database.removeConnection(y4, 4);
    chai.assert.sameOrderedMembers(
        this.database.connections_, [y1, y3a, y3b, y3c]);

    this.database.removeConnection(y1, 1);
    chai.assert.sameOrderedMembers(
        this.database.connections_, [y3a, y3b, y3c]);

    this.database.removeConnection(y3a, 3);
    chai.assert.sameOrderedMembers(
        this.database.connections_, [y3b, y3c]);

    this.database.removeConnection(y3c, 3);
    chai.assert.sameOrderedMembers(
        this.database.connections_, [y3b]);

    this.database.removeConnection(y3b, 3);
    chai.assert.isEmpty(this.database.connections_);
  });
  suite('Get Neighbors', function() {
    test('Empty Database', function() {
      var connection = this.createConnection(0, 0, Blockly.NEXT_STATEMENT,
          new Blockly.ConnectionDB());
      chai.assert.isEmpty(this.database.getNeighbours(connection), 100);
    });
    test('Block At Top', function() {
      this.createSimpleTestConnections();

      var checkConnection = this.createConnection(0, 0, Blockly.NEXT_STATEMENT,
          new Blockly.ConnectionDB());
      var neighbors = this.database.getNeighbours(checkConnection, 4);
      chai.assert.sameMembers(neighbors, this.database.connections_.slice(0, 5));
    });
    test('Block In Middle', function() {
      this.createSimpleTestConnections();

      var checkConnection = this.createConnection(0, 4, Blockly.NEXT_STATEMENT,
          new Blockly.ConnectionDB());
      var neighbors = this.database.getNeighbours(checkConnection, 2);
      chai.assert.sameMembers(neighbors, this.database.connections_.slice(2, 7));
    });
    test('Block At End', function() {
      this.createSimpleTestConnections();

      var checkConnection = this.createConnection(0, 9, Blockly.NEXT_STATEMENT,
          new Blockly.ConnectionDB());
      var neighbors = this.database.getNeighbours(checkConnection, 4);
      chai.assert.sameMembers(neighbors, this.database.connections_.slice(5, 10));
    });
    test('Out of Range X', function() {
      this.createSimpleTestConnections();

      var checkConnection = this.createConnection(10, 9, Blockly.NEXT_STATEMENT,
          new Blockly.ConnectionDB());
      var neighbors = this.database.getNeighbours(checkConnection, 4);
      chai.assert.isEmpty(neighbors);
    });
    test('Out of Range Y', function() {
      this.createSimpleTestConnections();

      var checkConnection = this.createConnection(0, 19, Blockly.NEXT_STATEMENT,
          new Blockly.ConnectionDB());
      var neighbors = this.database.getNeighbours(checkConnection, 4);
      chai.assert.isEmpty(neighbors);
    });
    test('Out of Range Diagonal', function() {
      this.createSimpleTestConnections();

      var checkConnection = this.createConnection(-2, -2, Blockly.NEXT_STATEMENT,
          new Blockly.ConnectionDB());
      var neighbors = this.database.getNeighbours(checkConnection, 2);
      chai.assert.isEmpty(neighbors);
    });
  });
  suite('Ordering', function() {
    test('Simple', function() {
      for (var i = 0; i < 10; i++) {
        var connection = this.createConnection(0, i, Blockly.NEXT_STATEMENT);
        this.database.addConnection(connection, i);
      }
      this.assertOrder();
    });
    test('Quasi-Random', function() {
      var xCoords = [-29, -47, -77, 2, 43, 34, -59, -52, -90, -36, -91, 38,
        87, -20, 60, 4, -57, 65, -37, -81, 57, 58, -96, 1, 67, -79, 34, 93,
        -90, -99, -62, 4, 11, -36, -51, -72, 3, -50, -24, -45, -92, -38, 37,
        24, -47, -73, 79, -20, 99, 43, -10, -87, 19, 35, -62, -36, 49, 86,
        -24, -47, -89, 33, -44, 25, -73, -91, 85, 6, 0, 89, -94, 36, -35, 84,
        -9, 96, -21, 52, 10, -95, 7, -67, -70, 62, 9, -40, -95, -9, -94, 55,
        57, -96, 55, 8, -48, -57, -87, 81, 23, 65];
      var yCoords = [-81, 82, 5, 47, 30, 57, -12, 28, 38, 92, -25, -20, 23,
        -51, 73, -90, 8, 28, -51, -15, 81, -60, -6, -16, 77, -62, -42, -24,
        35, 95, -46, -7, 61, -16, 14, 91, 57, -38, 27, -39, 92, 47, -98, 11,
        -33, -72, 64, 38, -64, -88, -35, -59, -76, -94, 45, -25, -100, -95,
        63, -97, 45, 98, 99, 34, 27, 52, -18, -45, 66, -32, -38, 70, -73,
        -23, 5, -2, -13, -9, 48, 74, -97, -11, 35, -79, -16, -77, 83, -57,
        -53, 35, -44, 100, -27, -15, 5, 39, 33, -19, -20, -95];

      var length = xCoords.length;
      for (var i = 0; i < length; i++) {
        var connection = this.createConnection(xCoords[i], yCoords[i],
            Blockly.NEXT_STATEMENT);
        this.database.addConnection(connection, yCoords[i]);
      }
      this.assertOrder();
    });
  });
  // Does not cover logic for isConnectionAllowed
  suite('Search For Closest', function() {
    setup(function() {
      this.allowedStub = null;

      this.createCheckConnection = function(x, y) {
        var checkConnection = this.createConnection(x, y, Blockly.NEXT_STATEMENT,
            new Blockly.ConnectionDB());
        this.allowedStub = sinon.stub(checkConnection, 'isConnectionAllowed')
            .callsFake(function(candidate, maxRadius) {
              if (this.distanceFrom(candidate) > maxRadius) {
                return false;
              }
              // Ignore non-distance parameters.
              return true;
            });
        return checkConnection;
      };
    });
    teardown(function() {
      if (this.allowedStub) {
        this.allowedStub.restore();
      }
    });
    test('Empty Database', function() {
      var checkConnection = this.createConnection(0, 0, Blockly.NEXT_STATEMENT,
          new Blockly.ConnectionDB());
      chai.assert.isNull(this.database.searchForClosest(
          checkConnection, 100, {x: 0, y: 0}).connection);
    });
    test('Too Far', function() {
      var connection = this.createConnection(0, 100, Blockly.PREVIOUS_STATEMENT);
      this.database.addConnection(connection, 100);

      var checkConnection = this.createConnection(0, 0, Blockly.NEXT_STATEMENT,
          new Blockly.ConnectionDB());
      chai.assert.isNull(this.database.searchForClosest(
          checkConnection, 50, {x: 0, y: 0}).connection);
    });
    test('Single in Range', function() {
      this.createSimpleTestConnections();

      var checkConnection = this.createCheckConnection(0, 14);

      var last = this.database.connections_[9];
      var closest = this.database.searchForClosest(
          checkConnection, 5, {x: 0, y: 0}).connection;
      chai.assert.equal(last, closest);
    });
    test('Many in Range', function() {
      this.createSimpleTestConnections();

      var checkConnection = this.createCheckConnection(0, 10);

      var last = this.database.connections_[9];
      var closest = this.database.searchForClosest(
          checkConnection, 5, {x: 0, y: 0}).connection;
      chai.assert.equal(last, closest);
    });
    test('No Y-Coord Priority', function() {
      var connection1 = this.createConnection(6, 6, Blockly.PREVIOUS_STATEMENT);
      this.database.addConnection(connection1, 6);
      var connection2 = this.createConnection(5, 5, Blockly.PREVIOUS_STATEMENT);
      this.database.addConnection(connection2, 5);

      var checkConnection = this.createCheckConnection(4, 6);

      var closest = this.database.searchForClosest(
          checkConnection, 3, {x: 0, y: 0}).connection;
      chai.assert.equal(connection2, closest);
    });
  });
});
