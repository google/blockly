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

goog.provide('goog.crypt.BlobHasherTest');
goog.setTestOnly('goog.crypt.BlobHasherTest');

goog.require('goog.crypt');
goog.require('goog.crypt.BlobHasher');
goog.require('goog.crypt.Md5');
goog.require('goog.events');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

// A browser-independent mock of goog.fs.sliceBlob. The actual implementation
// calls the underlying slice method differently based on browser version.
// This mock does not support negative opt_end.
var fsSliceBlobMock = function(blob, start, opt_end) {
  if (!goog.isNumber(opt_end)) {
    opt_end = blob.size;
  }
  return blob.slice(start, opt_end);
};

// Mock out the Blob using a string.
BlobMock = function(string) {
  this.data = string;
  this.size = this.data.length;
};

BlobMock.prototype.slice = function(start, end) {
  return new BlobMock(this.data.substr(start, end - start));
};


// Mock out the FileReader to have control over the flow.
FileReaderMock = function() {
  this.array_ = [];
  this.result = null;
  this.readyState = this.EMPTY;

  this.onload = null;
  this.onabort = null;
  this.onerror = null;
};

FileReaderMock.prototype.EMPTY = 0;
FileReaderMock.prototype.LOADING = 1;
FileReaderMock.prototype.DONE = 2;

FileReaderMock.prototype.mockLoad = function() {
  this.readyState = this.DONE;
  this.result = this.array_;
  if (this.onload) {
    this.onload.call();
  }
};

FileReaderMock.prototype.abort = function() {
  this.readyState = this.DONE;
  if (this.onabort) {
    this.onabort.call();
  }
};

FileReaderMock.prototype.mockError = function() {
  this.readyState = this.DONE;
  if (this.onerror) {
    this.onerror.call();
  }
};

FileReaderMock.prototype.readAsArrayBuffer = function(blobMock) {
  this.readyState = this.LOADING;
  this.array_ = [];
  for (var i = 0; i < blobMock.size; ++i) {
    this.array_[i] = blobMock.data.charCodeAt(i);
  }
};

FileReaderMock.prototype.isLoading = function() {
  return this.readyState == this.LOADING;
};

var stubs = new goog.testing.PropertyReplacer();
function setUp() {
  stubs.set(goog.global, 'FileReader', FileReaderMock);
  stubs.set(goog.fs, 'sliceBlob', fsSliceBlobMock);
}

function tearDown() {
  stubs.reset();
}


/**
 * Makes the blobHasher read chunks from the blob and hash it. The number of
 * reads shall not exceed a pre-determined number (typically blob size / chunk
 * size) for computing hash. This function fails fast (after maxReads is
 * reached), assuming that the hasher failed to generate hashes. This prevents
 * the test suite from going into infinite loop.
 * @param {!goog.crypt.BlobHasher} blobHasher Hasher in action.
 * @param {number} maxReads Max number of read attempts.
 */
function readFromBlob(blobHasher, maxReads) {
  var counter = 0;
  while (blobHasher.fileReader_ && blobHasher.fileReader_.isLoading() &&
         counter <= maxReads) {
    blobHasher.fileReader_.mockLoad();
    counter++;
  }
  assertTrue(counter <= maxReads);
  return counter;
}

function testBasicOperations() {
  if (!window.Blob) {
    return;
  }

  // Test hashing with one chunk.
  var hashFn = new goog.crypt.Md5();
  var blobHasher = new goog.crypt.BlobHasher(hashFn);
  var blob = new BlobMock('The quick brown fox jumps over the lazy dog');
  blobHasher.hash(blob);
  readFromBlob(blobHasher, 1);
  assertEquals('9e107d9d372bb6826bd81d3542a419d6',
               goog.crypt.byteArrayToHex(blobHasher.getHash()));

  // Test hashing with multiple chunks.
  blobHasher = new goog.crypt.BlobHasher(hashFn, 7);
  blobHasher.hash(blob);
  readFromBlob(blobHasher, Math.ceil(blob.size / 7));
  assertEquals('9e107d9d372bb6826bd81d3542a419d6',
               goog.crypt.byteArrayToHex(blobHasher.getHash()));

  // Test hashing with no chunks.
  blob = new BlobMock('');
  blobHasher.hash(blob);
  readFromBlob(blobHasher, 1);
  assertEquals('d41d8cd98f00b204e9800998ecf8427e',
               goog.crypt.byteArrayToHex(blobHasher.getHash()));

}

function testNormalFlow() {
  if (!window.Blob) {
    return;
  }

  // Test the flow with one chunk.
  var hashFn = new goog.crypt.Md5();
  var blobHasher = new goog.crypt.BlobHasher(hashFn, 13);
  var blob = new BlobMock('short');
  var startedEvents = 0;
  var progressEvents = 0;
  var completeEvents = 0;
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.STARTED,
                     function() { ++startedEvents; });
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.PROGRESS,
                     function() { ++progressEvents; });
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.COMPLETE,
                     function() { ++completeEvents; });
  blobHasher.hash(blob);
  assertEquals(1, startedEvents);
  assertEquals(0, progressEvents);
  assertEquals(0, completeEvents);
  readFromBlob(blobHasher, 1);
  assertEquals(1, startedEvents);
  assertEquals(1, progressEvents);
  assertEquals(1, completeEvents);

  // Test the flow with multiple chunks.
  blob = new BlobMock('The quick brown fox jumps over the lazy dog');
  startedEvents = 0;
  progressEvents = 0;
  completeEvents = 0;
  var progressLoops = 0;
  blobHasher.hash(blob);
  assertEquals(1, startedEvents);
  assertEquals(0, progressEvents);
  assertEquals(0, completeEvents);
  progressLoops = readFromBlob(blobHasher, Math.ceil(blob.size / 13));
  assertEquals(1, startedEvents);
  assertEquals(progressLoops, progressEvents);
  assertEquals(1, completeEvents);
}

function testAbortsAndErrors() {
  if (!window.Blob) {
    return;
  }

  var hashFn = new goog.crypt.Md5();
  var blobHasher = new goog.crypt.BlobHasher(hashFn, 13);
  var blob = new BlobMock('The quick brown fox jumps over the lazy dog');
  var abortEvents = 0;
  var errorEvents = 0;
  var completeEvents = 0;
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.ABORT,
                     function() { ++abortEvents; });
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.ERROR,
                     function() { ++errorEvents; });
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.COMPLETE,
                     function() { ++completeEvents; });

  // Immediate abort.
  blobHasher.hash(blob);
  assertEquals(0, abortEvents);
  assertEquals(0, errorEvents);
  assertEquals(0, completeEvents);
  blobHasher.abort();
  blobHasher.abort();
  assertEquals(1, abortEvents);
  assertEquals(0, errorEvents);
  assertEquals(0, completeEvents);
  abortEvents = 0;

  // Delayed abort.
  blobHasher.hash(blob);
  blobHasher.fileReader_.mockLoad();
  assertEquals(0, abortEvents);
  assertEquals(0, errorEvents);
  assertEquals(0, completeEvents);
  blobHasher.abort();
  blobHasher.abort();
  assertEquals(1, abortEvents);
  assertEquals(0, errorEvents);
  assertEquals(0, completeEvents);
  abortEvents = 0;

  // Immediate error.
  blobHasher.hash(blob);
  blobHasher.fileReader_.mockError();
  assertEquals(0, abortEvents);
  assertEquals(1, errorEvents);
  assertEquals(0, completeEvents);
  errorEvents = 0;

  // Delayed error.
  blobHasher.hash(blob);
  blobHasher.fileReader_.mockLoad();
  blobHasher.fileReader_.mockError();
  assertEquals(0, abortEvents);
  assertEquals(1, errorEvents);
  assertEquals(0, completeEvents);
  abortEvents = 0;

}

function testBasicThrottling() {
  if (!window.Blob) {
    return;
  }

  var hashFn = new goog.crypt.Md5();
  var blobHasher = new goog.crypt.BlobHasher(hashFn, 5);
  var blob = new BlobMock('The quick brown fox jumps over the lazy dog');
  var throttledEvents = 0;
  var completeEvents = 0;
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.THROTTLED,
                     function() { ++throttledEvents; });
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.COMPLETE,
                     function() { ++completeEvents; });

  // Start a throttled hash. No chunks should be processed yet.
  blobHasher.setHashingLimit(0);
  assertEquals(0, throttledEvents);
  blobHasher.hash(blob);
  assertEquals(1, throttledEvents);
  assertEquals(0, blobHasher.getBytesProcessed());
  assertNull(blobHasher.fileReader_);

  // One chunk should be processed.
  blobHasher.setHashingLimit(4);
  assertEquals(1, throttledEvents);
  assertEquals(1, readFromBlob(blobHasher, 1));
  assertEquals(2, throttledEvents);
  assertEquals(4, blobHasher.getBytesProcessed());

  // One more chunk should be processed.
  blobHasher.setHashingLimit(5);
  assertEquals(2, throttledEvents);
  assertEquals(1, readFromBlob(blobHasher, 1));
  assertEquals(3, throttledEvents);
  assertEquals(5, blobHasher.getBytesProcessed());

  // Two more chunks should be processed.
  blobHasher.setHashingLimit(15);
  assertEquals(3, throttledEvents);
  assertEquals(2, readFromBlob(blobHasher, 2));
  assertEquals(4, throttledEvents);
  assertEquals(15, blobHasher.getBytesProcessed());

  // The entire blob should be processed.
  blobHasher.setHashingLimit(Infinity);
  var expectedChunks = Math.ceil(blob.size / 5) - 3;
  assertEquals(expectedChunks, readFromBlob(blobHasher, expectedChunks));
  assertEquals(4, throttledEvents);
  assertEquals(1, completeEvents);
  assertEquals('9e107d9d372bb6826bd81d3542a419d6',
               goog.crypt.byteArrayToHex(blobHasher.getHash()));
}

function testLengthZeroThrottling() {
  if (!window.Blob) {
    return;
  }

  var hashFn = new goog.crypt.Md5();
  var blobHasher = new goog.crypt.BlobHasher(hashFn);
  var throttledEvents = 0;
  var completeEvents = 0;
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.THROTTLED,
                     function() { ++throttledEvents; });
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.COMPLETE,
                     function() { ++completeEvents; });

  // Test throttling with length 0 blob.
  var blob = new BlobMock('');
  blobHasher.setHashingLimit(0);
  blobHasher.hash(blob);
  assertEquals(0, throttledEvents);
  assertEquals(1, completeEvents);
  assertEquals('d41d8cd98f00b204e9800998ecf8427e',
               goog.crypt.byteArrayToHex(blobHasher.getHash()));
}

function testAbortsAndErrorsWhileThrottling() {
  if (!window.Blob) {
    return;
  }

  var hashFn = new goog.crypt.Md5();
  var blobHasher = new goog.crypt.BlobHasher(hashFn, 5);
  var blob = new BlobMock('The quick brown fox jumps over the lazy dog');
  var abortEvents = 0;
  var errorEvents = 0;
  var throttledEvents = 0;
  var completeEvents = 0;
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.ABORT,
                     function() { ++abortEvents; });
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.ERROR,
                     function() { ++errorEvents; });
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.THROTTLED,
                     function() { ++throttledEvents; });
  goog.events.listen(blobHasher, goog.crypt.BlobHasher.EventType.COMPLETE,
                     function() { ++completeEvents; });

  // Test that processing cannot be continued after abort.
  blobHasher.setHashingLimit(0);
  blobHasher.hash(blob);
  assertEquals(1, throttledEvents);
  blobHasher.abort();
  assertEquals(1, abortEvents);
  blobHasher.setHashingLimit(10);
  assertNull(blobHasher.fileReader_);
  assertEquals(1, throttledEvents);
  assertEquals(0, completeEvents);
  assertNull(blobHasher.getHash());

  // Test that processing cannot be continued after error.
  blobHasher.hash(blob);
  assertEquals(1, throttledEvents);
  blobHasher.fileReader_.mockError();
  assertEquals(1, errorEvents);
  blobHasher.setHashingLimit(100);
  assertNull(blobHasher.fileReader_);
  assertEquals(1, throttledEvents);
  assertEquals(0, completeEvents);
  assertNull(blobHasher.getHash());
}
