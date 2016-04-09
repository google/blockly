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

goog.provide('goog.net.xpc.NativeMessagingTransportTest');
goog.setTestOnly('goog.net.xpc.NativeMessagingTransportTest');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.xpc');
goog.require('goog.net.xpc.CfgFields');
goog.require('goog.net.xpc.CrossPageChannel');
goog.require('goog.net.xpc.CrossPageChannelRole');
goog.require('goog.net.xpc.NativeMessagingTransport');
goog.require('goog.testing.jsunit');

// This test only tests the native messaing transport protocol version 2.
// Testing of previous versions and of backward/forward compatibility is done
// in crosspagechannel_test.html.


function tearDown() {
  goog.net.xpc.NativeMessagingTransport.activeCount_ = {};
  goog.events.removeAll(window.postMessage ? window : document, 'message');
}


function testConstructor() {
  var xpc = getTestChannel();

  var t = new goog.net.xpc.NativeMessagingTransport(
      xpc, 'http://g.com:80', undefined /* opt_domHelper */,
      false /* opt_oneSidedHandshake */, 2 /* opt_protocolVersion */);
  assertEquals('http://g.com:80', t.peerHostname_);

  var t = new goog.net.xpc.NativeMessagingTransport(
      xpc, null /* peerHostName */, undefined /* opt_domHelper */,
      false /* opt_oneSidedHandshake */, 2 /* opt_protocolVersion */);
  assertEquals('*', t.peerHostname_);
  t.dispose();
}


function testConstructorDom() {
  var xpc = getTestChannel();

  var t = new goog.net.xpc.NativeMessagingTransport(
      xpc, 'http://g.com:80', goog.dom.getDomHelper(),
      false /* opt_oneSidedHandshake */, 2 /* opt_protocolVersion */);
  assertEquals('http://g.com:80', t.peerHostname_);

  var t = new goog.net.xpc.NativeMessagingTransport(
      xpc, null /* peerHostName */, false /* opt_oneSidedHandshake */,
      2 /* opt_protocolVersion */);
  assertEquals('*', t.peerHostname_);
  t.dispose();
}


function testDispose() {
  var xpc = getTestChannel();
  var listenedObj = window.postMessage ? window : document;

  var t0 = new goog.net.xpc.NativeMessagingTransport(
      xpc, null /* peerHostName */, false /* opt_oneSidedHandshake */,
      2 /* opt_protocolVersion */);
  assertEquals(0, goog.events.removeAll(listenedObj, 'message'));
  t0.dispose();
  assertEquals(0, goog.events.removeAll(listenedObj, 'message'));

  var t1 = new goog.net.xpc.NativeMessagingTransport(
      xpc, null /* peerHostName */, false /* opt_oneSidedHandshake */,
      2 /* opt_protocolVersion */);
  t1.connect();
  t1.dispose();
  assertEquals(0, goog.events.removeAll(listenedObj, 'message'));

  var t2 = new goog.net.xpc.NativeMessagingTransport(
      xpc, null /* peerHostName */, false /* opt_oneSidedHandshake */,
      2 /* opt_protocolVersion */);
  var t3 = new goog.net.xpc.NativeMessagingTransport(
      xpc, null /* peerHostName */, false /* opt_oneSidedHandshake */,
      2 /* opt_protocolVersion */);
  t2.connect();
  t3.connect();
  t2.dispose();
  assertEquals(1, goog.events.removeAll(listenedObj, 'message'));
}


function testDisposeWithDom() {
  var xpc = getTestChannel(goog.dom.getDomHelper());
  var listenedObj = window.postMessage ? window : document;

  var t0 = new goog.net.xpc.NativeMessagingTransport(
      xpc, null /* peerHostName */, false /* opt_oneSidedHandshake */,
      2 /* opt_protocolVersion */);
  assertEquals(0, goog.events.removeAll(listenedObj, 'message'));
  t0.dispose();
  assertEquals(0, goog.events.removeAll(listenedObj, 'message'));

  var t1 = new goog.net.xpc.NativeMessagingTransport(
      xpc, null /* peerHostName */, false /* opt_oneSidedHandshake */,
      2 /* opt_protocolVersion */);
  t1.connect();
  t1.dispose();
  assertEquals(0, goog.events.removeAll(listenedObj, 'message'));

  var t2 = new goog.net.xpc.NativeMessagingTransport(
      xpc, null /* peerHostName */, false /* opt_oneSidedHandshake */,
      2 /* opt_protocolVersion */);
  var t3 = new goog.net.xpc.NativeMessagingTransport(
      xpc, null /* peerHostName */, false /* opt_oneSidedHandshake */,
      2 /* opt_protocolVersion */);
  t2.connect();
  t3.connect();
  t2.dispose();
  assertEquals(1, goog.events.removeAll(listenedObj, 'message'));
}


function testBogusMessages() {
  var e = createMockEvent('bogus_message');
  assertFalse(goog.net.xpc.NativeMessagingTransport.messageReceived_(e));

  e = createMockEvent('bogus|message');
  assertFalse(goog.net.xpc.NativeMessagingTransport.messageReceived_(e));

  e = createMockEvent('bogus|message:data');
  assertFalse(goog.net.xpc.NativeMessagingTransport.messageReceived_(e));
}


function testSendingMessagesToUnconnectedInnerPeer() {
  var xpc = getTestChannel();

  var serviceResult, payloadResult;
  xpc.xpcDeliver = function(service, payload) {
    serviceResult = service;
    payloadResult = payload;
  };

  // Construct an unconnected inner peer.
  xpc.getRole = function() { return goog.net.xpc.CrossPageChannelRole.INNER; };
  xpc.isConnected = function() { return false; };
  var t = new goog.net.xpc.NativeMessagingTransport(
      xpc, 'http://g.com', false /* opt_oneSidedHandshake */,
      2 /* opt_protocolVersion */);

  // Test a valid message.
  var e = createMockEvent('test_channel|test_service:test_payload');
  assertTrue(goog.net.xpc.NativeMessagingTransport.messageReceived_(e));
  assertEquals('test_service', serviceResult);
  assertEquals('test_payload', payloadResult);
  assertEquals(
      'Ensure channel name has not been changed.', 'test_channel',
      t.channel_.name);

  // Test updating a stale inner peer.
  var e = createMockEvent('new_channel|tp:SETUP');
  assertTrue(goog.net.xpc.NativeMessagingTransport.messageReceived_(e));
  assertEquals('tp', serviceResult);
  assertEquals('SETUP', payloadResult);
  assertEquals(
      'Ensure channel name has been updated.', 'new_channel', t.channel_.name);
  t.dispose();
}


function testSignalConnected_innerFrame() {
  checkSignalConnected(false /* oneSidedHandshake */, true /* innerFrame */);
}


function testSignalConnected_outerFrame() {
  checkSignalConnected(false /* oneSidedHandshake */, false /* innerFrame */);
}


function testSignalConnected_singleSided_innerFrame() {
  checkSignalConnected(true /* oneSidedHandshake */, true /* innerFrame */);
}


function testSignalConnected_singleSided_outerFrame() {
  checkSignalConnected(true /* oneSidedHandshake */, false /* innerFrame */);
}


function checkSignalConnected(
    oneSidedHandshake, innerFrame, peerProtocolVersion, protocolVersion) {
  var xpc = getTestChannel();
  var connected = false;
  xpc.notifyConnected = function() {
    if (connected) {
      fail();
    } else {
      connected = true;
    }
  };
  xpc.getRole = function() {
    return innerFrame ? goog.net.xpc.CrossPageChannelRole.INNER :
                        goog.net.xpc.CrossPageChannelRole.OUTER;
  };
  xpc.isConnected = function() { return false; };

  var transport = new goog.net.xpc.NativeMessagingTransport(
      xpc, 'http://g.com', undefined /* opt_domHelper */,
      oneSidedHandshake /* opt_oneSidedHandshake */, 2 /* protocolVerion */);
  var sentPayloads = [];
  transport.send = function(service, payload) {
    assertEquals(goog.net.xpc.TRANSPORT_SERVICE_, service);
    sentPayloads.push(payload);
  };
  function assertSent(payloads) {
    assertArrayEquals(payloads, sentPayloads);
    sentPayloads = [];
  }
  var endpointId = transport.endpointId_;
  var peerEndpointId1 = 'abc123';
  var peerEndpointId2 = 'def234';

  assertFalse(connected);
  if (!oneSidedHandshake || innerFrame) {
    transport.transportServiceHandler(
        goog.net.xpc.SETUP_NTPV2 + ',' + peerEndpointId1);
    transport.transportServiceHandler(goog.net.xpc.SETUP);
    assertSent([goog.net.xpc.SETUP_ACK_NTPV2]);
    assertFalse(connected);
    transport.transportServiceHandler(goog.net.xpc.SETUP_ACK_NTPV2);
    assertSent([]);
    assertTrue(connected);
  } else {
    transport.transportServiceHandler(goog.net.xpc.SETUP_ACK_NTPV2);
    assertSent([]);
    assertFalse(connected);
    transport.transportServiceHandler(
        goog.net.xpc.SETUP_NTPV2 + ',' + peerEndpointId1);
    transport.transportServiceHandler(goog.net.xpc.SETUP);
    assertSent([goog.net.xpc.SETUP_ACK_NTPV2]);
    assertTrue(connected);
  }

  // Verify that additional transport service traffic doesn't cause duplicate
  // notifications.
  transport.transportServiceHandler(
      goog.net.xpc.SETUP_NTPV2 + ',' + peerEndpointId1);
  transport.transportServiceHandler(goog.net.xpc.SETUP);
  assertSent([goog.net.xpc.SETUP_ACK_NTPV2]);
  transport.transportServiceHandler(goog.net.xpc.SETUP_ACK_NTPV2);
  assertSent([]);

  // Simulate a reconnection by sending a SETUP message from a frame with a
  // different endpoint id.  No further connection callbacks should fire, but
  // a new SETUP message should be triggered.
  transport.transportServiceHandler(
      goog.net.xpc.SETUP_NTPV2 + ',' + peerEndpointId2);
  transport.transportServiceHandler(goog.net.xpc.SETUP);
  assertSent([
    goog.net.xpc.SETUP_ACK_NTPV2, goog.net.xpc.SETUP_NTPV2 + ',' + endpointId
  ]);
  transport.transportServiceHandler(goog.net.xpc.SETUP_ACK_NTPV2);
  assertSent([]);
}


function createMockEvent(data) {
  var event = {};
  event.getBrowserEvent = function() {
    return { data: data }
  };
  return event;
}


function getTestChannel(opt_domHelper) {
  var cfg = {};
  cfg[goog.net.xpc.CfgFields.CHANNEL_NAME] = 'test_channel';
  return new goog.net.xpc.CrossPageChannel(
      cfg, opt_domHelper, undefined /* opt_domHelper */,
      false /* opt_oneSidedHandshake */, 2 /* opt_protocolVersion */);
}
