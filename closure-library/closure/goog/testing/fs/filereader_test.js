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

goog.provide('goog.testing.fs.FileReaderTest');
goog.setTestOnly('goog.testing.fs.FileReaderTest');

goog.require('goog.Promise');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.fs.Error');
goog.require('goog.fs.FileReader');
goog.require('goog.object');
goog.require('goog.testing.events.EventObserver');
goog.require('goog.testing.fs.FileReader');
goog.require('goog.testing.fs.FileSystem');
goog.require('goog.testing.jsunit');


var EventType = goog.fs.FileReader.EventType;
var ReadyState = goog.fs.FileReader.ReadyState;


/** @type {!goog.testing.fs.File} */
var file;


/** @type {!goog.testing.fs.FileReader} */
var reader;


/** @type {!goog.testing.events.EventObserver} */
var observer;


/** @const */
var hasArrayBuffer = goog.isDef(goog.global.ArrayBuffer);


function setUp() {
  var observedEvents = [];
  var fs = new goog.testing.fs.FileSystem();
  var fileEntry = fs.getRoot().createDirectorySync('foo').createFileSync('bar');

  file = fileEntry.fileSync();
  file.setDataInternal('test content');

  reader = new goog.testing.fs.FileReader();

  // Observe all file events fired by the FileReader.
  observer = new goog.testing.events.EventObserver();
  goog.events.listen(reader, goog.object.getValues(EventType), observer);
}


function tearDown() {
  goog.dispose(reader);
}


function testRead() {
  assertEquals(ReadyState.INIT, reader.getReadyState());
  assertUndefined(reader.getResult());

  return new goog.Promise(function(resolve, reject) {
    goog.events.listen(reader, EventType.LOAD_END, resolve);
    reader.readAsText(file);
    assertEquals(ReadyState.LOADING, reader.getReadyState());
  }).then(function(result) {
    assertEquals(file.toString(), reader.getResult());

    assertEquals(ReadyState.DONE, reader.getReadyState());
    assertArrayEquals([
      EventType.LOAD_START,
      EventType.LOAD,
      EventType.LOAD,
      EventType.LOAD,
      EventType.LOAD_END
    ], goog.array.map(observer.getEvents(), function(e) { return e.type; }));
  });
}


function testReadAsArrayBuffer() {
  if (!hasArrayBuffer) {
    // Skip if array buffer is not supported
    return;
  }

  return new goog.Promise(function(resolve, reject) {
    goog.events.listen(reader, EventType.LOAD_END, resolve);
    reader.readAsArrayBuffer(file);
    assertEquals(ReadyState.LOADING, reader.getReadyState());
  }).then(function(result) {
    assertElementsEquals(file.toArrayBuffer(), reader.getResult());

    assertEquals(ReadyState.DONE, reader.getReadyState());
    assertArrayEquals([
      EventType.LOAD_START,
      EventType.LOAD,
      EventType.LOAD,
      EventType.LOAD,
      EventType.LOAD_END
    ], goog.array.map(observer.getEvents(), function(e) { return e.type; }));
  });
}


function testReadAsDataUrl() {
  return new goog.Promise(function(resolve, reject) {
    goog.events.listen(reader, EventType.LOAD_END, resolve);
    reader.readAsDataUrl(file);
    assertEquals(ReadyState.LOADING, reader.getReadyState());
  }).then(function(result) {
    assertEquals(file.toDataUrl(), reader.getResult());

    assertEquals(ReadyState.DONE, reader.getReadyState());
    assertArrayEquals([
      EventType.LOAD_START,
      EventType.LOAD,
      EventType.LOAD,
      EventType.LOAD,
      EventType.LOAD_END
    ], goog.array.map(observer.getEvents(), function(e) { return e.type; }));
  });
}


function testAbort() {
  return new goog.Promise(function(resolve, reject) {
    goog.events.listen(reader, EventType.LOAD_END, resolve);
    reader.readAsText(file);
    assertEquals(ReadyState.LOADING, reader.getReadyState());
    reader.abort();
  }).then(function(result) {
    assertUndefined(reader.getResult());

    assertEquals(ReadyState.DONE, reader.getReadyState());
    assertArrayEquals([
      EventType.ERROR,
      EventType.ABORT,
      EventType.LOAD_END
    ], goog.array.map(observer.getEvents(), function(e) { return e.type; }));
  });
}


function testAbortBeforeRead() {
  var err = assertThrows(function() {
    reader.abort();
  });
  assertEquals(goog.fs.Error.ErrorCode.INVALID_STATE, err.code);
}


function testReadDuringRead() {
  var err = assertThrows(function() {
    reader.readAsText(file);
    reader.readAsText(file);
  });
  assertEquals(goog.fs.Error.ErrorCode.INVALID_STATE, err.code);
}
