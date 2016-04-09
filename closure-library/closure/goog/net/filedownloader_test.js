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

goog.provide('goog.net.FileDownloaderTest');
goog.setTestOnly('goog.net.FileDownloaderTest');

goog.require('goog.fs.Error');
goog.require('goog.net.ErrorCode');
goog.require('goog.net.FileDownloader');
goog.require('goog.net.XhrIo');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.fs');
goog.require('goog.testing.fs.FileSystem');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.net.XhrIoPool');

var xhrIoPool, xhr, fs, dir, downloader;

function setUpPage() {
  goog.testing.fs.install(new goog.testing.PropertyReplacer());
  goog.testing.TestCase.getActiveTestCase().promiseTimeout = 10000;  // 10s
}

function setUp() {
  xhrIoPool = new goog.testing.net.XhrIoPool();
  xhr = xhrIoPool.getXhr();
  fs = new goog.testing.fs.FileSystem();
  dir = fs.getRoot();
  downloader = new goog.net.FileDownloader(dir, xhrIoPool);
}

function tearDown() {
  goog.dispose(downloader);
}

function testDownload() {
  var promise = downloader.download('/foo/bar').then(function(blob) {
    var fileEntry = dir.getFileSync('`3fa/``2Ffoo`2Fbar/`bar');
    assertEquals('data', blob.toString());
    assertEquals('data', fileEntry.fileSync().toString());
  });

  xhr.simulateResponse(200, 'data');
  assertEquals('/foo/bar', xhr.getLastUri());
  assertEquals(goog.net.XhrIo.ResponseType.ARRAY_BUFFER, xhr.getResponseType());

  return promise;
}

function testGetDownloadedBlob() {
  var promise =
      downloader.download('/foo/bar')
          .then(function() { return downloader.getDownloadedBlob('/foo/bar'); })
          .then(function(blob) { assertEquals('data', blob.toString()); });

  xhr.simulateResponse(200, 'data');
  return promise;
}

function testGetLocalUrl() {
  var promise =
      downloader.download('/foo/bar')
          .then(function() { return downloader.getLocalUrl('/foo/bar'); })
          .then(function(url) { assertMatches(/\/`bar$/, url); });

  xhr.simulateResponse(200, 'data');
  return promise;
}

function testLocalUrlWithContentDisposition() {
  var promise =
      downloader.download('/foo/bar')
          .then(function() { return downloader.getLocalUrl('/foo/bar'); })
          .then(function(url) { assertMatches(/\/`qux`22bap$/, url); });

  xhr.simulateResponse(
      200, 'data', {'Content-Disposition': 'attachment; filename="qux\\"bap"'});
  return promise;
}

function testIsDownloaded() {
  var promise =
      downloader.download('/foo/bar')
          .then(function() { return downloader.isDownloaded('/foo/bar'); })
          .then(assertTrue)
          .then(function(isDownloaded) {
            return downloader.isDownloaded('/foo/baz');
          })
          .then(assertFalse);

  xhr.simulateResponse(200, 'data');
  return promise;
}

function testRemove() {
  var promise =
      downloader.download('/foo/bar')
          .then(function() { return downloader.remove('/foo/bar'); })
          .then(function() { return downloader.isDownloaded('/foo/bar'); })
          .then(assertFalse)
          .then(function() { return downloader.getDownloadedBlob('/foo/bar'); })
          .then(
              function() {
                fail('Should not be able to download a missing blob.');
              },
              function(err) {
                assertEquals(goog.fs.Error.ErrorCode.NOT_FOUND, err.code);
                var download = downloader.download('/foo/bar');
                xhr.simulateResponse(200, 'more data');
                return download;
              })
          .then(function() { return downloader.isDownloaded('/foo/bar'); })
          .then(assertTrue)
          .then(function() { return downloader.getDownloadedBlob('/foo/bar'); })
          .then(function(blob) { assertEquals('more data', blob.toString()); });

  xhr.simulateResponse(200, 'data');
  return promise;
}

function testSetBlob() {
  return downloader.setBlob('/foo/bar', goog.testing.fs.getBlob('data'))
      .then(function() { return downloader.isDownloaded('/foo/bar'); })
      .then(assertTrue)
      .then(function() { return downloader.getDownloadedBlob('/foo/bar'); })
      .then(function(blob) { assertEquals('data', blob.toString()); });
}

function testSetBlobWithName() {
  return downloader.setBlob('/foo/bar', goog.testing.fs.getBlob('data'), 'qux')
      .then(function() { return downloader.getLocalUrl('/foo/bar'); })
      .then(function(url) { assertMatches(/\/`qux$/, url); });
}
function testDownloadDuringDownload() {
  var download1 = downloader.download('/foo/bar');
  var download2 = downloader.download('/foo/bar');

  var promise =
      download1.then(function() { return download2; })
          .then(function() { return downloader.getDownloadedBlob('/foo/bar'); })
          .then(function(blob) { assertEquals('data', blob.toString()); });

  // There should only need to be one response for both downloads, since the
  // second should return the same deferred as the first.
  xhr.simulateResponse(200, 'data');
  return promise;
}

function testGetDownloadedBlobDuringDownload() {
  var hasDownloaded = false;
  downloader.download('/foo/bar').then(function() { hasDownloaded = true; });

  var promise =
      downloader.waitForDownload('/foo/bar')
          .then(function() { return downloader.getDownloadedBlob('/foo/bar'); })
          .then(function(blob) {
            assertTrue(hasDownloaded);
            assertEquals('data', blob.toString());
          });

  xhr.simulateResponse(200, 'data');
  return promise;
}


function testIsDownloadedDuringDownload() {
  var hasDownloaded = false;
  downloader.download('/foo/bar').then(function() { hasDownloaded = true; });

  var promise =
      downloader.waitForDownload('/foo/bar')
          .then(function() { return downloader.isDownloaded('/foo/bar'); })
          .then(assertTrue);

  xhr.simulateResponse(200, 'data');
  return promise;
}

function testRemoveDuringDownload() {
  var hasDownloaded = false;
  downloader.download('/foo/bar').then(function() { hasDownloaded = true; });

  var promise =
      downloader.waitForDownload('/foo/bar')
          .then(function() { return downloader.remove('/foo/bar'); })
          .then(function() { assertTrue(hasDownloaded); })
          .then(function() { return downloader.isDownloaded('/foo/bar'); })
          .then(assertFalse);

  xhr.simulateResponse(200, 'data');
  return promise;
}

function testSetBlobDuringDownload() {
  var download = downloader.download('/foo/bar');

  var promise =
      downloader.waitForDownload('/foo/bar')
          .then(function() {
            return downloader.setBlob(
                '/foo/bar', goog.testing.fs.getBlob('blob data'));
          })
          .then(
              function() {
                fail('Should not be able to set blob during a download.');
              },
              function(err) {
                assertEquals(
                    goog.fs.Error.ErrorCode.INVALID_MODIFICATION,
                    err.fileError.code);
                return download;
              })
          .then(function() { return downloader.getDownloadedBlob('/foo/bar'); })
          .then(function(b) { assertEquals('xhr data', b.toString()); });

  xhr.simulateResponse(200, 'xhr data');
  return promise;
}

function testDownloadCanceledBeforeXhr() {
  var download = downloader.download('/foo/bar');

  var promise =
      download
          .then(
              function() { fail('Download should have been canceled.'); },
              function() {
                assertEquals('/foo/bar', xhr.getLastUri());
                assertEquals(goog.net.ErrorCode.ABORT, xhr.getLastErrorCode());
                assertFalse(xhr.isActive());

                return downloader.isDownloaded('/foo/bar');
              })
          .then(assertFalse);

  download.cancel();
  return promise;
}

function testDownloadCanceledAfterXhr() {
  var download = downloader.download('/foo/bar');
  xhr.simulateResponse(200, 'data');
  download.cancel();

  return download
      .then(
          function() { fail('Should not succeed after cancellation.'); },
          function() {
            assertEquals('/foo/bar', xhr.getLastUri());
            assertEquals(goog.net.ErrorCode.NO_ERROR, xhr.getLastErrorCode());
            assertFalse(xhr.isActive());

            return downloader.isDownloaded('/foo/bar');
          })
      .then(assertFalse);
}

function testFailedXhr() {
  var promise =
      downloader.download('/foo/bar')
          .then(
              function() { fail('Download should not have succeeded.'); },
              function(err) {
                assertEquals('/foo/bar', err.url);
                assertEquals(404, err.xhrStatus);
                assertEquals(goog.net.ErrorCode.HTTP_ERROR, err.xhrErrorCode);
                assertUndefined(err.fileError);

                return downloader.isDownloaded('/foo/bar');
              })
          .then(assertFalse);

  xhr.simulateResponse(404);
  return promise;
}

function testFailedDownloadSave() {
  var promise =
      downloader.download('/foo/bar')
          .then(function() {
            var download = downloader.download('/foo/bar');
            xhr.simulateResponse(200, 'data');
            return download;
          })
          .then(
              function() {
                fail('Should not be able to modify an active download.');
              },
              function(err) {
                assertEquals('/foo/bar', err.url);
                assertUndefined(err.xhrStatus);
                assertUndefined(err.xhrErrorCode);
                assertEquals(
                    goog.fs.Error.ErrorCode.INVALID_MODIFICATION,
                    err.fileError.code);
              });

  xhr.simulateResponse(200, 'data');
  return promise;
}

function testFailedGetDownloadedBlob() {
  return downloader.getDownloadedBlob('/foo/bar')
      .then(
          function() { fail('Should not be able to get a missing blob.'); },
          function(err) {
            assertEquals(goog.fs.Error.ErrorCode.NOT_FOUND, err.code);
          });
}

function testFailedRemove() {
  return downloader.remove('/foo/bar')
      .then(
          function() { fail('Should not be able to remove a missing file.'); },
          function(err) {
            assertEquals(goog.fs.Error.ErrorCode.NOT_FOUND, err.code);
          });
}

function testIsDownloading() {
  assertFalse(downloader.isDownloading('/foo/bar'));
  var promise = downloader.download('/foo/bar').then(function() {
    assertFalse(downloader.isDownloading('/foo/bar'));
  });

  assertTrue(downloader.isDownloading('/foo/bar'));
  xhr.simulateResponse(200, 'data');
  return promise;
}

function testIsDownloadingWhenCancelled() {
  assertFalse(downloader.isDownloading('/foo/bar'));
  var deferred = downloader.download('/foo/bar').addErrback(function() {
    assertFalse(downloader.isDownloading('/foo/bar'));
  });

  assertTrue(downloader.isDownloading('/foo/bar'));
  deferred.cancel();
}

function assertMatches(expected, actual) {
  assert(
      'Expected "' + actual + '" to match ' + expected, expected.test(actual));
}
