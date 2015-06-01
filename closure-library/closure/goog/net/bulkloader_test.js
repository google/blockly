// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.net.BulkLoaderTest');
goog.setTestOnly('goog.net.BulkLoaderTest');

goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.net.BulkLoader');
goog.require('goog.net.EventType');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');


/**
 * Test interval between sending uri requests to the server.
 */
var DELAY_INTERVAL_BETWEEN_URI_REQUESTS = 5;


/**
 * Test interval before a response is received for a URI request.
 */
var DELAY_INTERVAL_FOR_URI_LOAD = 15;

var clock;
var loadSuccess, loadError;
var successResponseTexts;

function setUpPage() {
  clock = new goog.testing.MockClock(true);
}

function tearDownPage() {
  clock.dispose();
}

function setUp() {
  loadSuccess = false;
  loadError = false;
  successResponseTexts = [];
}


/**
 * Gets the successful bulkloader for the specified uris with some
 * modifications for testability.
 * <ul>
 *   <li> Added onSuccess methods to simulate success while loading uris.
 *   <li> The send function of the XhrManager used by the bulkloader
 *        calls the onSuccess function after a specified time interval.
 * </ul>
 * @param {Array<string>} uris The URIs.
 */
function getSuccessfulBulkLoader(uris) {
  var bulkLoader = new goog.net.BulkLoader(uris);
  bulkLoader.load = function() {
    var uris = this.helper_.getUris();
    for (var i = 0; i < uris.length; i++) {
      // This clock tick simulates a delay for processing every URI.
      clock.tick(DELAY_INTERVAL_BETWEEN_URI_REQUESTS);
      // This timeout determines how many ticks after the send request
      // all the URIs will complete loading. This delays the load of
      // the first uri and every subsequent uri by 15 ticks.
      setTimeout(goog.bind(this.onSuccess, this, i, uris[i]),
          DELAY_INTERVAL_FOR_URI_LOAD);
    }
  };

  bulkLoader.onSuccess = function(id, uri) {
    var xhrIo = {
      getResponseText: function() {return uri;},
      isSuccess: function() {return true;},
      dispose: function() {}
    };
    this.handleEvent_(id, new goog.events.Event(
        goog.net.EventType.COMPLETE, xhrIo));
  };

  var eventHandler = new goog.events.EventHandler();
  eventHandler.listen(bulkLoader,
      goog.net.EventType.SUCCESS,
      handleSuccess);
  eventHandler.listen(bulkLoader,
      goog.net.EventType.ERROR,
      handleError);

  return bulkLoader;
}


/**
 * Gets the non-successful bulkloader for the specified uris with some
 * modifications for testability.
 * <ul>
 *   <li> Added onSuccess and onError methods to simulate success and error
 *        while loading uris.
 *   <li> The send function of the XhrManager used by the bulkloader
 *        calls the onSuccess or onError function after a specified time
 *        interval.
 * </ul>
 * @param {Array<string>} uris The URIs.
 */
function getNonSuccessfulBulkLoader(uris) {
  var bulkLoader = new goog.net.BulkLoader(uris);
  bulkLoader.load = function() {
    var uris = this.helper_.getUris();
    for (var i = 0; i < uris.length; i++) {
      // This clock tick simulates a delay for processing every URI.
      clock.tick(DELAY_INTERVAL_BETWEEN_URI_REQUESTS);

      // This timeout determines how many ticks after the send request
      // all the URIs will complete loading in error. This delays the load
      // of the first uri and every subsequent uri by 15 ticks. The URI
      // with id == 2 is in error.
      if (i != 2) {
        setTimeout(goog.bind(this.onSuccess, this, i, uris[i]),
            DELAY_INTERVAL_FOR_URI_LOAD);
      } else {
        setTimeout(goog.bind(this.onError, this, i, uris[i]),
            DELAY_INTERVAL_FOR_URI_LOAD);
      }
    }
  };

  bulkLoader.onSuccess = function(id, uri) {
    var xhrIo = {
      getResponseText: function() {return uri;},
      isSuccess: function() {return true;},
      dispose: function() {}
    };
    this.handleEvent_(id, new goog.events.Event(
        goog.net.EventType.COMPLETE, xhrIo));
  };

  bulkLoader.onError = function(id) {
    var xhrIo = {
      getResponseText: function() {return null;},
      isSuccess: function() {return false;},
      dispose: function() {}
    };
    this.handleEvent_(id, new goog.events.Event(
        goog.net.EventType.ERROR, xhrIo));
  };

  var eventHandler = new goog.events.EventHandler();
  eventHandler.listen(bulkLoader,
      goog.net.EventType.SUCCESS,
      handleSuccess);
  eventHandler.listen(bulkLoader,
      goog.net.EventType.ERROR,
      handleError);

  return bulkLoader;
}

function handleSuccess(e) {
  loadSuccess = true;
  successResponseTexts = e.target.getResponseTexts();
}

function handleError(e) {
  loadError = true;
}


/**
 * Test successful loading of URIs using the bulkloader.
 */
function testBulkLoaderLoadSuccess() {
  var uris = ['a', 'b', 'c'];
  var bulkLoader = getSuccessfulBulkLoader(uris);
  assertArrayEquals(uris, bulkLoader.getRequestUris());

  bulkLoader.load();

  clock.tick(2);
  assertFalse(
      'The bulk loader is not yet loaded (after 2 ticks)', loadSuccess);

  clock.tick(3);
  assertFalse(
      'The bulk loader is not yet loaded (after 5 ticks)', loadSuccess);

  clock.tick(5);
  assertFalse(
      'The bulk loader is not yet loaded (after 10 ticks)', loadSuccess);

  clock.tick(5);
  assertTrue('The bulk loader is loaded (after 15 ticks)', loadSuccess);

  assertArrayEquals('Ensure that the response texts are present',
      successResponseTexts, uris);
}


/**
 * Test error loading URIs using the bulkloader.
 */
function testBulkLoaderLoadError() {
  var uris = ['a', 'b', 'c'];
  var bulkLoader = getNonSuccessfulBulkLoader(uris);

  bulkLoader.load();

  clock.tick(2);
  assertFalse(
      'The bulk loader is not yet loaded (after 2 ticks)', loadError);

  clock.tick(3);
  assertFalse(
      'The bulk loader is not yet loaded (after 5 ticks)', loadError);

  clock.tick(5);
  assertFalse(
      'The bulk loader is not yet loaded (after 10 ticks)', loadError);

  clock.tick(5);
  assertFalse(
      'The bulk loader is not loaded successfully (after 15 ticks)',
      loadSuccess);
  assertTrue(
      'The bulk loader is loaded in error (after 15 ticks)', loadError);
}
