// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.net.streams.XhrNodeReadableStreamTest');
goog.setTestOnly('goog.net.streams.XhrNodeReadableStreamTest');

goog.require('goog.net.streams.NodeReadableStream');
goog.require('goog.net.streams.XhrNodeReadableStream');
goog.require('goog.net.streams.XhrStreamReader');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');


var xhrReader;
var xhrStream;

var EventType = goog.net.streams.NodeReadableStream.EventType;
var Status = goog.net.streams.XhrStreamReader.Status;

var propertyReplacer;



/**
 * Constructs a duck-type XhrStreamReader to simulate xhr events.
 * @constructor
 * @struct
 * @final
 */
function MockXhrStreamReader() {
  // mocked API

  this.setStatusHandler = function(handler) { this.statusHandler_ = handler; };

  this.setDataHandler = function(handler) { this.dataHandler_ = handler; };

  this.getStatus = function() { return this.status_; };

  // simulated events

  this.onData = function(messages) { this.dataHandler_(messages); };

  this.onStatus = function(status) {
    this.status_ = status;
    this.statusHandler_();
  };
}


function setUp() {
  xhrReader = new MockXhrStreamReader();
  xhrStream = new goog.net.streams.XhrNodeReadableStream(xhrReader);

  propertyReplacer = new goog.testing.PropertyReplacer();
  propertyReplacer.replace(xhrStream, 'handleError_', function(message) {
    // the real XhrNodeReadableStream class ignores any error thrown
    // from inside a callback function, but we want to see those assert
    // errors thrown by the test callback function installed by unit tests
    fail(message);
  });
}


function tearDown() {
  propertyReplacer.reset();
}


function testOneDataCallback() {
  var delivered = false;

  var callback = function(message) {
    delivered = true;
    assertEquals('a', message.a);
  };

  xhrStream.on(EventType.DATA, callback);

  xhrReader.onData([{a: 'a'}]);
  assertTrue(delivered);
}


function testMultipleDataCallbacks() {
  var delivered = 0;

  var callback = function(message) {
    delivered++;
    assertEquals('a', message.a);
  };

  xhrStream.on(EventType.DATA, callback);
  xhrStream.on(EventType.DATA, callback);

  xhrReader.onData([{a: 'a'}]);
  assertEquals(2, delivered);
}


function testOrderedDataCallbacks() {
  var delivered = 0;

  var callback1 = function(message) {
    assertEquals(0, delivered++);
    assertEquals('a', message.a);
  };

  var callback2 = function(message) {
    assertEquals(1, delivered++);
    assertEquals('a', message.a);
  };

  xhrStream.on(EventType.DATA, callback1);
  xhrStream.on(EventType.DATA, callback2);

  xhrReader.onData([{a: 'a'}]);
  assertEquals(2, delivered);
}


function testMultipleMessagesCallbacks() {
  var delivered = 0;

  var callback1 = function(message) {
    if (message.a) {
      assertEquals(0, delivered++);
      assertEquals('a', message.a);
    } else if (message.b) {
      assertEquals(2, delivered++);
      assertEquals('b', message.b);
    } else {
      fail('unexpected message');
    }
  };

  var callback2 = function(message) {
    if (message.a) {
      assertEquals(1, delivered++);
      assertEquals('a', message.a);
    } else if (message.b) {
      assertEquals(3, delivered++);
      assertEquals('b', message.b);
    } else {
      fail('unexpected message');
    }
  };

  xhrStream.on(EventType.DATA, callback1);
  xhrStream.on(EventType.DATA, callback2);

  xhrReader.onData([{a: 'a'}, {b: 'b'}]);
  assertEquals(4, delivered);
}


function testMultipleMessagesWithOnceCallbacks() {
  var delivered = 0;

  var callback1 = function(message) {
    if (message.a) {
      assertEquals(0, delivered++);
      assertEquals('a', message.a);
    } else if (message.b) {
      assertEquals(1, delivered++);
      assertEquals('b', message.b);
    } else if (message.c) {
      assertEquals(4, delivered++);
      assertEquals('c', message.c);
    } else {
      fail('unexpected message');
    }
  };

  var callback2 = function(message) {
    if (message.a) {
      assertEquals(2, delivered++);
      assertEquals('a', message.a);
    } else if (message.b) {
      assertEquals(3, delivered++);
      assertEquals('b', message.b);
    } else {
      fail('unexpected message');
    }
  };

  xhrStream.on(EventType.DATA, callback1);
  xhrStream.once(EventType.DATA, callback2);

  xhrReader.onData([{a: 'a'}, {b: 'b'}]);
  assertEquals(4, delivered);

  xhrReader.onData([{c: 'c'}]);
  assertEquals(5, delivered);
}


function testMultipleMessagesWithRemovedCallbacks() {
  var delivered = 0;

  var callback1 = function(message) {
    if (message.a) {
      assertEquals(0, delivered++);
      assertEquals('a', message.a);
    } else if (message.c) {
      assertEquals(3, delivered++);
      assertEquals('c', message.c);
    } else {
      fail('unexpected message');
    }
  };

  var callback2 = function(message) {
    if (message.a) {
      assertEquals(1, delivered++);
      assertEquals('a', message.a);
    } else if (message.b) {
      assertEquals(2, delivered++);
      assertEquals('b', message.b);
    } else {
      fail('unexpected message');
    }
  };

  xhrStream.on(EventType.DATA, callback1);
  xhrStream.once(EventType.DATA, callback2);

  xhrReader.onData([{a: 'a'}]);
  assertEquals(2, delivered);

  xhrStream.removeListener(EventType.DATA, callback1);
  xhrStream.once(EventType.DATA, callback2);

  xhrReader.onData([{b: 'b'}]);
  assertEquals(3, delivered);

  xhrStream.on(EventType.DATA, callback1);
  xhrStream.once(EventType.DATA, callback2);
  xhrStream.removeListener(EventType.DATA, callback2);

  xhrReader.onData([{c: 'c'}]);
  assertEquals(4, delivered);

  xhrStream.removeListener(EventType.DATA, callback1);
  xhrReader.onData([{d: 'd'}]);
  assertEquals(4, delivered);
}


function testOrderedStatusCallbacks() {
  checkStatusMapping(Status.ACTIVE, EventType.READABLE);

  checkStatusMapping(Status.BAD_DATA, EventType.ERROR);
  checkStatusMapping(Status.HANDLER_EXCEPTION, EventType.ERROR);
  checkStatusMapping(Status.NO_DATA, EventType.ERROR);
  checkStatusMapping(Status.TIMEOUT, EventType.ERROR);
  checkStatusMapping(Status.XHR_ERROR, EventType.ERROR);

  checkStatusMapping(Status.CANCELLED, EventType.CLOSE);

  checkStatusMapping(Status.SUCCESS, EventType.END);

  function checkStatusMapping(status, event) {
    var delivered = 0;

    var callback1 = function() {
      if (delivered == 0) {
        delivered++;
      } else if (delivered == 2) {
        delivered++;
      } else {
        fail('unexpected status change');
      }
      assertEquals(status, xhrReader.getStatus());
    };

    var callback2 = function() {
      assertEquals(1, delivered++);
      assertEquals(status, xhrReader.getStatus());
    };

    xhrStream.on(event, callback1);
    xhrStream.once(event, callback2);

    xhrReader.onStatus(status);
    assertEquals(2, delivered);

    xhrReader.onStatus(status);
    assertEquals(3, delivered);

    xhrStream.removeListener(event, callback1);

    xhrReader.onStatus(status);
    assertEquals(3, delivered);
  }
}


function testOrderedStatusMultipleCallbacks() {
  checkStatusMapping(Status.ACTIVE, EventType.READABLE);

  function checkStatusMapping(status, event) {
    var delivered = 0;

    var callback1 = function() {
      if (delivered == 0) {
        delivered++;
      } else if (delivered == 2) {
        delivered++;
      } else if (delivered == 4) {
        delivered++;
      } else {
        fail('unexpected status change');
      }
      assertEquals(status, xhrReader.getStatus());
    };

    var callback2 = function() {
      if (delivered == 1) {
        delivered++;
      } else if (delivered == 3) {
        delivered++;
      } else if (delivered == 5) {
        delivered++;
      } else if (delivered == 6) {
        delivered++;
      } else {
        fail('unexpected status change');
      }
      assertEquals(status, xhrReader.getStatus());
    };

    xhrStream.on(event, callback1);
    xhrStream.on(event, callback2);

    xhrStream.once(event, callback1);
    xhrStream.once(event, callback2);

    xhrReader.onStatus(status);
    assertEquals(4, delivered);

    xhrReader.onStatus(status);
    assertEquals(6, delivered);

    xhrStream.removeListener(event, callback1);

    xhrReader.onStatus(status);
    assertEquals(7, delivered);
  }
}
