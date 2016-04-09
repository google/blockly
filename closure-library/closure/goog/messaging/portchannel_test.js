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

goog.provide('goog.messaging.PortChannelTest');
goog.setTestOnly('goog.messaging.PortChannelTest');

goog.require('goog.Promise');
goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.json');
goog.require('goog.messaging.PortChannel');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.messaging.MockMessageEvent');


var mockControl;
var mockPort;
var portChannel;

var workerChannel;
var setUpPromise;
var timer;
var frameDiv;


function setUpPage() {
  frameDiv = goog.dom.getElement('frame');

  // Use a relatively long timeout because the iframe created by createIframe
  // can take a couple seconds to load its JS.
  goog.testing.TestCase.getActiveTestCase().promiseTimeout = 3 * 1000;

  if (!('Worker' in goog.global)) {
    return;
  }

  var worker = new Worker('testdata/portchannel_worker.js');
  workerChannel = new goog.messaging.PortChannel(worker);

  setUpPromise = new goog.Promise(function(resolve, reject) {
    worker.onmessage = function(e) {
      if (e.data == 'loaded') {
        resolve();
      }
    };
  });
}


function tearDownPage() {
  goog.dispose(workerChannel);
}


function setUp() {
  timer = new goog.Timer(50);
  mockControl = new goog.testing.MockControl();
  mockPort = new goog.events.EventTarget();
  mockPort.postMessage = mockControl.createFunctionMock('postMessage');
  portChannel = new goog.messaging.PortChannel(mockPort);

  if ('Worker' in goog.global) {
    // Ensure the worker channel has started before running each test.
    return setUpPromise;
  }
}


function tearDown() {
  goog.dispose(timer);
  portChannel.dispose();
  goog.dom.removeChildren(frameDiv);
  mockControl.$verifyAll();
}


/**
 * Registers a service on a channel that will accept a single test message and
 * then fire a Promise.
 *
 * @param {!goog.messaging.MessageChannel} channel
 * @param {string} name The service name.
 * @param {boolean=} opt_objectPayload Whether incoming payloads should be
 *     parsed as Objects instead of raw strings.
 * @return {!goog.Promise<(string|!Object)>} A promise that resolves with the
 *     value of the first message received on the service.
 */
function registerService(channel, name, opt_objectPayload) {
  return new goog.Promise(function(resolve, reject) {
    channel.registerService(name, resolve, opt_objectPayload);
  });
}


function makeMessage(serviceName, payload) {
  var msg = {'serviceName': serviceName, 'payload': payload};
  msg[goog.messaging.PortChannel.FLAG] = true;
  if (goog.messaging.PortChannel.REQUIRES_SERIALIZATION_) {
    msg = goog.json.serialize(msg);
  }
  return msg;
}


function expectNoMessage() {
  portChannel.registerDefaultService(
      mockControl.createFunctionMock('expectNoMessage'));
}


function receiveMessage(serviceName, payload, opt_origin, opt_ports) {
  mockPort.dispatchEvent(
      goog.testing.messaging.MockMessageEvent.wrap(
          makeMessage(serviceName, payload), opt_origin || 'http://google.com',
          undefined, undefined, opt_ports));
}


function receiveNonChannelMessage(data) {
  if (goog.messaging.PortChannel.REQUIRES_SERIALIZATION_ &&
      !goog.isString(data)) {
    data = goog.json.serialize(data);
  }
  mockPort.dispatchEvent(
      goog.testing.messaging.MockMessageEvent.wrap(data, 'http://google.com'));
}


function testPostMessage() {
  mockPort.postMessage(makeMessage('foobar', 'This is a value'), []);
  mockControl.$replayAll();
  portChannel.send('foobar', 'This is a value');
}


function testPostMessageWithPorts() {
  if (!('MessageChannel' in goog.global)) {
    return;
  }
  var channel = new MessageChannel();
  var port1 = channel.port1;
  var port2 = channel.port2;
  mockPort.postMessage(
      makeMessage('foobar', {
        'val': [
          {'_port': {'type': 'real', 'index': 0}},
          {'_port': {'type': 'real', 'index': 1}}
        ]
      }),
      [port1, port2]);
  mockControl.$replayAll();
  portChannel.send('foobar', {'val': [port1, port2]});
}

function testReceiveMessage() {
  var promise = registerService(portChannel, 'foobar');
  receiveMessage('foobar', 'This is a string');
  return promise.then(function(msg) { assertEquals(msg, 'This is a string'); });
}


function testReceiveMessageWithPorts() {
  if (!('MessageChannel' in goog.global)) {
    return;
  }
  var channel = new MessageChannel();
  var port1 = channel.port1;
  var port2 = channel.port2;
  var promise = registerService(portChannel, 'foobar', true);

  receiveMessage(
      'foobar', {
        'val': [
          {'_port': {'type': 'real', 'index': 0}},
          {'_port': {'type': 'real', 'index': 1}}
        ]
      },
      null, [port1, port2]);

  return promise.then(function(msg) {
    assertObjectEquals(msg, {'val': [port1, port2]});
  });
}


function testReceiveNonChannelMessageWithStringBody() {
  expectNoMessage();
  mockControl.$replayAll();
  receiveNonChannelMessage('Foo bar');
}


function testReceiveNonChannelMessageWithArrayBody() {
  expectNoMessage();
  mockControl.$replayAll();
  receiveNonChannelMessage([5, 'Foo bar']);
}


function testReceiveNonChannelMessageWithNoFlag() {
  expectNoMessage();
  mockControl.$replayAll();
  receiveNonChannelMessage(
      {serviceName: 'foobar', payload: 'this is a payload'});
}


function testReceiveNonChannelMessageWithFalseFlag() {
  expectNoMessage();
  mockControl.$replayAll();
  var body = {serviceName: 'foobar', payload: 'this is a payload'};
  body[goog.messaging.PortChannel.FLAG] = false;
  receiveNonChannelMessage(body);
}


// Integration tests


function testWorker() {
  if (!('Worker' in goog.global)) {
    return;
  }
  var promise = registerService(workerChannel, 'pong', true);
  workerChannel.send('ping', {'val': 'fizzbang'});

  return promise.then(function(msg) {
    assertObjectEquals({'val': 'fizzbang'}, msg);
  });
}


function testWorkerWithPorts() {
  if (!('Worker' in goog.global) || !('MessageChannel' in goog.global)) {
    return;
  }
  var messageChannel = new MessageChannel();
  var promise = registerService(workerChannel, 'pong', true);
  workerChannel.send('ping', {'port': messageChannel.port1});

  return promise.then(function(msg) {
    return assertPortsEntangled(msg['port'], messageChannel.port2);
  });
}


function testPort() {
  if (!('Worker' in goog.global) || !('MessageChannel' in goog.global)) {
    return;
  }
  var messageChannel = new MessageChannel();
  workerChannel.send('addPort', messageChannel.port1);
  messageChannel.port2.start();
  var realPortChannel = new goog.messaging.PortChannel(messageChannel.port2);
  var promise = registerService(realPortChannel, 'pong', true);
  realPortChannel.send('ping', {'val': 'fizzbang'});

  return promise.then(function(msg) {
    assertObjectEquals({'val': 'fizzbang'}, msg);

    messageChannel.port2.close();
    realPortChannel.dispose();
  });
}


function testPortIgnoresOrigin() {
  if (!('Worker' in goog.global) || !('MessageChannel' in goog.global)) {
    return;
  }
  var messageChannel = new MessageChannel();
  workerChannel.send('addPort', messageChannel.port1);
  messageChannel.port2.start();
  var realPortChannel = new goog.messaging.PortChannel(
      messageChannel.port2, 'http://somewhere-else.com');
  var promise = registerService(realPortChannel, 'pong', true);
  realPortChannel.send('ping', {'val': 'fizzbang'});

  return promise.then(function(msg) {
    assertObjectEquals({'val': 'fizzbang'}, msg);

    messageChannel.port2.close();
    realPortChannel.dispose();
  });
}


function testWindow() {
  if (!('Worker' in goog.global) || !('MessageChannel' in goog.global)) {
    return;
  }

  return createIframe().then(function(iframe) {
    var iframeChannel =
        goog.messaging.PortChannel.forEmbeddedWindow(iframe, '*', timer);

    var promise = registerService(iframeChannel, 'pong');
    iframeChannel.send('ping', 'fizzbang');

    return promise.then(function(msg) {
      assertEquals('fizzbang', msg);

      goog.dispose(iframeChannel);
    });
  });
}


function testWindowCanceled() {
  if (!('Worker' in goog.global) || !('MessageChannel' in goog.global)) {
    return;
  }

  return createIframe().then(function(iframe) {
    var iframeChannel =
        goog.messaging.PortChannel.forEmbeddedWindow(iframe, '*', timer);
    iframeChannel.cancel();

    var promise = registerService(iframeChannel, 'pong').then(function(msg) {
      fail('no messages should be received due to cancellation');
    });
    iframeChannel.send('ping', 'fizzbang');

    // Leave plenty of time for the connection to be made if the test fails, but
    // stop the test before the timeout is hit.
    return goog.Promise.race([promise, goog.Timer.promise(500)])
        .thenAlways(function() { iframeChannel.dispose(); });
  });
}


function testWindowWontSendToWrongOrigin() {
  if (!('Worker' in goog.global) || !('MessageChannel' in goog.global)) {
    return;
  }

  return createIframe().then(function(iframe) {
    var iframeChannel = goog.messaging.PortChannel.forEmbeddedWindow(
        iframe, 'http://somewhere-else.com', timer);

    var promise = registerService(iframeChannel, 'pong').then(function(msg) {
      fail('Should not receive pong from unexpected origin');
    });
    iframeChannel.send('ping', 'fizzbang');

    return goog.Promise.race([promise, goog.Timer.promise(500)])
        .thenAlways(function() { iframeChannel.dispose(); });
  });
}


function testWindowWontReceiveFromWrongOrigin() {
  if (!('Worker' in goog.global) || !('MessageChannel' in goog.global)) {
    return;
  }

  return createIframe('testdata/portchannel_wrong_origin_inner.html')
      .then(function(iframe) {
        var iframeChannel =
            goog.messaging.PortChannel.forEmbeddedWindow(iframe, '*', timer);

        var promise =
            registerService(iframeChannel, 'pong').then(function(msg) {
              fail('Should not receive pong from unexpected origin');
            });
        iframeChannel.send('ping', 'fizzbang');

        return goog.Promise.race([promise, goog.Timer.promise(500)])
            .thenAlways(function() { iframeChannel.dispose(); });
      });
}


/**
 * Assert that two HTML5 MessagePorts are entangled by posting messages from
 * each to the other.
 *
 * @param {!MessagePort} port1
 * @param {!MessagePort} port2
 * @return {!goog.Promise} Promise that settles when the assertion is complete.
 */
function assertPortsEntangled(port1, port2) {
  var port2Promise =
      new goog.Promise(function(resolve, reject) { port2.onmessage = resolve; })
          .then(function(e) {
            assertEquals(
                'First port 1 should send a message to port 2',
                'port1 to port2', e.data);
            port2.postMessage('port2 to port1');
          });

  var port1Promise =
      new goog.Promise(function(resolve, reject) { port1.onmessage = resolve; })
          .then(function(e) {
            assertEquals(
                'Then port 2 should respond to port 1', 'port2 to port1',
                e.data);
          });

  port1.postMessage('port1 to port2');
  return goog.Promise.all([port1Promise, port2Promise]);
}


/**
 * @param {string=} opt_url A URL to use for the iframe src (defaults to
 *     "testdata/portchannel_inner.html").
 * @return {!goog.Promise<HTMLIframeElement>} A promise that resolves with the
 *     loaded iframe.
 */
function createIframe(opt_url) {
  var iframe = goog.dom.createDom('iframe', {
    style: 'display: none',
    src: opt_url || 'testdata/portchannel_inner.html'
  });

  return new goog
      .Promise(function(resolve, reject) {
        goog.events.listenOnce(iframe, goog.events.EventType.LOAD, resolve);
        goog.dom.appendChild(frameDiv, iframe);
      })
      .then(function(e) { return iframe.contentWindow; });
}
