// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.pubsub.PubSubTest');
goog.setTestOnly('goog.pubsub.PubSubTest');

goog.require('goog.array');
goog.require('goog.pubsub.PubSub');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');

var pubsub;
var asyncPubsub;
var mockClock;

function setUp() {
  pubsub = new goog.pubsub.PubSub();
  asyncPubsub = new goog.pubsub.PubSub(true);
  mockClock = new goog.testing.MockClock(true);
}

function tearDown() {
  mockClock.uninstall();
  asyncPubsub.dispose();
  pubsub.dispose();
}

function testConstructor() {
  assertNotNull('PubSub instance must not be null', pubsub);
  assertTrue(
      'PubSub instance must have the expected type',
      pubsub instanceof goog.pubsub.PubSub);
}

function testDispose() {
  assertFalse(
      'PubSub instance must not have been disposed of', pubsub.isDisposed());
  pubsub.dispose();
  assertTrue('PubSub instance must have been disposed of', pubsub.isDisposed());
}

function testSubscribeUnsubscribe() {
  function foo1() {}
  function bar1() {}
  function foo2() {}
  function bar2() {}

  assertEquals(
      'Topic "foo" must not have any subscribers', 0, pubsub.getCount('foo'));
  assertEquals(
      'Topic "bar" must not have any subscribers', 0, pubsub.getCount('bar'));

  pubsub.subscribe('foo', foo1);
  assertEquals('Topic "foo" must have 1 subscriber', 1, pubsub.getCount('foo'));
  assertEquals(
      'Topic "bar" must not have any subscribers', 0, pubsub.getCount('bar'));

  pubsub.subscribe('bar', bar1);
  assertEquals('Topic "foo" must have 1 subscriber', 1, pubsub.getCount('foo'));
  assertEquals('Topic "bar" must have 1 subscriber', 1, pubsub.getCount('bar'));

  pubsub.subscribe('foo', foo2);
  assertEquals(
      'Topic "foo" must have 2 subscribers', 2, pubsub.getCount('foo'));
  assertEquals('Topic "bar" must have 1 subscriber', 1, pubsub.getCount('bar'));

  pubsub.subscribe('bar', bar2);
  assertEquals(
      'Topic "foo" must have 2 subscribers', 2, pubsub.getCount('foo'));
  assertEquals(
      'Topic "bar" must have 2 subscribers', 2, pubsub.getCount('bar'));

  assertTrue(pubsub.unsubscribe('foo', foo1));
  assertEquals('Topic "foo" must have 1 subscriber', 1, pubsub.getCount('foo'));
  assertEquals(
      'Topic "bar" must have 2 subscribers', 2, pubsub.getCount('bar'));

  assertTrue(pubsub.unsubscribe('foo', foo2));
  assertEquals(
      'Topic "foo" must have no subscribers', 0, pubsub.getCount('foo'));
  assertEquals(
      'Topic "bar" must have 2 subscribers', 2, pubsub.getCount('bar'));

  assertTrue(pubsub.unsubscribe('bar', bar1));
  assertEquals(
      'Topic "foo" must have no subscribers', 0, pubsub.getCount('foo'));
  assertEquals('Topic "bar" must have 1 subscriber', 1, pubsub.getCount('bar'));

  assertTrue(pubsub.unsubscribe('bar', bar2));
  assertEquals(
      'Topic "foo" must have no subscribers', 0, pubsub.getCount('foo'));
  assertEquals(
      'Topic "bar" must have no subscribers', 0, pubsub.getCount('bar'));

  assertFalse(
      'Unsubscribing a nonexistent topic must return false',
      pubsub.unsubscribe('baz', foo1));

  assertFalse(
      'Unsubscribing a nonexistent function must return false',
      pubsub.unsubscribe('foo', function() {}));
}

function testSubscribeUnsubscribeWithContext() {
  function foo() {}
  function bar() {}

  var contextA = {};
  var contextB = {};

  assertEquals(
      'Topic "X" must not have any subscribers', 0, pubsub.getCount('X'));

  pubsub.subscribe('X', foo, contextA);
  assertEquals('Topic "X" must have 1 subscriber', 1, pubsub.getCount('X'));

  pubsub.subscribe('X', bar);
  assertEquals('Topic "X" must have 2 subscribers', 2, pubsub.getCount('X'));

  pubsub.subscribe('X', bar, contextB);
  assertEquals('Topic "X" must have 3 subscribers', 3, pubsub.getCount('X'));

  assertFalse(
      'Unknown function/context combination return false',
      pubsub.unsubscribe('X', foo, contextB));

  assertTrue(pubsub.unsubscribe('X', foo, contextA));
  assertEquals('Topic "X" must have 2 subscribers', 2, pubsub.getCount('X'));

  assertTrue(pubsub.unsubscribe('X', bar));
  assertEquals('Topic "X" must have 1 subscriber', 1, pubsub.getCount('X'));

  assertTrue(pubsub.unsubscribe('X', bar, contextB));
  assertEquals('Topic "X" must have no subscribers', 0, pubsub.getCount('X'));
}

function testSubscribeOnce() {
  var called, context;

  called = false;
  pubsub.subscribeOnce('someTopic', function() { called = true; });
  assertEquals(
      'Topic must have one subscriber', 1, pubsub.getCount('someTopic'));
  assertFalse('Subscriber must not have been called yet', called);

  pubsub.publish('someTopic');
  assertEquals(
      'Topic must have no subscribers', 0, pubsub.getCount('someTopic'));
  assertTrue('Subscriber must have been called', called);

  context = {called: false};
  pubsub.subscribeOnce(
      'someTopic', function() { this.called = true; }, context);
  assertEquals(
      'Topic must have one subscriber', 1, pubsub.getCount('someTopic'));
  assertFalse('Subscriber must not have been called yet', context.called);

  pubsub.publish('someTopic');
  assertEquals(
      'Topic must have no subscribers', 0, pubsub.getCount('someTopic'));
  assertTrue('Subscriber must have been called', context.called);

  context = {called: false, value: 0};
  pubsub.subscribeOnce('someTopic', function(value) {
    this.called = true;
    this.value = value;
  }, context);
  assertEquals(
      'Topic must have one subscriber', 1, pubsub.getCount('someTopic'));
  assertFalse('Subscriber must not have been called yet', context.called);
  assertEquals('Value must have expected value', 0, context.value);

  pubsub.publish('someTopic', 17);
  assertEquals(
      'Topic must have no subscribers', 0, pubsub.getCount('someTopic'));
  assertTrue('Subscriber must have been called', context.called);
  assertEquals('Value must have been updated', 17, context.value);
}

function testAsyncSubscribeOnce() {
  var callCount = 0;
  asyncPubsub.subscribeOnce('someTopic', function() { callCount++; });
  assertEquals(
      'Topic must have one subscriber', 1, asyncPubsub.getCount('someTopic'));
  mockClock.tick();
  assertEquals('Subscriber must not have been called yet', 0, callCount);

  asyncPubsub.publish('someTopic');
  asyncPubsub.publish('someTopic');
  mockClock.tick();
  assertEquals(
      'Topic must have no subscribers', 0, asyncPubsub.getCount('someTopic'));
  assertEquals('Subscriber must have been called once', 1, callCount);
}

function testAsyncSubscribeOnceWithContext() {
  var context = {callCount: 0};
  asyncPubsub.subscribeOnce(
      'someTopic', function() { this.callCount++; }, context);
  assertEquals(
      'Topic must have one subscriber', 1, asyncPubsub.getCount('someTopic'));
  mockClock.tick();
  assertEquals(
      'Subscriber must not have been called yet', 0, context.callCount);

  asyncPubsub.publish('someTopic');
  asyncPubsub.publish('someTopic');
  mockClock.tick();
  assertEquals(
      'Topic must have no subscribers', 0, asyncPubsub.getCount('someTopic'));
  assertEquals('Subscriber must have been called once', 1, context.callCount);
}

function testAsyncSubscribeOnceWithContextAndValue() {
  var context = {callCount: 0, value: 0};
  asyncPubsub.subscribeOnce('someTopic', function(value) {
    this.callCount++;
    this.value = value;
  }, context);
  assertEquals(
      'Topic must have one subscriber', 1, asyncPubsub.getCount('someTopic'));
  mockClock.tick();
  assertEquals(
      'Subscriber must not have been called yet', 0, context.callCount);
  assertEquals('Value must have expected value', 0, context.value);

  asyncPubsub.publish('someTopic', 17);
  asyncPubsub.publish('someTopic', 42);
  mockClock.tick();
  assertEquals(
      'Topic must have no subscribers', 0, asyncPubsub.getCount('someTopic'));
  assertEquals('Subscriber must have been called once', 1, context.callCount);
  assertEquals('Value must have been updated', 17, context.value);
}

function testSubscribeOnce_boundFn() {
  var context = {called: false, value: 0};

  function subscriber(value) {
    this.called = true;
    this.value = value;
  }

  pubsub.subscribeOnce('someTopic', goog.bind(subscriber, context));
  assertEquals(
      'Topic must have one subscriber', 1, pubsub.getCount('someTopic'));
  assertFalse('Subscriber must not have been called yet', context.called);
  assertEquals('Value must have expected value', 0, context.value);

  pubsub.publish('someTopic', 17);
  assertEquals(
      'Topic must have no subscribers', 0, pubsub.getCount('someTopic'));
  assertTrue('Subscriber must have been called', context.called);
  assertEquals('Value must have been updated', 17, context.value);
}

function testSubscribeOnce_partialFn() {
  var called = false;
  var value = 0;

  function subscriber(hasBeenCalled, newValue) {
    called = hasBeenCalled;
    value = newValue;
  }

  pubsub.subscribeOnce('someTopic', goog.partial(subscriber, true));
  assertEquals(
      'Topic must have one subscriber', 1, pubsub.getCount('someTopic'));
  assertFalse('Subscriber must not have been called yet', called);
  assertEquals('Value must have expected value', 0, value);

  pubsub.publish('someTopic', 17);
  assertEquals(
      'Topic must have no subscribers', 0, pubsub.getCount('someTopic'));
  assertTrue('Subscriber must have been called', called);
  assertEquals('Value must have been updated', 17, value);
}

function testSelfResubscribe() {
  var value = null;

  function resubscribe(iteration, newValue) {
    pubsub.subscribeOnce('someTopic', goog.partial(resubscribe, iteration + 1));
    value = newValue + ':' + iteration;
  }

  pubsub.subscribeOnce('someTopic', goog.partial(resubscribe, 0));
  assertEquals('Topic must have 1 subscriber', 1, pubsub.getCount('someTopic'));
  assertNull('Value must be null', value);

  pubsub.publish('someTopic', 'foo');
  assertEquals('Topic must have 1 subscriber', 1, pubsub.getCount('someTopic'));
  assertEquals(
      'Pubsub must not have any pending unsubscribe keys', 0,
      pubsub.pendingKeys_.length);
  assertEquals('Value be as expected', 'foo:0', value);

  pubsub.publish('someTopic', 'bar');
  assertEquals('Topic must have 1 subscriber', 1, pubsub.getCount('someTopic'));
  assertEquals(
      'Pubsub must not have any pending unsubscribe keys', 0,
      pubsub.pendingKeys_.length);
  assertEquals('Value be as expected', 'bar:1', value);

  pubsub.publish('someTopic', 'baz');
  assertEquals('Topic must have 1 subscriber', 1, pubsub.getCount('someTopic'));
  assertEquals(
      'Pubsub must not have any pending unsubscribe keys', 0,
      pubsub.pendingKeys_.length);
  assertEquals('Value be as expected', 'baz:2', value);
}

function testUnsubscribeByKey() {
  var key1, key2, key3;

  key1 = pubsub.subscribe('X', function() {});
  key2 = pubsub.subscribe('Y', function() {});

  assertEquals('Topic "X" must have 1 subscriber', 1, pubsub.getCount('X'));
  assertEquals('Topic "Y" must have 1 subscriber', 1, pubsub.getCount('Y'));
  assertNotEquals('Subscription keys must be distinct', key1, key2);

  pubsub.unsubscribeByKey(key1);
  assertEquals('Topic "X" must have no subscribers', 0, pubsub.getCount('X'));
  assertEquals('Topic "Y" must have 1 subscriber', 1, pubsub.getCount('Y'));

  key3 = pubsub.subscribe('X', function() {});
  assertEquals('Topic "X" must have 1 subscriber', 1, pubsub.getCount('X'));
  assertEquals('Topic "Y" must have 1 subscriber', 1, pubsub.getCount('Y'));
  assertNotEquals('Subscription keys must be distinct', key1, key3);
  assertNotEquals('Subscription keys must be distinct', key2, key3);

  pubsub.unsubscribeByKey(key1);  // Obsolete key; should be no-op.
  assertEquals('Topic "X" must have 1 subscriber', 1, pubsub.getCount('X'));
  assertEquals('Topic "Y" must have 1 subscriber', 1, pubsub.getCount('Y'));

  pubsub.unsubscribeByKey(key2);
  assertEquals('Topic "X" must have 1 subscriber', 1, pubsub.getCount('X'));
  assertEquals('Topic "Y" must have no subscribers', 0, pubsub.getCount('Y'));

  pubsub.unsubscribeByKey(key3);
  assertEquals('Topic "X" must have no subscribers', 0, pubsub.getCount('X'));
  assertEquals('Topic "Y" must have no subscribers', 0, pubsub.getCount('Y'));
}

function testSubscribeUnsubscribeMultiple() {
  function foo() {}
  function bar() {}

  var context = {};

  assertEquals(
      'Pubsub channel must not have any subscribers', 0, pubsub.getCount());

  assertEquals(
      'Topic "X" must not have any subscribers', 0, pubsub.getCount('X'));
  assertEquals(
      'Topic "Y" must not have any subscribers', 0, pubsub.getCount('Y'));
  assertEquals(
      'Topic "Z" must not have any subscribers', 0, pubsub.getCount('Z'));

  goog.array.forEach(
      ['X', 'Y', 'Z'], function(topic) { pubsub.subscribe(topic, foo); });
  assertEquals('Topic "X" must have 1 subscriber', 1, pubsub.getCount('X'));
  assertEquals('Topic "Y" must have 1 subscriber', 1, pubsub.getCount('Y'));
  assertEquals('Topic "Z" must have 1 subscriber', 1, pubsub.getCount('Z'));

  goog.array.forEach(['X', 'Y', 'Z'], function(topic) {
    pubsub.subscribe(topic, bar, context);
  });
  assertEquals('Topic "X" must have 2 subscribers', 2, pubsub.getCount('X'));
  assertEquals('Topic "Y" must have 2 subscribers', 2, pubsub.getCount('Y'));
  assertEquals('Topic "Z" must have 2 subscribers', 2, pubsub.getCount('Z'));

  assertEquals(
      'Pubsub channel must have a total of 6 subscribers', 6,
      pubsub.getCount());

  goog.array.forEach(
      ['X', 'Y', 'Z'], function(topic) { pubsub.unsubscribe(topic, foo); });
  assertEquals('Topic "X" must have 1 subscriber', 1, pubsub.getCount('X'));
  assertEquals('Topic "Y" must have 1 subscriber', 1, pubsub.getCount('Y'));
  assertEquals('Topic "Z" must have 1 subscriber', 1, pubsub.getCount('Z'));

  goog.array.forEach(['X', 'Y', 'Z'], function(topic) {
    pubsub.unsubscribe(topic, bar, context);
  });
  assertEquals(
      'Topic "X" must not have any subscribers', 0, pubsub.getCount('X'));
  assertEquals(
      'Topic "Y" must not have any subscribers', 0, pubsub.getCount('Y'));
  assertEquals(
      'Topic "Z" must not have any subscribers', 0, pubsub.getCount('Z'));

  assertEquals(
      'Pubsub channel must not have any subscribers', 0, pubsub.getCount());
}

function testPublish() {
  var context = {};
  var fooCalled = false;
  var barCalled = false;

  function foo(x, y) {
    fooCalled = true;
    assertEquals('x must have expected value', 'x', x);
    assertEquals('y must have expected value', 'y', y);
  }

  function bar(x, y) {
    barCalled = true;
    assertEquals('Context must have expected value', context, this);
    assertEquals('x must have expected value', 'x', x);
    assertEquals('y must have expected value', 'y', y);
  }

  pubsub.subscribe('someTopic', foo);
  pubsub.subscribe('someTopic', bar, context);

  assertTrue(pubsub.publish('someTopic', 'x', 'y'));
  assertTrue('foo() must have been called', fooCalled);
  assertTrue('bar() must have been called', barCalled);

  fooCalled = false;
  barCalled = false;
  assertTrue(pubsub.unsubscribe('someTopic', foo));

  assertTrue(pubsub.publish('someTopic', 'x', 'y'));
  assertFalse('foo() must not have been called', fooCalled);
  assertTrue('bar() must have been called', barCalled);

  fooCalled = false;
  barCalled = false;
  pubsub.subscribe('differentTopic', foo);

  assertTrue(pubsub.publish('someTopic', 'x', 'y'));
  assertFalse('foo() must not have been called', fooCalled);
  assertTrue('bar() must have been called', barCalled);
}

function testAsyncPublish() {
  var context = {};
  var fooCallCount = 0;
  var barCallCount = 0;

  function foo(x, y) {
    fooCallCount++;
    assertEquals('x must have expected value', 'x', x);
    assertEquals('y must have expected value', 'y', y);
  }

  function bar(x, y) {
    barCallCount++;
    assertEquals('Context must have expected value', context, this);
    assertEquals('x must have expected value', 'x', x);
    assertEquals('y must have expected value', 'y', y);
  }

  asyncPubsub.subscribe('someTopic', foo);
  asyncPubsub.subscribe('someTopic', bar, context);

  assertTrue(asyncPubsub.publish('someTopic', 'x', 'y'));
  assertEquals('foo() must not have been called', 0, fooCallCount);
  assertEquals('bar() must not have been called', 0, barCallCount);
  mockClock.tick();
  assertEquals('foo() must have been called once', 1, fooCallCount);
  assertEquals('bar() must have been called once', 1, barCallCount);

  fooCallCount = 0;
  barCallCount = 0;
  assertTrue(asyncPubsub.unsubscribe('someTopic', foo));

  assertTrue(asyncPubsub.publish('someTopic', 'x', 'y'));
  assertEquals('foo() must not have been called', 0, fooCallCount);
  assertEquals('bar() must not have been called', 0, barCallCount);
  mockClock.tick();
  assertEquals('foo() must not have been called', 0, fooCallCount);
  assertEquals('bar() must have been called once', 1, barCallCount);

  fooCallCount = 0;
  barCallCount = 0;
  asyncPubsub.subscribe('differentTopic', foo);
  assertTrue(asyncPubsub.publish('someTopic', 'x', 'y'));
  assertEquals('foo() must not have been called', 0, fooCallCount);
  assertEquals('bar() must not have been called', 0, barCallCount);
  mockClock.tick();
  assertEquals('foo() must not have been called', 0, fooCallCount);
  assertEquals('bar() must have been called once', 1, barCallCount);
}

function testPublishEmptyTopic() {
  var fooCalled = false;
  function foo() { fooCalled = true; }

  assertFalse(
      'Publishing to nonexistent topic must return false',
      pubsub.publish('someTopic'));

  pubsub.subscribe('someTopic', foo);
  assertTrue(
      'Publishing to topic with subscriber must return true',
      pubsub.publish('someTopic'));
  assertTrue('Foo must have been called', fooCalled);

  pubsub.unsubscribe('someTopic', foo);
  fooCalled = false;
  assertFalse(
      'Publishing to topic without subscribers must return false',
      pubsub.publish('someTopic'));
  assertFalse('Foo must nothave been called', fooCalled);
}

function testSubscribeWhilePublishing() {
  // It's OK for a subscriber to add a new subscriber to its own topic,
  // but the newly added subscriber shouldn't be called until the next
  // publish cycle.

  var firstCalled = false;
  var secondCalled = false;

  pubsub.subscribe('someTopic', function() {
    pubsub.subscribe('someTopic', function() { secondCalled = true; });
    firstCalled = true;
  });
  assertEquals(
      'Topic must have one subscriber', 1, pubsub.getCount('someTopic'));
  assertFalse(
      'No subscriber must have been called yet', firstCalled || secondCalled);

  pubsub.publish('someTopic');
  assertEquals(
      'Topic must have two subscribers', 2, pubsub.getCount('someTopic'));
  assertTrue('The first subscriber must have been called', firstCalled);
  assertFalse(
      'The second subscriber must not have been called yet', secondCalled);

  pubsub.publish('someTopic');
  assertEquals(
      'Topic must have three subscribers', 3, pubsub.getCount('someTopic'));
  assertTrue('The first subscriber must have been called', firstCalled);
  assertTrue('The second subscriber must also have been called', secondCalled);
}

function testUnsubscribeWhilePublishing() {
  // It's OK for a subscriber to unsubscribe another subscriber from its
  // own topic, but the subscriber in question won't actually be removed
  // until after publishing is complete.

  var firstCalled = false;
  var secondCalled = false;
  var thirdCalled = false;

  function first() {
    assertTrue(
        'unsubscribe() must return true when unsubscribing',
        pubsub.unsubscribe('X', second));
    assertEquals(
        'Topic "X" must still have 3 subscribers', 3, pubsub.getCount('X'));
    firstCalled = true;
  }
  pubsub.subscribe('X', first);

  function second() { secondCalled = true; }
  pubsub.subscribe('X', second);

  function third() {
    assertTrue(
        'unsubscribe() must return true when unsubscribing',
        pubsub.unsubscribe('X', first));
    assertEquals(
        'Topic "X" must still have 3 subscribers', 3, pubsub.getCount('X'));
    thirdCalled = true;
  }
  pubsub.subscribe('X', third);

  assertEquals('Topic "X" must have 3 subscribers', 3, pubsub.getCount('X'));
  assertFalse(
      'No subscribers must have been called yet',
      firstCalled || secondCalled || thirdCalled);

  assertTrue(pubsub.publish('X'));
  assertTrue('First function must have been called', firstCalled);
  assertFalse('Second function must not have been called', secondCalled);
  assertTrue('Third function must have been called', thirdCalled);
  assertEquals(
      'Topic "X" must have 1 subscriber after publishing', 1,
      pubsub.getCount('X'));
  assertEquals(
      'PubSub must not have any subscriptions pending removal', 0,
      pubsub.pendingKeys_.length);
}

function testUnsubscribeSelfWhilePublishing() {
  // It's OK for a subscriber to unsubscribe itself, but it won't actually
  // be removed until after publishing is complete.

  var selfDestructCalled = false;

  function selfDestruct() {
    assertTrue(
        'unsubscribe() must return true when unsubscribing',
        pubsub.unsubscribe('someTopic', arguments.callee));
    assertEquals(
        'Topic must still have 1 subscriber', 1, pubsub.getCount('someTopic'));
    selfDestructCalled = true;
  }

  pubsub.subscribe('someTopic', selfDestruct);
  assertEquals('Topic must have 1 subscriber', 1, pubsub.getCount('someTopic'));
  assertFalse(
      'selfDestruct() must not have been called yet', selfDestructCalled);

  pubsub.publish('someTopic');
  assertTrue('selfDestruct() must have been called', selfDestructCalled);
  assertEquals(
      'Topic must have no subscribers after publishing', 0,
      pubsub.getCount('someTopic'));
  assertEquals(
      'PubSub must not have any subscriptions pending removal', 0,
      pubsub.pendingKeys_.length);
}

function testPublishReturnValue() {
  pubsub.subscribe(
      'X', function() { pubsub.unsubscribe('X', arguments.callee); });
  assertTrue(
      'publish() must return true even if the only subscriber ' +
          'removes itself during publishing',
      pubsub.publish('X'));
}

function testNestedPublish() {
  var x1 = false;
  var x2 = false;
  var y1 = false;
  var y2 = false;

  pubsub.subscribe('X', function() {
    pubsub.publish('Y');
    pubsub.unsubscribe('X', arguments.callee);
    x1 = true;
  });

  pubsub.subscribe('X', function() { x2 = true; });

  pubsub.subscribe('Y', function() {
    pubsub.unsubscribe('Y', arguments.callee);
    y1 = true;
  });

  pubsub.subscribe('Y', function() { y2 = true; });

  pubsub.publish('X');

  assertTrue('x1 must be true', x1);
  assertTrue('x2 must be true', x2);
  assertTrue('y1 must be true', y1);
  assertTrue('y2 must be true', y2);
}

function testClear() {
  function fn() {}

  goog.array.forEach(
      ['W', 'X', 'Y', 'Z'], function(topic) { pubsub.subscribe(topic, fn); });
  assertEquals('Pubsub channel must have 4 subscribers', 4, pubsub.getCount());

  pubsub.clear('W');
  assertEquals('Pubsub channel must have 3 subscribers', 3, pubsub.getCount());

  goog.array.forEach(['X', 'Y'], function(topic) { pubsub.clear(topic); });
  assertEquals('Pubsub channel must have 1 subscriber', 1, pubsub.getCount());

  pubsub.clear();
  assertEquals('Pubsub channel must have no subscribers', 0, pubsub.getCount());
}

function testSubscriberExceptionUnlocksSubscriptions() {
  var key1 = pubsub.subscribe('X', function() {});

  pubsub.subscribe('X', function() {
    // Pushes "key1" onto queue to be unsubscribed after subscriptions are
    // processed.
    pubsub.unsubscribeByKey(key1);
  });

  pubsub.subscribe('X', function() { throw 'Oh no!'; });

  var key2 = pubsub.subscribe('X', function() {});

  assertThrows(function() { pubsub.publish('X'); });

  assertTrue(pubsub.unsubscribeByKey(key2));
  // "key1" should've been successfully removed already;
  assertFalse(pubsub.unsubscribeByKey(key1));
}

function testNestedSubscribeOnce() {
  var calls = 0;

  pubsub.subscribeOnce('X', function() { calls++; });

  pubsub.subscribe('Y', function() {
    pubsub.publish('X');
    pubsub.publish('X');
  });

  pubsub.publish('Y');

  assertEquals('X must be called once', 1, calls);
}
