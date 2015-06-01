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

goog.provide('goog.DisposableTest');
goog.setTestOnly('goog.DisposableTest');

goog.require('goog.Disposable');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
var d1, d2;

// Sample subclass of goog.Disposable.

function DisposableTest() {
  goog.Disposable.call(this);
  this.element = document.getElementById('someElement');
}
goog.inherits(DisposableTest, goog.Disposable);

DisposableTest.prototype.disposeInternal = function() {
  DisposableTest.superClass_.disposeInternal.call(this);
  delete this.element;
};

// Class that doesn't inherit from goog.Disposable, but implements the
// disposable interface via duck typing.

function DisposableDuck() {
  this.element = document.getElementById('someElement');
}

DisposableDuck.prototype.dispose = function() {
  delete this.element;
};

// Class which calls dispose recursively.

function RecursiveDisposable() {
  this.disposedCount = 0;
}
goog.inherits(RecursiveDisposable, goog.Disposable);

RecursiveDisposable.prototype.disposeInternal = function() {
  ++this.disposedCount;
  assertEquals('Disposed too many times', 1, this.disposedCount);
  this.dispose();
};

// Test methods.

function setUp() {
  d1 = new goog.Disposable();
  d2 = new DisposableTest();
}

function tearDown() {
  goog.Disposable.MONITORING_MODE = goog.Disposable.MonitoringMode.OFF;
  goog.Disposable.INCLUDE_STACK_ON_CREATION = true;
  goog.Disposable.instances_ = {};
  d1.dispose();
  d2.dispose();
}

function testConstructor() {
  assertFalse(d1.isDisposed());
  assertFalse(d2.isDisposed());
  assertEquals(document.getElementById('someElement'), d2.element);
}

function testDispose() {
  assertFalse(d1.isDisposed());
  d1.dispose();
  assertTrue('goog.Disposable instance should have been disposed of',
      d1.isDisposed());

  assertFalse(d2.isDisposed());
  d2.dispose();
  assertTrue('goog.DisposableTest instance should have been disposed of',
      d2.isDisposed());
}

function testDisposeInternal() {
  assertNotUndefined(d2.element);
  d2.dispose();
  assertUndefined('goog.DisposableTest.prototype.disposeInternal should ' +
      'have deleted the element reference', d2.element);
}

function testDisposeAgain() {
  d2.dispose();
  assertUndefined('goog.DisposableTest.prototype.disposeInternal should ' +
      'have deleted the element reference', d2.element);
  // Manually reset the element to a non-null value, and call dispose().
  // Because the object is already marked disposed, disposeInternal won't
  // be called again.
  d2.element = document.getElementById('someElement');
  d2.dispose();
  assertNotUndefined('disposeInternal should not be called again if the ' +
      'object has already been marked disposed', d2.element);
}

function testDisposeWorksRecursively() {
  new RecursiveDisposable().dispose();
}

function testStaticDispose() {
  assertFalse(d1.isDisposed());
  goog.dispose(d1);
  assertTrue('goog.Disposable instance should have been disposed of',
      d1.isDisposed());

  assertFalse(d2.isDisposed());
  goog.dispose(d2);
  assertTrue('goog.DisposableTest instance should have been disposed of',
      d2.isDisposed());

  var duck = new DisposableDuck();
  assertNotUndefined(duck.element);
  goog.dispose(duck);
  assertUndefined('goog.dispose should have disposed of object that ' +
      'implements the disposable interface', duck.element);
}

function testStaticDisposeOnNonDisposableType() {
  // Call goog.dispose() with various types and make sure no errors are
  // thrown.
  goog.dispose(true);
  goog.dispose(false);
  goog.dispose(null);
  goog.dispose(undefined);
  goog.dispose('');
  goog.dispose([]);
  goog.dispose({});

  function A() {}
  goog.dispose(new A());
}

function testMonitoringFailure() {
  function BadDisposable() {};
  goog.inherits(BadDisposable, goog.Disposable);

  goog.Disposable.MONITORING_MODE =
      goog.Disposable.MonitoringMode.PERMANENT;

  var badDisposable = new BadDisposable;
  assertArrayEquals('no disposable objects registered', [],
      goog.Disposable.getUndisposedObjects());
  assertThrows('the base ctor should have been called',
      goog.bind(badDisposable.dispose, badDisposable));
}

function testGetUndisposedObjects() {
  goog.Disposable.MONITORING_MODE =
      goog.Disposable.MonitoringMode.PERMANENT;

  var d1 = new DisposableTest();
  var d2 = new DisposableTest();
  assertSameElements('the undisposed instances', [d1, d2],
      goog.Disposable.getUndisposedObjects());

  d1.dispose();
  assertSameElements('1 undisposed instance left', [d2],
      goog.Disposable.getUndisposedObjects());

  d1.dispose();
  assertSameElements('second disposal of the same object is no-op', [d2],
      goog.Disposable.getUndisposedObjects());

  d2.dispose();
  assertSameElements('all objects have been disposed of', [],
      goog.Disposable.getUndisposedObjects());
}

function testClearUndisposedObjects() {
  goog.Disposable.MONITORING_MODE =
      goog.Disposable.MonitoringMode.PERMANENT;

  var d1 = new DisposableTest();
  var d2 = new DisposableTest();
  d2.dispose();
  goog.Disposable.clearUndisposedObjects();
  assertSameElements('no undisposed object in the registry', [],
      goog.Disposable.getUndisposedObjects());

  assertThrows('disposal after clearUndisposedObjects()', function() {
    d1.dispose();
  });

  // d2 is already disposed of, the redisposal shouldn't throw error.
  d2.dispose();
}

function testRegisterDisposable() {
  var d1 = new DisposableTest();
  var d2 = new DisposableTest();

  d1.registerDisposable(d2);
  d1.dispose();

  assertTrue('d2 should be disposed when d1 is disposed', d2.isDisposed());
}

function testDisposeAll() {
  var d1 = new DisposableTest();
  var d2 = new DisposableTest();

  goog.disposeAll(d1, d2);

  assertTrue('d1 should be disposed', d1.isDisposed());
  assertTrue('d2 should be disposed', d2.isDisposed());
}

function testDisposeAllRecursive() {
  var d1 = new DisposableTest();
  var d2 = new DisposableTest();
  var d3 = new DisposableTest();
  var d4 = new DisposableTest();

  goog.disposeAll(d1, [[d2], d3, d4]);

  assertTrue('d1 should be disposed', d1.isDisposed());
  assertTrue('d2 should be disposed', d2.isDisposed());
  assertTrue('d3 should be disposed', d3.isDisposed());
  assertTrue('d4 should be disposed', d4.isDisposed());
}

function testCreationStack() {
  if (!new Error().stack)
    return;
  goog.Disposable.MONITORING_MODE =
      goog.Disposable.MonitoringMode.PERMANENT;
  var disposableStack = new DisposableTest().creationStack;
  // Check that the name of this test function occurs in the stack trace.
  assertNotEquals(-1, disposableStack.indexOf('testCreationStack'));
}

function testMonitoredWithoutCreationStack() {
  if (!new Error().stack)
    return;
  goog.Disposable.MONITORING_MODE =
      goog.Disposable.MonitoringMode.PERMANENT;
  goog.Disposable.INCLUDE_STACK_ON_CREATION = false;
  var d1 = new DisposableTest();

  // Check that it is tracked, but not with a creation stack.
  assertUndefined(d1.creationStack);
  assertSameElements('the undisposed instance', [d1],
      goog.Disposable.getUndisposedObjects());
}

function testOnDisposeCallback() {
  var callback = goog.testing.recordFunction();
  d1.addOnDisposeCallback(callback);
  assertEquals('callback called too early', 0, callback.getCallCount());
  d1.dispose();
  assertEquals('callback should be called once on dispose',
      1, callback.getCallCount());
}

function testOnDisposeCallbackOrder() {
  var invocations = [];
  var callback = function(str) {
    invocations.push(str);
  };
  d1.addOnDisposeCallback(goog.partial(callback, 'a'));
  d1.addOnDisposeCallback(goog.partial(callback, 'b'));
  goog.dispose(d1);
  assertArrayEquals('callbacks should be called in chronological order',
      ['a', 'b'], invocations);
}

function testAddOnDisposeCallbackAfterDispose() {
  var callback = goog.testing.recordFunction();
  var scope = {};
  goog.dispose(d1);
  d1.addOnDisposeCallback(callback, scope);
  assertEquals('Callback should be immediately called if already disposed', 1,
      callback.getCallCount());
  assertEquals('Callback scope should be respected', scope,
      callback.getLastCall().getThis());
}

function testInteractiveMonitoring() {
  var d1 = new DisposableTest();
  goog.Disposable.MONITORING_MODE =
      goog.Disposable.MonitoringMode.INTERACTIVE;
  var d2 = new DisposableTest();

  assertSameElements('only 1 undisposed instance tracked', [d2],
      goog.Disposable.getUndisposedObjects());

  // No errors should be thrown.
  d1.dispose();

  assertSameElements('1 undisposed instance left', [d2],
      goog.Disposable.getUndisposedObjects());

  d2.dispose();
  assertSameElements('all disposed', [],
      goog.Disposable.getUndisposedObjects());
}
