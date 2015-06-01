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

goog.provide('goog.testing.fs.FileEntryTest');
goog.setTestOnly('goog.testing.fs.FileEntryTest');

goog.require('goog.testing.MockClock');
goog.require('goog.testing.fs.FileEntry');
goog.require('goog.testing.fs.FileSystem');
goog.require('goog.testing.jsunit');

var fs, file, fileEntry, mockClock, currentTime;

function setUp() {
  // Temporarily install the MockClock for predictable timestamps on new files.
  mockClock = new goog.testing.MockClock(true);
  fs = new goog.testing.fs.FileSystem();
  fileEntry = fs.getRoot().createDirectorySync('foo').createFileSync('bar');

  // Uninstall the MockClock since it interferes with goog.Promise execution.
  // Tests that require specific timing may reinstall the MockClock and manually
  // advance promises using mockClock.tick().
  mockClock.uninstall();
}

function testIsFile() {
  assertTrue(fileEntry.isFile());
}

function testIsDirectory() {
  assertFalse(fileEntry.isDirectory());
}

function testFile() {
  var testFile = new goog.testing.fs.FileEntry(fs, fs.getRoot(),
                                               'test', 'hello world');
  return testFile.file().then(function(f) {
    assertEquals('test', f.name);
    assertEquals('hello world', f.toString());
  });
}

function testGetLastModified() {
  // Advance the clock to a known time.
  mockClock.install();
  mockClock.tick(53);
  var testFile = new goog.testing.fs.FileEntry(fs, fs.getRoot(),
                                               'timeTest', 'hello world');
  var promise = testFile.getLastModified().then(function(date) {
    assertEquals(53, date.getTime());
  }).thenAlways(function() {
    mockClock.uninstall();
  });
  mockClock.tick();
  return promise;
}

function testGetMetadata() {
  // Advance the clock to a known time.
  mockClock.install();
  mockClock.tick(54);
  var testFile = new goog.testing.fs.FileEntry(fs, fs.getRoot(),
                                               'timeTest', 'hello world');
  var promise = testFile.getMetadata().then(function(metadata) {
    assertEquals(54, metadata.modificationTime.getTime());
  }).thenAlways(function() {
    mockClock.uninstall();
  });
  mockClock.tick();
  return promise;
}
