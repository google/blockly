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

goog.provide('goog.dbTest');
goog.setTestOnly('goog.dbTest');

goog.require('goog.Disposable');
goog.require('goog.Promise');
goog.require('goog.array');
goog.require('goog.db');
goog.require('goog.db.Cursor');
goog.require('goog.db.Error');
goog.require('goog.db.IndexedDb');
goog.require('goog.db.KeyRange');
goog.require('goog.db.Transaction');
goog.require('goog.events');
goog.require('goog.object');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent.product');

var idbSupported = goog.userAgent.product.CHROME;
var dbName;
var dbBaseName = 'testDb';
var globalDb = null;
var dbsToClose = [];
var propertyReplacer;

var baseVersion = 1;

var dbVersion = 1;

var TransactionMode = goog.db.Transaction.TransactionMode;
var EventTypes = goog.db.Transaction.EventTypes;

function openDatabase() {
  return goog.db.openDatabase(dbName)
      .addCallback(function(db) { dbsToClose.push(db); });
}

function incrementVersion(db, onUpgradeNeeded) {
  db.close();

  var onBlocked = function(ev) {
    fail('Upgrade to version ' + dbVersion + ' is blocked.');
  };

  return goog.db.openDatabase(dbName, ++dbVersion, onUpgradeNeeded, onBlocked)
      .addCallback(function(db) {
        dbsToClose.push(db);
        assertEquals(dbVersion, db.getVersion());
      });
}

function addStore(db) {
  return incrementVersion(db, function(ev, db, tx) {
    db.createObjectStore('store');
  });
}

function addStoreWithIndex(db) {
  return incrementVersion(db, function(ev, db, tx) {
    var store = db.createObjectStore('store', {keyPath: 'key'});
    store.createIndex('index', 'value');
  });
}

function populateStore(values, keys, db) {
  var putTx = db.createTransaction(['store'], TransactionMode.READ_WRITE);
  var store = putTx.objectStore('store');
  for (var i = 0; i < values.length; ++i) {
    store.put(values[i], keys[i]);
  }
  return putTx.wait();
}

function populateStoreWithObjects(values, keys, db) {
  var putTx = db.createTransaction(['store'], TransactionMode.READ_WRITE);
  var store = putTx.objectStore('store');
  goog.array.forEach(values, function(value, index) {
    store.put({'key': keys[index], 'value': value});
  });
  return putTx.wait();
}

function assertStoreValues(values, db) {
  var assertStoreTx = db.createTransaction(['store']);
  assertStoreTx.objectStore('store').getAll().addCallback(function(results) {
    assertSameElements(values, results);
  });
}

function assertStoreObjectValues(values, db) {
  var assertStoreTx = db.createTransaction(['store']);
  assertStoreTx.objectStore('store').getAll().addCallback(function(results) {
    var retrievedValues =
        goog.array.map(results, function(result) { return result['value']; });
    assertSameElements(values, retrievedValues);
  });
}

function assertStoreValuesAndCursorsDisposed(values, cursors, db) {
  var assertStoreTx = db.createTransaction(['store']);
  assertStoreTx.objectStore('store').getAll().addCallback(function(results) {
    assertSameElements(values, results);
    assertTrue(cursors.length > 0);
    goog.array.forEach(cursors, function(elem, index, array) {
      console.log(elem);
      assertTrue('array[' + index + '] (' + elem + ') is not disposed',
                 goog.Disposable.isDisposed(elem));
    });
  });
}

function assertStoreDoesntExist(db) {
  try {
    db.createTransaction(['store']);
    fail('Create transaction with a non-existent store should have failed.');
  } catch (e) {
    // expected
    assertEquals(e.getName(), goog.db.Error.ErrorName.NOT_FOUND_ERR);
  }
}

function transactionToPromise(db, trx) {
  return new goog.Promise(function(resolve, reject) {
    goog.events.listen(trx, EventTypes.ERROR, reject);
    goog.events.listen(trx, EventTypes.COMPLETE, function() { resolve(db); });
  });
}

// Calls onRecordReady each time that a new record can be read by the
// cursor with cursor.next(). Returns a promise that resolves or rejects
// based on when the cursor is complete or errors out. If onRecordReady
// returns a promise that promises is also waited on before the returned
// promise resolves.
function forEachRecord(cursor, onRecordReady) {
  var promises = [];
  return new goog.Promise(function(resolve, reject) {
    var key = goog.events.listen(cursor,
                                 goog.db.Cursor.EventType.NEW_DATA, function() {
                                   var result = onRecordReady();
                                   if (result && ('then' in result)) {
                                     promises.push(result);
                                   }
                                 });

    goog.events.listenOnce(
        cursor,
        [goog.db.Cursor.EventType.COMPLETE, goog.db.Cursor.EventType.ERROR],
        function(evt) {
          goog.events.unlistenByKey(key);
          if (evt.type == goog.db.Cursor.EventType.COMPLETE) {
            resolve();
          } else {
            reject(evt);
          }
        });
  }).then(function() { return goog.Promise.all(promises); });
}

function failOnErrorEvent(ev) {
  fail(ev.target.message);
}

function setUpPage() {
  propertyReplacer = new goog.testing.PropertyReplacer();
}

function setUp() {
  if (!idbSupported) {
    return;
  }

  // Always use a clean database by generating a new database name.
  dbName = dbBaseName + Date.now().toString();
  globalDb = openDatabase();
}

function tearDown() {
  for (var i = 0; i < dbsToClose.length; i++) {
    dbsToClose[i].close();
  }
  dbsToClose = [];
  propertyReplacer.reset();
}

function testDatabaseOpened() {
  if (!idbSupported) {
    return;
  }

  assertNotNull(globalDb);
  return globalDb.branch().addCallback(function(db) {
    assertTrue(db.isOpen());
  });
}

function testOpenWithNewVersion() {
  if (!idbSupported) {
    return;
  }

  var upgradeNeeded = false;
  return globalDb.branch()
      .addCallback(function(db) {
        assertEquals(baseVersion, db.getVersion());
        return incrementVersion(
            db, function(ev, db, tx) { upgradeNeeded = true; });
      })
      .addCallback(function(db) {
        assertTrue(upgradeNeeded);
      });
}

function testManipulateObjectStores() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch()
      .addCallback(function(db) {
        assertEquals(baseVersion, db.getVersion());
        return incrementVersion(db, function(ev, db, tx) {
          db.createObjectStore('basicStore');
          db.createObjectStore('keyPathStore', {keyPath: 'keyGoesHere'});
          db.createObjectStore('autoIncrementStore', {autoIncrement: true});
        });
      })
      .addCallback(function(db) {
        var storeNames = db.getObjectStoreNames();
        assertEquals(3, storeNames.length);
        assertTrue(storeNames.contains('basicStore'));
        assertTrue(storeNames.contains('keyPathStore'));
        assertTrue(storeNames.contains('autoIncrementStore'));
        return incrementVersion(
            db, function(ev, db, tx) { db.deleteObjectStore('basicStore'); });
      })
      .addCallback(function(db) {
        var storeNames = db.getObjectStoreNames();
        assertEquals(2, storeNames.length);
        assertFalse(storeNames.contains('basicStore'));
        assertTrue(storeNames.contains('keyPathStore'));
        assertTrue(storeNames.contains('autoIncrementStore'));
      });
}

function testBadObjectStoreManipulation() {
  if (!idbSupported) {
    return;
  }

  var expectedCode = goog.db.Error.ErrorName.INVALID_STATE_ERR;
  return globalDb.branch()
      .addCallback(function(db) {
        try {
          db.createObjectStore('diediedie');
          fail('Create object store outside transaction should have failed.');
        } catch (err) {
          // expected
          assertEquals(expectedCode, err.getName());
        }
      })
      .addCallback(addStore)
      .addCallback(function(db) {
        try {
          db.deleteObjectStore('store');
          fail('Delete object store outside transaction should have failed.');
        } catch (err) {
          // expected
          assertEquals(expectedCode, err.getName());
        }
      })
      .addCallback(function(db) {
        return incrementVersion(db, function(ev, db, tx) {
          try {
            db.deleteObjectStore('diediedie');
            fail('Delete non-existent store should have failed.');
          } catch (err) {
            // expected
            assertEquals(goog.db.Error.ErrorName.NOT_FOUND_ERR, err.getName());
          }
        });
      });
}

function testGetNonExistentObjectStore() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch().addCallback(addStore).addCallback(function(db) {
    var tx = db.createTransaction(['store']);
    try {
      tx.objectStore('diediedie');
      fail('getting non-existent object store should have failed');
    } catch (err) {
      assertEquals(goog.db.Error.ErrorName.NOT_FOUND_ERR, err.getName());
    }
  });
}

function testCreateTransaction() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch().addCallback(addStore).addCallback(function(db) {
    var tx = db.createTransaction(['store']);
    assertEquals('mode not READ_ONLY',
                 TransactionMode.READ_ONLY, tx.getMode());
    tx = db.createTransaction(['store'],
                              goog.db.Transaction.TransactionMode.READ_WRITE);
    assertEquals('mode not READ_WRITE',
                 TransactionMode.READ_WRITE, tx.getMode());
  });
}

function testPutRecord() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(function(db) {
        var initialPutTx = db.createTransaction(
            ['store'], TransactionMode.READ_WRITE);
        initialPutTx.objectStore('store')
            .put({key: 'initial', value: 'value1'}, 'putKey');
        return transactionToPromise(db, initialPutTx);
      })
      .addCallback(function(db) {
        var checkResultsTx = db.createTransaction(['store']);
        var getOperation = checkResultsTx.objectStore('store').get('putKey');
        getOperation.addCallback(function(result) {
          assertEquals('initial', result.key);
          assertEquals('value1', result.value);
        });
        return transactionToPromise(db, checkResultsTx);
      })
      .addCallback(function(db) {
        var overwriteTx = db.createTransaction(
            ['store'], TransactionMode.READ_WRITE);
        overwriteTx.objectStore('store')
            .put({key: 'overwritten', value: 'value2'}, 'putKey');
        return transactionToPromise(db, overwriteTx);
      })
      .addCallback(function(db) {
        var checkOverwriteTx = db.createTransaction(['store']);
        checkOverwriteTx.objectStore('store')
            .get('putKey')
            .addCallback(function(result) {
              // this is guaranteed to run before the COMPLETE event fires on
              // the transaction
              assertEquals('overwritten', result.key);
              assertEquals('value2', result.value);
            });

        return transactionToPromise(db, checkOverwriteTx);
      });
}

function testAddRecord() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(function(db) {
        var initialAddTx = db.createTransaction(
            ['store'], TransactionMode.READ_WRITE);
        initialAddTx.objectStore('store')
            .add({key: 'hi', value: 'something'}, 'stuff');
        return transactionToPromise(db, initialAddTx);
      })
      .addCallback(function(db) {
        var successfulAddTx = db.createTransaction(['store']);
        var getOperation = successfulAddTx.objectStore('store').get('stuff');
        getOperation.addCallback(function(result) {
          assertEquals('hi', result.key);
          assertEquals('something', result.value);
        });
        return transactionToPromise(db, successfulAddTx);
      })
      .addCallback(function(db) {
        var addOverwriteTx = db.createTransaction(
            ['store'], TransactionMode.READ_WRITE);
        addOverwriteTx.objectStore('store')
            .add({key: 'bye', value: 'nothing'}, 'stuff')
            .addErrback(function(err) {
              // expected
              assertEquals(goog.db.Error.ErrorName.CONSTRAINT_ERR,
                           err.getName());
            });
        return transactionToPromise(db, addOverwriteTx)
            .then(
                function() {
                  fail('adding existing record should not have succeeded');
                },
                function(ev) {
                  // expected
                  assertEquals(goog.db.Error.ErrorName.CONSTRAINT_ERR,
                               ev.target.getName());
                });
      });
}

function testPutRecordKeyPathStore() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch()
      .addCallback(function(db) {
        return incrementVersion(db, function(ev, db, tx) {
          db.createObjectStore('keyStore', {keyPath: 'key'});
        });
      })
      .addCallback(function(db) {
        var putTx = db.createTransaction(
            ['keyStore'], TransactionMode.READ_WRITE);
        putTx.objectStore('keyStore').put({key: 'hi', value: 'something'});
        return transactionToPromise(db, putTx);
      })
      .addCallback(function(db) {
        var checkResultsTx = db.createTransaction(['keyStore']);
        checkResultsTx.objectStore('keyStore')
            .get('hi')
            .addCallback(function(result) {
              assertNotUndefined(result);
              assertEquals('hi', result.key);
              assertEquals('something', result.value);
            });
        return transactionToPromise(db, checkResultsTx);
      });
}

function testPutBadRecordKeyPathStore() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch()
      .addCallback(function(db) {
        return incrementVersion(db, function(ev, db, tx) {
          db.createObjectStore('keyStore', {keyPath: 'key'});
        });
      })
      .addCallback(function(db) {
        var badTx = db.createTransaction(
            ['keyStore'], TransactionMode.READ_WRITE);
        return badTx.objectStore('keyStore')
            .put({key: 'diedie', value: 'anything'}, 'badKey')
            .then(
                function() {
                  fail('inserting with explicit key should have failed');
                },
                function(err) {
                  // expected
                  assertEquals(goog.db.Error.ErrorName.DATA_ERR, err.getName());
                });
      });
}

function testPutRecordAutoIncrementStore() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch()
      .addCallback(function(db) {
        return incrementVersion(db, function(ev, db, tx) {
          db.createObjectStore('aiStore', {autoIncrement: true});
        });
      })
      .addCallback(function(db) {
        var tx = db.createTransaction(['aiStore'], TransactionMode.READ_WRITE);
        tx.objectStore('aiStore').put('1');
        tx.objectStore('aiStore').put('2');
        tx.objectStore('aiStore').put('3');
        return transactionToPromise(db, tx);
      })
      .addCallback(function(db) {
        var tx = db.createTransaction(['aiStore']);
        var getAllOperation = tx.objectStore('aiStore').getAll();
        return getAllOperation.addCallback(function(results) {
          assertEquals(3, results.length);
          // only checking to see if the results are included because the keys
          // are not specified
          assertNotEquals(-1, results.indexOf('1'));
          assertNotEquals(-1, results.indexOf('2'));
          assertNotEquals(-1, results.indexOf('3'));
        });
      });
}

function testPutRecordKeyPathAndAutoIncrementStore() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch()
      .addCallback(function(db) {
        return incrementVersion(db, function(ev, db, tx) {
          db.createObjectStore('hybridStore',
                               {keyPath: 'key', autoIncrement: true});
        });
      })
      .addCallback(function(db) {
        var tx = db.createTransaction(
            ['hybridStore'], TransactionMode.READ_WRITE);
        return tx.objectStore('hybridStore')
            .put({value: 'whatever'})
            .addCallback(function() { return db; });
      })
      .addCallback(function(db) {
        var tx = db.createTransaction(['hybridStore']);
        return tx.objectStore('hybridStore')
            .getAll()
            .then(function(results) {
              assertEquals(1, results.length);
              assertEquals('whatever', results[0].value);
              assertNotUndefined(results[0].key);
            });
      });
}

function testPutIllegalRecords() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch().addCallback(addStore).addCallback(
      function(db) {
        var tx = db.createTransaction(['store'], TransactionMode.READ_WRITE);

        var promises = [];
        var badKeyFail = function(keyKind) {
          return function() {
            return fail('putting with ' + keyKind + ' key should have failed');
          }
        };
        var assertExpectedError = function(err) {
          assertEquals(goog.db.Error.ErrorName.DATA_ERR, err.getName());
        };

        promises.push(tx.objectStore('store')
            .put('death', null)
            .then(badKeyFail('null'), assertExpectedError));

        promises.push(tx.objectStore('store')
            .put('death', NaN)
            .then(badKeyFail('NaN'), assertExpectedError));

        promises.push(tx.objectStore('store')
            .put('death', undefined)
            .then(badKeyFail('undefined'), assertExpectedError));

        return goog.Promise.all(promises);
      });
}

function testPutIllegalRecordsWithIndex() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch()
      .addCallback(addStoreWithIndex)
      .addCallback(function(db) {
        var tx = db.createTransaction(['store'], TransactionMode.READ_WRITE);
        var promises = [];
        var badKeyFail = function(keyKind) {
          return function() {
            fail('putting with ' + keyKind + ' key should have failed');
          }
        };
        var assertExpectedError = function(err) {
          // expected
          assertEquals(goog.db.Error.ErrorName.DATA_ERR, err.getName());
        };

        promises.push(tx.objectStore('store')
            .put({value: 'diediedie', key: null})
            .then(badKeyFail('null'), assertExpectedError));

        promises.push(tx.objectStore('store')
            .put({value: 'dietodeath', key: NaN})
            .then(badKeyFail('NaN'), assertExpectedError));
        promises.push(tx.objectStore('store')
            .put({value: 'dietodeath', key: undefined})
            .then(badKeyFail('undefined'), assertExpectedError));

        return goog.Promise.all(promises);
      });
}

function testDeleteRecord() {
  if (!idbSupported) {
    return;
  }

  var db;
  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(function(openedDb) {
        db = openedDb;
        return db.createTransaction(['store'], TransactionMode.READ_WRITE)
            .objectStore('store')
            .put({key: 'hi', value: 'something'}, 'stuff');
      })
      .addCallback(function() {
        return db.createTransaction(['store'], TransactionMode.READ_WRITE)
            .objectStore('store')
            .remove('stuff');
      })
      .addCallback(function() {
        return db.createTransaction(['store']).objectStore('store').get(
            'stuff');
      })
      .addCallback(function(result) {
        assertUndefined(result);
      });
}

function testGetAll() {
  if (!idbSupported) {
    return;
  }

  var values = ['1', '2', '3'];
  var keys = ['a', 'b', 'c'];

  var addData = goog.partial(populateStore, values, keys);
  var checkStore = goog.partial(assertStoreValues, values);

  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(addData)
      .addCallback(checkStore);
}

function testGetAllFreesCursor() {
  if (!idbSupported) {
    return;
  }
  var values = ['1', '2', '3'];
  var keys = ['a', 'b', 'c'];

  var addData = goog.partial(populateStore, values, keys);
  var origCursor = goog.db.Cursor;
  var cursors = [];
  /** @constructor */
  var testCursor = function() {
    origCursor.call(this);
    cursors.push(this);
  };
  goog.object.extend(testCursor, origCursor);
  // We don't use goog.inherits here because we are going to be overwriting
  // goog.db.Cursor and we don't want a new "base" method as
  // goog.db.Cursor.base(this, 'constructor') would be a call to
  // testCursor.base(this, 'constructor') which would be goog.db.Cursor and be
  // an infinite loop.
  testCursor.prototype = origCursor.prototype;
  propertyReplacer.replace(goog.db, 'Cursor', testCursor);
  var checkStoreAndCursorDisposed =
      goog.partial(assertStoreValuesAndCursorsDisposed, values, cursors);

  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(addData)
      .addCallback(checkStoreAndCursorDisposed);
}

function testObjectStoreCursorGet() {
  if (!idbSupported) {
    return;
  }

  var values = ['1', '2', '3', '4'];
  var keys = ['a', 'b', 'c', 'd'];

  var addData = goog.partial(populateStore, values, keys);
  var db;

  var resultValues = [];
  var resultKeys = [];
  // Open the cursor over range ['b', 'c'], move in backwards direction.
  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(addData)
      .addCallback(function(theDb) {
        db = theDb;
        var cursorTx = db.createTransaction(['store']);
        var store = cursorTx.objectStore('store');

        var cursor = store.openCursor(goog.db.KeyRange.bound('b', 'c'),
                                      goog.db.Cursor.Direction.PREV);

        var whenCursorComplete = forEachRecord(cursor, function() {
          resultValues.push(cursor.getValue());
          resultKeys.push(cursor.getKey());
          cursor.next();
        });

        return goog.Promise.all([cursorTx.wait(), whenCursorComplete]);
      })
      .addCallback(function() {
        assertArrayEquals(['3', '2'], resultValues);
        assertArrayEquals(['c', 'b'], resultKeys);
      });
}

function testObjectStoreCursorReplace() {
  if (!idbSupported) {
    return;
  }

  var values = ['1', '2', '3', '4'];
  var keys = ['a', 'b', 'c', 'd'];

  var addData = goog.partial(populateStore, values, keys);

  // Store should contain ['1', '2', '5', '4'] after replacement.
  var checkStore = goog.partial(assertStoreValues, ['1', '2', '5', '4']);

  // Use a bounded cursor for ('b', 'c'] to update value '3' -> '5'.
  var openCursorAndReplace = function(db) {
    var cursorTx = db.createTransaction(['store'], TransactionMode.READ_WRITE);
    var store = cursorTx.objectStore('store');

    var cursor = store.openCursor(goog.db.KeyRange.bound('b', 'c', true));
    var whenCursorComplete = forEachRecord(cursor, function() {
      assertEquals('3', cursor.getValue());
      return cursor.update('5').addCallback(function() { cursor.next(); });
    });

    return goog.Promise.all([cursorTx.wait(), whenCursorComplete])
        .then(function() { return db; });
  };

  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(addData)
      .addCallback(openCursorAndReplace)
      .addCallback(checkStore);
}

function testObjectStoreCursorRemove() {
  if (!idbSupported) {
    return;
  }

  var values = ['1', '2', '3', '4'];
  var keys = ['a', 'b', 'c', 'd'];

  var addData = goog.partial(populateStore, values, keys);

  // Store should contain ['1', '2'] after removing elements.
  var checkStore = goog.partial(assertStoreValues, ['1', '2']);

  // Use a bounded cursor for ('b', ...) to remove '3', '4'.
  var openCursorAndRemove = function(db) {
    var cursorTx = db.createTransaction(['store'], TransactionMode.READ_WRITE);

    var store = cursorTx.objectStore('store');
    var cursor = store.openCursor(goog.db.KeyRange.lowerBound('b', true));
    var whenCursorComplete = forEachRecord(cursor, function() {
      return cursor.remove('5').addCallback(function() { cursor.next(); });
    });
    return goog.Promise.all([cursorTx.wait(), whenCursorComplete])
        .then(function(results) { return db; });
  };

  // Setup and execute test case.
  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(addData)
      .addCallback(openCursorAndRemove)
      .addCallback(checkStore);
}

function testClear() {
  if (!idbSupported) {
    return;
  }

  var db;
  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(function(theDb) {
        db = theDb;

        var putTx = db.createTransaction(['store'], TransactionMode.READ_WRITE);
        putTx.objectStore('store').put('1', 'a');
        putTx.objectStore('store').put('2', 'b');
        putTx.objectStore('store').put('3', 'c');
        return putTx.wait();
      })
      .addCallback(function() {
        return db.createTransaction(['store']).objectStore('store').getAll();
      })
      .addCallback(function(results) {
        assertEquals(3, results.length);
        return db.createTransaction(
            ['store'], TransactionMode.READ_WRITE).objectStore('store').clear();
      })
      .addCallback(function() {
        return db.createTransaction(['store']).objectStore('store').getAll();
      })
      .addCallback(function(results) {
        assertEquals(0, results.length);
      });
}

function testAbortTransaction() {
  if (!idbSupported) {
    return;
  }

  var db;
  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(function(theDb) {
        db = theDb;
        return new Promise(function(resolve, reject) {
          var abortTx = db.createTransaction(
              ['store'], TransactionMode.READ_WRITE);
          abortTx.objectStore('store')
              .put('data', 'stuff')
              .addCallback(function() { abortTx.abort(); });
          goog.events.listen(abortTx, EventTypes.ERROR,
                             reject);

          goog.events.listen(
              abortTx, EventTypes.COMPLETE, function() {
                fail('transaction shouldn\'t have' +
                     ' completed after being aborted');
              });

          goog.events.listen(abortTx, EventTypes.ABORT,
                             resolve);
        });
      })
      .addCallback(function() {
        var checkResultsTx = db.createTransaction(['store']);
        return checkResultsTx.objectStore('store').get('stuff');
      })
      .addCallback(function(result) {
        assertUndefined(result);
      });
}

function testInactiveTransaction() {
  if (!idbSupported) {
    return;
  }

  var db;
  var store;
  var index;
  var createAndFinishTransaction = function(theDb) {
    db = theDb;
    var tx = db.createTransaction(['store'], TransactionMode.READ_WRITE);
    store = tx.objectStore('store');
    index = store.getIndex('index');
    store.put({key: 'something', value: 'anything'});
    return tx.wait();
  };

  var assertCantUseInactiveTransaction = function() {
    var expectedCode = goog.db.Error.ErrorName.TRANSACTION_INACTIVE_ERR;
    var promises = [];

    var failOp = function(op) {
      return function() {
        fail(op + ' with inactive transaction should have failed');
      };
    };
    var assertCorrectError = function(err) {
      assertEquals(expectedCode, err.getName());
    };
    promises.push(store.put({key: 'another', value: 'thing'})
                      .then(failOp('putting'), assertCorrectError));
    promises.push(
        store.add({key: 'another', value: 'thing'})
            .then(failOp('adding'), assertCorrectError));
    promises.push(
        store.remove('something')
            .then(failOp('deleting'), assertCorrectError));
    promises.push(
        store.get('something')
            .then(failOp('getting'), assertCorrectError));
    promises.push(
        store.getAll().then(failOp('getting all'), assertCorrectError));
    promises.push(
        store.clear().then(failOp('clearing all'), assertCorrectError));

    promises.push(
        index.get('anything')
            .then(failOp('getting from index'), assertCorrectError));
    promises.push(
        index.getKey('anything')
            .then(failOp('getting key from index'), assertCorrectError));
    promises.push(
        index.getAll('anything')
            .then(failOp('getting all from index'), assertCorrectError));
    promises.push(
        index.getAllKeys('anything')
            .then(failOp('getting all keys from index'), assertCorrectError));
    return goog.Promise.all(promises);
  };

  return globalDb.branch()
      .addCallback(addStoreWithIndex)
      .addCallback(createAndFinishTransaction)
      .addCallback(assertCantUseInactiveTransaction);
}

function testWrongTransactionMode() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch().addCallback(addStore).addCallback(function(db) {
    var tx = db.createTransaction(['store']);
    assertEquals(goog.db.Transaction.TransactionMode.READ_ONLY, tx.getMode());
    var promises = [];
    promises.push(tx.objectStore('store')
                      .put('KABOOM!', 'anything')
                      .then(function() { fail('putting should have failed'); },
                            function(err) {
                              assertEquals(
                                  goog.db.Error.ErrorName.READ_ONLY_ERR,
                                  err.getName());
                            }));
    promises.push(tx.objectStore('store')
                      .add('EXPLODE!', 'die')
                      .then(function() { fail('adding should have failed'); },
                            function(err) {
                              assertEquals(
                                  goog.db.Error.ErrorName.READ_ONLY_ERR,
                                  err.getName());
                            }));
    promises.push(tx.objectStore('store')
                      .remove('no key', 'nothing')
                      .then(function() { fail('deleting should have failed'); },
                            function(err) {
                              assertEquals(
                                  goog.db.Error.ErrorName.READ_ONLY_ERR,
                                  err.getName());
                            }));
    return goog.Promise.all(promises);
  });
}

function testManipulateIndexes() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch()
      .addCallback(function(db) {
        return incrementVersion(db, function(ev, db, tx) {
          var store = db.createObjectStore('store');
          store.createIndex('index', 'attr1');
          store.createIndex('uniqueIndex', 'attr2', {unique: true});
          store.createIndex('multirowIndex', 'attr3', {multirow: true});
        });
      })
      .addCallback(function(db) {
        var tx = db.createTransaction(['store']);
        var store = tx.objectStore('store');
        var index = store.getIndex('index');
        var uniqueIndex = store.getIndex('uniqueIndex');
        var multirowIndex = store.getIndex('multirowIndex');
        try {
          var dies = store.getIndex('diediedie');
          fail('getting non-existent index should have failed');
        } catch (err) {
          // expected
          assertEquals(goog.db.Error.ErrorName.NOT_FOUND_ERR, err.getName());
        }

        return tx.wait();
      })
      .addCallback(function(db) {
        return incrementVersion(db, function(ev, db, tx) {
          var store = tx.objectStore('store');
          store.deleteIndex('index');
          try {
            store.deleteIndex('diediedie');
            fail('deleting non-existent index should have failed');
          } catch (err) {
            // expected
            assertEquals(goog.db.Error.ErrorName.NOT_FOUND_ERR, err.getName());
          }
        });
      })
      .addCallback(function(db) {
        var tx = db.createTransaction(['store']);
        var store = tx.objectStore('store');
        try {
          var index = store.getIndex('index');
          fail('getting deleted index should have failed');
        } catch (err) {
          // expected
          assertEquals(goog.db.Error.ErrorName.NOT_FOUND_ERR, err.getName());
        }
        var uniqueIndex = store.getIndex('uniqueIndex');
        var multirowIndex = store.getIndex('multirowIndex');
      });
}

function testAddRecordWithIndex() {
  if (!idbSupported) {
    return;
  }

  var addData = function(db) {
    var store = db.createTransaction(
        ['store'], TransactionMode.READ_WRITE).objectStore('store');
    assertFalse(store.getIndex('index').isUnique());
    assertEquals('value', store.getIndex('index').getKeyPath());
    return store.add({key: 'someKey', value: 'lookUpThis'})
        .addCallback(function() { return db; });
  };
  var readAndAssertAboutData = function(db) {
    var index =
        db.createTransaction(['store']).objectStore('store').getIndex('index');
    var promises = [
      index.get('lookUpThis')
          .addCallback(function(result) {
            assertNotUndefined(result);
            assertEquals('someKey', result.key);
            assertEquals('lookUpThis', result.value);
          }),
      index.getKey('lookUpThis')
          .addCallback(function(result) {
            assertNotUndefined(result);
            assertEquals('someKey', result);
          })
    ];
    return goog.Promise.all(promises).then(function() { return db; });
  };
  return globalDb.branch()
      .addCallback(addStoreWithIndex)
      .addCallback(addData)
      .addCallback(readAndAssertAboutData);
}

function testGetMultipleRecordsFromIndex() {
  if (!idbSupported) {
    return;
  }

  var addData = function(db) {
    var addTx = db.createTransaction(['store'], TransactionMode.READ_WRITE);
    addTx.objectStore('store').add({key: '1', value: 'a'});
    addTx.objectStore('store').add({key: '2', value: 'a'});
    addTx.objectStore('store').add({key: '3', value: 'b'});

    return addTx.wait();
  };
  var readData = function(db) {
    var index =
        db.createTransaction(['store']).objectStore('store').getIndex('index');
    var promises = [];
    promises.push(index.getAll().addCallback(function(results) {
      assertNotUndefined(results);
      assertEquals(3, results.length);
    }));
    promises.push(index.getAll('a').addCallback(function(results) {
      assertNotUndefined(results);
      assertEquals(2, results.length);
    }));
    promises.push(index.getAllKeys().addCallback(function(results) {
      assertNotUndefined(results);
      assertEquals(3, results.length);
    }));
    promises.push(index.getAllKeys('b').addCallback(function(results) {
      assertNotUndefined(results);
      assertEquals(1, results.length);
    }));

    return goog.Promise.all(promises).then(function() { return db; });
  };
  return globalDb.branch()
      .addCallback(addStoreWithIndex)
      .addCallback(addData)
      .addCallback(readData);
}

function testUniqueIndex() {
  if (!idbSupported) {
    return;
  }

  var storeDuplicatesToUniqueIndex = function(db) {
    var tx = db.createTransaction(['store'], TransactionMode.READ_WRITE);
    assertTrue(tx.objectStore('store').getIndex('index').isUnique());
    tx.objectStore('store').add({key: '1', value: 'a'});
    tx.objectStore('store').add({key: '2', value: 'a'});
    return transactionToPromise(db, tx).then(
        function() {
          fail('Expected transaction violating unique constraint to fail');
        },
        function(ev) {
          // expected
          assertEquals(goog.db.Error.ErrorName.CONSTRAINT_ERR,
                       ev.target.getName());
        });
  };

  return globalDb.branch().addCallback(function(db) {
    return incrementVersion(db, function(ev, db, tx) {
      var store = db.createObjectStore('store', {keyPath: 'key'});
      store.createIndex('index', 'value', {unique: true});
    });
  }).addCallback(storeDuplicatesToUniqueIndex);
}

function testDeleteDatabase() {
  if (!idbSupported) {
    return;
  }

  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(function(db) {
        db.close();
        return goog.db.deleteDatabase(dbName, function() {
          fail('didn\'t expect deleteDatabase to be blocked');
        });
      })
      .addCallback(openDatabase)
      .addCallback(assertStoreDoesntExist);
}

function testDeleteDatabaseIsBlocked() {
  if (!idbSupported) {
    return;
  }

  var wasBlocked = false;
  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(function(db) {
        db.close();
        // Get a fresh connection, without any events registered on globalDb.
        return goog.db.openDatabase(dbName);
      })
      .addCallback(function(db) {
        dbsToClose.push(db);
        return goog.db.deleteDatabase(dbName, function(ev) {
          wasBlocked = true;
          db.close();
        });
      })
      .addCallback(function() {
        assertTrue(wasBlocked);
        return openDatabase();
      })
      .addCallback(assertStoreDoesntExist);
}

function testBlockedDeleteDatabaseWithVersionChangeEvent() {
  if (!idbSupported) {
    return;
  }

  var gotVersionChange = false;
  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(function(db) {
        db.close();
        // Get a fresh connection, without any events registered on globalDb.
        return goog.db.openDatabase(dbName);
      })
      .addCallback(function(db) {
        dbsToClose.push(db);
        goog.events.listen(
            db, goog.db.IndexedDb.EventType.VERSION_CHANGE, function(ev) {
              gotVersionChange = true;
              db.close();
            });
        return goog.db.deleteDatabase(dbName);
      })
      .addCallback(function() {
        assertTrue(gotVersionChange);
        return openDatabase();
      })
      .addCallback(assertStoreDoesntExist);
}

function testDeleteNonExistentDatabase() {
  if (!idbSupported) {
    return;
  }

  // Deleting non-existent db is a no-op.  Shall not throw anything.
  return globalDb.branch().addCallback(function(db) {
    db.close();
    return goog.db.deleteDatabase('non-existent-db');
  });
}

function testObjectStoreCountAll() {
  if (!idbSupported) {
    return;
  }

  var values = ['1', '2', '3', '4'];
  var keys = ['a', 'b', 'c', 'd'];

  var addData = goog.partial(populateStore, values, keys);

  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(addData)
      .addCallback(function(db) {
        var tx = db.createTransaction(['store']);
        return tx.objectStore('store').count().addCallback(function(count) {
          assertEquals(values.length, count);
        });
      });
}


function testObjectStoreCountSome() {
  if (!idbSupported) {
    return;
  }

  var values = ['1', '2', '3', '4'];
  var keys = ['a', 'b', 'c', 'd'];

  var addData = goog.partial(populateStore, values, keys);
  var countData = function(db) {
    var tx = db.createTransaction(['store']);
    return tx.objectStore('store')
        .count(goog.db.KeyRange.bound('b', 'c'))
        .addCallback(function(count) {
          assertEquals(2, count);
        });
  };

  return globalDb.branch()
      .addCallback(addStore)
      .addCallback(addData)
      .addCallback(countData);
}

function testIndexCursorGet() {
  if (!idbSupported) {
    return;
  }

  var values = ['1', '2', '3', '4'];
  var keys = ['a', 'b', 'c', 'd'];
  var addData = goog.partial(populateStoreWithObjects, values, keys);

  var valuesResult = [];
  var keysResult = [];

  // Open the cursor over range ['b', 'c'], move in backwards direction.
  var walkBackwardsOverCursor = function(db) {
    var cursorTx = db.createTransaction(['store']);
    var index = cursorTx.objectStore('store').getIndex('index');
    var values = [];
    var keys = [];

    var cursor = index.openCursor(goog.db.KeyRange.bound('2', '3'),
                                  goog.db.Cursor.Direction.PREV);
    var cursorFinished = forEachRecord(cursor, function() {
      valuesResult.push(cursor.getValue()['value']);
      keysResult.push(cursor.getValue()['key']);
      cursor.next();
    });

    return goog.Promise.all([cursorFinished, cursorTx.wait()])
        .then(function() { return db });
  };

  return globalDb.branch()
      .addCallbacks(addStoreWithIndex)
      .addCallback(addData)
      .addCallback(walkBackwardsOverCursor)
      .addCallback(function(db) {
        assertArrayEquals(['3', '2'], valuesResult);
        assertArrayEquals(['c', 'b'], keysResult);
      });
}

function testIndexCursorReplace() {
  if (!idbSupported) {
    return;
  }

  var values = ['1', '2', '3', '4'];
  var keys = ['a', 'b', 'c', 'd'];

  var addData = goog.partial(populateStoreWithObjects, values, keys);
  var valuesResult = [];
  var keysResult = [];

  // Store should contain ['1', '2', '5', '4'] after replacement.
  var checkStore = goog.partial(assertStoreObjectValues, ['1', '2', '5', '4']);

  // Use a bounded cursor for ['3', '4') to update value '3' -> '5'.
  var openCursorAndReplace = function(db) {
    var cursorTx = db.createTransaction(['store'], TransactionMode.READ_WRITE);
    var index = cursorTx.objectStore('store').getIndex('index');
    var cursor =
        index.openCursor(goog.db.KeyRange.bound('3', '4', false, true));

    var cursorFinished = forEachRecord(cursor, function() {
      assertEquals('3', cursor.getValue()['value']);
      return cursor.update({'key': cursor.getValue()['key'], 'value': '5'})
          .addCallback(function() { cursor.next(); });
    });

    return goog.Promise.all([cursorFinished, cursorTx.wait()])
        .then(function(results) { return db; });
  };

  // Setup and execute test case.
  return globalDb.branch()
      .addCallback(addStoreWithIndex)
      .addCallback(addData)
      .addCallback(openCursorAndReplace)
      .addCallback(checkStore);
}

function testIndexCursorRemove() {
  if (!idbSupported) {
    return;
  }

  var values = ['1', '2', '3', '4'];
  var keys = ['a', 'b', 'c', 'd'];

  var addData = goog.partial(populateStoreWithObjects, values, keys);

  // Store should contain ['1', '2'] after removing elements.
  var checkStore = goog.partial(assertStoreObjectValues, ['1', '2']);

  // Use a bounded cursor for ('2', ...) to remove '3', '4'.
  var openCursorAndRemove = function(db) {
    var cursorTx = db.createTransaction(['store'], TransactionMode.READ_WRITE);

    var store = cursorTx.objectStore('store');
    var index = store.getIndex('index');
    var cursor = index.openCursor(goog.db.KeyRange.lowerBound('2', true));
    var cursorFinished = forEachRecord(cursor, function() {
      return cursor.remove('5').addCallback(function() { cursor.next(); });
    });

    return goog.Promise.all([cursorFinished, cursorTx.wait()])
        .then(function(results) { return db; });
  };

  // Setup and execute test case.
  return globalDb.branch()
      .addCallback(addStoreWithIndex)
      .addCallback(addData)
      .addCallback(openCursorAndRemove)
      .addCallback(checkStore);
}

function testCanWaitForTransactionToComplete() {
  if (!idbSupported) {
    return;
  }
  return globalDb.branch().addCallback(addStore).addCallback(function(db) {
    var tx = db.createTransaction(['store'], TransactionMode.READ_WRITE);
    tx.objectStore('store').add({key: 'hi', value: 'something'}, 'stuff');
    return tx.wait();
  });
}

function testWaitingOnTransactionThatHasAnError() {
  if (!idbSupported) {
    return;
  }
  return globalDb.branch()
      .addCallback(function(db) {
        return incrementVersion(db, function(ev, db, tx) {
          var store = db.createObjectStore('store', {keyPath: 'key'});
          store.createIndex('index', 'value', {unique: true});
        });
      })
      .addCallback(function(db) {
        var tx = db.createTransaction(['store'], TransactionMode.READ_WRITE);
        assertTrue(tx.objectStore('store').getIndex('index').isUnique());
        tx.objectStore('store').add({key: '1', value: 'a'});
        tx.objectStore('store').add({key: '2', value: 'a'});
        return transactionToPromise(db, tx).then(
            function() { fail('expected transaction to fail'); },
            function(ev) {
              // expected
              assertEquals(goog.db.Error.ErrorName.CONSTRAINT_ERR,
                           ev.target.getName());
            });
      });
}

function testWaitingOnAnAbortedTransaction() {
  if (!idbSupported) {
    return;
  }
  return globalDb
      .addCallback(addStore)
      .addCallback(function(db) {
        var tx = db.createTransaction(['store'], TransactionMode.READ_WRITE);
        var waiting = tx.wait().then(
           function() {
             fail('Wait result should have failed');
           },
           function(e) {
             assertEquals(goog.db.Error.ErrorName.ABORT_ERR, e.getName());
           });
        tx.abort();
        return waiting;
      });
}
