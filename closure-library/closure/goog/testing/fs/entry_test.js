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

goog.provide('goog.testing.fs.EntryTest');
goog.setTestOnly('goog.testing.fs.EntryTest');

goog.require('goog.fs.DirectoryEntry');
goog.require('goog.fs.Error');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.fs.FileSystem');
goog.require('goog.testing.jsunit');

var fs, file, mockClock;

function setUp() {
  // Install the MockClock to create predictable timestamps for new files.
  mockClock = new goog.testing.MockClock(true);

  fs = new goog.testing.fs.FileSystem();
  file = fs.getRoot().
      getDirectorySync('foo', goog.fs.DirectoryEntry.Behavior.CREATE).
      getFileSync('bar', goog.fs.DirectoryEntry.Behavior.CREATE);

  // Uninstall the MockClock since it interferes with goog.Promise execution.
  // Tests that require specific timing may reinstall the MockClock and manually
  // advance promises using mockClock.tick().
  mockClock.uninstall();
}

function testGetName() {
  assertEquals('bar', file.getName());
}

function testGetFullPath() {
  assertEquals('/foo/bar', file.getFullPath());
  assertEquals('/', fs.getRoot().getFullPath());
}

function testGetFileSystem() {
  assertEquals(fs, file.getFileSystem());
}

function testMoveTo() {
  return file.moveTo(fs.getRoot()).then(function(newFile) {
    assertTrue(file.deleted);
    assertFalse(newFile.deleted);
    assertEquals('/bar', newFile.getFullPath());
    assertEquals(fs.getRoot(), newFile.parent);
    assertEquals(newFile, fs.getRoot().getFileSync('bar'));
    assertFalse(fs.getRoot().getDirectorySync('foo').hasChild('bar'));
  });
}

function testMoveToNewName() {
  // Advance the clock to an arbitrary, known time.
  mockClock.install();
  mockClock.tick(71);
  var promise = file.moveTo(fs.getRoot(), 'baz').then(function(newFile) {
    mockClock.tick();
    assertTrue(file.deleted);
    assertFalse(newFile.deleted);
    assertEquals('/baz', newFile.getFullPath());
    assertEquals(fs.getRoot(), newFile.parent);
    assertEquals(newFile, fs.getRoot().getFileSync('baz'));

    var oldParentDir = fs.getRoot().getDirectorySync('foo');
    assertFalse(oldParentDir.hasChild('bar'));
    assertFalse(oldParentDir.hasChild('baz'));

    return oldParentDir.getLastModified();
  }).then(function(lastModifiedDate) {
    assertEquals(71, lastModifiedDate.getTime());
    var oldParentDir = fs.getRoot().getDirectorySync('foo');
    return oldParentDir.getMetadata();
  }).then(function(metadata) {
    assertEquals(71, metadata.modificationTime.getTime());
    return fs.getRoot().getLastModified();
  }).then(function(rootLastModifiedDate) {
    assertEquals(71, rootLastModifiedDate.getTime());
    return fs.getRoot().getMetadata();
  }).then(function(rootMetadata) {
    assertEquals(71, rootMetadata.modificationTime.getTime());
  }).thenAlways(function() {
    mockClock.uninstall();
  });
  mockClock.tick();
  return promise;
}

function testMoveDeletedFile() {
  return assertFailsWhenDeleted(function() {
    return file.moveTo(fs.getRoot());
  });
}

function testCopyTo() {
  mockClock.install();
  mockClock.tick(61);
  var promise = file.copyTo(fs.getRoot()).then(function(newFile) {
    assertFalse(file.deleted);
    assertFalse(newFile.deleted);
    assertEquals('/bar', newFile.getFullPath());
    assertEquals(fs.getRoot(), newFile.parent);
    assertEquals(newFile, fs.getRoot().getFileSync('bar'));

    var oldParentDir = fs.getRoot().getDirectorySync('foo');
    assertEquals(file, oldParentDir.getFileSync('bar'));
    return oldParentDir.getLastModified();
  }).then(function(lastModifiedDate) {
    assertEquals('The original parent directory was not modified.',
                 0, lastModifiedDate.getTime());
    var oldParentDir = fs.getRoot().getDirectorySync('foo');
    return oldParentDir.getMetadata();
  }).then(function(metadata) {
    assertEquals('The original parent directory was not modified.',
                 0, metadata.modificationTime.getTime());
    return fs.getRoot().getLastModified();
  }).then(function(rootLastModifiedDate) {
    assertEquals(61, rootLastModifiedDate.getTime());
    return fs.getRoot().getMetadata();
  }).then(function(rootMetadata) {
    assertEquals(61, rootMetadata.modificationTime.getTime());
  }).thenAlways(function() {
    mockClock.uninstall();
  });
  mockClock.tick();
  return promise;
}

function testCopyToNewName() {
  return file.copyTo(fs.getRoot(), 'baz').addCallback(function(newFile) {
    assertFalse(file.deleted);
    assertFalse(newFile.deleted);
    assertEquals('/baz', newFile.getFullPath());
    assertEquals(fs.getRoot(), newFile.parent);
    assertEquals(newFile, fs.getRoot().getFileSync('baz'));
    assertEquals(file, fs.getRoot().getDirectorySync('foo').getFileSync('bar'));
    assertFalse(fs.getRoot().getDirectorySync('foo').hasChild('baz'));
  });
}

function testCopyDeletedFile() {
  return assertFailsWhenDeleted(function() {
    return file.copyTo(fs.getRoot());
  });
}

function testRemove() {
  mockClock.install();
  mockClock.tick(57);
  var promise = file.remove().then(function() {
    mockClock.tick();
    var parentDir = fs.getRoot().getDirectorySync('foo');

    assertTrue(file.deleted);
    assertFalse(parentDir.hasChild('bar'));

    return parentDir.getLastModified();
  }).then(function(date) {
    assertEquals(57, date.getTime());
    var parentDir = fs.getRoot().getDirectorySync('foo');
    return parentDir.getMetadata();
  }).then(function(metadata) {
    assertEquals(57, metadata.modificationTime.getTime());
  }).thenAlways(function() {
    mockClock.uninstall();
  });
  mockClock.tick();
  return promise;
}

function testRemoveDeletedFile() {
  return assertFailsWhenDeleted(function() {
    return file.remove();
  });
}

function testGetParent() {
  return file.getParent().then(function(p) {
    assertEquals(file.parent, p);
    assertEquals(fs.getRoot().getDirectorySync('foo'), p);
    assertEquals('/foo', p.getFullPath());
  });
}

function testGetDeletedFileParent() {
  return assertFailsWhenDeleted(function() {
    return file.getParent();
  });
}

function assertFailsWhenDeleted(fn) {
  return file.remove().then(fn).then(function() {
    fail('Expected an error');
  }, function(err) {
    assertEquals(goog.fs.Error.ErrorCode.NOT_FOUND, err.code);
  });
}
