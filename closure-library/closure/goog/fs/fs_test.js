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

goog.provide('goog.fsTest');
goog.setTestOnly('goog.fsTest');

goog.require('goog.Promise');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.fs');
goog.require('goog.fs.DirectoryEntry');
goog.require('goog.fs.Error');
goog.require('goog.fs.FileReader');
goog.require('goog.fs.FileSaver');
goog.require('goog.string');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

var TEST_DIR = 'goog-fs-test-dir';

var fsExists = goog.isDef(goog.global.requestFileSystem) ||
    goog.isDef(goog.global.webkitRequestFileSystem);
var deferredFs = fsExists ? goog.fs.getTemporary() : null;
var stubs = new goog.testing.PropertyReplacer();

function setUpPage() {
  if (!fsExists) {
    return;
  }

  return loadTestDir().then(null, function(err) {
    var msg;
    if (err.code == goog.fs.Error.ErrorCode.QUOTA_EXCEEDED) {
      msg = err.message + '. If you\'re using Chrome, you probably need to ' +
          'pass --unlimited-quota-for-files on the command line.';
    } else if (err.code == goog.fs.Error.ErrorCode.SECURITY &&
               window.location.href.match(/^file:/)) {
      msg = err.message + '. file:// URLs can\'t access the filesystem API.';
    } else {
      msg = err.message;
    }
    var body = goog.dom.getDocument().body;
    goog.dom.insertSiblingBefore(
        goog.dom.createDom('h1', {}, msg), body.childNodes[0]);
  });
}

function tearDown() {
  if (!fsExists) {
    return;
  }

  return loadTestDir().then(function(dir) { return dir.removeRecursively(); });
}

function testUnavailableTemporaryFilesystem() {
  stubs.set(goog.global, 'requestFileSystem', null);
  stubs.set(goog.global, 'webkitRequestFileSystem', null);

  return goog.fs.getTemporary(1024).then(fail, function(e) {
    assertEquals('File API unsupported', e.message);
  });
}


function testUnavailablePersistentFilesystem() {
  stubs.set(goog.global, 'requestFileSystem', null);
  stubs.set(goog.global, 'webkitRequestFileSystem', null);

  return goog.fs.getPersistent(2048).then(fail, function(e) {
    assertEquals('File API unsupported', e.message);
  });
}


function testIsFile() {
  if (!fsExists) {
    return;
  }

  return loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE).then(
      function(fileEntry) {
        assertFalse(fileEntry.isDirectory());
        assertTrue(fileEntry.isFile());
      });
}

function testIsDirectory() {
  if (!fsExists) {
    return;
  }

  return loadDirectory('test', goog.fs.DirectoryEntry.Behavior.CREATE).then(
      function(fileEntry) {
        assertTrue(fileEntry.isDirectory());
        assertFalse(fileEntry.isFile());
      });
}

function testReadFileUtf16() {
  if (!fsExists) {
    return;
  }
  var str = 'test content';
  var buf = new ArrayBuffer(str.length * 2);
  var arr = new Uint16Array(buf);
  for (var i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }

  return loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE).
      then(goog.partial(writeToFile, arr.buffer)).
      then(goog.partial(checkFileContentWithEncoding, str, 'UTF-16'));
}

function testReadFileUtf8() {
  if (!fsExists) {
    return;
  }
  var str = 'test content';
  var buf = new ArrayBuffer(str.length);
  var arr = new Uint8Array(buf);
  for (var i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 0xff;
  }

  return loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE).
      then(goog.partial(writeToFile, arr.buffer)).
      then(goog.partial(checkFileContentWithEncoding, str, 'UTF-8'));
}

function testReadFileAsArrayBuffer() {
  if (!fsExists) {
    return;
  }
  var str = 'test content';
  var buf = new ArrayBuffer(str.length);
  var arr = new Uint8Array(buf);
  for (var i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 0xff;
  }

  return loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE).
      then(goog.partial(writeToFile, arr.buffer)).
      then(goog.partial(checkFileContentAs, arr.buffer, 'ArrayBuffer',
          undefined));
}

function testReadFileAsBinaryString() {
  if (!fsExists) {
    return;
  }
  var str = 'test content';
  var buf = new ArrayBuffer(str.length);
  var arr = new Uint8Array(buf);
  for (var i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }

  return loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE).
      then(goog.partial(writeToFile, arr.buffer)).
      then(goog.partial(checkFileContentAs, str, 'BinaryString', undefined));
}

function testWriteFile() {
  if (!fsExists) {
    return;
  }

  return loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE).
      then(goog.partial(writeToFile, 'test content')).
      then(goog.partial(checkFileContent, 'test content'));
}

function testRemoveFile() {
  if (!fsExists) {
    return;
  }

  return loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE).
      then(goog.partial(writeToFile, 'test content')).
      then(function(file) { return file.remove(); }).
      then(goog.partial(checkFileRemoved, 'test'));
}

function testMoveFile() {
  if (!fsExists) {
    return;
  }

  var deferredSubdir = loadDirectory(
      'subdir', goog.fs.DirectoryEntry.Behavior.CREATE);
  var deferredWrittenFile =
      loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE).
      then(goog.partial(writeToFile, 'test content'));
  return goog.Promise.all([deferredSubdir, deferredWrittenFile]).
      then(splitArgs(function(dir, file) { return file.moveTo(dir); })).
      then(goog.partial(checkFileContent, 'test content')).
      then(goog.partial(checkFileRemoved, 'test'));
}

function testCopyFile() {
  if (!fsExists) {
    return;
  }

  var deferredFile = loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE);
  var deferredSubdir = loadDirectory(
      'subdir', goog.fs.DirectoryEntry.Behavior.CREATE);
  var deferredWrittenFile = deferredFile.then(
      goog.partial(writeToFile, 'test content'));
  return goog.Promise.all([deferredSubdir, deferredWrittenFile]).
      then(splitArgs(function(dir, file) { return file.copyTo(dir); })).
      then(goog.partial(checkFileContent, 'test content')).
      then(function() { return deferredFile; }).
      then(goog.partial(checkFileContent, 'test content'));
}

function testAbortWrite() {
  // TODO(nicksantos): This test is broken in newer versions of chrome.
  // We don't know why yet.
  if (true) return;

  if (!fsExists) {
    return;
  }

  var deferredFile = loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE);
  return deferredFile.
      then(goog.partial(startWrite, 'test content')).
      then(function(writer) {
        return new goog.Promise(function(resolve) {
          goog.events.listenOnce(
              writer, goog.fs.FileSaver.EventType.ABORT, resolve);
          writer.abort();
        });
      }).
      then(function() { return loadFile('test'); }).
      then(goog.partial(checkFileContent, ''));
}

function testSeek() {
  if (!fsExists) {
    return;
  }

  var deferredFile = loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE);
  return deferredFile.
      then(goog.partial(writeToFile, 'test content')).
      then(function(file) { return file.createWriter(); }).
      then(
          goog.partial(checkReadyState, goog.fs.FileSaver.ReadyState.INIT)).
      then(function(writer) {
        writer.seek(5);
        writer.write(goog.fs.getBlob('stuff and things'));
        return writer;
      }).
      then(
          goog.partial(checkReadyState, goog.fs.FileSaver.ReadyState.WRITING)).
      then(
          goog.partial(waitForEvent, goog.fs.FileSaver.EventType.WRITE)).
      then(function() { return deferredFile; }).
      then(goog.partial(checkFileContent, 'test stuff and things'));
}

function testTruncate() {
  if (!fsExists) {
    return;
  }

  var deferredFile = loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE);
  return deferredFile.
      then(goog.partial(writeToFile, 'test content')).
      then(function(file) { return file.createWriter(); }).
      then(goog.partial(checkReadyState, goog.fs.FileSaver.ReadyState.INIT)).
      then(function(writer) {
        writer.truncate(4);
        return writer;
      }).
      then(
          goog.partial(checkReadyState, goog.fs.FileSaver.ReadyState.WRITING)).
      then(
          goog.partial(waitForEvent, goog.fs.FileSaver.EventType.WRITE)).
      then(function() { return deferredFile; }).
      then(goog.partial(checkFileContent, 'test'));
}

function testGetLastModified() {
  if (!fsExists) {
    return;
  }
  var now = goog.now();
  return loadFile('test', goog.fs.DirectoryEntry.Behavior.CREATE).
      then(function(entry) { return entry.getLastModified(); }).
      then(function(date) {
        assertRoughlyEquals('Expected the last modified date to be within ' +
           'a few milliseconds of the test start time.',
           now, date.getTime(), 2000);
      });
}

function testCreatePath() {
  if (!fsExists) {
    return;
  }

  return loadTestDir().
      then(function(testDir) {
        return testDir.createPath('foo');
      }).
      then(function(fooDir) {
        assertEquals('/goog-fs-test-dir/foo', fooDir.getFullPath());
        return fooDir.createPath('bar/baz/bat');
      }).
      then(function(batDir) {
        assertEquals('/goog-fs-test-dir/foo/bar/baz/bat', batDir.getFullPath());
      });
}

function testCreateAbsolutePath() {
  if (!fsExists) {
    return;
  }

  return loadTestDir().
      then(function(testDir) {
        return testDir.createPath('/' + TEST_DIR + '/fee/fi/fo/fum');
      }).
      then(function(absDir) {
        assertEquals('/goog-fs-test-dir/fee/fi/fo/fum', absDir.getFullPath());
      });
}

function testCreateRelativePath() {
  if (!fsExists) {
    return;
  }

  return loadTestDir().
      then(function(dir) {
        return dir.createPath('../' + TEST_DIR + '/dir');
      }).
      then(function(relDir) {
        assertEquals('/goog-fs-test-dir/dir', relDir.getFullPath());
        return relDir.createPath('.');
      }).
      then(function(sameDir) {
        assertEquals('/goog-fs-test-dir/dir', sameDir.getFullPath());
        return sameDir.createPath('./././.');
      }).
      then(function(reallySameDir) {
        assertEquals('/goog-fs-test-dir/dir', reallySameDir.getFullPath());
        return reallySameDir.createPath('./new/../..//dir/./new////.');
      }).
      then(function(newDir) {
        assertEquals('/goog-fs-test-dir/dir/new', newDir.getFullPath());
      });
}

function testCreateBadPath() {
  if (!fsExists) {
    return;
  }

  return loadTestDir().
      then(function() { return loadTestDir(); }).
      then(function(dir) {
        // There is only one layer of parent directory from the test dir.
        return dir.createPath('../../../../' + TEST_DIR + '/baz/bat');
      }).
      then(function(batDir) {
        assertEquals('The parent directory of the root directory should ' +
                     'point back to the root directory.',
                     '/goog-fs-test-dir/baz/bat', batDir.getFullPath());
      }).

      then(function() { return loadTestDir(); }).
      then(function(dir) {
        // An empty path should return the same as the input directory.
        return dir.createPath('');
      }).
      then(function(testDir) {
        assertEquals('/goog-fs-test-dir', testDir.getFullPath());
      });
}

function testGetAbsolutePaths() {
  if (!fsExists) {
    return;
  }

  return loadFile('foo', goog.fs.DirectoryEntry.Behavior.CREATE).
      then(function() { return loadTestDir(); }).
      then(function(testDir) { return testDir.getDirectory('/'); }).
      then(function(root) {
        assertEquals('/', root.getFullPath());
        return root.getDirectory('/' + TEST_DIR);
      }).
      then(function(testDir) {
        assertEquals('/goog-fs-test-dir', testDir.getFullPath());
        return testDir.getDirectory('//' + TEST_DIR + '////');
      }).
      then(function(testDir) {
        assertEquals('/goog-fs-test-dir', testDir.getFullPath());
        return testDir.getDirectory('////');
      }).
      then(function(testDir) { assertEquals('/', testDir.getFullPath()); });
}


function testListEmptyDirectory() {
  if (!fsExists) {
    return;
  }

  return loadTestDir().
      then(function(dir) { return dir.listDirectory(); }).
      then(function(entries) { assertArrayEquals([], entries); });
}


function testListDirectory() {
  if (!fsExists) {
    return;
  }

  return loadDirectory('testDir', goog.fs.DirectoryEntry.Behavior.CREATE).
      then(function() {
        return loadFile('testFile', goog.fs.DirectoryEntry.Behavior.CREATE);
      }).
      then(function() { return loadTestDir(); }).
      then(function(testDir) { return testDir.listDirectory(); }).
      then(function(entries) {
        // Verify the contents of the directory listing.
        assertEquals(2, entries.length);

        var dir = goog.array.find(entries, function(entry) {
          return entry.getName() == 'testDir';
        });
        assertNotNull(dir);
        assertTrue(dir.isDirectory());

        var file = goog.array.find(entries, function(entry) {
          return entry.getName() == 'testFile';
        });
        assertNotNull(file);
        assertTrue(file.isFile());
      });
}


function testListBigDirectory() {
  // TODO(nicksantos): This test is broken in newer versions of chrome.
  // We don't know why yet.
  if (true) return;

  if (!fsExists) {
    return;
  }

  function getFileName(i) {
    return 'file' + goog.string.padNumber(i, String(count).length);
  }

  // NOTE: This was intended to verify that the results from repeated
  // DirectoryReader.readEntries() callbacks are appropriately concatenated.
  // In current versions of Chrome (March 2011), all results are returned in the
  // first callback regardless of directory size. The count can be increased in
  // the future to test batched result lists once they are implemented.
  var count = 100;

  var expectedNames = [];

  var def = goog.Promise.resolve();
  for (var i = 0; i < count; i++) {
    var name = getFileName(i);
    expectedNames.push(name);

    def.then(function() {
      return loadFile(name, goog.fs.DirectoryEntry.Behavior.CREATE);
    });
  }

  return def.then(function() { return loadTestDir(); }).
      then(function(testDir) { return testDir.listDirectory(); }).
      then(function(entries) {
        assertEquals(count, entries.length);

        assertSameElements(expectedNames,
                           goog.array.map(entries, function(entry) {
                             return entry.getName();
                           }));
        assertTrue(goog.array.every(entries, function(entry) {
          return entry.isFile();
        }));
      });
}


function testSliceBlob() {
  // A mock blob object whose slice returns the parameters it was called with.
  var blob = {
    'size': 10,
    'slice': function(start, end) {
      return [start, end];
    }
  };

  // Simulate Firefox 13 that implements the new slice.
  var tmpStubs = new goog.testing.PropertyReplacer();
  tmpStubs.set(goog.userAgent, 'GECKO', true);
  tmpStubs.set(goog.userAgent, 'WEBKIT', false);
  tmpStubs.set(goog.userAgent, 'IE', false);
  tmpStubs.set(goog.userAgent, 'VERSION', '13.0');
  tmpStubs.set(goog.userAgent, 'isVersionOrHigherCache_', {});

  // Expect slice to be called with no change to parameters
  assertArrayEquals([2, 10], goog.fs.sliceBlob(blob, 2));
  assertArrayEquals([-2, 10], goog.fs.sliceBlob(blob, -2));
  assertArrayEquals([3, 6], goog.fs.sliceBlob(blob, 3, 6));
  assertArrayEquals([3, -6], goog.fs.sliceBlob(blob, 3, -6));

  // Simulate IE 10 that implements the new slice.
  var tmpStubs = new goog.testing.PropertyReplacer();
  tmpStubs.set(goog.userAgent, 'GECKO', false);
  tmpStubs.set(goog.userAgent, 'WEBKIT', false);
  tmpStubs.set(goog.userAgent, 'IE', true);
  tmpStubs.set(goog.userAgent, 'VERSION', '10.0');
  tmpStubs.set(goog.userAgent, 'isVersionOrHigherCache_', {});

  // Expect slice to be called with no change to parameters
  assertArrayEquals([2, 10], goog.fs.sliceBlob(blob, 2));
  assertArrayEquals([-2, 10], goog.fs.sliceBlob(blob, -2));
  assertArrayEquals([3, 6], goog.fs.sliceBlob(blob, 3, 6));
  assertArrayEquals([3, -6], goog.fs.sliceBlob(blob, 3, -6));

  // Simulate Firefox 4 that implements the old slice.
  tmpStubs.set(goog.userAgent, 'GECKO', true);
  tmpStubs.set(goog.userAgent, 'WEBKIT', false);
  tmpStubs.set(goog.userAgent, 'IE', false);
  tmpStubs.set(goog.userAgent, 'VERSION', '2.0');
  tmpStubs.set(goog.userAgent, 'isVersionOrHigherCache_', {});

  // Expect slice to be called with transformed parameters.
  assertArrayEquals([2, 8], goog.fs.sliceBlob(blob, 2));
  assertArrayEquals([8, 2], goog.fs.sliceBlob(blob, -2));
  assertArrayEquals([3, 3], goog.fs.sliceBlob(blob, 3, 6));
  assertArrayEquals([3, 1], goog.fs.sliceBlob(blob, 3, -6));

  // Simulate Firefox 5 that implements mozSlice (new spec).
  delete blob.slice;
  blob.mozSlice = function(start, end) {
    return ['moz', start, end];
  };
  tmpStubs.set(goog.userAgent, 'GECKO', true);
  tmpStubs.set(goog.userAgent, 'WEBKIT', false);
  tmpStubs.set(goog.userAgent, 'IE', false);
  tmpStubs.set(goog.userAgent, 'VERSION', '5.0');
  tmpStubs.set(goog.userAgent, 'isVersionOrHigherCache_', {});

  // Expect mozSlice to be called with no change to parameters.
  assertArrayEquals(['moz', 2, 10], goog.fs.sliceBlob(blob, 2));
  assertArrayEquals(['moz', -2, 10], goog.fs.sliceBlob(blob, -2));
  assertArrayEquals(['moz', 3, 6], goog.fs.sliceBlob(blob, 3, 6));
  assertArrayEquals(['moz', 3, -6], goog.fs.sliceBlob(blob, 3, -6));

  // Simulate Chrome 20 that implements webkitSlice (new spec).
  delete blob.mozSlice;
  blob.webkitSlice = function(start, end) {
    return ['webkit', start, end];
  };
  tmpStubs.set(goog.userAgent, 'GECKO', false);
  tmpStubs.set(goog.userAgent, 'WEBKIT', true);
  tmpStubs.set(goog.userAgent, 'IE', false);
  tmpStubs.set(goog.userAgent, 'VERSION', '536.10');
  tmpStubs.set(goog.userAgent, 'isVersionOrHigherCache_', {});

  // Expect webkitSlice to be called with no change to parameters.
  assertArrayEquals(['webkit', 2, 10], goog.fs.sliceBlob(blob, 2));
  assertArrayEquals(['webkit', -2, 10], goog.fs.sliceBlob(blob, -2));
  assertArrayEquals(['webkit', 3, 6], goog.fs.sliceBlob(blob, 3, 6));
  assertArrayEquals(['webkit', 3, -6], goog.fs.sliceBlob(blob, 3, -6));

  tmpStubs.reset();
}


function testGetBlobThrowsError() {
  stubs.remove(goog.global, 'BlobBuilder');
  stubs.remove(goog.global, 'WebKitBlobBuilder');
  stubs.remove(goog.global, 'Blob');

  try {
    goog.fs.getBlob();
    fail();
  } catch (e) {
    assertEquals('This browser doesn\'t seem to support creating Blobs',
        e.message);
  }

  stubs.reset();
}


function testGetBlobWithProperties() {
  // Skip test if browser doesn't support Blob API.
  if (typeof(goog.global.Blob) != 'function') {
    return;
  }

  var blob = goog.fs.getBlobWithProperties(['test'], 'text/test', 'native');
  assertEquals('text/test', blob.type);
}


function testGetBlobWithPropertiesThrowsError() {
  stubs.remove(goog.global, 'BlobBuilder');
  stubs.remove(goog.global, 'WebKitBlobBuilder');
  stubs.remove(goog.global, 'Blob');

  try {
    goog.fs.getBlobWithProperties();
    fail();
  } catch (e) {
    assertEquals('This browser doesn\'t seem to support creating Blobs',
        e.message);
  }

  stubs.reset();
}


function testGetBlobWithPropertiesUsingBlobBuilder() {
  function BlobBuilder() {
    this.parts = [];
    this.append = function(value, endings) {
      this.parts.push({value: value, endings: endings});
    };
    this.getBlob = function(type) {
      return {type: type, builder: this};
    };
  }
  stubs.set(goog.global, 'BlobBuilder', BlobBuilder);

  var blob = goog.fs.getBlobWithProperties(['test'], 'text/test', 'native');
  assertEquals('text/test', blob.type);
  assertEquals('test', blob.builder.parts[0].value);
  assertEquals('native', blob.builder.parts[0].endings);

  stubs.reset();
}


function loadTestDir() {
  return deferredFs.then(function(fs) {
    return fs.getRoot().getDirectory(
        TEST_DIR, goog.fs.DirectoryEntry.Behavior.CREATE);
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

function startWrite(content, file) {
  return file.createWriter().
      then(goog.partial(checkReadyState, goog.fs.FileSaver.ReadyState.INIT)).
      then(function(writer) {
        writer.write(goog.fs.getBlob(content));
        return writer;
      }).
      then(goog.partial(checkReadyState, goog.fs.FileSaver.ReadyState.WRITING));
}

function waitForEvent(type, target) {
  var done;
  var promise = new goog.Promise(function(_done) { done = _done; });
  goog.events.listenOnce(target, type, done);
  return promise;
}

function writeToFile(content, file) {
  return startWrite(content, file).
      then(goog.partial(waitForEvent, goog.fs.FileSaver.EventType.WRITE)).
      then(function() { return file; });
}

function checkFileContent(content, file) {
  return checkFileContentAs(content, 'Text', undefined, file);
}

function checkFileContentWithEncoding(content, encoding, file) {
  return checkFileContentAs(content, 'Text', encoding, file);
}

function checkFileContentAs(content, filetype, encoding, file) {
  return file.file().
      then(function(blob) {
        return goog.fs.FileReader['readAs' + filetype](blob, encoding);
      }).
      then(goog.partial(checkEquals, content));
}

function checkEquals(a, b) {
  if (a instanceof ArrayBuffer && b instanceof ArrayBuffer) {
    assertEquals(a.byteLength, b.byteLength);
    var viewA = new DataView(a);
    var viewB = new DataView(b);
    for (var i = 0; i < a.byteLength; i++) {
      assertEquals(viewA.getUint8(i), viewB.getUint8(i));
    }
  } else {
    assertEquals(a, b);
  }
}

function checkFileRemoved(filename) {
  return loadFile(filename).then(
      goog.partial(fail, 'expected file to be removed'),
      function(err) {
        assertEquals(err.code, goog.fs.Error.ErrorCode.NOT_FOUND);
      });
}

function checkReadyState(expectedState, writer) {
  assertEquals(expectedState, writer.getReadyState());
  return writer;
}

function splitArgs(fn) {
  return function(args) { return fn(args[0], args[1]); };
}
