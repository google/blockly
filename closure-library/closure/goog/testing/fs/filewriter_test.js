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

goog.provide('goog.testing.fs.FileWriterTest');
goog.setTestOnly('goog.testing.fs.FileWriterTest');

goog.require('goog.Promise');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.fs.Error');
goog.require('goog.fs.FileSaver');
goog.require('goog.object');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events.EventObserver');
goog.require('goog.testing.fs.Blob');
goog.require('goog.testing.fs.FileSystem');
goog.require('goog.testing.jsunit');


var EventType = goog.fs.FileSaver.EventType;
var ReadyState = goog.fs.FileSaver.ReadyState;


/** @type {!goog.testing.fs.File} */
var file;


/** @type {!goog.testing.fs.FileWriter} */
var writer;


/** @type {!goog.testing.MockClock} */
var mockClock;


function setUp() {
  // Temporarily install the MockClock to get predictable file modified times.
  mockClock = new goog.testing.MockClock(true);
  var fs = new goog.testing.fs.FileSystem();
  var fileEntry = fs.getRoot().createDirectorySync('foo').createFileSync('bar');
  mockClock.uninstall();

  file = fileEntry.fileSync();
  file.setDataInternal('');

  return fileEntry.createWriter().then(function(fileWriter) {
    writer = fileWriter;
  });
}


function tearDown() {
  goog.dispose(writer);
}


function testWrite() {
  var observer = createObserver(writer);

  mockClock.install();
  assertEquals(ReadyState.INIT, writer.getReadyState());
  assertPositionAndLength(0, 0, writer);
  assertLastModified(0, file);

  mockClock.tick(3);
  var promise = writeString(writer, 'hello');
  assertPositionAndLength(0, 0, writer);
  assertEquals(ReadyState.WRITING, writer.getReadyState());

  promise =
      promise
          .then(function() {
            assertEquals('hello', file.toString());
            assertPositionAndLength(5, 5, writer);
            assertLastModified(3, file);

            assertEquals(ReadyState.DONE, writer.getReadyState());
            assertArrayEquals(
                [EventType.WRITE_START, EventType.WRITE, EventType.WRITE_END],
                goog.array.map(
                    observer.getEvents(), function(e) { return e.type; }));

            var promise = writeString(writer, ' world');
            assertEquals(ReadyState.WRITING, writer.getReadyState());
            mockClock.tick();
            return promise;
          })
          .then(function() {
            assertEquals('hello world', file.toString());
            assertPositionAndLength(11, 11, writer);
            assertLastModified(4, file);

            assertEquals(ReadyState.DONE, writer.getReadyState());
            assertArrayEquals(
                [
                  EventType.WRITE_START, EventType.WRITE, EventType.WRITE_END,
                  EventType.WRITE_START, EventType.WRITE, EventType.WRITE_END
                ],
                goog.array.map(
                    observer.getEvents(), function(e) { return e.type; }));

          })
          .thenAlways(function() { mockClock.uninstall(); });

  mockClock.tick();
  return promise;
}


function testSeek() {
  mockClock.install();
  mockClock.tick(17);
  assertLastModified(0, file);

  var promise = writeString(writer, 'hello world')
                    .then(function() {
                      assertPositionAndLength(11, 11, writer);
                      assertLastModified(17, file);

                      writer.seek(6);
                      assertPositionAndLength(6, 11, writer);

                      var promise = writeString(writer, 'universe');
                      mockClock.tick();
                      return promise;
                    })
                    .then(function() {
                      assertEquals('hello universe', file.toString());
                      assertPositionAndLength(14, 14, writer);

                      writer.seek(500);
                      assertPositionAndLength(14, 14, writer);

                      var promise = writeString(writer, '!');
                      mockClock.tick();
                      return promise;
                    })
                    .then(function() {
                      assertEquals('hello universe!', file.toString());
                      assertPositionAndLength(15, 15, writer);

                      writer.seek(-9);
                      assertPositionAndLength(6, 15, writer);

                      var promise = writeString(writer, 'foo');
                      mockClock.tick();
                      return promise;
                    })
                    .then(function() {
                      assertEquals('hello fooverse!', file.toString());
                      assertPositionAndLength(9, 15, writer);

                      writer.seek(-500);
                      assertPositionAndLength(0, 15, writer);

                      var promise = writeString(writer, 'bye-o');
                      mockClock.tick();
                      return promise;
                    })
                    .then(function() {
                      assertEquals('bye-o fooverse!', file.toString());
                      assertPositionAndLength(5, 15, writer);
                      assertLastModified(21, file);
                    })
                    .thenAlways(function() { mockClock.uninstall(); });

  mockClock.tick();
  return promise;
}


function testAbort() {
  var observer = createObserver(writer);

  mockClock.install();
  mockClock.tick(13);

  var promise = writeString(writer, 'hello world');
  assertEquals(ReadyState.WRITING, writer.getReadyState());
  writer.abort();

  promise = promise
                .then(function() {
                  assertEquals('', file.toString());

                  assertEquals(ReadyState.DONE, writer.getReadyState());
                  assertPositionAndLength(0, 0, writer);
                  assertLastModified(0, file);

                  assertArrayEquals(
                      [EventType.ERROR, EventType.ABORT, EventType.WRITE_END],
                      goog.array.map(observer.getEvents(), function(e) {
                        return e.type;
                      }));
                })
                .thenAlways(function() { mockClock.uninstall(); });

  mockClock.tick();
  return promise;
}

function testTruncate() {
  // Create the event observer after the initial write is complete.
  var observer;

  mockClock.install();

  var promise =
      writeString(writer, 'hello world')
          .then(function() {
            observer = createObserver(writer);

            writer.truncate(5);
            assertEquals(ReadyState.WRITING, writer.getReadyState());
            assertPositionAndLength(11, 11, writer);
            assertLastModified(0, file);

            var promise = waitForEvent(writer, EventType.WRITE_END);
            mockClock.tick();
            return promise;
          })
          .then(function() {
            assertEquals('hello', file.toString());

            assertEquals(ReadyState.DONE, writer.getReadyState());
            assertPositionAndLength(5, 5, writer);
            assertLastModified(7, file);

            assertArrayEquals(
                [EventType.WRITE_START, EventType.WRITE, EventType.WRITE_END],
                goog.array.map(
                    observer.getEvents(), function(e) { return e.type; }));

            writer.truncate(10);
            var promise = waitForEvent(writer, EventType.WRITE_END);
            mockClock.tick(1);
            return promise;
          })
          .then(function() {
            assertEquals('hello\0\0\0\0\0', file.toString());
            assertLastModified(8, file);
          })
          .thenAlways(function() { mockClock.uninstall(); });

  mockClock.tick(7);
  return promise;
}


function testAbortBeforeWrite() {
  var err = assertThrows(function() { writer.abort(); });
  assertEquals(goog.fs.Error.ErrorCode.INVALID_STATE, err.code);
}


function testAbortAfterWrite() {
  return writeString(writer, 'hello world').then(function() {
    var err = assertThrows(function() { writer.abort(); });
    assertEquals(goog.fs.Error.ErrorCode.INVALID_STATE, err.code);
  });
}


function testWriteDuringWrite() {
  writer.write(new goog.testing.fs.Blob('hello'));
  var err = assertThrows(function() {
    writer.write(new goog.testing.fs.Blob('world'));
  });
  assertEquals(goog.fs.Error.ErrorCode.INVALID_STATE, err.code);
}


function testSeekDuringWrite() {
  writer.write(new goog.testing.fs.Blob('hello world'));
  var err = assertThrows(function() { writer.seek(5); });
  assertEquals(goog.fs.Error.ErrorCode.INVALID_STATE, err.code);
}


function testTruncateDuringWrite() {
  writer.write(new goog.testing.fs.Blob('hello world'));
  var err = assertThrows(function() { writer.truncate(5); });
  assertEquals(goog.fs.Error.ErrorCode.INVALID_STATE, err.code);
}


function waitForEvent(target, type) {
  return new goog.Promise(function(resolve, reject) {
    goog.events.listenOnce(target, type, resolve);
  });
}


function assertPositionAndLength(expectedPosition, expectedLength, writer) {
  assertEquals(expectedPosition, writer.getPosition());
  assertEquals(expectedLength, writer.getLength());
}


function assertLastModified(expectedTime, file) {
  assertEquals(expectedTime, file.lastModifiedDate.getTime());
}


function writeString(writer, str) {
  var promise = waitForEvent(writer, goog.fs.FileSaver.EventType.WRITE_END);
  writer.write(new goog.testing.fs.Blob(str));
  return promise;
}


function createObserver(writer) {
  // Observe all file events fired by the FileWriter.
  var observer = new goog.testing.events.EventObserver();
  goog.events.listen(writer, goog.object.getValues(EventType), observer);
  return observer;
}
