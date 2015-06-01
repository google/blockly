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

goog.provide('goog.testing.fs.integrationTest');
goog.setTestOnly('goog.testing.fs.integrationTest');

goog.require('goog.Promise');
goog.require('goog.events');
goog.require('goog.fs');
goog.require('goog.fs.DirectoryEntry');
goog.require('goog.fs.Error');
goog.require('goog.fs.FileSaver');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.fs');
goog.require('goog.testing.jsunit');

var TEST_DIR = 'goog-fs-test-dir';

var Behavior = goog.fs.DirectoryEntry.Behavior;
var EventType = goog.fs.FileSaver.EventType;
var ReadyState = goog.fs.FileSaver.ReadyState;

var deferredFs = goog.testing.fs.getTemporary();

function setUpPage() {
  goog.testing.fs.install(new goog.testing.PropertyReplacer());
}

function tearDown() {
  return loadTestDir().then(function(dir) {
    return dir.removeRecursively();
  });
}

function testWriteFile() {
  return loadFile('test', Behavior.CREATE)
      .then(goog.partial(writeToFile, 'test content'))
      .then(goog.partial(checkFileContent, 'test content'));
}

function testRemoveFile() {
  return loadFile('test', Behavior.CREATE)
      .then(goog.partial(writeToFile, 'test content'))
      .then(function(fileEntry) { return fileEntry.remove(); })
      .then(goog.partial(checkFileRemoved, 'test'));
}

function testMoveFile() {
  var subdir = loadDirectory('subdir', Behavior.CREATE);
  var writtenFile = loadFile('test', Behavior.CREATE)
      .then(goog.partial(writeToFile, 'test content'));

  return goog.Promise.all([subdir, writtenFile])
      .then(function(results) {
        var dir = results[0];
        var fileEntry = results[1];
        return fileEntry.moveTo(dir);
      })
      .then(goog.partial(checkFileContent, 'test content'))
      .then(goog.partial(checkFileRemoved, 'test'));
}

function testCopyFile() {
  var file = loadFile('test', Behavior.CREATE);
  var subdir = loadDirectory('subdir', Behavior.CREATE);
  var writtenFile = file.then(goog.partial(writeToFile, 'test content'));

  return goog.Promise.all([subdir, writtenFile])
      .then(function(results) {
        var dir = results[0];
        var fileEntry = results[1];
        return fileEntry.copyTo(dir);
      })
      .then(goog.partial(checkFileContent, 'test content'))
      .then(function() { return file; })
      .then(goog.partial(checkFileContent, 'test content'));
}

function testAbortWrite() {
  var file = loadFile('test', Behavior.CREATE);

  file.then(goog.partial(startWrite, 'test content'))
      .then(function(writer) {
        writer.abort();
        return writer;
      })
      .then(goog.partial(waitForEvent, EventType.ABORT));

  return file.then(goog.partial(checkFileContent, ''));
}

function testSeek() {
  var file = loadFile('test', Behavior.CREATE);

  return file
      .then(goog.partial(writeToFile, 'test content'))
      .then(function(fileEntry) { return fileEntry.createWriter(); })
      .then(goog.partial(checkReadyState, ReadyState.INIT))
      .then(function(writer) {
        writer.seek(5);
        writer.write(goog.fs.getBlob('stuff and things'));
        return writer;
      })
      .then(goog.partial(checkReadyState, ReadyState.WRITING))
      .then(goog.partial(waitForEvent, EventType.WRITE))
      .then(function() { return file; })
      .then(goog.partial(checkFileContent, 'test stuff and things'));
}

function testTruncate() {
  var file = loadFile('test', Behavior.CREATE);

  return file
      .then(goog.partial(writeToFile, 'test content'))
      .then(function(fileEntry) { return fileEntry.createWriter(); })
      .then(goog.partial(checkReadyState, ReadyState.INIT))
      .then(function(writer) {
        writer.truncate(4);
        return writer;
      })
      .then(goog.partial(checkReadyState, ReadyState.WRITING))
      .then(goog.partial(waitForEvent, EventType.WRITE))
      .then(function() { return file; })
      .then(goog.partial(checkFileContent, 'test'));
}

function loadTestDir() {
  return deferredFs.then(function(fs) {
    return fs.getRoot().getDirectory(TEST_DIR, Behavior.CREATE);
  });
}

function loadFile(filename, behavior) {
  return loadTestDir().then(function(dir) {
    return dir.getFile(filename, behavior);
  });
}

function loadDirectory(filename, behavior) {
  return loadTestDir().then(function(dir) {
    return dir.getDirectory(filename, behavior);
  });
}

function startWrite(content, fileEntry) {
  return fileEntry.createWriter()
      .then(goog.partial(checkReadyState, ReadyState.INIT))
      .then(function(writer) {
        writer.write(goog.fs.getBlob(content));
        return writer;
      })
      .then(goog.partial(checkReadyState, ReadyState.WRITING));
}

function waitForEvent(type, target) {
  return new goog.Promise(function(resolve, reject) {
    goog.events.listenOnce(target, type, resolve);
  });
}

function writeToFile(content, fileEntry) {
  return startWrite(content, fileEntry).
      then(goog.partial(waitForEvent, EventType.WRITE)).
      then(function() { return fileEntry; });
}

function checkFileContent(content, fileEntry) {
  return fileEntry.file()
      .then(function(blob) { return goog.fs.blobToString(blob); })
      .then(goog.partial(assertEquals, content));
}

function checkFileRemoved(filename) {
  return loadFile(filename)
      .then(goog.partial(fail, 'expected file to be removed'))
      .thenCatch(function(err) {
        assertEquals(err.code, goog.fs.Error.ErrorCode.NOT_FOUND);
        return true; // Go back to the non-rejected path.
      });
}

function checkReadyState(expectedState, writer) {
  assertEquals(expectedState, writer.getReadyState());
  return writer;
}
