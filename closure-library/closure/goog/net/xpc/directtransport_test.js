// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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

/**
 * @fileoverview Tests the direct transport.
 */

goog.provide('goog.net.xpc.DirectTransportTest');

goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.labs.userAgent.browser');
goog.require('goog.log');
goog.require('goog.log.Level');
goog.require('goog.net.xpc');
goog.require('goog.net.xpc.CfgFields');
goog.require('goog.net.xpc.CrossPageChannel');
goog.require('goog.net.xpc.CrossPageChannelRole');
goog.require('goog.net.xpc.TransportTypes');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');
goog.setTestOnly('goog.net.xpc.DirectTransportTest');


/**
 * Echo service name.
 * @type {string}
 * @const
 */
var ECHO_SERVICE_NAME = 'echo';


/**
 * Response service name.
 * @type {string}
 * @const
 */
var RESPONSE_SERVICE_NAME = 'response';


/**
 * Test Payload.
 * @type {string}
 * @const
 */
var MESSAGE_PAYLOAD_1 = 'This is message payload 1.';


/**
 * The name id of the peer iframe.
 * @type {string}
 * @const
 */
var PEER_IFRAME_ID = 'peer-iframe';


// Class aliases.
var CfgFields = goog.net.xpc.CfgFields;
var CrossPageChannel = goog.net.xpc.CrossPageChannel;
var CrossPageChannelRole = goog.net.xpc.CrossPageChannelRole;
var TransportTypes = goog.net.xpc.TransportTypes;

var outerXpc;
var innerXpc;
var peerIframe;
var channelName;
var messageIsSync = false;
var savedHtml;
var debugDiv;

function setUpPage() {
  // Show debug log
  debugDiv = document.createElement(goog.dom.TagName.DIV);
  var logger = goog.log.getLogger('goog.net.xpc');
  logger.setLevel(goog.log.Level.ALL);
  goog.log.addHandler(logger, function(logRecord) {
    var msgElm = goog.dom.createDom(goog.dom.TagName.DIV);
    msgElm.innerHTML = logRecord.getMessage();
    goog.dom.appendChild(debugDiv, msgElm);
  });
  goog.testing.TestCase.getActiveTestCase().promiseTimeout = 10000;  // 10s
}

function setUp() {
  savedHtml = document.body.innerHTML;
  document.body.appendChild(debugDiv);
}


function tearDown() {
  if (peerIframe) {
    document.body.removeChild(peerIframe);
    peerIframe = null;
  }
  if (outerXpc) {
    outerXpc.dispose();
    outerXpc = null;
  }
  if (innerXpc) {
    innerXpc.dispose();
    innerXpc = null;
  }
  window.iframeLoadHandler = null;
  channelName = null;
  messageIsSync = false;
  document.body.innerHTML = savedHtml;
}


function createIframe() {
  peerIframe = document.createElement(goog.dom.TagName.IFRAME);
  peerIframe.id = PEER_IFRAME_ID;
  document.body.insertBefore(peerIframe, document.body.firstChild);
}


/**
 * Tests 2 same domain frames using direct transport.
 */
function testDirectTransport() {
  // This test has been flaky on IE.
  // For now, disable.
  // Flakiness is tracked in http://b/18595666
  if (goog.labs.userAgent.browser.isIE()) {
    return;
  }

  createIframe();
  channelName = goog.net.xpc.getRandomString(10);
  outerXpc = new CrossPageChannel(
      getConfiguration(CrossPageChannelRole.OUTER, PEER_IFRAME_ID));
  // Outgoing service.
  outerXpc.registerService(ECHO_SERVICE_NAME, goog.nullFunction);
  // Incoming service.
  var resolver = goog.Promise.withResolver();
  outerXpc.registerService(RESPONSE_SERVICE_NAME, function(message) {
    assertEquals(
        'Received payload is equal to sent payload.', message,
        MESSAGE_PAYLOAD_1);
    resolver.resolve();
  });

  outerXpc.connect(function() {
    assertTrue('XPC over direct channel is connected', outerXpc.isConnected());
    outerXpc.send(ECHO_SERVICE_NAME, MESSAGE_PAYLOAD_1);
  });
  // inner_peer.html calls this method at end of html.
  window.iframeLoadHandler = function() {
    peerIframe.contentWindow.instantiateChannel(
        getConfiguration(CrossPageChannelRole.INNER));
  };
  peerIframe.src = 'testdata/inner_peer.html';

  return resolver.promise;
}


/**
 * Tests 2 xpc's communicating with each other in the same window.
 */
function testSameWindowDirectTransport() {
  channelName = goog.net.xpc.getRandomString(10);

  outerXpc = new CrossPageChannel(getConfiguration(CrossPageChannelRole.OUTER));
  outerXpc.setPeerWindowObject(self);

  // Outgoing service.
  outerXpc.registerService(ECHO_SERVICE_NAME, goog.nullFunction);

  var resolver = goog.Promise.withResolver();
  // Incoming service.
  outerXpc.registerService(RESPONSE_SERVICE_NAME, function(message) {
    assertEquals(
        'Received payload is equal to sent payload.', message,
        MESSAGE_PAYLOAD_1);
    resolver.resolve();
  });
  outerXpc.connect(function() {
    assertTrue(
        'XPC over direct channel, same window, is connected',
        outerXpc.isConnected());
    outerXpc.send(ECHO_SERVICE_NAME, MESSAGE_PAYLOAD_1);
  });

  innerXpc = new CrossPageChannel(getConfiguration(CrossPageChannelRole.INNER));
  innerXpc.setPeerWindowObject(self);
  // Incoming service.
  innerXpc.registerService(ECHO_SERVICE_NAME, function(message) {
    innerXpc.send(RESPONSE_SERVICE_NAME, message);
  });
  // Outgoing service.
  innerXpc.registerService(RESPONSE_SERVICE_NAME, goog.nullFunction);
  innerXpc.connect();
  return resolver.promise;
}

function getConfiguration(role, opt_peerFrameId) {
  var cfg = {};
  cfg[CfgFields.TRANSPORT] = TransportTypes.DIRECT;
  if (goog.isDefAndNotNull(opt_peerFrameId)) {
    cfg[CfgFields.IFRAME_ID] = opt_peerFrameId;
  }
  cfg[CfgFields.CHANNEL_NAME] = channelName;
  cfg[CfgFields.ROLE] = role;
  return cfg;
}


/**
 * Tests 2 same domain frames using direct transport using sync mode.
 */
function testSyncMode() {
  // This test has been flaky on IE.
  // For now, disable.
  // Flakiness is tracked in http://b/18595666
  if (goog.labs.userAgent.browser.isIE()) {
    return;
  }

  createIframe();
  channelName = goog.net.xpc.getRandomString(10);

  var cfg = getConfiguration(CrossPageChannelRole.OUTER, PEER_IFRAME_ID);
  cfg[CfgFields.DIRECT_TRANSPORT_SYNC_MODE] = true;

  outerXpc = new CrossPageChannel(cfg);
  // Outgoing service.
  outerXpc.registerService(ECHO_SERVICE_NAME, goog.nullFunction);
  var resolver = goog.Promise.withResolver();
  // Incoming service.
  outerXpc.registerService(RESPONSE_SERVICE_NAME, function(message) {
    assertTrue('The message response was syncronous', messageIsSync);
    assertEquals(
        'Received payload is equal to sent payload.', message,
        MESSAGE_PAYLOAD_1);
    resolver.resolve();
  });
  outerXpc.connect(function() {
    assertTrue('XPC over direct channel is connected', outerXpc.isConnected());
    messageIsSync = true;
    outerXpc.send(ECHO_SERVICE_NAME, MESSAGE_PAYLOAD_1);
    messageIsSync = false;
  });
  // inner_peer.html calls this method at end of html.
  window.iframeLoadHandler = function() {
    var cfg = getConfiguration(CrossPageChannelRole.INNER);
    cfg[CfgFields.DIRECT_TRANSPORT_SYNC_MODE] = true;
    peerIframe.contentWindow.instantiateChannel(cfg);
  };
  peerIframe.src = 'testdata/inner_peer.html';
  return resolver.promise;
}
