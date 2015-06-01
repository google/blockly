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

goog.provide('goog.testing.fs.DirectoryEntryTest');
goog.setTestOnly('goog.testing.fs.DirectoryEntryTest');

goog.require('goog.array');
goog.require('goog.fs.DirectoryEntry');
goog.require('goog.fs.Error');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.fs.FileSystem');
goog.require('goog.testing.jsunit');

var Behavior = goog.fs.DirectoryEntry.Behavior;
var fs, dir, mockClock;

function setUp() {
  // Install the MockClock to create predictable timestamps for new files.
  mockClock = new goog.testing.MockClock(true);
  fs = new goog.testing.fs.FileSystem();
  dir = fs.getRoot().createDirectorySync('foo');
  dir.createDirectorySync('subdir').createFileSync('subfile');
  dir.createFileSync('file');
  mockClock.uninstall();
}

function testIsFile() {
  assertFalse(dir.isFile());
}

function testIsDirectory() {
  assertTrue(dir.isDirectory());
}

function testRemoveWithChildren() {
  dir.getFileSync('bar', Behavior.CREATE);
  return dir.remove().then(fail, function(e) {
    assertEquals(goog.fs.Error.ErrorCode.INVALID_MODIFICATION, e.code);
  });
}

function testRemoveWithoutChildren() {
  var emptyDir = dir.getDirectorySync('empty', Behavior.CREATE);
  return emptyDir.remove().then(function() {
    assertTrue(emptyDir.deleted);
    assertFalse(fs.getRoot().hasChild('empty'));
  });
}

function testRemoveRootRecursively() {
  var root = fs.getRoot();
  return root.removeRecursively().then(function() {
    assertTrue(dir.deleted);
    assertFalse(fs.getRoot().deleted);
  });
}

function testGetFile() {
  return dir.getFile('file').then(function(file) {
    assertEquals(dir.getFileSync('file'), file);
    assertEquals('file', file.getName());
    assertEquals('/foo/file', file.getFullPath());
    assertTrue(file.isFile());

    return dir.getLastModified();
  }).then(function(date) {
    assertEquals('Reading a file should not update the modification date.',
        0, date.getTime());
    return dir.getMetadata();
  }).then(function(metadata) {
    assertEquals('Reading a file should not update the metadata.',
        0, metadata.modificationTime.getTime());
  });
}

function testGetFileFromSubdir() {
  return dir.getFile('subdir/subfile').then(function(file) {
    assertEquals(dir.getDirectorySync('subdir').getFileSync('subfile'), file);
    assertEquals('subfile', file.getName());
    assertEquals('/foo/subdir/subfile', file.getFullPath());
    assertTrue(file.isFile());
  });
}

function testGetAbsolutePaths() {
  return fs.getRoot().getFile('/foo/subdir/subfile').then(function(subfile) {
    assertEquals('/foo/subdir/subfile', subfile.getFullPath());
    return fs.getRoot().getDirectory('//foo////');
  }).then(function(foo) {
    assertEquals('/foo', foo.getFullPath());
    return foo.getDirectory('/');
  }).then(function(root) {
    assertEquals('/', root.getFullPath());
    return root.getDirectory('/////');
  }).then(function(root) {
    assertEquals('/', root.getFullPath());
  });
}

function testCreateFile() {
  // Advance the clock to an arbitrary, known time.
  mockClock.install();
  mockClock.tick(43);
  var promise = dir.getLastModified().then(function(date) {
    assertEquals(0, date.getTime());
  }).then(function() {
    return dir.getFile('bar', Behavior.CREATE);
  }).then(function(file) {
    mockClock.tick();
    assertEquals('bar', file.getName());
    assertEquals('/foo/bar', file.getFullPath());
    assertEquals(dir, file.parent);
    assertTrue(file.isFile());

    return dir.getLastModified();
  }).then(function(date) {
    assertEquals(43, date.getTime());
    return dir.getMetadata();
  }).then(function(metadata) {
    assertEquals(43, metadata.modificationTime.getTime());
  }).thenAlways(function() {
    mockClock.uninstall();
  });
  mockClock.tick();
  return promise;
}

function testCreateFileThatAlreadyExists() {
  mockClock.install();
  mockClock.tick(47);
  var existingFile = dir.getFileSync('file');
  var promise = dir.getFile('file', Behavior.CREATE).then(function(file) {
    assertEquals('file', file.getName());
    assertEquals('/foo/file', file.getFullPath());
    assertEquals(dir, file.parent);
    assertEquals(existingFile, file);
    assertTrue(file.isFile());

    return dir.getLastModified();
  }).then(function(date) {
    assertEquals(47, date.getTime());
    return dir.getMetadata();
  }).then(function(metadata) {
    assertEquals(47, metadata.modificationTime.getTime());
  }).thenAlways(function() {
    mockClock.uninstall();
  });
  mockClock.tick();
  return promise;
}

function testCreateFileInSubdir() {
  return dir.getFile('subdir/bar', Behavior.CREATE).then(function(file) {
    assertEquals('bar', file.getName());
    assertEquals('/foo/subdir/bar', file.getFullPath());
    assertEquals(dir.getDirectorySync('subdir'), file.parent);
    assertTrue(file.isFile());
  });
}

function testCreateFileExclusive() {
  return dir.getFile('bar', Behavior.CREATE_EXCLUSIVE).then(function(file) {
    assertEquals('bar', file.getName());
    assertEquals('/foo/bar', file.getFullPath());
    assertEquals(dir, file.parent);
    assertTrue(file.isFile());
  });
}

function testGetNonExistentFile() {
  return dir.getFile('bar').then(fail, function(e) {
    assertEquals(goog.fs.Error.ErrorCode.NOT_FOUND, e.code);
  });
}

function testGetNonExistentFileInSubdir() {
  return dir.getFile('subdir/bar').then(fail, function(e) {
    assertEquals(goog.fs.Error.ErrorCode.NOT_FOUND, e.code);
  });
}

function testGetFileInNonExistentSubdir() {
  return dir.getFile('bar/subfile').then(fail, function(e) {
    assertEquals(goog.fs.Error.ErrorCode.NOT_FOUND, e.code);
  });
}

function testGetFileThatsActuallyADirectory() {
  return dir.getFile('subdir').then(fail, function(e) {
    assertEquals(goog.fs.Error.ErrorCode.TYPE_MISMATCH, e.code);
  });
}

function testCreateFileInNonExistentSubdir() {
  return dir.getFile('bar/newfile', Behavior.CREATE).then(fail, function(e) {
    assertEquals(goog.fs.Error.ErrorCode.NOT_FOUND, e.code);
  });
}

function testCreateFileThatsActuallyADirectory() {
  return dir.getFile('subdir', Behavior.CREATE).then(fail, function(e) {
    assertEquals(goog.fs.Error.ErrorCode.TYPE_MISMATCH, e.code);
  });
}

function testCreateExclusiveExistingFile() {
  return dir.getFile('file', Behavior.CREATE_EXCLUSIVE).then(fail, function(e) {
    assertEquals(goog.fs.Error.ErrorCode.INVALID_MODIFICATION, e.code);
  });
}

function testListEmptyDirectory() {
  var emptyDir = fs.getRoot().getDirectorySync('empty', Behavior.CREATE);

  return emptyDir.listDirectory().then(function(entryList) {
    assertSameElements([], entryList);
  });
}

function testListDirectory() {
  var root = fs.getRoot();
  root.getDirectorySync('dir1', Behavior.CREATE);
  root.getDirectorySync('dir2', Behavior.CREATE);
  root.getFileSync('file1', Behavior.CREATE);
  root.getFileSync('file2', Behavior.CREATE);

  return fs.getRoot().listDirectory().then(function(entryList) {
    assertSameElements([
      'dir1',
      'dir2',
      'file1',
      'file2',
      'foo'
    ],
    goog.array.map(entryList, function(entry) {
      return entry.getName();
    }));
  });
}

function testCreatePath() {
  return dir.createPath('baz/bat').then(function(batDir) {
    assertEquals('/foo/baz/bat', batDir.getFullPath());
    return batDir.createPath('../zazzle');
  }).then(function(zazzleDir) {
    assertEquals('/foo/baz/zazzle', zazzleDir.getFullPath());
    return zazzleDir.createPath('/elements/actinides/neptunium/');
  }).then(function(elDir) {
    assertEquals('/elements/actinides/neptunium', elDir.getFullPath());
  });
}
