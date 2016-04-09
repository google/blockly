// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.labs.pubsub.BroadcastPubSubTest');
goog.setTestOnly('goog.labs.pubsub.BroadcastPubSubTest');


goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.json');
goog.require('goog.labs.pubsub.BroadcastPubSub');
goog.require('goog.storage.Storage');
goog.require('goog.structs.Map');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');
goog.require('goog.testing.mockmatchers.ArgumentMatcher');
goog.require('goog.testing.recordFunction');
goog.require('goog.userAgent');


/** @type {goog.labs.pubsub.BroadcastPubSub} */
var broadcastPubSub;


/** @type {goog.testing.MockControl} */
var mockControl;


/** @type {goog.testing.MockClock} */
var mockClock;


/** @type {goog.testing.MockInterface} */
var mockStorage;


/** @type {goog.testing.MockInterface} */
var mockStorageCtor;


/** @type {goog.structs.Map} */
var mockHtml5LocalStorage;


/** @type {goog.testing.MockInterface} */
var mockHTML5LocalStorageCtor;


/** @const {boolean} */
var isIe8 = goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE == 8;


/**
 * Sends a remote storage event with special handling for IE8. With IE8 an
 * event is pushed to the event queue stored in local storage as a result of
 * behaviour by the mockHtml5LocalStorage instanciated when using IE8 an event
 * is automatically generated in the local browser context. For other browsers
 * this simply creates a new browser event.
 * @param {{'args': !Array<string>, 'timestamp': number}} data Value stored
 *     in localStorage which generated the remote event.
 */
function remoteStorageEvent(data) {
  if (!isIe8) {
    var event = new goog.testing.events.Event('storage', window);
    event.key = goog.labs.pubsub.BroadcastPubSub.STORAGE_KEY_;
    event.newValue = goog.json.serialize(data);
    goog.testing.events.fireBrowserEvent(event);
  } else {
    var uniqueKey =
        goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_PREFIX_ + '1234567890';
    var ie8Events = mockHtml5LocalStorage.get(uniqueKey);
    if (goog.isDefAndNotNull(ie8Events)) {
      ie8Events = goog.json.parse(ie8Events);
      // Events should never overlap in IE8 mode.
      if (ie8Events.length > 0 &&
          ie8Events[ie8Events.length - 1]['timestamp'] >= data['timestamp']) {
        data['timestamp'] = ie8Events[ie8Events.length - 1]['timestamp'] +
            goog.labs.pubsub.BroadcastPubSub.IE8_TIMESTAMP_UNIQUE_OFFSET_MS_;
      }
    } else {
      ie8Events = [];
    }
    ie8Events.push(data);
    // This will cause an event.
    mockHtml5LocalStorage.set(uniqueKey, goog.json.serialize(ie8Events));
  }
}

function setUp() {
  mockControl = new goog.testing.MockControl();

  mockClock = new goog.testing.MockClock(true);
  // Time should never be 0...
  mockClock.tick();
  /** @suppress {missingRequire} */
  mockHTML5LocalStorageCtor = mockControl.createConstructorMock(
      goog.storage.mechanism, 'HTML5LocalStorage');

  mockHtml5LocalStorage = new goog.structs.Map();

  // The builtin localStorage returns null instead of undefined.
  var originalGetFn =
      goog.bind(mockHtml5LocalStorage.get, mockHtml5LocalStorage);
  mockHtml5LocalStorage.get = function(key) {
    var value = originalGetFn(key);
    if (!goog.isDef(value)) {
      return null;
    }
    return value;
  };
  mockHtml5LocalStorage.key = function(idx) {
    return mockHtml5LocalStorage.getKeys()[idx];
  };
  mockHtml5LocalStorage.isAvailable = function() { return true; };


  // IE has problems. IE9+ still dispatches storage events locally. IE8 also
  // doesn't include the key/value information. So for IE, everytime we get a
  // "set" on localStorage we simulate for the appropriate browser.
  if (goog.userAgent.IE) {
    var target = isIe8 ? document : window;
    var originalSetFn =
        goog.bind(mockHtml5LocalStorage.set, mockHtml5LocalStorage);
    mockHtml5LocalStorage.set = function(key, value) {
      originalSetFn(key, value);
      var event = new goog.testing.events.Event('storage', target);
      if (!isIe8) {
        event.key = key;
        event.newValue = value;
      }
      goog.testing.events.fireBrowserEvent(event);
    };
  }
}

function tearDown() {
  mockControl.$tearDown();
  mockClock.dispose();
  broadcastPubSub = undefined;
}


function testConstructor() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);
  assertNotNullNorUndefined(
      'BroadcastChannel instance must not be null', broadcastPubSub);
  assertTrue(
      'BroadcastChannel instance must have the expected type',
      broadcastPubSub instanceof goog.labs.pubsub.BroadcastPubSub);
  assertArrayEquals(
      goog.labs.pubsub.BroadcastPubSub.instances_, [broadcastPubSub]);
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
  assertNotNullNorUndefined(
      'Storage should not be undefined or null in broadcastPubSub.',
      broadcastPubSub.storage_);
  assertArrayEquals(goog.labs.pubsub.BroadcastPubSub.instances_, []);
}


function testConstructor_noLocalStorage() {
  mockHTML5LocalStorageCtor().$returns(
      {isAvailable: function() { return false; }});
  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);
  assertNotNullNorUndefined(
      'BroadcastChannel instance must not be null', broadcastPubSub);
  assertTrue(
      'BroadcastChannel instance must have the expected type',
      broadcastPubSub instanceof goog.labs.pubsub.BroadcastPubSub);
  assertArrayEquals(
      goog.labs.pubsub.BroadcastPubSub.instances_, [broadcastPubSub]);
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
  assertNull(
      'Storage should be null in broadcastPubSub.', broadcastPubSub.storage_);
  assertArrayEquals(goog.labs.pubsub.BroadcastPubSub.instances_, []);
}


/** Verify we cleanup after ourselves. */
function testDispose() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var mockStorage = mockControl.createLooseMock(goog.storage.Storage);

  var mockStorageCtor =
      mockControl.createConstructorMock(goog.storage, 'Storage');

  mockStorageCtor(mockHtml5LocalStorage).$returns(mockStorage);
  mockStorageCtor(mockHtml5LocalStorage).$returns(mockStorage);

  if (isIe8) {
    mockStorage.remove(goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_);
  }

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  var broadcastPubSubExtra = new goog.labs.pubsub.BroadcastPubSub();
  assertArrayEquals(
      goog.labs.pubsub.BroadcastPubSub.instances_,
      [broadcastPubSub, broadcastPubSubExtra]);

  assertFalse(
      'BroadcastChannel extra instance must not have been disposed of',
      broadcastPubSubExtra.isDisposed());
  broadcastPubSubExtra.dispose();
  assertTrue(
      'BroadcastChannel extra instance must have been disposed of',
      broadcastPubSubExtra.isDisposed());
  assertFalse(
      'BroadcastChannel instance must not have been disposed of',
      broadcastPubSub.isDisposed());

  assertArrayEquals(
      goog.labs.pubsub.BroadcastPubSub.instances_, [broadcastPubSub]);
  assertFalse(
      'BroadcastChannel instance must not have been disposed of',
      broadcastPubSub.isDisposed());
  broadcastPubSub.dispose();
  assertTrue(
      'BroadcastChannel instance must have been disposed of',
      broadcastPubSub.isDisposed());
  assertArrayEquals(goog.labs.pubsub.BroadcastPubSub.instances_, []);
  mockControl.$verifyAll();
}


/**
 * Tests related to remote events that an instance of BroadcastChannel
 * should handle.
 */
function testHandleRemoteEvent() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var foo = mockControl.createFunctionMock();
  foo('x', 'y').$times(2);

  var context = {'foo': 'bar'};
  var bar = goog.testing.recordFunction();

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);
  var eventData = {'args': ['someTopic', 'x', 'y'], 'timestamp': goog.now()};

  broadcastPubSub.subscribe('someTopic', foo);
  broadcastPubSub.subscribe('someTopic', bar, context);

  remoteStorageEvent(eventData);
  mockClock.tick();

  assertEquals(1, bar.getCallCount());
  assertEquals(context, bar.getLastCall().getThis());
  assertArrayEquals(['x', 'y'], bar.getLastCall().getArguments());

  broadcastPubSub.unsubscribe('someTopic', foo);
  eventData['timestamp'] = goog.now();
  remoteStorageEvent(eventData);
  mockClock.tick();

  assertEquals(2, bar.getCallCount());
  assertEquals(context, bar.getLastCall().getThis());
  assertArrayEquals(['x', 'y'], bar.getLastCall().getArguments());

  broadcastPubSub.subscribe('someTopic', foo);
  broadcastPubSub.unsubscribe('someTopic', bar, context);
  eventData['timestamp'] = goog.now();
  remoteStorageEvent(eventData);
  mockClock.tick();

  assertEquals(2, bar.getCallCount());
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testHandleRemoteEventSubscribeOnce() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var foo = mockControl.createFunctionMock();
  foo('x', 'y');

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  broadcastPubSub.subscribeOnce('someTopic', foo);
  assertEquals(
      'BroadcastChannel must have one subscriber', 1,
      broadcastPubSub.getCount());

  remoteStorageEvent(
      {'args': ['someTopic', 'x', 'y'], 'timestamp': goog.now()});
  mockClock.tick();

  assertEquals(
      'BroadcastChannel must have no subscribers after receiving the event', 0,
      broadcastPubSub.getCount());
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testHandleQueuedRemoteEvents() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var foo = mockControl.createFunctionMock();
  var bar = mockControl.createFunctionMock();

  foo('x', 'y');
  bar('d', 'c');

  mockControl.$replayAll();

  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);
  broadcastPubSub.subscribe('fooTopic', foo);
  broadcastPubSub.subscribe('barTopic', bar);

  var eventData = {'args': ['fooTopic', 'x', 'y'], 'timestamp': goog.now()};
  remoteStorageEvent(eventData);

  eventData = {'args': ['barTopic', 'd', 'c'], 'timestamp': goog.now()};
  remoteStorageEvent(eventData);
  mockClock.tick();

  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testHandleRemoteEventsUnsubscribe() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var foo = mockControl.createFunctionMock();
  var bar = mockControl.createFunctionMock();

  foo('x', 'y').$does(function() {
    broadcastPubSub.unsubscribe('barTopic', bar);
  });

  mockControl.$replayAll();

  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);
  broadcastPubSub.subscribe('fooTopic', foo);
  broadcastPubSub.subscribe('barTopic', bar);

  var eventData = {'args': ['fooTopic', 'x', 'y'], 'timestamp': goog.now()};
  remoteStorageEvent(eventData);
  mockClock.tick();

  eventData = {'args': ['barTopic', 'd', 'c'], 'timestamp': goog.now()};
  remoteStorageEvent(eventData);
  mockClock.tick();

  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testHandleRemoteEventsCalledOnce() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var foo = mockControl.createFunctionMock();
  foo('x', 'y');

  mockControl.$replayAll();

  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);
  broadcastPubSub.subscribeOnce('someTopic', foo);

  var eventData = {'args': ['someTopic', 'x', 'y'], 'timestamp': goog.now()};
  remoteStorageEvent(eventData);
  mockClock.tick();

  eventData = {'args': ['someTopic', 'x', 'y'], 'timestamp': goog.now()};
  remoteStorageEvent(eventData);
  mockClock.tick();

  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testHandleRemoteEventNestedPublish() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var foo1 = mockControl.createFunctionMock();
  foo1().$does(function() {
    remoteStorageEvent({'args': ['bar'], 'timestamp': goog.now()});
  });
  var foo2 = mockControl.createFunctionMock();
  foo2();
  var bar1 = mockControl.createFunctionMock();
  bar1().$does(function() { broadcastPubSub.publish('baz'); });
  var bar2 = mockControl.createFunctionMock();
  bar2();
  var baz1 = mockControl.createFunctionMock();
  baz1();
  var baz2 = mockControl.createFunctionMock();
  baz2();

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  broadcastPubSub.subscribe('foo', foo1);
  broadcastPubSub.subscribe('foo', foo2);
  broadcastPubSub.subscribe('bar', bar1);
  broadcastPubSub.subscribe('bar', bar2);
  broadcastPubSub.subscribe('baz', baz1);
  broadcastPubSub.subscribe('baz', baz2);

  remoteStorageEvent({'args': ['foo'], 'timestamp': goog.now()});
  mockClock.tick();
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


/**
 * Local publish that originated from another instance of BroadcastChannel
 * in the same Javascript context.
 */
function testSecondInstancePublish() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage).$times(2);
  var foo = mockControl.createFunctionMock();
  foo('x', 'y');
  var context = {'foo': 'bar'};
  var bar = goog.testing.recordFunction();

  mockControl.$replayAll();

  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);
  broadcastPubSub.subscribe('someTopic', foo);
  broadcastPubSub.subscribe('someTopic', bar, context);

  var broadcastPubSub2 = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub2.publish('someTopic', 'x', 'y');
  mockClock.tick();

  assertEquals(1, bar.getCallCount());
  assertEquals(context, bar.getLastCall().getThis());
  assertArrayEquals(['x', 'y'], bar.getLastCall().getArguments());

  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testSecondInstanceNestedPublish() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage).$times(2);
  var foo = mockControl.createFunctionMock();
  foo('m', 'n').$does(function() {
    broadcastPubSub.publish('barTopic', 'd', 'c');
  });
  var bar = mockControl.createFunctionMock();
  bar('d', 'c');

  mockControl.$replayAll();

  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);
  broadcastPubSub.subscribe('fooTopic', foo);

  var broadcastPubSub2 = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub2.subscribe('barTopic', bar);
  broadcastPubSub2.publish('fooTopic', 'm', 'n');
  mockClock.tick();
  mockClock.tick();

  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


/**
 * Validate the localStorage data is being set as we expect.
 */
function testLocalStorageData() {
  var topic = 'someTopic';
  var anotherTopic = 'anotherTopic';
  var now = goog.now();

  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var mockStorage = mockControl.createLooseMock(goog.storage.Storage);

  var mockStorageCtor =
      mockControl.createConstructorMock(goog.storage, 'Storage');

  mockStorageCtor(mockHtml5LocalStorage).$returns(mockStorage);
  if (!isIe8) {
    mockStorage.set(
        goog.labs.pubsub.BroadcastPubSub.STORAGE_KEY_,
        {'args': [topic, '10'], 'timestamp': now});
    mockStorage.remove(goog.labs.pubsub.BroadcastPubSub.STORAGE_KEY_);
    mockStorage.set(
        goog.labs.pubsub.BroadcastPubSub.STORAGE_KEY_,
        {'args': [anotherTopic, '13'], 'timestamp': now});
    mockStorage.remove(goog.labs.pubsub.BroadcastPubSub.STORAGE_KEY_);
  } else {
    var firstEventArray = [{'args': [topic, '10'], 'timestamp': now}];
    var secondEventArray = [
      {'args': [topic, '10'], 'timestamp': now}, {
        'args': [anotherTopic, '13'],
        'timestamp': now +
            goog.labs.pubsub.BroadcastPubSub.IE8_TIMESTAMP_UNIQUE_OFFSET_MS_
      }
    ];

    mockStorage.get(goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_)
        .$returns(null);
    mockStorage.set(
        goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_,
        new goog.testing.mockmatchers.ArgumentMatcher(function(val) {
          return goog.testing.mockmatchers.flexibleArrayMatcher(
              firstEventArray, val);
        }, 'First event array'));

    // Make sure to clone or you're going to have a bad time.
    mockStorage.get(goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_)
        .$returns(goog.array.clone(firstEventArray));

    mockStorage.set(
        goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_,
        new goog.testing.mockmatchers.ArgumentMatcher(function(val) {
          return goog.testing.mockmatchers.flexibleArrayMatcher(
              secondEventArray, val);
        }, 'Second event array'));

    mockStorage.remove(goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_);
  }

  var fn = goog.testing.recordFunction();
  fn('10');
  mockControl.$replayAll();

  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);
  broadcastPubSub.subscribe(topic, fn);

  broadcastPubSub.publish(topic, '10');
  broadcastPubSub.publish(anotherTopic, '13');

  mockClock.tick();

  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testBrokenTimestamp() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var fn = mockControl.createFunctionMock();
  mockControl.$replayAll();

  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  broadcastPubSub.subscribe('someTopic', fn);

  remoteStorageEvent({'args': 'WAT?', 'timestamp': 'wat?'});
  mockClock.tick();

  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


/** Test response to bad localStorage data. */
function testBrokenEvent() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var fn = mockControl.createFunctionMock();
  mockControl.$replayAll();

  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);
  broadcastPubSub.subscribe('someTopic', fn);

  if (!isIe8) {
    var event = new goog.testing.events.Event('storage', window);
    event.key = 'FooBarBaz';
    event.newValue = goog.json.serialize({'keyby': 'word'});
    goog.testing.events.fireBrowserEvent(event);
  } else {
    var uniqueKey =
        goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_PREFIX_ + '1234567890';
    // This will cause an event.
    mockHtml5LocalStorage.set(uniqueKey, 'Toothpaste!');
  }
  mockClock.tick();

  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


/**
 * The following tests are duplicated from pubsub because they depend
 * on functionality (mostly "publish") that has changed in BroadcastChannel.
 */
function testPublish() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var foo = mockControl.createFunctionMock();
  foo('x', 'y');

  var context = {'foo': 'bar'};
  var bar = goog.testing.recordFunction();

  var baz = mockControl.createFunctionMock();
  baz('d', 'c');

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  broadcastPubSub.subscribe('someTopic', foo);
  broadcastPubSub.subscribe('someTopic', bar, context);
  broadcastPubSub.subscribe('anotherTopic', baz, context);

  broadcastPubSub.publish('someTopic', 'x', 'y');
  mockClock.tick();

  assertTrue(broadcastPubSub.unsubscribe('someTopic', foo));

  broadcastPubSub.publish('anotherTopic', 'd', 'c');
  broadcastPubSub.publish('someTopic', 'x', 'y');
  mockClock.tick();

  broadcastPubSub.subscribe('differentTopic', foo);

  broadcastPubSub.publish('someTopic', 'x', 'y');
  mockClock.tick();

  assertEquals(3, bar.getCallCount());
  goog.array.forEach(bar.getCalls(), function(call) {
    assertArrayEquals(['x', 'y'], call.getArguments());
    assertEquals(context, call.getThis());
  });
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testPublishEmptyTopic() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var foo = mockControl.createFunctionMock();
  foo();

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  broadcastPubSub.publish('someTopic');
  mockClock.tick();

  broadcastPubSub.subscribe('someTopic', foo);
  broadcastPubSub.publish('someTopic');
  mockClock.tick();

  broadcastPubSub.unsubscribe('someTopic', foo);
  broadcastPubSub.publish('someTopic');
  mockClock.tick();

  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testSubscribeWhilePublishing() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  // It's OK for a subscriber to add a new subscriber to its own topic,
  // but the newly added subscriber shouldn't be called until the next
  // publish cycle.

  var fn1 = mockControl.createFunctionMock();
  var fn2 = mockControl.createFunctionMock();
  fn1()
      .$does(function() { broadcastPubSub.subscribe('someTopic', fn2); })
      .$times(2);
  fn2();

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  broadcastPubSub.subscribe('someTopic', fn1);
  assertEquals(
      'Topic must have one subscriber', 1,
      broadcastPubSub.getCount('someTopic'));

  broadcastPubSub.publish('someTopic');
  mockClock.tick();

  assertEquals(
      'Topic must have two subscribers', 2,
      broadcastPubSub.getCount('someTopic'));

  broadcastPubSub.publish('someTopic');
  mockClock.tick();

  assertEquals(
      'Topic must have three subscribers', 3,
      broadcastPubSub.getCount('someTopic'));
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testUnsubscribeWhilePublishing() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  // It's OK for a subscriber to unsubscribe another subscriber from its
  // own topic, but the subscriber in question won't actually be removed
  // until after publishing is complete.


  var fn1 = mockControl.createFunctionMock();
  var fn2 = mockControl.createFunctionMock();
  var fn3 = mockControl.createFunctionMock();

  fn1().$does(function() {
    assertTrue(
        'unsubscribe() must return true when removing a topic',
        broadcastPubSub.unsubscribe('X', fn2));
    assertEquals(
        'Topic "X" must still have 3 subscribers', 3,
        broadcastPubSub.getCount('X'));
  });
  fn2().$times(0);
  fn3().$does(function() {
    assertTrue(
        'unsubscribe() must return true when removing a topic',
        broadcastPubSub.unsubscribe('X', fn1));
    assertEquals(
        'Topic "X" must still have 3 subscribers', 3,
        broadcastPubSub.getCount('X'));
  });

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  broadcastPubSub.subscribe('X', fn1);
  broadcastPubSub.subscribe('X', fn2);
  broadcastPubSub.subscribe('X', fn3);

  assertEquals(
      'Topic "X" must have 3 subscribers', 3, broadcastPubSub.getCount('X'));

  broadcastPubSub.publish('X');
  mockClock.tick();

  assertEquals(
      'Topic "X" must have 1 subscriber after publishing', 1,
      broadcastPubSub.getCount('X'));
  assertEquals(
      'BroadcastChannel must not have any subscriptions pending removal', 0,
      broadcastPubSub.pubSub_.pendingKeys_.length);
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testUnsubscribeSelfWhilePublishing() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  // It's OK for a subscriber to unsubscribe itself, but it won't actually
  // be removed until after publishing is complete.

  var fn = mockControl.createFunctionMock();
  fn().$does(function() {
    assertTrue(
        'unsubscribe() must return true when removing a topic',
        broadcastPubSub.unsubscribe('someTopic', fn));
    assertEquals(
        'Topic must still have 1 subscriber', 1,
        broadcastPubSub.getCount('someTopic'));
  });

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  broadcastPubSub.subscribe('someTopic', fn);
  assertEquals(
      'Topic must have 1 subscriber', 1, broadcastPubSub.getCount('someTopic'));

  broadcastPubSub.publish('someTopic');
  mockClock.tick();

  assertEquals(
      'Topic must have no subscribers after publishing', 0,
      broadcastPubSub.getCount('someTopic'));
  assertEquals(
      'BroadcastChannel must not have any subscriptions pending removal', 0,
      broadcastPubSub.pubSub_.pendingKeys_.length);
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testNestedPublish() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var xFn1 = mockControl.createFunctionMock();
  xFn1().$does(function() {
    broadcastPubSub.publish('Y');
    broadcastPubSub.unsubscribe('X', arguments.callee);
  });
  var xFn2 = mockControl.createFunctionMock();
  xFn2();

  var yFn1 = mockControl.createFunctionMock();
  yFn1().$does(function() {
    broadcastPubSub.unsubscribe('Y', arguments.callee);
  });
  var yFn2 = mockControl.createFunctionMock();
  yFn2();

  mockControl.$replayAll();

  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);
  broadcastPubSub.subscribe('X', xFn1);
  broadcastPubSub.subscribe('X', xFn2);
  broadcastPubSub.subscribe('Y', yFn1);
  broadcastPubSub.subscribe('Y', yFn2);

  broadcastPubSub.publish('X');
  mockClock.tick();

  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testSubscribeOnce() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var fn = goog.testing.recordFunction();

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);
  broadcastPubSub.subscribeOnce('someTopic', fn);

  assertEquals(
      'Topic must have one subscriber', 1,
      broadcastPubSub.getCount('someTopic'));

  broadcastPubSub.publish('someTopic');
  mockClock.tick();

  assertEquals(
      'Topic must have no subscribers', 0,
      broadcastPubSub.getCount('someTopic'));

  var context = {'foo': 'bar'};
  broadcastPubSub.subscribeOnce('someTopic', fn, context);
  assertEquals(
      'Topic must have one subscriber', 1,
      broadcastPubSub.getCount('someTopic'));
  assertEquals(
      'Subscriber must not have been called yet', 1, fn.getCallCount());

  broadcastPubSub.publish('someTopic');
  mockClock.tick();

  assertEquals(
      'Topic must have no subscribers', 0,
      broadcastPubSub.getCount('someTopic'));
  assertEquals('Subscriber must have been called', 2, fn.getCallCount());
  assertEquals(context, fn.getLastCall().getThis());
  assertArrayEquals([], fn.getLastCall().getArguments());

  context = {'foo': 'bar'};
  broadcastPubSub.subscribeOnce('someTopic', fn, context);
  assertEquals(
      'Topic must have one subscriber', 1,
      broadcastPubSub.getCount('someTopic'));
  assertEquals('Subscriber must not have been called', 2, fn.getCallCount());

  broadcastPubSub.publish('someTopic', '17');
  mockClock.tick();

  assertEquals(
      'Topic must have no subscribers', 0,
      broadcastPubSub.getCount('someTopic'));
  assertEquals(context, fn.getLastCall().getThis());
  assertEquals('Subscriber must have been called', 3, fn.getCallCount());
  assertArrayEquals(['17'], fn.getLastCall().getArguments());
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testSubscribeOnce_boundFn() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var fn = goog.testing.recordFunction();
  var context = {'foo': 'bar'};

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  broadcastPubSub.subscribeOnce('someTopic', goog.bind(fn, context));
  assertEquals(
      'Topic must have one subscriber', 1,
      broadcastPubSub.getCount('someTopic'));
  assertNull('Subscriber must not have been called yet', fn.getLastCall());

  broadcastPubSub.publish('someTopic', '17');
  mockClock.tick();
  assertEquals(
      'Topic must have no subscribers', 0,
      broadcastPubSub.getCount('someTopic'));
  assertEquals('Subscriber must have been called', 1, fn.getCallCount());
  assertEquals(
      'Must receive correct argument.', '17', fn.getLastCall().getArgument(0));
  assertEquals(
      'Must have appropriate context.', context, fn.getLastCall().getThis());

  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testSubscribeOnce_partialFn() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var fullFn = mockControl.createFunctionMock();
  fullFn(true, '17');

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  broadcastPubSub.subscribeOnce('someTopic', goog.partial(fullFn, true));
  assertEquals(
      'Topic must have one subscriber', 1,
      broadcastPubSub.getCount('someTopic'));

  broadcastPubSub.publish('someTopic', '17');
  mockClock.tick();

  assertEquals(
      'Topic must have no subscribers', 0,
      broadcastPubSub.getCount('someTopic'));
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testSelfResubscribe() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var resubscribeFn = mockControl.createFunctionMock();
  var resubscribe = function() {
    broadcastPubSub.subscribeOnce('someTopic', resubscribeFn);
  };
  resubscribeFn('foo').$does(resubscribe);
  resubscribeFn('bar').$does(resubscribe);
  resubscribeFn('baz').$does(resubscribe);

  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  broadcastPubSub.subscribeOnce('someTopic', resubscribeFn);
  assertEquals(
      'Topic must have 1 subscriber', 1, broadcastPubSub.getCount('someTopic'));

  broadcastPubSub.publish('someTopic', 'foo');
  mockClock.tick();
  assertEquals(
      'Topic must have 1 subscriber', 1, broadcastPubSub.getCount('someTopic'));
  assertEquals(
      'BroadcastChannel must not have any pending unsubscribe keys', 0,
      broadcastPubSub.pubSub_.pendingKeys_.length);

  broadcastPubSub.publish('someTopic', 'bar');
  mockClock.tick();
  assertEquals(
      'Topic must have 1 subscriber', 1, broadcastPubSub.getCount('someTopic'));
  assertEquals(
      'BroadcastChannel must not have any pending unsubscribe keys', 0,
      broadcastPubSub.pubSub_.pendingKeys_.length);

  broadcastPubSub.publish('someTopic', 'baz');
  mockClock.tick();
  assertEquals(
      'Topic must have 1 subscriber', 1, broadcastPubSub.getCount('someTopic'));
  assertEquals(
      'BroadcastChannel must not have any pending unsubscribe keys', 0,
      broadcastPubSub.pubSub_.pendingKeys_.length);
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}


function testClear() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);
  var fn = mockControl.createFunctionMock();
  mockControl.$replayAll();
  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.logger_.setLevel(goog.debug.Logger.Level.OFF);

  goog.array.forEach(['V', 'W', 'X', 'Y', 'Z'], function(topic) {
    broadcastPubSub.subscribe(topic, fn);
  });
  assertEquals(
      'BroadcastChannel must have 5 subscribers', 5,
      broadcastPubSub.getCount());

  broadcastPubSub.clear('W');
  assertEquals(
      'BroadcastChannel must have 4 subscribers', 4,
      broadcastPubSub.getCount());

  goog.array.forEach(
      ['X', 'Y'], function(topic) { broadcastPubSub.clear(topic); });
  assertEquals(
      'BroadcastChannel must have 2 subscriber', 2, broadcastPubSub.getCount());

  broadcastPubSub.clear();
  assertEquals(
      'BroadcastChannel must have no subscribers', 0,
      broadcastPubSub.getCount());
  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}

function testNestedSubscribeOnce() {
  mockHTML5LocalStorageCtor().$returns(mockHtml5LocalStorage);

  var x = mockControl.createFunctionMock();
  var y = mockControl.createFunctionMock();

  x().$times(1);
  y().$does(function() {
    broadcastPubSub.publish('X');
    broadcastPubSub.publish('X');
  });

  mockControl.$replayAll();

  broadcastPubSub = new goog.labs.pubsub.BroadcastPubSub();
  broadcastPubSub.subscribeOnce('X', x);
  broadcastPubSub.subscribe('Y', y);
  broadcastPubSub.publish('Y');
  mockClock.tick();

  broadcastPubSub.dispose();
  mockControl.$verifyAll();
}
