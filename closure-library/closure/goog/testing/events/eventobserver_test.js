// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.testing.events.EventObserverTest');
goog.setTestOnly('goog.testing.events.EventObserverTest');

goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.testing.events.EventObserver');
goog.require('goog.testing.jsunit');

// Return an event's type
function getEventType(e) {
  return e.type;
}

function testGetEvents() {
  var observer = new goog.testing.events.EventObserver();
  var target = new goog.events.EventTarget();
  goog.events.listen(target, ['foo', 'bar', 'baz'], observer);

  var eventTypes = [
    'bar', 'baz', 'foo', 'qux', 'quux', 'corge', 'foo', 'baz'];
  goog.array.forEach(eventTypes, goog.bind(target.dispatchEvent, target));

  var replayEvents = observer.getEvents();

  assertArrayEquals('Only the listened-for event types should be remembered',
      ['bar', 'baz', 'foo', 'foo', 'baz'],
      goog.array.map(observer.getEvents(), getEventType));

  assertArrayEquals(['bar'],
      goog.array.map(observer.getEvents('bar'), getEventType));
  assertArrayEquals(['baz', 'baz'],
      goog.array.map(observer.getEvents('baz'), getEventType));
  assertArrayEquals(['foo', 'foo'],
      goog.array.map(observer.getEvents('foo'), getEventType));
}

function testHandleEvent() {
  var events = [
    new goog.events.Event('foo'),
    new goog.events.Event('bar'),
    new goog.events.Event('baz')
  ];

  var observer = new goog.testing.events.EventObserver();
  goog.array.forEach(events, goog.bind(observer.handleEvent, observer));

  assertArrayEquals(events, observer.getEvents());
  assertArrayEquals([events[0]], observer.getEvents('foo'));
  assertArrayEquals([events[1]], observer.getEvents('bar'));
  assertArrayEquals([events[2]], observer.getEvents('baz'));
}
