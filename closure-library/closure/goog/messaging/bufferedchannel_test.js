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

goog.provide('goog.messaging.BufferedChannelTest');
goog.setTestOnly('goog.messaging.BufferedChannelTest');

goog.require('goog.debug.Console');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.log');
goog.require('goog.log.Level');
goog.require('goog.messaging.BufferedChannel');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.async.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.messaging.MockMessageChannel');

var clock;
var messages = [
  {serviceName: 'firstService', payload: 'firstPayload'},
  {serviceName: 'secondService', payload: 'secondPayload'}
];
var mockControl;
var asyncMockControl;

function setUpPage() {
  if (goog.global.console) {
    new goog.debug.Console().setCapturing(true);
  }
  var logger = goog.log.getLogger('goog.messaging');
  logger.setLevel(goog.log.Level.ALL);
  goog.log.addHandler(logger, function(logRecord) {
    var msg = goog.dom.createDom(goog.dom.TagName.DIV);
    msg.innerHTML = logRecord.getMessage();
    goog.dom.appendChild(goog.dom.getElement('debug-div'), msg);
  });
  clock = new goog.testing.MockClock();
  mockControl = new goog.testing.MockControl();
  asyncMockControl = new goog.testing.async.MockControl(mockControl);
}


function setUp() {
  clock.install();
}


function tearDown() {
  clock.uninstall();
  mockControl.$tearDown();
}


function assertMessageArraysEqual(ma1, ma2) {
  assertEquals('message array lengths differ', ma1.length, ma2.length);
  for (var i = 0; i < ma1.length; i++) {
    assertEquals(
        'message array serviceNames differ',
        ma1[i].serviceName, ma2[i].serviceName);
    assertEquals(
        'message array payloads differ',
        ma1[i].payload, ma2[i].payload);
  }
}


function testDelegationToWrappedChannel() {
  var mockChannel = new goog.testing.messaging.MockMessageChannel(mockControl);
  var channel = new goog.messaging.BufferedChannel(mockChannel);

  channel.registerDefaultService(
      asyncMockControl.asyncAssertEquals(
          'default service should be delegated',
          'defaultServiceName', 'default service payload'));
  channel.registerService(
      'normalServiceName',
      asyncMockControl.asyncAssertEquals(
          'normal service should be delegated',
          'normal service payload'));
  mockChannel.send(
      goog.messaging.BufferedChannel.USER_CHANNEL_NAME_ + ':message',
      'payload');

  mockControl.$replayAll();
  channel.peerReady_ = true;  // Prevent buffering so we delegate send calls.
  mockChannel.receive(
      goog.messaging.BufferedChannel.USER_CHANNEL_NAME_ + ':defaultServiceName',
      'default service payload');
  mockChannel.receive(
      goog.messaging.BufferedChannel.USER_CHANNEL_NAME_ + ':normalServiceName',
      'normal service payload');
  channel.send('message', 'payload');
  mockControl.$verifyAll();
}


function testOptionalConnectCallbackExecutes() {
  var mockChannel = new goog.testing.messaging.MockMessageChannel(mockControl);
  var channel = new goog.messaging.BufferedChannel(mockChannel);
  var mockConnectCb = mockControl.createFunctionMock('mockConnectCb');
  mockConnectCb();

  mockControl.$replayAll();
  channel.connect(mockConnectCb);
  mockControl.$verifyAll();
}


function testSendExceptionsInSendReadyPingStopsTimerAndReraises() {
  var mockChannel = new goog.testing.messaging.MockMessageChannel(mockControl);
  var channel = new goog.messaging.BufferedChannel(mockChannel);

  var errorMessage = 'errorMessage';
  mockChannel.send(
      goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ + ':' +
      goog.messaging.BufferedChannel.PEER_READY_SERVICE_NAME_,
      /* payload */ '').$throws(Error(errorMessage));
  channel.timer_.enabled = true;

  mockControl.$replayAll();
  var exception = assertThrows(function() {
    channel.sendReadyPing_();
  });
  assertContains(errorMessage, exception.message);
  assertFalse(channel.timer_.enabled);
  mockControl.$verifyAll();
}


function testPollingIntervalDefaultAndOverride() {
  var mockChannel = new goog.testing.messaging.MockMessageChannel(mockControl);
  var channel = new goog.messaging.BufferedChannel(mockChannel);

  assertEquals(
      goog.messaging.BufferedChannel.DEFAULT_INTERVAL_MILLIS_,
      channel.timer_.getInterval());
  var interval = 100;
  var longIntervalChannel = new goog.messaging.BufferedChannel(
      new goog.testing.messaging.MockMessageChannel(mockControl), interval);
  assertEquals(interval, longIntervalChannel.timer_.getInterval());
}


function testBidirectionalCommunicationBuffersUntilReadyPingsSucceed() {
  var mockChannel1 = new goog.testing.messaging.MockMessageChannel(mockControl);
  var mockChannel2 = new goog.testing.messaging.MockMessageChannel(mockControl);
  var bufferedChannel1 = new goog.messaging.BufferedChannel(mockChannel1);
  var bufferedChannel2 = new goog.messaging.BufferedChannel(mockChannel2);
  mockChannel1.send(
      goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ + ':setPeerReady_',
      '').$does(function() {
    bufferedChannel2.setPeerReady_('');
  });
  mockChannel2.send(
      goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ + ':setPeerReady_',
      '1').$does(function() {
    bufferedChannel1.setPeerReady_('1');
  });
  mockChannel1.send(
      goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ + ':setPeerReady_',
      '1').$does(function() {
    bufferedChannel2.setPeerReady_('1');
  });
  mockChannel1.send(goog.messaging.BufferedChannel.USER_CHANNEL_NAME_ + ':' +
                    messages[0].serviceName,
                    messages[0].payload);
  mockChannel2.send(goog.messaging.BufferedChannel.USER_CHANNEL_NAME_ + ':' +
                    messages[1].serviceName,
                    messages[1].payload);

  mockControl.$replayAll();
  bufferedChannel1.send(messages[0].serviceName, messages[0].payload);
  bufferedChannel2.send(messages[1].serviceName, messages[1].payload);
  assertMessageArraysEqual([messages[0]], bufferedChannel1.buffer_);
  assertMessageArraysEqual([messages[1]], bufferedChannel2.buffer_);
  // First tick causes setPeerReady_ to fire, which in turn flushes the buffers.
  clock.tick(goog.messaging.BufferedChannel.DEFAULT_INTERVAL_MILLIS_);
  assertEquals(bufferedChannel1.buffer_, null);
  assertEquals(bufferedChannel2.buffer_, null);
  // Now that peers are ready, a second tick causes no more sends.
  clock.tick(goog.messaging.BufferedChannel.DEFAULT_INTERVAL_MILLIS_);
  mockControl.$verifyAll();
}


function testBidirectionalCommunicationReconnectsAfterOneSideRestarts() {
  var mockChannel1 = new goog.testing.messaging.MockMessageChannel(mockControl);
  var mockChannel2 = new goog.testing.messaging.MockMessageChannel(mockControl);
  var mockChannel3 = new goog.testing.messaging.MockMessageChannel(mockControl);
  var bufferedChannel1 = new goog.messaging.BufferedChannel(mockChannel1);
  var bufferedChannel2 = new goog.messaging.BufferedChannel(mockChannel2);
  var bufferedChannel3 = new goog.messaging.BufferedChannel(mockChannel3);

  // First tick
  mockChannel1.send(
      goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ + ':setPeerReady_',
      '').$does(function() {
    bufferedChannel2.setPeerReady_('');
  });
  mockChannel2.send(
      goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ + ':setPeerReady_',
      '1').$does(function() {
    bufferedChannel1.setPeerReady_('1');
  });
  mockChannel1.send(
      goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ + ':setPeerReady_',
      '1').$does(function() {
    bufferedChannel2.setPeerReady_('1');
  });
  mockChannel3.send(
      goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ + ':setPeerReady_',
      '');  // pretend it's not ready to connect yet

  // Second tick
  mockChannel3.send(
      goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ + ':setPeerReady_',
      '').$does(function() {
    bufferedChannel1.setPeerReady_('');
  });

  // Third tick
  mockChannel1.send(
      goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ + ':setPeerReady_',
      '1').$does(function() {
    bufferedChannel3.setPeerReady_('1');
  });
  mockChannel3.send(
      goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ + ':setPeerReady_',
      '1').$does(function() {
    bufferedChannel1.setPeerReady_('1');
  });

  mockChannel1.send(goog.messaging.BufferedChannel.USER_CHANNEL_NAME_ + ':' +
                    messages[0].serviceName,
                    messages[0].payload);
  mockChannel3.send(goog.messaging.BufferedChannel.USER_CHANNEL_NAME_ + ':' +
                    messages[1].serviceName,
                    messages[1].payload);

  mockControl.$replayAll();
  // First tick causes setPeerReady_ to fire, which sets up the connection
  // between channels 1 and 2.
  clock.tick(goog.messaging.BufferedChannel.DEFAULT_INTERVAL_MILLIS_);
  assertTrue(bufferedChannel1.peerReady_);
  assertTrue(bufferedChannel2.peerReady_);
  // Now pretend that channel 2 went down and was replaced by channel 3, which
  // is trying to connect with channel 1.
  clock.tick(goog.messaging.BufferedChannel.DEFAULT_INTERVAL_MILLIS_);
  assertTrue(bufferedChannel1.peerReady_);
  clock.tick(goog.messaging.BufferedChannel.DEFAULT_INTERVAL_MILLIS_);
  assertTrue(bufferedChannel3.peerReady_);
  bufferedChannel1.send(messages[0].serviceName, messages[0].payload);
  bufferedChannel3.send(messages[1].serviceName, messages[1].payload);
  // All timers stopped, nothing happens on the fourth tick.
  clock.tick(goog.messaging.BufferedChannel.DEFAULT_INTERVAL_MILLIS_);
  mockControl.$verifyAll();
}
